export interface RepeaterItem {
    city: string;
    location: string;
    band: string;
    frequency: string;
    tone: string;
    distance?: string;
    taRegion?: string;
    geoRegion?: string;
    power?: string;
    channel?: string;
    altitude?: string;
    sql?: string;
    license?: string;
    status?: string;
    locator?: string;
    thanks?: string;
    updatedAt?: string;
}

export const repeaters: RepeaterItem[] = [
    { city: 'Adana', location: 'Rüzgarlı Tepe', band: 'VHF', frequency: '145.700', tone: '88.5 / Alma - Gönderme', distance: '722.28 km' },
    { city: 'Adana', location: 'S.DEMIREL MEVKI', band: 'VHF', frequency: '145.700', tone: '88.5 / Alma - Gönderme', distance: '728.88 km' },
    { city: 'Adana', location: 'Şehir Merkezi', band: 'UHF', frequency: '439.150', tone: 'D155N / Gönderme', distance: '735.06 km' },
    { city: 'Adana / Ceyhan', location: 'Şehir Merkezi', band: 'UHF', frequency: '439.225', tone: '88.5 / Alma - Gönderme', distance: '767.39 km' },
    { city: 'Ankara', location: 'Dikmen', band: 'VHF', frequency: '145.600', tone: '88.5', distance: '450.12 km' },
    { city: 'İstanbul', location: 'Çamlıca', band: 'VHF', frequency: '145.650', tone: '88.5', distance: '12.5 km' },
    { city: 'İzmir', location: 'Yamanlar', band: 'VHF', frequency: '145.750', tone: '88.5', distance: '380.45 km' },
];
