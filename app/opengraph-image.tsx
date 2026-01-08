import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'AWURABA | Elegant African Fashion'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
    return new ImageResponse(
        (
            // Image HTML/CSS
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    fontFamily: 'serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #000',
                        padding: '40px 80px',
                        position: 'relative',
                    }}
                >
                    {/* Subtle Corner Accents */}
                    <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '20px', height: '20px', borderTop: '2px solid black', borderLeft: '2px solid black' }} />
                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '20px', height: '20px', borderBottom: '2px solid black', borderRight: '2px solid black' }} />

                    <h1
                        style={{
                            fontSize: '100px',
                            fontWeight: 900,
                            margin: 0,
                            padding: 0,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#000',
                        }}
                    >
                        AWURABA
                    </h1>
                    <div
                        style={{
                            marginTop: '10px',
                            fontSize: '20px',
                            fontWeight: 400,
                            letterSpacing: '0.5em',
                            textTransform: 'uppercase',
                            color: '#666',
                        }}
                    >
                        Elegant African Fashion
                    </div>
                </div>

                {/* Footer Text */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        fontSize: '16px',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#999',
                    }}
                >
                    Handcrafted in Ghana
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
