// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEscrowFactory} from "./IEscrowFactory.sol";
import {IEscrow} from "./IEscrow.sol";

contract Resolver is Ownable {
    IEscrowFactory private immutable _FACTORY;

    constructor(IEscrowFactory factory, address initialOwner) Ownable(initialOwner) {
        _FACTORY = factory;
    }

    function deployDst(address _tokenAddress, bytes20 _secretHash, uint _amount) external onlyOwner returns (address) {
        IERC20(_tokenAddress).approve(address(_FACTORY), _amount);
        return _FACTORY.createDstEscrow(_tokenAddress, _secretHash, _amount);
    }

    function withdraw(IEscrow escrow, string memory secret, address payable _withdrawTo) external {
        escrow.withdraw(secret, _withdrawTo);
    }
}