import Web3 from "web3";

import parentABI from "../assets/parentABI.json"
import childABI from "../assets/childABI.json"
import usdtABI from "../assets/usdtABI.json"

import localStorageUtils from './localStorageUtils';
import createMetaMaskProvider from 'metamask-extension-provider';

const lsUtils = new localStorageUtils();
const provider = createMetaMaskProvider();

export default class Utils {

    constructor() {
        console.debug("Utils.constructor");
        // https://docs.metamask.io/guide/metamask-extension-provider.html
        // https://github.com/MetaMask/extension-provider
		this.web3 = new Web3(provider);

        this.userLoggedIn = false;
        this.walletAddress = null;

        this.parentContractAddress = process.env.APP_CONTRACT_ADDRESS
    }

    async login() {
        console.debug("Utils.login");
        console.log(this.web3);
        // this.web3.eth.requestAccounts
        await this.web3.currentProvider.enable();
        console.log("YES");
        var ethAccounts = await this.web3.eth.getAccounts();

        if (ethAccounts.length >= 1) {
            localStorage.setItem("walletAddress", ethAccounts[0]);
            return true
        } else {
            return false
        }
    }

    async logout() {
        this.userLoggedIn = false;
        localStorage.removeItem("walletAddress");
        location.reload();
    }

    isUserLoggedIn() {
        let walletAddress = localStorage.getItem("walletAddress");
        if (walletAddress != null) {
            return true;
        } else {
            return false;
        }
    }

    getWalletAddress() {
        return this.walletAddress;
    }

    async signTransaction(tx) {
        // const signedTx = await this.web3.eth.signTransaction(tx, tx.from);

        const result = await this.web3.eth.sendTransaction(tx);
        console.log(result)
        // console.debug(signedTx)
        // const sentTx = this.web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);

        // const result = await new Promise((resolve, reject) => {
        //     sentTx.on("receipt", receipt => {
        //         resolve(receipt);
        //     });
        //     sentTx.on("error", error => {
        //         resolve(error);
        //     })

        //     sentTx.on("other", error => {
        //         reject(error);
        //     })
        // });
        // console.log(result);
        return result
    }

    getGameId() {
        var gameUrl = lsUtils.getValue("lastGameUrl");

        if (gameUrl != null) {
            return gameUrl.split("/").at(-1)
        } else {
            return ""
        }
    }

    async createGame(amount) {
        var parentContract = new this.web3.eth.Contract(parentABI, this.parentContractAddress);
        var walletAddress = localStorage.getItem("walletAddress")
        var gameId = this.getGameId()
        let stakedAmount = amount * (10**6)
        
        const tx = {
            from: walletAddress,
            to: this.parentContractAddress,
            data: parentContract.methods.createGame(walletAddress, stakedAmount, gameId).encodeABI()
        };
        console.log("createGame() ==> parentContractAddress: ", this.parentContractAddress);

        await this.signTransaction(tx);
    }

    async depositTokens() {
        var parentContract = new this.web3.eth.Contract(parentABI, this.parentContractAddress);
        var walletAddress = localStorage.getItem("walletAddress")
        var gameId = this.getGameId()
        console.log(walletAddress, gameId, this.parentContractAddress);

        var childContractAddress = await parentContract.methods.games(gameId).call()
        console.log("depositTokens() ==> childContractAddress: ", childContractAddress);
        var childContract = new this.web3.eth.Contract(childABI, childContractAddress);
        var stakedAmount = await childContract.methods.amount().call()

        // exp START
        let usdtContract = new this.web3.eth.Contract(usdtABI, "0x13512979ADE267AB5100878E2e0f485B568328a4")
        await usdtContract.methods.approve(childContractAddress, stakedAmount).send({ from: walletAddress })


        // exp END
        // USDT parameters
        // var usdtc = new web3.eth.Contract(usdtAbi, "0x13512979ADE267AB5100878E2e0f485B568328a4")
        // // Contract that will receive USDT
        // // const recipient = new web3.eth.Contract(RECIPIENT_ABI, RECIPIENT_ADDRESS)
        // contractAddress = "0x67Aa06935A9A8DCBc7fa3FC5eB2D16F1A8Ed8169";
        // var AMOUNT = 1 * 10 ** 6;
        // var user = "0x5CF649Ab5f0791DE9F8e5A46b93374Ab319D21D5";
        // // Require user approval
        // console.log(contractAddress)
        // await usdtc.methods.approve(contractAddress, AMOUNT).send({ from: user })
        // console.log("done")

        // childContract = new web3.eth.Contract(myabi, contractAddress);

        // // Call function on recipient to retrieve USDT
        await childContract.methods.deposit(stakedAmount).send({ from: walletAddress })

        // const tx = {
        //     from: walletAddress,
        //     to: childContractAddress,
        //     data: childContract.methods.deposit(stakedAmount).encodeABI(),
        // };
        // console.log(tx);
        // await this.signTransaction(tx);
    }

    async claimTokens() {
        var childContract = new this.web3.eth.Contract(childABI, "0x35Ceaecd84DD8F5161334E29b2f6C5f2c56D0C65");
        let result = await childContract.methods.result().call()
        console.log(result)

        var parentContract = new this.web3.eth.Contract(parentABI, this.parentContractAddress);
        var walletAddress = localStorage.getItem("walletAddress")
        var gameId = this.getGameId()
        let that = this;

        parentContract.methods.games(gameId).call().then(async function(childContractAddress) {
            console.log("claimTokens() ==> childContractAddress: ", childContractAddress);
            var childContract = new that.web3.eth.Contract(childABI, childContractAddress);
            const tx = {
                from: walletAddress,
                to: childContractAddress,
                data: childContract.methods.claim().encodeABI()
            };
            await that.signTransaction(tx);
        })
    }

    async withdrawTokens() {
        var parentContract = new this.web3.eth.Contract(parentABI, this.parentContractAddress);
        var walletAddress = localStorage.getItem("walletAddress")
        var gameId = this.getGameId()
        let that = this;

        parentContract.methods.games(gameId).call().then( async function(childContractAddress) {
            console.log("withdrawTokens() ==> childContractAddress: ", childContractAddress);
            var childContract = new that.web3.eth.Contract(childABI, childContractAddress);
            const tx = {
                from: walletAddress,
                to: childContractAddress,
                data: childContract.methods.withdraw().encodeABI()
            };
            await that.signTransaction(tx);
        })
    }

    async getAmount() {
        var parentContract = new this.web3.eth.Contract(parentABI, this.parentContractAddress);
        var walletAddress = localStorage.getItem("walletAddress")
        var gameId = this.getGameId()

        console.log(walletAddress, gameId, this.parentContractAddress);

        var childContractAddress = await parentContract.methods.games(gameId).call()
        var childContract = new this.web3.eth.Contract(childABI, childContractAddress);

        var amountStaked = await childContract.methods.amount().call()
        return amountStaked
    }

}