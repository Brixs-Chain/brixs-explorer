export const config = {
  matcher: ['/tx/:hash*', '/block/:number*', '/address/:addr*'],
};

export default async function middleware(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  
  // List of common social media bots
  const isBot = /bot|facebook|twitter|linkedin|discord|telegram|whatsapp|slack/i.test(userAgent);
  
  if (isBot) {
    let title = 'Brixs Chain Explorer';
    let description = 'Explore live blocks, transactions, and contracts on the Zero-Gas Layer 2.';
    
    // Simple path parsing
    if (url.pathname.startsWith('/tx/')) {
      const hash = url.pathname.split('/tx/')[1];
      title = `Transaction ${hash.substring(0, 8)}...${hash.slice(-6)}`;
      description = `View the details of transaction ${hash} on Brixs Chain.`;
    } else if (url.pathname.startsWith('/block/')) {
      const number = url.pathname.split('/block/')[1];
      title = `Block #${number}`;
      description = `View the transactions and details of block #${number} on Brixs Chain.`;
    } else if (url.pathname.startsWith('/address/')) {
      const addr = url.pathname.split('/address/')[1];
      title = `Address ${addr.substring(0, 8)}...${addr.slice(-6)}`;
      description = `View the balance and transactions of address ${addr} on Brixs Chain.`;
    }

    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const ogImage = `https://testnet.brixs.space/api/og?title=${encodedTitle}&description=${encodedDescription}`;

    // Return a simple HTML skeleton specifically for bots
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
          <meta property="og:url" content="${req.url}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${title} | Brixs Explorer" />
          <meta name="twitter:description" content="${description}" />
          <meta name="twitter:image" content="${ogImage}" />
        </head>
        <body>
          <p>Please open this link in a standard browser.</p>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  }
}
