import {Contract, ethers} from 'ethers';

//initialize the provider 
export const initializeProvider = async (rpcUrl:string , privateKey:string) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const address = await signer.getAddress();
    return { provider, signer, address };
}

//loading the abi of the smart contract
export const loadContract = async (contractAddress:string, abi:[], signer:ethers.Wallet) => {
    // Check if contract exists at the address
    if (!signer.provider) {
       throw new Error('Signer has no provider attached');
    } 
    let code = await signer.provider.getCode(contractAddress);
    if (code === '0x') {
      throw new Error('No contract found at this address');
    }
    const contract = new ethers.Contract(contractAddress,abi,signer);
    return contract;
}

//making sure we balances and fees are enough more like validation
export const validateBurn = async (
    contract: ethers.Contract, 
    userAddress:string, 
    burnAmount:string,
    provider: ethers.JsonRpcProvider
) => {
    
    //check eth balance 
    const ethBalance = await provider.getBalance(userAddress);
    if ( ethBalance < ethers.parseEther("0.01")) {
        throw new Error('Insufficient ETH for gas');
    }
    
    //check the token balance 
    const tokenBalance = await contract.balanceOf(userAddress);
    const burnAmountWei = ethers.parseEther(burnAmount);
    if (tokenBalance < burnAmountWei) {
        throw new Error('Insufficient TOken');
    }

}

//checking the amount of gass needed 
export const estimateGasCost = async (
    contract:ethers.Contract,
    burnAmountWei:bigint,
    provider: ethers.JsonRpcProvider
) => {
    //estimate gas limit 
    const gasLimit = await contract.burn.estimateGas(burnAmountWei);
    //get current gas price 
    const gasFeeData = await provider.getFeeData();
    
    if (!gasFeeData.gasPrice) {
        throw new Error('Unable to get gas price');
    }
    const totalGasCost = gasLimit * gasFeeData.gasPrice;

    return {
    gasLimit,
    gasPrice: gasFeeData.gasPrice,
    totalGasCost
  };
}

//arrange the transaction that will be sent , with all the data needed 
export const prepareBurnTransaction = async (
    contract: ethers.Contract,
    burnAmountWei: bigint,
    gasLimit : bigint,
    gasPrice : bigint,
    provider: ethers.JsonRpcProvider,
    signerAddress: string
) => {
     
    //nonce for counting transaction so it can't replicate
    const nonce = await provider.getTransactionCount(
        signerAddress, 
        'pending'
    );

    //transaction data 
    const txData = await contract.interface.encodeFunctionData('burn', [burnAmountWei]);

    const transaction = {
        to: await contract.getAddress(),
        data: txData,
        gasLimit,
        gasPrice,
        nonce
    };

    return transaction;
}

//just sending the transaction
export const executeBurn = async (transaction:any, signer:ethers.Wallet) => {
    const txResponse = await signer.sendTransaction(transaction);
    return txResponse.hash;
}

//checking if our transaction went through
export const monitorTransaction = async (
  txHash: string,
  provider: ethers.JsonRpcProvider
) => {
  // Wait for transaction confirmation
  const receipt = await provider.waitForTransaction(txHash, 1);
  
  if (!receipt) {
    throw new Error('Transaction failed or was not found');
  }
  
  if (receipt.status === 0) {
    throw new Error('Transaction was reverted');
  }
  
  return {
    success: true,
    receipt,
    blockNumber: receipt.blockNumber
  };
};