const FuturesFactory = artifacts.require('FuturesFactory')
const OracleClient = artifacts.require('OracleClient')
const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
const Token = artifacts.require('MagicToken')

module.exports = (deployer, network, [defaultAccount]) => {

	LinkToken.setProvider(deployer.provider)

    deployer.deploy(LinkToken, { from: defaultAccount }).then(link => {
      return deployer
        .deploy(OracleClient, link.address, { from: defaultAccount })
        .then((client) => {

        	return deployer
        	.deploy(Token, {from: defaultAccount})
        	.then((token) => {
          		return deployer.deploy(FuturesFactory, "FU", token.address, 2, client.address)
        	})

        })
    })
}
