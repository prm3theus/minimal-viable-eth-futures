const FuturesFactory = artifacts.require('FuturesFactory.sol')
const OracleClient = artifacts.require('OracleClient.sol')
const MagicToken = artifacts.require('MagicToken.sol')

const abi = require('ethereumjs-abi');

const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
// const { Oracle } = require('@chainlink/contracts/truffle/v0.4/Oracle')

const ethers = require('ethers')
const utils = ethers.utils

const market = "FU"
const INITIAL_SUPPLY = 12000
const BALANCE = 1000
const premium = 2

// TODO: seperate value into contract price & index
const value = 100

// staking on a 1ms future, 
// convert value to seconds to match solidity: 
// https://solidity.readthedocs.io/en/v0.4.21/units-and-global-variables.html#block-and-transaction-properties
const expiry = ((Date.now() + 1)/1000).toFixed(0)
const thing = "1DEXIT"


contract('FuturesFactory', (accounts, network) => {
  let defaultAccount, ff, cc, link, taker, maker

  defaultAccount = accounts[0]
  taker = accounts[1]
  maker = accounts[2]

  before(async () => {
    token = await MagicToken.new({ from: defaultAccount })
    link = await LinkToken.new({ from: defaultAccount })
    oc = await OracleClient.new(link.address, { from: defaultAccount })
    ff = await FuturesFactory.new(market, token.address, premium, oc.address, { from: defaultAccount })
    await token.mint(taker, 1000, {from: defaultAccount})
    await token.mint(maker, 1000, {from: defaultAccount})

    await token.approve(ff.address, 1000, {from: maker})
    await token.approve(ff.address, 1000, {from: taker})
  })

  describe('using the factory', () => {

      it('contract has market', async () => {
        const marketCall = await ff.market.call()
        console.log(`Market: ${market}`)
        assert(market == marketCall)
      })

      it('maker has balance', async () => {
        const balanceCall = await token.balanceOf.call(maker)
        console.log(`Market: ${balanceCall}`)
        assert(balanceCall == BALANCE)
      })

      it.only('builds a future contract with signature', async () => {

        // Create Hashed Message
        const hash = "0x" + abi.soliditySHA3([
            'address', 'uint256', 'string', 'uint256'
          ], [maker, value, thing, expiry]).toString('Hex');
        
        console.log('HASH')
        console.log(hash)

        // Sign Transaction
        const sig = await web3.eth.sign(hash, maker);
        console.log(sig)
        // function build(address _sellerAddr, uint256 _value, uint256 _expiry, bytes32 _thing, bytes32 _sig) payable external returns(bool done) {
        const future = {
          maker: maker,
          taker: "0x0000000000000000000000000000000000000000",
          value: value,
          thing: thing,
          expiry: expiry,
          index: 3,
          terminated: false
        }

        let tx

        try{

          tx = await ff.build(future, sig, {from: taker})

          const takerBalance = Number((await token.balanceOf(taker)).toString());
          const makerBalance = Number((await token.balanceOf(maker)).toString());
          console.log(`taker: ${takerBalance}`)
          console.log(`maker: ${makerBalance}`)

          // maker balance is less the value of the contract
          assert(BALANCE - value == makerBalance)

          // taker balance has the value added
          assert(BALANCE - value == takerBalance)
        }catch(e){
          console.log(e)
          assert(false)
        }
      })


      it.only('checks quote', async () => {

        const id = '6b3epqaty52ub6tw.onion'
        const possibleStatuses = [200, 404, 500]

        let bytes32

        // add statuses
        bytes32 = utils.formatBytes32String(`${id},${possibleStatuses[0]}`)
        await oc.update(bytes32, {from: defaultAccount})
        bytes32 = utils.formatBytes32String(`${id},${possibleStatuses[2]}`)
        await oc.update(bytes32, {from: defaultAccount})
        bytes32 = utils.formatBytes32String(`${id},${possibleStatuses[2]}`)
        await oc.update(bytes32, {from: defaultAccount})

        const tx = await ff.quote(id, {from: taker})

        assert(Number(tx.logs[0].args.quote.toString()) == 2)
      })


      it.only('calls strike on the future and executes transfer', async () => {
        let tx

        try{

          // console.log(`Expiry: ${expiry}`)

          // update oracle price
          tx = await ff.strike(0, {from: taker})
          const takerBalance = Number((await token.balanceOf(taker)).toString());
          const makerBalance = Number((await token.balanceOf(maker)).toString());
          console.log(`taker: ${takerBalance}`)
          console.log(`maker: ${makerBalance}`)

          console.log('tx.logs')
          console.log(tx.logs)

          // maker balance is less the value of the contract
          assert(BALANCE - value == makerBalance)
          // taker balance has the value added
          assert(BALANCE + value == takerBalance)
        }catch(e){
          console.log(e)
          assert(false)
        }

      })

      it.only('calls strike on the future and executes transfer', async () => {
        let tx

        try{
          // console.log(`Expiry: ${expiry}`)
          const id = '6b3epqaty52ub6tw.onion'
          const possibleStatuses = [200, 404, 500]


          bytes32 = utils.formatBytes32String(`${id},${possibleStatuses[2]}`)
          await oc.update(bytes32, {from: defaultAccount})

          // update oracle price
          tx = await ff.strike(0, {from: taker})
          const takerBalance = Number((await token.balanceOf(taker)).toString());
          const makerBalance = Number((await token.balanceOf(maker)).toString());
          console.log(`taker: ${takerBalance}`)
          console.log(`maker: ${makerBalance}`)


          // maker balance is less the value of the contract
          assert(BALANCE - value == makerBalance)
          // taker balance has the value added
          assert(BALANCE + value == takerBalance)
        }catch(e){
          console.log(e)
          assert(false)
        }

      })

      // it.only('pays a premium to the maker', async () => {

      //   // taker strikes
      //   tx = await ff.strike(0, {from: taker})

      //   const takerBalance = Number((await token.balanceOf(taker)).toString());
      //   const makerBalance = Number((await token.balanceOf(maker)).toString());
      //   console.log(`taker: ${takerBalance}`)
      //   console.log(`maker: ${makerBalance}`)
      //   assert(true)
      // })

      // it('', async () => {

      // })
  })
})
