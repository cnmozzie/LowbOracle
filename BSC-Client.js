const Web3 = require('web3')
const fs = require('fs')
const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || '.private_key'
const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 3000
const PROJECT_ID = fs.readFileSync(".rpc_id").toString(); // from https://rpc.maticvigil.com/
const OracleJSON = require('./build/contracts/LowbOracle.json')


async function getOracleContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(OracleJSON.abi, OracleJSON.networks[networkId].address)
}

async function init () {
  const privateKeyStr = fs.readFileSync(PRIVATE_KEY_FILE_NAME, 'utf-8')
  let bscWeb3 = new Web3('https://data-seed-prebsc-1-s2.binance.org:8545')
  let maticWeb3 = new Web3(`https://rpc-mumbai.maticvigil.com/v1/`+PROJECT_ID)
  //bscWeb3.eth.accounts.wallet.add(privateKeyStr)
  maticWeb3.eth.accounts.wallet.add(privateKeyStr)
  const ownerAddress = maticWeb3.eth.accounts.wallet[0].address
  const bscOracleContract = await getOracleContract(bscWeb3)
  const maticOracleContract = await getOracleContract(maticWeb3)
  return { ownerAddress, bscWeb3, maticWeb3, bscOracleContract, maticOracleContract }
}

(async () => {
  const { ownerAddress, bscWeb3, maticWeb3, bscOracleContract, maticOracleContract } = await init()
  process.on( 'SIGINT', () => {
    console.log('Calling client.disconnect()')
    process.exit( );
  })

  let depositId = await bscOracleContract.methods.depositId().call()
  let id = Number(depositId) + 1
  console.log('start listening from ...', id)
  setInterval( async () => {
    let block = await bscWeb3.eth.getBlockNumber()
    let transactions = await bscOracleContract.getPastEvents('DepositForEvent', { filter: {id: id}, fromBlock: block-500, toBlock: 'latest' })
    if (transactions.length > 0) {
      let value = transactions[0].returnValues
      console.log('* New DepositForEvent event. id: ', value.id)
      id++;
      await maticOracleContract.methods.withdrawTo(value.amount, value.to, value.id).send({ from: ownerAddress, gas: 150000, gasPrice: 5000000000})
      console.log('* Deposit Succeed. id: ' + value.id)
    }
    else {
      console.log(block)
    }
  }, SLEEP_INTERVAL);
})()
