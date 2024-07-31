import { ethers } from "./ethers-5.2.esm.min.js"

import { abi, contractAddress } from "./contants.js"

const connectBtn = document.getElementById("connectBtn")
const fundBtn = document.getElementById("fundBtn")
const contractBalanceValue = document.getElementById("contractBalance")
const withdrawBtn = document.getElementById("withdrawBtn")

connectBtn.onclick = connect
fundBtn.onclick = fund
withdrawBtn.onclick = withdraw

init()

async function init() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    if (address != "") {
        connectBtn.innerHTML = address
        refreshContractBalance(provider)
    }
}

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()

        connectBtn.innerHTML = address
    } else {
        connectBtn.innerHTML = "palse install metamask"
    }
}

async function fund() {
    if (typeof window.ethereum !== "undefined") {
        const ethAmount = document.getElementById("ethAmount").value
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    } else {
        connectBtn.innerHTML = "palse install metamask"
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const ethAmount = document.getElementById("ethAmount").value
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    } else {
        connectBtn.innerHTML = "palse install metamask"
    }
}

async function listenForTransactionMine(transactionResponse, provider) {
    console.log("transaction hash: " + transactionResponse.hash)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                refreshContractBalance(provider)
            })
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

async function refreshContractBalance(provider) {
    const balance = await provider.getBalance(contractAddress)
    console.log("contract balance: " + balance)
    contractBalanceValue.value = ethers.utils.formatEther(balance)
}
