import { useState } from 'react';
import { useRouter } from 'next/router';

export default function DomainSearch({ initialValue = '', onSearch }) {
  const router = useRouter();
  const [domain, setDomain] = useState(initialValue);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name');
      return;
    }

    setIsChecking(true);
    setError(null);
    
    try {
      // Replace with actual API call to check domain availability
      const response = await checkDomainAvailability(domain);
      setIsAvailable(response.available);
      
      if (onSearch) {
        onSearch(domain, response.available);
      }
    } catch (err) {
      setError('Failed to check domain availability');
      console.error('Search error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mock function - replace with actual API call
  const checkDomainAvailability = async (domainName) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would be an actual API call to your backend
    return {
      available: Math.random() > 0.5,
      domain: `${domainName}.ar`,
      price: "0.1 AR",
    };
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative flex items-stretch">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a domain..."
          className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          aria-label="Domain search input"
        />
        <button
          onClick={handleSearch}
          disabled={isChecking || !domain.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 px-6 py-4 rounded-r-lg font-medium transition-colors duration-200"
          aria-busy={isChecking}
        >
          {isChecking ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">↻</span>
              Checking...
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2 text-red-400 text-center">
          {error}
        </div>
      )}

      {isAvailable !== null && domain.trim() && !error && (
        <div className="mt-4 text-center animate-fade-in">
          <p className={`text-lg ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
            {domain}.ar is {isAvailable ? 'available!' : 'already registered'}
          </p>
          {isAvailable && (
            <button
              onClick={() => router.push(`/register?name=${encodeURIComponent(domain)}`)}
              className="mt-3 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Register for 0.1 AR
            </button>
          )}
        </div>
      )}
    </div>
  );
}