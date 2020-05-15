# Minimal Viable Futures ⏲️ (in-progress)

Stake on Units of a Future you Want. Strike at the right time on a Thing if you're Right. ✔️

Using [Chainlink](https://chain.link/) for Oracle feeds to connect possible Futures with underlying Measurements. 📏

## useful tid-bits for testing
* Chainlink token: 		    0xa36085f69e2889c224210f603d836748e7dc0088
* Oracle Address (kovan): 0x858ed25084fc561d3e3403fdcbd6ad92415da6c3
* Job Id: 				        2652051ded0443148ab7e6184792adf0

## TODO
- [x] minimal interface
- [x] testing setup
- [x] connect OracleClient with FutureFactory
- [x] mock oracle feed
- [ ] add chainlink scheduled updates
- [ ] connect with live network
- [ ] fine tune
- [ ] name your thing right -.-

### possible v2
- solve reentrancy on signed tx
- solve expired futures if balance is < amount
- add contract price / amount vs. just value
- convert ERC20 token to ERC223 to remove 2 txs into 1 flawless execution

LICENSE MIT
