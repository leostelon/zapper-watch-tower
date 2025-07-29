// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    bytes20 private secretHash;
    address private tokenAddress;

    constructor(address _tokenAddress, bytes20 _secretHash) {
        tokenAddress = _tokenAddress;
        secretHash = _secretHash;
    }

    function withdraw(string memory _secret, address payable _withdrawTo) external {
        require(hash160String(_secret) == secretHash, "Invalid secret");
        sendERC20(_withdrawTo);
    }

    function sendERC20(address to) internal {
        IERC20 token = IERC20(tokenAddress);

        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to transfer");

        bool success = token.transfer(to, balance);
        require(success, "ERC20 Transfer failed");
    }

    function hash160(bytes memory data) internal pure returns (bytes20) {
        // Step 1: sha256(data) returns bytes32
        bytes32 shaHash = sha256(data);

        // Step 2: ripemd160(sha256(data)) returns bytes20
        return ripemd160(abi.encodePacked(shaHash));
    }

    // Convenience: hash160 of a string
    function hash160String(string memory str) internal pure returns (bytes20) {
        return hash160(bytes(str));
    }
}