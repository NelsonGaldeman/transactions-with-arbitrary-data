const ethers = require('ethers');
const { stringToHex } = require('./utils');
require('dotenv').config();

let privateKey = process.env.PRIVATE_KEY; // replace with your private key
let providerUrl = process.env.RPC_URL; // replace with your Infura project ID or any Ethereum node RPC URL

// DAI
let contractAddress = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'; // replace with your contract's address

let functionSig = '0xa9059cbb';
let recipientAddress = '0x9d88718Fa25daFa0544799C79EE43b752b08B2A2';
let amount = 1; //in wei
let arbitraryData = stringToHex('Hola nico, esto funciona!!');

let wallet, provider, transaction, signedTx, txResponse;

async function sendTx() {
  // Initialize a provider
  provider = new ethers.providers.JsonRpcProvider(providerUrl);

  // Initialize a wallet with the private key and connect it to the provider
  wallet = new ethers.Wallet(privateKey, provider);
  // Remove '0x' from the functionSig
  functionSig = functionSig.slice(2);

  // Remove '0x' from the recipientAddress and pad it
  recipientAddress = recipientAddress.slice(2).padStart(64, '0');

  // Convert the amount to hex and pad it
  amount = ethers.utils.hexZeroPad(ethers.utils.hexlify(amount), 32).slice(2);

  // Construct the transaction data
  let data = '0x' + functionSig + recipientAddress + amount + arbitraryData;

  // Get chain ID
  const network = await provider.getNetwork();
  const chainId = network.chainId;

  // Get gas price
  const gasPrice = await provider.getGasPrice();

  // Construct the transaction object
  transaction = {
    to: contractAddress,
    data: data,
    gasPrice: gasPrice,
    gasLimit: ethers.utils.hexlify(100000), // Gas limit
    nonce: await wallet.getTransactionCount("pending"),
    value: ethers.utils.parseEther("0.0").toHexString(),
    chainId: chainId,
  };

  // Sign the transaction
  signedTx = await wallet.signTransaction(transaction);

  // Send the transaction and wait for its hash
  txResponse = await provider.sendTransaction(signedTx);

  // Print out the transaction hash
  console.log("Transaction hash: ", txResponse.hash);

  // Wait for the transaction to be mined and print out the transaction receipt
  let receipt = await txResponse.wait();
  console.log("Transaction was mined in block: ", receipt.blockNumber);
}

sendTx().catch(console.error);
