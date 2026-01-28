// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TieredBadge.sol";
import "../src/SubscriptionManager.sol";
import "../src/GatedContent.sol";

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                         DEPLOYMENT SCRIPT                                ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Script ini deploy semua contracts ke network.                           ║
 * ║                                                                          ║
 * ║  🔄 DEPLOYMENT ORDER (IMPORTANT!):                                       ║
 * ║  ─────────────────────────────────                                       ║
 * ║  1. Deploy TieredBadge                                                   ║
 * ║  2. Deploy SubscriptionManager (needs badge address)                     ║
 * ║  3. Deploy GatedContent (needs badge + manager addresses)                ║
 * ║  4. Set SubscriptionManager as authorized minter in badge                ║
 * ║                                                                          ║
 * ║  ⚠️ ORDER MATTERS!                                                       ║
 * ║  Kalau deploy salah urutan, contracts gak bisa interact.                 ║
 * ║                                                                          ║
 * ║  📋 USAGE:                                                               ║
 * ║  ─────────                                                               ║
 * ║  1. Create .env file dengan private key                                  ║
 * ║  2. Run: forge script script/Deploy.s.sol --rpc-url <URL> --broadcast   ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
contract DeployScript is Script {
    // Deployed contract addresses (will be set during deployment)
    TieredBadge public badge;
    SubscriptionManager public subscriptionManager;
    GatedContent public gatedContent;

    /**
     * @dev Main deployment function
     *
     * 💡 vm.startBroadcast() / vm.stopBroadcast()
     * Foundry's way to say "everything between these is a real transaction"
     *
     * 📝 LOGGING:
     * console.log akan print ke terminal saat deployment
     * Berguna untuk track addresses
     */
    function run() external {
        // Get deployer's private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("==============================================");
        console.log("Base Creator Subscriptions - Deployment");
        console.log("==============================================");
        console.log("Deployer:", deployer);
        console.log("");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // ═══════════════════════════════════════════════════════════════════
        // STEP 1: Deploy TieredBadge
        // ═══════════════════════════════════════════════════════════════════

        /**
         * @dev Base URI untuk metadata
         *
         * 💡 FOR HACKATHON/DEV:
         * Pake placeholder URI dulu, bisa di-update later.
         * Production: point ke actual IPFS gateway
         */
        string memory baseURI = "ipfs://QmPlaceholder/";

        badge = new TieredBadge(baseURI);
        console.log("1. TieredBadge deployed at:", address(badge));

        // ═══════════════════════════════════════════════════════════════════
        // STEP 2: Deploy SubscriptionManager
        // ═══════════════════════════════════════════════════════════════════

        /**
         * @dev Fee recipient = deployer untuk simplicity
         * Production: bisa set ke multisig/treasury
         *
         * Verifier = deployer for now, can be updated via setVerifier()
         * This is the address that signs follower verification proofs
         */
        subscriptionManager = new SubscriptionManager(
            address(badge),
            deployer, // feeRecipient
            deployer // verifier (backend signer for follower verification)
        );
        console.log(
            "2. SubscriptionManager deployed at:",
            address(subscriptionManager)
        );

        // ═══════════════════════════════════════════════════════════════════
        // STEP 3: Deploy GatedContent
        // ═══════════════════════════════════════════════════════════════════

        gatedContent = new GatedContent(
            address(badge),
            address(subscriptionManager)
        );
        console.log("3. GatedContent deployed at:", address(gatedContent));

        // ═══════════════════════════════════════════════════════════════════
        // STEP 4: Configure TieredBadge
        // ═══════════════════════════════════════════════════════════════════

        /**
         * @dev CRITICAL: Set SubscriptionManager as authorized minter
         *
         * ⚠️ JANGAN LUPA STEP INI!
         * Tanpa ini, SubscriptionManager gabisa mint badges
         */
        badge.setSubscriptionManager(address(subscriptionManager));
        console.log("4. SubscriptionManager set as authorized minter");

        // Stop broadcasting
        vm.stopBroadcast();

        // ═══════════════════════════════════════════════════════════════════
        // DEPLOYMENT SUMMARY
        // ═══════════════════════════════════════════════════════════════════

        console.log("");
        console.log("==============================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("==============================================");
        console.log("");
        console.log("Contract Addresses:");
        console.log("  TieredBadge:          ", address(badge));
        console.log("  SubscriptionManager:  ", address(subscriptionManager));
        console.log("  GatedContent:         ", address(gatedContent));
        console.log("");
        console.log("Next Steps:");
        console.log("  1. Verify contracts on BaseScan");
        console.log("  2. Update frontend with these addresses");
        console.log("  3. Test the flow!");
        console.log("");
    }
}
