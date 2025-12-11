# Algebra Arbitrage Helper

This project includes a specialized helper contract to calculate precise precision adjustments for Algebra (Swapr) pools in the Futarchy ecosystem.

## 🚀 Deployed Contract
**Network:** Gnosis Chain  
**Address:** `0xBF191FDd58E542230718701308d1B029b9E2231F`  
**Verified:** [Sourcify](https://repo.sourcify.dev/contracts/full_match/100/0xBF191FDd58E542230718701308d1B029b9E2231F/)

---

## 📖 How to Use

The contract provides TWO ways to calculate arbitrage depending on your needs:

### 1. READ Mode (Safe, Fast, Approximate)
Use the `estimateArbitrage` function. This is a **View** function (Read-Only).

*   **Pros**: Instant, No Gas/Simulation required, Safe to call on Etherscan "Read Contract".
*   **Cons**: Uses active liquidity math. If the price move is large and crosses tick boundaries, the result might be slightly off (approximate).
*   **Usage**: Great for UI display or quick checks.

### 2. WRITE/SIMULATE Mode (Precise)
Use the `simulateArbitrage` function. This is a **State-Changing** function that MUST be called via `staticCall` (Simulation).

*   **Pros**: 100% Precise. It simulates the actual swap on-chain and catches the result. Handles all tick crossings and fees perfectly.
*   **Cons**: Must be simulated. If executed as a transaction, it will Revert (by design). Shows up in "Write Contract" tab.
*   **Usage**: Mandatory for executing the actual arbitrage transaction to ensure exact precision.

---

## 🛠 Parameters
Both functions accept the same inputs:

1.  `proposal` (address): The Futarchy Proposal address (e.g. `0x...`).
2.  `spotPrice18` (uint256): The target Spot Price scaled by 1e18 (e.g. `100 ether` for 100.0).
3.  `probability18` (uint256): Event Probability scaled by 1e18 (e.g. `0.5 ether` for 50%).
4.  `impact18` (int256): Market Impact scaled by 1e18 (e.g. `-0.01 ether` for -1%). **Can be Negative**.

## 🧮 Logic & Math
The helper automatically:
1.  Identifies YES and NO pools from the Proposal.
2.  Determines if tokens are Inverted (Asset/Currency vs Currency/Asset).
3.  Calculates Target Prices:
    *   **YES**: `Spot * (1 + Impact * (1 - Prob))`
    *   **NO**: `Spot * (1 - Impact * Prob)`
4.  **Edge Cases**:
    *   If `Prob == 0`: Skips YES pool (Price valid only if event possible).
    *   If `Prob == 1`: Skips NO pool.

## 📦 Return Data
The functions return a `ArbitrageResult` struct containing:
*   `pool` (address)
*   `amount0Delta` (int256): Amount of Token0 the POOL receives.
    *   `> 0`: User **SELLS** Token0 to Pool.
    *   `< 0`: User **BUYS** Token0 from Pool.
*   `amount1Delta` (int256): Amount of Token1 the POOL receives.
*   `targetPriceHuman`: The calculated target price (for verification).

---

## 💻 Example Script
See `scripts/check_user_proposal_new.js` for a working example using `ethers.js`.

```javascript
const helper = await ethers.getContractAt("FutarchyArbitrageHelper", "0xBF191FDd58E542230718701308d1B029b9E2231F");
// Use staticCall for Simulation Mode!
const result = await helper.simulateArbitrage.staticCall(proposal, spot, prob, impact);
```
