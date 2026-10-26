import React, { useState, useEffect } from 'react';
import { User, Role, Department } from '../types';
import { storage } from '../services/storage';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  ShieldCheck,
  Stethoscope,
  Activity,
  KeyRound,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

const DEPARTMENT_LIST: Department[] = [
  'Poli Umum',
  'Poli Gigi',
  'Poli THT',
  'Poli Spesialis Kulit & Kelamin (KK)',
  'Poli Optik',
  'Poli Banat (Santri Putri)',
  'IGD / UGD 24 Jam',
  'Rawat Inap Santri',
  'Farmasi & Apotek',
  'Laboratorium Medis',
  'Layanan Ambulan 24 Jam',
  'Administrasi Medis',
];

export const StaffManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AKTIF' | 'NONAKTIF'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<User>>({
    id: '',
    nama: '',
    jabatan: 'DOKTER',
    spesialisasi: '',
    bagian: 'Poli Umum',
    noHp: '',
    statusAktif: true,
    username: '',
    password: '',
    sip: '',
  });

  const [showPasswordInModal, setShowPasswordInModal] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadUsers = () => {
    setUsers(storage.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setModalError(null);
    setShowPasswordInModal(false);

    // Auto generate next suggested ID based on role
    const currentUsers = storage.getUsers();
    const count = currentUsers.length + 1;
    const suggestedId = `STF-${String(count).padStart(3, '0')}`;

    setFormData({
      id: suggestedId,
      nama: '',
      jabatan: 'DOKTER',
      spesialisasi: '',
      bagian: 'Poli Umum',
      noHp: '',
      statusAktif: true,
      username: '',
      password: '',
      sip: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setIsEditMode(true);
    setModalError(null);
    setShowPasswordInModal(false);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string, currentName: string) => {
    const res = storage.toggleUserStatus(id);
    if (res.success) {
      setActionSuccess(`Status petugas ${currentName} diubah menjadi: ${res.newStatus ? 'AKTIF' : 'NONAKTIF'}.`);
      loadUsers();
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Yakin ingin menghapus data petugas "${user.nama}" (${user.id})?`)) {
      const res = storage.deleteUser(user.id);
      if (res.success) {
        setActionSuccess(res.message);
        loadUsers();
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(res.message);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.id?.trim()) {
      setModalError('ID Petugas tidak boleh kosong.');
      return;
    }
    if (!formData.nama?.trim()) {
      setModalError('Nama Lengkap tidak boleh kosong.');
      return;
    }
    if (!formData.username?.trim()) {
      setModalError('Username tidak boleh kosong.');
      return;
    }
    if (!formData.password?.trim()) {
      setModalError('Password/PIN tidak boleh kosong.');
      return;
    }

    const payload: User = {
      id: formData.id.trim(),
      nama: formData.nama.trim(),
      jabatan: formData.jabatan as Role,
      spesialisasi: formData.spesialisasi?.trim() || '',
      bagian: (formData.bagian as Department) || 'Poli Umum',
      noHp: formData.noHp?.trim() || '-',
      statusAktif: formData.statusAktif ?? true,
      username: formData.username.trim(),
      password: formData.password.trim(),
      sip: formData.sip?.trim() || '',
    };

    let res;
    if (isEditMode) {
      res = storage.updateUser(payload);
    } else {
      res = storage.addUser(payload);
    }

    if (res.success) {
      setActionSuccess(res.message);
      setIsModalOpen(false);
      loadUsers();
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      setModalError(res.message);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.bagian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.noHp.includes(searchQuery);

    const matchesRole = roleFilter === 'ALL' || u.jabatan === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AKTIF' && u.statusAktif) ||
      (statusFilter === 'NONAKTIF' && !u.statusAktif);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Master Data Petugas</span>
          </div>
          <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tight mt-1">
            DATA DOKTER & PARAMEDIS
          </h1>
          <p className="text-xs text-slate-500">
            Kelola data dokter, paramedis (perawat, bidan, farmasi, lab) dan staf administrasi Klinik Sidogiri.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>TAMBAH PETUGAS BARU</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, ID, username, nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | Role)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Jabatan</option>
            <option value="DOKTER">Dokter</option>
            <option value="PARAMEDIS">Paramedis</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'AKTIF' | 'NONAKTIF')}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="AKTIF">Hanya Aktif</option>
            <option value="NONAKTIF">Hanya Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ID & Nama Petugas</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4">Bagian / Poli</th>
                <th className="py-3.5 px-4">No. HP</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Password / PIN</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`hover:bg-emerald-50/30 transition-colors ${
                      !u.statusAktif ? 'bg-slate-50/60 opacity-75' : ''
                    }`}
                  >
                    {/* ID & Nama */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {u.nama}
                      </div>
                      <div className="text-[10px] text-slate-700 font-mono">
                        {u.id} {u.sip && `• ${u.sip}`}
                      </div>
                    </td>

                    {/* Jabatan */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.jabatan === 'ADMIN'
                            ? 'bg-emerald-950 text-emerald-300'
                            : u.jabatan === 'DOKTER'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.jabatan === 'ADMIN' && <ShieldCheck className="w-2.5 h-2.5" />}
                        {u.jabatan === 'DOKTER' && <Stethoscope className="w-2.5 h-2.5" />}
                        {u.jabatan === 'PARAMEDIS' && <Activity className="w-2.5 h-2.5" />}
                        <span>{u.jabatan}</span>
                      </span>
                      {u.spesialisasi && (
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {u.spesialisasi}
                        </div>
                      )}
                    </td>

                    {/* Bagian */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {u.bagian}
                    </td>

                    {/* No HP */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {u.noHp}
                    </td>

                    {/* Username */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-900">
                      @{u.username}
                    </td>

                    {/* Password/PIN: Masked in table per security requirement */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[11px] tracking-widest select-none">
                        ••••••••
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.nama)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                          u.statusAktif
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Klik untuk mengubah status aktif"
                      >
                        {u.statusAktif ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>AKTIF</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            <span>NONAKTIF</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                          title="Edit Data Petugas & Tugas"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Data Petugas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada data petugas yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total terdaftar: <b>{filteredUsers.length}</b> petugas
          </span>
          <span className="text-[11px] text-slate-400">
            * Password/PIN disamarkan demi keamanan data privasi.
          </span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight">
                  {isEditMode ? 'Edit Data Petugas' : 'Tambah Petugas Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Klinik Sidogiri - Form Pendaftaran Dokter & Paramedis
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ID Petugas *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    disabled={isEditMode}
                    placeholder="DOK-005 / PRM-006"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan *
                  </label>
                  <select
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value as Role })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="DOKTER">DOKTER</option>
                    <option value="PARAMEDIS">PARAMEDIS</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: dr. Ahmad Fauzi / Ns. Nur Kholis, S.Kep"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bagian / Unit Kerja *
                  </label>
                  <select
                    value={formData.bagian}
                    onChange={(e) =>
                      setFormData({ ...formData, bagian: e.target.value as Department })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DEPARTMENT_LIST.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spesialisasi / Keterangan
                  </label>
                  <input
                    type="text"
                    value={formData.spesialisasi}
                    onChange={(e) =>
                      setFormData({ ...formData, spesialisasi: e.target.value })
                    }
                    placeholder="Contoh: Spesialis Gigi / Perawat Anestesi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. SIP / STR (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.sip}
                    onChange={(e) => setFormData({ ...formData, sip: e.target.value })}
                    placeholder="SIP.503/446/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                  Kredensial Akses Login Petugas
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username Login *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value.toLowerCase() })
                      }
                      placeholder="username_petugas"
                      className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password / PIN *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordInModal ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Contoh: 1234 atau pin rahasia"
                        className="w-full bg-white border border-emerald-200 rounded-xl pl-3 pr-9 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswordInModal ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Aktif Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="statusAktif"
                  checked={formData.statusAktif}
                  onChange={(e) =>
                    setFormData({ ...formData, statusAktif: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <label
                  htmlFor="statusAktif"
                  className="text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Status Akun Aktif (Dapat melakukan absensi masuk & keluar)
                </label>
              </div>

              {/* Submit Buttons */}
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
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md transition cursor-pointer"
                >
                  {isEditMode ? 'Simpan Perubahan' : 'Tambahkan Petugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
