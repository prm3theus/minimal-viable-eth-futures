import "./lib/Strings.sol";
import "@chainlink/contracts/src/v0.4/ChainlinkClient.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// add safemath

pragma experimental ABIEncoderV2;

contract OracleClient is ChainlinkClient, Ownable {
    using strings for *;
    
    string public id;
    string public code;
    
    string[] public endpoints;
    mapping(string => string[]) statusById;

    // oracle address, predeployed
  	address ORACLE_ADDRESS_KOVAN = 0x858ed25084fc561d3e3403fdcbd6ad92415da6c3;
    
    event LogStatus(string indexed id, string indexed status);

    /**
		* @dev deploy a Futures Factory & Oracle Client	
		* @param _link The address of the LINK token contract
   */
	constructor(address _link) public {
		if (_link == address(0)) {
			setPublicChainlinkToken();
		} else {
			setChainlinkToken(_link);
		}
	}

	/**
	* @dev This is the public implementation returning the contained data
	* @param _id 	id of market
	*/
	function estimate(string _id) public view returns (uint256) {

		uint count = 0;

		for (uint i = 0; i < statusById[_id].length; i++) {
			// count
			string memory s = statusById[_id][i];
			if( keccak256(abi.encodePacked(s)) != keccak256(abi.encodePacked("200"))) {
				count++;
			} else {
				count = 0;
			}
		}

		return count;
	}

	  /**
	* @notice Returns the address of the LINK token
	* @dev This is the public implementation for chainlinkTokenAddress, which is
	* an internal method of the ChainlinkClient contract
	*/
	function getChainlinkToken() public view returns (address) {
		return chainlinkTokenAddress();
	}

    function update(bytes32 status) public returns (string, string){

        string memory str = string(abi.encodePacked(status));
        var status_slice = str.toSlice();
        var id_slice = status_slice.split(",".toSlice());
        
        bytes memory statusBytes = bytes(status_slice.toString());
        
        bytes memory bytesStringTrimmed = new bytes(3);
        bytesStringTrimmed[0] = statusBytes[0];
        bytesStringTrimmed[1] = statusBytes[1];
        bytesStringTrimmed[2] = statusBytes[2];
        
        code = string(bytesStringTrimmed);
        id = id_slice.toString();
        
        if(statusById[id].length == 0 ){
            endpoints.push(id);
        }
        
        statusById[id].push(code);

        emit LogStatus(id, code);

        return (id, code);
    }
    
    function getStatus(string _id) public view returns (string[]){
        return statusById[_id];
    }
}