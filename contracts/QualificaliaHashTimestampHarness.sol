// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {QualificaliaHashTimestampFacet} from './QualificaliaHashTimestampFacet.sol';
import {_HASH_TIMESTAMP_ROLE} from '@red-isbe/isbe-contracts/contracts/constants/roles.sol';

/// @notice Local-only harness. Its EOA roles and pause controls do not model ISBE DID governance.
contract QualificaliaHashTimestampHarness is QualificaliaHashTimestampFacet {
    address private immutable administrator;

    constructor(address operator) {
        require(operator != address(0), 'operator is zero');
        administrator = msg.sender;
        _grantRole(_HASH_TIMESTAMP_ROLE, operator);
    }

    modifier onlyMockAdministrator() {
        require(msg.sender == administrator, 'mock administrator only');
        _;
    }

    function _hasRole(bytes32 role, address account) internal view override returns (bool) {
        return _hasEoaRole(role, account);
    }

    function mockSetOperator(address operator, bool enabled) external onlyMockAdministrator {
        require(operator != address(0), 'operator is zero');
        if (enabled) _grantRole(_HASH_TIMESTAMP_ROLE, operator);
        else _revokeRole(_HASH_TIMESTAMP_ROLE, operator);
    }

    function mockSetPaused(bool value) external onlyMockAdministrator {
        _pauseStorage().pause = value;
    }
}
