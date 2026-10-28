import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../context/AuthContext';
import { LogIn, ArrowRight } from 'lucide-react';
import './Auth.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Get registered users from mock DB
        const registeredUsers = JSON.parse(localStorage.getItem('dilaver_registered_users') || '[]');

        // Check if user exists (by email or callsign)
        const userFound = registeredUsers.find((u: any) =>
            u.email?.toLowerCase() === email.trim().toLowerCase() ||
            u.callSign?.toUpperCase() === email.trim().toUpperCase()
        );

        if (!userFound) {
            setError('Bu hesap kayıtlı değil. Bilgilerinizi kontrol edin veya yeni kayıt olun.');
            return;
        }

        // Validate password
        if (userFound.password !== password) {
            setError('Girdiğiniz şifre hatalı.');
            return;
        }

        // Perform login
        const { password: _, ...userProfile } = userFound;
        login(userProfile as UserProfile);
        navigate('/');
    };

    const handleSkip = () => {
        navigate('/');
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/logo.png" alt="Dilaver Logo" className="auth-logo-img" />
                    </div>
                    <h2>Dilaver</h2>
                    <p>Amatör Telsiz Operasyon ve Bilgi Sistemi</p>
                </div>

                {/* Direct skip button */}
                <div className="skip-auth-box">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="skip-auth-btn"
                    >
                        <span>Giriş Yapmadan Doğrudan Başla</span>
                        <ArrowRight size={16} />
                    </button>
                    <p className="skip-hint">Giriş yapmadan tüm sınav, mors, röle ve araçları kullanabilirsiniz.</p>
                </div>

                <div className="auth-divider">
                    <span>veya kayıtlı hesabınızla girin</span>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    {error && (
                        <div className="error-message glass fade-in" style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', marginBottom: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label>E-posta veya Çağrı İşareti</label>
                        <input
                            type="text"
                            placeholder="TA1... veya e-posta adresi"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Şifre</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn primary">
                        <LogIn size={20} />
                        GİRİŞ YAP
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Hesabınız yok mu? <Link to="/register">Hemen Kayıt Olun</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;