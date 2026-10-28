import React from 'react';
import {
    Info,
    ClipboardList,
    CreditCard,
    GraduationCap,
    ExternalLink,
    Mail,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ExamGuide.css';

const ExamGuide: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="exam-guide-page fade-in">
            <header className="page-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Sınav Başvuru Rehberi (2026)</h2>
                <p>Amatör Telsizcilik Belgesi ve MEB e-Sınav Süreci</p>
            </header>

            <div className="guide-container">
                {/* Genel Bilgi */}
                <section className="guide-section glass">
                    <h3><Info size={24} /> Genel Bilgilendirme</h3>
                    <div className="guide-content">
                        Amatör telsizci olabilmek için Milli Eğitim Bakanlığı'nın (MEB) e-sınav merkezlerinde yapılan online sınava girmeniz gerekmektedir.
                        12 yaşını doldurmuş ve temyiz kudretine sahip her vatandaş başvurabilir.
                    </div>
                    <div className="tip-box">
                        <h4><Info size={18} /> Önemli Tavsiye</h4>
                        <p>Kayıt işlemi için mobil telefon yerine <strong>bilgisayar (PC)</strong> kullanın. Mobil cihazlar resim yükleme esnasında hata verebilmektedir.</p>
                    </div>
                </section>

                {/* Başvuru Adımları */}
                <section className="guide-section glass">
                    <h3><ClipboardList size={24} /> Adım Adım Başvuru Süreci</h3>
                    <div className="step-list">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <div className="step-text">
                                <strong>Ön Başvuru:</strong> <a href="https://www.kiyiemniyeti.gov.tr/ehizmetler/index" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>KEGM e-Hizmetler</a> üzerinden "Amatör Telsiz Sınavı Ön Başvuru" seçilir ve e-Devlet ile giriş yapılır.
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <div className="step-text">
                                <strong>Kurum Seçimi:</strong> Sınav yapan kurum olarak mutlaka <strong>Milli Eğitim Bakanlığı</strong> seçilmelidir.
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <div className="step-text">
                                <strong>Grup Seçimi:</strong> Başvuru esnasında <strong>A-B Sınav Grubunu</strong> seçmeniz gerekmektedir.
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <div className="step-text">
                                <strong>Fotoğraf:</strong> Bilgisayar üzerinden düzgün çekilmiş bir vesikalık fotoğraf yüklenmelidir.
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">5</div>
                            <div className="step-text">
                                <strong>Onay ve Ödeme:</strong> Başvuru 3-5 iş günü içinde onaylanır. Onay sonrası <a href="https://odeme.meb.gov.tr/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>odeme.meb.gov.tr</a> üzerinden sınav ücreti yatırılır.
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2026 Ücretleri */}
                <section className="guide-section glass">
                    <h3><CreditCard size={24} /> 2026 Güncel Ücret Tarifesi</h3>
                    <div className="guide-content">
                        19.12.2025 tarihli Kurul kararı ile 01.01.2026'dan itibaren geçerli ücretler:
                    </div>
                    <div className="price-table-container">
                        <table className="price-table">
                            <thead>
                                <tr>
                                    <th>İşlem Türü</th>
                                    <th>Standart</th>
                                    <th>Öğrenci/Engelli</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Sınav Ücreti</td>
                                    <td>1.022 TL</td>
                                    <td>510 TL</td>
                                </tr>
                                <tr>
                                    <td>Belge (Kart) Ücreti</td>
                                    <td>1.276 TL</td>
                                    <td>638 TL</td>
                                </tr>
                                <tr>
                                    <td>Sınav İtiraz Ücreti</td>
                                    <td>448 TL</td>
                                    <td>224 TL</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="notice-text">* Şehit/Gazi eş ve çocukları için tüm işlemler ücretsizdir.</p>
                </section>

                {/* Sınav ve Puanlama */}
                <section className="guide-section glass">
                    <h3><GraduationCap size={24} /> Sınav Başarı Kriterleri</h3>
                    <div className="guide-content">
                        e-Sınav havuzundaki 400 soru içerisinden rastgele seçilen 50 soru sorulmaktadır.
                    </div>
                    <div className="info-cards">
                        <div className="info-card">
                            <h4>A Sınıfı Belge</h4>
                            <span className="badge badge-a">75 ve Üzeri Puan</span>
                            <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>En geniş yetkiye sahip amatör telsizcilik sınıfıdır.</p>
                        </div>
                        <div className="info-card">
                            <h4>B Sınıfı Belge</h4>
                            <span className="badge badge-b">60 - 74 Arası Puan</span>
                            <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Orta seviye yetki sunan telsizcilik sınıfıdır.</p>
                        </div>
                    </div>
                    <p className="notice-text">* Bilgiler ve puanlama kriterleri resmi kurumlarca güncellenebilir.</p>
                </section>

                {/* 12-16 Yaş Arası Adaylar */}
                <section className="guide-section glass">
                    <h3><Mail size={24} /> 12-16 Yaş Arası Adaylar</h3>
                    <div className="guide-content">
                        Velisiyle birlikte başvuracak genç adaylar, gerekli formları doldurarak başvurularını mail yoluyla iletebilirler.
                    </div>
                    <div className="links-grid">
                        <a href="https://www.kiyiemniyeti.gov.tr/Data/1/Files/Document/Documents/Yk/H7/Pu/9K/AMAT%C3%96R%20TELS%C4%B0Z%20BELGE%20VEL%C4%B0%20OLURU%20%C3%96RNEK%20D%C4%B0LEK%C3%87E.docx" className="guide-link">
                            Veli Olur Belgesi (İndir) <ExternalLink size={16} />
                        </a>
                        <div className="guide-link">
                            Mail: amatortelsiz@kiyiemniyeti.gov.tr
                        </div>
                    </div>
                </section>

                {/* Faydalı Bağlantılar */}
                <section className="guide-section glass">
                    <h3><ExternalLink size={24} /> Faydalı Bağlantılar</h3>
                    <div className="links-grid">
                        <a href="https://www.kiyiemniyeti.gov.tr/ehizmetler/index" target="_blank" rel="noopener noreferrer" className="guide-link">
                            Hizmet Sorgulama Paneli <ExternalLink size={16} />
                        </a>
                        <a href="https://www.kiyiemniyeti.gov.tr/ehizmetler/cagri_isareti_alma" target="_blank" rel="noopener noreferrer" className="guide-link">
                            e-Çağrı İşareti Alma <ExternalLink size={16} />
                        </a>
                        <a href="https://www.meb.gov.tr/meb_iys_dosyalar/2026_01/30122332_Amator_Telsizcilik_e-Sinav_Kilavuzu_2026.pdf" target="_blank" rel="noopener noreferrer" className="guide-link">
                            2026 e-Sınav Kılavuzu (PDF) <ExternalLink size={16} />
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ExamGuide;
