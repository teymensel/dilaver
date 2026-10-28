export const turkishCities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
    'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale',
    'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum',
    'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin',
    'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli',
    'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş',
    'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
    'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak',
    'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan',
    'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

export const commonNames = [
    'Ahmet', 'Mehmet', 'Mustafa', 'Ayşe', 'Fatma', 'Emine', 'Ali', 'Hüseyin', 'Hasan',
    'Zeynep', 'Elif', 'Merve', 'Büşra', 'Osman', 'Ömer', 'Yusuf', 'Eren', 'İrem', 'Selin',
    'Deniz', 'Can', 'Umut', 'Burak', 'Aslı', 'Gökhan', 'Hakan', 'Seda', 'Esra', 'Murat'
];

export interface EmergencySignal {
    code: string;
    morse: string;
    meaning: string;
    description: string;
}

export const emergencySignals: EmergencySignal[] = [
    {
        code: 'SOS',
        morse: '...---...',
        meaning: 'Yardım Çağrısı',
        description: 'Uluslararası standart acil durum ve yardım çağırma sinyali.'
    },
    {
        code: 'MAYDAY',
        morse: '-- .--. -.. .- -.--',
        meaning: 'Hayati Tehlike',
        description: 'Gemi veya uçaklarda hayati tehlike durumunda kullanılan sesli yardım çağrısının Mors karşılığı.'
    },
    {
        code: 'CQ',
        morse: '-.-. --.-',
        meaning: 'Genel Çağrı',
        description: 'Herhangi bir istasyonla görüşme başlatmak için yapılan genel çağrı.'
    },
    {
        code: 'QRZ',
        morse: '--.- .-. --..',
        meaning: 'Beni Kim Çağırıyor?',
        description: 'İstasyonunuzu kimin çağırdığını sormak için kullanılır.'
    },
    {
        code: '73',
        morse: '--... ...--',
        meaning: 'Selamlar',
        description: 'Görüşme sonunda en iyi dilekleri iletmek için kullanılır.'
    }
];
