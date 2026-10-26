import { User, WorkSchedule, AttendanceRecord, ClinicProfile } from '../types';

export const INITIAL_CLINIC_PROFILE: ClinicProfile = {
  nama: 'Klinik Pratama Sidogiri',
  tagline: 'Layanan Kesehatan Terpadu Pondok Pesantren Sidogiri',
  alamat: 'Jalan Asrama Putra Pondok Pesantren Sidogiri RT2 RW2 Kraton Pasuruan',
  telepon: '(0343) 424177 • Layanan Ambulan 24 Jam',
  email: 'klinik@sidogiri.net',
  kepalaKlinik: 'dr. Gatot Trisila',
  jamOperasional: 'Pelayanan Poli Rawat Jalan | UGD, Rawat Inap & Ambulan 24 Jam',
  latitude: -7.669812,
  longitude: 112.85964,
  radiusMeter: 250,
};

/**
 * 25 Tenaga Medis Resmi Sesuai Dokumen Data Paramedis & Jadwal Poli Klinik Sidogiri
 */
export const INITIAL_USERS: User[] = [
  // --- ADMINISTRATOR ---
  {
    id: 'ADM-001',
    nama: 'Ust. H. Abdullah Syamsuri',
    jabatan: 'ADMIN',
    spesialisasi: 'Kepala Tata Usaha & Personalia',
    bagian: 'Administrasi Medis',
    noHp: '0812-3344-5566',
    statusAktif: true,
    username: 'admin',
    password: 'admin123',
    sip: 'ADM-SDG-2024-001',
    bergabungSejak: '2020-01-15',
  },

  // --- DOKTER (1 - 7) ---
  {
    id: 'DOK-001',
    nama: 'dr. Asmahani T Sp.DVE',
    jabatan: 'DOKTER',
    spesialisasi: 'Dokter KK (Spesialis Kulit & Kelamin / DVE)',
    bagian: 'Poli Spesialis Kulit & Kelamin (KK)',
    noHp: '0813-1122-3301',
    statusAktif: true,
    username: 'asmahani',
    password: '1234',
    sip: 'SIP.503/446/DOK-SP/35.14/2023',
    bergabungSejak: '2021-03-01',
  },
  {
    id: 'DOK-002',
    nama: 'dr. Prasetyo',
    jabatan: 'DOKTER',
    spesialisasi: 'Dokter THT (Telinga Hidung Tenggorokan)',
    bagian: 'Poli THT',
    noHp: '0813-1122-3302',
    statusAktif: true,
    username: 'prasetyo',
    password: '1234',
    sip: 'SIP.503/446/DOK-THT/35.14/2022',
    bergabungSejak: '2020-05-10',
  },
  {
    id: 'DOK-003',
    nama: 'drg. Suliono',
    jabatan: 'DOKTER',
    spesialisasi: 'Dokter Gigi',
    bagian: 'Poli Gigi',
    noHp: '0813-1122-3303',
    statusAktif: true,
    username: 'suliono',
    password: '1234',
    sip: 'SIP.503/446/DOK-GG/35.14/2021',
    bergabungSejak: '2019-08-15',
  },
  {
    id: 'DOK-004',
    nama: 'drg. Prasetyo Agung M',
    jabatan: 'DOKTER',
    spesialisasi: 'Dokter Gigi',
    bagian: 'Poli Gigi',
    noHp: '0813-1122-3304',
    statusAktif: true,
    username: 'agung',
    password: '1234',
    sip: 'SIP.503/446/DOK-GG/35.14/2023',
    bergabungSejak: '2022-01-10',
  },
  {
    id: 'DOK-005',
    nama: 'dr. Taufik',
    jabatan: 'DOKTER',
    spesialisasi: 'Dokter Umum / Pelayanan Santri & UGD',
    bagian: 'Poli Umum',
    noHp: '0813-1122-3305',
    statusAktif: true,
    username: 'taufik',
    password: '1234',
    sip: 'SIP.503/446/DOK-UM/35.14/2023',
    bergabungSejak: '2021-09-01',
  },
  {
    id: 'DOK-006',
    nama: 'dr. Gatot Trisila',
    jabatan: 'DOKTER',
    spesialisasi: 'Dokter Umum / Penanggung Jawab Medis',
    bagian: 'Poli Umum',
    noHp: '0813-1122-3306',
    statusAktif: true,
    username: 'gatot',
    password: '1234',
    sip: 'SIP.503/446/DOK-UM/35.14/2020',
    bergabungSejak: '2019-01-15',
  },
  {
    id: 'DOK-007',
    nama: 'dr. Ery Ardiana',
    jabatan: 'DOKTER',
    spesialisasi: 'Dokter Piket Banat (Santri Putri)',
    bagian: 'Poli Banat (Santri Putri)',
    noHp: '0813-1122-3307',
    statusAktif: true,
    username: 'ery',
    password: '1234',
    sip: 'SIP.503/446/DOK-UM/35.14/2022',
    bergabungSejak: '2022-06-01',
  },

  // --- PARAMEDIS & PENUNJANG MEDIS (8 - 25) ---
  {
    id: 'PRM-001',
    nama: 'Indah Wijayanti Amd.Keb',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Bidan / Piket Banat (Santri Putri)',
    bagian: 'Poli Banat (Santri Putri)',
    noHp: '0852-2233-4408',
    statusAktif: true,
    username: 'indah',
    password: '1234',
    sip: 'STRB.150252220-4829108',
    bergabungSejak: '2021-08-10',
  },
  {
    id: 'PRM-002',
    nama: 'Romly Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana UGD & Rawat Inap',
    bagian: 'IGD / UGD 24 Jam',
    noHp: '0852-2233-4409',
    statusAktif: true,
    username: 'romly',
    password: '1234',
    sip: 'STR.150152221-3948509',
    bergabungSejak: '2020-02-01',
  },
  {
    id: 'PRM-003',
    nama: 'H. Walid Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Senior UGD',
    bagian: 'IGD / UGD 24 Jam',
    noHp: '0852-2233-4410',
    statusAktif: true,
    username: 'walid',
    password: '1234',
    sip: 'STR.150152221-3948510',
    bergabungSejak: '2019-03-15',
  },
  {
    id: 'PRM-004',
    nama: 'Darmawan S.Kep.,Ns',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Ners / Perawat Rawat Inap Santri',
    bagian: 'Rawat Inap Santri',
    noHp: '0852-2233-4411',
    statusAktif: true,
    username: 'darmawan',
    password: '1234',
    sip: 'STR.150152221-3948511',
    bergabungSejak: '2021-05-20',
  },
  {
    id: 'PRM-005',
    nama: 'H. Wagino Ali M',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana',
    bagian: 'IGD / UGD 24 Jam',
    noHp: '0852-2233-4412',
    statusAktif: true,
    username: 'wagino',
    password: '1234',
    sip: 'STR.150152221-3948512',
    bergabungSejak: '2018-11-01',
  },
  {
    id: 'PRM-006',
    nama: 'M. Hatta Hamid S.Kep.,Ns',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Ners / Koordinator Keperawatan',
    bagian: 'Rawat Inap Santri',
    noHp: '0852-2233-4413',
    statusAktif: true,
    username: 'hatta',
    password: '1234',
    sip: 'STR.150152221-3948513',
    bergabungSejak: '2020-07-01',
  },
  {
    id: 'PRM-007',
    nama: 'M. Khoirul Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana',
    bagian: 'IGD / UGD 24 Jam',
    noHp: '0852-2233-4414',
    statusAktif: true,
    username: 'khoirul',
    password: '1234',
    sip: 'STR.150152221-3948514',
    bergabungSejak: '2021-10-15',
  },
  {
    id: 'PRM-008',
    nama: 'A. Kholilurrahman S.Kep.,Ns',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Ners / Perawat Jaga Santri',
    bagian: 'Rawat Inap Santri',
    noHp: '0852-2233-4415',
    statusAktif: true,
    username: 'kholil',
    password: '1234',
    sip: 'STR.150152221-3948515',
    bergabungSejak: '2022-02-10',
  },
  {
    id: 'PRM-009',
    nama: 'Didin Mujahidin Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana UGD',
    bagian: 'IGD / UGD 24 Jam',
    noHp: '0852-2233-4416',
    statusAktif: true,
    username: 'didin',
    password: '1234',
    sip: 'STR.150152221-3948516',
    bergabungSejak: '2021-04-12',
  },
  {
    id: 'PRM-010',
    nama: 'Ahyan Fadly Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana',
    bagian: 'Rawat Inap Santri',
    noHp: '0852-2233-4417',
    statusAktif: true,
    username: 'ahyan',
    password: '1234',
    sip: 'STR.150152221-3948517',
    bergabungSejak: '2022-08-01',
  },
  {
    id: 'PRM-011',
    nama: 'Setiawan S.D Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana UGD',
    bagian: 'IGD / UGD 24 Jam',
    noHp: '0852-2233-4418',
    statusAktif: true,
    username: 'setiawan',
    password: '1234',
    sip: 'STR.150152221-3948518',
    bergabungSejak: '2022-11-20',
  },
  {
    id: 'PRM-012',
    nama: 'Tutut Amalia Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana Banat',
    bagian: 'Poli Banat (Santri Putri)',
    noHp: '0852-2233-4419',
    statusAktif: true,
    username: 'tutut',
    password: '1234',
    sip: 'STR.150152221-3948519',
    bergabungSejak: '2023-01-15',
  },
  {
    id: 'PRM-013',
    nama: 'Erina Purnama S Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana Banat',
    bagian: 'Poli Banat (Santri Putri)',
    noHp: '0852-2233-4420',
    statusAktif: true,
    username: 'erina',
    password: '1234',
    sip: 'STR.150152221-3948520',
    bergabungSejak: '2023-03-01',
  },
  {
    id: 'PRM-014',
    nama: 'S.Indriani Amd.Kep',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Pelaksana Banat',
    bagian: 'Poli Banat (Santri Putri)',
    noHp: '0852-2233-4421',
    statusAktif: true,
    username: 'indriani',
    password: '1234',
    sip: 'STR.150152221-3948521',
    bergabungSejak: '2023-05-10',
  },
  {
    id: 'PRM-015',
    nama: 'H. Mahrus Amd.K.G',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Perawat Gigi (Poli Gigi)',
    bagian: 'Poli Gigi',
    noHp: '0852-2233-4422',
    statusAktif: true,
    username: 'mahrus',
    password: '1234',
    sip: 'STR.150352221-3948522',
    bergabungSejak: '2019-09-01',
  },
  {
    id: 'PRM-016',
    nama: 'Dianusvita Amd.A.K',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Analis Laboratorium Medis',
    bagian: 'Laboratorium Medis',
    noHp: '0852-2233-4423',
    statusAktif: true,
    username: 'dianusvita',
    password: '1234',
    sip: 'STR.150852221-3948523',
    bergabungSejak: '2021-04-01',
  },
  {
    id: 'PRM-017',
    nama: 'Bpk Sulhan',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Sopir Ambulan 24 Jam',
    bagian: 'Layanan Ambulan 24 Jam',
    noHp: '0812-3456-7891',
    statusAktif: true,
    username: 'sulhan',
    password: '1234',
    sip: 'SIM.B1-729481923',
    bergabungSejak: '2020-01-01',
  },
  {
    id: 'PRM-018',
    nama: 'Misnawar',
    jabatan: 'PARAMEDIS',
    spesialisasi: 'Sopir Ambulan 24 Jam',
    bagian: 'Layanan Ambulan 24 Jam',
    noHp: '0812-3456-7892',
    statusAktif: true,
    username: 'misnawar',
    password: '1234',
    sip: 'SIM.B1-839201948',
    bergabungSejak: '2020-03-01',
  },
];

/**
 * GENERATE JADWAL KERJA SESUAI DOKUMEN & INSTRUKSI:
 * 1. Jadwal spesifik sesuai Gambar 2 (Jadwal Poli Klinik Pratama Sidogiri):
 *    - H. Mahrus: Senin & Selasa (09:00 - 11:00 WIB)
 *    - dr. Prasetyo: Senin, Selasa, Rabu, Kamis, Sabtu (09:00 - 11:00 WIB)
 *    - drg. Suliono: Rabu, Jumat, Sabtu (12:00 - 14:00 WIB)
 *    - drg. Prasetyo Agung M: Kamis (09:00 - 11:00 WIB)
 *    - dr. Asmahani T Sp.DVE: Senin & Kamis (09:00 - 11:00 WIB - Kondisional)
 * 2. "JIKALAO TIDAK AD JADWAL MAKA PIKETNYA SETIAP HARI":
 *    - Seluruh tenaga medis lainnya memiliki jadwal dinas piket SETIAP HARI (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu)
 */
const ALL_DAYS: WorkSchedule['hari'][] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

const generateInitialSchedules = (): WorkSchedule[] => {
  const list: WorkSchedule[] = [];
  let counter = 1;

  const add = (
    userId: string,
    nama: string,
    jabatan: User['jabatan'],
    bagian: User['bagian'],
    hari: WorkSchedule['hari'],
    shift: WorkSchedule['shift'],
    jamMulai: string,
    jamSelesai: string,
    ruangan: string,
    keterangan: string
  ) => {
    list.push({
      id: `SCH-${String(counter++).padStart(4, '0')}`,
      userId,
      namaPetugas: nama,
      jabatan,
      bagian,
      hari,
      shift,
      jamMulai,
      jamSelesai,
      ruangan,
      keterangan,
    });
  };

  // 1. dr. Asmahani T Sp.DVE (Poli Kulit Senin/Kamis Kondisional)
  add('DOK-001', 'dr. Asmahani T Sp.DVE', 'DOKTER', 'Poli Spesialis Kulit & Kelamin (KK)', 'Senin', 'Pagi', '09:00', '11:00', 'Poli Spesialis Kulit', 'Pelayanan Kulit & Kelamin (Kondisional)');
  add('DOK-001', 'dr. Asmahani T Sp.DVE', 'DOKTER', 'Poli Spesialis Kulit & Kelamin (KK)', 'Kamis', 'Pagi', '09:00', '11:00', 'Poli Spesialis Kulit', 'Pelayanan Kulit & Kelamin (Kondisional)');

  // 2. dr. Prasetyo (Poli THT: Senin, Selasa, Rabu, Kamis, Sabtu • 09:00–11:00 WIB)
  const thtDays: WorkSchedule['hari'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Sabtu'];
  thtDays.forEach((d) => {
    add('DOK-002', 'dr. Prasetyo', 'DOKTER', 'Poli THT', d, 'Pagi', '09:00', '11:00', 'Ruang Poli THT', 'Pemeriksaan Telinga, Hidung & Tenggorokan');
  });

  // 3. H. Mahrus Amd.K.G (Poli Gigi: Senin & Selasa • 09:00–11:00 WIB)
  add('PRM-015', 'H. Mahrus Amd.K.G', 'PARAMEDIS', 'Poli Gigi', 'Senin', 'Pagi', '09:00', '11:00', 'Ruang Poli Gigi', 'Pelayanan Asuhan Keperawatan Gigi');
  add('PRM-015', 'H. Mahrus Amd.K.G', 'PARAMEDIS', 'Poli Gigi', 'Selasa', 'Pagi', '09:00', '11:00', 'Ruang Poli Gigi', 'Pelayanan Asuhan Keperawatan Gigi');

  // 4. drg. Suliono (Poli Gigi: Rabu, Jumat, Sabtu • 12:00–14:00 WIB)
  const sulionoDays: WorkSchedule['hari'][] = ['Rabu', 'Jumat', 'Sabtu'];
  sulionoDays.forEach((d) => {
    add('DOK-003', 'drg. Suliono', 'DOKTER', 'Poli Gigi', d, 'Siang', '12:00', '14:00', 'Ruang Poli Gigi', 'Tindakan Gigi & Konservasi Gigi Santri');
  });

  // 5. drg. Prasetyo Agung M (Poli Gigi: Kamis • 09:00–11:00 WIB)
  add('DOK-004', 'drg. Prasetyo Agung M', 'DOKTER', 'Poli Gigi', 'Kamis', 'Pagi', '09:00', '11:00', 'Ruang Poli Gigi', 'Pemeriksaan & Tindakan Gigi Santri');

  // 6. dr. Taufik (Dokter Umum - PIKET SETIAP HARI)
  ALL_DAYS.forEach((d) => {
    add('DOK-005', 'dr. Taufik', 'DOKTER', 'Poli Umum', d, 'Pagi', '07:00', '14:00', 'Poli Umum & UGD', 'Piket Dokter Umum & Pemeriksaan Santri');
  });

  // 7. dr. Gatot Trisila (Dokter Umum - PIKET SETIAP HARI)
  ALL_DAYS.forEach((d) => {
    add('DOK-006', 'dr. Gatot Trisila', 'DOKTER', 'Poli Umum', d, 'Siang', '14:00', '21:00', 'Poli Umum & UGD', 'Piket Dokter Umum & Pelayanan Medis');
  });

  // 8. dr. Ery Ardiana (Piket Banat - PIKET SETIAP HARI)
  ALL_DAYS.forEach((d) => {
    add('DOK-007', 'dr. Ery Ardiana', 'DOKTER', 'Poli Banat (Santri Putri)', d, 'Pagi', '08:00', '14:00', 'Pos Kesehatan Banat', 'Piket Dokter Banat (Kesehatan Santri Putri)');
  });

  // 9. Indah Wijayanti Amd.Keb (Piket Banat - PIKET SETIAP HARI)
  ALL_DAYS.forEach((d) => {
    add('PRM-001', 'Indah Wijayanti Amd.Keb', 'PARAMEDIS', 'Poli Banat (Santri Putri)', d, 'Pagi', '07:30', '14:00', 'Pos Kesehatan Banat', 'Piket Bidan & Pelayanan Santri Putri');
  });

  // 10. Perawat UGD & Rawat Inap (PIKET SETIAP HARI BERBAGI SHIFT)
  // Perawat Romly (UGD Shift Pagi setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-002', 'Romly Amd.Kep', 'PARAMEDIS', 'IGD / UGD 24 Jam', d, 'Pagi', '07:00', '14:00', 'UGD 24 Jam', 'Piket Triase & Emergency UGD');
  });

  // Perawat H. Walid (UGD Shift Siang setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-003', 'H. Walid Amd.Kep', 'PARAMEDIS', 'IGD / UGD 24 Jam', d, 'Siang', '14:00', '21:00', 'UGD 24 Jam', 'Piket UGD & Perawatan Tindakan');
  });

  // Perawat Darmawan (Rawat Inap Shift Pagi setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-004', 'Darmawan S.Kep.,Ns', 'PARAMEDIS', 'Rawat Inap Santri', d, 'Pagi', '07:00', '14:00', 'Bangsal Rawat Inap', 'Piket Asuhan Keperawatan Rawat Inap');
  });

  // Perawat H. Wagino Ali M (UGD Shift Malam setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-005', 'H. Wagino Ali M', 'PARAMEDIS', 'IGD / UGD 24 Jam', d, 'Malam', '21:00', '07:00', 'UGD 24 Jam', 'Piket Jaga Malam UGD');
  });

  // Perawat M. Hatta Hamid (Rawat Inap Shift Siang setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-006', 'M. Hatta Hamid S.Kep.,Ns', 'PARAMEDIS', 'Rawat Inap Santri', d, 'Siang', '14:00', '21:00', 'Bangsal Rawat Inap', 'Piket Visite & Terapi Santri Rawat Inap');
  });

  // Perawat M. Khoirul (UGD Shift Pagi setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-007', 'M. Khoirul Amd.Kep', 'PARAMEDIS', 'IGD / UGD 24 Jam', d, 'Pagi', '07:00', '14:00', 'UGD 24 Jam', 'Piket Pelayanan Medis UGD');
  });

  // Perawat A. Kholilurrahman (Rawat Inap Shift Malam setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-008', 'A. Kholilurrahman S.Kep.,Ns', 'PARAMEDIS', 'Rawat Inap Santri', d, 'Malam', '21:00', '07:00', 'Bangsal Rawat Inap', 'Piket Jaga Malam Rawat Inap Santri');
  });

  // Perawat Didin Mujahidin (UGD Shift Siang setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-009', 'Didin Mujahidin Amd.Kep', 'PARAMEDIS', 'IGD / UGD 24 Jam', d, 'Siang', '14:00', '21:00', 'UGD 24 Jam', 'Piket Emergency & Tindakan');
  });

  // Perawat Ahyan Fadly (Rawat Inap Shift Pagi setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-010', 'Ahyan Fadly Amd.Kep', 'PARAMEDIS', 'Rawat Inap Santri', d, 'Pagi', '07:00', '14:00', 'Bangsal Rawat Inap', 'Piket Perawatan Santri');
  });

  // Perawat Setiawan S.D (UGD Shift Malam setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-011', 'Setiawan S.D Amd.Kep', 'PARAMEDIS', 'IGD / UGD 24 Jam', d, 'Malam', '21:00', '07:00', 'UGD 24 Jam', 'Piket Shift Malam UGD');
  });

  // Perawat Banat: Tutut Amalia, Erina Purnama, S.Indriani (Piket Banat setiap hari)
  ALL_DAYS.forEach((d) => {
    add('PRM-012', 'Tutut Amalia Amd.Kep', 'PARAMEDIS', 'Poli Banat (Santri Putri)', d, 'Pagi', '07:00', '14:00', 'Pos Kesehatan Banat', 'Piket Asuhan Keperawatan Banat');
    add('PRM-013', 'Erina Purnama S Amd.Kep', 'PARAMEDIS', 'Poli Banat (Santri Putri)', d, 'Siang', '14:00', '21:00', 'Pos Kesehatan Banat', 'Piket Pelayanan Medis Banat');
    add('PRM-014', 'S.Indriani Amd.Kep', 'PARAMEDIS', 'Poli Banat (Santri Putri)', d, 'Malam', '21:00', '07:00', 'Pos Kesehatan Banat', 'Piket Jaga Malam Banat');
  });

  // 11. Dianusvita Amd.A.K (Analis Lab - PIKET SETIAP HARI)
  ALL_DAYS.forEach((d) => {
    add('PRM-016', 'Dianusvita Amd.A.K', 'PARAMEDIS', 'Laboratorium Medis', d, 'Pagi', '07:30', '14:30', 'Laboratorium Medis', 'Piket Pemeriksaan Lab Diagnostik Santri');
  });

  // 12. Bpk Sulhan & Misnawar (Sopir Ambulan 24 Jam - PIKET SETIAP HARI)
  ALL_DAYS.forEach((d) => {
    add('PRM-017', 'Bpk Sulhan', 'PARAMEDIS', 'Layanan Ambulan 24 Jam', d, 'Pagi', '07:00', '19:00', 'Posko Ambulans Sidogiri', 'Piket Standby Driver Ambulan 24 Jam');
    add('PRM-018', 'Misnawar', 'PARAMEDIS', 'Layanan Ambulan 24 Jam', d, 'Malam', '19:00', '07:00', 'Posko Ambulans Sidogiri', 'Piket Standby Driver Ambulan 24 Jam');
  });

  return list;
};

export const INITIAL_SCHEDULES: WorkSchedule[] = generateInitialSchedules();

// Helper to get formatted date string for today and previous days
const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's attendance seed records using the real staff from images
  {
    id: 'ATT-TODAY-001',
    userId: 'DOK-005',
    nama: 'dr. Taufik',
    jabatan: 'DOKTER',
    bagian: 'Poli Umum',
    tanggal: getFormattedDate(0),
    jamMasuk: '06:55:12',
    jamPulang: '-',
    status: 'HADIR',
    shift: 'Pagi',
    keterangan: 'Piket Poli Umum tepat waktu melayani santri',
    suhuTubuh: '36.4°C',
    lokasi: 'Poli Umum Sidogiri',
    timestampMasuk: Date.now() - 3 * 3600 * 1000,
  },
  {
    id: 'ATT-TODAY-002',
    userId: 'PRM-002',
    nama: 'Romly Amd.Kep',
    jabatan: 'PARAMEDIS',
    bagian: 'IGD / UGD 24 Jam',
    tanggal: getFormattedDate(0),
    jamMasuk: '06:48:30',
    jamPulang: '14:05:00',
    status: 'SUDAH PULANG',
    shift: 'Pagi',
    keterangan: 'Piket UGD pagi selesai & operan jaga aman',
    suhuTubuh: '36.5°C',
    lokasi: 'UGD 24 Jam',
    timestampMasuk: Date.now() - 7 * 3600 * 1000,
    timestampPulang: Date.now() - 1 * 3600 * 1000,
  },
  {
    id: 'ATT-TODAY-003',
    userId: 'DOK-002',
    nama: 'dr. Prasetyo',
    jabatan: 'DOKTER',
    bagian: 'Poli THT',
    tanggal: getFormattedDate(0),
    jamMasuk: '08:52:10',
    jamPulang: '11:10:00',
    status: 'SUDAH PULANG',
    shift: 'Pagi',
    keterangan: 'Pelayanan Poli THT selesai',
    suhuTubuh: '36.3°C',
    lokasi: 'Poli THT',
    timestampMasuk: Date.now() - 4 * 3600 * 1000,
    timestampPulang: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: 'ATT-TODAY-004',
    userId: 'PRM-015',
    nama: 'H. Mahrus Amd.K.G',
    jabatan: 'PARAMEDIS',
    bagian: 'Poli Gigi',
    tanggal: getFormattedDate(0),
    jamMasuk: '08:55:00',
    jamPulang: '-',
    status: 'HADIR',
    shift: 'Pagi',
    keterangan: 'Pelayanan asuhan keperawatan gigi santri',
    suhuTubuh: '36.5°C',
    lokasi: 'Poli Gigi Sidogiri',
    timestampMasuk: Date.now() - 3 * 3600 * 1000,
  },
  {
    id: 'ATT-TODAY-005',
    userId: 'DOK-007',
    nama: 'dr. Ery Ardiana',
    jabatan: 'DOKTER',
    bagian: 'Poli Banat (Santri Putri)',
    tanggal: getFormattedDate(0),
    jamMasuk: '07:50:22',
    jamPulang: '-',
    status: 'HADIR',
    shift: 'Pagi',
    keterangan: 'Piket Banat santri putri berjalan lancar',
    suhuTubuh: '36.4°C',
    lokasi: 'Pos Kesehatan Banat',
  },
  {
    id: 'ATT-TODAY-006',
    userId: 'PRM-001',
    nama: 'Indah Wijayanti Amd.Keb',
    jabatan: 'PARAMEDIS',
    bagian: 'Poli Banat (Santri Putri)',
    tanggal: getFormattedDate(0),
    jamMasuk: '07:28:15',
    jamPulang: '-',
    status: 'HADIR',
    shift: 'Pagi',
    keterangan: 'Piket kebidanan & kesehatan santri putri',
    suhuTubuh: '36.6°C',
    lokasi: 'Pos Kesehatan Banat',
  },
  {
    id: 'ATT-TODAY-007',
    userId: 'PRM-016',
    nama: 'Dianusvita Amd.A.K',
    jabatan: 'PARAMEDIS',
    bagian: 'Laboratorium Medis',
    tanggal: getFormattedDate(0),
    jamMasuk: '07:25:00',
    jamPulang: '-',
    status: 'HADIR',
    shift: 'Pagi',
    keterangan: 'Piket Lab: pemeriksaan spesimen santri',
    suhuTubuh: '36.5°C',
    lokasi: 'Laboratorium Medis Sidogiri',
  },
  {
    id: 'ATT-TODAY-008',
    userId: 'PRM-017',
    nama: 'Bpk Sulhan',
    jabatan: 'PARAMEDIS',
    bagian: 'Layanan Ambulan 24 Jam',
    tanggal: getFormattedDate(0),
    jamMasuk: '06:50:00',
    jamPulang: '-',
    status: 'HADIR',
    shift: 'Pagi',
    keterangan: 'Piket Ambulan standby siap rujukan emergency',
    suhuTubuh: '36.4°C',
    lokasi: 'Posko Ambulans 24 Jam',
  },
  {
    id: 'ATT-TODAY-009',
    userId: 'DOK-001',
    nama: 'dr. Asmahani T Sp.DVE',
    jabatan: 'DOKTER',
    bagian: 'Poli Spesialis Kulit & Kelamin (KK)',
    tanggal: getFormattedDate(0),
    jamMasuk: '-',
    jamPulang: '-',
    status: 'IZIN',
    shift: 'Pagi',
    keterangan: 'Jadwal kondisional: ada simposium spesialis kulit',
    lokasi: 'Kondisional',
  },
  // Yesterday's sample records
  {
    id: 'ATT-YEST-001',
    userId: 'DOK-006',
    nama: 'dr. Gatot Trisila',
    jabatan: 'DOKTER',
    bagian: 'Poli Umum',
    tanggal: getFormattedDate(-1),
    jamMasuk: '13:55:00',
    jamPulang: '21:05:30',
    status: 'SUDAH PULANG',
    shift: 'Siang',
    keterangan: 'Piket sore-malam santri rawat jalan aman',
    suhuTubuh: '36.5°C',
    lokasi: 'Poli Umum Sidogiri',
  },
  {
    id: 'ATT-YEST-002',
    userId: 'PRM-003',
    nama: 'H. Walid Amd.Kep',
    jabatan: 'PARAMEDIS',
    bagian: 'IGD / UGD 24 Jam',
    tanggal: getFormattedDate(-1),
    jamMasuk: '13:58:10',
    jamPulang: '21:00:44',
    status: 'SUDAH PULANG',
    shift: 'Siang',
    keterangan: 'Shift siang UGD lancar terkendali',
    suhuTubuh: '36.4°C',
    lokasi: 'UGD 24 Jam',
  },
  {
    id: 'ATT-YEST-003',
    userId: 'PRM-005',
    nama: 'H. Wagino Ali M',
    jabatan: 'PARAMEDIS',
    bagian: 'IGD / UGD 24 Jam',
    tanggal: getFormattedDate(-1),
    jamMasuk: '20:55:00',
    jamPulang: '07:05:00',
    status: 'SUDAH PULANG',
    shift: 'Malam',
    keterangan: 'Jaga malam UGD & rujukan santri',
    suhuTubuh: '36.5°C',
    lokasi: 'UGD 24 Jam',
  },
];
