import React, { useState, useRef, useEffect } from 'react';
import { User, Bell, Shield, LogOut, Settings, Check, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const getInitials = () => {
        if (!user) return 'M';
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        return (first + last).toUpperCase() || user.callSign?.[0] || 'O';
    };

    return (
        <header className="navbar glass">
            <div className="navbar-content">
                <div className="app-branding" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="logo-wrapper">
                        <img src="/logo.png" alt="Dilaver Logo" className="app-logo-img" />
                    </div>
                    <div className="app-brand-info">
                        <h1 className="app-title">Dilaver</h1>
                        <div className="status-indicator">
                            <span className="dot pulse"></span>
                            Sistem Çevrimiçi
                        </div>
                    </div>
                </div>

                <div className="user-actions">
                    <div className="dropdown-container" ref={notifRef}>
                        <button
                            className={`icon-btn ${showNotifs ? 'active' : ''}`}
                            onClick={() => setShowNotifs(!showNotifs)}
                            aria-label="Bildirimler"
                        >
                            <Bell size={18} />
                            <span className="notif-badge"></span>
                        </button>

                        {showNotifs && (
                            <div className="dropdown-menu notif-menu glass">
                                <div className="menu-header">
                                    <span>Bildirimler</span>
                                    <button className="clear-btn">Tümünü Oku</button>
                                </div>
                                <div className="menu-content">
                                    <div className="notif-item unread">
                                        <div className="notif-icon system">
                                            <Check size={14} />
                                        </div>
                                        <div className="notif-text">
                                            <p className="notif-msg">Soru bankası ve sınav modülü güncellendi.</p>
                                            <span className="notif-time">Az önce</span>
                                        </div>
                                    </div>
                                    <div className="notif-item">
                                        <div className="notif-icon account">
                                            <User size={14} />
                                        </div>
                                        <div className="notif-text">
                                            <p className="notif-msg">Misafir modu devrede, tüm araçlar serbestçe kullanılabilir.</p>
                                            <span className="notif-time">Aktif</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!user ? (
                        <div className="guest-nav-controls">
                            <button
                                className="nav-login-btn glass-btn"
                                onClick={() => navigate('/login')}
                            >
                                <LogIn size={15} />
                                <span className="btn-text">Giriş Yap</span>
                            </button>
                            <div className="dropdown-container" ref={userMenuRef}>
                                <div
                                    className={`call-sign-badge guest-badge ${showUserMenu ? 'active' : ''}`}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="mini-avatar guest">M</div>
                                    <span className="badge-name">Misafir</span>
                                </div>

                                {showUserMenu && (
                                    <div className="dropdown-menu user-menu glass">
                                        <div className="user-profile-header">
                                            <div className="user-avatar-circle guest">
                                                M
                                            </div>
                                            <div className="user-details">
                                                <p className="user-name">Misafir Operatör</p>
                                                <p className="user-role guest-tag">Giriş Yapılmadı</p>
                                            </div>
                                        </div>
                                        <div className="menu-divider"></div>
                                        <button className="menu-item highlight" onClick={() => { setShowUserMenu(false); navigate('/login'); }}>
                                            <LogIn size={18} />
                                            <span>Giriş Yap</span>
                                        </button>
                                        <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/register'); }}>
                                            <UserPlus size={18} />
                                            <span>Hesap Oluştur</span>
                                        </button>
                                        <div className="menu-divider"></div>
                                        <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/settings'); }}>
                                            <Settings size={18} />
                                            <span>Uygulama Ayarları</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="dropdown-container" ref={userMenuRef}>
                            <div
                                className={`call-sign-badge ${showUserMenu ? 'active' : ''}`}
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                {user?.role === 'Admin' && <Shield size={14} color="var(--primary)" style={{ marginRight: '4px' }} />}
                                <div className="mini-avatar">{getInitials()}</div>
                                <span className="badge-name">{user?.callSign || user?.firstName || 'Kullanıcı'}</span>
                            </div>

                            {showUserMenu && (
                                <div className="dropdown-menu user-menu glass">
                                    <div className="user-profile-header">
                                        <div className="user-avatar-circle">
                                            {getInitials()}
                                        </div>
                                        <div className="user-details">
                                            <p className="user-name">{user?.firstName} {user?.lastName}</p>
                                            <p className="user-role">{user?.role} Operatörü</p>
                                        </div>
                                    </div>
                                    <div className="menu-divider"></div>
                                    <button className="menu-item" onClick={() => { setShowUserMenu(false); navigate('/settings'); }}>
                                        <Settings size={18} />
                                        <span>Hesap Ayarları</span>
                                    </button>
                                    <button className="menu-item logout" onClick={handleLogout}>
                                        <LogOut size={18} />
                                        <span>Çıkış Yap</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;