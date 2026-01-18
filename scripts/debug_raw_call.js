const hre = require("hardhat");

async function main() {
    const ORG_ADDR = "0x836f486511b2247ccbf35b8eac87137860c18dbe";

    // Function selectors
    // implementation(): 0x5c60da1b
    // proposalImplementation(): 0xe350411d
    // organizationImplementation(): 0x6e2c3943 (guess, need to check)

    const ifaceOrg = new hre.ethers.Interface([
        "function implementation() external view returns (address)",
        "function proposalImplementation() external view returns (address)"
    ]);

    console.log("Calling OrganizationFactory...");

    try {
        const implData = ifaceOrg.encodeFunctionData("implementation");
        const implRes = await hre.ethers.provider.call({ to: ORG_ADDR, data: implData });
        console.log("Implementation Raw:", implRes);
        console.log("Implementation Decoded:", ifaceOrg.decodeFunctionResult("implementation", implRes));
    } catch (e) {
        console.log("Impl call failed:", e.message);
    }

    // Aggregator Factory
    const AGG_ADDR = "0x2Ff74baC41352D0B188398eB014E22d21a606544";
    const ifaceAgg = new hre.ethers.Interface([
        "function implementation() external view returns (address)",
        "function organizationImplementation() external view returns (address)",
        "function proposalImplementation() external view returns (address)"
    ]);

    console.log("\nCalling AggregatorFactory...");
    try {
        const i = await hre.ethers.provider.call({ to: AGG_ADDR, data: ifaceAgg.encodeFunctionData("implementation") });
        console.log("Agg Impl:", ifaceAgg.decodeFunctionResult("implementation", i)[0]);

        const o = await hre.ethers.provider.call({ to: AGG_ADDR, data: ifaceAgg.encodeFunctionData("organizationImplementation") });
        console.log("Agg Org Impl:", ifaceAgg.decodeFunctionResult("organizationImplementation", o)[0]);

        const p = await hre.ethers.provider.call({ to: AGG_ADDR, data: ifaceAgg.encodeFunctionData("proposalImplementation") });
        console.log("Agg Prop Impl:", ifaceAgg.decodeFunctionResult("proposalImplementation", p)[0]);
    } catch (e) {
        console.log("Agg call failed:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
