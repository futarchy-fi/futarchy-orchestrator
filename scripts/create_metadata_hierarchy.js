const hre = require("hardhat");
const { ethers } = hre;

// Clones-based Factories (Deployed just now)
const FACTORIES = {
    PROPOSAL: "0x8E8DBe97B2B3B6fb77F30727F3dCcA085C9755D9",
    ORGANIZATION: "0x2Fa9318E1e29d7435EE9d23B687b10a9CDDD0d9e",
    AGGREGATOR: "0x8ffCf8546DE700FB2Ceab4709fB26ee05A19652B"
};

const DATA = {
    PROPOSAL_ADDR: "0x7e9Fc0C3d6C1619d4914556ad2dEe6051Ce68418",
    QUESTION: "What will be the price of GNO",
    EVENT: "if its price is >= 130 sDAI?",
    DESCRIPTION: "Will GNO price be at or above 130 sDAI (Savings xDAI) at December 28, 2025 11:59 PM?",
    PROPOSAL_METADATA: '{"category":"governance","tags":["gip","price-prediction"]}',
    PROPOSAL_METADATA_URI: "",
    COMPANY_NAME: "GNOSIS DAO",
    COMPANY_DESC: "Gnosis DAO is the decentralized autonomous organization governing the Gnosis ecosystem.",
    COMPANY_METADATA: '{"website":"https://gnosis.io","twitter":"@gaborGWL"}',
    COMPANY_METADATA_URI: "",
    AGGREGATOR_NAME: "FutarchyFi",
    AGGREGATOR_DESC: "The premier aggregation layer for Futarchy markets.",
    AGGREGATOR_METADATA: '{"version":"1.0"}',
    AGGREGATOR_METADATA_URI: ""
};

async function main() {
    const [signer] = await ethers.getSigners();
    console.log(`\n🚀 Executing Metadata Workflow with: ${signer.address}`);

    const gasConfig = { gasPrice: 5000000000 };

    // 1. Create Proposal Metadata
    console.log("\n1️⃣  Creating Proposal Metadata...");
    const ProposalFactory = await ethers.getContractAt("ProposalMetadataFactory", FACTORIES.PROPOSAL);

    const tx1 = await ProposalFactory.createProposalMetadata(
        DATA.PROPOSAL_ADDR,
        DATA.QUESTION,
        DATA.EVENT,
        DATA.DESCRIPTION,
        DATA.PROPOSAL_METADATA,
        DATA.PROPOSAL_METADATA_URI,
        gasConfig
    );
    console.log(`   Tx Sent: ${tx1.hash}`);
    const receipt1 = await tx1.wait();

    // Parse event to get address
    const event1 = receipt1.logs.find(log => {
        try { return ProposalFactory.interface.parseLog(log)?.name === "ProposalMetadataCreated"; } catch (e) { return false; }
    });
    const proposalMetadataAddr = ProposalFactory.interface.parseLog(event1).args.metadata;
    console.log(`   ✅ Proposal Metadata Created: ${proposalMetadataAddr}`);

    // 2. Create Organization
    console.log(`\n2️⃣  Creating Organization: ${DATA.COMPANY_NAME}...`);
    const OrgFactory = await ethers.getContractAt("OrganizationMetadataFactory", FACTORIES.ORGANIZATION);

    const tx2 = await OrgFactory.createOrganizationMetadata(
        DATA.COMPANY_NAME,
        DATA.COMPANY_DESC,
        DATA.COMPANY_METADATA,
        DATA.COMPANY_METADATA_URI,
        gasConfig
    );
    console.log(`   Tx Sent: ${tx2.hash}`);
    const receipt2 = await tx2.wait();

    const event2 = receipt2.logs.find(log => {
        try { return OrgFactory.interface.parseLog(log)?.name === "OrganizationMetadataCreated"; } catch (e) { return false; }
    });
    const orgMetadataAddr = OrgFactory.interface.parseLog(event2).args.metadata;
    console.log(`   ✅ Organization Created: ${orgMetadataAddr}`);

    // 3. Link Proposal
    console.log(`\n3️⃣  Adding Proposal to Organization...`);
    // Note: Use FutarchyOrganizationMetadata (Clone) 
    const Organization = await ethers.getContractAt("FutarchyOrganizationMetadata", orgMetadataAddr);
    const tx3 = await Organization.addProposal(proposalMetadataAddr, gasConfig);
    await tx3.wait();
    console.log(`   ✅ Linked.`);

    // 4. Create Aggregator
    console.log(`\n4️⃣  Creating Aggregator: ${DATA.AGGREGATOR_NAME}...`);
    const AggFactory = await ethers.getContractAt("FutarchyAggregatorFactory", FACTORIES.AGGREGATOR);

    const tx4 = await AggFactory.createAggregatorMetadata(
        DATA.AGGREGATOR_NAME,
        DATA.AGGREGATOR_DESC,
        DATA.AGGREGATOR_METADATA,
        DATA.AGGREGATOR_METADATA_URI,
        gasConfig
    );
    console.log(`   Tx Sent: ${tx4.hash}`);
    const receipt4 = await tx4.wait();

    const event4 = receipt4.logs.find(log => {
        try { return AggFactory.interface.parseLog(log)?.name === "AggregatorMetadataCreated"; } catch (e) { return false; }
    });
    const aggMetadataAddr = AggFactory.interface.parseLog(event4).args.metadata;
    console.log(`   ✅ Aggregator Created: ${aggMetadataAddr}`);

    // 5. Link Organization
    console.log(`\n5️⃣  Adding Organization to Aggregator...`);
    const Aggregator = await ethers.getContractAt("FutarchyAggregatorsMetadata", aggMetadataAddr);
    const tx5 = await Aggregator.addOrganization(orgMetadataAddr, gasConfig);
    await tx5.wait();
    console.log(`   ✅ Linked.`);

    console.log("\n📜 Final Summary:");
    console.log({
        ProposalMetadata: proposalMetadataAddr,
        Organization: orgMetadataAddr,
        Aggregator: aggMetadataAddr
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
