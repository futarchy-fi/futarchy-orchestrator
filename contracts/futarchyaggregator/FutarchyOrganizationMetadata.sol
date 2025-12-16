// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./FutarchyProposalMetadata.sol";

contract FutarchyOrganizationMetadata is Ownable, Initializable {
    string public companyName;
    string public description;
    string public metadata;      // On-chain JSON for small data
    string public metadataURI;   // IPFS/Arweave URI for large data
    FutarchyProposalMetadata[] public proposals;

    event CompanyInfoUpdated(string newName, string newDescription);
    event ExtendedMetadataUpdated(string metadata, string metadataURI);
    event ProposalAdded(address indexed proposalMetadata);

    constructor() Ownable(msg.sender) {
        _disableInitializers();
    }

    function initialize(
        address _owner,
        string memory _companyName,
        string memory _description,
        string memory _metadata,
        string memory _metadataURI
    ) external initializer {
        _transferOwnership(_owner);
        companyName = _companyName;
        description = _description;
        metadata = _metadata;
        metadataURI = _metadataURI;
    }

    function updateCompanyInfo(string memory _newName, string memory _newDescription) external onlyOwner {
        companyName = _newName;
        description = _newDescription;
        emit CompanyInfoUpdated(_newName, _newDescription);
    }

    function updateExtendedMetadata(
        string memory _metadata,
        string memory _metadataURI
    ) external onlyOwner {
        metadata = _metadata;
        metadataURI = _metadataURI;
        emit ExtendedMetadataUpdated(_metadata, _metadataURI);
    }

    function addProposal(address _proposalMetadata) external onlyOwner {
        proposals.push(FutarchyProposalMetadata(_proposalMetadata));
        emit ProposalAdded(_proposalMetadata);
    }

    function getProposalsCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposals(uint256 offset, uint256 limit) external view returns (FutarchyProposalMetadata[] memory) {
        uint256 total = proposals.length;
        if (offset >= total) {
            return new FutarchyProposalMetadata[](0);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 size = end - offset;
        FutarchyProposalMetadata[] memory result = new FutarchyProposalMetadata[](size);
        
        for (uint256 i = 0; i < size; i++) {
            result[i] = proposals[offset + i];
        }
        
        return result;
    }
}
