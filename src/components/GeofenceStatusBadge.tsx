import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  Coordinates,
  GeofenceResult,
  LocationSimulationMode,
  getStaffLocation,
  evaluateGeofence,
  KLINIK_SIDOGIRI_COORDS,
  DEFAULT_GEOFENCE_RADIUS_METERS,
} from '../services/geolocation';
import { storage } from '../services/storage';

interface GeofenceStatusBadgeProps {
  onLocationEvaluated?: (result: GeofenceResult) => void;
  compact?: boolean;
}

export const GeofenceStatusBadge: React.FC<GeofenceStatusBadgeProps> = ({
  onLocationEvaluated,
  compact = false,
}) => {
  const [simulationMode, setSimulationMode] = useState<LocationSimulationMode>('DI_KLINIK');
  const [loading, setLoading] = useState<boolean>(true);
  const [geofenceResult, setGeofenceResult] = useState<GeofenceResult | null>(null);
  const [showTester, setShowTester] = useState<boolean>(false);

  const evaluate = async (mode: LocationSimulationMode) => {
    setLoading(true);
    const profile = storage.getClinicProfile();
    const clinicCoords: Coordinates = {
      latitude: profile.latitude || KLINIK_SIDOGIRI_COORDS.latitude,
      longitude: profile.longitude || KLINIK_SIDOGIRI_COORDS.longitude,
    };
    const maxRadius = profile.radiusMeter || DEFAULT_GEOFENCE_RADIUS_METERS;

    const loc = await getStaffLocation(mode);
    const result = evaluateGeofence(loc.coords, clinicCoords, maxRadius);

    setGeofenceResult(result);
    setLoading(false);

    if (onLocationEvaluated) {
      onLocationEvaluated(result);
    }
  };

  useEffect(() => {
    evaluate(simulationMode);
  }, [simulationMode]);

  const handleModeChange = (mode: LocationSimulationMode) => {
    setSimulationMode(mode);
  };

  if (!geofenceResult && loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-xs text-slate-500 animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Memeriksa GPS Lokasi Klinik Sidogiri...</span>
      </div>
    );
  }

  const isInside = geofenceResult?.isInside ?? false;
  const distance = geofenceResult?.distanceMeter ?? 0;
  const radius = geofenceResult?.maxRadiusMeter ?? 250;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
            isInside
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {isInside ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span>
            {isInside
              ? `Di Area Klinik (${distance}m)`
              : `Di Luar Klinik (${distance}m - Terkunci)`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl border transition-all bg-white shadow-2xs space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isInside
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Radar Geofencing GPS:
              </span>
              <span
                className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                  isInside
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800 animate-pulse'
                }`}
              >
                {isInside ? 'TERVERIFIKASI DI KLINIK' : 'DI LUAR AREA KLINIK (TERKUNCI)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jarak ke pos induk: <span className="font-bold text-slate-800">{distance} meter</span> (Maks radius: {radius} m)
            </p>
          </div>
        </div>

        {/* Quick simulation tester toggle for demonstration & testing */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowTester(!showTester)}
            className="text-[11px] font-bold text-slate-500 hover:text-emerald-800 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            <Navigation className="w-3 h-3" />
            <span>{showTester ? 'Tutup Uji GPS' : 'Uji Status Lokasi'}</span>
          </button>
        </div>
      </div>

      {/* Info Warning when outside */}
      {!isInside && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Absensi Tidak Dapat Dilakukan di Luar Klinik:</span>
            <p className="text-[11px] text-rose-700 mt-0.5">
              Sesuai SOP Klinik Sidogiri, dokter dan paramedis hanya dapat melakukan absensi saat hadir secara fisik di area klinik (radius 250m).
            </p>
          </div>
        </div>
      )}

      {/* Simulation Selector for testing both inside & outside states */}
      {showTester && (
        <div className="pt-2.5 border-t border-slate-100 space-y-2 bg-slate-50/70 p-3 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-bold">Uji Simulasi Geofence (Demonstrasi):</span>
            <span className="text-[10px] text-slate-400">Pilih skenario untuk menguji sistem</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleModeChange('DI_KLINIK')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                simulationMode === 'DI_KLINIK'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>1. Di Klinik (25m)</span>
              <span className="text-[10px] opacity-80">Bisa Absen</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('DI_LUAR_KLINIK')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                simulationMode === 'DI_LUAR_KLINIK'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>2. Luar Klinik (1.8km)</span>
              <span className="text-[10px] opacity-80">Tolak Absen</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('GPS_RIIL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                simulationMode === 'GPS_RIIL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>3. GPS Riil Perangkat</span>
              <span className="text-[10px] opacity-80">Sensor HP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
