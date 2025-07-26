import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LoginForm from './components/Auth/LoginForm';
import RegistrationForm from './components/Auth/RegistrationFormNew';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardEnhanced from './components/Dashboard/DashboardEnhanced';
import LiveMap from './components/Map/LiveMap';
import TripHistory from './components/Trips/TripHistory';
import AlertsPanel from './components/Alerts/AlertsPanel';
import RemoteControl from './components/Remote/RemoteControl';
import Settings from './components/Settings/Settings';
import { Trip } from './types';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  // --- NEW: State for trips and fetching logic is now here ---
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isFetchingTrips, setIsFetchingTrips] = useState(false);

  const fetchTrips = useCallback(async () => {
    if (!user) return; // Don't fetch if not logged in
    setIsFetchingTrips(true);
    try {
      const response = await fetch('http://localhost:3001/trips');
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setIsFetchingTrips(false);
    }
  }, [user]);

  // Fetch trips when the user logs in or when the page is changed to 'trips'
  useEffect(() => {
    if (currentPage === 'trips') {
      fetchTrips();
    }
  }, [currentPage, fetchTrips]);
  // -----------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VehicleGuard Pro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegistrationForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        // Pass the page change function to the dashboard
        return <DashboardEnhanced onPageChange={setCurrentPage} />;
      case 'live-map':
        return <LiveMap />;
      case 'trips':
        // Pass the trips data and fetching logic to the TripHistory page
        return <TripHistory trips={trips} isLoading={isFetchingTrips} onRefresh={fetchTrips} />;
      case 'alerts':
        return <AlertsPanel />;
      case 'remote':
        return <RemoteControl />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardEnhanced onPageChange={setCurrentPage} />;
    }
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <main className="flex-1 p-6 lg:ml-0">
            <div className="max-w-7xl mx-auto">
              {renderCurrentPage()}
            </div>
          </main>
        </div>
      </div>
    </SocketProvider>
  );
};

export default App;