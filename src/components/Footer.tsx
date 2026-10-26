import React from 'react';
import { Logo } from './Logo';
import { Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-emerald-100 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Clinic Brand */}
          <div className="space-y-3">
            <Logo size="md" textColor="text-emerald-950" />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Sistem Presensi & Kehadiran Digital Dokter dan Paramedis Klinik Sidogiri. Berkomitmen memberikan pelayanan kesehatan santri dan masyarakat yang profesional, amanah, dan terpercaya.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sistem Terverifikasi & Terintegrasi Internal Klinik</span>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-xs mb-3">
              Kontak & Lokasi Klinik
            </h4>
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Jl. Raya Sidogiri No. 12, Kraton, Pasuruan, Jawa Timur 67151</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>(0343) 424177 • Emergency IGD: 0812-3456-7890</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>klinik@sidogiri.net</span>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-xs mb-3">
              Jadwal Pelayanan
            </h4>
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Pelayanan Poli Rawat Jalan:</span>
                <span className="font-bold text-emerald-900">07:00 - 21:00 WIB</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">IGD & Rawat Inap Santri:</span>
                <span className="font-bold text-emerald-900">24 Jam Nonstop</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Layanan Farmasi & Lab:</span>
                <span className="font-bold text-emerald-900">24 Jam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="font-bold text-emerald-900">
            © {new Date().getFullYear()} Klinik Sidogiri. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-emerald-800">
            <span>Aplikasi Presensi Resmi</span>
            <span>•</span>
            <span>Pondok Pesantren Sidogiri Pasuruan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
