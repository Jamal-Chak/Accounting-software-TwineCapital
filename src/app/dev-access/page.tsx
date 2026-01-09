// Quick access page for development
export default function DevAccessPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                maxWidth: '500px',
                padding: '40px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '2em',
                    marginBottom: '16px',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    🔓 Development Access
                </h1>

                <p style={{ color: '#999', marginBottom: '32px' }}>
                    Skip authentication and access the dashboard directly
                </p>

                <form action="/api/auth/dev-login" method="GET" style={{ marginBottom: '24px' }}>
                    <button type="submit" style={{
                        width: '100%',
                        padding: '16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '12px'
                    }}>
                        Access Dashboard
                    </button>
                </form>

                <div style={{
                    background: 'rgba(59,130,246,0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#999',
                    textAlign: 'left',
                    lineHeight: '1.6'
                }}>
                    <strong style={{ color: '#3b82f6' }}>ℹ️ Development Mode</strong><br />
                    This bypasses authentication for development.<br />
                    Your session will be valid for 7 days.
                </div>

                <div style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
                    Or use regular auth:
                    <div style={{ marginTop: '8px' }}>
                        <a href="/login" style={{ color: '#3b82f6', marginRight: '16px' }}>Login</a>
                        <a href="/signup" style={{ color: '#3b82f6' }}>Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
