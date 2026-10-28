import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Search, RefreshCw, WifiOff, ListFilter } from 'lucide-react';
import { repeaters as fallbackRepeaters, type RepeaterItem } from '../data/repeaterData';
import { fetchLiveRepeaters } from '../services/repeaterApi';
import './Repeaters.css';

const extractProvinceName = (city: string) => {
    const normalized = city.toLocaleUpperCase('tr-TR').replace(/[.,()/-]/g, ' ');
    const tokens = normalized.split(/\s+/).filter(Boolean);
    return tokens[0] ?? normalized;
};

const normalizeSearch = (value: string) => value.trim().toLocaleLowerCase('tr-TR');

const getRepeaterId = (item: RepeaterItem) => `${item.city}|${item.location}|${item.band}|${item.frequency}|${item.channel ?? ''}`;

const Repeaters: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [repeaters, setRepeaters] = useState<RepeaterItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [selectedProvince, setSelectedProvince] = useState('all');
    const [includeNearbyProvinces, setIncludeNearbyProvinces] = useState(false);
    const [selectedBand, setSelectedBand] = useState('all');
    const [expandedRepeaterIds, setExpandedRepeaterIds] = useState<string[]>([]);

    const loadRepeaters = async () => {
        setIsLoading(true);
        setLoadError(null);

        try {
            const data = await fetchLiveRepeaters();
            setRepeaters(data);
        } catch (error) {
            console.error('Canlı röle verisi alınamadı, yedek liste kullanılacak.', error);
            setRepeaters(fallbackRepeaters);
            setLoadError('Canlı kaynak şu an erişilemedi. Geçici olarak yerel yedek liste gösteriliyor.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRepeaters();
    }, []);

    useEffect(() => {
        setExpandedRepeaterIds([]);
    }, [searchTerm, selectedProvince, includeNearbyProvinces, selectedBand]);

    useEffect(() => {
        if (selectedProvince === 'all' && includeNearbyProvinces) {
            setIncludeNearbyProvinces(false);
        }
    }, [includeNearbyProvinces, selectedProvince]);

    const provinceOptions = useMemo(() => {
        const unique = Array.from(new Set(repeaters.map((item) => extractProvinceName(item.city))));
        return unique.sort((a, b) => a.localeCompare(b, 'tr'));
    }, [repeaters]);

    const bandOptions = useMemo(() => {
        const unique = Array.from(new Set(repeaters.map((item) => item.band).filter(Boolean)));
        return unique.sort((a, b) => a.localeCompare(b, 'tr'));
    }, [repeaters]);

    const selectedProvinceContext = useMemo(() => {
        if (selectedProvince === 'all') {
            return null;
        }

        return repeaters.find((item) => extractProvinceName(item.city) === selectedProvince) ?? null;
    }, [repeaters, selectedProvince]);

    const filteredRepeaters = useMemo(() => {
        const search = normalizeSearch(searchTerm);

        return repeaters.filter((item) => {
            const province = extractProvinceName(item.city);

            const matchesProvince = (() => {
                if (selectedProvince === 'all') {
                    return true;
                }

                if (province === selectedProvince) {
                    return true;
                }

                if (!includeNearbyProvinces || !selectedProvinceContext) {
                    return false;
                }

                const sameTaRegion = item.taRegion && selectedProvinceContext.taRegion && item.taRegion === selectedProvinceContext.taRegion;
                const sameGeoRegion =
                    item.geoRegion && selectedProvinceContext.geoRegion && item.geoRegion === selectedProvinceContext.geoRegion;

                return Boolean(sameTaRegion || sameGeoRegion);
            })();

            if (!matchesProvince) {
                return false;
            }

            if (selectedBand !== 'all' && item.band !== selectedBand) {
                return false;
            }

            if (!search) {
                return true;
            }

            const searchable = [
                item.city,
                item.location,
                item.band,
                item.frequency,
                item.tone,
                item.taRegion,
                item.geoRegion,
                item.channel,
                item.locator,
                item.status,
            ]
                .filter(Boolean)
                .join(' ')
                .toLocaleLowerCase('tr-TR');

            return searchable.includes(search);
        });
    }, [repeaters, searchTerm, selectedProvince, includeNearbyProvinces, selectedProvinceContext, selectedBand]);

    const toggleDetails = (id: string) => {
        setExpandedRepeaterIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    return (
        <div className="repeaters-page fade-in">
            <header className="page-header">
                <h2>Röle Bilgileri</h2>
                <p>Telsiz Röle Frekans ve Ton Listesi (Canlı Kaynak)</p>
            </header>

            <div className="repeaters-toolbar">
                <div className="search-bar glass">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Şehir, konum, bant veya frekans ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="refresh-btn" onClick={loadRepeaters} disabled={isLoading}>
                    <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                    Yenile
                </button>
            </div>

            <div className="repeater-filters glass">
                <div className="filter-title">
                    <ListFilter size={16} />
                    <span>Gelişmiş Filtre</span>
                </div>
                <div className="filter-grid">
                    <div className="filter-field">
                        <label>İli</label>
                        <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                            <option value="all">Hepsi</option>
                            {provinceOptions.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="nearby-toggle">
                        <input
                            type="checkbox"
                            checked={includeNearbyProvinces}
                            disabled={selectedProvince === 'all'}
                            onChange={(e) => setIncludeNearbyProvinces(e.target.checked)}
                        />
                        Çevre İlleri Göster
                    </label>

                    <div className="filter-field">
                        <label>Band</label>
                        <select value={selectedBand} onChange={(e) => setSelectedBand(e.target.value)}>
                            <option value="all">Hepsi</option>
                            {bandOptions.map((band) => (
                                <option key={band} value={band}>
                                    {band}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loadError && (
                <div className="source-warning glass">
                    <WifiOff size={16} />
                    <span>{loadError}</span>
                </div>
            )}

            {isLoading ? (
                <div className="repeater-loading glass">Röle listesi canlı kaynaktan yükleniyor...</div>
            ) : (
                <div className="repeater-list">
                    {filteredRepeaters.length > 0 ? (
                        filteredRepeaters.map((item, index) => {
                            const repeaterId = getRepeaterId(item);
                            const isExpanded = expandedRepeaterIds.includes(repeaterId);

                            return (
                                <div key={`${repeaterId}-${index}`} className="repeater-card glass">
                                    <div className="repeater-city">
                                        <MapPin size={16} />
                                        <span>{item.city}</span>
                                    </div>

                                    <div className="repeater-details">
                                        <div className="detail-item">
                                            <span className="label">Bant:</span>
                                            <span className="value">{item.band}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Yeri:</span>
                                            <span className="value">{item.location}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Frekans:</span>
                                            <span className="value highlight">{item.frequency}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Tone:</span>
                                            <span className="value">{item.tone}</span>
                                        </div>
                                    </div>

                                    <button className="detail-btn" onClick={() => toggleDetails(repeaterId)}>
                                        {isExpanded ? 'Detayı Gizle' : 'Detay'}
                                    </button>

                                    {isExpanded && (
                                        <div className="repeater-advanced">
                                            <div className="detail-item">
                                                <span className="label">TA Bölge:</span>
                                                <span className="value">{item.taRegion || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Coğrafi Bölge:</span>
                                                <span className="value">{item.geoRegion || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Yükseklik:</span>
                                                <span className="value">{item.altitude || item.distance || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Gücü:</span>
                                                <span className="value">{item.power || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Kanal:</span>
                                                <span className="value">{item.channel || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Sql:</span>
                                                <span className="value">{item.sql || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Ruhsat:</span>
                                                <span className="value">{item.license || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Durum:</span>
                                                <span className="value">{item.status || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Locator:</span>
                                                <span className="value">{item.locator || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Teşekkür:</span>
                                                <span className="value">{item.thanks || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Gün.Tar.:</span>
                                                <span className="value">{item.updatedAt || '-'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-results">Sonuç bulunamadı.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Repeaters;
