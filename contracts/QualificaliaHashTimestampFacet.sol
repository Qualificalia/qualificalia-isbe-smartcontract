// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {HashTimestamp} from '@red-isbe/isbe-contracts/contracts/hashtimestamp/HashTimestamp.sol';
import {IEIP2535Introspection} from '@red-isbe/isbe-contracts/contracts/proxies/eip2535/interfaces/IEIP2535Introspection.sol';

/// @title QualificaliaHashTimestampFacet
/// @notice ISBE Diamond facet for timestamping certificate and credential hashes.
/// @dev Uses the official HashTimestamp storage, role, pause, event and query logic.
///      The proposed business ID must be registered/approved by ISBE before use.
///      Add this facet to an ISBE-governed Diamond; do not deploy it as a standalone registry.
contract QualificaliaHashTimestampFacet is HashTimestamp, IEIP2535Introspection {
    /// @dev Proposed resolver key; confirm availability and configuration with ISBE.
    bytes32 internal constant QUALIFICALIA_HASH_TIMESTAMP_RESOLVER_KEY =
        keccak256('isbe.customers.qualificalia.documentRegistry.resolver.key');

    function interfacesIntrospection()
        external
        pure
        returns (bytes4[] memory interfaces_)
    {
        return _implementedInterfaces();
    }

    function businessIdIntrospection()
        external
        pure
        override
        returns (bytes32 businessId_)
    {
        return QUALIFICALIA_HASH_TIMESTAMP_RESOLVER_KEY;
    }

    function selectorsIntrospection()
        external
        pure
        override
        returns (bytes4[] memory selectors_)
    {
        selectors_ = new bytes4[](3);
        selectors_[0] = this.timestampHash.selector;
        selectors_[1] = this.exists.selector;
        selectors_[2] = this.getTimestamp.selector;
    }
}
