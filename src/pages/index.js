import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useWallet } from '../hooks/useWallet';
import DomainSearch from '../components/DomainSearch';
import FeaturedDomains from '../components/FeaturedDomains';
import HowItWorks from '../components/HowItWorks';

export default function Home() {
  const { connect, disconnect, isConnected, address, balance } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>ArNS Marketplace | Decentralized Naming for Arweave</title>
        <meta name="description" content="Register and trade .ar domains on the permaweb" />
      </Head>

      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold">ArNS</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <>
              <span className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                {balance} AR
              </span>
              <button 
                onClick={disconnect}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button 
              onClick={connect}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Own Your <span className="text-purple-500">.ar</span> Domain
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Secure your decentralized identity on Arweave. Register, trade, and manage .ar domains.
        </p>
        
        <DomainSearch 
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => console.log('Search:', searchQuery)}
        />
      </section>

      {/* Featured Domains */}
      <section className="max-w-6xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold mb-8">Featured Domains</h2>
        <FeaturedDomains />
      </section>

      {/* How It Works */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <HowItWorks />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold">ArNS Marketplace</span>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}