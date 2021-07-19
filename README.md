# LowbOracle
Centralized Oracles based on BSC and Matic Chains

### Genesis Contracts

#### BSC Testnet

| Contract Name          | Contract Address                           | Note                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| ERC20Template | 0x5aa1a18432aa60bad7f3057d71d3774f56cd34b8 | test loser coin token                                        |
|  LowbOracle | 0x7eeCb093d520e09a42b4c47cDFF34FB67625FC72 | lowb PoA bridge |

#### Mumbai

| Contract Name          | Contract Address                           | Note                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| ChildERC20       | 0x5cd4d2f947ae4568a8bd0905dbf12d3454d197f3 | test loser coin token                                        |
| ChildChainManagerProxy | 0xb5505a6d998549090530911180f38aC5130101c6 | deployed by [matic](https://static.matic.network/network/testnet/mumbai/index.json) |
|  LowbOracle | 0x9867Ac5A9155BF75715ebb205ef7cBc1C0a412A1 | lowb PoA bridge |

#### Goerli

| Contract Name         | Contract Address                           | Note                                                         |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| ERC20FixedSupply      | 0x34B3cA106E718434E06aaa7311Aa77E1901aE146 | test loser coin token                                        |
| ERC20PredicateProxy   | 0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34 | deployed by [matic](https://static.matic.network/network/testnet/mumbai/index.json) |
| RootChainManagerProxy | 0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74 | deployed by [matic](https://static.matic.network/network/testnet/mumbai/index.json) |

#### BSC Mainnet

| Contract Name          | Contract Address                           | Note                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| ERC20Template | 0x843d4a358471547f51534e3e51fae91cb4dc3f28 | loser coin token                                        |
|  LowbOracle | 0xDC05ED497f43DE362C7fB112FAFaBBD5EE8B48Bd | lowb PoA bridge |

#### Polygon (Matic)

| Contract Name          | Contract Address                           | Note                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| ChildERC20       | 0x1C0a798B5a5273a9e54028eb1524fD337B24145F | loser coin token                                        |
| ChildChainManagerProxy | 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa | deployed by [matic](https://static.matic.network/network/testnet/mumbai/index.json) |
|  LowbOracle | 0xDC05ED497f43DE362C7fB112FAFaBBD5EE8B48Bd | lowb PoA bridge |

#### Ethereum

| Contract Name         | Contract Address                           | Note                                                         |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| ERC20FixedSupply      | 0x69e5C11a7C30f0bf84A9faECBd5161AA7a94decA | test loser coin token                                        |
| ERC20PredicateProxy   | 0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf | deployed by [matic](https://static.matic.network/network/testnet/mumbai/index.json) |
| RootChainManagerProxy | 0xA0c68C638235ee32657e8f720a23ceC1bFc77C77 | deployed by [matic](https://static.matic.network/network/testnet/mumbai/index.json) |


### ERC20 Deposit and Withdraw Guide

Depositing ERC20 -

1. **Approve** **ERC20Predicate** contract to spend the tokens that have to be deposited.
2. Make **depositFor** call on **RootChainManager**.

(It will take several minutes to receive the token on child chain.)

You can use `web3` to get depositData.

  ```javascript
  > const Web3 = require('web3')
  > let web3 = new Web3()
  > web3.eth.abi.encodeParameter('uint256', '50000000000000000000000000000')
  '0x0000000000000000000000000000000000000000a18f07d736b90be550000000'
  > .exit
  ```

### Compiling and depolying
- Before running this project, install truffle first: `npm install -g truffle`.

- Run `npm install` to install required modules.

- Compile the smart contracts: `truffle compile`.

- Change the token address in `2_deploy_contracts.js` before deploying to live work. Then just run `truffle migrate --network testnet`.

- Change the token address in `2_deploy_contracts.js` again. Then just run `truffle migrate --network mumbai`.

- Now you can start to play with these contracts: `truffle console --network testnet`. 

  ```javascript
  truffle(testnet)> let instance = await LowbOracle.deployed()
  truffle(testnet)> const accounts = await web3.eth.getAccounts()
  truffle(testnet)> instance.setFeesAndRewards('100000000000000000000', 0)
  truffle(testnet)> let lowb = await IERC20.at('0x5aa1a18432aa60bad7f3057d71d3774f56cd34b8')
  truffle(testnet)> lowb.approve('0x7eeCb093d520e09a42b4c47cDFF34FB67625FC72', '10000000000000000000000')
  truffle(testnet)> instance.depositFor('10000000000000000000000', accounts[0])
  ```
  
- Or: `truffle console --network mumbai`. 

  ```javascript
  truffle(mumbai)> let instance = await LowbOracle.deployed()
  truffle(mumbai)> const accounts = await web3.eth.getAccounts()
  truffle(mumbai)> instance.setFeesAndRewards('1000000000000000000000', '10000000000000000')
  truffle(mumbai)> let lowb = await IERC20.at('0x5cd4d2f947ae4568a8bd0905dbf12d3454d197f3')
  truffle(mumbai)> lowb.approve('0x9867Ac5A9155BF75715ebb205ef7cBc1C0a412A1', '1000000000000000000000000')
  truffle(mumbai)> instance.depositFor('1000000000000000000000000', accounts[0])
  ```

- Run `node BSC-Client.js` and `node MATIC-Client.js` to start your PoA Bridge!

### Prepare secret keys before running truffle

- Create a new `.secret file` in root directory and enter your 12 word mnemonic seed phrase and a `.private_key` with your private key.
- Go to `https://rpc.maticvigil.com/` to create a new project and save the project id as `.rpc_id` file.
- To verify the contract, create a new `.bsckey` file and a new `.matickey` file in root directory and enter the API key you got from `bscscan.com` and `polygonscan.com`.  Then just run `truffle run verify LowbOracle@{contract-address} --network testnet` and `truffle run verify LowbOracle@{contract-address} --network mumbai`. 

