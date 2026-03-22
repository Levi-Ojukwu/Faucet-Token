// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/FaucetToken.sol";

contract FaucetTokenTest is Test {

    FaucetToken token;

    address owner  = makeAddr("owner");
    address user1  = makeAddr("user1");
    address user2  = makeAddr("user2");
    address user3  = makeAddr("user3");

    uint256 constant DECIMALS      = 18;
    uint256 constant MAX_SUPPLY    = 10_000_000 * 10 ** DECIMALS;
    uint256 constant FAUCET_AMOUNT = 10 * 10 ** DECIMALS;
    uint256 constant DAY           = 1 days;

    // ── Setup ─────────────────────────────────────────────────────────────────

    function setUp() public {
        token = new FaucetToken(owner);
    }

    // ── Deployment ────────────────────────────────────────────────────────────

    function test_Name() public view {
        assertEq(token.name(), "LeviToken");
    }

    function test_Symbol() public view {
        assertEq(token.symbol(), "LTK");
    }

    function test_Decimals() public view {
        assertEq(token.decimals(), 18);
    }

    function test_OwnerIsSetCorrectly() public view {
        assertEq(token.owner(), owner);
    }

    function test_MaxSupplyIsSet() public view {
        assertEq(token.maxSupply(), MAX_SUPPLY);
    }

    function test_FaucetAmountIsSet() public view {
        assertEq(token.faucetAmount(), FAUCET_AMOUNT);
    }

    function test_TotalSupplyIsZeroOnDeploy() public view {
        assertEq(token.totalSupply(), 0);
    }

    function test_Revert_Deploy_ZeroAddressOwner() public {
        vm.expectRevert(FaucetToken.INVALIDADDRESS.selector);
        new FaucetToken(address(0));
    }

    // ── mint() ────────────────────────────────────────────────────────────────

    function test_Mint_OwnerCanMintToUser() public {
        uint256 amount = 500 * 10 ** DECIMALS;

        vm.prank(owner);
        token.mint(user1, amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(),    amount);
    }

    function test_Mint_EmitsMintEvent() public {
        uint256 amount = 1_000 * 10 ** DECIMALS;

        vm.expectEmit(true, false, false, true);
        emit FaucetToken.Mint(user1, amount);

        vm.prank(owner);
        token.mint(user1, amount);
    }

    function test_Mint_MultipleTimesAccumulates() public {
        uint256 amount = 1_000 * 10 ** DECIMALS;

        vm.startPrank(owner);
        token.mint(user1, amount);
        token.mint(user1, amount);
        vm.stopPrank();

        assertEq(token.balanceOf(user1), amount * 2);
    }

    function test_Revert_Mint_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert(FaucetToken.NOTOWNER.selector);
        token.mint(user1, 1);
    }

    function test_Revert_Mint_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(FaucetToken.INVALIDADDRESS.selector);
        token.mint(address(0), 1_000);
    }

    function test_Revert_Mint_ZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(FaucetToken.INVALIDAMOUNT.selector);
        token.mint(user1, 0);
    }

    function test_Revert_Mint_ExceedsMaxSupply() public {
        vm.prank(owner);
        vm.expectRevert(FaucetToken.MAXSUPPLYEXCEEDED.selector);
        token.mint(user1, MAX_SUPPLY + 1);
    }

    function test_Mint_ExactlyMaxSupply() public {
        vm.prank(owner);
        token.mint(user1, MAX_SUPPLY);
        assertEq(token.totalSupply(), MAX_SUPPLY);
    }

    // ── requestToken() ────────────────────────────────────────────────────────

    function test_RequestToken_MintsToUser() public {
        vm.prank(user1);
        token.requestToken();
        assertEq(token.balanceOf(user1), FAUCET_AMOUNT);
    }

    function test_RequestToken_IncreasesTotalSupply() public {
        vm.prank(user1);
        token.requestToken();
        assertEq(token.totalSupply(), FAUCET_AMOUNT);
    }

    function test_RequestToken_EmitsFaucetClaimEvent() public {
        vm.expectEmit(true, false, false, true);
        emit FaucetToken.FaucetClaim(user1, FAUCET_AMOUNT);

        vm.prank(user1);
        token.requestToken();
    }

    function test_RequestToken_UpdatesLastClaimed() public {
        uint256 timeBefore = block.timestamp;

        vm.prank(user1);
        token.requestToken();

        assertEq(token.lastClaimed(user1), timeBefore);
    }

    function test_RequestToken_FirstClaimNoCooldownNeeded() public {
        // First ever claim should always go through (lastClaimed == 0)
        vm.prank(user1);
        token.requestToken();
        assertEq(token.balanceOf(user1), FAUCET_AMOUNT);
    }

    function test_RequestToken_SucceedsAfterCooldown() public {
        vm.prank(user1);
        token.requestToken();

        vm.warp(block.timestamp + DAY);

        vm.prank(user1);
        token.requestToken();

        assertEq(token.balanceOf(user1), FAUCET_AMOUNT * 2);
    }

    function test_RequestToken_CooldownIsPerUser() public {
        vm.prank(user1);
        token.requestToken();

        // user2 has never claimed — should succeed independently
        vm.prank(user2);
        token.requestToken();

        assertEq(token.balanceOf(user2), FAUCET_AMOUNT);
    }

    function test_RequestToken_MultipleUsersClaim() public {
        vm.prank(user1);
        token.requestToken();

        vm.prank(user2);
        token.requestToken();

        vm.prank(user3);
        token.requestToken();

        assertEq(token.totalSupply(), FAUCET_AMOUNT * 3);
    }

    function test_Revert_RequestToken_CooldownActive() public {
        vm.prank(user1);
        token.requestToken();

        // Try again immediately — should revert with time remaining
        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                FaucetToken.COOLDOWNACTIVE.selector,
                DAY  // full DAY remaining since no time has passed
            )
        );
        token.requestToken();
    }

    function test_Revert_RequestToken_CooldownActive_PartialTime() public {
        vm.prank(user1);
        token.requestToken();

        uint256 halfDay = DAY / 2;
        vm.warp(block.timestamp + halfDay);

        vm.prank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                FaucetToken.COOLDOWNACTIVE.selector,
                halfDay   // half a day still remaining
            )
        );
        token.requestToken();
    }

    function test_Revert_RequestToken_MaxSupplyReached() public {
        // Mint everything up to exactly 1 faucetAmount below the cap
        uint256 almostFull = MAX_SUPPLY - FAUCET_AMOUNT;

        vm.prank(owner);
        token.mint(owner, almostFull);

        // One more faucet claim fills it exactly — should succeed
        vm.prank(user1);
        token.requestToken();
        assertEq(token.totalSupply(), MAX_SUPPLY);

        // Now supply is full — user2 should be blocked
        vm.warp(block.timestamp + DAY);
        vm.prank(user2);
        vm.expectRevert(FaucetToken.MAXSUPPLYEXCEEDED.selector);
        token.requestToken();
    }

    // ── nextRequestTime() ─────────────────────────────────────────────────────

    function test_NextRequestTime_ZeroBeforeFirstClaim() public view {
        assertEq(token.nextRequestTime(user1), 0);
    }

    function test_NextRequestTime_ReturnsCorrectTimestamp() public {
        uint256 claimTime = block.timestamp;

        vm.prank(user1);
        token.requestToken();

        assertEq(token.nextRequestTime(user1), claimTime + DAY);
    }

    function test_NextRequestTime_ReturnsZeroAfterCooldownExpires() public {
        vm.prank(user1);
        token.requestToken();

        vm.warp(block.timestamp + DAY);

        assertEq(token.nextRequestTime(user1), 0);
    }

    // ── transferOwnership() ───────────────────────────────────────────────────

    function test_TransferOwnership_UpdatesOwner() public {
        vm.prank(owner);
        token.transferOwnership(user1);
        assertEq(token.owner(), user1);
    }

    function test_TransferOwnership_EmitsEvent() public {
        vm.expectEmit(true, true, false, false);
        emit FaucetToken.OwnershipTransferred(owner, user1);

        vm.prank(owner);
        token.transferOwnership(user1);
    }

    function test_TransferOwnership_NewOwnerCanMint() public {
        vm.prank(owner);
        token.transferOwnership(user1);

        uint256 amount = 100 * 10 ** DECIMALS;
        vm.prank(user1);
        token.mint(user2, amount);

        assertEq(token.balanceOf(user2), amount);
    }

    function test_TransferOwnership_OldOwnerCanNoLongerMint() public {
        vm.prank(owner);
        token.transferOwnership(user1);

        vm.prank(owner);
        vm.expectRevert(FaucetToken.NOTOWNER.selector);
        token.mint(user2, 1);
    }

    function test_Revert_TransferOwnership_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert(FaucetToken.NOTOWNER.selector);
        token.transferOwnership(user2);
    }

    function test_Revert_TransferOwnership_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(FaucetToken.INVALIDADDRESS.selector);
        token.transferOwnership(address(0));
    }

    // ── Standard ERC-20 (inherited from OZ) ───────────────────────────────────

    function test_Transfer_Works() public {
        uint256 amount = 500 * 10 ** DECIMALS;

        vm.prank(owner);
        token.mint(user1, amount);

        vm.prank(user1);
        token.transfer(user2, amount);

        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(user2), amount);
    }

    function test_Approve_And_TransferFrom() public {
        uint256 amount = 300 * 10 ** DECIMALS;

        vm.prank(owner);
        token.mint(user1, amount);

        vm.prank(user1);
        token.approve(user2, amount);

        assertEq(token.allowance(user1, user2), amount);

        vm.prank(user2);
        token.transferFrom(user1, user3, amount);

        assertEq(token.balanceOf(user3),        amount);
        assertEq(token.allowance(user1, user2), 0);
    }
}