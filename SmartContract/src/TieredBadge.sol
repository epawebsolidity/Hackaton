// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TieredBadge
 * @notice ERC-1155 soulbound badge for subscription tiers
 * @dev Token ID = creatorIndex * 1000 + tierLevel
 */
contract TieredBadge is ERC1155, Ownable {
    using Strings for uint256;

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant TIER_BRONZE = 1;
    uint256 public constant TIER_SILVER = 2;
    uint256 public constant TIER_GOLD = 3;
    uint256 public constant CREATOR_MULTIPLIER = 1000;

    uint256 public constant LOYALTY_30_DAYS = 30 days;
    uint256 public constant LOYALTY_90_DAYS = 90 days;
    uint256 public constant LOYALTY_180_DAYS = 180 days;
    uint256 public constant LOYALTY_365_DAYS = 365 days;

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Tier {
        string name;
        uint256 price;
        string metadataURI;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 minHoldTime;
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    address public subscriptionManager;
    mapping(address => uint256[]) public creatorTiers;
    mapping(uint256 => Tier) public tierData;
    mapping(uint256 => mapping(address => uint256)) public mintTimestamps;
    mapping(uint256 => address) public creatorByIndex;
    mapping(address => uint256) public creatorIndex;
    string private _baseTokenURI;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event BadgeMinted(
        address indexed to,
        address indexed creator,
        uint256 indexed tokenId,
        uint256 tier
    );
    event BadgeBurned(
        address indexed from,
        address indexed creator,
        uint256 indexed tokenId,
        uint256 tier
    );
    event BadgeUpgraded(
        address indexed user,
        address indexed creator,
        uint256 fromTier,
        uint256 toTier
    );
    event TierCreated(
        address indexed creator,
        uint256 indexed tokenId,
        string name,
        uint256 price
    );
    event SubscriptionManagerUpdated(
        address indexed oldManager,
        address indexed newManager
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotAuthorized();
    error InvalidTier();
    error TransferNotAllowed();
    error ZeroAddress();
    error TierNotConfigured();
    error MaxSupplyReached();
    error MinHoldTimeNotMet();
    error CannotDowngrade();
    error TierAlreadyExists();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlySubscriptionManager() {
        if (msg.sender != subscriptionManager) revert NotAuthorized();
        _;
    }

    modifier validTier(uint256 tier) {
        if (tier < TIER_BRONZE || tier > TIER_GOLD) revert InvalidTier();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(string memory baseURI_) ERC1155(baseURI_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
    }

    /*//////////////////////////////////////////////////////////////
                                ADMIN
    //////////////////////////////////////////////////////////////*/

    function setSubscriptionManager(address manager) external onlyOwner {
        if (manager == address(0)) revert ZeroAddress();
        address oldManager = subscriptionManager;
        subscriptionManager = manager;
        emit SubscriptionManagerUpdated(oldManager, manager);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    function registerCreator(
        address creator,
        uint256 index
    ) external onlySubscriptionManager {
        if (creator == address(0)) revert ZeroAddress();
        creatorByIndex[index] = creator;
        creatorIndex[creator] = index;
    }

    function createTier(
        address creator,
        uint256 tier,
        string memory name,
        uint256 price,
        string memory metadataURI,
        uint256 maxSupply,
        uint256 minHoldTime
    ) external onlySubscriptionManager validTier(tier) {
        uint256 index = creatorIndex[creator];
        if (index == 0) revert NotAuthorized();

        uint256 tokenId = _calculateTokenId(index, tier);
        if (bytes(tierData[tokenId].name).length > 0)
            revert TierAlreadyExists();

        tierData[tokenId] = Tier({
            name: name,
            price: price,
            metadataURI: metadataURI,
            maxSupply: maxSupply,
            currentSupply: 0,
            minHoldTime: minHoldTime
        });

        creatorTiers[creator].push(tokenId);
        emit TierCreated(creator, tokenId, name, price);
    }

    /*//////////////////////////////////////////////////////////////
                            MINT / BURN
    //////////////////////////////////////////////////////////////*/

    function mintBadge(
        address _creator,
        uint256 _tierId
    ) external onlySubscriptionManager validTier(_tierId) {
        uint256 index = creatorIndex[_creator];
        if (index == 0) revert NotAuthorized();

        uint256 tokenId = _calculateTokenId(index, _tierId);
        Tier storage tier = tierData[tokenId];

        if (bytes(tier.name).length == 0) revert TierNotConfigured();
        if (tier.maxSupply > 0 && tier.currentSupply >= tier.maxSupply)
            revert MaxSupplyReached();

        address subscriber = tx.origin;
        tier.currentSupply++;
        mintTimestamps[tokenId][subscriber] = block.timestamp;
        _mint(subscriber, tokenId, 1, "");

        emit BadgeMinted(subscriber, _creator, tokenId, _tierId);
    }

    function mintBadgeTo(
        address to,
        address _creator,
        uint256 _tierId
    ) external onlySubscriptionManager validTier(_tierId) {
        if (to == address(0)) revert ZeroAddress();

        uint256 index = creatorIndex[_creator];
        if (index == 0) revert NotAuthorized();

        uint256 tokenId = _calculateTokenId(index, _tierId);
        Tier storage tier = tierData[tokenId];

        if (bytes(tier.name).length == 0) revert TierNotConfigured();
        if (tier.maxSupply > 0 && tier.currentSupply >= tier.maxSupply)
            revert MaxSupplyReached();

        tier.currentSupply++;
        mintTimestamps[tokenId][to] = block.timestamp;
        _mint(to, tokenId, 1, "");

        emit BadgeMinted(to, _creator, tokenId, _tierId);
    }

    function burnBadge(
        address from,
        address _creator,
        uint256 _tierId
    ) external onlySubscriptionManager validTier(_tierId) {
        uint256 index = creatorIndex[_creator];
        uint256 tokenId = _calculateTokenId(index, _tierId);

        tierData[tokenId].currentSupply--;
        delete mintTimestamps[tokenId][from];
        _burn(from, tokenId, 1);

        emit BadgeBurned(from, _creator, tokenId, _tierId);
    }

    function upgradeBadge(
        address _creator,
        uint256 _fromTier,
        uint256 _toTier
    ) external onlySubscriptionManager validTier(_fromTier) validTier(_toTier) {
        if (_toTier <= _fromTier) revert CannotDowngrade();

        uint256 index = creatorIndex[_creator];
        if (index == 0) revert NotAuthorized();

        uint256 fromTokenId = _calculateTokenId(index, _fromTier);
        uint256 toTokenId = _calculateTokenId(index, _toTier);
        address subscriber = tx.origin;

        Tier storage fromTier = tierData[fromTokenId];
        uint256 holdDuration = block.timestamp -
            mintTimestamps[fromTokenId][subscriber];
        if (holdDuration < fromTier.minHoldTime) revert MinHoldTimeNotMet();

        Tier storage toTier = tierData[toTokenId];
        if (bytes(toTier.name).length == 0) revert TierNotConfigured();
        if (toTier.maxSupply > 0 && toTier.currentSupply >= toTier.maxSupply)
            revert MaxSupplyReached();

        fromTier.currentSupply--;
        toTier.currentSupply++;
        delete mintTimestamps[fromTokenId][subscriber];
        mintTimestamps[toTokenId][subscriber] = block.timestamp;

        _burn(subscriber, fromTokenId, 1);
        _mint(subscriber, toTokenId, 1, "");

        emit BadgeUpgraded(subscriber, _creator, _fromTier, _toTier);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function getTierLevel(
        address _user,
        address _creator
    ) external view returns (uint256) {
        uint256 index = creatorIndex[_creator];
        if (index == 0) return 0;

        for (uint256 tier = TIER_GOLD; tier >= TIER_BRONZE; tier--) {
            uint256 tokenId = _calculateTokenId(index, tier);
            if (balanceOf(_user, tokenId) > 0) return tier;
        }
        return 0;
    }

    function calculateLoyaltyBonus(
        uint256 _holdDuration
    ) public pure returns (uint256) {
        if (_holdDuration >= LOYALTY_365_DAYS) return 100;
        else if (_holdDuration >= LOYALTY_180_DAYS) return 50;
        else if (_holdDuration >= LOYALTY_90_DAYS) return 25;
        else if (_holdDuration >= LOYALTY_30_DAYS) return 10;
        else return 0;
    }

    function getUserLoyaltyBonus(
        address _user,
        address _creator
    ) external view returns (uint256 bonus, uint256 holdDuration) {
        uint256 index = creatorIndex[_creator];
        if (index == 0) return (0, 0);

        for (uint256 tier = TIER_GOLD; tier >= TIER_BRONZE; tier--) {
            uint256 tokenId = _calculateTokenId(index, tier);
            if (balanceOf(_user, tokenId) > 0) {
                uint256 mintTime = mintTimestamps[tokenId][_user];
                if (mintTime > 0) {
                    holdDuration = block.timestamp - mintTime;
                    bonus = calculateLoyaltyBonus(holdDuration);
                    return (bonus, holdDuration);
                }
            }
        }
        return (0, 0);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        if (bytes(tierData[tokenId].metadataURI).length > 0) {
            return tierData[tokenId].metadataURI;
        }
        return
            string(
                abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json")
            );
    }

    function calculateTokenId(
        uint256 _creatorIndex,
        uint256 tier
    ) external pure returns (uint256) {
        return _calculateTokenId(_creatorIndex, tier);
    }

    function getCreatorFromTokenId(
        uint256 tokenId
    ) external pure returns (uint256) {
        return tokenId / CREATOR_MULTIPLIER;
    }

    function getTierFromTokenId(
        uint256 tokenId
    ) external pure returns (uint256) {
        return tokenId % CREATOR_MULTIPLIER;
    }

    function getCreatorTiers(
        address creator
    ) external view returns (uint256[] memory) {
        return creatorTiers[creator];
    }

    function getTierData(uint256 tokenId) external view returns (Tier memory) {
        return tierData[tokenId];
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL
    //////////////////////////////////////////////////////////////*/

    function _calculateTokenId(
        uint256 _creatorIndex,
        uint256 tier
    ) internal pure returns (uint256) {
        return _creatorIndex * CREATOR_MULTIPLIER + tier;
    }

    /*//////////////////////////////////////////////////////////////
                            SOULBOUND
    //////////////////////////////////////////////////////////////*/

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        if (from != address(0) && to != address(0)) revert TransferNotAllowed();
        super._update(from, to, ids, values);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public virtual override {
        if (operator != subscriptionManager) revert TransferNotAllowed();
        super.setApprovalForAll(operator, approved);
    }
}
