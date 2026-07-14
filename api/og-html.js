export default function handler(req, res) {
  const path = req.query.path || '';
  
  let title = 'Brixs Chain Explorer';
  let description = 'Explore live blocks, transactions, and contracts on the Zero-Gas Layer 2.';
  
  if (path.startsWith('/tx/')) {
    const hash = path.split('/tx/')[1];
    title = `Transaction ${hash.substring(0, 8)}...${hash.slice(-6)}`;
    description = `View the details of transaction ${hash} on Brixs Chain.`;
  } else if (path.startsWith('/block/')) {
    const number = path.split('/block/')[1];
    title = `Block #${number}`;
    description = `View the transactions and details of block #${number} on Brixs Chain.`;
  } else if (path.startsWith('/address/')) {
    const addr = path.split('/address/')[1];
    title = `Address ${addr.substring(0, 8)}...${addr.slice(-6)}`;
    description = `View the balance and transactions of address ${addr} on Brixs Chain.`;
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const ogImage = `https://testnet.brixs.space/api/og?title=${encodedTitle}&description=${encodedDescription}`;
  const url = `https://testnet.brixs.space${path}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title} | Brixs Explorer</title>
        <meta name="description" content="${description}" />
        
        <meta property="og:title" content="${title} | Brixs Explorer" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${ogImage}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Brixs Chain Explorer" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title} | Brixs Explorer" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${ogImage}" />
      </head>
      <body>
        <p>Redirecting to <a href="${url}">${url}</a>...</p>
        <script>
          window.location.href = "${url}";
        </script>
      </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
}
