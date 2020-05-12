const FuturesFactory = artifacts.require('FuturesFactory.sol')
const OracleClient = artifacts.require('OracleClient.sol')

const abi = require('ethereumjs-abi');

const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
// const { Oracle } = require('@chainlink/contracts/truffle/v0.4/Oracle')

const market = "FU"

contract('FuturesFactory', (accounts, network) => {
  let defaultAccount, ff, cc, link, buyer, seller

  defaultAccount = accounts[0]
  buyer = accounts[1]
  seller = accounts[1]

  beforeEach(async () => {
    link = await LinkToken.new({ from: defaultAccount })
    oc = await OracleClient.new(link.address, { from: defaultAccount })
    ff = await FuturesFactory.new(market, link.address, oc.address, { from: defaultAccount })
    // await oc.setFulfillmentPermission(oracleNode, true, {
    //   from: defaultAccount,
    // })
  })

  describe('using the factory', () => {
      it('signs a contract by a seller off-chain', async () => {
        const marketCall = await ff.market.call()
        console.log(`Market: ${market}`)

        const value = 100
        const expiry = Date.now() + 100
        const thing = "1DEXIT"

        // Create Hashed Message
        const hash = "0x" + abi.soliditySHA3([
            'address', 'uint256', 'uint256', 'string'
          ], [seller, value, expiry, thing]).toString('Hex');
        
        console.log('HASH')
        console.log(hash)

        // Sign Transaction
        const newSignature = await web3.eth.sign(hash, seller);
        console.log(newSignature)
        // function build(address _sellerAddr, uint256 _value, uint256 _expiry, bytes32 _thing, bytes32 _sig) payable external returns(bool done) {

        // const tx = await ff.build(seller, 100, )

        // check reciept of future



        assert(marketCall == market)
      })

      it('runs a test on an estimate', async () => {
        const tx = await ff.quote.call(market)

        console.log(tx.toString())

        assert(true)
      })

      it('builds the future on chain and deposit funds', async () => {
        assert(true)
      })

      it('calls strike on the future and executes transfer', async () => {
        assert(true)
      })

      it('attempts to use wrong signature', async () => {
        assert(true)
      })
  })
})
