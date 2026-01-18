// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./FutarchyOrganizationMetadata.sol";

contract OrganizationMetadataFactory {
    address public immutable implementation;
    address public immutable proposalImplementation;

    event OrganizationMetadataCreated(address indexed metadata, string name);

    constructor(address _implementation, address _proposalImplementation) {
        implementation = _implementation;
        proposalImplementation = _proposalImplementation;
    }

    function createOrganizationMetadata(
        string memory companyName,
        string memory description,
        string memory metadata,
        string memory metadataURI
    ) external returns (address) {
        address clone = Clones.clone(implementation);
        FutarchyOrganizationMetadata(clone).initialize(
            msg.sender,
            companyName,
            description,
            metadata,
            metadataURI,
            proposalImplementation
        );
        emit OrganizationMetadataCreated(clone, companyName);
        return clone;
    }
}
