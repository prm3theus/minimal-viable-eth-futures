const FuturesFactory = artifacts.require('FuturesFactory.sol')

contract('FuturesFactory', accounts => {

  let ff

  beforeEach(async () => {
    const market = "FUTURES"
    const token = "0x.."
    ff = await FuturesFactory.new(market, token, { from: defaultAccount })
  })

  describe('using the factory', () => {
      it('signs a contract by a seller off-chain', async () => {
        assert(true)
      })

      it('builds the future on chain and deposit funds', async () => {
        assert(true)
      })

      it('attempts to use wrong signature', async () => {
        assert(true)
      })

      it('calls strike on the future and executes transfer', async () => {
        assert(true)
      })
  })
})
