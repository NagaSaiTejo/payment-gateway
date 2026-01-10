import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (email === 'test@example.com') {
            const credentials = {
                apiKey: 'key_test_abc123',
                apiSecret: 'secret_test_xyz789',
                merchantId: '550e8400-e29b-41d4-a716-446655440000',
                merchantName: 'Demo Merchant'
            };
            localStorage.setItem('merchant', JSON.stringify(credentials));
            navigate('/dashboard');
        } else {
            alert('Invalid credentials. Please use test@example.com');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '24px',
                        color: 'white',
                        fontWeight: 'bold'
                    }}>
                        PG
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your Payment Gateway dashboard</p>
                </div>

                <form data-test-id="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-input"
                            data-test-id="email-input"
                            type="email"
                            placeholder="test@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            data-test-id="password-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.25rem'
                        }}>
                            For demo, any password works with test@example.com
                        </div>
                    </div>

                    <button 
                        className="btn btn-primary" 
                        data-test-id="login-button" 
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {loading ? (
                            <>
                                <span style={{ 
                                    display: 'inline-block',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '0.5rem'
                                }}>
                                    ⏳
                                </span>
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>

                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <strong>Demo Credentials</strong>
                        </div>
                        <div style={{ 
                            marginTop: '0.5rem',
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</span>
                                <code style={{ 
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem'
                                }}>test@example.com</code>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Any password works</span>
                            </div>
                        </div>
                    </div>
                </form>

                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '2rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                }}>
                </div>
            </div>
        </div>
    );
};

export default Login;