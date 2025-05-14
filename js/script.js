// utils/arweave.js
import Arweave from 'arweave';

// Initialize Arweave with better configuration
export const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000, // 20 seconds timeout
});

// Cache for storing ARNS domains
let arnsCache = {
  domains: [],
  lastUpdated: 0,
  cacheDuration: 5 * 60 * 1000, // 5 minutes cache
};

/**
 * Fetch ARNS domains with caching and improved error handling
 */
export async function getARNSDomains(forceRefresh = false) {
  try {
    // Return cached data if still valid
    if (!forceRefresh && Date.now() - arnsCache.lastUpdated < arnsCache.cacheDuration) {
      return arnsCache.domains;
    }

    const query = `{
      transactions(
        tags: [
          { name: "App-Name", values: ["ARNS"] }
          { name: "Domain", values: ["*"] }
        ]
        first: 100
      ) {
        edges {
          node {
            id
            owner {
              address
            }
            tags {
              name
              value
            }
          }
        }
      }
    }`;

    const response = await arweave.api.post('/graphql', { query });
    
    if (!response.data || !response.data.transactions) {
      throw new Error('Invalid response structure from Arweave');
    }

    // Process and normalize domain data
    const domains = response.data.transactions.edges.map(edge => {
      const domainTag = edge.node.tags.find(tag => tag.name === 'Domain');
      const priceTag = edge.node.tags.find(tag => tag.name === 'Price');
      
      return {
        id: edge.node.id,
        name: domainTag?.value || 'unnamed',
        owner: edge.node.owner.address,
        price: priceTag ? parseFloat(priceTag.value) : 0,
        timestamp: edge.node.block?.timestamp || Date.now(),
      };
    });

    // Update cache
    arnsCache = {
      domains,
      lastUpdated: Date.now(),
      cacheDuration: arnsCache.cacheDuration,
    };

    return domains;
  } catch (error) {
    console.error('Failed to fetch ARNS domains:', error);
    
    // Return cached data if available, even if stale
    if (arnsCache.domains.length > 0) {
      return arnsCache.domains;
    }
    
    throw new Error(`Failed to load ARNS domains: ${error.message}`);
  }
}

/**
 * Wallet connection manager
 */
export class WalletManager {
  constructor() {
    this.walletAddress = localStorage.getItem('arweaveAddress') || null;
    this.isConnecting = false;
  }

  async connect() {
    if (this.isConnecting) return null;
    this.isConnecting = true;

    try {
      if (!this._checkWalletExtension()) {
        throw new Error('ArConnect extension not detected');
      }

      await window.arweaveWallet.connect([
        'ACCESS_ADDRESS',
        'SIGN_TRANSACTION',
        'DISPATCH'
      ]);

      this.walletAddress = await window.arweaveWallet.getActiveAddress();
      localStorage.setItem('arweaveAddress', this.walletAddress);
      
      return this.walletAddress;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      this.walletAddress = null;
      localStorage.removeItem('arweaveAddress');
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect() {
    try {
      if (window.arweaveWallet) {
        await window.arweaveWallet.disconnect();
      }
      this.walletAddress = null;
      localStorage.removeItem('arweaveAddress');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
      throw error;
    }
  }

  _checkWalletExtension() {
    if (!window.arweaveWallet) {
      console.warn('ArConnect extension not detected');
      return false;
    }
    return true;
  }

  getAddress() {
    return this.walletAddress;
  }

  getShortAddress() {
    if (!this.walletAddress) return null;
    return `${this.walletAddress.substring(0, 6)}...${this.walletAddress.substring(this.walletAddress.length - 4)}`;
  }
}

/**
 * ARNS Marketplace transaction handler
 */
export class ARNSMarketplace {
  constructor(walletManager) {
    this.walletManager = walletManager;
  }

  async buyDomain(domainName, price, recipientAddress) {
    try {
      // Validate inputs
      if (!domainName || !recipientAddress) {
        throw new Error('Domain name and recipient address are required');
      }

      const address = await this.walletManager.getAddress();
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Create transaction
      const transaction = await arweave.createTransaction({
        target: recipientAddress,
        quantity: arweave.ar.arToWinston(price.toString()),
      });

      // Add metadata as tags
      transaction.addTag('App-Name', 'ARNS-Marketplace');
      transaction.addTag('App-Version', '2.0.0');
      transaction.addTag('Type', 'domain-purchase');
      transaction.addTag('Domain', domainName);
      transaction.addTag('Buyer', address);
      transaction.addTag('Timestamp', Date.now().toString());

      // Sign transaction
      await arweave.transactions.sign(transaction, undefined);
      
      // Submit transaction
      const response = await arweave.transactions.post(transaction);
      
      if (response.status !== 200) {
        throw new Error(`Transaction failed with status ${response.status}`);
      }

      return {
        transactionId: transaction.id,
        domainName,
        price,
        buyer: address,
      };
    } catch (error) {
      console.error('Domain purchase failed:', error);
      throw error;
    }
  }

  async listDomain(domainName, price) {
    // Similar implementation for listing domains
    // Would include creating a data transaction with ARNS-specific tags
  }
}

/**
 * UI Notification System
 */
export class NotificationSystem {
  static show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
      type === 'error' ? 'bg-red-500' : 
      type === 'success' ? 'bg-green-500' : 
      'bg-blue-500'
    }`;
    notification.textContent = message;
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, duration);
    
    return notification;
  }
}

// Initialize the application
export async function initializeApp() {
  try {
    const walletManager = new WalletManager();
    const marketplace = new ARNSMarketplace(walletManager);
    
    // Load domains
    const domains = await getARNSDomains();
    
    return {
      walletManager,
      marketplace,
      domains,
    };
  } catch (error) {
    NotificationSystem.show(`Initialization failed: ${error.message}`, 'error');
    throw error;
  }
}

// DOM Content Loaded handler
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { walletManager } = await initializeApp();
    
    // Setup wallet connection button
    const walletBtn = document.getElementById('connect-wallet');
    if (walletBtn) {
      walletBtn.addEventListener('click', async () => {
        try {
          await walletManager.connect();
          walletBtn.textContent = walletManager.getShortAddress();
          NotificationSystem.show('Wallet connected successfully', 'success');
        } catch (error) {
          NotificationSystem.show(`Connection failed: ${error.message}`, 'error');
        }
      });
      
      // Update button if already connected
      if (walletManager.getAddress()) {
        walletBtn.textContent = walletManager.getShortAddress();
      }
    }
    
    // Setup buy buttons
    document.querySelectorAll('.buy-now').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const domainName = button.dataset.domain;
        const price = parseFloat(button.dataset.price);
        
        try {
          const result = await marketplace.buyDomain(
            domainName, 
            price,
            'RECIPIENT_ADDRESS_HERE' // Replace with actual recipient
          );
          
          NotificationSystem.show(
            `Successfully purchased ${domainName}! TX: ${result.transactionId}`,
            'success'
          );
        } catch (error) {
          NotificationSystem.show(
            `Purchase failed: ${error.message}`,
            'error'
          );
        }
      });
    });
    
  } catch (error) {
    console.error('Application initialization failed:', error);
  }
});