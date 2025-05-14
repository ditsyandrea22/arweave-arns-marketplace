import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DomainSearch({ value, onChange, onSearch }) {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSearch = async () => {
    if (!value) return;
    
    setIsChecking(true);
    try {
      // Simulate availability check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAvailable(Math.random() > 0.5);
      
      if (onSearch) onSearch();
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative flex">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a domain..."
          className="w-full bg-gray-800 border border-gray-700 rounded-l-lg px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={handleSearch}
          disabled={isChecking || !value}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 px-6 py-4 rounded-r-lg font-medium"
        >
          {isChecking ? 'Checking...' : 'Search'}
        </button>
      </div>
      
      {isAvailable !== null && value && (
        <div className="mt-4 text-center">
          <p className={`text-lg ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
            {value}.ar is {isAvailable ? 'available!' : 'already registered'}
          </p>
          {isAvailable && (
            <button
              onClick={() => router.push(`/register?name=${value}`)}
              className="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
            >
              Register Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}