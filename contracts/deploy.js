import { WarpFactory } from 'warp-contracts';
import fs from 'fs';

async function deployContract() {
  // Initialize Warp
  const warp = WarpFactory.forMainnet();
  
  // Load wallet
  const wallet = JSON.parse(fs.readFileSync('wallet.json', 'utf-8'));
  
  // Load contract source
  const contractSrc = fs.readFileSync('./ArNSRegistry.js', 'utf-8');
  
  // Initial state
  const initialState = {
    records: {},
    owners: {},
    config: {
      minRegistrationDuration: 60 * 60 * 24 * 30, // 30 days
      maxRegistrationDuration: 60 * 60 * 24 * 365 * 2, // 2 years
      gracePeriod: 60 * 60 * 24 * 30, // 30 days
      priceOracle: "PRICE_ORACLE_CONTRACT_ID",
      feePercentage: 500 // 5%
    }
  };

  // Deploy contract
  console.log('Deploying contract...');
  const { contractTxId } = await warp.createContract.deploy({
    wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  });

  console.log('Contract deployed!');
  console.log('Transaction ID:', contractTxId);
  console.log('Contract ID:', contractTxId);
  
  return contractTxId;
}

deployContract().catch(console.error);