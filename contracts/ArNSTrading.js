export async function handle(state, action) {
    const { input, caller } = action;
    const { name, price, buyer } = input;
  
    // State initialization
    if (!state.listings) state.listings = {};
    if (!state.offers) state.offers = {};
    if (!state.config) {
      state.config = {
        marketplaceFee: 250, // 2.5% in basis points
        feeRecipient: "MARKETPLACE_FEE_ADDRESS"
      };
    }
  
    // List a name for sale
    if (input.function === 'list') {
      // Verify ownership through the registry contract
      const registryState = await viewRegistryState(name);
      if (registryState.owner !== caller) {
        throw new ContractError('Not the owner');
      }
      
      state.listings[name] = {
        seller: caller,
        price: price,
        timestamp: SmartWeave.block.timestamp
      };
      return { state };
    }
  
    // Make an offer on a name
    if (input.function === 'makeOffer') {
      if (!price || price <= 0) throw new ContractError('Invalid offer price');
      
      if (!state.offers[name]) state.offers[name] = [];
      state.offers[name].push({
        buyer: caller,
        price: price,
        timestamp: SmartWeave.block.timestamp
      });
      return { state };
    }
  
    // Buy a listed name
    if (input.function === 'buy') {
      const listing = state.listings[name];
      if (!listing) throw new ContractError('Name not listed for sale');
      
      // Verify payment (pseudo-code)
      if (!verifyPayment(caller, listing.price)) {
        throw new ContractError('Insufficient payment');
      }
      
      // Calculate fees
      const feeAmount = (listing.price * state.config.marketplaceFee) / 10000;
      const sellerAmount = listing.price - feeAmount;
      
      // Transfer funds (pseudo-code)
      await transferFunds(caller, state.config.feeRecipient, feeAmount);
      await transferFunds(caller, listing.seller, sellerAmount);
      
      // Update registry ownership
      await updateRegistryOwnership(name, caller);
      
      // Remove listing
      delete state.listings[name];
      return { state };
    }
  
    // Helper function to view registry state
    async function viewRegistryState(name) {
      // In a real implementation, this would interact with the registry contract
      return { owner: "current_owner" };
    }
    
    // Helper function to update registry ownership
    async function updateRegistryOwnership(name, newOwner) {
      // Would call the registry contract's transfer function
    }
  }