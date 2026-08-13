async function scanBlocksParallel() {
  const url = 'https://indexer.preview.midnight.network/api/v4/graphql';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'query { block { height } }' }),
    });
    const data = await res.json();
    const currentHeight = data?.data?.block?.height;
    console.log(`Parallel scanning 300 blocks starting from ${currentHeight}...`);

    const parentQuery = `
      query GetBlock($height: BigInt!) {
        block(height: $height) {
          height
          transactions {
            hash
            contractActions {
              address
              state
            }
          }
        }
      }
    `;

    const fetchBlock = async (h: number) => {
      try {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: parentQuery,
            variables: { height: h },
          }),
        });
        const d = await r.json();
        const b = d?.data?.block;
        if (b && b.transactions) {
          for (const tx of b.transactions) {
            if (tx.contractActions && tx.contractActions.length > 0) {
              for (const ca of tx.contractActions) {
                console.log(`📍 Found Contract Address at block ${b.height}: ${ca.address}`);
              }
            }
          }
        }
      } catch (e) {}
    };

    // Process in batches of 30 parallel requests
    const heights = Array.from({ length: 300 }, (_, i) => currentHeight - i);
    for (let i = 0; i < heights.length; i += 30) {
      const batch = heights.slice(i, i + 30);
      await Promise.all(batch.map((h) => fetchBlock(h)));
    }
    console.log('Done scanning!');
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

scanBlocksParallel();
