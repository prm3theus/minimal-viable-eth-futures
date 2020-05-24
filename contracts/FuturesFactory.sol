pragma experimental ABIEncoderV2;

// TODO: import from open-zepplin
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ECRecovery.sol";

import './OracleClient.sol';
// import './lib/IFuturesFactory.sol';

contract FuturesFactory {
	
	// libs
	using SafeMath for uint256;
  	using ECRecovery for bytes32;

  	// market details
	OracleClient public oracleClient;
	string public market;
	address public token;
	uint256 public count;
	uint256 public premiumRate;

	// future data structure
	struct Future {
		address maker;
		address taker;
		uint256 value;
		uint256 index;
		string thing;
		uint256 expiry;
		bool terminated;
	}

	// mapping the futures
	mapping (address => uint256[]) public futuresBySeller; 
	mapping (uint256 => Future) public futures;
	mapping (address => uint256) public margin;

	// futures event triggers
	event Permit(address indexed who, uint256 indexed amount);
	event Build(address indexed taker, uint256 indexed id, uint256 expiry);
	event Strike(address indexed striker, uint256 indexed id,  uint256 time);
	event LogQuote(string indexed market, uint256 indexed quote);

	/**
		* @dev deploy a Futures Factory & Oracle Client	
		* @param _market The address of the LINK token contract
		* @param _token The address of the LINK token contract
   */
	constructor(string _market, address _token, uint256 _rate, address _oracle) public {
		market = _market;
		token = _token;
		count = 0;
		premiumRate = _rate;
		oracleClient = OracleClient(_oracle);
	}

	/**	
		* @dev This calls an estimate for the market
		* @param _market 		The calling market
	*/
	function quote(string _market) public returns(uint256 value) {
		uint256 q = oracleClient.estimate(_market);
		emit LogQuote(_market, q);
		return q;
	}

	/**
		* @dev This function builds a futures contract, called by a taker
		* @param _future 	The future struct
	*/
	function build(Future memory _future, bytes memory _sig) public returns(bool done) {
		
		// TODO: solve reentrancy attack with nonce
		bytes32 message = keccak256(abi.encodePacked(_future.maker, _future.value, _future.thing, _future.expiry));
		bytes32 preFixedMessage = message.toEthSignedMessageHash();

		// check the correct seller signer the message
		require(_future.maker == ECRecovery.recover(preFixedMessage, _sig), "FuturesFactory#build: INCORRECT_SIGNER");

		// transfer from the approved maker address
		require(ERC20(token).transferFrom(_future.maker, address(this), _future.value), "FuturesFactory#build: INADEQUATE_FUNDS_BY_MAKER");
		
		// transfer from taker as a delegated call to pass storage context in this method call
		require(ERC20(token).transferFrom(msg.sender, address(this), _future.value), "FuturesFactory#build: INADEQUATE_FUNDS_BY_TAKER");

		// TODO: y u no work? USE ERC1077
		// require(token.delegatecall(bytes4(sha3("transfer(address,uint256)")), address(this), _future.value), "FuturesFactory#build: INADEQUATE_FUNDS_BY_TAKER");

		// add balance to the contract
		margin[_future.taker] += _future.value;
		margin[_future.maker] += _future.value;

		// assign the builder as the taker
		_future.taker = msg.sender;

		// creating factory index
		futuresBySeller[ _future.maker].push(count);
		futures[count] = _future;
		count++;

		emit Build(msg.sender, count, _future.expiry);

		return true;
	}


	/**
		* @dev This function closes a futures contract, called by a buyer or seller
		* @param _id 			The id of the contract on-chain
	*/
	function strike(uint256 _id) external returns(bool done) {
	   	
	   	// todo: check if future is valid
	   	Future memory future = futures[_id];

	   	// check owner
	   	require(future.taker == msg.sender || future.maker == msg.sender, "FuturesFactory#strike: NOT_FUTURE_PARTICIPANT");
	   	
	   	// check if the time is after a certin date
	   	require(future.expiry <= now, "FuturesFactory#strike: TIME_NOT_EXPIRED");
	   	
	   	// get oracle reference data
	   	uint256 indexValue = quote(future.thing);

	   	// calculate premium
	   	uint256 premium = premiumRate / 100 * future.value;
   		uint256 value = future.value - premium;

   		// transfer premium
		ERC20(token).transfer(future.maker, premium);

		// transfer funds
	   	if(indexValue >= future.index) {
	   		// maker wins contract, margin amounts get transferred
		   	ERC20(token).transfer(future.maker, future.value * 2);
   		} else {
   			// taker wins contract, margin amounts get transferred
		   	ERC20(token).transfer(future.taker, future.value * 2);
   		}

   		// empty balances
   		margin[future.taker] -= future.value;
		margin[future.maker] -= future.value;

	   	//terminate future
	   	futures[_id].terminated = true;

	   	emit Strike(msg.sender, _id, now);

	   	return true;
	}
}