const hre = require("hardhat");

async function main() {
    const ORG_ADDR = "0x836f486511b2247ccbf35b8eac87137860c18dbe";
    const AGG_ADDR = "0x2Ff74baC41352D0B188398eB014E22d21a606544";

    console.log("🔍 Checking code at addresses...");

    const codeOrg = await hre.ethers.provider.getCode(ORG_ADDR);
    console.log(`Org Address Code Length: ${codeOrg.length}`);
    if (codeOrg === '0x') console.log("⚠️  WARNING: No code at Org Address!");

    const codeAgg = await hre.ethers.provider.getCode(AGG_ADDR);
    console.log(`Agg Address Code Length: ${codeAgg.length}`);
    if (codeAgg === '0x') console.log("⚠️  WARNING: No code at Agg Address!");

    if (codeOrg.length > 2) {
        try {
            const OrgFactory = await hre.ethers.getContractAt("OrganizationMetadataFactory", ORG_ADDR);
            console.log("Attempting to call implementation()...");
            const imp = await OrgFactory.implementation();
            console.log("Implementation:", imp);
        } catch (e) {
            console.log("Failed to call implementation() on OrgFactory:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
