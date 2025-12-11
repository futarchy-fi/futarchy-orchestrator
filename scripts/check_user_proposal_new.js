const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("🧪 Checking Arbitrage for Proposal (Latest Helper - Simulate)...");

    const HELPER_ADDRESS = "0xBF191FDd58E542230718701308d1B029b9E2231F"; // Verified Dual-Mode Helper
    const PROPOSAL_ADDRESS = "0x9590dAF4d5cd4009c3F9767C5E7668175cFd37CF";

    // Params
    // Spot: 107
    // Prob: 11.94% (0.1194)
    // Impact: 33.2% (0.332)

    const spot = ethers.parseEther("107");
    const prob = ethers.parseEther("0.1194");
    const impact = ethers.parseEther("0.332");

    console.log(`   Proposal: ${PROPOSAL_ADDRESS}`);
    console.log(`   Spot:     107`);
    console.log(`   Prob:     11.94%`);
    console.log(`   Impact:   33.2%`);

    // ABI updated for 'simulateArbitrage'
    const helperAbi = [
        "function simulateArbitrage(address proposal, uint256 spotPrice18, uint256 probability18, int256 impact18) external returns (tuple(tuple(address pool, address token0, address token1, string token0Symbol, string token1Symbol, bool isInverted, int256 amount0Delta, int256 amount1Delta, uint160 currentSqrtPrice, uint160 targetSqrtPrice, uint256 targetPriceHuman) yesPool, tuple(address pool, address token0, address token1, string token0Symbol, string token1Symbol, bool isInverted, int256 amount0Delta, int256 amount1Delta, uint160 currentSqrtPrice, uint160 targetSqrtPrice, uint256 targetPriceHuman) noPool))"
    ];

    const helper = new ethers.Contract(HELPER_ADDRESS, helperAbi, ethers.provider);

    console.log(`\n🔮 Calling simulateArbitrage (staticCall)...`);

    try {
        const result = await helper.simulateArbitrage.staticCall(PROPOSAL_ADDRESS, spot, prob, impact);

        console.log(`\n✅ Result Received!`);

        printPool(result.yesPool, "YES");
        printPool(result.noPool, "NO");

    } catch (e) {
        console.error("❌ Error:", e);
    }
}

function printPool(p, label) {
    if (p.pool === ethers.ZeroAddress) {
        console.log(`\n--- ${label} POOL: NOT FOUND ---`);
        return;
    }
    console.log(`\n--- ${label} POOL (${p.pool}) ---`);
    console.log(`   Token0:   ${p.token0} (${p.token0Symbol})`);
    console.log(`   Token1:   ${p.token1} (${p.token1Symbol})`);
    console.log(`   Inverted: ${p.isInverted}`);
    console.log(`   Target:   ${ethers.formatEther(p.targetPriceHuman)}`);

    const d0 = parseFloat(ethers.formatEther(p.amount0Delta));
    const d1 = parseFloat(ethers.formatEther(p.amount1Delta));

    if (d0 > 0) console.log(`   Action:   SELL ${d0.toFixed(4)} ${p.token0Symbol}`);
    if (d0 < 0) console.log(`   Action:   BUY  ${Math.abs(d0).toFixed(4)} ${p.token0Symbol}`);

    if (d1 > 0) console.log(`   Action:   SELL ${d1.toFixed(4)} ${p.token1Symbol}`);
    if (d1 < 0) console.log(`   Action:   BUY  ${Math.abs(d1).toFixed(4)} ${p.token1Symbol}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
