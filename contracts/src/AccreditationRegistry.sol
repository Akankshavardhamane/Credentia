// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
contract AccreditationRegistry is AccessControl {
    bytes32 public constant ACCREDITOR_ROLE = keccak256("ACCREDITOR_ROLE");
    struct Issuer { address issuerAddress; uint64 validFrom; uint64 validUntil; bool revoked; string metadataUri; }
    mapping(bytes32 => Issuer) private issuers;
    event IssuerRegistered(bytes32 indexed didHash, address indexed issuerAddress, uint64 validFrom, uint64 validUntil, string metadataUri);
    event IssuerRevoked(bytes32 indexed didHash); event IssuerUpdated(bytes32 indexed didHash, address issuerAddress, uint64 validUntil, string metadataUri);
    constructor(address admin) { _grantRole(DEFAULT_ADMIN_ROLE, admin); _grantRole(ACCREDITOR_ROLE, admin); }
    function registerIssuer(string calldata did, address issuerAddress, uint64 validFrom, uint64 validUntil, string calldata metadataUri) external onlyRole(ACCREDITOR_ROLE) { require(issuerAddress != address(0) && validUntil > validFrom, "invalid issuer"); bytes32 key = keccak256(bytes(did)); require(issuers[key].issuerAddress == address(0), "already registered"); issuers[key] = Issuer(issuerAddress, validFrom, validUntil, false, metadataUri); emit IssuerRegistered(key, issuerAddress, validFrom, validUntil, metadataUri); }
    function revokeIssuer(string calldata did) external onlyRole(ACCREDITOR_ROLE) { bytes32 key = keccak256(bytes(did)); require(issuers[key].issuerAddress != address(0), "not found"); issuers[key].revoked = true; emit IssuerRevoked(key); }
    function updateIssuer(string calldata did, address issuerAddress, uint64 validUntil, string calldata metadataUri) external onlyRole(ACCREDITOR_ROLE) { bytes32 key = keccak256(bytes(did)); Issuer storage issuer = issuers[key]; require(issuer.issuerAddress != address(0) && issuerAddress != address(0) && validUntil > issuer.validFrom, "invalid issuer"); issuer.issuerAddress = issuerAddress; issuer.validUntil = validUntil; issuer.metadataUri = metadataUri; emit IssuerUpdated(key, issuerAddress, validUntil, metadataUri); }
    function isAccredited(string calldata did) external view returns (bool) { Issuer memory issuer = issuers[keccak256(bytes(did))]; return issuer.issuerAddress != address(0) && !issuer.revoked && block.timestamp >= issuer.validFrom && block.timestamp <= issuer.validUntil; }
}
