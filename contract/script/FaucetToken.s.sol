// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/FaucetToken.sol";

contract DeployFaucetToken is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        FaucetToken fToken = new FaucetToken(deployer);

        vm.stopBroadcast();

        console.log("FaucetToken deployed at:", address(fToken));
        console.log("Owner:", deployer);
    }
}