pragma solidity 0.4.24;

interface IFuturesFactory {
  	function build(address _sellerAddr, uint256 _value, uint256 _strikeTime, bytes32 _thing, bytes32 _sig) payable external returns(bool);
  	function strike(uint256 _id) external returns(bool);
}	