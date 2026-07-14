import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Brixs Explorer';
    const description = searchParams.get('description') || 'Explore transactions, blocks, and contracts on the Zero-Gas Layer 2.';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              width: '100%',
              padding: '80px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            {/* Top Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <img
                src="https://www.brixs.space/full_logo_black_on_white.png"
                alt="BRIXS Logo"
                width={200}
                style={{ objectFit: 'contain' }}
              />
              <div
                style={{
                  marginLeft: '20px',
                  paddingLeft: '20px',
                  borderLeft: '2px solid #eaeaea',
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#666666',
                  letterSpacing: '-0.02em',
                }}
              >
                Scan
              </div>
            </div>

            {/* Middle Section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                marginTop: '60px',
                marginBottom: '60px',
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: '#000000',
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  marginBottom: '24px',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 400,
                  color: '#4a4a4a',
                  lineHeight: 1.4,
                  maxWidth: '90%',
                }}
              >
                {description}
              </div>
            </div>

            {/* Bottom Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: '#000000',
                    letterSpacing: '-0.01em',
                  }}
                >
                  scan.brixs.space
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
