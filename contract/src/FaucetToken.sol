// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FaucetToken is ERC20 {

    // State
    address public owner;

    uint256 public maxSupply;

    uint256 public faucetAmount;

    uint256 public constant COOLDOWN = 1 days;

    mapping(address => uint256) public lastClaimed;

    //Custom Errors
    error INVALIDADDRESS();
    error NOTOWNER();
    error INVALIDAMOUNT();
    error MAXSUPPLYEXCEEDED();
    error COOLDOWNACTIVE(uint256 timeRemaining);

    // Events
    event Mint(address indexed to, uint256 amount);
    event FaucetClaim(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NOTOWNER();
        _;
    }

    constructor(address _owner) ERC20("LeviToken", "LTK") {

        if (_owner == address(0)) revert INVALIDADDRESS();

        owner = _owner;

        maxSupply = 10_000_000 * 10 ** decimals();

        faucetAmount = 10 * 10 ** decimals();
    }

    function mint(address _to, uint256 _amount) external onlyOwner {

        if (_to == address(0)) revert INVALIDADDRESS();

        if (_amount == 0) revert INVALIDAMOUNT();

        if (totalSupply() + _amount > maxSupply) {
            revert MAXSUPPLYEXCEEDED();
        }
        _mint(_to, _amount);

        emit Mint(_to, _amount);
    }

    function requestToken() external {
        uint256 lastTime = lastClaimed[msg.sender];

        if (lastTime != 0) {
            uint256 nextTime = lastTime + COOLDOWN;

            if (block.timestamp < nextTime) {
                revert COOLDOWNACTIVE(nextTime - block.timestamp);
            }
        }

        if (totalSupply() + faucetAmount > maxSupply) {
            revert MAXSUPPLYEXCEEDED();
        }

        lastClaimed[msg.sender] = block.timestamp;

        _mint(msg.sender, faucetAmount);

        emit FaucetClaim(msg.sender, faucetAmount);
    }

    function nextRequestTime(address user) external view returns (uint256) {

        uint256 lastTime = lastClaimed[user];

        if (lastTime == 0) return 0;

        uint256 nextTime = lastTime + COOLDOWN;

        if (block.timestamp >= nextTime) return 0;

        return nextTime;
    }

    function transferOwnership(address newOwner) external onlyOwner {

        if (newOwner == address(0)) revert INVALIDADDRESS();

        address oldOwner = owner;

        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }
}