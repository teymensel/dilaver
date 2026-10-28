import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    User,
    Globe,
    MapPin,
    Info,
    ArrowLeft,
    ExternalLink,
    Wifi,
    Database,
    MessageSquare
} from 'lucide-react';
import './Directory.css';

interface RadioIdUser {
    id: number;
    callsign: string;
    name: string;
    city: string;
    state: string;
    country: string;
    remarks: string;
    nxdn_id?: number;
    dmr_id?: number;
    surname?: string;
    region?: string;
    brandmeister?: {
        active: boolean;
        last_seen: string;
        master?: string;
    };
}

interface APRSEntry {
    name: string;
    type: string;
    time: string;
    lasttime: string;
    lat: string;
    lng: string;
    symbol: string;
    srccall: string;
    dstcall: string;
    comment?: string;
    path: string;
    speed?: string;
    altitude?: string;
    course?: string;
}

const Directory: React.FC = () => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState<'callsign' | 'dmrid' | 'aprs' | 'address' | 'nxdn'>('callsign');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RadioIdUser[]>([]);
    const [aprsResults, setAprsResults] = useState<APRSEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSearchTime, setLastSearchTime] = useState<number>(0);

    // Map Filters (Used for URL generation)
    const tailLength = 3600; // 1 hour
    const timeRange = 86400; // 24 hours
    const showOthers = false;

    // Fixed APRS API Key
    const APRS_API_KEY = '225710.9xI9UG4DDFVhT';

    const fetchWithFallback = async (url: string) => {
        // Add random query param to bypass proxy cache
        const cacheBuster = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;

        const proxies: string[] = [];

        // Local Proxy (Vite dev server) - Much more reliable for local development
        if (window.location.hostname === 'localhost') {
            if (url.includes('radioid.net')) {
                proxies.push(cacheBuster.replace(/https?:\/\/radioid\.net\/api/, '/api/radioid'));
            } else if (url.includes('api.brandmeister.network')) {
                proxies.push(cacheBuster.replace(/https?:\/\/api\.brandmeister\.network\/v2/, '/api/brandmeister'));
            } else if (url.includes('api.aprs.fi')) {
                proxies.push(cacheBuster.replace(/https?:\/\/api\.aprs\.fi\/api/, '/api/aprs'));
            }
        }

        proxies.push(
            `https://api.allorigins.win/get?url=${encodeURIComponent(cacheBuster)}`,
            `https://corsproxy.io/?url=${encodeURIComponent(cacheBuster)}`,
            `https://corsproxy.org/?${encodeURIComponent(cacheBuster)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cacheBuster)}`,
            `https://cors-anywhere.herokuapp.com/${cacheBuster}`,
            `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(cacheBuster)}`
        );

        console.log(`Fetching from ${url} with ${proxies.length} proxies...`);

        for (const proxy of proxies) {
            try {
                console.log(`Trying proxy: ${proxy.substring(0, 50)}...`);
                const response = await fetch(proxy);
                if (response.ok) {
                    const text = await response.text();
                    let data: any;

                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.warn(`Proxy ${proxy} returned non-JSON response.`);
                        continue; // Skip if not JSON
                    }

                    // Handle AllOrigins JSON wrapper {"contents": "{\"results\":[...]...}"}
                    if (data && typeof data === 'object' && 'contents' in data) {
                        try {
                            const parsed = JSON.parse(data.contents);
                            console.log(`Successfully fetched from AllOrigins.`);
                            return parsed;
                        } catch (e) {
                            // If contents not JSON, try to return directly
                            console.log(`Successfully fetched from AllOrigins (raw).`);
                            return data.contents;
                        }
                    }

                    console.log(`Successfully fetched JSON from proxy.`);
                    return data;
                } else if (response.status === 403) {
                    console.warn(`Proxy ${proxy} returned 403 (Forbidden).`);
                } else {
                    console.warn(`Proxy ${proxy} returned status: ${response.status}`);
                }
            } catch (err) {
                console.warn(`Proxy ${proxy} fetch failed:`, err);
            }
        }
        throw new Error('Tüm bağlantı yolları (Proxy) başarısız oldu. RadioID sunucuları yoğun olabilir veya ağınızda bir engel mevcut olabilir.');
    };

    const getMapUrl = (target: string, type: string) => {
        let baseUrl = `https://aprs.fi/#!`;
        if (type === 'addr') {
            baseUrl += `addr=${encodeURIComponent(target)}`;
        } else {
            baseUrl += `call=${type}%2F${target}`;
        }
        baseUrl += `&tail=${tailLength}&timerange=${timeRange}`;
        if (showOthers) baseUrl += `&others=1`;
        return baseUrl;
    };

    const openAPRS = (callsign: string, type: string = 'a') => {
        const url = getMapUrl(callsign, type);
        window.open(url, '_blank');
    };

    const formatTime = (timestamp: string) => {
        if (!timestamp) return '-';
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString('tr-TR');
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        if (searchType === 'address') {
            openAPRS(query, 'addr');
            return;
        }

        if (searchType === 'aprs') {
            const now = Date.now();
            if (now - lastSearchTime < 5000) {
                setError(`Lütfen 5 saniye bekleyin (Rate Limit).`);
                return;
            }
            setLastSearchTime(now);
        }

        if ((searchType === 'dmrid' || searchType === 'nxdn') && !/^\d+$/.test(query)) {
            setError('ID sadece sayılardan oluşmalıdır.');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);
        setAprsResults([]);

        try {
            if (searchType === 'aprs') {
                const data = await fetchWithFallback(`https://api.aprs.fi/api/get?name=${query.toUpperCase()}&what=loc&apikey=${APRS_API_KEY}&format=json`);
                if (data.result === 'ok' && data.entries?.length > 0) {
                    setAprsResults(data.entries);
                } else if (data.result === 'fail') {
                    setError(data.description || 'APRS API hatası.');
                } else {
                    setError('İstasyon bulunamadı.');
                }
            } else if (searchType === 'callsign') {
                const upperQuery = query.toUpperCase();
                const [dmrRes, nxdnRes, bmRes] = await Promise.allSettled([
                    fetchWithFallback(`https://radioid.net/api/dmr/user/?callsign=${upperQuery}`),
                    fetchWithFallback(`https://radioid.net/api/nxdn/user/?callsign=${upperQuery}`),
                    fetchWithFallback(`https://api.brandmeister.network/v2/user/get/${upperQuery}`)
                ]);

                const dmrResults = dmrRes.status === 'fulfilled' ? dmrRes.value.results || [] : [];
                const nxdnResults = nxdnRes.status === 'fulfilled' ? nxdnRes.value.results || [] : [];
                const bmData = bmRes.status === 'fulfilled' ? bmRes.value : null;

                const mergedResults: RadioIdUser[] = [];

                if (dmrResults.length > 0) {
                    dmrResults.forEach((u: any) => {
                        const user: RadioIdUser = { ...u, dmr_id: u.id };
                        const matchedNxdn = nxdnResults.find((n: any) => n.callsign === u.callsign);
                        if (matchedNxdn) user.nxdn_id = matchedNxdn.id;
                        if (bmData && bmData.callsign === u.callsign) {
                            user.brandmeister = {
                                active: !!bmData.last_seen,
                                last_seen: bmData.last_seen || '-',
                                master: bmData.master_name
                            };
                        }
                        mergedResults.push(user);
                    });
                } else if (nxdnResults.length > 0) {
                    nxdnResults.forEach((n: any) => {
                        const user: RadioIdUser = { ...n, nxdn_id: n.id };
                        if (bmData && bmData.callsign === n.callsign) {
                            user.brandmeister = {
                                active: !!bmData.last_seen,
                                last_seen: bmData.last_seen || '-',
                                master: bmData.master_name
                            };
                        }
                        mergedResults.push(user);
                    });
                } else if (bmData && bmData.callsign) {
                    mergedResults.push({
                        id: bmData.id || 0,
                        callsign: bmData.callsign,
                        name: bmData.name || bmData.callsign,
                        city: '', state: '', country: '', remarks: '',
                        brandmeister: {
                            active: true,
                            last_seen: bmData.last_seen || '-',
                            master: bmData.master_name
                        }
                    });
                }

                if (mergedResults.length > 0) setResults(mergedResults);
                else setError('Sonuç bulunamadı.');
            } else if (searchType === 'dmrid') {
                const data = await fetchWithFallback(`https://radioid.net/api/dmr/user/?id=${query}`);
                setResults((data.results || []).map((u: any) => ({ ...u, dmr_id: u.id })));
            } else if (searchType === 'nxdn') {
                const data = await fetchWithFallback(`https://radioid.net/api/nxdn/user/?id=${query}`);
                setResults((data.results || []).map((u: any) => ({ ...u, nxdn_id: u.id })));
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Sorgulama başarısız oldu. Manuel aramayı deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="directory-page fade-in">
            <header className="page-header">
                <div className="header-top">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2>Haberleşme Rehberi <span className="beta-tag">BETA</span></h2>
                </div>
                <p>Çağrı işareti, DMR ID, NXDN ve APRS sorgulama merkezi</p>
                <div className="beta-warning">
                    <Info size={14} />
                    <span>Sistem henüz beta aşamasındadır, bazı sorgular hatalı çalışabilir veya sonuç vermeyebilir.</span>
                </div>
            </header>

            <div className="search-container glass">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-type-selector overflow-x">
                        <button type="button" className={`type-btn ${searchType === 'callsign' ? 'active' : ''}`} onClick={() => { setSearchType('callsign'); setQuery(''); setError(null); }}>Çağrı İşareti</button>
                        <button type="button" className={`type-btn ${searchType === 'dmrid' ? 'active' : ''}`} onClick={() => { setSearchType('dmrid'); setQuery(''); setError(null); }}>DMR ID</button>
                        <button type="button" className={`type-btn ${searchType === 'nxdn' ? 'active' : ''}`} onClick={() => { setSearchType('nxdn'); setQuery(''); setError(null); }}>NXDN ID</button>
                        <button type="button" className={`type-btn ${searchType === 'aprs' ? 'active' : ''}`} onClick={() => { setSearchType('aprs'); setQuery(''); setError(null); }}>APRS / AIS</button>
                        <button type="button" className={`type-btn ${searchType === 'address' ? 'active' : ''}`} onClick={() => { setSearchType('address'); setQuery(''); setError(null); }}>Adres / Konum</button>
                    </div>

                    <div className="api-notice glass">
                        <Info size={16} />
                        <p><strong>Bilgi:</strong> Şu an için sunucu kaynaklı nedenlerle NXDN ve BrandMeister verileri her zaman güncel olmayabilir veya ulaşılamayabilir.</p>
                    </div>

                    <div className="search-input-wrapper">
                        <div className="input-icon">
                            {searchType === 'callsign' ? <Globe size={20} /> :
                                (searchType === 'dmrid' || searchType === 'nxdn') ? <Database size={20} /> :
                                    searchType === 'address' ? <MapPin size={20} /> : <Wifi size={20} />}
                        </div>
                        <input
                            type={(searchType === 'dmrid' || searchType === 'nxdn') ? "number" : "text"}
                            placeholder={
                                searchType === 'callsign' ? "Örn: TA1ACM" :
                                    searchType === 'dmrid' ? "DMR ID girin..." :
                                        searchType === 'nxdn' ? "NXDN ID girin..." :
                                            searchType === 'address' ? "Şehir veya Adres..." :
                                                "Çağrı İşareti veya MMSI..."
                            }
                            value={query}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (searchType === 'callsign' || searchType === 'aprs') {
                                    val = val.toUpperCase();
                                }
                                setQuery(val);
                            }}
                            onKeyDown={(e) => {
                                if ((searchType === 'dmrid' || searchType === 'nxdn') && ['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                            }}
                            className="search-input"
                        />
                        <button type="submit" className="search-submit-btn" disabled={loading}>
                            {loading ? <div className="spinner"></div> : <Search size={20} />}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="error-card glass fade-in">
                    <Info size={20} />
                    <p>{error}</p>
                    <div className="fallback-actions">
                        <button className="action-btn" onClick={() => window.open(`https://aprs.fi/#!call=a%2F${query}`, '_blank')}>Manuel Ara <ExternalLink size={12} /></button>
                    </div>
                </div>
            )}

            <div className="results-container">
                {results.map((user, uidx) => (
                    <div key={user.id || uidx} className="result-card glass fade-in">
                        <div className="result-header">
                            <div className="user-icon"><User size={24} /></div>
                            <div className="callsign-info">
                                <span className="label">İstasyon / Çağrı İşareti</span>
                                <h3 className="callsign">{user.callsign}</h3>
                                {user.brandmeister?.active && <span className="badge-bm active">BM Aktif</span>}
                            </div>
                            <div className="id-info-group">
                                {user.dmr_id && <div className="id-info-item"><span className="label">DMR ID</span><h3 className="dmr-id">{user.dmr_id}</h3></div>}
                                {user.nxdn_id && <div className="id-info-item"><span className="label">NXDN ID</span><h3 className="nxdn-id">{user.nxdn_id}</h3></div>}
                            </div>
                        </div>
                        <div className="result-body">
                            <div className="info-item"><User size={16} /><span>{user.name} {user.remarks && <small className="remarks-inline">({user.remarks})</small>}</span></div>
                            <div className="info-item"><MapPin size={16} /><span>{[user.city, user.state, user.country].filter(Boolean).join(', ')}</span></div>
                            {user.brandmeister && (
                                <div className="info-item bm-info"><Wifi size={16} /><span>BM: {user.brandmeister.master || 'Network'} <small className="last-seen">({user.brandmeister.last_seen})</small></span></div>
                            )}
                        </div>
                        <div className="result-actions">
                            <button className="action-btn aprs" onClick={() => openAPRS(user.callsign, 'a')}>
                                <Wifi size={16} /><span>Canlı Takip</span><ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                ))}

                {aprsResults.map((entry, idx) => (
                    <div key={idx} className="result-card glass fade-in aprs-card">
                        <div className="result-header">
                            <div className="user-icon aprs"><MapPin size={24} /></div>
                            <div className="callsign-info">
                                <span className="label">{entry.type === 'a' ? 'AIS (Gemi)' : 'APRS (İstasyon)'}</span>
                                <h3 className="callsign">{entry.name}</h3>
                            </div>
                            <div className="symbol-info"><span className="label">Sembol</span><div className="symbol-box">{entry.symbol}</div></div>
                        </div>
                        <div className="result-body grid">
                            <div className="info-item"><Globe size={16} /><div className="val-group"><span className="v-label">Konum</span><span>{entry.lat}, {entry.lng}</span></div></div>
                            <div className="info-item"><Wifi size={16} /><div className="val-group"><span className="v-label">Hız</span><span>{entry.speed || 0} km/h</span></div></div>
                            <div className="info-item"><Info size={16} /><div className="val-group"><span className="v-label">Son Rapor</span><span>{formatTime(entry.lasttime)}</span></div></div>
                            {entry.comment && <div className="info-item full remarks"><MessageSquare size={16} /><span>{entry.comment}</span></div>}
                        </div>
                        <div className="result-actions">
                            <button className="action-btn map" onClick={() => openAPRS(entry.name, entry.type)}>
                                <MapPin size={16} /><span>Haritada Gör</span><ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && !results.length && !aprsResults.length && !error && (
                <div className="empty-state">
                    <div className="empty-icon glass"><Search size={40} /></div>
                    <p>Çağrı işareti veya ID girerek sorgulama yapın.</p>
                </div>
            )}
        </div>
    );
};

export default Directory;
