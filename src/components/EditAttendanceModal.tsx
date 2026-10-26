import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, ShiftType, User, Role, Department } from '../types';
import { storage, getCurrentTimeString, getTodayDateString } from '../services/storage';
import {
  X,
  Clock,
  Calendar,
  AlertCircle,
  Thermometer,
  MapPin,
  FileText,
  CheckCircle2,
  Stethoscope,
  Activity,
} from 'lucide-react';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  onSaved: () => void;
}

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  isOpen,
  onClose,
  record,
  onSaved,
}) => {
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else {
      setFormData({
        id: `ATT-${Date.now()}`,
        userId: '',
        nama: '',
        jabatan: 'DOKTER',
        bagian: 'Poli Umum',
        tanggal: getTodayDateString(),
        jamMasuk: getCurrentTimeString(),
        jamPulang: '-',
        status: 'HADIR',
        shift: 'Pagi',
        keterangan: '',
        suhuTubuh: '36.5°C',
        lokasi: 'Klinik Sidogiri',
      });
    }
    setError(null);
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nama?.trim()) {
      setError('Nama petugas tidak boleh kosong.');
      return;
    }

    const payload: AttendanceRecord = {
      id: formData.id || `ATT-${Date.now()}`,
      userId: formData.userId || 'DOK-001',
      nama: formData.nama,
      jabatan: formData.jabatan as Role,
      bagian: formData.bagian as Department,
      tanggal: formData.tanggal || getTodayDateString(),
      jamMasuk: formData.jamMasuk || '-',
      jamPulang: formData.jamPulang || '-',
      status: (formData.status as AttendanceStatus) || 'HADIR',
      shift: formData.shift as ShiftType,
      keterangan: formData.keterangan || '',
      suhuTubuh: formData.suhuTubuh || '36.5°C',
      lokasi: formData.lokasi || 'Klinik Sidogiri',
      timestampMasuk: formData.timestampMasuk || Date.now(),
      timestampPulang: formData.timestampPulang,
    };

    const res = storage.adminSaveAttendance(payload);
    if (res.success) {
      onSaved();
      onClose();
    } else {
      setError(res.message);
    }
  };

  const handleSetCurrentMasuk = () => {
    setFormData((prev) => ({ ...prev, jamMasuk: getCurrentTimeString() }));
  };

  const handleSetCurrentPulang = () => {
    setFormData((prev) => ({
      ...prev,
      jamPulang: getCurrentTimeString(),
      status: 'SUDAH PULANG',
    }));
  };

  const handleClearPulang = () => {
    setFormData((prev) => ({ ...prev, jamPulang: '-' }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Formulir Pengubahan Data Presensi</span>
            </div>
            <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tight">
              {record ? 'Edit Presensi & Catatan Tugas' : 'Input Catatan Presensi Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Ubah jam masuk, jam pulang, status dinas, atau rincian tugas petugas Klinik Sidogiri.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Petugas Info */}
          <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 text-sm">
                {formData.nama || 'Petugas Medis'}
              </span>
              <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                ID: {formData.userId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span>{formData.jabatan}</span>
              <span>•</span>
              <span>{formData.bagian}</span>
            </div>
          </div>

          {/* Tanggal & Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Kehadiran *
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shift Tugas
              </label>
              <select
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value as ShiftType })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Pagi">Shift Pagi (07:00 - 14:00 WIB)</option>
                <option value="Siang">Shift Siang (14:00 - 21:00 WIB)</option>
                <option value="Malam">Shift Malam (21:00 - 07:00 WIB)</option>
                <option value="Full Day">Full Day / Jaga Santri</option>
              </select>
            </div>
          </div>

          {/* Jam Masuk & Jam Pulang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Jam Masuk</label>
                <button
                  type="button"
                  onClick={handleSetCurrentMasuk}
                  className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Set Sekarang
                </button>
              </div>
              <input
                type="text"
                value={formData.jamMasuk}
                onChange={(e) => setFormData({ ...formData, jamMasuk: e.target.value })}
                placeholder="07:00:00 atau -"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Jam Pulang</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSetCurrentPulang}
                    className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Set Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={handleClearPulang}
                    className="text-[10px] text-slate-400 font-medium hover:underline cursor-pointer"
                  >
                    Kosongkan (-)
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={formData.jamPulang}
                onChange={(e) => setFormData({ ...formData, jamPulang: e.target.value })}
                placeholder="14:00:00 atau -"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Status Kehadiran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Status Kehadiran *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(
                [
                  'HADIR',
                  'TERLAMBAT',
                  'IZIN',
                  'SAKIT',
                  'ALPA',
                  'SUDAH PULANG',
                ] as AttendanceStatus[]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: st })}
                  className={`py-2 text-[10px] font-bold rounded-xl border text-center transition cursor-pointer ${
                    formData.status === st
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Rincian Tugas & Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rincian Tugas & Keterangan *
            </label>
            <textarea
              rows={2}
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Contoh: Bertugas di Poli Umum, melayani 25 santri rawat jalan"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Suhu Tubuh & Lokasi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Suhu Tubuh
              </label>
              <input
                type="text"
                value={formData.suhuTubuh}
                onChange={(e) => setFormData({ ...formData, suhuTubuh: e.target.value })}
                placeholder="36.5°C"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi Tugas
              </label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                placeholder="Klinik Sidogiri Induk"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md transition cursor-pointer"
            >
              Simpan Perubahan Tugas & Presensi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
