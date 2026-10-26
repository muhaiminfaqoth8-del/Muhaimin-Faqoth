import React, { useState } from 'react';
import { User, AttendanceRecord, Role } from '../types';
import { storage, getTodayDateString } from '../services/storage';
import { StatusBadge } from '../components/StatusBadge';
import { Logo } from '../components/Logo';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CalendarDays,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  HeartPulse,
  UserCheck,
  Award,
} from 'lucide-react';

interface ReportsViewProps {
  currentUser: User;
}

type ReportType = 'HARIAN' | 'MINGGUAN' | 'BULANAN' | 'REKAP_PETUGAS';

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser }) => {
  const [reportType, setReportType] = useState<ReportType>('HARIAN');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const clinicProfile = storage.getClinicProfile();
  const allAttendance = storage.getAttendance();
  const allUsers = storage.getUsers().filter((u) => u.statusAktif);

  // Compute records based on report type
  const getReportData = (): AttendanceRecord[] => {
    if (reportType === 'HARIAN') {
      return allAttendance.filter((r) => r.tanggal === selectedDate);
    } else if (reportType === 'MINGGUAN') {
      // 7 days ending on selectedDate
      const endD = new Date(selectedDate);
      const startD = new Date(selectedDate);
      startD.setDate(startD.getDate() - 6);

      const startStr = startD.toISOString().slice(0, 10);
      const endStr = endD.toISOString().slice(0, 10);

      return allAttendance.filter((r) => r.tanggal >= startStr && r.tanggal <= endStr);
    } else if (reportType === 'BULANAN') {
      return allAttendance.filter((r) => r.tanggal.startsWith(selectedMonth));
    } else {
      return allAttendance;
    }
  };

  const reportRecords = getReportData();

  // Summary statistics for report
  const totalHadir = reportRecords.filter((r) => r.status === 'HADIR' || r.status === 'SUDAH PULANG').length;
  const totalTerlambat = reportRecords.filter((r) => r.status === 'TERLAMBAT').length;
  const totalIzin = reportRecords.filter((r) => r.status === 'IZIN').length;
  const totalSakit = reportRecords.filter((r) => r.status === 'SAKIT').length;
  const totalPresensi = reportRecords.length;

  const disciplineRate =
    totalPresensi > 0 ? Math.round((totalHadir / totalPresensi) * 100) : 100;

  // Recap per user
  const userRecap = allUsers
    .filter((u) => u.jabatan === 'DOKTER' || u.jabatan === 'PARAMEDIS')
    .map((user) => {
      const userRecords = reportRecords.filter((r) => r.userId === user.id);
      const hadir = userRecords.filter((r) => r.status === 'HADIR' || r.status === 'SUDAH PULANG').length;
      const terlambat = userRecords.filter((r) => r.status === 'TERLAMBAT').length;
      const izin = userRecords.filter((r) => r.status === 'IZIN').length;
      const sakit = userRecords.filter((r) => r.status === 'SAKIT').length;
      const total = userRecords.length;
      const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        user,
        total,
        hadir,
        terlambat,
        izin,
        sakit,
        rate,
      };
    });

  const handleExportExcel = () => {
    let title = `Laporan_${reportType}_Klinik_Sidogiri`;
    if (reportType === 'HARIAN') title += `_${selectedDate}`;
    if (reportType === 'BULANAN') title += `_${selectedMonth}`;

    storage.exportToExcel(reportRecords, title);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pusat Administrasi & Laporan Kehadiran</span>
          </div>
          <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tight mt-1">
            LAPORAN PRESENSI KLINIK SIDOGIRI
          </h1>
          <p className="text-xs text-slate-500">
            Penyusunan laporan berkala harian, mingguan, dan bulanan untuk keperluan administrasi dan manajemen klinik.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>
        </div>
      </div>

      {/* Report Controls (Hidden in Print) */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        {/* Report Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setReportType('HARIAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportType === 'HARIAN'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Laporan Harian
          </button>
          <button
            onClick={() => setReportType('MINGGUAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportType === 'MINGGUAN'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Laporan Mingguan
          </button>
          <button
            onClick={() => setReportType('BULANAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportType === 'BULANAN'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Laporan Bulanan
          </button>
          <button
            onClick={() => setReportType('REKAP_PETUGAS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportType === 'REKAP_PETUGAS'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Rekap per Petugas
          </button>
        </div>

        {/* Date / Month Picker */}
        <div className="flex items-center gap-2">
          {reportType === 'BULANAN' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Pilih Bulan:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                {reportType === 'MINGGUAN' ? 'Sampai Tanggal:' : 'Pilih Tanggal:'}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Official Clinic Letterhead / Kop Laporan */}
        <div className="border-b-2 border-emerald-800 pb-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size="lg" showText={false} />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-tight">
                KLINIK SIDOGIRI
              </h2>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Layanan Kesehatan Terpadu Pondok Pesantren Sidogiri
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {clinicProfile.alamat} • Telp: {clinicProfile.telepon}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 sm:border-l sm:border-slate-200 sm:pl-4">
            <p className="font-extrabold text-slate-900 uppercase">
              {reportType === 'HARIAN' && 'LAPORAN PRESENSI HARIAN'}
              {reportType === 'MINGGUAN' && 'LAPORAN PRESENSI MINGGUAN'}
              {reportType === 'BULANAN' && 'LAPORAN PRESENSI BULANAN'}
              {reportType === 'REKAP_PETUGAS' && 'REKAPITULASI KINERJA KEHADIRAN'}
            </p>
            <p className="text-[11px] text-emerald-800 font-bold mt-0.5">
              Periode: {reportType === 'BULANAN' ? selectedMonth : selectedDate}
            </p>
            <p className="text-[10px] text-slate-400">
              Dokumen Resmi Administrasi Medis
            </p>
          </div>
        </div>

        {/* Metrics Overview in Report */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Total Hadir
            </p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{totalHadir}</p>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Terlambat
            </p>
            <p className="text-2xl font-black text-amber-950 mt-1">{totalTerlambat}</p>
          </div>

          <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-200">
            <p className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
              Izin
            </p>
            <p className="text-2xl font-black text-sky-950 mt-1">{totalIzin}</p>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200">
            <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              Sakit
            </p>
            <p className="text-2xl font-black text-purple-950 mt-1">{totalSakit}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Tingkat Kedisiplinan
            </p>
            <p className="text-2xl font-black text-emerald-800 mt-1">
              {disciplineRate}%
            </p>
          </div>
        </div>

        {/* Conditional Tables: Recap per Petugas VS Attendance Records */}
        {reportType === 'REKAP_PETUGAS' ? (
          /* Rekapitulasi per Petugas Table */
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50 text-emerald-950 font-bold uppercase text-[11px] border-b border-emerald-100">
                <tr>
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-4">Nama Petugas</th>
                  <th className="py-3 px-3">Jabatan</th>
                  <th className="py-3 px-3">Bagian</th>
                  <th className="py-3 px-3 text-center">Hadir</th>
                  <th className="py-3 px-3 text-center">Terlambat</th>
                  <th className="py-3 px-3 text-center">Izin</th>
                  <th className="py-3 px-3 text-center">Sakit</th>
                  <th className="py-3 px-3 text-center">Total Sesi</th>
                  <th className="py-3 px-3 text-center">% Disiplin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userRecap.map((item, idx) => (
                  <tr key={item.user.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{item.user.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.user.id}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{item.user.jabatan}</td>
                    <td className="py-3 px-3 text-slate-600">{item.user.bagian}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">{item.hadir}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700">{item.terlambat}</td>
                    <td className="py-3 px-3 text-center font-bold text-sky-700">{item.izin}</td>
                    <td className="py-3 px-3 text-center font-bold text-purple-700">{item.sakit}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{item.total}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-800">
                      {item.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Detailed Log Table */
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50 text-emerald-950 font-bold uppercase text-[11px] border-b border-emerald-100">
                <tr>
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Petugas</th>
                  <th className="py-3 px-3">Jabatan</th>
                  <th className="py-3 px-3">Bagian</th>
                  <th className="py-3 px-3">Jam Masuk</th>
                  <th className="py-3 px-3">Jam Pulang</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRecords.length > 0 ? (
                  reportRecords.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-400">{i + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.tanggal}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.userId}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{r.jabatan}</td>
                      <td className="py-3 px-3 text-slate-600">{r.bagian}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-950">{r.jamMasuk}</td>
                      <td className="py-3 px-3 font-mono font-bold text-teal-950">{r.jamPulang}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{r.keterangan || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada catatan absensi pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature & Clinic Legal Signatures Section */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-1">Kepala Pelayanan Medis</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[Tertanda Digital]</span>
            </div>
            <p className="font-bold text-emerald-950 underline">{clinicProfile.kepalaKlinik}</p>
            <p className="text-[10px] text-slate-500">SIP.503/446/DOK-UM/35.14</p>
          </div>

          <div>
            <p className="text-slate-500">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900 mt-1">Personalia & Tata Usaha</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[Tertanda Digital]</span>
            </div>
            <p className="font-bold text-emerald-950 underline">Ust. H. Abdullah Syamsuri</p>
            <p className="text-[10px] text-slate-500">NIP. 19800512-SDG-2020</p>
          </div>
        </div>
      </div>
    </div>
  );
};
