// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./FutarchyAggregatorsMetadata.sol";

contract FutarchyAggregatorFactory {
    address public immutable implementation;
    address public immutable organizationImplementation;
    address public immutable proposalImplementation;

    event AggregatorMetadataCreated(address indexed metadata, string name);

    constructor(address _implementation, address _organizationImplementation, address _proposalImplementation) {
        implementation = _implementation;
        organizationImplementation = _organizationImplementation;
        proposalImplementation = _proposalImplementation;
    }

    function createAggregatorMetadata(
        string memory aggregatorName,
        string memory description,
        string memory metadata,
        string memory metadataURI
    ) external returns (address) {
        address clone = Clones.clone(implementation);
        FutarchyAggregatorsMetadata(clone).initialize(
            msg.sender,
            aggregatorName,
            description,
            metadata,
            metadataURI,
            organizationImplementation,
            proposalImplementation
        );
        emit AggregatorMetadataCreated(clone, aggregatorName);
        return clone;
    }
}
