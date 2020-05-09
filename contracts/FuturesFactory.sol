pragma solidity 0.4.24;

// TODO: import from open-zepplin
import "./ECRecovery.sol";
import "./SafeMath.sol";

import './OracleClient.sol';
import './IFuturesFactory.sol';

contract FuturesFactory is IFuturesFactory {
	
	// libs
	using SafeMath for uint256;
  	using ECRecovery for bytes32;

  	// market details
	public OracleClient oracleClient;
	public string market;
	public uint256 count;

	// mapping the futures
	mapping (address => uint256[]) public futuresBySeller; 
	mapping (uint256 => Future) public futures;

	// futures event triggers
	event Build(address indexed builder, uint256 indexed id, uint256 expiry);
	event Strike(address indexed striker, uint256 indexed id,  uint256 time);

	/**
		* @ev deploy a Futures Factory & Oracle Client	
		* @param _market The address of the LINK token contract
		* @param _token The address of the LINK token contract
   */
	constructor(string _market, address _token) public {
		market = _market;
		token = _token;
		count = 0;
		oracleClient = new OracleClient()
	}

	/**	
		* @dev This calls an estimate for the market

		* @param _market 		The calling market
	*/
	function estimate(string _market) public returns(uint256 value) {
		return oracleClient.estimate()
	}

	/**
		* @dev This gives a seller permission to exchange funds on command
	*/
	function permission() public returns (bool done) {
		ERC20(token).approve(msg.sender, msg.value);
		return true;
	}

	/**
		* @dev This function builds a futures contract, called by a buyer

		* @param _sellerAddr 	The Oracle contract address to send the request to
		* @param _value 		The value of the future
		* @param _strikeTime 	The strike time of the contract
		* @param _thing 		The metadata of the thing
		* @param _sig 			The signature of the off-chain contract
	*/
	function build(address _sellerAddr, uint256 _value, uint256 _expiry, bytes32 _thing, bytes32 _sig) external returns(bool done) {
		
		// unravel signature, get address
		address signer = _hash.toEthSignedMessageHash().recover(_sig);

		// TODO: match signature with future

		// check the correct seller signer the message
		require(signer == _sellerAddr, "FuturesFactory#build: INCORRECT_SIGNER")
		
		// check if funds are adequate
		require(msg.value == soldValue, "FuturesFactory#build: INADEQUATE_FUNDS")

		// build future 
		Future memory future = Future(msg.sender, _sellerAddr, _value, _thing, _expiry, false);

		// creating factory index
		futuresBySeller[_sellerAddr].push(count);
		futures[count] = future;
		count++;

		Build(msg.sender, sellerAddr, msg.value, soldThing, strikeDate)

		return true;
	}


	/**
		* @dev This function closes a futures contract, called by a buyer or seller

		* @param _id 			The id of the contract on-chain
	*/
	function strike(uint256 _id) external returns(bool done) {
	   	
	   	// check owner
	   	require(futures[_id].buyer == msg.sender || futures[_id].seller == msg.sender, "FuturesFactory#strike: NOT_FUTURE_PARTICIPANT")
	   	
	   	// check if the time is after a certin date
	   	require(futures[_id].expiry == msg.sender || futures[_id].seller == msg.sender, "FuturesFactory#strike: INADEQUATE_FUNDS")
	   	
	   	// check if the price is equal
	   	uint256 memory value = futures[_id].value;
	   	uint256 memory indexValue = oracleClient.getIndex();

	   	require(indexValue >= value, "FuturesFactory#strike: VALUE_NOT_AT_STRIKE_LEVEL")

	   	//terminate future
	   	futures[_id].terminated = true;

		// transfer funds
	   	if(difference > 0) {
		   	ER20(buyer).send(value)
   		} else{
		   	ER20(sller).send(value)
   		}

	   	Strike(msg.sender, _id, now);
	}
}