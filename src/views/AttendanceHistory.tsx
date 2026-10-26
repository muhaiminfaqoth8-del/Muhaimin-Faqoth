import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Role } from '../types';
import { storage, getTodayDateString } from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import { EditAttendanceModal } from '../components/EditAttendanceModal';
import {
  History,
  Calendar,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  LogOut,
  RotateCcw,
  Stethoscope,
  Activity,
  ShieldCheck,
  Edit2,
  Trash2,
} from 'lucide-react';

interface AttendanceHistoryProps {
  currentUser: User;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ currentUser }) => {
  const isAdmin = currentUser.jabatan === 'ADMIN';

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  const [filterRole, setFilterRole] = useState<'ALL' | Role>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const loadRecords = () => {
    let all = storage.getAttendance();
    // Security constraint: Setiap pengguna hanya dapat melihat data absensinya sendiri, Admin melihat seluruh data
    if (!isAdmin) {
      all = all.filter((r) => r.userId === currentUser.id);
    }
    setRecords(all);
  };

  useEffect(() => {
    loadRecords();
  }, [currentUser]);

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = (rec: AttendanceRecord) => {
    if (window.confirm(`Hapus data presensi ${rec.nama} (${rec.tanggal})?`)) {
      storage.adminDeleteAttendance(rec.id);
      loadRecords();
    }
  };

  // Presets
  const handleSetPreset = (preset: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL') => {
    const today = new Date();
    const todayStr = getTodayDateString();

    if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'WEEK') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      const past7Str = `${past7.getFullYear()}-${String(past7.getMonth() + 1).padStart(2, '0')}-${String(
        past7.getDate()
      ).padStart(2, '0')}`;
      setStartDate(past7Str);
      setEndDate(todayStr);
    } else if (preset === 'MONTH') {
      const startOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      setStartDate(startOfMonth);
      setEndDate(todayStr);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchName('');
    setFilterRole('ALL');
    setFilterStatus('ALL');
  };

  // Filter application
  const filteredRecords = records.filter((rec) => {
    // Date filter
    if (startDate && rec.tanggal < startDate) return false;
    if (endDate && rec.tanggal > endDate) return false;

    // Name or ID
    if (searchName) {
      const term = searchName.toLowerCase();
      const match =
        rec.nama.toLowerCase().includes(term) ||
        rec.userId.toLowerCase().includes(term) ||
        rec.bagian.toLowerCase().includes(term);
      if (!match) return false;
    }

    // Role
    if (filterRole !== 'ALL' && rec.jabatan !== filterRole) return false;

    // Status
    if (filterStatus !== 'ALL' && rec.status !== filterStatus) return false;

    return true;
  });

  const handleExportExcel = () => {
    storage.exportToExcel(
      filteredRecords,
      `Riwayat_Absensi_${isAdmin ? 'Klinik_Sidogiri' : currentUser.nama.replace(/\s+/g, '_')}`
    );
  };

  // Stats for the filtered selection
  const totalRecords = filteredRecords.length;
  const hadirCount = filteredRecords.filter((r) => r.status === 'HADIR').length;
  const terlambatCount = filteredRecords.filter((r) => r.status === 'TERLAMBAT').length;
  const izinCount = filteredRecords.filter((r) => r.status === 'IZIN').length;
  const sakitCount = filteredRecords.filter((r) => r.status === 'SAKIT').length;
  const sudahPulangCount = filteredRecords.filter((r) => r.status === 'SUDAH PULANG').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit & Riwayat Presensi</span>
          </div>
          <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tight mt-1">
            {isAdmin ? 'RIWAYAT PRESENSI SELURUH PETUGAS' : 'RIWAYAT ABSENSI PRIBADI'}
          </h1>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Arsip digital pencatatan jam masuk, jam pulang, dan status kehadiran dokter serta paramedis Klinik Sidogiri.'
              : `Daftar rekam kehadiran dinas Anda (${currentUser.nama}) di Klinik Sidogiri.`}
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={filteredRecords.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT EXCEL</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              Filter Pencarian Terperinci
            </span>
          </div>

          {/* Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-600 font-semibold mr-1">Preset:</span>
            <button
              onClick={() => handleSetPreset('TODAY')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              onClick={() => handleSetPreset('WEEK')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer"
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handleSetPreset('MONTH')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleSetPreset('ALL')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold cursor-pointer"
            >
              Semua Waktu
            </button>
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded-lg text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-1 cursor-pointer"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Search Name/ID (Admin only or searchable) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {isAdmin ? 'Cari Nama / ID' : 'Cari Catatan / Bagian'}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder={isAdmin ? 'Nama atau ID...' : 'Kata kunci...'}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Role Filter (Admin only) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Filter Jabatan
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'ALL' | Role)}
              disabled={!isAdmin}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            >
              <option value="ALL">Semua Jabatan</option>
              <option value="DOKTER">DOKTER</option>
              <option value="PARAMEDIS">PARAMEDIS</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">HADIR</option>
              <option value="TERLAMBAT">TERLAMBAT</option>
              <option value="IZIN">IZIN</option>
              <option value="SAKIT">SAKIT</option>
              <option value="SUDAH PULANG">SUDAH PULANG</option>
              <option value="ALPA">ALPA</option>
            </select>
          </div>
        </div>

        {/* Quick summary badges of filtered results */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">Ringkasan Filter:</span>
          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
            Total: {totalRecords}
          </span>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            Hadir: {hadirCount}
          </span>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
            Terlambat: {terlambatCount}
          </span>
          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
            Sudah Pulang: {sudahPulangCount}
          </span>
          <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
            Izin: {izinCount}
          </span>
          <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
            Sakit: {sakitCount}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nama Petugas</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4">Bagian / Poli</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">Jam Masuk</th>
                <th className="py-3.5 px-4">Jam Pulang</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Keterangan & Catatan</th>
                <th className="py-3.5 px-4 text-center">Aksi (Edit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors">
                    {/* Tanggal */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {r.tanggal}
                    </td>

                    {/* Nama */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {r.nama}
                      </div>
                      <div className="text-[10px] text-slate-700 font-mono">
                        {r.userId}
                      </div>
                    </td>

                    {/* Jabatan */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.jabatan === 'DOKTER'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {r.jabatan}
                      </span>
                    </td>

                    {/* Bagian */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {r.bagian}
                    </td>

                    {/* Shift */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {r.shift || '-'}
                    </td>

                    {/* Jam Masuk */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-950">
                      {r.jamMasuk !== '-' ? r.jamMasuk : <span className="text-slate-400">-</span>}
                    </td>

                    {/* Jam Pulang */}
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-950">
                      {r.jamPulang !== '-' ? r.jamPulang : <span className="text-slate-400">-</span>}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    {/* Keterangan */}
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={r.keterangan}>
                      {r.keterangan || '-'}
                    </td>

                    {/* Aksi Edit */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                          title="Edit Catatan Presensi & Tugas Ini"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteRecord(r)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Catatan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada catatan presensi pada rentang / kriteria yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Menampilkan <b>{filteredRecords.length}</b> rekaman data presensi
          </span>
          <span className="text-[11px] text-slate-400">
            Klinik Sidogiri • Sistem Informasi Presensi Realtime
          </span>
        </div>
      </div>

      {/* Edit Attendance & Duty Modal */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={editingRecord}
        onSaved={loadRecords}
      />
    </div>
  );
};
