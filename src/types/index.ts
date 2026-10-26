export type Role = 'ADMIN' | 'DOKTER' | 'PARAMEDIS';

export type AttendanceStatus =
  | 'HADIR'
  | 'TERLAMBAT'
  | 'IZIN'
  | 'SAKIT'
  | 'ALPA'
  | 'SUDAH PULANG';

export type ShiftType = 'Pagi' | 'Siang' | 'Malam' | 'Full Day';

export type Department =
  | 'Poli Umum'
  | 'Poli Gigi'
  | 'Poli THT'
  | 'Poli Spesialis Kulit & Kelamin (KK)'
  | 'Poli Optik'
  | 'Poli Banat (Santri Putri)'
  | 'IGD / UGD 24 Jam'
  | 'Rawat Inap Santri'
  | 'Farmasi & Apotek'
  | 'Laboratorium Medis'
  | 'Layanan Ambulan 24 Jam'
  | 'Administrasi Medis';

export type BiometricMethod = 'WAJAH' | 'SIDIK_JARI' | 'PIN_MANUAL';

export interface User {
  id: string; // e.g., 'DOK-001'
  nama: string;
  jabatan: Role;
  spesialisasi?: string; // e.g. 'Dokter Umum', 'Dokter Gigi', 'Perawat Senior'
  bagian: Department;
  noHp: string;
  statusAktif: boolean;
  username: string;
  password?: string;
  foto?: string;
  sip?: string; // Surat Izin Praktik / STR
  bergabungSejak?: string;
  fingerprintRegistered?: boolean;
  faceRegistered?: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  nama: string;
  jabatan: Role;
  bagian: Department;
  tanggal: string; // YYYY-MM-DD
  jamMasuk: string; // HH:mm:ss or '-'
  jamPulang: string; // HH:mm:ss or '-'
  status: AttendanceStatus;
  shift?: ShiftType;
  keterangan?: string;
  suhuTubuh?: string; // e.g. 36.5 C
  lokasi?: string; // e.g. 'Klinik Sidogiri Induk'
  timestampMasuk?: number;
  timestampPulang?: number;
  // Biometric & GPS Geofencing verification
  metodeVerifikasi?: BiometricMethod;
  fotoWajah?: string; // Data URL snapshot of verified face
  koordinatGPS?: { latitude: number; longitude: number };
  jarakKeKlinikMeter?: number;
  statusLokasi?: 'DALAM_KLINIK' | 'LUAR_KLINIK';
}

export interface WorkSchedule {
  id: string;
  userId: string;
  namaPetugas: string;
  jabatan: Role;
  bagian: Department;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  shift: ShiftType;
  jamMulai: string; // e.g. '07:00'
  jamSelesai: string; // e.g. '14:00'
  ruangan?: string;
  keterangan?: string;
}

export interface ClinicProfile {
  nama: string;
  tagline: string;
  alamat: string;
  telepon: string;
  email: string;
  kepalaKlinik: string;
  jamOperasional: string;
  // Geofencing Coordinates (Klinik Pratama Sidogiri)
  latitude: number;
  longitude: number;
  radiusMeter: number;
}
