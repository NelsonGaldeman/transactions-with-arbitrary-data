const ethers = require('ethers');
const { stringToHex } = require('./utils');
require('dotenv').config();

let privateKey = process.env.PRIVATE_KEY; // replace with your private key
let providerUrl = process.env.RPC_URL; // replace with your Infura project ID or any Ethereum node RPC URL

// USDT
let contractAddress = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'; // replace with your contract's address

let functionSig = '0xa9059cbb';
let recipientAddress = '0x9d88718Fa25daFa0544799C79EE43b752b08B2A2';
let amount = 0.0001;
let arbitraryData = stringToHex('Hola nico, esto funciona!!');

let wallet, provider, transaction, signedTx, txResponse;

async function sendTx() {
  // Initialize a provider
  provider = new ethers.providers.JsonRpcProvider(providerUrl);

  // Initialize a wallet with the private key and connect it to the provider
  wallet = new ethers.Wallet(privateKey, provider);

  // Initialize a contract instance
  const contract = new ethers.Contract(contractAddress, ['function decimals() public view returns (uint8)'], provider);

  // Get the number of decimals for the token
  const decimals = await contract.decimals();

  // Remove '0x' from the functionSig
  functionSig = functionSig.slice(2);

  // Remove '0x' from the recipientAddress and pad it
  recipientAddress = recipientAddress.slice(2).padStart(64, '0');

  // Convert the amount to hex and pad it
  amount = ethers.utils.hexZeroPad(ethers.utils.parseUnits(amount.toString(), decimals), 32).slice(2);

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
