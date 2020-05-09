pragma solidity 0.4.24;

interface IFuturesFactory {
	struct Future {
		address buyer
		address seller
		uint256 value
		bytes32 thing
		uint256 expiry
		bool terminated
	}
  	function build(address _sellerAddr, uint256 _value, uint256 _strikeTime, bytes32 _thing, bytes32 _sig) external;
  	function strike(uint256 _id) external;
}	