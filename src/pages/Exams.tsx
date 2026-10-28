import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Cpu, Globe, Radio } from 'lucide-react';
import './Exams.css';

const Exams: React.FC = () => {
    const navigate = useNavigate();

    const categories = [
        {
            icon: <BookOpen />,
            title: "MEB Telsiz Sınavı Bilgileri",
            desc: "Sınav başvuru tarihleri ve genel bilgiler",
            path: '/exam-guide'
        },
        { icon: <Zap />, title: "İşletme Soru Bankası", desc: "İşletme konuları üzerine kapsamlı soru listesi", path: '/exam-simulation', category: 'isletme' },
        { icon: <Cpu />, title: "Teknik Soru Bankası", desc: "Teknik ve elektronik konuları", path: '/exam-simulation', category: 'teknik' },
        { icon: <Globe />, title: "Düzenlemeler Soru Bankası", desc: "Ulusal ve uluslararası telsiz yönetmelikleri", path: '/exam-simulation', category: 'yonetmelik' },
        {
            icon: <Radio />,
            title: "Deneme Sınavı",
            desc: "Gerçek sınav formatında kendinizi test edin",
            path: '/exam-simulation'
        },
    ];

    return (
        <div className="exams-page fade-in">
            <header className="page-header">
                <h2>Sınav Bilgileri</h2>
                <p>Amatör Telsizcilik Sınavı Hazırlık Kaynağı</p>
            </header>

            <div className="exam-categories">
                {categories.map((cat, index) => (
                    <div
                        key={index}
                        className={`exam-card glass ${cat.path ? 'clickable' : ''}`}
                        onClick={() => cat.path && navigate(cat.path, { state: { category: (cat as any).category } })}
                    >
                        <div className="exam-icon-wrapper">
                            {cat.icon}
                        </div>
                        <div className="exam-info">
                            <h3>{cat.title}</h3>
                            <p>{cat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="exam-footer-notes glass">
                <p className="note">⚠️ <strong>Not:</strong> Sınav detayları ve ücretleri zamanla değişiklik gösterebilir. Güncel bilgiler için resmi kanalları takip ediniz.</p>
                <a
                    href="https://www.kiyiemniyeti.gov.tr/Data/1/Files/Document/Documents/Yk/H7/Pu/9K/AMAT%C3%96R%20TELS%C4%B0Z%20BELGE%20VEL%C4%B0%20OLURU%20%C3%96RNEK%20D%C4%B0LEK%C3%87E.docx"
                    className="download-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    📑 Amatör Telsiz Belge Veli Oluru Örnek Dilekçe İndir (.docx)
                </a>
            </div>
        </div>
    );
};

export default Exams;
