import React, { useEffect, useState } from "react";
import { getMyDomains } from "../utils/arweave";

export default function MyDomains() {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const wallet = await window.arweaveWallet.getActiveAddress();
      const result = await getMyDomains(wallet);
      setDomains(result);
    }
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">My Domains</h1>
      {domains.length === 0 ? (
        <p>No domains found.</p>
      ) : (
        <ul className="mt-2">
          {domains.map((d) => (
            <li key={d.name} className="py-1 border-b">
              <strong>{d.name}</strong> - TX: {d.txId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
