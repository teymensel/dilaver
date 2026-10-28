import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Radio,
    MessageSquare,
    BookOpen,
    ChevronRight,
    Wifi,
    GraduationCap,
    Activity,
    ClipboardList,
    Search,
    LogIn,
    Sparkles,
    RadioTower,
    CheckCircle2
} from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user, isGuest } = useAuth();

    const menuItems = [
        {
            id: 'exams',
            title: 'Sınav Hazırlık ve Sorular',
            subtitle: 'Amatör Telsizcilik güncel soru bankası ve denemeler',
            badge: 'Popüler',
            icon: <GraduationCap size={24} />,
            color: '#AF52DE',
            path: '/exams'
        },
        {
            id: 'exam-simulation',
            title: 'Sınav Simülasyonu',
            subtitle: 'Gerçek zamanlı süre ve puanlama simülatörü',
            badge: 'Yeni',
            icon: <RadioTower size={24} />,
            color: '#FF2D55',
            path: '/exam-simulation'
        },
        {
            id: 'exam-guide',
            title: 'Sınav Başvuru & Bilgi',
            subtitle: 'Kıyı Emniyeti başvuru adımları ve mevzuat',
            icon: <ClipboardList size={24} />,
            color: '#FF9500',
            path: '/exam-guide'
        },
        {
            id: 'morse',
            title: 'Mors Alfabesi & Sesli Pratik',
            subtitle: 'Sesli dinleme, kod çözücü ve interaktif eğitim',
            icon: <Radio size={24} />,
            color: '#007AFF',
            path: '/morse'
        },
        {
            id: 'q-codes',
            title: 'Q-Kodları & Kısaltmalar',
            subtitle: 'Standart amatör haberleşme kodları ve fonetik alfabe',
            icon: <MessageSquare size={24} />,
            color: '#5856D6',
            path: '/q-codes'
        },
        {
            id: 'directory',
            title: 'Sorgulama Merkezi',
            subtitle: 'Çağrı İşareti, DMR ID ve APRS istasyon sorgulama',
            icon: <Search size={24} />,
            color: '#34C759',
            path: '/directory'
        },
        {
            id: 'repeaters',
            title: 'Röle & Frekanslar',
            subtitle: 'Türkiye geneli VHF/UHF röle haritası ve tonlar',
            icon: <Wifi size={24} />,
            color: '#30B0C7',
            path: '/repeaters'
        },
        {
            id: 'cevrim',
            title: 'Çevrim (Net) Operasyon Modu',
            subtitle: 'Afet ve tatbikat canlı çevrim kayıt masası',
            icon: <Activity size={24} />,
            color: '#00C7BE',
            path: '/cevrim'
        },
        {
            id: 'logbook',
            title: 'Elektronik Log Defteri',
            subtitle: 'Telsiz QSO görüşmelerinizi cihazınızda saklayın',
            icon: <BookOpen size={24} />,
            color: '#E056FD',
            path: '/logbook'
        }
    ];

    return (
        <div className="home-page fade-in">
            {/* Hero / Brand Card */}
            <div className="hero-brand-card glass">
                <div className="hero-brand-content">
                    <div className="hero-logo-box">
                        <img src="/logo.png" alt="Dilaver" className="hero-logo-img" />
                    </div>
                    <div className="hero-details">
                        <div className="hero-badge">
                            <Sparkles size={13} />
                            <span>Profesyonel Amatör Telsiz Sistemi</span>
                        </div>
                        <h2 className="hero-title">
                            {user ? (
                                <>Hoş Geldin, <span className="highlight-text">{user.callSign || user.firstName}</span></>
                            ) : (
                                <>Dilaver Telsiz İstasyonu</>
                            )}
                        </h2>
                        <p className="hero-desc">
                            {user ? (
                                `${user.role} Operatörü • Doğrulanmış Profil`
                            ) : (
                                'Giriş zorunluluğu olmadan tüm modları serbestçe kullanabilirsiniz.'
                            )}
                        </p>
                    </div>
                </div>

                {/* Guest Quick CTA if not logged in */}
                {isGuest && (
                    <div className="guest-banner">
                        <div className="guest-banner-left">
                            <CheckCircle2 size={16} className="guest-check-icon" />
                            <span>Tüm araçlar doğrudan kullanımınıza açık. İleride kayıtlarınızı eşitlemek isterseniz giriş yapabilirsiniz.</span>
                        </div>
                        <button
                            className="guest-action-pill"
                            onClick={() => navigate('/login')}
                        >
                            <LogIn size={14} />
                            <span>Giriş Yap / Kayıt Ol</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Stats / Highlights */}
            <div className="quick-summary-grid">
                <div className="summary-pill glass" onClick={() => navigate('/exams')}>
                    <span className="summary-num">730+</span>
                    <span className="summary-label">Sınav Sorusu</span>
                </div>
                <div className="summary-pill glass" onClick={() => navigate('/repeaters')}>
                    <span className="summary-num">Röle</span>
                    <span className="summary-label">Türkiye Veritabanı</span>
                </div>
                <div className="summary-pill glass" onClick={() => navigate('/morse')}>
                    <span className="summary-num">Mors</span>
                    <span className="summary-label">Sesli Pratik</span>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="section-title-wrap">
                <h3 className="section-header-title">Modüller & Operasyon Araçları</h3>
                <span className="section-tag">Tam Erişim</span>
            </div>

            <div className="menu-grid">
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        className="menu-card glass"
                        onClick={() => navigate(item.path)}
                    >
                        <div className="card-icon" style={{ backgroundColor: `${item.color}18`, color: item.color }}>
                            {item.icon}
                        </div>
                        <div className="card-content">
                            <div className="card-title-row">
                                <h3>{item.title}</h3>
                                {item.badge && (
                                    <span className="card-badge" style={{ backgroundColor: `${item.color}25`, color: item.color }}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <p>{item.subtitle}</p>
                        </div>
                        <ChevronRight size={20} className="chevron" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;