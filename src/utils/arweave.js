export async function getMyDomains(address) {
    const res = await fetch(
      `https://arweave.net/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              transactions(
                owners: ["${address}"]
                tags: [{name: "Protocol-Name", values: ["ArNS"]}]
              ) {
                edges {
                  node {
                    id
                    tags {
                      name
                      value
                    }
                  }
                }
              }
            }
          `
        })
      }
    );
  
    const { data } = await res.json();
    return data.transactions.edges.map(edge => ({
      txId: edge.node.id,
      name: edge.node.tags.find(tag => tag.name === "ArNS-Name")?.value
    }));
  }
  