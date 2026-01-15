// Indonesia Provinces and Cities Data

export interface Province {
    id: string;
    name: string;
    cities: string[];
}

export const INDONESIA_PROVINCES: Province[] = [
    {
        id: 'aceh',
        name: 'Aceh',
        cities: ['Banda Aceh', 'Sabang', 'Lhokseumawe', 'Langsa', 'Subulussalam', 'Meulaboh', 'Takengon', 'Bireuen', 'Sigli', 'Jantho']
    },
    {
        id: 'sumut',
        name: 'Sumatera Utara',
        cities: ['Medan', 'Binjai', 'Pematangsiantar', 'Tebing Tinggi', 'Tanjungbalai', 'Sibolga', 'Padang Sidempuan', 'Gunungsitoli', 'Kisaran', 'Rantau Prapat']
    },
    {
        id: 'sumbar',
        name: 'Sumatera Barat',
        cities: ['Padang', 'Bukittinggi', 'Payakumbuh', 'Solok', 'Sawahlunto', 'Padang Panjang', 'Pariaman', 'Batusangkar', 'Lubuk Basung', 'Painan']
    },
    {
        id: 'riau',
        name: 'Riau',
        cities: ['Pekanbaru', 'Dumai', 'Bengkalis', 'Bagan Siapi-api', 'Tanjung Pinang', 'Siak Sri Indrapura', 'Pangkalan Kerinci', 'Pasir Pangaraian', 'Teluk Kuantan', 'Rengat']
    },
    {
        id: 'kepri',
        name: 'Kepulauan Riau',
        cities: ['Tanjung Pinang', 'Batam', 'Bintan', 'Karimun', 'Natuna', 'Lingga', 'Anambas']
    },
    {
        id: 'jambi',
        name: 'Jambi',
        cities: ['Jambi', 'Sungai Penuh', 'Muara Bungo', 'Muara Bulian', 'Kuala Tungkal', 'Sarolangun', 'Bangko', 'Muara Tebo', 'Sengeti']
    },
    {
        id: 'sumsel',
        name: 'Sumatera Selatan',
        cities: ['Palembang', 'Prabumulih', 'Lubuklinggau', 'Pagar Alam', 'Baturaja', 'Lahat', 'Muara Enim', 'Kayuagung', 'Sekayu', 'Indralaya']
    },
    {
        id: 'babel',
        name: 'Kepulauan Bangka Belitung',
        cities: ['Pangkal Pinang', 'Sungailiat', 'Manggar', 'Tanjung Pandan', 'Mentok', 'Koba', 'Toboali']
    },
    {
        id: 'bengkulu',
        name: 'Bengkulu',
        cities: ['Bengkulu', 'Curup', 'Manna', 'Arga Makmur', 'Mukomuko', 'Kepahiang', 'Lebong', 'Kaur', 'Seluma']
    },
    {
        id: 'lampung',
        name: 'Lampung',
        cities: ['Bandar Lampung', 'Metro', 'Liwa', 'Kalianda', 'Kotabumi', 'Menggala', 'Pringsewu', 'Kota Agung', 'Blambangan Umpu', 'Sukadana']
    },
    {
        id: 'jakarta',
        name: 'DKI Jakarta',
        cities: ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Kepulauan Seribu']
    },
    {
        id: 'jabar',
        name: 'Jawa Barat',
        cities: ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cimahi', 'Tasikmalaya', 'Cirebon', 'Sukabumi', 'Banjar', 'Garut', 'Sumedang', 'Cianjur', 'Purwakarta', 'Karawang', 'Subang', 'Majalengka', 'Kuningan', 'Indramayu']
    },
    {
        id: 'banten',
        name: 'Banten',
        cities: ['Serang', 'Tangerang', 'Tangerang Selatan', 'Cilegon', 'Pandeglang', 'Lebak', 'Rangkasbitung']
    },
    {
        id: 'jateng',
        name: 'Jawa Tengah',
        cities: ['Semarang', 'Surakarta', 'Magelang', 'Salatiga', 'Pekalongan', 'Tegal', 'Cilacap', 'Banyumas', 'Purwokerto', 'Kebumen', 'Purworejo', 'Wonosobo', 'Temanggung', 'Kendal', 'Demak', 'Kudus', 'Jepara', 'Pati', 'Blora', 'Rembang', 'Grobogan', 'Sragen', 'Karanganyar', 'Boyolali', 'Klaten', 'Sukoharjo', 'Wonogiri', 'Brebes', 'Pemalang', 'Batang']
    },
    {
        id: 'yogya',
        name: 'DI Yogyakarta',
        cities: ['Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunung Kidul']
    },
    {
        id: 'jatim',
        name: 'Jawa Timur',
        cities: ['Surabaya', 'Malang', 'Batu', 'Kediri', 'Blitar', 'Madiun', 'Mojokerto', 'Pasuruan', 'Probolinggo', 'Sidoarjo', 'Gresik', 'Lamongan', 'Tuban', 'Bojonegoro', 'Ngawi', 'Magetan', 'Ponorogo', 'Pacitan', 'Trenggalek', 'Tulungagung', 'Nganjuk', 'Jombang', 'Lumajang', 'Bondowoso', 'Situbondo', 'Banyuwangi', 'Jember', 'Pamekasan', 'Sampang', 'Sumenep', 'Bangkalan']
    },
    {
        id: 'bali',
        name: 'Bali',
        cities: ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Bangli', 'Klungkung', 'Karangasem', 'Buleleng', 'Jembrana']
    },
    {
        id: 'ntb',
        name: 'Nusa Tenggara Barat',
        cities: ['Mataram', 'Bima', 'Lombok Barat', 'Lombok Tengah', 'Lombok Timur', 'Lombok Utara', 'Sumbawa', 'Sumbawa Barat', 'Dompu']
    },
    {
        id: 'ntt',
        name: 'Nusa Tenggara Timur',
        cities: ['Kupang', 'Atambua', 'Ende', 'Maumere', 'Waingapu', 'Labuan Bajo', 'Ruteng', 'Bajawa', 'Soe', 'Kefamenanu', 'Kalabahi', 'Lewoleba', 'Larantuka']
    },
    {
        id: 'kalbar',
        name: 'Kalimantan Barat',
        cities: ['Pontianak', 'Singkawang', 'Sambas', 'Mempawah', 'Sanggau', 'Sintang', 'Putussibau', 'Ketapang', 'Ngabang', 'Nanga Pinoh', 'Sekadau', 'Melawi']
    },
    {
        id: 'kalteng',
        name: 'Kalimantan Tengah',
        cities: ['Palangka Raya', 'Sampit', 'Pangkalan Bun', 'Kuala Kapuas', 'Buntok', 'Muara Teweh', 'Pulang Pisau', 'Kuala Kurun', 'Kasongan', 'Tamiang Layang', 'Puruk Cahu', 'Sukamara', 'Nanga Bulik']
    },
    {
        id: 'kalsel',
        name: 'Kalimantan Selatan',
        cities: ['Banjarmasin', 'Banjarbaru', 'Martapura', 'Pelaihari', 'Marabahan', 'Rantau', 'Kandangan', 'Barabai', 'Amuntai', 'Tanjung', 'Kotabaru', 'Batulicin']
    },
    {
        id: 'kaltim',
        name: 'Kalimantan Timur',
        cities: ['Samarinda', 'Balikpapan', 'Bontang', 'Tenggarong', 'Sangatta', 'Tanjung Redeb', 'Tanjung Selor', 'Sendawar', 'Penajam']
    },
    {
        id: 'kaltara',
        name: 'Kalimantan Utara',
        cities: ['Tanjung Selor', 'Tarakan', 'Nunukan', 'Malinau', 'Bulungan']
    },
    {
        id: 'sulut',
        name: 'Sulawesi Utara',
        cities: ['Manado', 'Bitung', 'Tomohon', 'Kotamobagu', 'Tondano', 'Airmadidi', 'Amurang', 'Tahuna', 'Talaud']
    },
    {
        id: 'gorontalo',
        name: 'Gorontalo',
        cities: ['Gorontalo', 'Limboto', 'Marisa', 'Tilamuta', 'Kwandang', 'Suwawa']
    },
    {
        id: 'sulteng',
        name: 'Sulawesi Tengah',
        cities: ['Palu', 'Poso', 'Luwuk', 'Toli-Toli', 'Donggala', 'Parigi', 'Buol', 'Ampana', 'Banggai']
    },
    {
        id: 'sulsel',
        name: 'Sulawesi Selatan',
        cities: ['Makassar', 'Parepare', 'Palopo', 'Maros', 'Pangkep', 'Barru', 'Bone', 'Soppeng', 'Wajo', 'Sinjai', 'Bulukumba', 'Bantaeng', 'Jeneponto', 'Takalar', 'Gowa', 'Sungguminasa', 'Sidrap', 'Pinrang', 'Enrekang', 'Luwu', 'Tana Toraja', 'Toraja Utara', 'Selayar']
    },
    {
        id: 'sultra',
        name: 'Sulawesi Tenggara',
        cities: ['Kendari', 'Bau-Bau', 'Raha', 'Unaaha', 'Kolaka', 'Wangi-Wangi', 'Pasarwajo', 'Wanggudu', 'Lasusua', 'Rumbia', 'Andoolo', 'Tirawuta']
    },
    {
        id: 'sulbar',
        name: 'Sulawesi Barat',
        cities: ['Mamuju', 'Majene', 'Polewali', 'Pasangkayu', 'Mamasa', 'Tobadak']
    },
    {
        id: 'maluku',
        name: 'Maluku',
        cities: ['Ambon', 'Tual', 'Masohi', 'Namlea', 'Dobo', 'Saumlaki', 'Piru', 'Langgur', 'Tiakur']
    },
    {
        id: 'malut',
        name: 'Maluku Utara',
        cities: ['Ternate', 'Tidore', 'Tobelo', 'Sofifi', 'Jailolo', 'Labuha', 'Sanana', 'Morotai']
    },
    {
        id: 'papua',
        name: 'Papua',
        cities: ['Jayapura', 'Sentani', 'Wamena', 'Merauke', 'Biak', 'Serui', 'Nabire', 'Timika', 'Sarmi']
    },
    {
        id: 'papuabarat',
        name: 'Papua Barat',
        cities: ['Manokwari', 'Sorong', 'Fakfak', 'Kaimana', 'Bintuni', 'Waisai', 'Teminabuan', 'Aimas']
    },
    {
        id: 'papuaselatan',
        name: 'Papua Selatan',
        cities: ['Merauke', 'Tanah Merah', 'Boven Digoel', 'Mappi', 'Asmat']
    },
    {
        id: 'papuatengah',
        name: 'Papua Tengah',
        cities: ['Nabire', 'Timika', 'Enarotali', 'Sugapa', 'Ilaga', 'Mulia']
    },
    {
        id: 'papuapegunungan',
        name: 'Papua Pegunungan',
        cities: ['Wamena', 'Jayawijaya', 'Lanny Jaya', 'Mamberamo Tengah', 'Yalimo', 'Yahukimo', 'Pegunungan Bintang', 'Tolikara', 'Nduga']
    },
    {
        id: 'papuabaratdaya',
        name: 'Papua Barat Daya',
        cities: ['Sorong', 'Raja Ampat', 'Sorong Selatan', 'Maybrat', 'Tambrauw']
    }
];

// Get all province names
export const getProvinceNames = (): string[] => {
    return INDONESIA_PROVINCES.map(p => p.name);
};

// Get cities by province name
export const getCitiesByProvince = (provinceName: string): string[] => {
    const province = INDONESIA_PROVINCES.find(p => p.name === provinceName);
    return province ? province.cities : [];
};

// Education levels
export const EDUCATION_LEVELS = [
    { value: 'sma', label: 'SMA/SMK/MA' },
    { value: 'd3', label: 'D3 (Diploma)' },
    { value: 's1', label: 'S1 (Sarjana)' },
    { value: 's2', label: 'S2 (Magister)' },
    { value: 's3', label: 'S3 (Doktor)' }
];

// Gender options
export const GENDER_OPTIONS = [
    { value: 'LAKI_LAKI', label: 'Laki-laki' },
    { value: 'PEREMPUAN', label: 'Perempuan' }
];
