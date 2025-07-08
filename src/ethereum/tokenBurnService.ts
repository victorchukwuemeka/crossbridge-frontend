import {Contract, ethers} from 'ethers';

//initialize the provider 
// i'm using the initialize  from the wallet
// so the function is not in use yet 
// but don't touch it victor .  
export const initializeProvider = async (rpcUrl:string , privateKey:string) => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const address = await signer.getAddress();
    return { provider, signer, address };
}

//loading the abi of the smart contract
export const loadContract = async (
  contractAddress:string,
  abi:ethers.JsonFragment[],
  signer:ethers.Signer
) => {
    // Check if contract exists at the address
    if (!signer.provider) {
       throw new Error('Signer has no provider attached');
    } 
    const code = await signer.provider.getCode(contractAddress);
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
    solanaAddress:string,
    burnAmount:string,
    provider: ethers.Provider,
    ethBalance: bigint
):Promise<bigint> => {
    
    //check eth balance 
    //const ethBalance = await provider.getBalance(userAddress);
   /* if ( ethBalance < ethers.parseEther("0.01")) {
        throw new Error('Insufficient ETH for gas');
    }*/
     console.log('=== BURN VALIDATION DEBUG ===');
     console.log('User Address:', userAddress);
     console.log('Contract Address:', await contract.getAddress());
     console.log('Burn Amount (input):', burnAmount);

     //validate solana address
     if (!solanaAddress || solanaAddress.length < 32 || solanaAddress.length > 44 ) {
      throw new Error("Invalid solana format");
     }

     // ✅ Basic validation - check if it looks like a base58 string
     const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
     if (!base58Regex.test(solanaAddress)) {
         throw new Error('Invalid Solana address - must be base58 encoded');
     }
    
      // Check contract basics
      try {
        const contractCode = await provider.getCode(await contract.getAddress());
        console.log('Contract exists:', contractCode !== '0x');
      } catch (error) {
        console.error('Contract code check failed:', error);
      }

    //check the token balance 
    let tokenBalance:bigint = 0n;
    try {
      tokenBalance = await contract.balanceOf(userAddress);
      console.log('Token balance in (wei):', tokenBalance.toString());
      console.log('Token Balance (formatted):', ethers.formatUnits(tokenBalance, 9));
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw new Error('Failed to get token balance. Is this a valid ERC20 contract?');
    }
    //const tokenBalance = await contract.balanceOf(userAddress);
    const burnAmountWei = ethers.parseUnits(burnAmount,9);

    console.log('Burn Amount (wei):', burnAmountWei.toString());
    console.log('Burn Amount (formatted):', ethers.formatUnits(burnAmountWei,9));

     if (burnAmountWei <= 0) {
      throw new Error('Burn amount must be greater than 0');
     }

     if (tokenBalance < burnAmountWei) {
        throw new Error(
            `Insufficient tokens. Have: ${ethers.formatUnits(tokenBalance, 9)} wSOL, Need: ${ethers.formatUnits(burnAmountWei, 9)} wSOL`
        );
    }

    return burnAmountWei;

}

//checking the amount of gass needed 
export const estimateGasCost = async (
    contract:ethers.Contract,
    burnAmountWei:bigint,
    solanaAddress:string,
    provider: ethers.Provider,
):Promise<{ gasLimit: bigint; gasPrice: bigint; totalGasCost: bigint }> => {

     
  try {
    // First try to call the function statically to see if it would work
     await contract.burn.staticCall(burnAmountWei,solanaAddress);
    //estimate gas limit 
    const gasLimit = await contract.burn.estimateGas(burnAmountWei, solanaAddress);
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
  } catch (error : any) {
    console.error('Gas estimation error:', error);
    
    // Provide more specific error messages
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Transaction would fail. Check your token balance and contract state.');
    }
    throw error;
  }
}

export const verifyContract = async (contract:ethers.Contract):Promise<void> => {
  try {
    const fragment = contract.interface.getFunction('burn');
    if (!fragment) {
      throw new Error('Contract does not have a burn function');
    }
    console.log('Burn function signature:', fragment.format());

    //get contract name/symbol
    try {
      const name = contract.name();
      const symbol = contract.symbol();
      console.log(`Contract: ${name} (${symbol})`);
    } catch (error) {
      console.log('Contract does not implement name/symbol');
    }
  } catch (error) {
    throw new Error('Contract does not have a burn function');
  }
}

//arrange the transaction that will be sent , with all the data needed 
export const prepareBurnTransaction = async (
    contract: ethers.Contract,
    burnAmountWei: bigint,
    solanaAddress:string,
    gasLimit : bigint,
    gasPrice : bigint,
    provider: ethers.Provider,
    signerAddress: string
) => {
     
    //nonce for counting transaction so it can't replicate
    const nonce = await provider.getTransactionCount(
        signerAddress, 
        'pending'
    );

    //transaction data 
    const txData = await contract.interface.encodeFunctionData('burn', [ burnAmountWei,solanaAddress]);

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
export const executeBurn = async (transaction:any, signer:ethers.Signer) => {
    const txResponse = await signer.sendTransaction(transaction);
    return txResponse.hash;
}

//checking if our transaction went through
export const monitorTransaction = async (
  txHash: string,
  provider: ethers.Provider
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