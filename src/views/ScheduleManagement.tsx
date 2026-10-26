import React, { useState, useEffect } from 'react';
import { WorkSchedule, User, ShiftType, Role, Department } from '../types';
import { storage } from '../services/storage';
import {
  CalendarDays,
  Plus,
  Clock,
  Search,
  Edit2,
  Trash2,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  CheckCircle2,
  X,
  Stethoscope,
  Activity,
  LayoutGrid,
  Table,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface ScheduleManagementProps {
  currentUser: User;
}

const DAYS_OF_WEEK: WorkSchedule['hari'][] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({ currentUser }) => {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [selectedShift, setSelectedShift] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMySchedule, setOnlyMySchedule] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<WorkSchedule>>({
    id: '',
    userId: '',
    namaPetugas: '',
    jabatan: 'DOKTER',
    bagian: 'Poli Umum',
    hari: 'Senin',
    shift: 'Pagi',
    jamMulai: '07:00',
    jamSelesai: '14:00',
    ruangan: '',
    keterangan: '',
  });

  const [modalError, setModalError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = () => {
    setSchedules(storage.getSchedules());
    setUsers(storage.getUsers().filter((u) => u.statusAktif));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setModalError(null);
    const activeMedicalUsers = users.filter((u) => u.jabatan === 'DOKTER' || u.jabatan === 'PARAMEDIS');
    const defaultUser = activeMedicalUsers[0] || users[0];

    setFormData({
      id: `SCH-${Date.now()}`,
      userId: defaultUser ? defaultUser.id : '',
      namaPetugas: defaultUser ? defaultUser.nama : '',
      jabatan: defaultUser ? defaultUser.jabatan : 'DOKTER',
      bagian: defaultUser ? defaultUser.bagian : 'Poli Umum',
      hari: 'Senin',
      shift: 'Pagi',
      jamMulai: '07:00',
      jamSelesai: '14:00',
      ruangan: 'Ruang Pemeriksaan Poli',
      keterangan: 'Tugas dinas pelayanan dan tindakan medis',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: WorkSchedule) => {
    setIsEditMode(true);
    setModalError(null);
    setFormData({ ...sch });
    setIsModalOpen(true);
  };

  const handleDelete = (sch: WorkSchedule) => {
    if (
      window.confirm(
        `Hapus tugas/jadwal ${sch.namaPetugas} pada hari ${sch.hari} (Shift ${sch.shift})?`
      )
    ) {
      const res = storage.deleteSchedule(sch.id);
      if (res.success) {
        setActionSuccess(`Tugas ${sch.namaPetugas} berhasil dihapus.`);
        loadData();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    }
  };

  const handleUserSelectChange = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setFormData({
        ...formData,
        userId: targetUser.id,
        namaPetugas: targetUser.nama,
        jabatan: targetUser.jabatan,
        bagian: targetUser.bagian,
      });
    }
  };

  const handleShiftSelect = (shift: ShiftType) => {
    let jamMulai = '07:00';
    let jamSelesai = '14:00';

    if (shift === 'Siang') {
      jamMulai = '14:00';
      jamSelesai = '21:00';
    } else if (shift === 'Malam') {
      jamMulai = '21:00';
      jamSelesai = '07:00';
    } else if (shift === 'Full Day') {
      jamMulai = '08:00';
      jamSelesai = '16:00';
    }

    setFormData({
      ...formData,
      shift,
      jamMulai,
      jamSelesai,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.userId) {
      setModalError('Pilih petugas yang bertugas.');
      return;
    }
    if (!formData.jamMulai || !formData.jamSelesai) {
      setModalError('Jam mulai dan jam selesai harus diisi.');
      return;
    }

    const payload: WorkSchedule = {
      id: formData.id || `SCH-${Date.now()}`,
      userId: formData.userId,
      namaPetugas: formData.namaPetugas || '',
      jabatan: formData.jabatan as Role,
      bagian: formData.bagian as Department,
      hari: formData.hari as WorkSchedule['hari'],
      shift: formData.shift as ShiftType,
      jamMulai: formData.jamMulai,
      jamSelesai: formData.jamSelesai,
      ruangan: formData.ruangan || 'Klinik Sidogiri',
      keterangan: formData.keterangan || 'Tugas dinas terjadwal',
    };

    let res;
    if (isEditMode) {
      res = storage.updateSchedule(payload);
    } else {
      res = storage.addSchedule(payload);
    }

    if (res.success) {
      setActionSuccess(
        isEditMode
          ? `Perubahan tugas "${payload.namaPetugas}" (${payload.hari}) berhasil disimpan!`
          : `Tugas baru berhasil ditambahkan!`
      );
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      setModalError(res.message);
    }
  };

  const getShiftBadge = (shift: ShiftType) => {
    switch (shift) {
      case 'Pagi':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Sun,
        };
      case 'Siang':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: Sunset,
        };
      case 'Malam':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: Moon,
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-800 border-slate-200',
          icon: Clock,
        };
    }
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter((sch) => {
    const matchesUser = !onlyMySchedule || sch.userId === currentUser.id;
    const matchesDay = selectedDay === 'ALL' || sch.hari === selectedDay;
    const matchesShift = selectedShift === 'ALL' || sch.shift === selectedShift;
    const matchesSearch =
      sch.namaPetugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.bagian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sch.keterangan && sch.keterangan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sch.ruangan && sch.ruangan.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesUser && matchesDay && matchesShift && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header with Edit-Active Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manajemen Roster & Pembagian Tugas</span>
          </div>
          <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tight mt-1">
            JADWAL KERJA & RINCIAN TUGAS DINAS
          </h1>
          <p className="text-xs text-slate-500">
            Fitur edit tugas aktif. Anda dapat langsung mengubah shift, jam kerja, ruangan, dan deskripsi tugas seluruh dokter & paramedis.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>TAMBAH TUGAS BARU</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Official Poster Schedule Reference Info */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-5 shadow-sm space-y-3 border border-emerald-700/50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-black text-sm uppercase tracking-wider text-emerald-200">
              Ketetapan Jadwal Poli Klinik Pratama Sidogiri
            </span>
          </div>
          <span className="text-xs bg-white/15 px-3 py-1 rounded-full text-emerald-100 font-bold border border-white/10">
            UGD, Rawat Inap & Ambulans 24 Jam
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-emerald-100">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-white block border-b border-white/10 pb-1">Jadwal Poli Spesialis & Gigi:</span>
            <p>• <b>Poli THT (dr. Prasetyo):</b> Sen, Sel, Rab, Kam, Sab (09:00–11:00 WIB)</p>
            <p>• <b>Poli Gigi (H. Mahrus):</b> Senin & Selasa (09:00–11:00 WIB)</p>
            <p>• <b>Poli Gigi (drg. Suliono):</b> Rabu, Jumat, Sabtu (12:00–14:00 WIB)</p>
            <p>• <b>Poli Gigi (drg. Prasetyo Agung):</b> Kamis (09:00–11:00 WIB)</p>
            <p>• <b>Poli Kulit (dr. Asmahani Sp.DVE):</b> Senin & Kamis (Kondisional)</p>
            <p>• <b>Poli Optik:</b> Rabu & Sabtu (09:00–15:00 WIB)</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 space-y-1">
            <span className="font-bold text-white block border-b border-white/10 pb-1">Petugas Piket Setiap Hari (Senin - Ahad):</span>
            <p>• <b>Poli Umum & UGD:</b> dr. Taufik & dr. Gatot Trisila</p>
            <p>• <b>Piket Banat (Santri Putri):</b> dr. Ery Ardiana & Indah Wijayanti</p>
            <p>• <b>Perawat UGD & Bangsal:</b> Romly, H. Walid, Darmawan, H. Wagino, Hatta, Khoirul, Kholil, Didin, Ahyan, Setiawan, Tutut, Erina, S.Indriani</p>
            <p>• <b>Analis Lab:</b> Dianusvita Amd.A.K</p>
            <p>• <b>Driver Ambulans:</b> Bpk Sulhan & Misnawar</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white block border-b border-white/10 pb-1">Ketentuan Ahad / Hari Libur:</span>
              <p className="mt-1 font-semibold text-amber-200">
                "Semua Poli Libur kecuali Poli Umum & UGD"
              </p>
              <p className="mt-1.5 text-[11px] text-emerald-200 leading-relaxed">
                Seluruh dokter dan paramedis piket dinas bergantian shift Pagi (07:00–14:00), Siang (14:00–21:00), dan Malam (21:00–07:00).
              </p>
            </div>
            <span className="text-[10px] text-emerald-300 mt-2 font-mono">
              Alamat: Jl. Asrama Putra Ponpes Sidogiri RT2 RW2 Kraton
            </span>
          </div>
        </div>
      </div>

      {/* Days Tabs filter */}
      <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              selectedDay === 'ALL'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Semua Hari
          </button>
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                selectedDay === day
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-emerald-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary filter & search bar */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari tugas, nama petugas, poli, rincian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Shift filter */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Shift</option>
            <option value="Pagi">Shift Pagi</option>
            <option value="Siang">Shift Siang</option>
            <option value="Malam">Shift Malam</option>
            <option value="Full Day">Full Day</option>
          </select>

          {/* Toggle only my schedule */}
          <button
            onClick={() => setOnlyMySchedule(!onlyMySchedule)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              onlyMySchedule
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {onlyMySchedule ? '✓ Hanya Tugas Saya' : 'Semua Tugas Petugas'}
          </button>
        </div>
      </div>

      {/* MAIN VIEW: CARD VIEW OR TABLE VIEW */}
      {viewMode === 'card' ? (
        /* CARD VIEW WITH PROMINENT EDIT BUTTONS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((sch) => {
              const shiftBadge = getShiftBadge(sch.shift);
              const ShiftIcon = shiftBadge.icon;
              const isMe = sch.userId === currentUser.id;

              return (
                <div
                  key={sch.id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                    isMe
                      ? 'border-emerald-300 ring-2 ring-emerald-400/20 bg-emerald-50/20'
                      : 'border-emerald-100'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Bar of Card */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                        {sch.hari}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${shiftBadge.bg}`}
                      >
                        <ShiftIcon className="w-3 h-3" />
                        <span>Shift {sch.shift}</span>
                      </span>
                    </div>

                    {/* Staff Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {sch.jabatan === 'DOKTER' ? (
                          <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                        ) : (
                          <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                          {sch.namaPetugas}
                        </h3>
                      </div>

                      <p className="text-xs font-semibold text-emerald-800">
                        {sch.bagian}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ID: {sch.userId} {sch.ruangan && `• ${sch.ruangan}`}
                      </p>
                    </div>

                    {/* Rincian Tugas Dinas (Task Description) */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
                        Deskripsi / Rincian Tugas:
                      </span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {sch.keterangan || 'Pelayanan kesehatan & penugasan shift'}
                      </p>
                    </div>
                  </div>

                  {/* Timing & Prominent Edit Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>
                        {sch.jamMulai} - {sch.jamSelesai} WIB
                      </span>
                    </div>

                    {/* PROMINENT EDIT & DELETE BUTTONS - FULLY ACTIVATED */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(sch)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                        title="Edit rincian tugas dan jadwal ini"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Edit Tugas</span>
                      </button>

                      <button
                        onClick={() => handleDelete(sch)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                        title="Hapus Tugas Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 text-slate-400 text-xs">
              <CalendarDays className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Tidak ada jadwal yang sesuai filter.</p>
              <p className="mt-0.5">Pilih hari lain atau sesuaikan kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW WITH DEDICATED EDIT BUTTON COLUMN */
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Hari</th>
                  <th className="py-3.5 px-4">Nama Petugas</th>
                  <th className="py-3.5 px-4">Jabatan & Bagian</th>
                  <th className="py-3.5 px-4">Shift & Jam</th>
                  <th className="py-3.5 px-4">Ruangan / Pos</th>
                  <th className="py-3.5 px-4">Rincian Tugas</th>
                  <th className="py-3.5 px-4 text-center">Aksi (Edit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((sch) => {
                    const shiftBadge = getShiftBadge(sch.shift);
                    return (
                      <tr key={sch.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full text-xs">
                            {sch.hari}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {sch.namaPetugas}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ID: {sch.userId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sch.jabatan === 'DOKTER'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sch.jabatan}
                          </span>
                          <div className="text-slate-600 font-medium mt-0.5">
                            {sch.bagian}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800">
                            Shift {sch.shift}
                          </div>
                          <div className="font-mono text-emerald-900 text-[11px]">
                            {sch.jamMulai} - {sch.jamSelesai} WIB
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {sch.ruangan || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={sch.keterangan}>
                          {sch.keterangan || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* ACTIVATED EDIT BUTTON */}
                            <button
                              onClick={() => handleOpenEdit(sch)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title="Edit Tugas & Jadwal Ini"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDelete(sch)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada jadwal yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Schedule & Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Editor Roster & Penugasan</span>
                </div>
                <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight">
                  {isEditMode ? 'Edit Tugas & Jadwal Kerja' : 'Tambah Tugas & Jadwal Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah penugasan petugas medis, shift, jam kerja, ruangan, dan rincian tugas.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Petugas (Dokter / Paramedis) *
                </label>
                <select
                  value={formData.userId}
                  onChange={(e) => handleUserSelectChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Pilih Petugas --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.jabatan}] {u.nama} ({u.bagian})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hari Tugas *
                  </label>
                  <select
                    value={formData.hari}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hari: e.target.value as WorkSchedule['hari'],
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Shift *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Pagi', 'Siang', 'Malam'] as ShiftType[]).map((sh) => (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => handleShiftSelect(sh)}
                        className={`py-2 text-[11px] font-bold rounded-xl border text-center transition cursor-pointer ${
                          formData.shift === sh
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Mulai Dinas *
                  </label>
                  <input
                    type="time"
                    value={formData.jamMulai}
                    onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Selesai Dinas *
                  </label>
                  <input
                    type="time"
                    value={formData.jamSelesai}
                    onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruangan / Pos Pelayanan
                </label>
                <input
                  type="text"
                  value={formData.ruangan}
                  onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                  placeholder="Contoh: Poli Umum A, IGD 24 Jam, Depo Farmasi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Rincian Tugas yang dapat diedit secara lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rincian & Deskripsi Tugas Dinas *
                </label>
                <textarea
                  rows={3}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Contoh: Pelayanan konsultasi santri sakit, penanggung jawab tindakan darurat, supervisi rawat inap santri"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>{isEditMode ? 'Simpan Perubahan Tugas' : 'Tetapkan Tugas Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
