const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Futarchy Aggregator System", function () {
    let proposalFactory, organizationFactory, aggregatorFactory;
    let owner, addr1;

    before(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy implementations first
        const ProposalMetadataImpl = await ethers.getContractFactory("FutarchyProposalMetadata");
        const proposalImpl = await ProposalMetadataImpl.deploy();
        await proposalImpl.waitForDeployment();

        const OrgMetadataImpl = await ethers.getContractFactory("FutarchyOrganizationMetadata");
        const orgImpl = await OrgMetadataImpl.deploy();
        await orgImpl.waitForDeployment();

        const AggMetadataImpl = await ethers.getContractFactory("FutarchyAggregatorsMetadata");
        const aggImpl = await AggMetadataImpl.deploy();
        await aggImpl.waitForDeployment();

        // Deploy factories with implementation addresses
        const ProposalMetadataFactory = await ethers.getContractFactory("ProposalMetadataFactory");
        const OrganizationMetadataFactory = await ethers.getContractFactory("OrganizationMetadataFactory");
        const FutarchyAggregatorFactory = await ethers.getContractFactory("FutarchyAggregatorFactory");

        proposalFactory = await ProposalMetadataFactory.deploy(await proposalImpl.getAddress());
        organizationFactory = await OrganizationMetadataFactory.deploy(await orgImpl.getAddress());
        aggregatorFactory = await FutarchyAggregatorFactory.deploy(await aggImpl.getAddress());

        await proposalFactory.waitForDeployment();
        await organizationFactory.waitForDeployment();
        await aggregatorFactory.waitForDeployment();
    });

    it("Should create a Proposal Metadata", async function () {
        const dummyProposal = owner.address; // Use owner address as dummy proposal logic address
        const tx = await proposalFactory.createProposalMetadata(
            dummyProposal,
            "Will GIP-144 pass?",
            "GIP-144",
            "Detailed description here",
            '{"category":"governance"}',
            "ipfs://QmTest123"
        );
        const receipt = await tx.wait();

        // Find event
        // ethers v6: receipt.logs
        // ethers v5: receipt.events
        const event = receipt.logs.find(log => {
            // Simple check if we can parse it, or just query contract if address is known
            try {
                return proposalFactory.interface.parseLog(log).name === "ProposalMetadataCreated";
            } catch (e) { return false; }
        }) || (receipt.events && receipt.events.find(e => e.event === "ProposalMetadataCreated"));

        expect(event).to.not.be.undefined;

        let args;
        if (event.args) {
            args = event.args;
        } else {
            // v6 decoding
            args = proposalFactory.interface.parseLog(event).args;
        }

        const metadataAddress = args.metadata;
        const Metadata = await ethers.getContractFactory("FutarchyProposalMetadata");
        const metadata = Metadata.attach(metadataAddress);

        expect(await metadata.displayNameQuestion()).to.equal("Will GIP-144 pass?");
        expect(await metadata.owner()).to.equal(owner.address);
        expect(await metadata.metadata()).to.equal('{"category":"governance"}');
        expect(await metadata.metadataURI()).to.equal("ipfs://QmTest123");
    });

    it("Should create an Organization and add Proposal", async function () {
        const tx = await organizationFactory.createOrganizationMetadata(
            "GnosisDAO",
            "Gnosis DAO description",
            '{"website":"https://gnosis.io"}',
            ""
        );
        const receipt = await tx.wait();

        let args;
        const event = receipt.logs.find(log => {
            try { return organizationFactory.interface.parseLog(log).name === "OrganizationMetadataCreated"; } catch (e) { return false; }
        }) || (receipt.events && receipt.events.find(e => e.event === "OrganizationMetadataCreated"));

        if (event.args) args = event.args;
        else args = organizationFactory.interface.parseLog(event).args;

        const orgAddress = args.metadata;
        const Organization = await ethers.getContractFactory("FutarchyOrganizationMetadata");
        const organization = Organization.attach(orgAddress);

        expect(await organization.companyName()).to.equal("GnosisDAO");
        expect(await organization.metadata()).to.equal('{"website":"https://gnosis.io"}');
        expect(await organization.metadataURI()).to.equal("");

        // Create another proposal to add
        const tx2 = await proposalFactory.createProposalMetadata(
            owner.address, "Q2", "E2", "D2", '{}', ""
        );
        const receipt2 = await tx2.wait();
        // Get address (simplified finding)
        let propAddr;
        // Iterate logs to find address
        for (const log of receipt2.logs) {
            try {
                const parsed = proposalFactory.interface.parseLog(log);
                if (parsed.name === "ProposalMetadataCreated") {
                    propAddr = parsed.args.metadata;
                    break;
                }
            } catch (e) { }
        }
        if (!propAddr && receipt2.events) propAddr = receipt2.events.find(e => e.event === "ProposalMetadataCreated").args.metadata;

        await organization.addProposal(propAddr);
        expect(await organization.getProposalsCount()).to.equal(1);

        const props = await organization.getProposals(0, 10);
        expect(props[0]).to.equal(propAddr);
    });

    it("Should create an Aggregator and add Organization", async function () {
        const tx = await aggregatorFactory.createAggregatorMetadata(
            "MainAggregator",
            "Main aggregator description",
            '{"version":"1.0"}',
            "ipfs://QmAggregator"
        );
        const receipt = await tx.wait();

        let args;
        const event = receipt.logs.find(log => {
            try { return aggregatorFactory.interface.parseLog(log).name === "AggregatorMetadataCreated"; } catch (e) { return false; }
        }) || (receipt.events && receipt.events.find(e => e.event === "AggregatorMetadataCreated"));

        if (event.args) args = event.args;
        else args = aggregatorFactory.interface.parseLog(event).args;

        const aggAddress = args.metadata;
        const Aggregator = await ethers.getContractFactory("FutarchyAggregatorsMetadata");
        const aggregator = Aggregator.attach(aggAddress);

        expect(await aggregator.aggregatorName()).to.equal("MainAggregator");
        expect(await aggregator.metadata()).to.equal('{"version":"1.0"}');
        expect(await aggregator.metadataURI()).to.equal("ipfs://QmAggregator");

        // Create org
        const tx2 = await organizationFactory.createOrganizationMetadata("Org2", "Org2 desc", '{}', "");
        const receipt2 = await tx2.wait();
        let orgAddr;
        for (const log of receipt2.logs) {
            try {
                const parsed = organizationFactory.interface.parseLog(log);
                if (parsed.name === "OrganizationMetadataCreated") {
                    orgAddr = parsed.args.metadata;
                    break;
                }
            } catch (e) { }
        }
        if (!orgAddr && receipt2.events) orgAddr = receipt2.events.find(e => e.event === "OrganizationMetadataCreated").args.metadata;

        await aggregator.addOrganization(orgAddr);
        expect(await aggregator.getOrganizationsCount()).to.equal(1);
    });

    it("Should update extended metadata on Proposal", async function () {
        const tx = await proposalFactory.createProposalMetadata(
            owner.address,
            "Question",
            "Event",
            "Description",
            '{"old":"data"}',
            ""
        );
        const receipt = await tx.wait();

        let metadataAddress;
        for (const log of receipt.logs) {
            try {
                const parsed = proposalFactory.interface.parseLog(log);
                if (parsed.name === "ProposalMetadataCreated") {
                    metadataAddress = parsed.args.metadata;
                    break;
                }
            } catch (e) { }
        }

        const Metadata = await ethers.getContractFactory("FutarchyProposalMetadata");
        const metadata = Metadata.attach(metadataAddress);

        // Update extended metadata
        await metadata.updateExtendedMetadata('{"new":"data","large":true}', "ipfs://QmNewHash");

        expect(await metadata.metadata()).to.equal('{"new":"data","large":true}');
        expect(await metadata.metadataURI()).to.equal("ipfs://QmNewHash");
    });
});
