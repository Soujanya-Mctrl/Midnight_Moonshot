async function findDeployedContract() {
  const url = 'https://indexer.preview.midnight.network/api/v4/graphql';
  
  // Query Preview indexer for contract actions / deployment
  const query = `
    query {
      block {
        height
      }
    }
  `;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    console.log('Block height:', data?.data?.block?.height);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

findDeployedContract();
