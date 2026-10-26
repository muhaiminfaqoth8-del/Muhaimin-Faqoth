import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, ShiftType, WorkSchedule } from '../types';
import { storage, getTodayDateString, getDayNameIndonesian } from '../services/storage';
import { DigitalClock } from '../components/DigitalClock';
import { StatusBadge } from '../components/StatusBadge';
import { EditAttendanceModal } from '../components/EditAttendanceModal';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  Clock,
  Thermometer,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Sparkles,
  UserCheck,
  ChevronRight,
  Edit2,
  X,
} from 'lucide-react';

interface StaffDashboardProps {
  currentUser: User;
  onRefreshData?: () => void;
  onNavigateToHistory?: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentUser,
  onRefreshData,
  onNavigateToHistory,
}) => {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [todaySchedule, setTodaySchedule] = useState<WorkSchedule | undefined>(undefined);
  const [selectedShift, setSelectedShift] = useState<ShiftType>('Pagi');
  const [keterangan, setKeterangan] = useState<string>('');
  const [suhuTubuh, setSuhuTubuh] = useState<string>('36.5');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Leave Modal state
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<'IZIN' | 'SAKIT'>('IZIN');
  const [leaveReason, setLeaveReason] = useState<string>('');

  // Edit Attendance Modal state
  const [showEditAttendanceModal, setShowEditAttendanceModal] = useState<boolean>(false);

  // Edit Schedule / Duty Modal state
  const [showEditScheduleModal, setShowEditScheduleModal] = useState<boolean>(false);
  const [scheduleFormData, setScheduleFormData] = useState<Partial<WorkSchedule>>({});

  const loadData = () => {
    const record = storage.getTodayRecordForUser(currentUser.id);
    const sched = storage.getTodayScheduleForUser(currentUser.id);
    setTodayRecord(record);
    setTodaySchedule(sched);
    if (sched) {
      setSelectedShift(sched.shift);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleOpenEditMySchedule = () => {
    const sched = storage.getTodayScheduleForUser(currentUser.id);
    if (sched) {
      setScheduleFormData({ ...sched });
    } else {
      setScheduleFormData({
        id: `SCH-${Date.now()}`,
        userId: currentUser.id,
        namaPetugas: currentUser.nama,
        jabatan: currentUser.jabatan,
        bagian: currentUser.bagian,
        hari: getDayNameIndonesian() as WorkSchedule['hari'],
        shift: selectedShift || 'Pagi',
        jamMulai: '07:00',
        jamSelesai: '14:00',
        ruangan: 'Poli Pelayanan',
        keterangan: 'Tugas dinas terjadwal',
      });
    }
    setShowEditScheduleModal(true);
  };

  const handleSaveScheduleDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleFormData.jamMulai || !scheduleFormData.jamSelesai) return;

    const payload: WorkSchedule = {
      id: scheduleFormData.id || `SCH-${Date.now()}`,
      userId: currentUser.id,
      namaPetugas: currentUser.nama,
      jabatan: currentUser.jabatan,
      bagian: currentUser.bagian,
      hari: (scheduleFormData.hari as WorkSchedule['hari']) || 'Senin',
      shift: (scheduleFormData.shift as ShiftType) || 'Pagi',
      jamMulai: scheduleFormData.jamMulai,
      jamSelesai: scheduleFormData.jamSelesai,
      ruangan: scheduleFormData.ruangan || 'Klinik Sidogiri',
      keterangan: scheduleFormData.keterangan || 'Tugas dinas',
    };

    if (todaySchedule) {
      storage.updateSchedule(payload);
    } else {
      storage.addSchedule(payload);
    }

    setAlertMessage({ type: 'success', text: 'Rincian tugas dinas hari ini berhasil diperbarui!' });
    setShowEditScheduleModal(false);
    loadData();
    if (onRefreshData) onRefreshData();
  };

  // Validation checks for buttons
  const checkInCheck = storage.canCheckIn(currentUser.id);
  const checkOutCheck = storage.canCheckOut(currentUser.id);

  const handleAbsenMasuk = () => {
    setAlertMessage(null);
    const res = storage.recordCheckIn(currentUser, {
      shift: selectedShift,
      keterangan: keterangan.trim() || undefined,
      suhuTubuh: `${suhuTubuh}°C`,
    });

    if (res.success) {
      setAlertMessage({ type: 'success', text: res.message });
      loadData();
      if (onRefreshData) onRefreshData();
    } else {
      setAlertMessage({ type: 'error', text: res.message });
    }
  };

  const handleAbsenPulang = () => {
    setAlertMessage(null);
    const res = storage.recordCheckOut(currentUser.id, keterangan.trim() || undefined);

    if (res.success) {
      setAlertMessage({ type: 'success', text: res.message });
      loadData();
      if (onRefreshData) onRefreshData();
    } else {
      setAlertMessage({ type: 'error', text: res.message });
    }
  };

  const handleAjukanIzinSakit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      setAlertMessage({ type: 'error', text: 'Harap isi alasan / keterangan pengajuan.' });
      return;
    }

    const res = storage.recordLeave(currentUser, leaveType, leaveReason);
    if (res.success) {
      setAlertMessage({ type: 'success', text: res.message });
      setShowLeaveModal(false);
      setLeaveReason('');
      loadData();
      if (onRefreshData) onRefreshData();
    } else {
      setAlertMessage({ type: 'error', text: res.message });
    }
  };

  // Status explanation
  const getStatusDescription = (status?: string) => {
    switch (status) {
      case 'HADIR':
        return 'Anda telah melakukan absensi masuk tepat waktu hari ini.';
      case 'TERLAMBAT':
        return 'Anda tercatat hadir melewati toleransi batas jam shift.';
      case 'SUDAH PULANG':
        return 'Absensi tugas hari ini selesai. Jam pulang Anda telah tercatat rapi.';
      case 'IZIN':
        return 'Pengajuan izin tugas/pribadi telah tercatat dalam sistem.';
      case 'SAKIT':
        return 'Pengajuan sakit telah tercatat. Semoga lekas sembuh!';
      default:
        return 'Silakan lakukan absensi masuk untuk memulai shift dinas pelayanan.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Profile Bar */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              {currentUser.jabatan === 'DOKTER' ? (
                <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <HeartPulse className="w-3.5 h-3.5 text-emerald-300" />
              )}
              <span>Portal {currentUser.jabatan} Klinik Sidogiri</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentUser.nama}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-emerald-100 font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-300" />
                {currentUser.bagian}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                ID: {currentUser.id}
              </span>
              {currentUser.sip && (
                <>
                  <span>•</span>
                  <span className="text-emerald-200 text-xs">
                    SIP/STR: {currentUser.sip}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Realtime Clock Hero Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[240px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
              Waktu Sistem Realtime
            </p>
            <DigitalClock variant="hero" className="!p-0 !bg-transparent !shadow-none !border-0" />
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold transition-all shadow-xs ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : alertMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-sky-50 border-sky-300 text-sky-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Today's Status Banner Card */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Status Kehadiran Hari Ini
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <StatusBadge
                status={todayRecord ? todayRecord.status : 'BELUM ABSEN'}
                size="lg"
              />
              <span className="text-xs text-slate-600 font-medium">
                {getStatusDescription(todayRecord?.status)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {todayRecord && (
              <button
                onClick={() => setShowEditAttendanceModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Edit data presensi dan catatan tugas hari ini"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Presensi & Tugas</span>
              </button>
            )}

            {!todayRecord && (
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Ajukan Izin / Sakit</span>
              </button>
            )}
          </div>
        </div>

        {/* Attendance Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Jam Masuk
            </p>
            <p className="font-mono text-xl font-black text-emerald-950 mt-1">
              {todayRecord?.jamMasuk || '--:--:--'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {todayRecord?.jamMasuk && todayRecord.jamMasuk !== '-'
                ? 'Tercatat di sistem'
                : 'Belum absen'}
            </p>
          </div>

          <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
              Jam Pulang
            </p>
            <p className="font-mono text-xl font-black text-teal-950 mt-1">
              {todayRecord?.jamPulang || '--:--:--'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {todayRecord?.jamPulang && todayRecord.jamPulang !== '-'
                ? 'Tercatat di sistem'
                : 'Belum pulang'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Shift Dinas
            </p>
            <p className="text-base font-bold text-slate-800 mt-1">
              {todayRecord?.shift || todaySchedule?.shift || 'Shift Pagi'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {todaySchedule
                ? `${todaySchedule.jamMulai} - ${todaySchedule.jamSelesai} WIB`
                : 'Sesuai penugasan'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Suhu Tubuh / Lokasi
            </p>
            <p className="text-base font-bold text-slate-800 mt-1">
              {todayRecord?.suhuTubuh || '36.5°C'}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {todayRecord?.lokasi || 'Klinik Sidogiri Induk'}
            </p>
          </div>
        </div>
      </div>

      {/* TWO BIG ATTENDANCE BUTTONS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-emerald-950 uppercase tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            Tombol Presensi Kehadiran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tekan tombol di bawah untuk mencatat waktu kehadiran Anda secara akurat dan realtime.
          </p>
        </div>

        {/* Input Parameters for Check-In (Shift, Suhu Tubuh, Keterangan) */}
        {!todayRecord && (
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Pilih Shift Dinas
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pagi">Shift Pagi (07:00 - 14:00 WIB)</option>
                <option value="Siang">Shift Siang (14:00 - 21:00 WIB)</option>
                <option value="Malam">Shift Malam (21:00 - 07:00 WIB)</option>
                <option value="Full Day">Full Day / Jaga Santri</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Suhu Tubuh (°C)
              </label>
              <div className="relative">
                <Thermometer className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={suhuTubuh}
                  onChange={(e) => setSuhuTubuh(e.target.value)}
                  placeholder="36.5"
                  className="w-full bg-white border border-emerald-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Catatan / Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Operan jaga shift tepat waktu"
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* The Two Big Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 1. ABSEN MASUK BUTTON */}
          <div className="space-y-2">
            <button
              onClick={handleAbsenMasuk}
              disabled={!checkInCheck.can}
              className={`w-full py-6 px-6 rounded-2xl flex items-center justify-center gap-4 text-white font-extrabold text-lg sm:text-xl transition-all shadow-lg cursor-pointer ${
                checkInCheck.can
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 shadow-emerald-700/30 hover:shadow-xl active:scale-[0.98]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <div
                className={`p-3 rounded-xl ${
                  checkInCheck.can ? 'bg-white/20' : 'bg-slate-400/20'
                }`}
              >
                <LogIn className="w-8 h-8" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-semibold opacity-90">
                  Presensi Masuk
                </span>
                <span className="block text-2xl font-black tracking-tight">
                  ABSEN MASUK
                </span>
              </div>
            </button>

            {!checkInCheck.can && (
              <p className="text-xs text-center text-slate-500 font-medium">
                {checkInCheck.reason}
              </p>
            )}
          </div>

          {/* 2. ABSEN PULANG BUTTON */}
          <div className="space-y-2">
            <button
              onClick={handleAbsenPulang}
              disabled={!checkOutCheck.can}
              className={`w-full py-6 px-6 rounded-2xl flex items-center justify-center gap-4 text-white font-extrabold text-lg sm:text-xl transition-all shadow-lg cursor-pointer ${
                checkOutCheck.can
                  ? 'bg-gradient-to-r from-teal-700 via-emerald-800 to-emerald-950 hover:from-teal-800 hover:to-emerald-900 shadow-teal-800/30 hover:shadow-xl active:scale-[0.98]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <div
                className={`p-3 rounded-xl ${
                  checkOutCheck.can ? 'bg-white/20' : 'bg-slate-400/20'
                }`}
              >
                <LogOut className="w-8 h-8" />
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-semibold opacity-90">
                  Presensi Pulang
                </span>
                <span className="block text-2xl font-black tracking-tight">
                  ABSEN PULANG
                </span>
              </div>
            </button>

            {!checkOutCheck.can && (
              <p className="text-xs text-center text-slate-500 font-medium">
                {checkOutCheck.reason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule Card & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Jadwal Dinas Anda Hari Ini
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
              </span>
              <button
                onClick={handleOpenEditMySchedule}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer shadow-2xs"
                title="Edit rincian tugas dan jam dinas Anda hari ini"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Tugas Dinas</span>
              </button>
            </div>
          </div>

          {todaySchedule ? (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-950 text-base">
                    Shift {todaySchedule.shift}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                    {todaySchedule.bagian}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {todaySchedule.ruangan || 'Klinik Sidogiri'} • {todaySchedule.keterangan || 'Tugas dinas terjadwal'}
                </p>
              </div>

              <div className="font-mono text-emerald-900 font-extrabold text-lg bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                {todaySchedule.jamMulai} - {todaySchedule.jamSelesai} WIB
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
              <p className="font-semibold">Tidak ada jadwal dinas spesifik terdaftar hari ini.</p>
              <p className="mt-0.5 text-slate-400">
                Anda tetap dapat melakukan absensi jika sedang bertugas on-call atau penugasan khusus.
              </p>
            </div>
          )}
        </div>

        {/* Quick Info & Ethics Reminder */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-6 border border-emerald-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Tata Tertib Presensi
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh dokter dan paramedis wajib melakukan absensi tepat waktu sebelum pelayanan dimulai. Kedisiplinan adalah bagian dari khidmah mulia di Klinik Sidogiri.
            </p>
          </div>

          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="mt-4 flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-emerald-900 bg-white rounded-xl border border-emerald-200 hover:bg-emerald-100/60 transition cursor-pointer"
            >
              <span>Lihat Riwayat Absensi Saya</span>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Pengajuan Izin / Sakit */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 animate-fadeIn">
            <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight mb-2">
              Pengajuan Izin / Sakit
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pemberitahuan ini akan otomatis tercatat pada daftar kehadiran hari ini ({getTodayDateString()}).
            </p>

            <form onSubmit={handleAjukanIzinSakit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jenis Pengajuan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeaveType('IZIN')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border text-center transition cursor-pointer ${
                      leaveType === 'IZIN'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    IZIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('SAKIT')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border text-center transition cursor-pointer ${
                      leaveType === 'SAKIT'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    SAKIT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Alasan Lengkap
                </label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Contoh: Mengikuti simposium medis kedokteran / Sakit demam berobat ke dr..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Simpan Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Today Attendance Modal */}
      <EditAttendanceModal
        isOpen={showEditAttendanceModal}
        onClose={() => setShowEditAttendanceModal(false)}
        record={todayRecord || null}
        onSaved={() => {
          loadData();
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* Edit My Today Schedule / Duty Modal */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight">
                  Edit Rincian Tugas Dinas Saya
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui shift, jam tugas, ruangan, dan rincian pekerjaan dinas Anda hari ini.
                </p>
              </div>
              <button
                onClick={() => setShowEditScheduleModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheduleDuty} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shift Dinas
                  </label>
                  <select
                    value={scheduleFormData.shift || 'Pagi'}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        shift: e.target.value as ShiftType,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Pagi">Shift Pagi</option>
                    <option value="Siang">Shift Siang</option>
                    <option value="Malam">Shift Malam</option>
                    <option value="Full Day">Full Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ruangan / Pos Pelayanan
                  </label>
                  <input
                    type="text"
                    value={scheduleFormData.ruangan || ''}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        ruangan: e.target.value,
                      })
                    }
                    placeholder="Poli Umum A / IGD"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={scheduleFormData.jamMulai || '07:00'}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        jamMulai: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={scheduleFormData.jamSelesai || '14:00'}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        jamSelesai: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi & Rincian Tugas Dinas *
                </label>
                <textarea
                  rows={3}
                  value={scheduleFormData.keterangan || ''}
                  onChange={(e) =>
                    setScheduleFormData({
                      ...scheduleFormData,
                      keterangan: e.target.value,
                    })
                  }
                  placeholder="Contoh: Pemeriksaan pasien poli umum, tindakan bedah minor, visite santri rawat inap"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditScheduleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Simpan Perubahan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
