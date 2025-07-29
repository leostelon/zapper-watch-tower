// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEscrow {
    function withdraw(string memory _secret, address payable _withdrawTo) external;
}