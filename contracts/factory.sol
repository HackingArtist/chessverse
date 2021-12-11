// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Escrow.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ChessFactory{
    mapping(string => address payable) internal games;

    function createGame(address payable _userA , uint _amount, string memory _gameid) external{
        Escrow game=new Escrow(_userA, _amount, _gameid);
        address gameaddress = address(game);
        games[_gameid] = payable(gameaddress);


        // send link token
        IERC20 token=IERC20(0xa36085F69e2889c224210F603D836748e7dC0088);
        uint256 amount= 0.2 * 10**18;
        transferERC20(token, gameaddress, amount);
    }
    function transferERC20(IERC20 token, address to, uint256 amount) public{
       token.transfer(to,amount);
    } 

    function getGame(string memory _gameid) public view returns (address) {
        return games[_gameid];
    }
}
