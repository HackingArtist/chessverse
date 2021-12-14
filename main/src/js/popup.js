import "../css/popup.css";

import Utils from './utils';
import localStorageUtils from './localStorageUtils';

const web3utils = new Utils();
const lsUtils = new localStorageUtils();


async function connectWallet() {
    console.debug("connectWallet");
    let status = await web3utils.login();

    if (status) {
        location.reload();
    }
}


export default async function init () {
    console.log("Chess Dapp Activated!");
    let userLoginStatus = web3utils.isUserLoggedIn()
    console.log("userLoginStatus ==> ", userLoginStatus)
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(async function(mutations, observer) {
        let inviteSection = document.querySelector("#ping-challenge > div.invite");
        let joinSectionWrap = document.querySelector("#main-wrap > main")
        let topSection = document.querySelector("#main-wrap > main > div.round__app.variant-standard > div.ruser-top.ruser.user-link.online")
        let bottomSection = document.querySelector("#main-wrap > main > div.round__app.variant-standard > div.ruser-bottom.ruser.user-link.online")

        let navBar = document.querySelector("#top > div.site-buttons")

        if (navBar != null && navBar.children.length == 3) {
            
            let claimButton = document.createElement("button");
            claimButton.className = "signin button button-empty"
            claimButton.innerText = "Claim Tokens"
            claimButton.onclick = async function () {
                if (userLoginStatus) {
                    console.log("Login to wallet");
                }
                await web3utils.claimTokens()
            }

            navBar.appendChild(claimButton)
            if (userLoginStatus) {
                let disconnectWalletButton = document.createElement("button");
                disconnectWalletButton.className = "signin button button-red button-empty"
                disconnectWalletButton.innerText = "Disconnect"
                disconnectWalletButton.onclick = async function () { 
                    await web3utils.logout()
                }

                navBar.appendChild(disconnectWalletButton);
            } else {
                let connectWalletButton = document.createElement("button");
                connectWalletButton.className = "signin button button-empty"
                connectWalletButton.innerText = "Connect"
                connectWalletButton.onclick = connectWallet;
                navBar.appendChild(connectWalletButton);
            }
        }

        if (topSection != null && topSection.children.length == 2) {
            var tokensStaked = await web3utils.getAmount()

            var tokenTitle = document.createElement('span');
            tokenTitle.setAttribute("style", "margin-left:10px")

            tokenTitle.innerText = ` staked ${tokensStaked} USDT`;
            topSection.appendChild(tokenTitle)
        }

        if (bottomSection != null && bottomSection.children.length == 2) {
            var tokensStaked = await web3utils.getAmount()

            var tokenTitle = document.createElement('span');
            tokenTitle.setAttribute("style", "margin-left: 10px")
            tokenTitle.innerText = ` staked ${tokensStaked} USDT`;
            bottomSection.appendChild(tokenTitle);

            // Actions
            var clickSection = document.querySelector("#main-wrap > main > div.round__app.variant-standard > div.rcontrols > div")
            
            var withDrawButton = document.createElement("button")
            withDrawButton.className = "fbt draw-yes"
            withDrawButton.setAttribute("title", "Withdraw")
            
            let withDrawIcon = document.createElement("span")
            withDrawIcon.innerText = "ᐁ"

            withDrawButton.appendChild(withDrawIcon)

            withDrawButton.onclick = async function () {
                console.log(" withDrawButton.onclick ==> INIT")
                await web3utils.withdrawTokens()
                console.log(" withDrawButton.onclick ==> DONE")
            }

            //
            var claimButton = document.createElement("button")
            claimButton.className = "fbt draw-yes"
            claimButton.setAttribute("title", "Claim")
            
            let claimIcon = document.createElement("span")
            claimIcon.innerText = "$"

            claimButton.appendChild(claimIcon)

            claimButton.onclick = async function() {
                console.log(" claimButton.onclick ==> INIT")
                await web3utils.claimTokens()
                console.log(" claimButton.onclick ==> DONE")
            }
            
            clickSection.appendChild(withDrawButton);
            clickSection.appendChild(claimButton);

            //
        }

        if (inviteSection != null && inviteSection.children.length == 1) {
            console.debug(inviteSection);

            lsUtils.setValue("player", "A");
            lsUtils.setValue("opponent", "B");
            lsUtils.setValue("lastGameUrl", location.href)

            if (userLoginStatus) {

                var sectionHeading = document.createElement('h2');
                sectionHeading.className = 'ninja-title'
                sectionHeading.innerText = `USDT`;
                let breakSection = document.createElement('br');

                var createGameButton = document.createElement("button");
                createGameButton.className = "button button-blue text";
                createGameButton.innerText = "Create Game"
                createGameButton.onclick = async function () {
                    let stakedTokens = document.getElementById('stake_amount').value
                    console.log(stakedTokens);
                    await web3utils.createGame(stakedTokens);
                    alert("Game Created");
                    
                }

                var stakeButton = document.createElement("button");
                stakeButton.className = "button button-blue text";
                stakeButton.innerText = "Stake"
                stakeButton.setAttribute("style", "margin-left: 10px")
                stakeButton.onclick = async function () {
                    // let stakedTokens = document.getElementById('stake_amount').value
                    await web3utils.depositTokens()
                    alert("Transaction Complete");
                }

                var inputBox = document.createElement("input");
                inputBox.setAttribute("min", 1)
                inputBox.value = 10
                inputBox.id = "stake_amount"
                inputBox.size = 16
                inputBox.type = "number"
                inputBox.className = "autoselect"

                var walletConnetSection = document.createElement('div');
                walletConnetSection.appendChild(sectionHeading)
                walletConnetSection.appendChild(document.createElement('br'))

                walletConnetSection.appendChild(inputBox)
                walletConnetSection.appendChild(document.createElement('br'))
                walletConnetSection.appendChild(document.createElement('br'))

                walletConnetSection.appendChild(createGameButton)
                walletConnetSection.appendChild(stakeButton)

                inviteSection.insertBefore(walletConnetSection, inviteSection.children[0])
            } else {
                // TODO: SHOW PLEASE CONNECT YOUR WALLET
                var sectionHeading = document.createElement('h2');
                sectionHeading.className = 'ninja-title'
                sectionHeading.innerText = "Please connect your wallet.";
                let breakSection = document.createElement('br');

                var connectWalletButton = document.createElement("button");
                connectWalletButton.className = "button button-blue text";
                connectWalletButton.innerText = "Connect"
                inviteSection.insertBefore(walletConnetSection, inviteSection.children[0])
            }
        } else if (joinSectionWrap != null && joinSectionWrap.children.length == 3) {
            joinSectionWrap.children[2].hidden = true

            lsUtils.setValue("player", "B");
            lsUtils.setValue("opponent", "A");
            lsUtils.setValue("lastGameUrl", location.href)

            let wrapper = document.createElement("div");
            wrapper.className = "invite"
            wrapper.setAttribute("align", "center")

            if (userLoginStatus) {
                let address = web3utils.getWalletAddress();

                if (address != null) {
                    address = address.substr(0, 5) + "..." + address.substr(-3)
                }
                console.log(address);

                var sectionHeading = document.createElement('h2');
                sectionHeading.className = 'ninja-title'
                let tokens =  10 ** 8; //await web3utils.getAmount()
                sectionHeading.innerText = `Opponent Staked: ${tokens} USDT`;
                let breakSection = document.createElement('br');

                var matchButton = document.createElement("button");
                matchButton.className = "button button-blue text";
                matchButton.innerText = "Match"
                matchButton.onclick = async function () {
                    await web3utils.depositTokens();
                    joinSectionWrap.children[2].children[0].click()
                }

                // var inputBox = document.createElement("input");
                // inputBox.setAttribute("min", 1)
                // inputBox.value = 50
                // inputBox.size = 16
                // inputBox.type = "number"
                // inputBox.className = "autoselect"

                var walletConnetSection = document.createElement('div');
                walletConnetSection.appendChild(sectionHeading)
                walletConnetSection.appendChild(document.createElement('br'))

                // walletConnetSection.appendChild(inputBox)
                walletConnetSection.appendChild(document.createElement('br'))
                walletConnetSection.appendChild(document.createElement('br'))

                walletConnetSection.appendChild(matchButton)
                wrapper.appendChild(walletConnetSection)

                joinSectionWrap.appendChild(wrapper)
            } else {
                var sectionHeading = document.createElement('h2');
                sectionHeading.className = 'ninja-title'
                sectionHeading.innerText ="Please connect your wallet.";
                let breakSection = document.createElement('br');
                var walletConnetSection = document.createElement('div');
                walletConnetSection.appendChild(sectionHeading)
                walletConnetSection.appendChild(breakSection)
                wrapper.appendChild(walletConnetSection)
                joinSectionWrap.insertBefore(wrapper, joinSectionWrap.children[0])
            }
        }

    });

    observer.observe(document, {
        subtree: true,
        attributes: true
    });
};

init()