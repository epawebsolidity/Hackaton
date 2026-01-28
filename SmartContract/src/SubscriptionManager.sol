// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TieredBadge.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title SubscriptionManager
 * @notice Core contract for managing subscriptions, payments, and creator earnings
 * @dev Platform fee: 5% (500 bps), Creator: 95%
 */
contract SubscriptionManager is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Creator {
        address wallet;
        string handle;
        uint256 tierIds;
        bool isActive;
        uint256 totalSubscribers;
        uint256 creatorIndex;
        uint256 followerCount; // Verified follower count at registration
    }

    struct Subscription {
        address subscriber;
        uint256 tierId;
        uint256 startDate;
        uint256 renewalDate;
        bool isActive;
    }

    struct TierConfig {
        string name;
        uint256 price;
        uint256 duration;
        bool isActive;
        string metadataURI;
        uint256 maxSupply;
        uint256 minHoldTime;
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant TIER_BRONZE = 1;
    uint256 public constant TIER_SILVER = 2;
    uint256 public constant TIER_GOLD = 3;
    uint256 public constant MIN_FOLLOWER_COUNT = 10000;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    TieredBadge public immutable badge;
    uint256 public creatorCount;
    uint256 public platformFeeBps = 500;
    address public feeRecipient;
    uint256 public pendingPlatformFees;
    address public verifier; // Backend signer for follower verification

    mapping(address => Creator) public creators;
    mapping(string => address) public handleToCreator;
    mapping(uint256 => address) public creatorByIndex;
    mapping(address => mapping(address => Subscription)) public subscriptions;
    mapping(address => uint256) public creatorRevenue;
    mapping(address => uint256) public pendingWithdraw;
    mapping(address => mapping(uint256 => TierConfig)) public tierConfigs;
    mapping(bytes32 => bool) public usedSignatureHashes; // Prevent replay attacks

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event CreatorRegistered(
        address indexed creator,
        string handle,
        uint256 indexed creatorIndex
    );
    event TierConfigured(
        address indexed creator,
        uint256 indexed tier,
        string name,
        uint256 price,
        uint256 duration
    );
    event Subscribed(
        address indexed creator,
        address indexed subscriber,
        uint256 tierId,
        uint256 startDate,
        uint256 renewalDate,
        uint256 amount
    );
    event SubscriptionRenewed(
        address indexed creator,
        address indexed subscriber,
        uint256 newRenewalDate
    );
    event SubscriptionUpgraded(
        address indexed creator,
        address indexed subscriber,
        uint256 oldTier,
        uint256 newTier
    );
    event SubscriptionCancelled(
        address indexed creator,
        address indexed subscriber
    );
    event ContentUnlocked(
        address indexed creator,
        uint256 postId,
        address indexed subscriber
    );
    event Withdrawn(address indexed creator, uint256 amount);
    event PlatformFeesWithdrawn(address indexed recipient, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error CreatorAlreadyRegistered();
    error HandleAlreadyTaken();
    error CreatorNotFound();
    error CreatorNotActive();
    error TierNotConfigured();
    error AlreadySubscribed();
    error NotSubscribed();
    error InsufficientPayment();
    error InvalidTier();
    error CannotDowngrade();
    error SameTier();
    error NothingToWithdraw();
    error WithdrawFailed();
    error SubscriptionExpired();
    error HandleTooShort();
    error HandleTooLong();
    error InsufficientFollowers();
    error InvalidSignature();
    error SignatureAlreadyUsed();
    error VerifierNotSet();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyCreator() {
        if (!creators[msg.sender].isActive) revert CreatorNotActive();
        _;
    }

    modifier validTier(uint256 tier) {
        if (tier < TIER_BRONZE || tier > TIER_GOLD) revert InvalidTier();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _badge,
        address _feeRecipient,
        address _verifier
    ) Ownable(msg.sender) {
        badge = TieredBadge(_badge);
        feeRecipient = _feeRecipient;
        verifier = _verifier;
    }

    /*//////////////////////////////////////////////////////////////
                          CREATOR MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Register as a creator with verified follower proof
     * @param _handle Unique creator handle (3-32 chars)
     * @param _followerCount Verified follower count from Farcaster
     * @param _signature Backend-signed proof of follower count
     */
    function registerCreator(
        string memory _handle,
        uint256 _followerCount,
        bytes memory _signature
    ) external {
        if (verifier == address(0)) revert VerifierNotSet();
        if (creators[msg.sender].wallet != address(0))
            revert CreatorAlreadyRegistered();

        bytes memory handleBytes = bytes(_handle);
        if (handleBytes.length < 3) revert HandleTooShort();
        if (handleBytes.length > 32) revert HandleTooLong();
        if (handleToCreator[_handle] != address(0)) revert HandleAlreadyTaken();

        // Verify follower count meets minimum
        if (_followerCount < MIN_FOLLOWER_COUNT) revert InsufficientFollowers();

        // Verify signature from backend
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, _followerCount, block.chainid)
        );
        bytes32 signedHash = messageHash.toEthSignedMessageHash();

        // Prevent replay attacks
        if (usedSignatureHashes[signedHash]) revert SignatureAlreadyUsed();

        address signer = signedHash.recover(_signature);
        if (signer != verifier) revert InvalidSignature();

        // Mark signature as used
        usedSignatureHashes[signedHash] = true;

        creatorCount++;

        creators[msg.sender] = Creator({
            wallet: msg.sender,
            handle: _handle,
            tierIds: 0,
            isActive: true,
            totalSubscribers: 0,
            creatorIndex: creatorCount,
            followerCount: _followerCount
        });

        handleToCreator[_handle] = msg.sender;
        creatorByIndex[creatorCount] = msg.sender;
        badge.registerCreator(msg.sender, creatorCount);

        emit CreatorRegistered(msg.sender, _handle, creatorCount);
    }

    function configureTier(
        uint256 tier,
        uint256 price,
        uint256 duration,
        string memory name,
        string memory metadataURI,
        uint256 maxSupply,
        uint256 minHoldTime
    ) external onlyCreator validTier(tier) {
        tierConfigs[msg.sender][tier] = TierConfig({
            name: name,
            price: price,
            duration: duration,
            isActive: true,
            metadataURI: metadataURI,
            maxSupply: maxSupply,
            minHoldTime: minHoldTime
        });

        creators[msg.sender].tierIds |= (1 << tier);

        badge.createTier(
            msg.sender,
            tier,
            name,
            price,
            metadataURI,
            maxSupply,
            minHoldTime
        );

        emit TierConfigured(msg.sender, tier, name, price, duration);
    }

    function deactivateTier(uint256 tier) external onlyCreator validTier(tier) {
        tierConfigs[msg.sender][tier].isActive = false;
    }

    function withdraw() external onlyCreator {
        uint256 amount = pendingWithdraw[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingWithdraw[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert WithdrawFailed();

        emit Withdrawn(msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                        SUBSCRIPTION LOGIC
    //////////////////////////////////////////////////////////////*/

    function subscribe(
        address _creator,
        uint256 _tierId
    ) external payable validTier(_tierId) {
        Creator storage creatorData = creators[_creator];

        if (creatorData.wallet == address(0)) revert CreatorNotFound();
        if (!creatorData.isActive) revert CreatorNotActive();

        TierConfig storage tier = tierConfigs[_creator][_tierId];
        if (!tier.isActive) revert TierNotConfigured();
        if (msg.value < tier.price) revert InsufficientPayment();

        Subscription storage existingSub = subscriptions[_creator][msg.sender];
        if (existingSub.isActive && existingSub.renewalDate > block.timestamp)
            revert AlreadySubscribed();

        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformFee;

        pendingPlatformFees += platformFee;
        creatorRevenue[_creator] += creatorAmount;
        pendingWithdraw[_creator] += creatorAmount;

        if (!existingSub.isActive) creatorData.totalSubscribers++;

        uint256 startDate = block.timestamp;
        uint256 renewalDate = block.timestamp + tier.duration;

        badge.mintBadgeTo(msg.sender, _creator, _tierId);

        subscriptions[_creator][msg.sender] = Subscription({
            subscriber: msg.sender,
            tierId: _tierId,
            startDate: startDate,
            renewalDate: renewalDate,
            isActive: true
        });

        emit Subscribed(
            _creator,
            msg.sender,
            _tierId,
            startDate,
            renewalDate,
            msg.value
        );
    }

    function renewSubscription(address _creator) external payable {
        Creator storage creatorData = creators[_creator];
        if (creatorData.wallet == address(0)) revert CreatorNotFound();

        Subscription storage sub = subscriptions[_creator][msg.sender];
        if (!sub.isActive) revert NotSubscribed();

        TierConfig storage tier = tierConfigs[_creator][sub.tierId];
        if (msg.value < tier.price) revert InsufficientPayment();

        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformFee;

        pendingPlatformFees += platformFee;
        creatorRevenue[_creator] += creatorAmount;
        pendingWithdraw[_creator] += creatorAmount;

        if (sub.renewalDate > block.timestamp) {
            sub.renewalDate += tier.duration;
        } else {
            sub.renewalDate = block.timestamp + tier.duration;
        }

        emit SubscriptionRenewed(_creator, msg.sender, sub.renewalDate);
    }

    function upgradeSubscription(
        address _creator,
        uint256 _newTierId
    ) external payable validTier(_newTierId) {
        Creator storage creatorData = creators[_creator];
        if (creatorData.wallet == address(0)) revert CreatorNotFound();

        Subscription storage sub = subscriptions[_creator][msg.sender];
        if (!sub.isActive) revert NotSubscribed();
        if (sub.renewalDate <= block.timestamp) revert SubscriptionExpired();
        if (_newTierId <= sub.tierId) revert CannotDowngrade();
        if (_newTierId == sub.tierId) revert SameTier();

        TierConfig storage newTier = tierConfigs[_creator][_newTierId];
        if (!newTier.isActive) revert TierNotConfigured();

        TierConfig storage oldTier = tierConfigs[_creator][sub.tierId];
        uint256 priceDiff = newTier.price - oldTier.price;
        if (msg.value < priceDiff) revert InsufficientPayment();

        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 creatorAmount = msg.value - platformFee;

        pendingPlatformFees += platformFee;
        creatorRevenue[_creator] += creatorAmount;
        pendingWithdraw[_creator] += creatorAmount;

        uint256 oldTierId = sub.tierId;
        badge.upgradeBadge(_creator, sub.tierId, _newTierId);
        sub.tierId = _newTierId;

        emit SubscriptionUpgraded(_creator, msg.sender, oldTierId, _newTierId);
    }

    function cancelSubscription(address creator) external {
        Creator storage creatorData = creators[creator];
        if (creatorData.wallet == address(0)) revert CreatorNotFound();

        Subscription storage sub = subscriptions[creator][msg.sender];
        if (!sub.isActive) revert NotSubscribed();

        badge.burnBadge(msg.sender, creator, sub.tierId);

        sub.isActive = false;
        sub.renewalDate = block.timestamp;
        creatorData.totalSubscribers--;

        emit SubscriptionCancelled(creator, msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function checkAccess(
        address _creator,
        address _subscriber,
        uint256 _postId
    ) external view returns (bool) {
        _postId;
        if (_subscriber == _creator) return true;
        Subscription storage sub = subscriptions[_creator][_subscriber];
        return sub.isActive && sub.renewalDate > block.timestamp;
    }

    function hasActiveSubscription(
        address user,
        address creator
    ) external view returns (bool) {
        Subscription storage sub = subscriptions[creator][user];
        return sub.isActive && sub.renewalDate > block.timestamp;
    }

    function getSubscriptionTier(
        address user,
        address creator
    ) external view returns (uint256) {
        Subscription storage sub = subscriptions[creator][user];
        if (!sub.isActive || sub.renewalDate <= block.timestamp) return 0;
        return sub.tierId;
    }

    function getSubscription(
        address creator,
        address subscriber
    ) external view returns (Subscription memory) {
        return subscriptions[creator][subscriber];
    }

    function getCreator(
        address creator
    ) external view returns (Creator memory) {
        return creators[creator];
    }

    function getCreatorByHandle(
        string memory handle
    ) external view returns (address) {
        return handleToCreator[handle];
    }

    function getTierConfig(
        address creator,
        uint256 tier
    ) external view returns (TierConfig memory) {
        return tierConfigs[creator][tier];
    }

    function getCreatorRevenue(
        address creator
    ) external view returns (uint256) {
        return creatorRevenue[creator];
    }

    function getPendingWithdraw(
        address creator
    ) external view returns (uint256) {
        return pendingWithdraw[creator];
    }

    /*//////////////////////////////////////////////////////////////
                                ADMIN
    //////////////////////////////////////////////////////////////*/

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high");
        platformFeeBps = newFeeBps;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }

    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = pendingPlatformFees;
        require(amount > 0, "Nothing to withdraw");
        pendingPlatformFees = 0;
        (bool success, ) = feeRecipient.call{value: amount}("");
        require(success, "Withdraw failed");
        emit PlatformFeesWithdrawn(feeRecipient, amount);
    }

    function deactivateCreator(address creator) external onlyOwner {
        creators[creator].isActive = false;
    }

    function setVerifier(address newVerifier) external onlyOwner {
        require(newVerifier != address(0), "Invalid verifier");
        verifier = newVerifier;
    }
}
