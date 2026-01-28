// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TieredBadge.sol";
import "./SubscriptionManager.sol";

/**
 * @title GatedContent
 * @notice Handles exclusive content access and viral conversion mechanism
 * @dev Stores IPFS hashes only. Vote weights: Gold=3, Silver=2, Bronze=1
 */
contract GatedContent is Ownable {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct ExclusivePost {
        uint256 postId;
        address creator;
        uint256 minTierRequired;
        string contentHash;
        uint256 createdAt;
        bool isPublic;
        uint256 viralScore;
        uint256 conversionThreshold;
        uint256 currentVotes;
    }

    struct VoterInfo {
        bool hasVoted;
        uint256 voteOrder;
        uint256 votedAt;
        uint256 tierAtVote;
        uint256 rewardClaimed;
    }

    struct EarlyVoterReward {
        address voter;
        uint256 rewardAmount;
        bool claimed;
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant BRONZE_VOTE_WEIGHT = 1;
    uint256 public constant SILVER_VOTE_WEIGHT = 2;
    uint256 public constant GOLD_VOTE_WEIGHT = 3;
    uint256 public constant EARLY_VOTER_SLOTS = 3;
    uint256 public constant EARLY_VOTER_REWARD_BPS = 100;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    TieredBadge public immutable badge;
    SubscriptionManager public immutable subscriptionManager;
    uint256 public postCount;

    mapping(uint256 => ExclusivePost) public exclusivePosts;
    mapping(address => uint256[]) public creatorPosts;
    mapping(address => mapping(uint256 => bool)) public votes;
    mapping(uint256 => mapping(address => VoterInfo)) public voterInfo;
    mapping(uint256 => address[]) public postVoters;
    mapping(uint256 => EarlyVoterReward[]) public earlyVoterRewards;
    mapping(uint256 => uint256) public postRewardPool;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event PostCreated(
        uint256 indexed postId,
        address indexed creator,
        uint256 minTierRequired,
        uint256 conversionThreshold,
        string contentHash
    );
    event VoteCast(
        uint256 indexed postId,
        address indexed voter,
        uint256 voteOrder,
        uint256 voterTier,
        uint256 viralScore,
        uint256 currentVotes
    );
    event PostWentPublic(
        uint256 indexed postId,
        uint256 timestamp,
        uint256 totalVotes,
        uint256 finalViralScore
    );
    event VoterRewardDistributed(
        uint256 indexed postId,
        address indexed voter,
        uint256 rewardAmount
    );
    event RewardClaimed(
        uint256 indexed postId,
        address indexed voter,
        uint256 amount
    );
    event PostDeleted(uint256 indexed postId, address indexed creator);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotCreator();
    error NotSubscribed();
    error InsufficientTier();
    error AlreadyVoted();
    error PostNotFound();
    error AlreadyPublic();
    error InvalidThreshold();
    error Unauthorized();
    error NoRewardToClaim();
    error RewardAlreadyClaimed();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _badge,
        address _subscriptionManager
    ) Ownable(msg.sender) {
        badge = TieredBadge(_badge);
        subscriptionManager = SubscriptionManager(_subscriptionManager);
    }

    /*//////////////////////////////////////////////////////////////
                          CREATOR FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createExclusivePost(
        uint256 _minTier,
        string memory _contentHash,
        uint256 _threshold
    ) external returns (uint256) {
        SubscriptionManager.Creator memory creator = subscriptionManager
            .getCreator(msg.sender);
        if (creator.wallet == address(0)) revert NotCreator();
        if (_minTier < 1 || _minTier > 3) revert InsufficientTier();
        if (_threshold == 0) revert InvalidThreshold();

        postCount++;
        uint256 postId = postCount;

        exclusivePosts[postId] = ExclusivePost({
            postId: postId,
            creator: msg.sender,
            minTierRequired: _minTier,
            contentHash: _contentHash,
            createdAt: block.timestamp,
            isPublic: false,
            viralScore: 0,
            conversionThreshold: _threshold,
            currentVotes: 0
        });

        creatorPosts[msg.sender].push(postId);

        emit PostCreated(
            postId,
            msg.sender,
            _minTier,
            _threshold,
            _contentHash
        );
        return postId;
    }

    function deletePost(uint256 postId) external {
        ExclusivePost storage post = exclusivePosts[postId];
        if (post.creator == address(0)) revert PostNotFound();
        if (post.creator != msg.sender) revert Unauthorized();
        delete exclusivePosts[postId];
        emit PostDeleted(postId, msg.sender);
    }

    function fundRewardPool(uint256 postId) external payable {
        ExclusivePost storage post = exclusivePosts[postId];
        if (post.creator == address(0)) revert PostNotFound();
        postRewardPool[postId] += msg.value;
    }

    /*//////////////////////////////////////////////////////////////
                        SUBSCRIBER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function voteForPublicRelease(uint256 _postId) external {
        ExclusivePost storage post = exclusivePosts[_postId];

        if (post.creator == address(0)) revert PostNotFound();
        if (post.isPublic) revert AlreadyPublic();
        if (votes[msg.sender][_postId]) revert AlreadyVoted();
        if (!hasAccess(msg.sender, _postId)) revert InsufficientTier();

        uint256 voterTier = badge.getTierLevel(msg.sender, post.creator);
        uint256 voteWeight = _getVoteWeight(voterTier);

        votes[msg.sender][_postId] = true;

        uint256 voteOrder = post.currentVotes + 1;
        post.currentVotes = voteOrder;
        post.viralScore += voteWeight;

        voterInfo[_postId][msg.sender] = VoterInfo({
            hasVoted: true,
            voteOrder: voteOrder,
            votedAt: block.timestamp,
            tierAtVote: voterTier,
            rewardClaimed: 0
        });

        postVoters[_postId].push(msg.sender);

        emit VoteCast(
            _postId,
            msg.sender,
            voteOrder,
            voterTier,
            post.viralScore,
            post.currentVotes
        );

        if (post.currentVotes >= post.conversionThreshold) {
            _convertToPublic(_postId);
        }
    }

    function claimVoterReward(uint256 postId) external {
        ExclusivePost storage post = exclusivePosts[postId];
        if (post.creator == address(0)) revert PostNotFound();
        if (!post.isPublic) revert PostNotFound();

        VoterInfo storage info = voterInfo[postId][msg.sender];
        if (!info.hasVoted) revert NoRewardToClaim();
        if (info.voteOrder > EARLY_VOTER_SLOTS) revert NoRewardToClaim();

        EarlyVoterReward[] storage rewards = earlyVoterRewards[postId];
        for (uint i = 0; i < rewards.length; i++) {
            if (rewards[i].voter == msg.sender) {
                if (rewards[i].claimed) revert RewardAlreadyClaimed();

                uint256 amount = rewards[i].rewardAmount;
                rewards[i].claimed = true;
                info.rewardClaimed = amount;

                (bool success, ) = msg.sender.call{value: amount}("");
                require(success, "Transfer failed");

                emit RewardClaimed(postId, msg.sender, amount);
                return;
            }
        }
        revert NoRewardToClaim();
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function hasAccess(
        address _user,
        uint256 _postId
    ) public view returns (bool) {
        ExclusivePost storage post = exclusivePosts[_postId];
        if (post.creator == address(0)) return false;
        if (post.isPublic) return true;
        if (_user == post.creator) return true;

        bool hasActiveSub = subscriptionManager.hasActiveSubscription(
            _user,
            post.creator
        );
        if (!hasActiveSub) return false;

        uint256 userTier = badge.getTierLevel(_user, post.creator);
        return userTier >= post.minTierRequired;
    }

    function getPost(
        uint256 postId
    ) external view returns (ExclusivePost memory) {
        return exclusivePosts[postId];
    }

    function getCreatorPosts(
        address creator
    ) external view returns (uint256[] memory) {
        return creatorPosts[creator];
    }

    function getVoterInfo(
        uint256 postId,
        address voter
    ) external view returns (VoterInfo memory) {
        return voterInfo[postId][voter];
    }

    function getPostVoters(
        uint256 postId
    ) external view returns (address[] memory) {
        return postVoters[postId];
    }

    function getEarlyVoters(
        uint256 postId
    ) external view returns (address[] memory) {
        address[] storage allVoters = postVoters[postId];
        uint256 count = allVoters.length < EARLY_VOTER_SLOTS
            ? allVoters.length
            : EARLY_VOTER_SLOTS;

        address[] memory early = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            early[i] = allVoters[i];
        }
        return early;
    }

    function getVotingProgress(
        uint256 postId
    )
        external
        view
        returns (
            uint256 currentVotes,
            uint256 threshold,
            uint256 viralScore,
            uint256 percentComplete
        )
    {
        ExclusivePost storage post = exclusivePosts[postId];
        currentVotes = post.currentVotes;
        threshold = post.conversionThreshold;
        viralScore = post.viralScore;

        if (threshold == 0) {
            percentComplete = 0;
        } else {
            percentComplete = (currentVotes * 100) / threshold;
            if (percentComplete > 100) percentComplete = 100;
        }
    }

    function getEarlyVoterRewards(
        uint256 postId
    ) external view returns (EarlyVoterReward[] memory) {
        return earlyVoterRewards[postId];
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL
    //////////////////////////////////////////////////////////////*/

    function _convertToPublic(uint256 _postId) internal {
        ExclusivePost storage post = exclusivePosts[_postId];
        post.isPublic = true;
        _distributeVoterRewards(_postId);
        emit PostWentPublic(
            _postId,
            block.timestamp,
            post.currentVotes,
            post.viralScore
        );
    }

    function _distributeVoterRewards(uint256 _postId) internal {
        address[] storage allVoters = postVoters[_postId];
        uint256 rewardPool = postRewardPool[_postId];

        if (rewardPool == 0 || allVoters.length == 0) return;

        uint256[3] memory shares = [uint256(5000), 3000, 2000];
        uint256 voterCount = allVoters.length < EARLY_VOTER_SLOTS
            ? allVoters.length
            : EARLY_VOTER_SLOTS;

        for (uint256 i = 0; i < voterCount; i++) {
            address voter = allVoters[i];
            uint256 rewardAmount = (rewardPool * shares[i]) / 10000;

            earlyVoterRewards[_postId].push(
                EarlyVoterReward({
                    voter: voter,
                    rewardAmount: rewardAmount,
                    claimed: false
                })
            );

            emit VoterRewardDistributed(_postId, voter, rewardAmount);
        }
    }

    function _getVoteWeight(uint256 tier) internal pure returns (uint256) {
        if (tier == 3) return GOLD_VOTE_WEIGHT;
        if (tier == 2) return SILVER_VOTE_WEIGHT;
        return BRONZE_VOTE_WEIGHT;
    }

    /*//////////////////////////////////////////////////////////////
                            BATCH VIEWS
    //////////////////////////////////////////////////////////////*/

    function getPosts(
        uint256[] calldata postIds
    ) external view returns (ExclusivePost[] memory) {
        ExclusivePost[] memory result = new ExclusivePost[](postIds.length);
        for (uint256 i = 0; i < postIds.length; i++) {
            result[i] = exclusivePosts[postIds[i]];
        }
        return result;
    }

    function hasAccessBatch(
        address user,
        uint256[] calldata postIds
    ) external view returns (bool[] memory) {
        bool[] memory result = new bool[](postIds.length);
        for (uint256 i = 0; i < postIds.length; i++) {
            result[i] = hasAccess(user, postIds[i]);
        }
        return result;
    }
}
