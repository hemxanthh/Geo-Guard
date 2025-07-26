import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin, Filter, Search, Bell } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { Alert } from '../../types';
import { clsx } from 'clsx';

const AlertsPanel: React.FC = () => {
  const { alerts } = useSocket();
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'acknowledged'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filter) {
        case 'unread':
          return !alert.isRead;
        case 'critical':
          return alert.severity === 'critical' || alert.severity === 'high';
        case 'acknowledged':
          return alert.acknowledged;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'unauthorized_movement':
        return <AlertTriangle className="w-5 h-5" />;
      case 'low_battery':
        return <Bell className="w-5 h-5" />;
      case 'geofence_breach':
        return <MapPin className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertTitle = (type: Alert['type']) => {
    switch (type) {
      case 'unauthorized_movement':
        return 'Unauthorized Movement';
      case 'low_battery':
        return 'Low Battery';
      case 'geofence_breach':
        return 'Geofence Breach';
      case 'ignition_tamper':
        return 'Ignition Tampering';
      case 'emergency':
        return 'Emergency Alert';
      case 'engine_lock':
        return 'Engine Locked';
      case 'engine_unlock':
        return 'Engine Unlocked';
      default:
        return 'Security Alert';
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor security events and notifications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{alerts.length}</h3>
              <p className="text-gray-600 font-medium">Total Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{unreadCount}</h3>
              <p className="text-gray-600 font-medium">Unread</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{criticalCount}</h3>
              <p className="text-gray-600 font-medium">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="all">All Alerts</option>
              <option value="unread">Unread</option>
              <option value="critical">Critical</option>
              <option value="acknowledged">Acknowledged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Alert History</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredAlerts.length} alerts found</p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  getSeverityColor(alert.severity)
                )}>
                  {getAlertIcon(alert.type)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {getAlertTitle(alert.type)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getSeverityColor(alert.severity)
                      )}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 mb-2">{alert.message}</p>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{alert.timestamp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                      </span>
                    </div>
                    {alert.acknowledged && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Acknowledged</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  {!alert.isRead && (
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Mark Read
                    </button>
                  )}
                  {!alert.acknowledged && alert.severity !== 'low' && (
                    <button className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">
              {alerts.length === 0 
                ? "No security alerts at this time. Your vehicles are secure."
                : "Try adjusting your search or filter settings."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;