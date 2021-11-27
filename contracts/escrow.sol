// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Escrow{
    enum State{NOT_INIT,AWAITING_STAKE, AWAITING_RESULT, COMPLETE}
// can add 2 different states for awaiting stake chanllenger and challengee
 
    State public currState;

    bool public isChallengerIn;
    bool public isChallengeeIn;

    bool public isChallengerStake;
    bool public isChallengeeStake;

    uint public amount;
    uint public pot;

    address payable public challenger;
    address payable public challengee;


    modifier escrowNotStarted(){
        require(currState==State.NOT_INIT);
        _;
    }

    constructor(address payable _challenger, address payable _challengee, uint _amount){
        challenger=_challenger;
        challengee=_challengee;
        amount= _amount * (1 ether);

    }

    function initContract() escrowNotStarted public{
        if(msg.sender== challenger){
            isChallengerIn = true;
        }
        if(msg.sender == challengee){
            isChallengeeIn=true;
        }
        if(isChallengeeIn && isChallengerIn){
            currState=State.AWAITING_STAKE;
        }
    }

    function deposit() public payable{
        require(currState==State.AWAITING_STAKE, "Lol_1");
        if(msg.sender==challenger && msg.value==amount){
            pot=pot+amount;
            isChallengerStake=true;
        }
        if(msg.sender==challengee && msg.value==amount){
            pot=pot+amount;
           isChallengeeStake=true;
        }
        if(isChallengeeStake && isChallengerStake){
            currState=State.AWAITING_RESULT;
        }
    }
    //my thougts: Simply add a winner address on gameResult.
    function gameResult ( address payable _winner) payable public{
        require(currState==State.AWAITING_RESULT,"Cannot confirm result");
        _winner.transfer(pot);
        currState=State.COMPLETE;
    }
    // function withdraw() payable public{
    // require(currState==State.AWAITING_STAKE,"Can't confirm game");
    // transfer(amount);

    // }
}
