import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { qCodes } from '../data/qCodesData';
import './QCodes.css';

const QCodes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCodes = qCodes.filter(item =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="qcodes-page fade-in">
            <header className="page-header">
                <h2>Q Kodları</h2>
                <p>Telsiz Kısaltmaları ve Anlamları</p>
            </header>

            <div className="search-bar glass">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Kod veya anlam ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="qcodes-list">
                {filteredCodes.length > 0 ? (
                    filteredCodes.map((item) => (
                        <div key={item.code} className="qcode-item glass">
                            <div className="qcode-header">
                                <span className="qcode-label">{item.code}</span>
                            </div>
                            <div className="qcode-meaning">
                                {item.meaning}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">Sonuç bulunamadı.</div>
                )}
            </div>
        </div>
    );
};

export default QCodes;
