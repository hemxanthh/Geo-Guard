import React from 'react';
import { Calendar, Clock, Navigation, RefreshCw } from 'lucide-react';
import { Trip } from '../../types';
import { clsx } from 'clsx';

// The component now receives all the data and functions it needs as props
const TripHistory: React.FC<{ trips: Trip[], isLoading: boolean, onRefresh: () => void }> = ({ trips, isLoading, onRefresh }) => {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip History</h1>
          <p className="text-gray-600 mt-1">A record of all completed journeys.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Trips ({trips.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="p-12 text-center">
                <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No trips recorded yet</h3>
            </div>
          ) : (
            trips.map((trip: any) => {
              const startTime = new Date(trip.startTime);
              const endTime = new Date(trip.endTime);
              const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // in minutes

              return (
                <div key={trip.id} className="p-6">
                  {/* ... existing trip rendering logic ... */}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TripHistory;