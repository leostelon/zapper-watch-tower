// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEscrowFactory {
    function createSrcEscrow(address _userAddress, address _tokenAddress, bytes20 _secretHash, uint _amount) external returns (address);
    function createDstEscrow(address _tokenAddress, bytes20 _secretHash, uint _amount) external returns (address);
}