// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TieredBadge.sol";
import "../src/SubscriptionManager.sol";
import "../src/GatedContent.sol";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    SUBSCRIPTION SYSTEM TESTS                                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Comprehensive unit tests sesuai PDF brief specifications.                    ║
 * ║                                                                               ║
 * ║  🧪 TEST STRUCTURE:                                                           ║
 * ║  ─────────────────                                                            ║
 * ║  1. Setup - deploy contracts, create test users                               ║
 * ║  2. TieredBadge Tests - Tier struct, loyalty bonus                            ║
 * ║  3. SubscriptionManager Tests - handle, totalSubscribers                      ║
 * ║  4. GatedContent Tests - viralScore, rewards                                  ║
 * ║  5. Integration Tests - full flows                                            ║
 * ║                                                                               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
contract SubscriptionSystemTest is Test {
    /*//////////////////////////////////////////////////////////////
                               CONTRACTS
    //////////////////////////////////////////////////////////////*/

    TieredBadge public badge;
    SubscriptionManager public manager;
    GatedContent public content;

    /*//////////////////////////////////////////////////////////////
                            TEST ADDRESSES
    //////////////////////////////////////////////////////////////*/

    // Use known private key for verifier so we can sign in tests
    uint256 public constant VERIFIER_PK =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address public verifier = vm.addr(VERIFIER_PK);

    address public deployer = makeAddr("deployer");
    address public creator1 = makeAddr("creator1");
    address public creator2 = makeAddr("creator2");
    address public subscriber1 = makeAddr("subscriber1");
    address public subscriber2 = makeAddr("subscriber2");
    address public subscriber3 = makeAddr("subscriber3");
    address public nonSubscriber = makeAddr("nonSubscriber");

    /*//////////////////////////////////////////////////////////////
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant BRONZE_PRICE = 0.001 ether;
    uint256 public constant SILVER_PRICE = 0.005 ether;
    uint256 public constant GOLD_PRICE = 0.01 ether;
    uint256 public constant DURATION_30_DAYS = 30 days;

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/

    function setUp() public {
        // Deploy as deployer
        vm.startPrank(deployer);

        // Deploy contracts in correct order
        badge = new TieredBadge("ipfs://test/");
        manager = new SubscriptionManager(address(badge), deployer, verifier); // badge, feeRecipient, verifier
        content = new GatedContent(address(badge), address(manager));

        // Configure badge
        badge.setSubscriptionManager(address(manager));

        vm.stopPrank();

        // Give test users ETH
        vm.deal(creator1, 10 ether);
        vm.deal(creator2, 10 ether);
        vm.deal(subscriber1, 10 ether);
        vm.deal(subscriber2, 10 ether);
        vm.deal(subscriber3, 10 ether);
        vm.deal(nonSubscriber, 10 ether);
    }

    /*//////////////////////////////////////////////////////////////
                           HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Helper: Register creator dengan handle dan configure tiers
    function _setupCreator(address creator, string memory handle) internal {
        vm.startPrank(creator);

        // Register dengan handle - generate valid signature using VERIFIER_PK
        bytes32 messageHash = keccak256(
            abi.encodePacked(creator, uint256(15000), block.chainid)
        );
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(VERIFIER_PK, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        manager.registerCreator(handle, 15000, signature);

        // Configure tiers
        manager.configureTier(
            1,
            BRONZE_PRICE,
            DURATION_30_DAYS,
            "Bronze",
            "ipfs://bronze",
            0,
            0
        );
        manager.configureTier(
            2,
            SILVER_PRICE,
            DURATION_30_DAYS,
            "Silver",
            "ipfs://silver",
            0,
            7 days
        );
        manager.configureTier(
            3,
            GOLD_PRICE,
            DURATION_30_DAYS,
            "Gold",
            "ipfs://gold",
            100,
            14 days
        );

        vm.stopPrank();
    }

    /// @dev Helper: Generate signature for creator registration
    function _getSignature(
        address creator,
        uint256 followerCount
    ) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(creator, followerCount, block.chainid)
        );
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(VERIFIER_PK, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    /// @dev Helper: Register a creator with generated signature
    function _registerCreator(address creator, string memory handle) internal {
        bytes memory signature = _getSignature(creator, 15000);
        vm.prank(creator);
        manager.registerCreator(handle, 15000, signature);
    }

    /// @dev Helper: Subscribe to creator
    function _subscribe(
        address subscriber,
        address creator,
        uint256 tier
    ) internal {
        uint256 price = tier == 1
            ? BRONZE_PRICE
            : (tier == 2 ? SILVER_PRICE : GOLD_PRICE);
        vm.prank(subscriber);
        manager.subscribe{value: price}(creator, tier);
    }

    /*//////////////////////////////////////////////////////////////
                         TIERED BADGE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_TokenIdCalculation() public view {
        assertEq(badge.calculateTokenId(1, 1), 1001);
        assertEq(badge.calculateTokenId(5, 3), 5003);
        assertEq(badge.calculateTokenId(100, 2), 100002);
    }

    function test_GetCreatorFromTokenId() public view {
        assertEq(badge.getCreatorFromTokenId(1001), 1);
        assertEq(badge.getCreatorFromTokenId(5003), 5);
    }

    function test_GetTierFromTokenId() public view {
        assertEq(badge.getTierFromTokenId(1001), 1);
        assertEq(badge.getTierFromTokenId(5003), 3);
    }

    /// @dev Test loyalty bonus calculation (sesuai PDF brief)
    function test_LoyaltyBonusCalculation() public view {
        // < 30 days = 0
        assertEq(badge.calculateLoyaltyBonus(29 days), 0);

        // 30-90 days = 10
        assertEq(badge.calculateLoyaltyBonus(30 days), 10);
        assertEq(badge.calculateLoyaltyBonus(89 days), 10);

        // 90-180 days = 25
        assertEq(badge.calculateLoyaltyBonus(90 days), 25);
        assertEq(badge.calculateLoyaltyBonus(179 days), 25);

        // 180-365 days = 50
        assertEq(badge.calculateLoyaltyBonus(180 days), 50);
        assertEq(badge.calculateLoyaltyBonus(364 days), 50);

        // > 365 days = 100
        assertEq(badge.calculateLoyaltyBonus(365 days), 100);
        assertEq(badge.calculateLoyaltyBonus(730 days), 100);
    }

    function test_RevertWhen_UnauthorizedMint() public {
        vm.prank(subscriber1);
        vm.expectRevert(TieredBadge.NotAuthorized.selector);
        badge.mintBadge(creator1, 1);
    }

    function test_RevertWhen_TransferBadge() public {
        _setupCreator(creator1, "testcreator");
        _subscribe(subscriber1, creator1, 1);

        vm.prank(subscriber1);
        vm.expectRevert(TieredBadge.TransferNotAllowed.selector);
        badge.safeTransferFrom(subscriber1, subscriber2, 1001, 1, "");
    }

    /*//////////////////////////////////////////////////////////////
                    SUBSCRIPTION MANAGER TESTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Test creator registration dengan handle (sesuai PDF brief)
    function test_RegisterCreatorWithHandle() public {
        _registerCreator(creator1, "alice_creator");

        SubscriptionManager.Creator memory creatorData = manager.getCreator(
            creator1
        );

        assertEq(creatorData.wallet, creator1);
        assertEq(creatorData.handle, "alice_creator");
        assertTrue(creatorData.isActive);
        assertEq(creatorData.creatorIndex, 1);
        assertEq(creatorData.totalSubscribers, 0);
        assertEq(creatorData.followerCount, 15000);
    }

    /// @dev Test handle uniqueness
    function test_RevertWhen_HandleAlreadyTaken() public {
        _registerCreator(creator1, "unique_handle");

        bytes memory sig2 = _getSignature(creator2, 15000);
        vm.prank(creator2);
        vm.expectRevert(SubscriptionManager.HandleAlreadyTaken.selector);
        manager.registerCreator("unique_handle", 15000, sig2);
    }

    /// @dev Test handle length validation
    function test_RevertWhen_HandleTooShort() public {
        bytes memory sig = _getSignature(creator1, 15000);
        vm.prank(creator1);
        vm.expectRevert(SubscriptionManager.HandleTooShort.selector);
        manager.registerCreator("ab", 15000, sig); // < 3 chars
    }

    /// @dev Test totalSubscribers counter (sesuai PDF brief)
    function test_TotalSubscribersCounter() public {
        _setupCreator(creator1, "testcreator");

        // Initial = 0
        assertEq(manager.getCreator(creator1).totalSubscribers, 0);

        // Subscribe 1
        _subscribe(subscriber1, creator1, 1);
        assertEq(manager.getCreator(creator1).totalSubscribers, 1);

        // Subscribe 2
        _subscribe(subscriber2, creator1, 2);
        assertEq(manager.getCreator(creator1).totalSubscribers, 2);

        // Cancel 1
        vm.prank(subscriber1);
        manager.cancelSubscription(creator1);
        assertEq(manager.getCreator(creator1).totalSubscribers, 1);
    }

    /// @dev Test checkAccess function (sesuai PDF brief)
    function test_CheckAccess() public {
        _setupCreator(creator1, "testcreator");
        _subscribe(subscriber1, creator1, 1);

        // Subscriber has access
        assertTrue(manager.checkAccess(creator1, subscriber1, 1));

        // Creator has access
        assertTrue(manager.checkAccess(creator1, creator1, 1));

        // Non-subscriber no access
        assertFalse(manager.checkAccess(creator1, nonSubscriber, 1));
    }

    /// @dev Test creatorRevenue mapping (sesuai PDF brief)
    function test_CreatorRevenue() public {
        _setupCreator(creator1, "testcreator");

        uint256 initialRevenue = manager.getCreatorRevenue(creator1);
        assertEq(initialRevenue, 0);

        _subscribe(subscriber1, creator1, 3); // Gold = 0.01 ETH

        // Platform fee = 5%, creator gets 95%
        uint256 expectedRevenue = (GOLD_PRICE * 9500) / 10000;
        assertEq(manager.getCreatorRevenue(creator1), expectedRevenue);
    }

    function test_Subscribe() public {
        _setupCreator(creator1, "testcreator");

        vm.prank(subscriber1);
        manager.subscribe{value: SILVER_PRICE}(creator1, 2);

        assertTrue(manager.hasActiveSubscription(subscriber1, creator1));
        assertEq(manager.getSubscriptionTier(subscriber1, creator1), 2);

        // Check badge minted - creator index = 1, tier = 2, tokenId = 1002
        assertEq(badge.balanceOf(subscriber1, 1002), 1);
    }

    function test_UpgradeSubscription() public {
        _setupCreator(creator1, "testcreator");
        _subscribe(subscriber1, creator1, 1);

        // Check Bronze badge
        assertEq(badge.balanceOf(subscriber1, 1001), 1);

        // Fast forward to meet minHoldTime (0 for Bronze in test)
        vm.warp(block.timestamp + 1 days);

        // Upgrade to Gold - use startPrank with origin to mock tx.origin
        // TieredBadge.upgradeBadge uses tx.origin for subscriber address
        uint256 priceDiff = GOLD_PRICE - BRONZE_PRICE;
        vm.startPrank(subscriber1, subscriber1); // (msg.sender, tx.origin)
        manager.upgradeSubscription{value: priceDiff}(creator1, 3);
        vm.stopPrank();

        assertEq(manager.getSubscriptionTier(subscriber1, creator1), 3);
        assertEq(badge.balanceOf(subscriber1, 1001), 0); // Bronze burned
        assertEq(badge.balanceOf(subscriber1, 1003), 1); // Gold minted
    }

    function test_CreatorWithdraw() public {
        _setupCreator(creator1, "testcreator");

        uint256 balanceBefore = creator1.balance;
        _subscribe(subscriber1, creator1, 3);

        uint256 expectedAmount = (GOLD_PRICE * 9500) / 10000;

        vm.prank(creator1);
        manager.withdraw();

        assertEq(creator1.balance, balanceBefore + expectedAmount);
    }

    /*//////////////////////////////////////////////////////////////
                       GATED CONTENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateExclusivePost() public {
        _setupCreator(creator1, "testcreator");

        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(1, "QmTest123", 5);

        assertEq(postId, 1);

        GatedContent.ExclusivePost memory post = content.getPost(postId);
        assertEq(post.postId, 1);
        assertEq(post.creator, creator1);
        assertEq(post.contentHash, "QmTest123");
        assertEq(post.minTierRequired, 1);
        assertEq(post.conversionThreshold, 5);
        assertEq(post.viralScore, 0);
        assertFalse(post.isPublic);
    }

    function test_HasAccess() public {
        _setupCreator(creator1, "testcreator");
        _subscribe(subscriber1, creator1, 2); // Silver

        // Create Silver-tier post
        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(2, "QmTest", 10);

        // Silver subscriber can access
        assertTrue(content.hasAccess(subscriber1, postId));

        // Non-subscriber cannot
        assertFalse(content.hasAccess(nonSubscriber, postId));

        // Creator always can
        assertTrue(content.hasAccess(creator1, postId));
    }

    /// @dev Test viralScore (sesuai PDF brief)
    function test_ViralScore() public {
        _setupCreator(creator1, "testcreator");

        // Subscribe dengan different tiers
        _subscribe(subscriber1, creator1, 1); // Bronze
        _subscribe(subscriber2, creator1, 2); // Silver
        _subscribe(subscriber3, creator1, 3); // Gold

        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(1, "QmTest", 10);

        // Bronze vote = +1
        vm.prank(subscriber1);
        content.voteForPublicRelease(postId);
        assertEq(content.getPost(postId).viralScore, 1);

        // Silver vote = +2
        vm.prank(subscriber2);
        content.voteForPublicRelease(postId);
        assertEq(content.getPost(postId).viralScore, 3); // 1 + 2

        // Gold vote = +3
        vm.prank(subscriber3);
        content.voteForPublicRelease(postId);
        assertEq(content.getPost(postId).viralScore, 6); // 1 + 2 + 3
    }

    function test_VoteForPublicRelease() public {
        _setupCreator(creator1, "testcreator");
        _subscribe(subscriber1, creator1, 1);

        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(1, "QmTest", 3);

        vm.prank(subscriber1);
        content.voteForPublicRelease(postId);

        GatedContent.VoterInfo memory info = content.getVoterInfo(
            postId,
            subscriber1
        );
        assertTrue(info.hasVoted);
        assertEq(info.voteOrder, 1);
        assertEq(info.tierAtVote, 1);
    }

    function test_RevertWhen_DoubleVote() public {
        _setupCreator(creator1, "testcreator");
        _subscribe(subscriber1, creator1, 1);

        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(1, "QmTest", 10);

        vm.startPrank(subscriber1);
        content.voteForPublicRelease(postId);

        vm.expectRevert(GatedContent.AlreadyVoted.selector);
        content.voteForPublicRelease(postId);
        vm.stopPrank();
    }

    /// @dev Test viral conversion dengan PostWentPublic event (sesuai PDF brief)
    function test_ViralConversion() public {
        _setupCreator(creator1, "testcreator");

        // Subscribe multiple users
        address[] memory fans = new address[](3);
        for (uint i = 0; i < 3; i++) {
            fans[i] = address(uint160(i + 100));
            vm.deal(fans[i], 1 ether);
            vm.prank(fans[i]);
            manager.subscribe{value: BRONZE_PRICE}(creator1, 1);
        }

        // Create post with threshold = 3
        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(1, "QmViral", 3);

        // Not public yet
        assertFalse(content.getPost(postId).isPublic);

        // Vote 1, 2
        vm.prank(fans[0]);
        content.voteForPublicRelease(postId);
        vm.prank(fans[1]);
        content.voteForPublicRelease(postId);
        assertFalse(content.getPost(postId).isPublic);

        // Vote 3 - threshold reached!
        vm.prank(fans[2]);
        content.voteForPublicRelease(postId);

        // Now public
        assertTrue(content.getPost(postId).isPublic);
        assertTrue(content.hasAccess(nonSubscriber, postId));
    }

    /// @dev Test _distributeVoterRewards (sesuai PDF brief)
    function test_EarlyVoterRewards() public {
        _setupCreator(creator1, "testcreator");

        // Subscribe fans
        address[] memory fans = new address[](3);
        for (uint i = 0; i < 3; i++) {
            fans[i] = address(uint160(i + 100));
            vm.deal(fans[i], 1 ether);
            vm.prank(fans[i]);
            manager.subscribe{value: BRONZE_PRICE}(creator1, 1);
        }

        // Create post
        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(1, "QmViral", 3);

        // Fund reward pool
        vm.deal(creator1, 1 ether);
        vm.prank(creator1);
        content.fundRewardPool{value: 0.1 ether}(postId);

        // Vote to trigger viral conversion
        for (uint i = 0; i < 3; i++) {
            vm.prank(fans[i]);
            content.voteForPublicRelease(postId);
        }

        // Check rewards distributed
        GatedContent.EarlyVoterReward[] memory rewards = content
            .getEarlyVoterRewards(postId);
        assertEq(rewards.length, 3);

        // 1st = 50%, 2nd = 30%, 3rd = 20%
        assertEq(rewards[0].voter, fans[0]);
        assertEq(rewards[0].rewardAmount, 0.05 ether);
        assertEq(rewards[1].voter, fans[1]);
        assertEq(rewards[1].rewardAmount, 0.03 ether);
        assertEq(rewards[2].voter, fans[2]);
        assertEq(rewards[2].rewardAmount, 0.02 ether);
    }

    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    /// @dev Full flow test sesuai PDF brief
    function test_FullFlow() public {
        // 1. Creator registers dengan handle
        _registerCreator(creator1, "alice_web3");

        // 2. Creator configures tiers
        vm.startPrank(creator1);
        manager.configureTier(
            1,
            BRONZE_PRICE,
            DURATION_30_DAYS,
            "Bronze",
            "ipfs://b",
            0,
            0
        );
        manager.configureTier(
            2,
            SILVER_PRICE,
            DURATION_30_DAYS,
            "Silver",
            "ipfs://s",
            0,
            0
        );
        manager.configureTier(
            3,
            GOLD_PRICE,
            DURATION_30_DAYS,
            "Gold",
            "ipfs://g",
            0,
            0
        );
        vm.stopPrank();

        // 3. Fans subscribe dengan berbagai tiers
        _subscribe(subscriber1, creator1, 1); // Bronze
        _subscribe(subscriber2, creator1, 2); // Silver
        _subscribe(subscriber3, creator1, 3); // Gold

        // Verify totalSubscribers
        assertEq(manager.getCreator(creator1).totalSubscribers, 3);

        // 4. Creator posts exclusive content
        vm.prank(creator1);
        uint256 postId = content.createExclusivePost(1, "QmFullTest", 3);

        // 5. Fans vote untuk viral conversion
        vm.prank(subscriber1);
        content.voteForPublicRelease(postId);
        vm.prank(subscriber2);
        content.voteForPublicRelease(postId);
        vm.prank(subscriber3);
        content.voteForPublicRelease(postId);

        // 6. Content goes viral!
        assertTrue(content.getPost(postId).isPublic);

        // 7. Check viralScore (weighted)
        // Bronze(1) + Silver(2) + Gold(3) = 6
        assertEq(content.getPost(postId).viralScore, 6);

        // 8. Early voters tracked
        address[] memory earlyVoters = content.getEarlyVoters(postId);
        assertEq(earlyVoters.length, 3);

        // 9. Creator withdraws earnings
        uint256 creatorBalanceBefore = creator1.balance;
        vm.prank(creator1);
        manager.withdraw();
        assertTrue(creator1.balance > creatorBalanceBefore);
    }

    /// @dev Test getTierLevel (sesuai PDF brief)
    function test_GetTierLevel() public {
        _setupCreator(creator1, "testcreator");

        // No subscription
        assertEq(badge.getTierLevel(subscriber1, creator1), 0);

        // Subscribe Bronze
        _subscribe(subscriber1, creator1, 1);
        assertEq(badge.getTierLevel(subscriber1, creator1), 1);

        // Subscribe Silver (different user)
        _subscribe(subscriber2, creator1, 2);
        assertEq(badge.getTierLevel(subscriber2, creator1), 2);

        // Subscribe Gold
        _subscribe(subscriber3, creator1, 3);
        assertEq(badge.getTierLevel(subscriber3, creator1), 3);
    }

    /// @dev Test subscription expiry
    function test_SubscriptionExpiry() public {
        _setupCreator(creator1, "testcreator");
        _subscribe(subscriber1, creator1, 1);

        assertTrue(manager.hasActiveSubscription(subscriber1, creator1));

        // Fast forward 31 days
        vm.warp(block.timestamp + 31 days);

        assertFalse(manager.hasActiveSubscription(subscriber1, creator1));
        assertEq(manager.getSubscriptionTier(subscriber1, creator1), 0);
    }

    /// @dev Test getCreatorByHandle
    function test_GetCreatorByHandle() public {
        _registerCreator(creator1, "my_handle");

        assertEq(manager.getCreatorByHandle("my_handle"), creator1);
        assertEq(manager.getCreatorByHandle("nonexistent"), address(0));
    }
}
