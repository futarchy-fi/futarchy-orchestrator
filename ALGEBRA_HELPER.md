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
*   **Usage**: Mandatory for executing the actual arbitrage transaction to ensure exact precision.

### ⚠️ Important: Simulation vs Execution

The `simulateArbitrage` function is "Write" because it *can* change state. However, for arbitrage calculation, we use **`staticCall`**:

*   **What is `staticCall`?**: It asks the Ethereum node to *pretend* to run the transaction and return the result, **without** broadcasting it to the network or spending gas.
*   **Why use it?**: It allows us to use complex on-chain logic (swaps, oracle checks) to get a precise answer without paying for a transaction.
*   **Limitations**:
    1.  **Spot Price Latency**: The result is valid for the *current* block. If a trade happens in the pool right after you simulate, the required amount might change slightly.
    2.  **RPC Limits**: Some RPC providers cap the gas limit for simulations. (Not usually an issue for this contract).
    3.  **Explorer UI**: On Etherscan/GnosisScan, you **CANNOT** easily `staticCall` a write function from the UI. You must use a script (like `ethers.js` or `foundry`). Clicking "Write" on the explorer will prompt a real transaction (which will revert).

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
