import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Role } from '../types';
import { storage, getTodayDateString } from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import { EditAttendanceModal } from '../components/EditAttendanceModal';
import {
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  LogOut,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Edit2,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToStaff?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToSchedule?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToStaff,
  onNavigateToHistory,
  onNavigateToSchedule,
}) => {
  const [stats, setStats] = useState(storage.getDashboardStats());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRole, setFilterRole] = useState<'ALL' | Role>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const refreshData = () => {
    setStats(storage.getDashboardStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenEditRecord = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setIsEditModalOpen(true);
  };

  const handleOpenNewRecord = () => {
    setEditingRecord(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = (rec: AttendanceRecord) => {
    if (window.confirm(`Hapus data presensi ${rec.nama} (${rec.tanggal})?`)) {
      storage.adminDeleteAttendance(rec.id);
      refreshData();
    }
  };

  const handleExportToday = () => {
    storage.exportToExcel(
      stats.todayRecords,
      `Absensi_Harian_Klinik_Sidogiri_${getTodayDateString()}`
    );
  };

  // Filter today's records
  const filteredRecords = stats.todayRecords.filter((rec) => {
    const matchesSearch =
      rec.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.bagian.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'ALL' || rec.jabatan === filterRole;
    const matchesStatus = filterStatus === 'ALL' || rec.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-emerald-900/[0.07] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Pusat Kendali Presensi Hari Ini</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#112F20] uppercase tracking-tight">
            DASHBOARD ADMINISTRATOR KLINIK
          </h1>
          <p className="text-xs text-slate-500">
            Monitoring real-time kehadiran dokter, perawat, bidan, apoteker & paramedis Klinik Sidogiri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenNewRecord}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#133E2B] bg-[#EDF6F3] hover:bg-[#E2EFEA] border border-emerald-900/15 rounded-xl transition cursor-pointer shadow-2xs"
            title="Input catatan presensi / tugas baru"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Input Presensi & Tugas</span>
          </button>

          <button
            onClick={handleExportToday}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#245A44] rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Absensi Hari Ini</span>
          </button>
        </div>
      </div>

      {/* 8 STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Dokter */}
        <div
          onClick={onNavigateToStaff}
          className="bg-white p-3.5 rounded-2xl border border-teal-900/10 shadow-2xs hover:border-teal-600/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
              Total Dokter
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 group-hover:scale-105 transition">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#112F20] mt-1 tabular-nums">{stats.totalDokter}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Dokter Terdaftar</p>
        </div>

        {/* 2. Total Paramedis */}
        <div
          onClick={onNavigateToStaff}
          className="bg-white p-3.5 rounded-2xl border border-emerald-900/10 shadow-2xs hover:border-emerald-600/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Total Paramedis
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#112F20] mt-1 tabular-nums">{stats.totalParamedis}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Perawat & Penunjang</p>
        </div>

        {/* 3. Hadir Hari Ini */}
        <div className="bg-[#F2F8F5] p-3.5 rounded-2xl border border-emerald-900/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Hadir Hari Ini
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#112F20] mt-1 tabular-nums">{stats.hadirHariIni}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">Tepat Waktu</p>
        </div>

        {/* 4. Belum Hadir */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Belum Hadir
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-1 tabular-nums">{stats.belumHadir}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Petugas Dinas</p>
        </div>

        {/* 5. Terlambat */}
        <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-900/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Terlambat
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-1 tabular-nums">{stats.terlambat}</p>
          <p className="text-[10px] text-amber-700 mt-0.5 font-medium">&gt; 15 menit</p>
        </div>

        {/* 6. Izin */}
        <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-900/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
              Izin
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center text-sky-700">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-950 mt-1 tabular-nums">{stats.izin}</p>
          <p className="text-[10px] text-sky-700 mt-0.5 font-medium">Tugas/Pribadi</p>
        </div>

        {/* 7. Sakit */}
        <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-900/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              Sakit
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center text-purple-700">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-950 mt-1 tabular-nums">{stats.sakit}</p>
          <p className="text-[10px] text-purple-700 mt-0.5 font-medium">Surat Dokter</p>
        </div>

        {/* 8. Sudah Pulang */}
        <div className="bg-teal-50/50 p-3.5 rounded-2xl border border-teal-900/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
              Sudah Pulang
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center text-teal-700">
              <LogOut className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-950 mt-1 tabular-nums">{stats.sudahPulang}</p>
          <p className="text-[10px] text-teal-700 mt-0.5 font-medium">Shift Selesai</p>
        </div>
      </div>

      {/* TODAY'S ATTENDANCE TABLE */}
      <div className="bg-white rounded-3xl border border-emerald-900/[0.07] shadow-xs overflow-hidden">
        {/* Table Filter & Search Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-[#112F20] uppercase tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Tabel Absensi Hari Ini ({getTodayDateString()})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar presensi petugas yang telah melakukan check-in / check-out atau terdaftar berhalangan hari ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, ID, bagian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9FBFA] border border-emerald-900/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'ALL' | Role)}
              className="text-xs font-semibold bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="ALL">Semua Jabatan</option>
              <option value="DOKTER">Dokter</option>
              <option value="PARAMEDIS">Paramedis</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold bg-[#F9FBFA] border border-emerald-900/15 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">HADIR</option>
              <option value="TERLAMBAT">TERLAMBAT</option>
              <option value="IZIN">IZIN</option>
              <option value="SAKIT">SAKIT</option>
              <option value="SUDAH PULANG">SUDAH PULANG</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F8F5] border-b border-emerald-900/[0.06] text-[#133E2B] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Petugas</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Bagian / Poli</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Jam Pulang</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Aksi (Edit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-[#F6FAF8] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">
                        {rec.nama}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ID: {rec.userId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.jabatan === 'DOKTER'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                        }`}
                      >
                        {rec.jabatan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {rec.bagian}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {rec.shift || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#112F20] tabular-nums">
                      {rec.jamMasuk !== '-' ? rec.jamMasuk : <span className="text-slate-400 font-normal">-</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#112F20] tabular-nums">
                      {rec.jamPulang !== '-' ? rec.jamPulang : <span className="text-slate-400 font-normal">-</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={rec.keterangan}>
                      {rec.keterangan || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditRecord(rec)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1B4332] hover:bg-[#245A44] text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                          title="Edit Presensi & Catatan Tugas Ini"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 transition cursor-pointer"
                          title="Hapus Data Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada catatan absensi yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info of table */}
        <div className="p-4 bg-[#FAFDFB] border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Menampilkan <b>{filteredRecords.length}</b> dari{' '}
            <b>{stats.todayRecords.length}</b> catatan presensi hari ini
          </span>

          {onNavigateToHistory && (
            <button
              onClick={onNavigateToHistory}
              className="font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
            >
              Lihat Riwayat Lengkap Seluruh Tanggal &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Edit Attendance & Duty Modal */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={editingRecord}
        onSaved={refreshData}
      />
    </div>
  );
};
