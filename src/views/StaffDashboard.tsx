import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, ShiftType, WorkSchedule, BiometricMethod } from '../types';
import { storage, getTodayDateString, getDayNameIndonesian } from '../services/storage';
import { GeofenceResult } from '../services/geolocation';
import { DigitalClock } from '../components/DigitalClock';
import { StatusBadge } from '../components/StatusBadge';
import { EditAttendanceModal } from '../components/EditAttendanceModal';
import { FaceScanModal } from '../components/FaceScanModal';
import { FingerprintModal } from '../components/FingerprintModal';
import { GeofenceStatusBadge } from '../components/GeofenceStatusBadge';
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
  ChevronRight,
  Edit2,
  X,
  Scan,
  Fingerprint,
  MapPin,
  Camera,
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

  // Biometric & Geofencing State
  const [geofenceResult, setGeofenceResult] = useState<GeofenceResult | null>(null);
  const [preferredBiometric, setPreferredBiometric] = useState<BiometricMethod>('WAJAH');
  const [showFaceModal, setShowFaceModal] = useState<boolean>(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'MASUK' | 'PULANG' | null>(null);

  // Leave Modal state
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<'IZIN' | 'SAKIT'>('IZIN');
  const [leaveReason, setLeaveReason] = useState<string>('');

  // Edit Attendance Modal state (for correcting duty/attendance if permitted)
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
  const isInsideClinic = geofenceResult?.isInside ?? true;

  // Trigger check-in flow with Geofence & Biometric verification
  const handleInitiateAbsenMasuk = () => {
    setAlertMessage(null);

    // Rule: Petugas MUST be within Klinik Sidogiri radius
    if (geofenceResult && !geofenceResult.isInside) {
      setAlertMessage({
        type: 'error',
        text: `Absensi Ditolak: Anda terdeteksi berada di luar area Klinik Sidogiri (Jarak: ${geofenceResult.distanceMeter}m, batas: ${geofenceResult.maxRadiusMeter}m). Kehadiran wajib dilakukan di klinik.`,
      });
      return;
    }

    if (!checkInCheck.can) {
      setAlertMessage({ type: 'error', text: checkInCheck.reason || 'Tidak dapat absen masuk.' });
      return;
    }

    setPendingAction('MASUK');
    if (preferredBiometric === 'WAJAH') {
      setShowFaceModal(true);
    } else {
      setShowFingerprintModal(true);
    }
  };

  // Trigger check-out flow with Geofence & Biometric verification
  const handleInitiateAbsenPulang = () => {
    setAlertMessage(null);

    // Rule: Petugas MUST be within Klinik Sidogiri radius
    if (geofenceResult && !geofenceResult.isInside) {
      setAlertMessage({
        type: 'error',
        text: `Absen Pulang Ditolak: Anda terdeteksi berada di luar area Klinik Sidogiri (Jarak: ${geofenceResult.distanceMeter}m, batas: ${geofenceResult.maxRadiusMeter}m). Presensi pulang wajib dilakukan di klinik.`,
      });
      return;
    }

    if (!checkOutCheck.can) {
      setAlertMessage({ type: 'error', text: checkOutCheck.reason || 'Tidak dapat absen pulang.' });
      return;
    }

    setPendingAction('PULANG');
    if (preferredBiometric === 'WAJAH') {
      setShowFaceModal(true);
    } else {
      setShowFingerprintModal(true);
    }
  };

  // Callback when Face Scan is verified
  const handleFaceVerified = (photoDataUrl: string) => {
    setShowFaceModal(false);

    if (pendingAction === 'MASUK') {
      const res = storage.recordCheckIn(currentUser, {
        shift: selectedShift,
        keterangan: keterangan.trim() || undefined,
        suhuTubuh: `${suhuTubuh}°C`,
        metodeVerifikasi: 'WAJAH',
        fotoWajah: photoDataUrl,
        koordinatGPS: geofenceResult?.userCoords,
        jarakKeKlinikMeter: geofenceResult?.distanceMeter,
        statusLokasi: 'DALAM_KLINIK',
      });

      if (res.success) {
        setAlertMessage({ type: 'success', text: res.message });
        loadData();
        if (onRefreshData) onRefreshData();
      } else {
        setAlertMessage({ type: 'error', text: res.message });
      }
    } else if (pendingAction === 'PULANG') {
      const res = storage.recordCheckOut(currentUser.id, keterangan.trim() || undefined, {
        metodeVerifikasi: 'WAJAH',
        fotoWajah: photoDataUrl,
        koordinatGPS: geofenceResult?.userCoords,
        jarakKeKlinikMeter: geofenceResult?.distanceMeter,
        statusLokasi: 'DALAM_KLINIK',
      });

      if (res.success) {
        setAlertMessage({ type: 'success', text: res.message });
        loadData();
        if (onRefreshData) onRefreshData();
      } else {
        setAlertMessage({ type: 'error', text: res.message });
      }
    }

    setPendingAction(null);
  };

  // Callback when Fingerprint is verified
  const handleFingerprintVerified = () => {
    setShowFingerprintModal(false);

    if (pendingAction === 'MASUK') {
      const res = storage.recordCheckIn(currentUser, {
        shift: selectedShift,
        keterangan: keterangan.trim() || undefined,
        suhuTubuh: `${suhuTubuh}°C`,
        metodeVerifikasi: 'SIDIK_JARI',
        koordinatGPS: geofenceResult?.userCoords,
        jarakKeKlinikMeter: geofenceResult?.distanceMeter,
        statusLokasi: 'DALAM_KLINIK',
      });

      if (res.success) {
        setAlertMessage({ type: 'success', text: res.message });
        loadData();
        if (onRefreshData) onRefreshData();
      } else {
        setAlertMessage({ type: 'error', text: res.message });
      }
    } else if (pendingAction === 'PULANG') {
      const res = storage.recordCheckOut(currentUser.id, keterangan.trim() || undefined, {
        metodeVerifikasi: 'SIDIK_JARI',
        koordinatGPS: geofenceResult?.userCoords,
        jarakKeKlinikMeter: geofenceResult?.distanceMeter,
        statusLokasi: 'DALAM_KLINIK',
      });

      if (res.success) {
        setAlertMessage({ type: 'success', text: res.message });
        loadData();
        if (onRefreshData) onRefreshData();
      } else {
        setAlertMessage({ type: 'error', text: res.message });
      }
    }

    setPendingAction(null);
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
        return 'Anda tercatat hadir melewati batas jam shift dinas.';
      case 'SUDAH PULANG':
        return 'Absensi tugas hari ini selesai. Jam kepulangan telah tercatat rapi.';
      case 'IZIN':
        return 'Pengajuan izin tugas/pribadi telah disetujui dalam sistem.';
      case 'SAKIT':
        return 'Pengajuan sakit telah tercatat. Semoga lekas pulih dan sehat kembali!';
      default:
        return 'Silakan lakukan absensi masuk untuk memulai shift dinas pelayanan.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Profile Bar with Realtime Clock */}
      <div className="bg-gradient-to-br from-[#1B4332] via-[#245A44] to-[#12372A] rounded-3xl p-6 sm:p-8 text-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden border border-emerald-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-emerald-200 text-xs font-semibold tracking-wide">
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

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-emerald-100 font-normal">
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
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[240px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-1">
              Waktu Sistem Realtime
            </p>
            <DigitalClock variant="hero" className="!p-0 !bg-transparent !shadow-none !border-0" />
          </div>
        </div>
      </div>

      {/* Geofencing Live Radar (Strict Clinic Perimeter Check) */}
      <GeofenceStatusBadge
        onLocationEvaluated={(result) => setGeofenceResult(result)}
      />

      {/* Notifications / Alerts */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold transition-all shadow-2xs ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
              : alertMessage.type === 'error'
              ? 'bg-rose-50/90 border-rose-300 text-rose-900'
              : 'bg-sky-50/90 border-sky-300 text-sky-900'
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
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-900/[0.07] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Status Kehadiran Hari Ini
            </span>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
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
                className="px-3.5 py-2 text-xs font-bold text-[#133E2B] bg-[#EDF6F3] hover:bg-[#E2EFEA] border border-emerald-900/15 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Koreksi data tugas hari ini"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Koreksi Data Tugas</span>
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
          <div className="bg-[#F2F8F5] p-3.5 rounded-2xl border border-emerald-900/[0.06]">
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Jam Masuk
            </p>
            <p className="font-mono text-xl font-black text-[#112F20] mt-1 tabular-nums">
              {todayRecord?.jamMasuk || '--:--:--'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {todayRecord?.jamMasuk && todayRecord.jamMasuk !== '-'
                ? `Metode: ${todayRecord.metodeVerifikasi || 'Biometrik'}`
                : 'Belum absen'}
            </p>
          </div>

          <div className="bg-[#EDF6F3] p-3.5 rounded-2xl border border-emerald-900/[0.06]">
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
              Jam Pulang
            </p>
            <p className="font-mono text-xl font-black text-[#112F20] mt-1 tabular-nums">
              {todayRecord?.jamPulang || '--:--:--'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {todayRecord?.jamPulang && todayRecord.jamPulang !== '-'
                ? 'Tercatat di sistem'
                : 'Belum pulang'}
            </p>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
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

          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Verifikasi & Foto
            </p>
            {todayRecord?.fotoWajah ? (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={todayRecord.fotoWajah}
                  alt="Snapshot Wajah"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-2xs"
                />
                <span className="text-xs font-bold text-emerald-800">Scan Wajah Valid</span>
              </div>
            ) : (
              <p className="text-base font-bold text-slate-800 mt-1">
                {todayRecord?.metodeVerifikasi === 'SIDIK_JARI'
                  ? 'Sidik Jari'
                  : todayRecord?.suhuTubuh || '36.5°C'}
              </p>
            )}
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {todayRecord?.lokasi || 'Klinik Sidogiri Induk'}
            </p>
          </div>
        </div>
      </div>

      {/* TWO BIG ATTENDANCE BUTTONS WITH BIOMETRIC SELECTOR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/[0.07] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#112F20] uppercase tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              Tombol Presensi Kehadiran
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tekan tombol di bawah untuk memverifikasi kehadiran via Biometrik Wajah atau Sidik Jari.
            </p>
          </div>

          {/* Biometric Method Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPreferredBiometric('WAJAH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                preferredBiometric === 'WAJAH'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scan Wajah</span>
            </button>
            <button
              type="button"
              onClick={() => setPreferredBiometric('SIDIK_JARI')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                preferredBiometric === 'SIDIK_JARI'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sidik Jari</span>
            </button>
          </div>
        </div>

        {/* Shift, Temperature, and Notes Parameters */}
        {!todayRecord && (
          <div className="bg-[#F2F8F5] p-4 rounded-2xl border border-emerald-900/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Pilih Shift Dinas
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
                className="w-full bg-white border border-emerald-900/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  className="w-full bg-white border border-emerald-900/15 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                className="w-full bg-white border border-emerald-900/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        )}

        {/* The Two Big Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 1. ABSEN MASUK BUTTON */}
          <div className="space-y-2">
            <button
              onClick={handleInitiateAbsenMasuk}
              disabled={!checkInCheck.can || !isInsideClinic}
              className={`w-full py-6 px-6 rounded-2xl flex items-center justify-center gap-4 text-white font-extrabold text-lg sm:text-xl transition-all shadow-md cursor-pointer ${
                checkInCheck.can && isInsideClinic
                  ? 'bg-gradient-to-r from-[#1B4332] via-[#245A44] to-[#12372A] hover:from-[#153628] hover:to-[#0F291E] shadow-emerald-950/20 active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300/50'
              }`}
            >
              <div
                className={`p-3 rounded-xl ${
                  checkInCheck.can && isInsideClinic ? 'bg-white/15' : 'bg-slate-300'
                }`}
              >
                {preferredBiometric === 'WAJAH' ? (
                  <Scan className="w-8 h-8" />
                ) : (
                  <Fingerprint className="w-8 h-8" />
                )}
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-semibold opacity-90">
                  Presensi Masuk ({preferredBiometric === 'WAJAH' ? 'Scan Wajah' : 'Sidik Jari'})
                </span>
                <span className="block text-2xl font-black tracking-tight">
                  ABSEN MASUK
                </span>
              </div>
            </button>

            {!isInsideClinic ? (
              <p className="text-xs text-center text-rose-600 font-bold">
                🚫 Tombol Terkunci: Anda berada di luar area Klinik Sidogiri.
              </p>
            ) : !checkInCheck.can ? (
              <p className="text-xs text-center text-slate-500 font-medium">
                {checkInCheck.reason}
              </p>
            ) : (
              <p className="text-xs text-center text-emerald-800 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terverifikasi di klinik • Siap absen masuk</span>
              </p>
            )}
          </div>

          {/* 2. ABSEN PULANG BUTTON */}
          <div className="space-y-2">
            <button
              onClick={handleInitiateAbsenPulang}
              disabled={!checkOutCheck.can || !isInsideClinic}
              className={`w-full py-6 px-6 rounded-2xl flex items-center justify-center gap-4 text-white font-extrabold text-lg sm:text-xl transition-all shadow-md cursor-pointer ${
                checkOutCheck.can && isInsideClinic
                  ? 'bg-gradient-to-r from-[#1F4E5B] via-[#265B6A] to-[#133A44] hover:from-[#173F4B] hover:to-[#0E2C34] shadow-teal-950/20 active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300/50'
              }`}
            >
              <div
                className={`p-3 rounded-xl ${
                  checkOutCheck.can && isInsideClinic ? 'bg-white/15' : 'bg-slate-300'
                }`}
              >
                {preferredBiometric === 'WAJAH' ? (
                  <Scan className="w-8 h-8" />
                ) : (
                  <Fingerprint className="w-8 h-8" />
                )}
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider font-semibold opacity-90">
                  Presensi Pulang ({preferredBiometric === 'WAJAH' ? 'Scan Wajah' : 'Sidik Jari'})
                </span>
                <span className="block text-2xl font-black tracking-tight">
                  ABSEN PULANG
                </span>
              </div>
            </button>

            {!isInsideClinic ? (
              <p className="text-xs text-center text-rose-600 font-bold">
                🚫 Tombol Terkunci: Anda berada di luar area Klinik Sidogiri.
              </p>
            ) : !checkOutCheck.can ? (
              <p className="text-xs text-center text-slate-500 font-medium">
                {checkOutCheck.reason}
              </p>
            ) : (
              <p className="text-xs text-center text-teal-800 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Terverifikasi di klinik • Siap absen pulang</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule Card & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-emerald-900/[0.07] shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-extrabold text-sm text-[#112F20] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Jadwal Dinas Anda Hari Ini
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long' })}
              </span>
              <button
                onClick={handleOpenEditMySchedule}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#133E2B] bg-[#EDF6F3] hover:bg-[#E2EFEA] border border-emerald-900/15 rounded-xl transition cursor-pointer shadow-2xs"
                title="Edit rincian tugas dan jam dinas Anda hari ini"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Tugas Dinas</span>
              </button>
            </div>
          </div>

          {todaySchedule ? (
            <div className="p-4 rounded-2xl bg-[#F2F8F5] border border-emerald-900/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#112F20] text-base">
                    Shift {todaySchedule.shift}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {todaySchedule.bagian}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {todaySchedule.ruangan || 'Klinik Sidogiri'} • {todaySchedule.keterangan || 'Tugas dinas terjadwal'}
                </p>
              </div>

              <div className="font-mono text-[#112F20] font-extrabold text-lg bg-white px-4 py-2 rounded-xl border border-emerald-900/10 shadow-2xs tabular-nums">
                {todaySchedule.jamMulai} - {todaySchedule.jamSelesai} WIB
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
              <p className="font-semibold">Piket Setiap Hari Terjadwal (Klinik Pratama Sidogiri).</p>
              <p className="mt-0.5 text-slate-400">
                Anda dapat langsung melakukan absensi masuk shift dinas.
              </p>
            </div>
          )}
        </div>

        {/* Quick Info & Ethics Reminder */}
        <div className="bg-gradient-to-br from-[#F2F8F5] to-[#E8F3EE] rounded-3xl p-6 border border-emerald-900/[0.06] shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-[#112F20] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Tata Tertib Presensi Biometrik
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh dokter dan paramedis wajib melakukan absensi saat tiba di lingkungan Klinik Sidogiri. Validasi wajah & sidik jari menjamin akurasi dan kedisiplinan khidmah kesehatan.
            </p>
          </div>

          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="mt-4 flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-bold text-[#133E2B] bg-white rounded-xl border border-emerald-900/10 hover:bg-emerald-50/60 transition cursor-pointer shadow-2xs"
            >
              <span>Lihat Riwayat Presensi Saya</span>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          )}
        </div>
      </div>

      {/* Biometric Modals */}
      <FaceScanModal
        isOpen={showFaceModal}
        onClose={() => {
          setShowFaceModal(false);
          setPendingAction(null);
        }}
        onVerified={handleFaceVerified}
        staffName={currentUser.nama}
        actionType={pendingAction || 'MASUK'}
      />

      <FingerprintModal
        isOpen={showFingerprintModal}
        onClose={() => {
          setShowFingerprintModal(false);
          setPendingAction(null);
        }}
        onVerified={handleFingerprintVerified}
        staffName={currentUser.nama}
        actionType={pendingAction || 'MASUK'}
      />

      {/* Modal Pengajuan Izin / Sakit */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-900/[0.08] animate-fadeIn">
            <h3 className="text-lg font-black text-[#112F20] uppercase tracking-tight mb-1">
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType('IZIN')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      leaveType === 'IZIN'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Izin Dinas / Pribadi
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('SAKIT')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                      leaveType === 'SAKIT'
                        ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Sakit (Surat Dokter)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keterangan Alasan
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan keterangan detail pengajuan..."
                  className="w-full bg-[#F9FBFA] border border-emerald-900/15 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#245A44] rounded-xl cursor-pointer shadow-xs"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit My Attendance / Correction */}
      {showEditAttendanceModal && todayRecord && (
        <EditAttendanceModal
          isOpen={showEditAttendanceModal}
          onClose={() => setShowEditAttendanceModal(false)}
          record={todayRecord}
          onSaved={() => {
            setShowEditAttendanceModal(false);
            loadData();
            if (onRefreshData) onRefreshData();
            setAlertMessage({ type: 'success', text: 'Catatan presensi tugas hari ini berhasil dikoreksi!' });
          }}
        />
      )}

      {/* Modal Edit Duty / Schedule for today */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-900/[0.08] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-[#112F20] uppercase tracking-tight flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-700" />
                <span>Edit Tugas & Jam Dinas Hari Ini</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheduleDuty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Petugas & Bagian
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700">
                  {currentUser.nama} ({currentUser.bagian})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shift
                  </label>
                  <select
                    value={scheduleFormData.shift || 'Pagi'}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        shift: e.target.value as ShiftType,
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Pagi">Shift Pagi</option>
                    <option value="Siang">Shift Siang</option>
                    <option value="Malam">Shift Malam</option>
                    <option value="Full Day">Full Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ruangan / Poli
                  </label>
                  <input
                    type="text"
                    value={scheduleFormData.ruangan || ''}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, ruangan: e.target.value })
                    }
                    placeholder="Contoh: Poli Gigi"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Mulai (WIB)
                  </label>
                  <input
                    type="time"
                    value={scheduleFormData.jamMulai || '07:00'}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, jamMulai: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Selesai (WIB)
                  </label>
                  <input
                    type="time"
                    value={scheduleFormData.jamSelesai || '14:00'}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, jamSelesai: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Rincian Tugas
                </label>
                <input
                  type="text"
                  value={scheduleFormData.keterangan || ''}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, keterangan: e.target.value })
                  }
                  placeholder="Contoh: Jaga Poli Umum & Layanan Resep"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditScheduleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#245A44] rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Jadwal Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
