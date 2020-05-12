require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')

// console.log('process.env.PRIV_KEY')
// console.log(process.env.PRIV_KEY)
module.exports = {
  networks: {
    local: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      skipDryRun: true,
    },
    // kovan: {
    //   provider: () => {
    //     return new HDWalletProvider(process.env.PRIV_KEY, process.env.RPC_URL)
    //   },
    //   network_id: '*',
    //   // Necessary due to https://github.com/trufflesuite/truffle/issues/1971
    //   // Should be fixed in Truffle 5.0.17
    //   skipDryRun: true,
    // },
  },
  compilers: {
    solc: {
      version: '0.4.24',
    },
  },
}
