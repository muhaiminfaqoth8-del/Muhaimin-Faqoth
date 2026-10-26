import {
  User,
  AttendanceRecord,
  WorkSchedule,
  ClinicProfile,
  AttendanceStatus,
  ShiftType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCE,
  INITIAL_CLINIC_PROFILE,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'SIDOGIRI_USERS_V3',
  ATTENDANCE: 'SIDOGIRI_ATTENDANCE_V3',
  SCHEDULES: 'SIDOGIRI_SCHEDULES_V3',
  PROFILE: 'SIDOGIRI_PROFILE_V3',
  ACTIVE_USER: 'SIDOGIRI_CURRENT_USER_V3',
};

// Date format helper: YYYY-MM-DD
export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Time format helper: HH:mm:ss
export const getCurrentTimeString = (): string => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const getDayNameIndonesian = (date: Date = new Date()): WorkSchedule['hari'] => {
  const days: WorkSchedule['hari'][] = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ];
  return days[date.getDay()];
};

class StorageService {
  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_CLINIC_PROFILE));
    }
  }

  // --- Profile ---
  getClinicProfile(): ClinicProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_CLINIC_PROFILE;
    } catch {
      return INITIAL_CLINIC_PROFILE;
    }
  }

  updateClinicProfile(profile: ClinicProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // --- Users ---
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  addUser(user: User): { success: boolean; message: string } {
    const users = this.getUsers();
    // Validate uniqueness of username and ID
    if (users.some((u) => u.id.toLowerCase() === user.id.toLowerCase())) {
      return { success: false, message: `ID Petugas ${user.id} sudah digunakan.` };
    }
    if (users.some((u) => u.username.toLowerCase() === user.username.toLowerCase())) {
      return { success: false, message: `Username "${user.username}" sudah digunakan.` };
    }

    users.push(user);
    this.saveUsers(users);
    return { success: true, message: `Petugas ${user.nama} berhasil ditambahkan.` };
  }

  updateUser(updatedUser: User): { success: boolean; message: string } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === updatedUser.id);
    if (index === -1) {
      return { success: false, message: 'Petugas tidak ditemukan.' };
    }

    // Check username collision with others
    const usernameConflict = users.some(
      (u) => u.id !== updatedUser.id && u.username.toLowerCase() === updatedUser.username.toLowerCase()
    );
    if (usernameConflict) {
      return { success: false, message: `Username "${updatedUser.username}" sudah digunakan petugas lain.` };
    }

    users[index] = { ...users[index], ...updatedUser };
    this.saveUsers(users);

    // If current logged-in user is updated, update session too
    const current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(users[index]);
    }

    return { success: true, message: 'Data petugas berhasil diperbarui.' };
  }

  toggleUserStatus(id: string): { success: boolean; newStatus: boolean } {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) return { success: false, newStatus: false };
    user.statusAktif = !user.statusAktif;
    this.saveUsers(users);
    return { success: true, newStatus: user.statusAktif };
  }

  deleteUser(id: string): { success: boolean; message: string } {
    let users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) return { success: false, message: 'Petugas tidak ditemukan.' };
    if (user.jabatan === 'ADMIN' && users.filter((u) => u.jabatan === 'ADMIN').length <= 1) {
      return { success: false, message: 'Tidak dapat menghapus satu-satunya akun Admin.' };
    }

    users = users.filter((u) => u.id !== id);
    this.saveUsers(users);
    return { success: true, message: `Data petugas ${user.nama} berhasil dihapus.` };
  }

  // --- Auth Session ---
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  }

  authenticate(usernameOrId: string, pin: string): { success: boolean; user?: User; message: string } {
    const trimmedInput = usernameOrId.trim();
    const users = this.getUsers();

    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === trimmedInput.toLowerCase() ||
          u.id.toLowerCase() === trimmedInput.toLowerCase()) &&
        u.password === pin
    );

    if (!user) {
      return {
        success: false,
        message: 'Username/ID atau PIN tidak sesuai. Silakan periksa kembali.',
      };
    }

    if (!user.statusAktif) {
      return {
        success: false,
        message: 'Akun Anda sedang dinonaktifkan oleh administrator klinik. Silakan hubungi tata usaha.',
      };
    }

    this.setCurrentUser(user);
    return {
      success: true,
      user,
      message: `Selamat datang, ${user.nama}!`,
    };
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  // --- Schedules ---
  getSchedules(): WorkSchedule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return data ? JSON.parse(data) : INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  }

  saveSchedules(schedules: WorkSchedule[]): void {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }

  addSchedule(schedule: WorkSchedule): { success: boolean; message: string } {
    const schedules = this.getSchedules();
    schedules.push(schedule);
    this.saveSchedules(schedules);
    return { success: true, message: 'Jadwal kerja berhasil ditambahkan.' };
  }

  updateSchedule(schedule: WorkSchedule): { success: boolean; message: string } {
    const schedules = this.getSchedules();
    const index = schedules.findIndex((s) => s.id === schedule.id);
    if (index === -1) return { success: false, message: 'Jadwal tidak ditemukan.' };
    schedules[index] = schedule;
    this.saveSchedules(schedules);
    return { success: true, message: 'Jadwal kerja berhasil diperbarui.' };
  }

  deleteSchedule(id: string): { success: boolean; message: string } {
    let schedules = this.getSchedules();
    schedules = schedules.filter((s) => s.id !== id);
    this.saveSchedules(schedules);
    return { success: true, message: 'Jadwal kerja berhasil dihapus.' };
  }

  getTodayScheduleForUser(userId: string): WorkSchedule | undefined {
    const todayDayName = getDayNameIndonesian();
    return this.getSchedules().find(
      (s) => s.userId === userId && s.hari === todayDayName
    );
  }

  // --- Attendance ---
  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  }

  saveAttendance(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  }

  // Get record for user today
  getTodayRecordForUser(userId: string): AttendanceRecord | undefined {
    const today = getTodayDateString();
    return this.getAttendance().find(
      (att) => att.userId === userId && att.tanggal === today
    );
  }

  /**
   * Rule: Cegah pengguna melakukan absensi masuk dua kali pada tanggal yang sama.
   */
  canCheckIn(userId: string): { can: boolean; reason?: string } {
    const existing = this.getTodayRecordForUser(userId);
    if (existing) {
      if (existing.status === 'IZIN' || existing.status === 'SAKIT') {
        return {
          can: false,
          reason: `Anda sudah tercatat ${existing.status} untuk hari ini.`,
        };
      }
      return {
        can: false,
        reason: `Anda sudah melakukan Absen Masuk hari ini pada pukul ${existing.jamMasuk} (Status: ${existing.status}).`,
      };
    }
    return { can: true };
  }

  /**
   * Rule: Cegah pengguna melakukan absensi pulang sebelum melakukan absensi masuk.
   */
  canCheckOut(userId: string): { can: boolean; reason?: string } {
    const existing = this.getTodayRecordForUser(userId);
    if (!existing) {
      return {
        can: false,
        reason: 'Anda belum melakukan Absen Masuk hari ini. Lakukan Absen Masuk terlebih dahulu.',
      };
    }
    if (existing.status === 'IZIN' || existing.status === 'SAKIT') {
      return {
        can: false,
        reason: `Status kehadiran Anda hari ini adalah ${existing.status}. Tidak dapat melakukan absen pulang.`,
      };
    }
    if (existing.status === 'SUDAH PULANG' || existing.jamPulang !== '-') {
      return {
        can: false,
        reason: `Anda sudah melakukan Absen Pulang hari ini pada pukul ${existing.jamPulang}.`,
      };
    }
    return { can: true };
  }

  /**
   * Absen Masuk
   */
  recordCheckIn(
    user: User,
    options?: {
      shift?: ShiftType;
      keterangan?: string;
      suhuTubuh?: string;
      lokasi?: string;
    }
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const check = this.canCheckIn(user.id);
    if (!check.can) {
      return { success: false, message: check.reason || 'Tidak dapat absen masuk.' };
    }

    const now = new Date();
    const todayDate = getTodayDateString();
    const timeStr = getCurrentTimeString();

    // Determine status (HADIR or TERLAMBAT) based on schedule
    let status: AttendanceStatus = 'HADIR';
    const schedule = this.getTodayScheduleForUser(user.id);
    const shift = options?.shift || schedule?.shift || 'Pagi';

    // If schedule has start time, evaluate late tolerance (15 mins)
    if (schedule && schedule.jamMulai) {
      const [schedHours, schedMins] = schedule.jamMulai.split(':').map(Number);
      const schedTimeInMinutes = schedHours * 60 + schedMins;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (currentMinutes > schedTimeInMinutes + 15) {
        status = 'TERLAMBAT';
      }
    }

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      nama: user.nama,
      jabatan: user.jabatan,
      bagian: user.bagian,
      tanggal: todayDate,
      jamMasuk: timeStr,
      jamPulang: '-',
      status: status,
      shift: shift,
      keterangan: options?.keterangan || (status === 'TERLAMBAT' ? 'Hadir terlambat' : 'Absen tepat waktu'),
      suhuTubuh: options?.suhuTubuh || '36.5°C',
      lokasi: options?.lokasi || 'Klinik Sidogiri',
      timestampMasuk: now.getTime(),
    };

    const records = this.getAttendance();
    records.unshift(newRecord);
    this.saveAttendance(records);

    return {
      success: true,
      message: `Absen Masuk berhasil dicatat pada ${timeStr} WIB dengan status: ${status}.`,
      record: newRecord,
    };
  }

  /**
   * Absen Pulang
   */
  recordCheckOut(
    userId: string,
    keterangan?: string
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const check = this.canCheckOut(userId);
    if (!check.can) {
      return { success: false, message: check.reason || 'Tidak dapat absen pulang.' };
    }

    const timeStr = getCurrentTimeString();
    const records = this.getAttendance();
    const today = getTodayDateString();
    const index = records.findIndex((r) => r.userId === userId && r.tanggal === today);

    if (index === -1) {
      return { success: false, message: 'Data absensi masuk tidak ditemukan.' };
    }

    records[index] = {
      ...records[index],
      jamPulang: timeStr,
      status: 'SUDAH PULANG',
      keterangan: keterangan
        ? `${records[index].keterangan || ''} | Pulang: ${keterangan}`
        : records[index].keterangan,
      timestampPulang: Date.now(),
    };

    this.saveAttendance(records);

    return {
      success: true,
      message: `Absen Pulang berhasil dicatat pada ${timeStr} WIB. Selamat beristirahat!`,
      record: records[index],
    };
  }

  /**
   * Ajukan Izin / Sakit
   */
  recordLeave(
    user: User,
    type: 'IZIN' | 'SAKIT',
    keterangan: string,
    tanggal: string = getTodayDateString()
  ): { success: boolean; message: string } {
    const records = this.getAttendance();
    const existing = records.find((r) => r.userId === user.id && r.tanggal === tanggal);

    if (existing) {
      return {
        success: false,
        message: `Sudah ada catatan kehadiran untuk tanggal ${tanggal} (${existing.status}).`,
      };
    }

    const schedule = this.getTodayScheduleForUser(user.id);
    const newRecord: AttendanceRecord = {
      id: `ATT-LEAVE-${Date.now()}`,
      userId: user.id,
      nama: user.nama,
      jabatan: user.jabatan,
      bagian: user.bagian,
      tanggal: tanggal,
      jamMasuk: '-',
      jamPulang: '-',
      status: type,
      shift: schedule?.shift || 'Pagi',
      keterangan: keterangan || `Keterangan ${type}`,
      lokasi: 'Pengajuan Mandiri',
    };

    records.unshift(newRecord);
    this.saveAttendance(records);

    return {
      success: true,
      message: `Pencatatan ${type} untuk tanggal ${tanggal} berhasil disimpan.`,
    };
  }

  /**
   * Admin: manual add / edit attendance
   */
  adminSaveAttendance(record: AttendanceRecord): { success: boolean; message: string } {
    const records = this.getAttendance();
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }
    this.saveAttendance(records);
    return { success: true, message: 'Data absensi berhasil disimpan.' };
  }

  adminDeleteAttendance(id: string): { success: boolean; message: string } {
    let records = this.getAttendance();
    records = records.filter((r) => r.id !== id);
    this.saveAttendance(records);
    return { success: true, message: 'Data absensi berhasil dihapus.' };
  }

  // --- Statistics for Admin Dashboard ---
  getDashboardStats() {
    const today = getTodayDateString();
    const users = this.getUsers().filter((u) => u.statusAktif);
    const todayRecords = this.getAttendance().filter((r) => r.tanggal === today);

    const totalDokter = users.filter((u) => u.jabatan === 'DOKTER').length;
    const totalParamedis = users.filter((u) => u.jabatan === 'PARAMEDIS').length;

    const hadirCount = todayRecords.filter((r) => r.status === 'HADIR').length;
    const terlambatCount = todayRecords.filter((r) => r.status === 'TERLAMBAT').length;
    const izinCount = todayRecords.filter((r) => r.status === 'IZIN').length;
    const sakitCount = todayRecords.filter((r) => r.status === 'SAKIT').length;
    const alpaCount = todayRecords.filter((r) => r.status === 'ALPA').length;
    const sudahPulangCount = todayRecords.filter((r) => r.status === 'SUDAH PULANG').length;

    // Total yang sudah absen atau tercatat hari ini
    const recordedUserIds = new Set(todayRecords.map((r) => r.userId));
    // Petugas dokter & paramedis yang belum hadir/belum ada data absensi hari ini
    const medicalStaff = users.filter((u) => u.jabatan === 'DOKTER' || u.jabatan === 'PARAMEDIS');
    const belumHadirCount = medicalStaff.filter((u) => !recordedUserIds.has(u.id)).length;

    return {
      totalDokter,
      totalParamedis,
      hadirHariIni: hadirCount,
      terlambat: terlambatCount,
      izin: izinCount,
      sakit: sakitCount,
      alpa: alpaCount,
      sudahPulang: sudahPulangCount,
      belumHadir: belumHadirCount,
      totalPetugas: medicalStaff.length,
      todayRecords,
    };
  }

  // --- Export to CSV / Excel ---
  exportToExcel(records: AttendanceRecord[], title: string = 'Laporan_Absensi_Klinik_Sidogiri'): void {
    const headers = [
      'No',
      'Tanggal',
      'ID Petugas',
      'Nama Petugas',
      'Jabatan',
      'Bagian / Poli',
      'Shift',
      'Jam Masuk',
      'Jam Pulang',
      'Status Kehadiran',
      'Suhu Tubuh',
      'Keterangan',
      'Lokasi',
    ];

    const rows = records.map((r, i) => [
      i + 1,
      r.tanggal,
      r.userId,
      `"${r.nama.replace(/"/g, '""')}"`,
      r.jabatan,
      `"${r.bagian.replace(/"/g, '""')}"`,
      r.shift || '-',
      r.jamMasuk,
      r.jamPulang,
      r.status,
      r.suhuTubuh || '-',
      `"${(r.keterangan || '-').replace(/"/g, '""')}"`,
      `"${(r.lokasi || '-').replace(/"/g, '""')}"`,
    ]);

    // CSV format with UTF-8 BOM so Excel opens with proper accents and Indonesian characters
    const csvContent =
      '\uFEFF' +
      [
        `"KLINIK SIDOGIRI - ${title.toUpperCase()}"`,
        `"Dicetak pada: ${new Date().toLocaleString('id-ID')} WIB"`,
        '',
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- Reset to default seed data ---
  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_CLINIC_PROFILE));
  }

  // --- Backup & Restore ---
  exportDatabaseBackup(): string {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      clinicProfile: this.getClinicProfile(),
      users: this.getUsers(),
      schedules: this.getSchedules(),
      attendance: this.getAttendance(),
    };
    return JSON.stringify(backup, null, 2);
  }

  importDatabaseBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.users || !data.attendance) {
        return { success: false, message: 'Format file backup tidak valid.' };
      }
      if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (data.schedules) localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(data.schedules));
      if (data.attendance) localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data.attendance));
      if (data.clinicProfile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.clinicProfile));
      return { success: true, message: 'Data backup berhasil dipulihkan.' };
    } catch {
      return { success: false, message: 'Gagal memproses file JSON backup.' };
    }
  }
}

export const storage = new StorageService();
