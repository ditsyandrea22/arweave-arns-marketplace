export async function handle(state, action) {
    const { input, caller } = action;
    const { name, target, duration } = input;
  
    // State initialization
    if (!state.records) state.records = {};
    if (!state.owners) state.owners = {};
    if (!state.config) {
      state.config = {
        minRegistrationDuration: 60 * 60 * 24 * 30, // 30 days in seconds
        maxRegistrationDuration: 60 * 60 * 24 * 365 * 2, // 2 years
        gracePeriod: 60 * 60 * 24 * 30, // 30 days
        priceOracle: "YOUR_PRICE_ORACLE_CONTRACT",
        feePercentage: 500 // 5% in basis points
      };
    }
  
    // Register a new name
    if (input.function === 'register') {
      // Validate input
      if (!name || name.length < 3) throw new ContractError('Name too short');
      if (state.records[name]) throw new ContractError('Name already registered');
      
      // Calculate required payment
      const durationInSeconds = duration * 60 * 60 * 24; // Convert days to seconds
      const price = await getPrice(name, durationInSeconds);
      
      // Check payment (pseudo-code)
      if (!verifyPayment(caller, price)) {
        throw new ContractError('Insufficient payment');
      }
      
      // Register name
      const expiry = SmartWeave.block.timestamp + durationInSeconds;
      state.records[name] = {
        owner: caller,
        target: target || caller,
        expiry,
        forSale: false
      };
      
      // Track owner's names
      if (!state.owners[caller]) state.owners[caller] = [];
      state.owners[caller].push(name);
      
      return { state };
    }
  
    // Renew a name
    if (input.function === 'renew') {
      const record = state.records[name];
      if (!record) throw new ContractError('Name not registered');
      if (record.owner !== caller) throw new ContractError('Not the owner');
      
      const durationInSeconds = duration * 60 * 60 * 24;
      const price = await getPrice(name, durationInSeconds);
      
      if (!verifyPayment(caller, price)) {
        throw new ContractError('Insufficient payment');
      }
      
      record.expiry += durationInSeconds;
      return { state };
    }
  
    // Helper function to get price from oracle
    async function getPrice(name, duration) {
      // In a real implementation, this would call a price oracle contract
      const lengthMultiplier = Math.max(1, 10 - name.length);
      return duration * lengthMultiplier * 1000; // Example pricing
    }
    
    // Helper function to verify payment (pseudo-implementation)
    function verifyPayment(from, amount) {
      // In a real implementation, this would check the caller's balance
      // or verify a token transfer
      return true;
    }
  }