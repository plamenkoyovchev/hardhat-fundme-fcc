import { contractAddress, abi } from "./constants.js";
import { ethers } from "./ethers.js";

let connectButton;
let fundButton;
let withdrawButton;
let getBalanceButton;
let provider;

function init() {
    if (typeof window.ethereum !== "undefined") { 
        // MetaMask is our provider
        provider = new ethers.providers.Web3Provider(window.ethereum);
    } else {
        console.warn("PLEASE INSTALL METAMASK!!!");
    }

    connectButton = document.getElementById("btn-connect");
    fundButton = document.getElementById("btn-fund");
    withdrawButton = document.getElementById("btn-withdraw");
    getBalanceButton = document.getElementById("btn-balance");

    connectButton.addEventListener("click", connect);
    fundButton.addEventListener("click", fund);
    withdrawButton.addEventListener("click", withdraw);
    getBalanceButton.addEventListener("click", getBalance);
}

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({method: "eth_requestAccounts"});
        connectButton.innerHTML = "Connected!";
    } else {
        console.warn("No metamask!");
    }
}

function fund() {
    action(async () => {
        const ethAmountInput = document.getElementById("fund-amount");
        const ethAmount = ethAmountInput?.value;

        // Getting contract by ABI and Address
        const contract = getContract(contractAddress, abi);

        console.log('Funding...');

        const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) });
        await listenForTransactionToBeMined(transactionResponse, provider);

        ethAmountInput.value = "";
        console.log('Funding completed.');
    });
}

function withdraw() { 
    action(async () => {
        const contract = getContract(contractAddress, abi);
        console.log('Withdrawing...')

        const transactionResponse = await contract.withdraw();
        await listenForTransactionToBeMined(transactionResponse, provider);

        console.log('Withdraw successful.');
    });
}

function getBalance() {
    action(async () => {
        const balance = await provider.getBalance(contractAddress);
        alert(`Your balance is: ${ethers.utils.formatEther(balance)}`);
    })
}

function listenForTransactionToBeMined(transactionResponse, provider) {
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(`Completed with ${transactionReceipt.confirmations} confirmations.`);
                resolve();
            });
        } catch (error) {
            console.error(error);
            reject();
        }
    });
}

function getContract(contractAddress, abi) {
    const signer = provider.getSigner();

    // Getting contract by ABI and Address
    const contract = new ethers.Contract(contractAddress, abi, signer);

    return contract;
}

async function action(callbackAsync) {
    if (!provider) {
        console.warn("PLEASE INSTALL METAMASK!!!");
        return;
    }

    try {
        await callbackAsync();
    } catch (error) {
        console.error(error);
    }
}

init();