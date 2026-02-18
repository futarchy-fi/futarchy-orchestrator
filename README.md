# Proposal Chain Deployment 🚀

Easily deploy and manage Futarchy markets on Gnosis Chain.

## 🛠️ Setup (First Run)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Compile Contracts:**
    ```bash
    npx hardhat compile
    ```

3.  **Configure Environment (`.env`):**
    Copy `.env.example` to `.env` and fill in your details:
    ```env
    RPC_URL=https://rpc.gnosischain.com
    PRIVATE_KEY=your_private_wallet_key
    ETHERSCAN_API_KEY=your_gnosisscan_key
    
    # Safety Limits (Max tokens to approve)
    COMPANY_TOKEN_APPROVAL_AMOUNT=0.02
    CURRENCY_TOKEN_APPROVAL_AMOUNT=1
    ```

4.  **Configure Market (`deploymentConfig.json`):**
    Set your market parameters (Name, Price, Liquidity) in this file.

---

## 🚀 Option 1: Deploy New System
**Deploys a new Orchestrator contract**, verifies it, and creates the first 6 pools.

```bash
npm run deployFutarchy
```

*Note: You may see a "Deprecated V1 Endpoint" warning during verification. This is normal; the script handles it automatically.*

---

## 🔄 Option 2: Run on Existing System
**Creates pools on an alreayd deployed Orchestrator**.

1.  Add the address to your `.env` file:
    ```env
    ORCHESTRATOR_ADDRESS=0xYourDeployedAddress
    ```

2.  Run the command:
    ```bash
    npm run createFutarchy
    ```

---

## ⛓️ Option 3: Deploy Futarchy Aggregator (Metadata System)
**Deploys the Metadata factories for Proposal, Organization, and Aggregators.**

1.  **Run Deployment Script:**
    ```bash
    npm run deployAggregator
    ```
    This script will deploy the factories and attempt to verify them.

2.  **Verification:**
    If the automatic verification fails, the recommended way to verify on Gnosis Chain is using **Sourcify** (enabled in our config).
    
    Get the addresses from the deployment output and run:

    ```bash
    npx hardhat verify --network gnosis <ProposalMetadataFactoryAddress>
    npx hardhat verify --network gnosis <OrganizationMetadataFactoryAddress>
    npx hardhat verify --network gnosis <FutarchyAggregatorFactoryAddress>
    ```

    *Note: We suggest using Sourcify as GnosisScan API v1 is deprecated.*

---

## 📍 Canonical deployed addresses (Gnosis Chain)

### Metadata stack (factory + implementations)
- **AggregatorFactory (Creator):** [`0xe7C27c932C80D30c9aaA30A856c0062208d269b4`](https://gnosisscan.io/address/0xe7C27c932C80D30c9aaA30A856c0062208d269b4)
- **OrganizationFactory:** [`0xCF3d0A6d7d85639fb012fA711Fef7286e6Db2808`](https://gnosisscan.io/address/0xCF3d0A6d7d85639fb012fA711Fef7286e6Db2808)
- **ProposalMetadataFactory:** [`0x899c70C37E523C99Bd61993ca434F1c1A82c106d`](https://gnosisscan.io/address/0x899c70C37E523C99Bd61993ca434F1c1A82c106d)
- **AggregatorImplementation:** [`0x7dA4DC7c7B941f863ae72ebc86546D3dC9922fe4`](https://gnosisscan.io/address/0x7dA4DC7c7B941f863ae72ebc86546D3dC9922fe4)
- **OrganizationImplementation:** [`0x2AcD9F4079faE754a26f820B01Ca29A1B4EF0f9d`](https://gnosisscan.io/address/0x2AcD9F4079faE754a26f820B01Ca29A1B4EF0f9d)
- **ProposalImplementation:** [`0x37b4E4672200d145AB68a5aD650BCaC8b4a5eAEF`](https://gnosisscan.io/address/0x37b4E4672200d145AB68a5aD650BCaC8b4a5eAEF)

### Orchestrator stack
- **FutarchyOrchestrator:** [`0xA280Bb8106d8804F4E9491E91f58100f1872A467`](https://gnosisscan.io/address/0xA280Bb8106d8804F4E9491E91f58100f1872A467)
- **FutarchyFactory:** [`0xa6cB18FCDC17a2B44E5cAd2d80a6D5942d30a345`](https://gnosisscan.io/address/0xa6cB18FCDC17a2B44E5cAd2d80a6D5942d30a345)
- **Adapter:** [`0x7495a583ba85875d59407781b4958ED6e0E1228f`](https://gnosisscan.io/address/0x7495a583ba85875d59407781b4958ED6e0E1228f)
- **PositionManager:** [`0x91fd594c46d8b01e62dbdebed2401dde01817834`](https://gnosisscan.io/address/0x91fd594c46d8b01e62dbdebed2401dde01817834)

### Helper
- **Algebra Helper:** [`0xe32bfb3DD8bA4c7F82dADc4982c04Afa90027EFb`](https://gnosisscan.io/address/0xe32bfb3DD8bA4c7F82dADc4982c04Afa90027EFb)
