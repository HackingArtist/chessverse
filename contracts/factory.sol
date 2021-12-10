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
        IERC20 token=IERC20(0xa36085F69e2889c224210F603D836748e7dC0088);
        address to=address(games[0]);
        uint256 amount=1;

        transferERC20(token, to, amount);
    }
    
     function transferERC20(IERC20 token, address to, uint256 amount) public{
       
       token.transfer(to,amount);

    } 
}
