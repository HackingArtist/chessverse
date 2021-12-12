// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract Escrow is ChainlinkClient {
    IERC20 public usdt;

    using Chainlink for Chainlink.Request;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    

    //User A is Challenger and User B is Challengee
    enum State{AWAITING_STAKE,AWAITING_RESULT,COMPLETE}
    State public currState;

    //details the contract needs
    address payable public userA;
    address payable public userB;
    string public gameid;
    string public url; // make it private
    uint public result;

    bool public isUserAStake;
    bool public isUserBStake;

    //bool public test;
    uint256 public amount;
    uint256 public pot;
    string public x;
    
    modifier escrowNotStarted(){
        require(currState==State.AWAITING_STAKE);
        _;
    }
    
    /*
     configure chainlink values to use an oracles and a jobid
    */
    constructor(address payable _userA , uint _amount, string memory _gameid){
        // chainlink config
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)

        // escrow config
        userA=_userA;
        amount= _amount;
        gameid = _gameid;
        result = 5;

        // USDT
        usdt = IERC20(0x13512979ADE267AB5100878E2e0f485B568328a4);
    }

    /*
     this function will be used by both the players to deposit money
    */
    function deposit(uint256 _amount) external payable{
        require(currState==State.AWAITING_STAKE, "you got free money? send it to me");
        require(amount == _amount, "Wrong Amount");

        if(msg.sender==userA && isUserAStake==false){
            usdt.transferFrom(msg.sender, address(this), amount); // transfer from user A
            pot=pot+amount;
            isUserAStake=true;
        }

        //Conditions: 1. To check the user 2. To check the amt 3. To make sure stakins only done once.
        if(msg.sender!=userA && isUserBStake==false){
            usdt.transferFrom(msg.sender, address(this), amount); // transfer from user B
            userB=payable (msg.sender);
            pot=pot+amount;
            isUserBStake=true;
        }

         if( isUserAStake && isUserBStake){
            currState=State.AWAITING_RESULT;
        }
    }



    function claim() public returns (bytes32 requestId) 
    {
        require(currState==State.AWAITING_RESULT,"Cannot confirm result");
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        bytes memory b;
        b = abi.encodePacked("https://safe-shelf-44562.herokuapp.com?gameid=");
        b = abi.encodePacked(b, gameid);
        url = string(b);
        request.add("get", url);
        request.add("path", "data");
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function fulfill(bytes32 _requestId, uint256 _result) public recordChainlinkFulfillment(_requestId)
    {
        x = "abc";
        result = _result;
        if(_result==0){
                usdt.transferFrom(address(this), userA, pot);
                currState=State.COMPLETE;
        }
        if(_result==1){
            usdt.transferFrom(address(this), userB, pot);
            currState=State.COMPLETE;
        }
        if(_result==2){
            usdt.transferFrom(address(this), userA, pot/2);
            usdt.transferFrom(address(this), userB, pot/2);
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
