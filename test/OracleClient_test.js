/* eslint-disable @typescript-eslint/no-var-requires */
const { oracle } = require('@chainlink/test-helpers')
const { expectRevert, time } = require('openzeppelin-test-helpers')

contract('FuturesClient', accounts => {
  const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
  const { Oracle } = require('@chainlink/contracts/truffle/v0.4/Oracle')
  const FuturesClient = artifacts.require('FuturesClient.sol')

  const defaultAccount = accounts[0]
  // const oracleNode = accounts[1]
  // const stranger = accounts[2]
  // const consumer = accounts[3]

  // These parameters are used to validate the data was received
  // on the deployed oracle contract. The Job ID only represents
  // the type of data, but will not work on a public testnet.
  // For the latest JobIDs, visit our docs here:
  // https://docs.chain.link/docs/testnet-oracles

  // changed endpoint
  const oracleNode = '0x858ed25084fc561d3e3403fdcbd6ad92415da6c3'
  const jobId = web3.utils.toHex('2652051ded0443148ab7e6184792adf0')
  const url ='http://../status'
  const path = 'STATUS'
  const times = 100

  // Represents 1 LINK for testnet requests
  const payment = web3.utils.toWei('1')

  let link, oc, cc

  // console.log('defaultAccount')
  // console.log(defaultAccount)
  
  beforeEach(async () => {
    link = await LinkToken.new({ from: defaultAccount })
    oc = await Oracle.new(link.address, { from: defaultAccount })

    // oc = { 
      // address: "0x858ed25084fc561d3e3403fdcbd6ad92415da6c3"
    // }

    console.log(link.address)
    cc = await FuturesClient.new(link.address, { from: defaultAccount })
    await oc.setFulfillmentPermission(oracleNode, true, {
      from: defaultAccount,
    })
  })

  describe('#createRequest', () => {

    // context('without LINK', () => {
    //   it('reverts', async () => {
    //     await expectRevert.unspecified(
    //       cc.createRequestTo(oc.address, jobId, payment, url, path, times, {
    //         from: consumer,
    //       }),
    //     )  
    //   })
    // })

    context('with LINK', () => {
      let request

      context('sending a request to a specific oracle contract address', () => {
        it('triggers a log event in the new Oracle contract', async () => {

        })
      })
})
