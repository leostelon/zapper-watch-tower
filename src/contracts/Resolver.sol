// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEscrowFactory} from "./IEscrowFactory.sol";

contract Resolver is Ownable {
    IEscrowFactory private immutable _FACTORY;

    constructor(IEscrowFactory factory, address initialOwner) Ownable(initialOwner) {
        _FACTORY = factory;
    }

    function deployDst(address _tokenAddress, bytes20 _secretHash, uint _amount) external onlyOwner {
        IERC20(_tokenAddress).approve(address(_FACTORY), _amount);
        _FACTORY.createDstEscrow(_tokenAddress, _secretHash, _amount);
    }
}