const hre = require("hardhat");

async function main() {
    // Factory Addresses provided by user
    const ORG_FACTORY = "0x08e31d771031711263b13A01D2dBb518f43Ef3f4";
    const PROPOSAL_FACTORY = "0xE518ea78F743fcC41fEad0f92C1792A0aD7999E3";

    console.log("🔍 Fetching Implementation addresses...");

    const OrgFactory = await hre.ethers.getContractAt("OrganizationMetadataFactory", ORG_FACTORY);
    const orgImpl = await OrgFactory.implementation();
    console.log(`\n✅ Organization Implementation: ${orgImpl}`);

    const ProposalFactory = await hre.ethers.getContractAt("ProposalMetadataFactory", PROPOSAL_FACTORY);
    const proposalImpl = await ProposalFactory.implementation();
    console.log(`✅ Proposal Implementation:      ${proposalImpl}`);

    console.log("\n👇 USE THESE ADDRESSES:");
    console.log("1. Call aggregator.setOrganizationImplementation('" + orgImpl + "')");
    console.log("2. Call organization.setProposalImplementation('" + proposalImpl + "')");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
