// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEscrowFactory} from "./IEscrowFactory.sol";
import "./Escrow.sol";

contract EscrowFactory is IEscrowFactory {
    event EscrowCreated(address escrowAddress, address tokenAddress, bytes20 secretHash);

    function createSrcEscrow(address _userAddress, address _tokenAddress, bytes20 _secretHash, uint _amount) external returns (address) {
        require(
            IERC20(_tokenAddress).allowance(_userAddress, address(this)) >= _amount,
            "Insufficient allowance"
        );
        Escrow escrow = new Escrow{salt: bytes32(_secretHash)}(_tokenAddress, _secretHash);

        if (_tokenAddress != address(0)) {
            IERC20(_tokenAddress).transferFrom(_userAddress, address(escrow), _amount);
        }

        emit EscrowCreated(address(escrow), _tokenAddress, _secretHash);
        return address(escrow);
    }
    
    function createDstEscrow(address _tokenAddress, bytes20 _secretHash, uint _amount) external returns (address) {
        Escrow escrow = new Escrow{salt: bytes32(_secretHash)}(_tokenAddress, _secretHash);

        if (_tokenAddress != address(0)) {
            IERC20(_tokenAddress).transferFrom(msg.sender, address(escrow), _amount);
        }

        emit EscrowCreated(address(escrow), _tokenAddress, _secretHash);
        return address(escrow);
    }
}