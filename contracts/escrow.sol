// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Escrow{

    //User A is Challenger and User B is Challengee
    enum State{AWAITING_STAKE,AWAITING_RESULT,COMPLETE}
    // can add 2 different states for awaiting stake chanllenger and challengee
 
    State public currState;

    //details the contract needs
    address payable public userA;
    address payable public userB;
    //bytes32 public gameId;


    bool public isUserAStake;
    bool public isUserBStake;

    //bool public test;

    uint public amount;
    uint public pot;


    
    modifier escrowNotStarted(){
        require(currState==State.AWAITING_STAKE);
        _;
    }

    constructor(address payable _userA , uint _amount){
        userA=_userA;
        amount= _amount * (1 ether);
    }

    function deposit() public payable{
        require(currState==State.AWAITING_STAKE, "Lol");
        require(msg.value==amount, "Wrong Amount");

        if(msg.sender==userA && isUserAStake==false){
            pot=pot+amount;
            isUserAStake=true;
        }
//Conditions: 1. To check the user 2. To check the amt 3. To make sure stakins only done once.
         if(msg.sender!=userA && isUserBStake==false){

            userB=payable (msg.sender);
            pot=pot+amount;
            isUserBStake=true;
        }

         if( isUserAStake && isUserBStake){
            currState=State.AWAITING_RESULT;
        }
    }

    

    function claim(uint8 _result) payable public{
        require(currState==State.AWAITING_RESULT,"Cannot confirm result");

        if(_result==0){

                userA.transfer(pot);
                currState=State.COMPLETE;

        }

        if(_result==1){

            userA.transfer(pot);
            currState=State.COMPLETE;

        }

    }

    function withdraw() payable public{
        require(currState==State.AWAITING_STAKE,"Either game in progress or sth else ");

        // 1. User A stakes User B doesn't come
        // 2. User B stakes user A does not: Let the user withdraw there asset even in between the game itself
        // 3. If both user stake the game there has to be a game with a result, draw, abort to claim.
        if(msg.sender==userA && isUserAStake==true && isUserBStake==false)
        {
            userA.transfer(amount);
            isUserBStake=false;
        }

        if(msg.sender==userB && isUserBStake==true && isUserAStake==false)
        {
            userB.transfer(amount);
            isUserBStake=false;
        }
    }
}
