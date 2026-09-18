/**
 * SkillBridge — dummy dataset
 *
 * Semua angka di file ini adalah data contoh untuk kebutuhan prototype/lomba,
 * bukan data industri riil. Ditandai "Demo Data" di halaman yang menampilkannya.
 */

const SKILLS = [
  { id: 'sql', name: 'SQL', category: 'technical' },
  { id: 'python', name: 'Python', category: 'technical' },
  { id: 'excel', name: 'Excel', category: 'technical' },
  { id: 'statistics', name: 'Statistics', category: 'technical' },
  { id: 'powerbi', name: 'Power BI', category: 'technical' },
  { id: 'cloud', name: 'Cloud Computing', category: 'technical' },
  { id: 'docker', name: 'Docker', category: 'technical' },
  { id: 'datapipeline', name: 'Data Pipeline / ETL', category: 'technical' },
  { id: 'ml', name: 'Machine Learning', category: 'technical' },
  { id: 'javascript', name: 'JavaScript', category: 'technical' },
  { id: 'react', name: 'React', category: 'technical' },
  { id: 'uidesign', name: 'UI Design', category: 'technical' },
  { id: 'figma', name: 'Figma', category: 'technical' },
  { id: 'cybersecurity', name: 'Cybersecurity Fundamentals', category: 'technical' },
  { id: 'networking', name: 'Networking', category: 'technical' },
  { id: 'linux', name: 'Linux', category: 'technical' },
  { id: 'git', name: 'Git / Version Control', category: 'technical' },
  { id: 'communication', name: 'Communication', category: 'soft' },
  { id: 'problemsolving', name: 'Problem Solving', category: 'soft' },
  { id: 'projectmanagement', name: 'Project Management', category: 'soft' },
];

// Catatan: skillName() dan getCareerBySlug() sekarang didefinisikan di
// js/admin-store.js, supaya seluruh halaman membaca data yang sudah
// dikelola admin (bukan array statis di file ini secara langsung).

/**
 * Opsi skenario untuk skill assessment — dipakai FE (assessment.js) dan
 * mock backend (api-mock.js). Di backend Laravel nanti, ini akan datang
 * dari GET /assessment/questions, bukan konstanta di FE.
 */
const SCENARIO_OPTIONS = [
  { label: 'Saya belum pernah menggunakan skill ini sama sekali', value: 10 },
  { label: 'Saya bisa mengerjakan bagian dasar dengan bantuan tutorial/contoh', value: 35 },
  { label: 'Saya bisa mengerjakan sebagian besar tugas terkait secara mandiri', value: 60 },
  { label: 'Saya bisa mengerjakan tugas kompleks dan membantu menjelaskan ke orang lain', value: 85 },
];

// Pemetaan bahasa yang terdeteksi di GitHub ke skill SkillBridge.
// Dipakai mock backend sekarang; nanti jadi bagian logika Laravel BE
// saat endpoint POST /portfolio/github-analyze pindah ke server.
const GITHUB_LANGUAGE_MAP = {
  Python: 'python',
  'Jupyter Notebook': 'python',
  JavaScript: 'javascript',
  TypeScript: 'javascript',
  Dockerfile: 'docker',
  Shell: 'linux',
};

const CAREERS = [
  {
    id: 'data-analyst', slug: 'data-analyst', name: 'Data Analyst',
    category: 'Data', difficulty: 'Beginner-friendly', industryDemand: 78, jobSampleSize: 420, remoteFriendly: true,
    shortDescription: 'Mengolah data mentah menjadi insight yang bisa dipakai untuk keputusan bisnis.',
    description: 'Data Analyst bertanggung jawab mengumpulkan, membersihkan, dan menganalisis data untuk menjawab pertanyaan bisnis, lalu mengomunikasikan temuannya lewat laporan dan dashboard.',
    responsibilities: [
      'Menyiapkan dan membersihkan dataset dari berbagai sumber',
      'Membuat dashboard dan laporan berkala',
      'Melakukan analisis statistik dasar untuk menjawab pertanyaan bisnis',
      'Berkomunikasi dengan tim non-teknis untuk menerjemahkan kebutuhan data',
    ],
    tools: ['SQL', 'Excel', 'Power BI', 'Python'],
    requiredSkills: [
      { skillId: 'sql', level: 90, importance: 'critical' },
      { skillId: 'excel', level: 85, importance: 'high' },
      { skillId: 'statistics', level: 80, importance: 'high' },
      { skillId: 'powerbi', level: 75, importance: 'high' },
      { skillId: 'python', level: 65, importance: 'medium' },
      { skillId: 'communication', level: 70, importance: 'medium' },
    ],
  },
  {
    id: 'data-engineer', slug: 'data-engineer', name: 'Data Engineer',
    category: 'Data', difficulty: 'Intermediate', industryDemand: 71, jobSampleSize: 310, remoteFriendly: true,
    shortDescription: 'Membangun dan menjaga infrastruktur serta pipeline data agar data siap dipakai tim lain.',
    description: 'Data Engineer merancang, membangun, dan memelihara sistem serta pipeline yang mengalirkan data dari berbagai sumber ke tempat yang bisa diakses tim analytics maupun product.',
    responsibilities: [
      'Membangun dan menjaga data pipeline (ETL/ELT)',
      'Mendesain skema database yang efisien',
      'Mengelola infrastruktur data di cloud',
      'Menjamin kualitas dan keandalan data',
    ],
    tools: ['SQL', 'Python', 'Airflow', 'Docker', 'Cloud (AWS/GCP)'],
    requiredSkills: [
      { skillId: 'sql', level: 90, importance: 'critical' },
      { skillId: 'python', level: 85, importance: 'critical' },
      { skillId: 'datapipeline', level: 75, importance: 'high' },
      { skillId: 'cloud', level: 70, importance: 'high' },
      { skillId: 'docker', level: 65, importance: 'medium' },
      { skillId: 'statistics', level: 45, importance: 'low' },
      { skillId: 'communication', level: 55, importance: 'low' },
    ],
  },
  {
    id: 'software-engineer', slug: 'software-engineer', name: 'Software Engineer',
    category: 'Engineering', difficulty: 'Intermediate', industryDemand: 85, jobSampleSize: 560, remoteFriendly: true,
    shortDescription: 'Merancang, membangun, dan menjaga aplikasi atau sistem perangkat lunak.',
    description: 'Software Engineer menulis, menguji, dan memelihara kode untuk membangun produk digital, bekerja sama dengan desainer dan product manager.',
    responsibilities: [
      'Mengembangkan fitur baru sesuai spesifikasi',
      'Menulis kode yang teruji dan mudah dirawat',
      'Melakukan code review bersama tim',
      'Men-debug dan memperbaiki masalah di produksi',
    ],
    tools: ['JavaScript', 'Git', 'React', 'SQL'],
    requiredSkills: [
      { skillId: 'javascript', level: 85, importance: 'critical' },
      { skillId: 'git', level: 80, importance: 'high' },
      { skillId: 'problemsolving', level: 80, importance: 'high' },
      { skillId: 'react', level: 60, importance: 'medium' },
      { skillId: 'sql', level: 60, importance: 'medium' },
      { skillId: 'python', level: 55, importance: 'low' },
    ],
  },
  {
    id: 'ai-engineer', slug: 'ai-engineer', name: 'AI Engineer',
    category: 'Data', difficulty: 'Advanced', industryDemand: 66, jobSampleSize: 190, remoteFriendly: true,
    shortDescription: 'Membangun dan menerapkan model machine learning ke dalam produk nyata.',
    description: 'AI Engineer menggabungkan pemahaman machine learning dengan software engineering untuk melatih, menguji, dan men-deploy model ke dalam sistem produksi.',
    responsibilities: [
      'Melatih dan mengevaluasi model machine learning',
      'Menyiapkan data untuk kebutuhan training',
      'Men-deploy model ke lingkungan produksi',
      'Memantau performa model dari waktu ke waktu',
    ],
    tools: ['Python', 'scikit-learn', 'Cloud (AWS/GCP)', 'Docker'],
    requiredSkills: [
      { skillId: 'python', level: 90, importance: 'critical' },
      { skillId: 'ml', level: 85, importance: 'critical' },
      { skillId: 'statistics', level: 80, importance: 'high' },
      { skillId: 'sql', level: 65, importance: 'medium' },
      { skillId: 'cloud', level: 60, importance: 'medium' },
      { skillId: 'docker', level: 50, importance: 'low' },
      { skillId: 'communication', level: 55, importance: 'low' },
    ],
  },
  {
    id: 'cybersecurity-analyst', slug: 'cybersecurity-analyst', name: 'Cybersecurity Analyst',
    category: 'Security', difficulty: 'Intermediate', industryDemand: 69, jobSampleSize: 240, remoteFriendly: false,
    shortDescription: 'Melindungi sistem dan data organisasi dari ancaman keamanan siber.',
    description: 'Cybersecurity Analyst memantau, mendeteksi, dan merespons ancaman keamanan, serta membangun praktik keamanan yang lebih baik di organisasi.',
    responsibilities: [
      'Memantau sistem untuk aktivitas mencurigakan',
      'Melakukan audit dan penilaian kerentanan',
      'Merespons dan menganalisis insiden keamanan',
      'Menyusun rekomendasi kebijakan keamanan',
    ],
    tools: ['SIEM tools', 'Linux', 'Wireshark', 'Cloud security'],
    requiredSkills: [
      { skillId: 'cybersecurity', level: 90, importance: 'critical' },
      { skillId: 'networking', level: 85, importance: 'critical' },
      { skillId: 'linux', level: 75, importance: 'high' },
      { skillId: 'cloud', level: 55, importance: 'medium' },
      { skillId: 'problemsolving', level: 70, importance: 'medium' },
    ],
  },
  {
    id: 'cloud-engineer', slug: 'cloud-engineer', name: 'Cloud Engineer',
    category: 'Engineering', difficulty: 'Intermediate', industryDemand: 64, jobSampleSize: 260, remoteFriendly: true,
    shortDescription: 'Mengelola infrastruktur cloud agar aplikasi berjalan andal dan efisien.',
    description: 'Cloud Engineer merancang dan mengelola infrastruktur di layanan cloud, termasuk deployment, scaling, dan keamanan sistem.',
    responsibilities: [
      'Mengonfigurasi dan mengelola layanan cloud',
      'Mengotomasi proses deployment',
      'Memantau performa dan biaya infrastruktur',
      'Menjaga keamanan konfigurasi cloud',
    ],
    tools: ['AWS/GCP/Azure', 'Docker', 'Linux', 'Terraform'],
    requiredSkills: [
      { skillId: 'cloud', level: 90, importance: 'critical' },
      { skillId: 'docker', level: 80, importance: 'high' },
      { skillId: 'linux', level: 75, importance: 'high' },
      { skillId: 'networking', level: 65, importance: 'medium' },
      { skillId: 'git', level: 60, importance: 'medium' },
      { skillId: 'python', level: 55, importance: 'low' },
      { skillId: 'communication', level: 50, importance: 'low' },
    ],
  },
  {
    id: 'uiux-designer', slug: 'uiux-designer', name: 'UI/UX Designer',
    category: 'Design', difficulty: 'Beginner-friendly', industryDemand: 58, jobSampleSize: 300, remoteFriendly: true,
    shortDescription: 'Merancang pengalaman dan tampilan produk digital yang mudah dipakai.',
    description: 'UI/UX Designer meneliti kebutuhan pengguna dan menerjemahkannya menjadi alur serta tampilan antarmuka yang jelas dan enak dipakai.',
    responsibilities: [
      'Melakukan riset dan wawancara pengguna',
      'Membuat wireframe dan prototype',
      'Mendesain tampilan visual antarmuka',
      'Melakukan usability testing',
    ],
    tools: ['Figma', 'Design system', 'User research'],
    requiredSkills: [
      { skillId: 'uidesign', level: 90, importance: 'critical' },
      { skillId: 'figma', level: 85, importance: 'critical' },
      { skillId: 'communication', level: 80, importance: 'high' },
      { skillId: 'problemsolving', level: 65, importance: 'medium' },
      { skillId: 'projectmanagement', level: 50, importance: 'low' },
    ],
  },
  {
    id: 'product-manager', slug: 'product-manager', name: 'Product Manager',
    category: 'Product', difficulty: 'Advanced', industryDemand: 55, jobSampleSize: 200, remoteFriendly: false,
    shortDescription: 'Menentukan arah produk dan menjembatani kebutuhan user, bisnis, dan tim teknis.',
    description: 'Product Manager menyusun visi dan prioritas produk, lalu bekerja sama dengan desain, engineering, dan bisnis untuk mewujudkannya.',
    responsibilities: [
      'Menyusun roadmap dan prioritas produk',
      'Mengumpulkan dan menganalisis kebutuhan pengguna',
      'Menulis spesifikasi fitur',
      'Mengukur dampak fitur setelah rilis',
    ],
    tools: ['Analytics tools', 'Roadmap tools', 'SQL dasar'],
    requiredSkills: [
      { skillId: 'communication', level: 90, importance: 'critical' },
      { skillId: 'projectmanagement', level: 85, importance: 'critical' },
      { skillId: 'problemsolving', level: 80, importance: 'high' },
      { skillId: 'statistics', level: 55, importance: 'medium' },
      { skillId: 'sql', level: 50, importance: 'low' },
    ],
  },
];

// getCareerBySlug() dipindah ke js/admin-store.js.

/**
 * Konten pembelajaran generik per skill, dipakai untuk menyusun
 * Learning Roadmap secara otomatis dari hasil skill gap — bukan
 * roadmap yang ditulis manual per karier.
 */
const SKILL_CONTENT = {
  sql: {
    objective: 'Menguasai query data dari dasar sampai gabungan tabel yang kompleks.',
    why: 'SQL adalah bahasa universal untuk mengambil dan mengolah data di hampir semua peran data.',
    after: 'Kamu bisa menulis query untuk mengambil, menyaring, dan menggabungkan data dari beberapa tabel.',
    resources: [
      { title: 'SQL for Data Analysis', provider: 'Coursera', type: 'course' },
      { title: 'Mode SQL Tutorial', provider: 'Mode Analytics', type: 'article' },
    ],
    tasks: ['Latihan SELECT, WHERE, dan JOIN', 'Buat 3 query analisis dari dataset publik', 'Pelajari window function dasar'],
    miniProject: 'Analisis dataset penjualan publik dan tulis 5 insight menggunakan SQL.',
    durationDays: 10,
  },
  python: {
    objective: 'Menguasai Python untuk pengolahan data (pandas, numpy).',
    why: 'Python jadi tulang punggung otomasi dan analisis data di hampir semua peran teknis.',
    after: 'Kamu bisa membersihkan dan menganalisis dataset menggunakan pandas.',
    resources: [
      { title: 'Python for Everybody', provider: 'Coursera', type: 'course' },
      { title: 'Pandas Documentation — Getting Started', provider: 'pandas.pydata.org', type: 'doc' },
    ],
    tasks: ['Pelajari struktur data dasar Python', 'Latihan manipulasi data dengan pandas', 'Buat script pembersihan data sederhana'],
    miniProject: 'Bersihkan dan analisis satu dataset mentah dari Kaggle.',
    durationDays: 14,
  },
  excel: {
    objective: 'Menguasai fungsi Excel untuk pengolahan dan ringkasan data.',
    why: 'Excel masih jadi alat cepat untuk analisis data skala kecil-menengah di banyak perusahaan.',
    after: 'Kamu bisa membuat pivot table dan ringkasan data secara mandiri.',
    resources: [{ title: 'Excel Skills for Data Analytics', provider: 'Coursera', type: 'course' }],
    tasks: ['Latihan pivot table', 'Pelajari VLOOKUP/XLOOKUP', 'Buat dashboard sederhana di Excel'],
    miniProject: 'Buat laporan bulanan otomatis dengan pivot table dan chart.',
    durationDays: 7,
  },
  statistics: {
    objective: 'Memahami konsep statistik dasar untuk pengambilan keputusan berbasis data.',
    why: 'Statistik adalah fondasi untuk menafsirkan data secara benar, bukan sekadar melihat angka.',
    after: 'Kamu bisa menjelaskan tren data menggunakan ukuran statistik dasar dan uji signifikansi sederhana.',
    resources: [{ title: 'Statistics with Python', provider: 'Coursera', type: 'course' }],
    tasks: ['Pelajari mean, median, distribusi', 'Pelajari korelasi vs kausalitas', 'Latihan uji hipotesis sederhana'],
    miniProject: 'Analisis korelasi antar variabel pada satu dataset dan tulis kesimpulannya.',
    durationDays: 10,
  },
  powerbi: {
    objective: 'Membuat dashboard interaktif dengan Power BI.',
    why: 'Kemampuan visualisasi data yang baik membuat insight lebih mudah dipahami stakeholder non-teknis.',
    after: 'Kamu bisa membangun dashboard interaktif lengkap dengan filter dan drill-down.',
    resources: [{ title: 'Power BI Essential Training', provider: 'LinkedIn Learning', type: 'course' }],
    tasks: ['Pelajari data modeling di Power BI', 'Buat visualisasi dasar', 'Tambahkan filter dan interaktivitas'],
    miniProject: 'Buat dashboard penjualan interaktif dari dataset contoh.',
    durationDays: 9,
  },
  cloud: {
    objective: 'Memahami layanan dasar cloud (compute, storage, networking).',
    why: 'Hampir seluruh infrastruktur modern berjalan di cloud, jadi ini fondasi wajib untuk peran teknis.',
    after: 'Kamu bisa men-deploy aplikasi atau pipeline data sederhana di cloud.',
    resources: [{ title: 'AWS Cloud Practitioner Essentials', provider: 'AWS Skill Builder', type: 'course' }],
    tasks: ['Pelajari konsep compute & storage cloud', 'Setup akun free-tier dan coba layanan dasar', 'Deploy satu aplikasi sederhana'],
    miniProject: 'Deploy aplikasi atau pipeline kecil ke layanan cloud gratis.',
    durationDays: 12,
  },
  docker: {
    objective: 'Memahami containerization dan cara menjalankan aplikasi dengan Docker.',
    why: 'Docker memudahkan aplikasi berjalan konsisten di berbagai environment.',
    after: 'Kamu bisa mem-package aplikasi ke dalam container dan menjalankannya.',
    resources: [{ title: 'Docker for Beginners', provider: 'Docker Docs', type: 'doc' }],
    tasks: ['Pelajari konsep image & container', 'Buat Dockerfile sederhana', 'Jalankan aplikasi di dalam container'],
    miniProject: 'Container-kan satu aplikasi kecil yang sudah kamu buat.',
    durationDays: 8,
  },
  datapipeline: {
    objective: 'Memahami proses ETL/ELT untuk memindahkan dan mengolah data.',
    why: 'Pipeline data yang rapi memastikan data yang dipakai tim lain akurat dan tepat waktu.',
    after: 'Kamu bisa membangun pipeline sederhana yang menarik, mentransformasi, dan menyimpan data.',
    resources: [{ title: 'Data Engineering Zoomcamp', provider: 'DataTalksClub', type: 'course' }],
    tasks: ['Pelajari konsep ETL vs ELT', 'Coba tool orchestration dasar (mis. Airflow)', 'Buat pipeline sederhana end-to-end'],
    miniProject: 'Bangun pipeline yang menarik data dari API publik ke database.',
    durationDays: 14,
  },
  ml: {
    objective: 'Memahami alur kerja machine learning dari data sampai model jadi.',
    why: 'Ini fondasi untuk membangun sistem yang bisa belajar dari data, bukan cuma diprogram manual.',
    after: 'Kamu bisa melatih dan mengevaluasi model machine learning sederhana.',
    resources: [{ title: 'Machine Learning Specialization', provider: 'Coursera (Andrew Ng)', type: 'course' }],
    tasks: ['Pelajari supervised vs unsupervised learning', 'Latihan training model dengan scikit-learn', 'Pelajari evaluasi model (akurasi, precision/recall)'],
    miniProject: 'Latih model klasifikasi sederhana dan jelaskan hasil evaluasinya.',
    durationDays: 16,
  },
  javascript: {
    objective: 'Menguasai dasar hingga menengah JavaScript untuk pengembangan web.',
    why: 'JavaScript adalah bahasa inti untuk membangun aplikasi web modern.',
    after: 'Kamu bisa membangun interaktivitas web dan memahami konsep asynchronous.',
    resources: [{ title: 'JavaScript.info', provider: 'javascript.info', type: 'doc' }],
    tasks: ['Pelajari DOM manipulation', 'Pelajari async/await & fetch', 'Bangun satu fitur interaktif kecil'],
    miniProject: 'Bangun aplikasi to-do list dengan localStorage.',
    durationDays: 12,
  },
  react: {
    objective: 'Membangun antarmuka dengan React berbasis komponen.',
    why: 'React banyak dipakai di industri untuk membangun aplikasi web berskala.',
    after: 'Kamu bisa membangun aplikasi multi-komponen dengan state management dasar.',
    resources: [{ title: 'React Official Docs — Learn React', provider: 'react.dev', type: 'doc' }],
    tasks: ['Pelajari komponen & props', 'Pelajari state & effect hook', 'Bangun satu halaman dengan beberapa komponen'],
    miniProject: 'Bangun mini dashboard dengan React dari data dummy.',
    durationDays: 14,
  },
  uidesign: {
    objective: 'Memahami prinsip dasar desain antarmuka yang mudah dipakai.',
    why: 'Desain yang baik membuat produk lebih mudah dipahami dan dipercaya pengguna.',
    after: 'Kamu bisa mendesain alur dan tampilan antarmuka yang konsisten.',
    resources: [{ title: 'Laws of UX', provider: 'lawsofux.com', type: 'article' }],
    tasks: ['Pelajari hierarki visual & spacing', 'Pelajari komponen UI umum', 'Redesain satu layar aplikasi yang sudah ada'],
    miniProject: 'Redesain satu alur aplikasi (mis. halaman login) dan jelaskan alasannya.',
    durationDays: 10,
  },
  figma: {
    objective: 'Menguasai Figma untuk membuat wireframe dan prototype.',
    why: 'Figma adalah tool kolaborasi desain paling umum dipakai industri saat ini.',
    after: 'Kamu bisa membuat wireframe, desain visual, dan prototype interaktif.',
    resources: [{ title: 'Figma Basics', provider: 'Figma Academy', type: 'course' }],
    tasks: ['Pelajari frame, component, auto layout', 'Buat wireframe untuk satu alur', 'Buat prototype interaktif sederhana'],
    miniProject: 'Buat prototype interaktif untuk satu fitur aplikasi.',
    durationDays: 9,
  },
  cybersecurity: {
    objective: 'Memahami konsep dasar keamanan siber dan jenis ancaman umum.',
    why: 'Pemahaman dasar keamanan penting untuk melindungi sistem dan data organisasi.',
    after: 'Kamu bisa mengenali jenis ancaman umum dan praktik keamanan dasar.',
    resources: [{ title: 'Google Cybersecurity Certificate', provider: 'Coursera', type: 'course' }],
    tasks: ['Pelajari jenis serangan umum (phishing, malware, dll)', 'Pelajari prinsip CIA triad', 'Latihan analisis log sederhana'],
    miniProject: 'Buat laporan analisis satu skenario insiden keamanan sederhana.',
    durationDays: 12,
  },
  networking: {
    objective: 'Memahami dasar jaringan komputer (TCP/IP, DNS, firewall).',
    why: 'Pemahaman jaringan adalah dasar untuk banyak peran infrastruktur dan keamanan.',
    after: 'Kamu bisa menjelaskan cara data berpindah di jaringan dan mengenali konfigurasi dasar.',
    resources: [{ title: 'Networking Basics', provider: 'Cisco Networking Academy', type: 'course' }],
    tasks: ['Pelajari model OSI/TCP-IP', 'Pelajari konsep DNS & routing dasar', 'Latihan konfigurasi jaringan sederhana'],
    miniProject: 'Dokumentasikan topologi jaringan sederhana dan cara kerjanya.',
    durationDays: 10,
  },
  linux: {
    objective: 'Menguasai perintah dasar Linux untuk operasional sistem.',
    why: 'Banyak server dan infrastruktur cloud berjalan di atas Linux.',
    after: 'Kamu bisa menavigasi, mengelola file, dan menjalankan proses dasar di Linux.',
    resources: [{ title: 'Linux Command Line Basics', provider: 'Linux Foundation', type: 'course' }],
    tasks: ['Pelajari perintah dasar (cd, ls, grep, dll)', 'Pelajari manajemen permission & proses', 'Latihan scripting shell sederhana'],
    miniProject: 'Buat shell script otomatisasi tugas sederhana.',
    durationDays: 8,
  },
  git: {
    objective: 'Menguasai version control dengan Git dan alur kerja branching.',
    why: 'Git adalah standar industri untuk kolaborasi dan menjaga riwayat perubahan kode.',
    after: 'Kamu bisa bekerja dengan branch, merge, dan menyelesaikan konflik sederhana.',
    resources: [{ title: 'Git Handbook', provider: 'GitHub Docs', type: 'doc' }],
    tasks: ['Pelajari commit, branch, merge', 'Latihan menyelesaikan merge conflict', 'Praktik alur kerja pull request'],
    miniProject: 'Kelola satu proyek kecil dengan alur branching yang rapi di GitHub.',
    durationDays: 6,
  },
  communication: {
    objective: 'Melatih kemampuan menyampaikan ide secara jelas ke audiens teknis maupun non-teknis.',
    why: 'Skill teknis sebaik apa pun kurang berdampak tanpa kemampuan mengomunikasikannya.',
    after: 'Kamu bisa menyusun presentasi atau laporan yang mudah dipahami audiens yang berbeda.',
    resources: [{ title: 'Effective Communication', provider: 'LinkedIn Learning', type: 'course' }],
    tasks: ['Latihan menulis ringkasan singkat dari analisis teknis', 'Latihan presentasi ke audiens non-teknis', 'Minta umpan balik dari teman/mentor'],
    miniProject: 'Presentasikan satu hasil proyek ke audiens non-teknis dalam 5 menit.',
    durationDays: 7,
  },
  problemsolving: {
    objective: 'Melatih pendekatan sistematis dalam memecahkan masalah.',
    why: 'Kemampuan ini menentukan seberapa efektif kamu menangani masalah baru yang belum pernah ditemui.',
    after: 'Kamu bisa memecah masalah kompleks menjadi langkah-langkah kecil yang bisa dieksekusi.',
    resources: [{ title: 'Problem Solving Techniques', provider: 'Coursera', type: 'course' }],
    tasks: ['Latihan studi kasus terstruktur', 'Pelajari kerangka root-cause analysis', 'Terapkan pada satu masalah nyata dari proyek kuliah'],
    miniProject: 'Dokumentasikan satu proses pemecahan masalah nyata dari awal sampai solusi.',
    durationDays: 7,
  },
  projectmanagement: {
    objective: 'Memahami dasar perencanaan dan eksekusi proyek.',
    why: 'Kemampuan ini penting untuk memastikan pekerjaan tim berjalan tepat waktu dan terarah.',
    after: 'Kamu bisa menyusun timeline, milestone, dan memantau progres proyek kecil.',
    resources: [{ title: 'Project Management Basics', provider: 'Coursera', type: 'course' }],
    tasks: ['Pelajari metodologi Agile/Scrum dasar', 'Buat timeline & milestone untuk satu proyek', 'Latihan memantau progres dengan board sederhana'],
    miniProject: 'Kelola satu proyek kelompok kuliah menggunakan board Kanban sederhana.',
    durationDays: 8,
  },
};

/**
 * Data demand skill industri (dummy / demo data untuk halaman Industry Insights).
 */
/**
 * Region yang bisa difilter di Industry Insights & Career Explorer.
 * REGION_MULTIPLIER dipakai untuk menyimulasikan variasi demand per
 * wilayah dari angka demand nasional — bukan data regional riil.
 */
const REGIONS = ['Nasional', 'Jabodetabek', 'Jawa Timur', 'Jawa Barat', 'Remote'];
const REGION_MULTIPLIER = {
  Nasional: 1,
  Jabodetabek: 1.08,
  'Jawa Timur': 0.88,
  'Jawa Barat': 0.97,
  Remote: 0.72,
};

const INDUSTRY_INSIGHTS = [
  { skillId: 'sql', demand: 82, trend: 'stable', jobSampleSize: 350, period: '3 bulan terakhir' },
  { skillId: 'python', demand: 74, trend: 'up', jobSampleSize: 330, period: '3 bulan terakhir' },
  { skillId: 'problemsolving', demand: 77, trend: 'stable', jobSampleSize: 315, period: '3 bulan terakhir' },
  { skillId: 'communication', demand: 71, trend: 'stable', jobSampleSize: 325, period: '3 bulan terakhir' },
  { skillId: 'javascript', demand: 68, trend: 'stable', jobSampleSize: 310, period: '3 bulan terakhir' },
  { skillId: 'git', demand: 66, trend: 'up', jobSampleSize: 270, period: '3 bulan terakhir' },
  { skillId: 'cloud', demand: 61, trend: 'up', jobSampleSize: 255, period: '3 bulan terakhir' },
  { skillId: 'excel', demand: 60, trend: 'stable', jobSampleSize: 245, period: '3 bulan terakhir' },
  { skillId: 'datapipeline', demand: 58, trend: 'up', jobSampleSize: 255, period: '3 bulan terakhir' },
  { skillId: 'statistics', demand: 55, trend: 'stable', jobSampleSize: 235, period: '3 bulan terakhir' },
  { skillId: 'ml', demand: 52, trend: 'up', jobSampleSize: 220, period: '3 bulan terakhir' },
  { skillId: 'cybersecurity', demand: 49, trend: 'up', jobSampleSize: 210, period: '3 bulan terakhir' },
  { skillId: 'powerbi', demand: 47, trend: 'stable', jobSampleSize: 180, period: '3 bulan terakhir' },
  { skillId: 'docker', demand: 45, trend: 'up', jobSampleSize: 205, period: '3 bulan terakhir' },
  { skillId: 'uidesign', demand: 44, trend: 'stable', jobSampleSize: 185, period: '3 bulan terakhir' },
  { skillId: 'projectmanagement', demand: 40, trend: 'stable', jobSampleSize: 165, period: '3 bulan terakhir' },
  { skillId: 'react', demand: 39, trend: 'up', jobSampleSize: 155, period: '3 bulan terakhir' },
  { skillId: 'networking', demand: 36, trend: 'down', jobSampleSize: 150, period: '3 bulan terakhir' },
  { skillId: 'linux', demand: 34, trend: 'stable', jobSampleSize: 125, period: '3 bulan terakhir' },
  { skillId: 'figma', demand: 33, trend: 'stable', jobSampleSize: 160, period: '3 bulan terakhir' },
];

const TESTIMONIALS = [
  { name: 'Naila R.', role: 'Mahasiswa Sistem Informasi, semester 7', quote: 'Akhirnya tahu skill mana yang harus dikejar duluan, nggak asal belajar semua hal sekaligus.' },
  { name: 'Fajar A.', role: 'Fresh graduate Teknik Informatika', quote: 'Roadmap-nya bikin belajar habis magang jadi lebih terarah, ada target yang jelas tiap minggu.' },
  { name: 'Dinda P.', role: 'Mahasiswa Manajemen, minat Product', quote: 'Baru sadar soft skill juga dihitung, bukan cuma yang teknis. Jadi lebih siap wawancara.' },
];

const FAQ_ITEMS = [
  { q: 'Apakah SkillBridge menggantikan job portal seperti LinkedIn?', a: 'Tidak. SkillBridge fokus membantu kamu memahami kesiapan dan skill gap terhadap karier tertentu, bukan tempat melamar pekerjaan.' },
  { q: 'Dari mana data kebutuhan skill industri berasal?', a: 'Pada versi prototype ini, data industri masih berupa data contoh (demo data) untuk menunjukkan konsep. Formula dan sumber data dapat dikonfigurasi lebih lanjut.' },
  { q: 'Apakah Career Readiness Score itu akurat 100%?', a: 'Skor ini adalah estimasi berbasis kombinasi skill, portofolio, dan pengalaman yang kamu input — bukan penilaian resmi dari perusahaan manapun.' },
  { q: 'Apakah saya bisa mengganti target karier nanti?', a: 'Bisa. Kamu bisa mengganti target karier kapan saja lewat Career Explorer, dan seluruh analisis akan dihitung ulang.' },
];

/**
 * Item checklist Portfolio Readiness yang ditoggle manual oleh user.
 * Bagian "Technical Skills" pada halaman Portfolio Readiness dihitung
 * otomatis dari hasil skill assessment, jadi tidak didefinisikan di sini.
 */
const PORTFOLIO_CHECKLIST = [
  { id: 'project_basic', category: 'Portfolio', label: '1 proyek yang sudah selesai' },
  { id: 'project_realworld', category: 'Portfolio', label: 'Proyek end-to-end / real-world' },
  { id: 'github_docs', category: 'Portfolio', label: 'Dokumentasi GitHub yang rapi' },
  { id: 'internship', category: 'Experience', label: 'Pengalaman magang' },
  { id: 'open_source', category: 'Experience', label: 'Kontribusi open source' },
  { id: 'cv', category: 'Career Documents', label: 'CV' },
  { id: 'portfolio_site', category: 'Career Documents', label: 'Website portofolio' },
];

const ACHIEVEMENT_DEFS = [
  { code: 'first_assessment', title: 'First Assessment', description: 'Menyelesaikan skill assessment pertama.' },
  { code: 'first_roadmap', title: 'Roadmap Dimulai', description: 'Memulai learning roadmap pertama.' },
  { code: 'first_module_done', title: 'Skill Builder', description: 'Menyelesaikan modul roadmap pertama.' },
  { code: 'roadmap_completed', title: 'Roadmap Completed', description: 'Menyelesaikan seluruh fase roadmap.' },
  { code: 'portfolio_ready', title: 'Portfolio Ready', description: 'Portfolio Readiness Score mencapai 80% atau lebih.' },
];
