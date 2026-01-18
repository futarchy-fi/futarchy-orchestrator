const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
    console.log("📦 Starting ABI Export...");

    // 1. Read Deployed Addresses
    const addressesPath = path.join(__dirname, '..', 'deployed_addresses.json');
    if (!fs.existsSync(addressesPath)) {
        throw new Error("❌ deployed_addresses.json not found! Run deployment first.");
    }
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

    // 2. Define Mapping: Config Key -> Artifact Name
    const contracts = [
        { key: 'aggregatorFactory', artifact: 'FutarchyAggregatorFactory', filename: 'AggregatorFactory' },
        { key: 'organizationFactory', artifact: 'OrganizationMetadataFactory', filename: 'OrganizationFactory' },
        { key: 'proposalFactory', artifact: 'ProposalMetadataFactory', filename: 'ProposalFactory' },
        { key: 'aggregatorImplementation', artifact: 'FutarchyAggregatorsMetadata', filename: 'AggregatorMetadata' },
        { key: 'organizationImplementation', artifact: 'FutarchyOrganizationMetadata', filename: 'OrganizationMetadata' },
        { key: 'proposalImplementation', artifact: 'FutarchyProposalMetadata', filename: 'ProposalMetadata' }
    ];

    // 3. Prepare Output Directory
    // User requested "futarchyaggregator/deploy". We'll put it in contracts/futarchyaggregator/deploy
    const outputDir = path.join(__dirname, '..', 'contracts', 'futarchyaggregator', 'deploy');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 4. Extract and Write
    const summary = {};

    for (const c of contracts) {
        if (!addresses[c.key]) {
            console.warn(`⚠️  Address for ${c.key} not found.`);
            continue;
        }

        const artifact = await hre.artifacts.readArtifact(c.artifact);

        const exportData = {
            address: addresses[c.key],
            abi: artifact.abi,
            bytecode: artifact.bytecode, // Optional, but useful
            network: hre.network.name
        };

        const filePath = path.join(outputDir, `${c.filename}.json`);
        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

        summary[c.key] = addresses[c.key];
        console.log(`   ✅ Exported ${c.filename}.json`);
    }

    // Write a summary file with just addresses mapping
    fs.writeFileSync(path.join(outputDir, 'addresses.json'), JSON.stringify(summary, null, 2));
    console.log(`   ✅ Exported addresses.json`);

    console.log(`\n🎉 Export Complete! Files saved to: ${outputDir}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
