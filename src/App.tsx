import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storage } from './services/storage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Navigation, TabType } from './components/Navigation';
import { LoginView } from './views/LoginView';
import { StaffDashboard } from './views/StaffDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { StaffManagement } from './views/StaffManagement';
import { ScheduleManagement } from './views/ScheduleManagement';
import { AttendanceHistory } from './views/AttendanceHistory';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Initialize and load active user
  useEffect(() => {
    const existing = storage.getCurrentUser();
    if (existing) {
      setCurrentUser(existing);
    }
    setAllUsers(storage.getUsers());
  }, [refreshKey]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.jabatan === 'ADMIN' ? 'dashboard' : 'absensi');
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleSwitchUser = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab(user.jabatan === 'ADMIN' ? 'dashboard' : 'absensi');
    setRefreshKey((k) => k + 1);
  };

  const handleDataChanged = () => {
    setRefreshKey((k) => k + 1);
  };

  // If not logged in, render Login View
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.jabatan === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#F6FAF8] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header with Sidogiri Logo, User info, Realtime clock & Quick switcher */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={currentUser.jabatan}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {isAdmin ? (
              <AdminDashboard
                onNavigateToStaff={() => setActiveTab('petugas')}
                onNavigateToHistory={() => setActiveTab('riwayat')}
                onNavigateToSchedule={() => setActiveTab('jadwal')}
              />
            ) : (
              <StaffDashboard
                currentUser={currentUser}
                onRefreshData={handleDataChanged}
                onNavigateToHistory={() => setActiveTab('riwayat')}
              />
            )}
          </>
        )}

        {/* ABSENSI TAB (Direct Check-in / Check-out) */}
        {activeTab === 'absensi' && (
          <StaffDashboard
            currentUser={currentUser}
            onRefreshData={handleDataChanged}
            onNavigateToHistory={() => setActiveTab('riwayat')}
          />
        )}

        {/* JADWAL KERJA TAB */}
        {activeTab === 'jadwal' && (
          <ScheduleManagement currentUser={currentUser} />
        )}

        {/* DATA PETUGAS TAB (Admin only) */}
        {activeTab === 'petugas' && (
          <>
            {isAdmin ? (
              <StaffManagement />
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-2">
                <p className="font-bold text-rose-700 text-base">
                  Akses Terbatas: Hanya Administrator
                </p>
                <p className="text-xs text-slate-500">
                  Halaman pengelolaan data petugas hanya dapat diakses oleh Administrator Klinik Sidogiri.
                </p>
              </div>
            )}
          </>
        )}

        {/* RIWAYAT ABSENSI TAB */}
        {activeTab === 'riwayat' && (
          <AttendanceHistory currentUser={currentUser} />
        )}

        {/* LAPORAN TAB */}
        {activeTab === 'laporan' && (
          <ReportsView currentUser={currentUser} />
        )}

        {/* PENGATURAN TAB */}
        {activeTab === 'pengaturan' && (
          <SettingsView
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => {
              setCurrentUser(updated);
              handleDataChanged();
            }}
          />
        )}
      </main>

      {/* Footer with Klinik Sidogiri identity */}
      <Footer />
    </div>
  );
}
