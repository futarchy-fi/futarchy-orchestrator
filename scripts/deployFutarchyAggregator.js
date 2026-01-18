const hre = require("hardhat");
const { ethers } = hre;
const { execSync } = require('child_process');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`\n🚀 Deploying Futarchy Aggregator (Clones) with: ${deployer.address}`);

    const gasConfig = {
        gasPrice: 5000000000,
    };

    // 1. Deploy Implementations
    console.log("\n1️⃣  Deploying Implementations...");

    const ProposalMeta = await ethers.getContractFactory("FutarchyProposalMetadata");
    const proposalImpl = await ProposalMeta.deploy(gasConfig);
    await proposalImpl.waitForDeployment();
    console.log(`   ✅ Proposal Impl: ${await proposalImpl.getAddress()}`);

    const OrgMeta = await ethers.getContractFactory("FutarchyOrganizationMetadata");
    const orgImpl = await OrgMeta.deploy(gasConfig);
    await orgImpl.waitForDeployment();
    console.log(`   ✅ Organization Impl: ${await orgImpl.getAddress()}`);

    const AggMeta = await ethers.getContractFactory("FutarchyAggregatorsMetadata");
    const aggImpl = await AggMeta.deploy(gasConfig);
    await aggImpl.waitForDeployment();
    console.log(`   ✅ Aggregator Impl: ${await aggImpl.getAddress()}`);

    // 2. Deploy Factories
    console.log("\n2️⃣  Deploying Factories...");

    const ProposalFactory = await ethers.getContractFactory("ProposalMetadataFactory");
    const proposalFactory = await ProposalFactory.deploy(await proposalImpl.getAddress(), gasConfig);
    await proposalFactory.waitForDeployment();
    const proposalFactoryAddr = await proposalFactory.getAddress();
    console.log(`   ✅ ProposalFactory: ${proposalFactoryAddr}`);

    const OrgFactory = await ethers.getContractFactory("OrganizationMetadataFactory");
    // Pass Organization Impl AND Proposal Impl
    const orgFactory = await OrgFactory.deploy(await orgImpl.getAddress(), await proposalImpl.getAddress(), gasConfig);
    await orgFactory.waitForDeployment();
    const orgFactoryAddr = await orgFactory.getAddress();
    console.log(`   ✅ OrganizationFactory: ${orgFactoryAddr}`);

    const AggFactory = await ethers.getContractFactory("FutarchyAggregatorFactory");
    // Pass Aggregator Impl AND Organization Impl AND Proposal Impl
    const aggFactory = await AggFactory.deploy(
        await aggImpl.getAddress(),
        await orgImpl.getAddress(),
        await proposalImpl.getAddress(),
        gasConfig
    );
    await aggFactory.waitForDeployment();
    const aggFactoryAddr = await aggFactory.getAddress();
    console.log(`   ✅ AggregatorFactory: ${aggFactoryAddr}`);

    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(r => setTimeout(r, 30000));

    // 3. Verify
    console.log("\n3️⃣  Verifying Implementations & Factories...");

    const verify = async (address, name, args = []) => {
        try {
            console.log(`   Verifying ${name}...`);
            const argsStr = args.length > 0 ? args.map(a => `"${a}"`).join(' ') : "";
            execSync(`npx hardhat verify --network gnosis ${address} ${argsStr}`, { stdio: 'inherit' });
        } catch (e) {
            console.error(`   ⚠️ Verification failed for ${name}:`, e.message);
        }
    };

    // Verify Impls (No args)
    await verify(await proposalImpl.getAddress(), "Proposal Impl");
    await verify(await orgImpl.getAddress(), "Organization Impl");
    await verify(await aggImpl.getAddress(), "Aggregator Impl");

    // Verify Factories (With Impl arg)
    await verify(proposalFactoryAddr, "ProposalFactory", [await proposalImpl.getAddress()]);
    await verify(orgFactoryAddr, "OrganizationFactory", [await orgImpl.getAddress(), await proposalImpl.getAddress()]);
    await verify(aggFactoryAddr, "AggregatorFactory", [
        await aggImpl.getAddress(),
        await orgImpl.getAddress(),
        await proposalImpl.getAddress()
    ]);

    console.log("\n✅ Deployment Complete!");

    const deployments = {
        proposalImplementation: await proposalImpl.getAddress(),
        organizationImplementation: await orgImpl.getAddress(),
        aggregatorImplementation: await aggImpl.getAddress(),
        proposalFactory: proposalFactoryAddr,
        organizationFactory: orgFactoryAddr,
        aggregatorFactory: aggFactoryAddr
    };

    const fs = require("fs");
    fs.writeFileSync("deployed_addresses.json", JSON.stringify(deployments, null, 2));
    console.log("📝 Saved addresses to deployed_addresses.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
