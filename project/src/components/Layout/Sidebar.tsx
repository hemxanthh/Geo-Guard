import React from 'react';
import { X, Home, Map, History, AlertTriangle, Car, Settings, Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & stats' },
  { id: 'live-map', label: 'Live Tracking', icon: Map, description: 'Real-time location' },
  { id: 'trips', label: 'Trip History', icon: History, description: 'Past journeys' },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, description: 'Security notifications' },
  { id: 'vehicles', label: 'Vehicles', icon: Car, description: 'Manage fleet' },
  { id: 'remote', label: 'Remote Control', icon: Shield, description: 'Engine controls' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onPageChange }) => {
  const handlePageClick = (pageId: string) => {
    onPageChange(pageId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        'fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out',
        'lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">GEO-Guard</h2>
                <p className="text-sm text-gray-500">X</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageClick(item.id)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                    'text-left group',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={clsx(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  )} />
                  <div className="flex-1">
                    <div className={clsx(
                      'font-medium',
                      isActive ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.label}
                    </div>
                    <div className={clsx(
                      'text-sm',
                      isActive ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Connection Status */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-3 bg-green-50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-sm">
                <div className="font-medium text-green-800">Connected</div>
                <div className="text-green-600">All systems operational</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;