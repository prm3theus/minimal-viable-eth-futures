pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract MagicToken is MintableToken {

	string public name = "MagicToken";
	string public symbol = "MT";
	uint8 public decimals = 2;
	uint public INITIAL_SUPPLY = 12000;

	constructor() public {
		mint(msg.sender, INITIAL_SUPPLY);
	}
}