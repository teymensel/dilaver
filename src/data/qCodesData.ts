export interface QCodeItem {
    code: string;
    meaning: string;
}

export const qCodes: QCodeItem[] = [
    { code: 'QRA', meaning: 'İstasyonunuzun ismi nedir? / İstasyonumun ismi ...dir.' },
    { code: 'QRB', meaning: 'İstasyonumdan ne kadar uzaktasınız? / İstasyonunuzdan ... km uzaktayım.' },
    { code: 'QRD', meaning: 'Nereye gidip nereden geliyorsunuz? / ... gidiyorum, ... den geliyorum.' },
    { code: 'QRH', meaning: 'Frekansım değişiyor mu? / Evet, değişiyor.' },
    { code: 'QRI', meaning: 'Göndermemin tonu nasıldır? / Göndermenizin tonu: ...' },
    { code: 'QRL', meaning: 'Meşgul müsünüz? / Meşgulüm.' },
    { code: 'QRM', meaning: 'Göndermemde bir karıştırma var mı? / Göndermeniz: ...' },
    { code: 'QRN', meaning: 'Statik gürültüden (parazit) rahatsız oluyor musunuz? / Statik gürültüden rahatsız oluyorum.' },
    { code: 'QRO', meaning: 'Verici gücünü artırayım mı? / Verici gücünü artırın.' },
    { code: 'QRP', meaning: 'Verici gücünü azaltayım mı? / Verici gücünü azaltın.' },
    { code: 'QRQ', meaning: 'Daha hızlı göndereyim mi? / Daha hızlı gönderin (... kelime/dakika).' },
    { code: 'QRS', meaning: 'Daha yavaş göndereyim mi? / Daha yavaş gönderin (... kelime/dakika).' },
    { code: 'QRT', meaning: 'Göndermeyi keseyim mi? / Göndermeyi kesin.' },
    { code: 'QRU', meaning: 'Benim için bir mesajınız var mı? / Sizin için mesajım yok.' },
    { code: 'QRV', meaning: 'Hazır mısınız? / Hazırım.' },
    { code: 'QRX', meaning: 'Beni ne zaman tekrar çağıracaksınız? / Sizi tekrar saat ...da ... kHz üzerinden çağıracağım.' },
    { code: 'QRZ', meaning: 'Beni kim çağırıyor? / Sizi ... çağırıyor.' },
    { code: 'QSA', meaning: 'Sinyal gücüm kaçtır? / Sinyal gücünüz ...dir (1-5 arası).' },
    { code: 'QSB', meaning: 'Göndermem sönüyor mu? / Göndermeniz sönüyor.' },
    { code: 'QSL', meaning: 'Teyit eder misiniz? / Teyit ediyorum.' },
    { code: 'QSN', meaning: 'Beni ... frekansında duydunuz mu? / Sizi ... frekansında duydum.' },
    { code: 'QSO', meaning: '... ile direkt olarak konuşabilir misiniz? / ... ile direkt olarak konuşabilirim.' },
    { code: 'QSP', meaning: '... istasyonuna ücretsiz aracılık yapar mısınız? / ... istasyonuna ücretsiz aracılık yaparım.' },
    { code: 'QSW', meaning: 'Bu frekansta (veya ... frekansında) gönderecek misiniz? / Bu frekansta (veya ... frekansında) göndereceğim.' },
    { code: 'QSY', meaning: 'Başka frekansa geçeyim mi? / ... frekansına geçin.' },
    { code: 'QTH', meaning: 'Mevkiiniz (Konumunuz) nedir? / Mevkiim ...dir.' },
    { code: 'QTR', meaning: 'Tam saat kaçtır? / Tam saat ...dır.' },
];
