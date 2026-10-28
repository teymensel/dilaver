import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Clock,
    User,
    Search,
    Download,
    Upload,
    Trash2,
    FileJson,
    CheckCircle2,
    Hash
} from 'lucide-react';
import './Logbook.css';

interface Contact {
    id: string;
    callSign: string;
    name: string;
    timestamp: string;
    notes: string;
    freq?: string;
    mode?: string;
    rst?: string;
}

const Logbook: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newContact, setNewContact] = useState({
        callSign: '',
        name: '',
        notes: '',
        freq: '',
        mode: 'DMR',
        rst: '59'
    });
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('dilaver_logbook');
        if (saved) {
            try {
                setContacts(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse logbook items", e);
            }
        }
    }, []);

    const saveContacts = (updated: Contact[]) => {
        setContacts(updated);
        localStorage.setItem('dilaver_logbook', JSON.stringify(updated));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContact.callSign) return;

        const contact: Contact = {
            id: Date.now().toString(),
            callSign: newContact.callSign.toUpperCase(),
            name: newContact.name,
            timestamp: new Date().toLocaleString('tr-TR'),
            notes: newContact.notes,
            freq: newContact.freq,
            mode: newContact.mode,
            rst: newContact.rst
        };

        saveContacts([contact, ...contacts]);
        setNewContact({ callSign: '', name: '', notes: '', freq: '', mode: 'DMR', rst: '59' });
        setIsAdding(false);
        showFeedback('Kayıt başarıyla eklendi.');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
            const updated = contacts.filter(c => c.id !== id);
            saveContacts(updated);
            showFeedback('Kayıt silindi.', 'error');
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `dilaver_logbook_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showFeedback('Kayıtlar JSON olarak dışa aktarıldı.');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (Array.isArray(imported)) {
                    // Simple merge strategy: keep existing, add new unique (by id or timestamp)
                    // For now just merge and remove duplicates by ID if exists
                    const combined = [...imported, ...contacts];
                    const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
                    saveContacts(unique);
                    showFeedback(`${imported.length} kayıt başarıyla içe aktarıldı.`);
                } else {
                    showFeedback('Hatalı dosya formatı. Liste bekleniyor.', 'error');
                }
            } catch (err) {
                showFeedback('Dosya okuma hatası veya geçersiz JSON.', 'error');
            }
        };
        reader.readAsText(file);
    };

    const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 3000);
    };

    const filteredContacts = useMemo(() => {
        return contacts.filter(c =>
            c.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.mode?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contacts, searchQuery]);

    const stats = useMemo(() => {
        const uniqueCallsigns = new Set(contacts.map(c => c.callSign)).size;
        return {
            total: contacts.length,
            unique: uniqueCallsigns
        };
    }, [contacts]);

    return (
        <div className="logbook-page fade-in">
            <header className="page-header">
                <div className="header-info">
                    <h2>Kayıt Defteri</h2>
                    <p>Haberleşme trafiği ve temas kayıtları</p>
                </div>
                <div className="header-actions">
                    <label className="action-btn secondary upload-label">
                        <Upload size={18} />
                        İçe Aktar
                        <input type="file" accept=".json" onChange={handleImport} hidden />
                    </label>
                    <button className="action-btn secondary" onClick={handleExport} disabled={contacts.length === 0}>
                        <Download size={18} />
                        Dışa Aktar
                    </button>
                    <button className="action-btn primary add-trigger" onClick={() => setIsAdding(!isAdding)}>
                        <Plus size={20} />
                        {isAdding ? 'Kapat' : 'Yeni Kayıt'}
                    </button>
                </div>
            </header>

            {feedback && (
                <div className={`feedback-toast glass ${feedback.type} fade-in`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
                    {feedback.message}
                </div>
            )}

            <div className="stats-row">
                <div className="stat-card glass">
                    <Hash size={24} className="stat-icon" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Toplam Kayıt</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <User size={24} className="stat-icon" />
                    <div className="stat-content">
                        <span className="stat-value">{stats.unique}</span>
                        <span className="stat-label">Farklı İstasyon</span>
                    </div>
                </div>
                <div className="stat-card search-stat glass">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="İstasyon, isim veya notlarda ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {isAdding && (
                <div className="modal-overlay">
                    <form className="log-form glass fade-up" onSubmit={handleAdd}>
                        <div className="form-header">
                            <h3>Yeni Temas Kaydı</h3>
                            <button type="button" className="close-form" onClick={() => setIsAdding(false)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Çağrı Kodu</label>
                                <input
                                    type="text"
                                    placeholder="TA1ACM"
                                    value={newContact.callSign}
                                    onChange={(e) => setNewContact({ ...newContact, callSign: e.target.value.toUpperCase() })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>İsim</label>
                                <input
                                    type="text"
                                    placeholder="Operatör ismi"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mod</label>
                                <select
                                    value={newContact.mode}
                                    onChange={(e) => setNewContact({ ...newContact, mode: e.target.value })}
                                >
                                    <option value="DMR">DMR</option>
                                    <option value="NXDN">NXDN</option>
                                    <option value="FM">FM</option>
                                    <option value="SSB">SSB</option>
                                    <option value="CW">CW</option>
                                    <option value="FT8">FT8</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>RST / Rapor</label>
                                <input
                                    type="text"
                                    placeholder="59"
                                    value={newContact.rst}
                                    onChange={(e) => setNewContact({ ...newContact, rst: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Notlar</label>
                            <textarea
                                placeholder="Konuşma detayı, konum veya cihaz bilgisi..."
                                value={newContact.notes}
                                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>İptal</button>
                            <button type="submit" className="btn-primary">Kaydı Ekle</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="log-container">
                {filteredContacts.length > 0 ? (
                    <div className="log-table-wrapper glass">
                        <table className="log-table">
                            <thead>
                                <tr>
                                    <th><Clock size={16} /> Zaman</th>
                                    <th>İstasyon</th>
                                    <th>Operatör</th>
                                    <th>Mod</th>
                                    <th>RST</th>
                                    <th>Notlar</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="log-row">
                                        <td className="time-col">{contact.timestamp.split(',')[0]} <br /> <small>{contact.timestamp.split(',')[1]}</small></td>
                                        <td className="callsign-col"><strong>{contact.callSign}</strong></td>
                                        <td>{contact.name || '-'}</td>
                                        <td><span className={`mode-badge ${contact.mode?.toLowerCase()}`}>{contact.mode}</span></td>
                                        <td>{contact.rst || '-'}</td>
                                        <td className="notes-col">
                                            {contact.notes ? (
                                                <div className="notes-truncate" title={contact.notes}>
                                                    {contact.notes}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="actions-col">
                                            <button className="delete-btn" onClick={() => handleDelete(contact.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )).reverse()}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state glass">
                        <div className="empty-icon-wrapper">
                            <FileJson size={48} />
                        </div>
                        <h3>{searchQuery ? 'Eşleşen kayıt bulunamadı' : 'Kayıt Defteri Boş'}</h3>
                        <p>{searchQuery ? 'Farklı bir arama terimi deneyin.' : "Henüz bir telsiz teması kaydetmediniz. İlk kaydınızı 'Yeni Kayıt' butonu ile ekleyebilirsiniz."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logbook;
