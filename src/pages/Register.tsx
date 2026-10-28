import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserRole, AssociationType } from '../context/AuthContext';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import './Auth.css';

const Register: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        hasCallSign: false,
        callSign: '',
        region: 'İstanbul',
        bloodType: 'A Rh+',
        dmrId: '',
        association: 'Yok',
        associationStatus: 'Yok' as AssociationType
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock database logic
        const registeredUsers = JSON.parse(localStorage.getItem('dilaver_registered_users') || '[]');

        // Check if user already exists
        const isDuplicate = registeredUsers.some((u: any) =>
            u.email.toLowerCase() === formData.email.toLowerCase() ||
            (formData.hasCallSign && u.callSign === formData.callSign.toUpperCase())
        );

        if (isDuplicate) {
            alert('Bu e-posta veya çağrı işareti ile zaten bir hesap mevcut.');
            return;
        }

        const role: UserRole = formData.hasCallSign ? 'B Sınıfı' : 'Eğitim';
        const isApproved = formData.hasCallSign ? false : true; // License needs approval, Eğitim doesn't

        const newUser: UserProfile = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            callSign: formData.hasCallSign ? formData.callSign.toUpperCase() : undefined,
            role: role,
            dmrId: formData.dmrId,
            region: formData.region,
            bloodType: formData.bloodType,
            association: formData.association === 'Yok' ? undefined : formData.association,
            associationStatus: formData.associationStatus,
            isApproved: isApproved
        };

        // Save to mock database
        registeredUsers.push({
            ...newUser,
            email: formData.email,
            password: formData.password
        });
        localStorage.setItem('dilaver_registered_users', JSON.stringify(registeredUsers));

        login(newUser);
        navigate('/');
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/logo.png" alt="Dilaver Logo" className="auth-logo-img" />
                    </div>
                    <h2>Kayıt Ol</h2>
                    <p>Dilaver amatör telsiz topluluğuna katılın</p>
                </div>

                <div className="skip-auth-box" style={{ marginBottom: '16px' }}>
                    <button type="button" onClick={() => navigate('/')} className="skip-auth-btn">
                        <span>Hesap Açmadan Doğrudan Kullan</span>
                        <ArrowRight size={16} />
                    </button>
                </div>

                <div className="step-indicator">
                    <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {step === 1 && (
                        <div className="auth-step fade-in">
                            <div className="form-group">
                                <label>İsim</label>
                                <input
                                    type="text"
                                    placeholder="Ahmet"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Soyisim</label>
                                <input
                                    type="text"
                                    placeholder="Yılmaz"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>E-posta</label>
                                <input
                                    type="email"
                                    placeholder="ahmet@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Şifre</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="button" className="auth-btn primary" onClick={handleNext}>
                                DEVAM ET <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="auth-step fade-in">
                            <div className="form-group">
                                <label>Çağrı İşaretiniz Var mı?</label>
                                <select
                                    value={formData.hasCallSign ? 'yes' : 'no'}
                                    onChange={(e) => setFormData({ ...formData, hasCallSign: e.target.value === 'yes' })}
                                >
                                    <option value="no">Hayır, Henüz Yok (Eğitim)</option>
                                    <option value="yes">Evet, Var</option>
                                </select>
                            </div>

                            {formData.hasCallSign && (
                                <div className="form-group fade-in">
                                    <label>Çağrı İşareti</label>
                                    <input
                                        type="text"
                                        placeholder="TA1..."
                                        value={formData.callSign}
                                        onChange={(e) => setFormData({ ...formData, callSign: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Bölge / Şehir</label>
                                <input
                                    type="text"
                                    placeholder="İstanbul"
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Kan Grubu</label>
                                <select
                                    value={formData.bloodType}
                                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                >
                                    <option>A Rh+</option>
                                    <option>A Rh-</option>
                                    <option>B Rh+</option>
                                    <option>B Rh-</option>
                                    <option>AB Rh+</option>
                                    <option>AB Rh-</option>
                                    <option>0 Rh+</option>
                                    <option>0 Rh-</option>
                                </select>
                            </div>

                            <div className="auth-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="auth-btn secondary" onClick={handleBack} style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>
                                    <ArrowLeft size={18} /> GERİ
                                </button>
                                <button type="button" className="auth-btn primary" onClick={handleNext} style={{ flex: 2 }}>
                                    DEVAM ET <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="auth-step fade-in">
                            <div className="form-group">
                                <label>DMR ID (Opsiyonel)</label>
                                <input
                                    type="text"
                                    placeholder="286..."
                                    value={formData.dmrId}
                                    onChange={(e) => setFormData({ ...formData, dmrId: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Bağlı Olduğunuz Dernek</label>
                                <input
                                    type="text"
                                    placeholder="TRAC, ANTRAK vb."
                                    value={formData.association}
                                    onChange={(e) => setFormData({ ...formData, association: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Dernek Durumu</label>
                                <select
                                    value={formData.associationStatus}
                                    onChange={(e) => setFormData({ ...formData, associationStatus: e.target.value as AssociationType })}
                                >
                                    <option value="Yok">Bağlı Değil</option>
                                    <option value="Üye">Üyesi</option>
                                    <option value="Gönüllü">Gönüllüsü</option>
                                </select>
                            </div>

                            <div className="auth-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="auth-btn secondary" onClick={handleBack} style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>
                                    <ArrowLeft size={18} /> GERİ
                                </button>
                                <button type="submit" className="auth-btn primary" style={{ flex: 2 }}>
                                    KAYDI TAMAMLA <CheckCircle size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="auth-footer">
                    <p>Zaten hesabınız mı var? <Link to="/login">Giriş Yap</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
