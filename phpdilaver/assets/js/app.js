document.addEventListener('alpine:init', () => {
    Alpine.data('dilaverApp', () => ({
        user: {
            firstName: 'Operatör',
            lastName: 'User',
            callSign: 'TA1XYZ',
            role: 'Admin'
        },
        menuItems: [
            { id: 'morse', title: 'Mors Alfabesi', subtitle: 'Sesli Çalışma ve Pratik', iconName: 'radio', color: '#007AFF' },
            { id: 'qcodes', title: 'Q-Kodları & Kısaltmalar', subtitle: 'Telsiz Haberleşme Terimleri', iconName: 'message-square', color: '#5856D6' },
            { id: 'directory', title: 'Sorgulama Merkezi', subtitle: 'Çağrı İşareti & DMR ID Sorgu', iconName: 'search', color: '#34C759' },
            { id: 'exams', title: 'Sınav Hazırlık', subtitle: 'Amatör Telsizcilik Soruları', iconName: 'graduation-cap', color: '#AF52DE' },
            { id: 'logbook', title: 'Kayıt Defteri', subtitle: 'Görüşme Geçmişi', iconName: 'book-open', color: '#FF9500' },
            { id: 'repeaters', title: 'Röle & Frekanslar', subtitle: 'Bölgesel Röle Listesi', iconName: 'wifi', color: '#FF3B30' }
        ],

        getInitials() {
            return (this.user.firstName[0] + (this.user.lastName[0] || '')).toUpperCase();
        },

        init() {
            lucide.createIcons();
        }
    }));
});
