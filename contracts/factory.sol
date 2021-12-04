// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./escrow.sol";

contract ChessFactory
{
    Escrow[] public games;

    function createGame(address payable _userA , uint _amount) external{
        Escrow game=new Escrow(_userA, _amount);
        games.push(game);
        address(game);
    }
}
