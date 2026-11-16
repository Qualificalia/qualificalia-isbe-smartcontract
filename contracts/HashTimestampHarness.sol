// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {HashTimestampFacet} from '@red-isbe/isbe-contracts/contracts/hashtimestamp/HashTimestampFacet.sol';
import {_HASH_TIMESTAMP_ROLE} from '@red-isbe/isbe-contracts/contracts/constants/roles.sol';

/// LABORATORY ONLY: NOT an ISBE deployment, proxy or governance implementation.
/// The business logic below is inherited unchanged from the official 0.2.1 facet.
contract HashTimestampHarness is HashTimestampFacet {
    address private immutable administrator;
    event MockPauseChanged(bool paused);

    constructor(address operator) {
        require(operator != address(0));
        administrator = msg.sender;
        _grantRole(_HASH_TIMESTAMP_ROLE, operator);
    }

    modifier onlyMockAdministrator() {
        require(msg.sender == administrator, 'mock administrator only');
        _;
    }

    // The actual ISBE proxy resolves DIDs and applies governance. This mock
    // uses EOAs exclusively; it MUST NOT be deployed in PRE or production.
    function _hasRole(bytes32 role, address account) internal view override returns (bool) {
        return _hasEoaRole(role, account);
    }

    function mockSetOperator(address operator, bool enabled) external onlyMockAdministrator {
        require(operator != address(0));
        if (enabled) _grantRole(_HASH_TIMESTAMP_ROLE, operator);
        else _revokeRole(_HASH_TIMESTAMP_ROLE, operator);
    }

    function mockSetPaused(bool value) external onlyMockAdministrator {
        _pauseStorage().pause = value;
        emit MockPauseChanged(value);
    }

    function mockPaused() external view returns (bool) { return _paused(); }
}
