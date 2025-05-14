// Initialize Arweave
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });
  
  // Wallet connection state management
  let walletAddress = null;
  
  // Check for Arweave wallet extension
  function checkArweaveWallet() {
    if (!window.arweaveWallet) {
      showNotification('Arweave wallet extension not detected. Please install ArConnect.', true);
      setTimeout(() => {
        window.open('https://arconnect.io', '_blank');
      }, 1500);
      return false;
    }
    return true;
  }
  
  // Connect wallet function with improved error handling
  async function connectArweaveWallet() {
    try {
      // Check if wallet extension is available
      if (!checkArweaveWallet()) return null;
      
      const walletBtn = document.getElementById('connect-wallet');
      
      // Set loading state
      walletBtn.disabled = true;
      walletBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
      
      // Request wallet permissions
      await window.arweaveWallet.connect([
        'ACCESS_ADDRESS',
        'SIGN_TRANSACTION',
        'DISPATCH'
      ]);
      
      // Get wallet address
      walletAddress = await window.arweaveWallet.getActiveAddress();
      
      // Update UI
      updateWalletButton(walletAddress);
      
      // Store address in localStorage
      localStorage.setItem('arweaveAddress', walletAddress);
      
      showNotification('Wallet connected successfully!');
      return walletAddress;
    } catch (error) {
      console.error('Wallet connection error:', error);
      resetWalletButton();
      showNotification(`Failed to connect wallet: ${error.message}`, true);
      return null;
    }
  }
  
  // Update wallet button UI
  function updateWalletButton(address) {
    const walletBtn = document.getElementById('connect-wallet');
    if (!walletBtn) return;
    
    const truncatedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    walletBtn.textContent = truncatedAddress;
    walletBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
    walletBtn.classList.add('bg-gray-200', 'text-gray-800', 'cursor-default');
    walletBtn.disabled = false;
  }
  
  // Reset wallet button to initial state
  function resetWalletButton() {
    const walletBtn = document.getElementById('connect-wallet');
    if (!walletBtn) return;
    
    walletBtn.textContent = 'Connect Wallet';
    walletBtn.classList.remove('bg-gray-200', 'text-gray-800', 'cursor-default');
    walletBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
    walletBtn.disabled = false;
  }
  
  // Domain purchase function with improved transaction handling
  async function buyDomain(domainName, price) {
    try {
      // Ensure wallet is connected
      if (!walletAddress) {
        walletAddress = await connectArweaveWallet();
        if (!walletAddress) {
          throw new Error('Wallet connection required');
        }
      }
      
      showNotification(`Processing purchase of ${domainName}...`);
      
      // Create transaction
      const transaction = await arweave.createTransaction({
        target: 'RECIPIENT_ADDRESS_HERE', // Replace with actual recipient
        quantity: arweave.ar.arToWinston(price.toString()),
        data: JSON.stringify({
          type: 'arns-purchase',
          domain: domainName,
          buyer: walletAddress,
          timestamp: Date.now()
        })
      });
      
      // Add tags for better discovery
      transaction.addTag('App-Name', 'ARNS-Marketplace');
      transaction.addTag('App-Version', '1.0.0');
      transaction.addTag('Type', 'domain-purchase');
      
      // Sign and post transaction
      await arweave.transactions.sign(transaction);
      const response = await arweave.transactions.post(transaction);
      
      if (response.status === 200) {
        showNotification(`Success! Domain purchased. TX ID: ${transaction.id}`);
        return transaction.id;
      } else {
        throw new Error(`Transaction failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      showNotification(`Purchase failed: ${error.message}`, true);
      throw error;
    }
  }
  
  // Initialize wallet connection on page load
  document.addEventListener('DOMContentLoaded', async function() {
    // Check for existing wallet connection
    const savedAddress = localStorage.getItem('arweaveAddress');
    if (savedAddress) {
      walletAddress = savedAddress;
      updateWalletButton(savedAddress);
    }
    
    // Set up wallet connection button
    const walletBtn = document.getElementById('connect-wallet');
    if (walletBtn) {
      walletBtn.addEventListener('click', connectArweaveWallet);
    }
    
    // Set up buy now buttons
    document.querySelectorAll('.buy-now').forEach(button => {
      button.addEventListener('click', async function(e) {
        e.preventDefault();
        const domainName = this.dataset.domain;
        const price = parseFloat(this.dataset.price);
        
        try {
          await buyDomain(domainName, price);
        } catch (error) {
          console.error('Domain purchase failed:', error);
        }
      });
    });
  });
  
  // Notification function
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
      isError ? 'bg-red-500' : 'bg-green-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }