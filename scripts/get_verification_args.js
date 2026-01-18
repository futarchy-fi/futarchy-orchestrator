const hre = require("hardhat");

async function main() {
    const ORG_FACTORY_ADDR = "0x836f486511b2247ccbf35b8eac87137860c18dbe";
    const AGG_FACTORY_ADDR = "0x2Ff74baC41352D0B188398eB014E22d21a606544";

    console.log("🔍 Reading Factory State...");

    // 1. Organization Factory
    const OrgFactory = await hre.ethers.getContractAt("OrganizationMetadataFactory", ORG_FACTORY_ADDR);
    const orgImpl = await OrgFactory.implementation();
    const proposalImpl = await OrgFactory.proposalImplementation();

    console.log(`\n🏭 Organization Factory (${ORG_FACTORY_ADDR})`);
    console.log(`   - Implementation: ${orgImpl}`);
    console.log(`   - Proposal Impl:  ${proposalImpl}`);

    // 2. Aggregator Factory
    const AggFactory = await hre.ethers.getContractAt("FutarchyAggregatorFactory", AGG_FACTORY_ADDR);
    const aggImpl = await AggFactory.implementation();
    const aggOrgImpl = await AggFactory.organizationImplementation();
    const aggPropImpl = await AggFactory.proposalImplementation();

    console.log(`\n🏭 Aggregator Factory (${AGG_FACTORY_ADDR})`);
    console.log(`   - Implementation:      ${aggImpl}`);
    console.log(`   - Organization Impl:   ${aggOrgImpl}`);
    console.log(`   - Proposal Impl:       ${aggPropImpl}`);

    console.log("\n✅ Verification Commands:");
    console.log(`npx hardhat verify --network gnosis ${ORG_FACTORY_ADDR} "${orgImpl}" "${proposalImpl}"`);
    console.log(`npx hardhat verify --network gnosis ${AGG_FACTORY_ADDR} "${aggImpl}" "${aggOrgImpl}" "${aggPropImpl}"`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
