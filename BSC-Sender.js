const Web3 = require('web3')
const fs = require('fs')
const PRIVATE_KEY_FILE_NAME = process.env.PRIVATE_KEY_FILE || '.private_key'
const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 6000
const OracleJSON = require('./build/contracts/LowbOracle.json')


async function getOracleContract (web3js) {
  const networkId = await web3js.eth.net.getId()
  return new web3js.eth.Contract(OracleJSON.abi, OracleJSON.networks[networkId].address)
}

async function init () {
  const privateKeyStr = fs.readFileSync(PRIVATE_KEY_FILE_NAME, 'utf-8')
  let bscWeb3 = new Web3('https://data-seed-prebsc-1-s2.binance.org:8545')
  let oecWeb3 = new Web3('https://exchaintestrpc.okex.org')
  bscWeb3.eth.accounts.wallet.add(privateKeyStr)
  const ownerAddress = bscWeb3.eth.accounts.wallet[0].address
  const bscOracleContract = await getOracleContract(bscWeb3)
  const oecOracleContract = await getOracleContract(oecWeb3)
  return { ownerAddress, bscWeb3, oecWeb3, bscOracleContract, oecOracleContract }
}

(async () => {
  const { ownerAddress, bscWeb3, oecWeb3, bscOracleContract, oecOracleContract } = await init()
  process.on( 'SIGINT', () => {
    console.log('Calling client.disconnect()')
    process.exit( );
  })

  let depositId = await oecOracleContract.methods.depositId().call()
  let id = Number(depositId) + 1
  console.log('start listening from ...', id)
  setInterval( async () => {
	let transaction = await bscOracleContract.methods.transactions(id).call()
    if (transaction.amount > 0) {
	  let block = await oecWeb3.eth.getBlockNumber()
	  let transactions = await oecOracleContract.getPastEvents('DepositForEvent', { filter: {id: id}, fromBlock: block-1000, toBlock: 'latest' })
      if (transactions.length > 0) {
        let value = transactions[0].returnValues
        console.log('* New DepositForEvent event. id: ', value.id)
        id++;
        await bscOracleContract.methods.withdrawTo(value.amount, value.to, value.id).send({ from: ownerAddress, gas: 200000, gasPrice: 10000000000 })
        console.log('* Deposit Succeed. id: ' + value.id)
      }
    }
    else {
      console.log(id, transaction.amount>0)
    }
  }, SLEEP_INTERVAL);
})()
