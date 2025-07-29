// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEscrowFactory {
    function createDstEscrow(address _tokenAddress, bytes20 _secretHash, uint _amount) external returns (address);
}