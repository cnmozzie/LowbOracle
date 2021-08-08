// contracts/LowbOracle.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LowbOracle is AccessControl {
  struct Transaction {
    address receiver;
    uint amount;
    uint confirmedBlock;
  }
  bytes32 public constant SENDER_ROLE = keccak256("SENDER_ROLE");
  bytes32 public constant CHECKER_ROLE = keccak256("CHECKER_ROLE");
  uint256 public depositId;
  uint256 public withdrawId;
  uint256 public depositAmount;
  uint256 public withdrawAmount;
  uint256 public feesToWithdraw;
  uint256 public fees;
  uint256 public rewards;
  address public lowbTokenAddress;
  mapping(uint256=>Transaction) public transactions;
  mapping(address=>uint256) public latestTransaction;
  event DepositForEvent(uint256 amount, address indexed to, uint indexed id);
  event ProcessWithdrawEvent(uint256 amount, address indexed to, uint indexed id);
  event WithdrawToEvent(uint256 amount, address indexed to, uint indexed id);

  constructor(address _lowbTokenAddress) {
    lowbTokenAddress = _lowbTokenAddress;
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  // Function to receive Ether. msg.data must be empty
  receive() external payable {}

  // Fallback function is called when msg.data is not empty
  fallback() external payable {}

  function depositFor(uint256 _amount, address _for) public returns (uint256) {
    depositId++;
    require(_amount > fees, "deposit amount should cover the fees.");
    IERC20 token = IERC20(lowbTokenAddress);
    require(token.transferFrom(msg.sender, address(this), _amount), "Lowb transfer failed");
    latestTransaction[msg.sender] = depositId;
    depositAmount += (_amount-fees);
    feesToWithdraw += fees;
    emit DepositForEvent(_amount-fees, _for, depositId);
    return depositId;
  }

  function processWithdraw(uint256 _amount, address _to, uint256 _id) public onlyRole(CHECKER_ROLE) {
    transactions[_id].amount = _amount;
    transactions[_id].receiver = _to;
    emit ProcessWithdrawEvent(_amount, _to, _id);
  }

  function withdrawTo(uint256 _amount, address payable _to, uint256 _id) public onlyRole(SENDER_ROLE) {
    require(transactions[_id].confirmedBlock == 0, "This transaction has been processed.");
    require(transactions[_id].amount == _amount, "Wrong amount.");
    require(transactions[_id].receiver == _to, "Wrong receiver.");
    IERC20 token = IERC20(lowbTokenAddress);
    require(token.transfer(_to, _amount), "Lowb transfer failed");
    if (rewards > 0) {
      require(_to.send(rewards), "reward token transfer failed");
    }
    transactions[_id].confirmedBlock = block.number;
    withdrawId = _id;
    withdrawAmount += _amount;
    emit WithdrawToEvent(_amount, _to, _id);
  }

  function setFeesAndRewards(uint256 _fees, uint256 _rewards) public onlyRole(DEFAULT_ADMIN_ROLE) {
    fees = _fees;
    rewards = _rewards;
  }

  function pullFunds(address _tokenAddress, address payable _to) public onlyRole(DEFAULT_ADMIN_ROLE) {
    if (_tokenAddress == address(0)) {
      _to.transfer(address(this).balance);
    }
    else if (_tokenAddress == lowbTokenAddress) {
      IERC20 token = IERC20(_tokenAddress);
      token.transfer(_to, feesToWithdraw);
      feesToWithdraw = 0;
    } 
    else {
      IERC20 token = IERC20(_tokenAddress);
      token.transfer(_to, token.balanceOf(address(this)));
    }
  }
}
