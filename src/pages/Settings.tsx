import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type AssociationType, type UserProfile } from '../context/AuthContext';
import {
    LogIn,
    UserPlus,
    Sparkles,
    User,
    Shield,
    Moon,
    Sun,
    Info,
    ExternalLink,
    LogOut,
    MapPin,
    Droplets,
    Activity,
    Users,
    Edit3,
    Save,
    X,
} from 'lucide-react';
import './Settings.css';

interface EditableProfileFields {
    firstName: string;
    lastName: string;
    callSign: string;
    dmrId: string;
    region: string;
    bloodType: string;
    association: string;
    associationStatus: AssociationType;
}

interface ProfileEditQuotaStorage {
    month: string;
    counts: Record<string, number>;
}

const PROFILE_EDIT_LIMIT = 3;
const PROFILE_EDIT_STORAGE_KEY = 'dilaver_profile_edit_quota_v1';

const BLOOD_TYPE_OPTIONS = ['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'];
const ASSOCIATION_STATUS_OPTIONS: AssociationType[] = ['Üye', 'Gönüllü', 'Yok'];

const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getQuotaUserKey = (user: UserProfile | null) => {
    if (!user) {
        return 'anonymous';
    }

    const fullNameKey = `${user.firstName} ${user.lastName}`.trim().toUpperCase();
    return (user.callSign?.trim().toUpperCase() || fullNameKey || 'anonymous').replace(/\s+/g, '_');
};

const readQuotaStorage = (): ProfileEditQuotaStorage => {
    if (typeof window === 'undefined') {
        return { month: getCurrentMonthKey(), counts: {} };
    }

    try {
        const raw = window.localStorage.getItem(PROFILE_EDIT_STORAGE_KEY);
        if (!raw) {
            return { month: getCurrentMonthKey(), counts: {} };
        }

        const parsed = JSON.parse(raw) as Partial<ProfileEditQuotaStorage>;
        const month = typeof parsed.month === 'string' ? parsed.month : getCurrentMonthKey();
        const counts = parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};

        return {
            month,
            counts: counts as Record<string, number>,
        };
    } catch {
        return { month: getCurrentMonthKey(), counts: {} };
    }
};

const writeQuotaStorage = (storage: ProfileEditQuotaStorage) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(PROFILE_EDIT_STORAGE_KEY, JSON.stringify(storage));
};

const buildEditableFields = (user: UserProfile | null): EditableProfileFields => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    callSign: user?.callSign ?? '',
    dmrId: user?.dmrId ?? '',
    region: user?.region ?? '',
    bloodType: user?.bloodType ?? '',
    association: user?.association ?? '',
    associationStatus: user?.associationStatus ?? 'Yok',
});

const normalizeEditableFields = (fields: EditableProfileFields): EditableProfileFields => ({
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
    callSign: fields.callSign.trim().toUpperCase(),
    dmrId: fields.dmrId.trim().toUpperCase(),
    region: fields.region.trim(),
    bloodType: fields.bloodType.trim(),
    association: fields.association.trim(),
    associationStatus: fields.associationStatus || 'Yok',
});

const toPartialUserUpdate = (fields: EditableProfileFields): Partial<UserProfile> => ({
    firstName: fields.firstName || '',
    lastName: fields.lastName || '',
    callSign: fields.callSign || undefined,
    dmrId: fields.dmrId || undefined,
    region: fields.region || undefined,
    bloodType: fields.bloodType || undefined,
    association: fields.association || undefined,
    associationStatus: fields.associationStatus,
});

const Settings: React.FC = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    const [isEditingProfile, setIsEditingProfile] = React.useState(false);
    const [profileDraft, setProfileDraft] = React.useState<EditableProfileFields>(() => buildEditableFields(user));
    const [profileFeedback, setProfileFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [remainingMonthlyEdits, setRemainingMonthlyEdits] = React.useState(PROFILE_EDIT_LIMIT);

    React.useEffect(() => {
        setProfileDraft(buildEditableFields(user));
    }, [user]);

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('dilaver_theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.body.classList.add('light-mode');
        }
    }, []);

    React.useEffect(() => {
        const storage = readQuotaStorage();
        const currentMonth = getCurrentMonthKey();

        if (storage.month !== currentMonth) {
            const resetStorage: ProfileEditQuotaStorage = { month: currentMonth, counts: {} };
            writeQuotaStorage(resetStorage);
            setRemainingMonthlyEdits(PROFILE_EDIT_LIMIT);
            return;
        }

        const usedCount = storage.counts[getQuotaUserKey(user)] ?? 0;
        setRemainingMonthlyEdits(Math.max(0, PROFILE_EDIT_LIMIT - usedCount));
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        document.body.classList.toggle('light-mode');
        localStorage.setItem('dilaver_theme', nextMode ? 'dark' : 'light');
    };

    const beginProfileEdit = () => {
        if (remainingMonthlyEdits <= 0) {
            return;
        }

        setProfileFeedback(null);
        setProfileDraft(buildEditableFields(user));
        setIsEditingProfile(true);
    };

    const cancelProfileEdit = () => {
        setProfileFeedback(null);
        setProfileDraft(buildEditableFields(user));
        setIsEditingProfile(false);
    };

    const consumeProfileEditQuota = () => {
        const storage = readQuotaStorage();
        const currentMonth = getCurrentMonthKey();

        const monthStorage: ProfileEditQuotaStorage =
            storage.month === currentMonth ? storage : { month: currentMonth, counts: {} };

        const userKey = getQuotaUserKey(user);
        const usedCount = monthStorage.counts[userKey] ?? 0;
        monthStorage.counts[userKey] = usedCount + 1;
        writeQuotaStorage(monthStorage);

        const newRemaining = Math.max(0, PROFILE_EDIT_LIMIT - monthStorage.counts[userKey]);
        setRemainingMonthlyEdits(newRemaining);
    };

    const saveProfileChanges = () => {
        if (!user) {
            return;
        }

        if (remainingMonthlyEdits <= 0) {
            setProfileFeedback({ type: 'error', message: 'Bu ay profil değişiklik hakkınızı kullandınız (3/3).' });
            return;
        }

        const normalizedDraft = normalizeEditableFields(profileDraft);
        const normalizedCurrent = normalizeEditableFields(buildEditableFields(user));

        if (JSON.stringify(normalizedDraft) === JSON.stringify(normalizedCurrent)) {
            setProfileFeedback({ type: 'error', message: 'Kaydedilecek bir değişiklik bulunamadı.' });
            setIsEditingProfile(false);
            return;
        }

        updateProfile(toPartialUserUpdate(normalizedDraft));
        consumeProfileEditQuota();
        setProfileFeedback({ type: 'success', message: 'Profil bilgileri güncellendi.' });
        setIsEditingProfile(false);
    };

    const setDraftField = <K extends keyof EditableProfileFields>(key: K, value: EditableProfileFields[K]) => {
        setProfileDraft((prev) => ({ ...prev, [key]: value }));
    };

    const remainingLabel = `${remainingMonthlyEdits}/${PROFILE_EDIT_LIMIT}`;

    return (
        <div className="settings-page fade-in">
            <header className="page-header">
                <div>
                    <h2>Ayarlar</h2>
                    <p>Uygulama ve profil yapılandırması</p>
                </div>
            </header>

            
            {!user && (
                <section className="settings-section fade-in">
                    <div className="guest-settings-card glass">
                        <div className="guest-card-header">
                            <div className="guest-badge-pill">
                                <Sparkles size={14} />
                                <span>Misafir Operatör Modu</span>
                            </div>
                        </div>
                        <h3>Hesap Olmadan Kullanımdasınız</h3>
                        <p className="guest-card-desc">
                            Tüm sınav simülasyonları, mors araçları, röle listeleri ve arama modülleri doğrudan kullanımınıza açıktır. 
                            Çağrı işaretinizi sisteme bağlamak ve profilinizi özelleştirmek isterseniz dilediğiniz zaman giriş yapabilirsiniz.
                        </p>
                        <div className="guest-card-buttons">
                            <button className="guest-btn-primary" onClick={() => navigate('/login')}>
                                <LogIn size={16} />
                                <span>Giriş Yap</span>
                            </button>
                            <button className="guest-btn-secondary" onClick={() => navigate('/register')}>
                                <UserPlus size={16} />
                                <span>Hesap Oluştur</span>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <section className="settings-section">
                <h3>PROFİL DURUMU</h3>
                <div className="profile-status-card glass">
                    <div className="status-item">
                        <div className="status-label">Rütbe / Lisans</div>
                        <div className={`status-value badge ${user?.role === 'Eğitim' ? 'warning' : 'success'}`}>{user?.role}</div>
                    </div>
                    {!user?.isApproved && user?.role !== 'Eğitim' && (
                        <div className="approval-notice warning fade-in">
                            <Info size={16} />
                            <span>Lisansınız admin onayı bekliyor.</span>
                        </div>
                    )}
                </div>
            </section>

            <section className="settings-section">
                <div className="section-head-row">
                    <h3>KULLANICI BİLGİLERİ</h3>
                </div>

                <div className="profile-edit-actions-top">
                    {!isEditingProfile ? (
                        <button className="profile-edit-btn" onClick={beginProfileEdit} disabled={remainingMonthlyEdits === 0}>
                            <Edit3 size={16} />
                            Bilgileri Düzenle
                        </button>
                    ) : (
                        <>
                            <button className="profile-edit-btn cancel" onClick={cancelProfileEdit}>
                                <X size={16} />
                                Vazgeç
                            </button>
                            <button className="profile-edit-btn save" onClick={saveProfileChanges}>
                                <Save size={16} />
                                Kaydet
                            </button>
                            <div className={`quota-pill ${remainingMonthlyEdits === 0 ? 'limit' : ''}`}>
                                Aylık değişiklik: {remainingLabel}
                            </div>
                        </>
                    )}
                </div>

                {profileFeedback && (
                    <div className={`profile-feedback ${profileFeedback.type}`}>{profileFeedback.message}</div>
                )}

                <div className="settings-list glass">
                    <div className="settings-item">
                        <div className="item-left">
                            <User size={20} />
                            <span>İsim</span>
                        </div>
                        {isEditingProfile ? (
                            <input
                                className="item-input"
                                value={profileDraft.firstName}
                                onChange={(e) => setDraftField('firstName', e.target.value)}
                            />
                        ) : (
                            <span className="item-value">{user?.firstName || '-'}</span>
                        )}
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <User size={20} />
                            <span>Soyisim</span>
                        </div>
                        {isEditingProfile ? (
                            <input
                                className="item-input"
                                value={profileDraft.lastName}
                                onChange={(e) => setDraftField('lastName', e.target.value)}
                            />
                        ) : (
                            <span className="item-value">{user?.lastName || '-'}</span>
                        )}
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <User size={20} />
                            <span>Çağrı Kodum</span>
                        </div>
                        {isEditingProfile ? (
                            <input
                                className="item-input mono"
                                value={profileDraft.callSign}
                                onChange={(e) => setDraftField('callSign', e.target.value.toUpperCase())}
                            />
                        ) : (
                            <span className="item-value mono">{user?.callSign || 'YOK'}</span>
                        )}
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <Activity size={20} />
                            <span>DMR ID</span>
                        </div>
                        {isEditingProfile ? (
                            <input
                                className="item-input mono"
                                value={profileDraft.dmrId}
                                onChange={(e) => setDraftField('dmrId', e.target.value.toUpperCase())}
                            />
                        ) : (
                            <span className="item-value mono">{user?.dmrId || 'Belirtilmedi'}</span>
                        )}
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <MapPin size={20} />
                            <span>Bölge</span>
                        </div>
                        {isEditingProfile ? (
                            <input
                                className="item-input"
                                value={profileDraft.region}
                                onChange={(e) => setDraftField('region', e.target.value)}
                            />
                        ) : (
                            <span className="item-value">{user?.region || 'Belirtilmedi'}</span>
                        )}
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <Droplets size={20} />
                            <span>Kan Grubu</span>
                        </div>
                        {isEditingProfile ? (
                            <select
                                className="item-select"
                                value={profileDraft.bloodType}
                                onChange={(e) => setDraftField('bloodType', e.target.value)}
                            >
                                <option value="">Seçiniz</option>
                                {BLOOD_TYPE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="item-value">{user?.bloodType || 'Belirtilmedi'}</span>
                        )}
                    </div>
                </div>
            </section>

            <section className="settings-section">
                <h3>DERNEK VE YARDIMLAŞMA</h3>
                <div className="settings-list glass">
                    <div className="settings-item">
                        <div className="item-left">
                            <Users size={20} />
                            <span>Bağlı Dernek</span>
                        </div>
                        {isEditingProfile ? (
                            <input
                                className="item-input"
                                value={profileDraft.association}
                                onChange={(e) => setDraftField('association', e.target.value)}
                                placeholder="Dernek adını girin"
                            />
                        ) : (
                            <span className="item-value">{user?.association || 'Yok'}</span>
                        )}
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <Shield size={20} />
                            <span>Durum</span>
                        </div>
                        {isEditingProfile ? (
                            <select
                                className="item-select"
                                value={profileDraft.associationStatus}
                                onChange={(e) => setDraftField('associationStatus', e.target.value as AssociationType)}
                            >
                                {ASSOCIATION_STATUS_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="item-value">{user?.associationStatus || 'Yok'}</span>
                        )}
                    </div>
                </div>
            </section>

            <section className="settings-section">
                <h3>GÖRÜNÜM VE SİSTEM</h3>
                <div className="settings-list glass">
                    <div className="settings-item action" onClick={toggleTheme}>
                        <div className="item-left">
                            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                            <span>{isDarkMode ? 'Koyu Tema' : 'Açık Tema'}</span>
                        </div>
                        <div className={`toggle ${!isDarkMode ? 'active' : ''}`}>
                            <div className="toggle-thumb"></div>
                        </div>
                    </div>
                    {user && (
                        <div className="settings-item action" onClick={handleLogout}>
                            <div className="item-left">
                                <LogOut size={20} color="var(--error)" />
                                <span style={{ color: 'var(--error)' }}>Çıkış Yap ({user.callSign || user.firstName})</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="settings-section">
                <h3>HAKKINDA</h3>
                <div className="settings-list glass">
                    <div className="about-brand-banner">
                        <img src="/logo.png" alt="Dilaver" className="about-logo-img" />
                        <div className="about-brand-text">
                            <h4>Dilaver Telsiz Sistemi</h4>
                            <p>Amatör telsizciler için gelişmiş operasyon ve eğitim kiti</p>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="item-left">
                            <Info size={20} />
                            <span>Versiyon</span>
                        </div>
                        <span className="item-value">1.5.0</span>
                    </div>
                    <div className="settings-item action" onClick={() => window.open('https://teymensel.com', '_blank')}>
                        <div className="item-left">
                            <ExternalLink size={20} />
                            <span>Yapımcı: Teymensel.com</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Settings;
