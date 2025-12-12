const { getSwapQuote } = require("./FutarchyQuoteHelper");
const { ethers } = require("hardhat");

async function main() {
    console.log("📚 Testing Futarchy Quote Helper Lib...");

    // Proposal: 0x9590... (Known Valid)
    const PROPOSAL = "0x9590dAF4d5cd4009c3F9767C5E7668175cFd37CF";

    // Selling 0.1 Company Token (Outcome)
    const params = {
        proposal: PROPOSAL,
        amount: "0.1",
        isYesPool: true,
        isInputCompanyToken: true,
        slippagePercentage: 0.03 // 3%
    };

    try {
        const quote = await getSwapQuote(params, ethers.provider);
        console.log("\n✅ Quote Received:");
        console.log("-------------------");
        console.log("Expected Receive:", quote.expectedReceive);
        console.log("Min Receive:     ", quote.minReceive);
        console.log("Exec Price:      ", quote.executionPrice);
        console.log("Current Price:   ", quote.currentPoolPrice);
        console.log("Price After:     ", quote.priceAfter);
        console.log("Start SqrtP:     ", quote.startSqrtPrice);
        console.log("Raw AmountOut:   ", quote.raw.amountOut.toString());

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
