import React, { useState } from 'react';
import { Lock, Unlock, Power, Volume2, Lightbulb, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { RemoteCommand } from '../../types';
import { clsx } from 'clsx';

const RemoteControl: React.FC = () => {
  const { sendCommand, vehicleStatus } = useSocket();
  const [commandHistory, setCommandHistory] = useState<RemoteCommand[]>([]);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);

  const currentVehicle = Object.values(vehicleStatus)[0]; // Get first vehicle for demo

  const executeCommand = async (command: string, requiresConfirmation: boolean = false) => {
    if (requiresConfirmation && showConfirmation !== command) {
      setShowConfirmation(command);
      return;
    }

    setShowConfirmation(null);
    setPendingCommand(command);

    const newCommand: RemoteCommand = {
      id: `cmd-${Date.now()}`,
      vehicleId: 'vehicle-1',
      command: command as any,
      status: 'pending',
      timestamp: new Date(),
    };

    setCommandHistory(prev => [newCommand, ...prev.slice(0, 9)]);

    try {
      const success = await sendCommand('vehicle-1', command);
      
      const updatedCommand = {
        ...newCommand,
        status: success ? 'acknowledged' as const : 'failed' as const,
        executedAt: new Date(),
        response: success ? 'Command executed successfully' : 'Command failed to execute',
      };

      setCommandHistory(prev => 
        prev.map(cmd => cmd.id === newCommand.id ? updatedCommand : cmd)
      );
    } catch (error) {
      const failedCommand = {
        ...newCommand,
        status: 'failed' as const,
        executedAt: new Date(),
        response: 'Network error occurred',
      };

      setCommandHistory(prev => 
        prev.map(cmd => cmd.id === newCommand.id ? failedCommand : cmd)
      );
    } finally {
      setPendingCommand(null);
    }
  };

  const commands = [
    {
      id: 'lock_engine',
      label: 'Lock Engine',
      description: 'Prevent engine from starting',
      icon: Lock,
      color: 'red',
      requiresConfirmation: true,
      disabled: currentVehicle?.engineLocked,
    },
    {
      id: 'unlock_engine',
      label: 'Unlock Engine',
      description: 'Allow engine to start normally',
      icon: Unlock,
      color: 'green',
      requiresConfirmation: true,
      disabled: !currentVehicle?.engineLocked,
    },
    {
      id: 'emergency_stop',
      label: 'Emergency Stop',
      description: 'Immediately stop the vehicle',
      icon: Power,
      color: 'red',
      requiresConfirmation: true,
      disabled: !currentVehicle?.isMoving,
    },
    {
      id: 'horn',
      label: 'Sound Horn',
      description: 'Activate vehicle horn',
      icon: Volume2,
      color: 'yellow',
      requiresConfirmation: false,
      disabled: false,
    },
    {
      id: 'lights',
      label: 'Flash Lights',
      description: 'Flash hazard lights',
      icon: Lightbulb,
      color: 'blue',
      requiresConfirmation: false,
      disabled: false,
    },
    {
      id: 'get_status',
      label: 'Get Status',
      description: 'Request current vehicle status',
      icon: CheckCircle,
      color: 'purple',
      requiresConfirmation: false,
      disabled: false,
    },
  ];

  const getColorClasses = (color: string, disabled: boolean = false) => {
    if (disabled) {
      return 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
    }
    
    switch (color) {
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: RemoteCommand['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Remote Control</h1>
          <p className="text-gray-600 mt-1">Control your vehicle remotely and safely</p>
        </div>
        
        {currentVehicle && (
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className={clsx(
              'px-3 py-2 rounded-lg text-sm font-medium',
              currentVehicle.ignitionOn 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            )}>
              Engine: {currentVehicle.ignitionOn ? 'ON' : 'OFF'}
            </div>
            <div className={clsx(
              'px-3 py-2 rounded-lg text-sm font-medium',
              currentVehicle.engineLocked 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            )}>
              Status: {currentVehicle.engineLocked ? 'LOCKED' : 'UNLOCKED'}
            </div>
          </div>
        )}
      </div>

      {/* Safety Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Safety Notice</h3>
            <p className="text-amber-700 text-sm">
              Remote commands should only be used in emergency situations or when the vehicle is safely parked. 
              Ensure the vehicle is not in motion before executing engine lock or emergency stop commands.
            </p>
          </div>
        </div>
      </div>

      {/* Command Buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Commands</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commands.map((command) => {
            const Icon = command.icon;
            const isPending = pendingCommand === command.id;
            const isConfirming = showConfirmation === command.id;
            
            return (
              <div key={command.id} className="relative">
                <button
                  onClick={() => executeCommand(command.id, command.requiresConfirmation)}
                  disabled={command.disabled || isPending}
                  className={clsx(
                    'w-full p-6 border-2 rounded-xl transition-all duration-200 text-left',
                    'focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 outline-none',
                    getColorClasses(command.color, command.disabled || isPending),
                    !command.disabled && !isPending && 'hover:scale-105 hover:shadow-md'
                  )}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{command.label}</h3>
                      <p className="text-sm opacity-80">{command.description}</p>
                    </div>
                  </div>
                  
                  {isPending && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-5 h-5 animate-spin" />
                        <span className="font-medium">Executing...</span>
                      </div>
                    </div>
                  )}
                </button>

                {/* Confirmation Dialog */}
                {isConfirming && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center z-10">
                    <div className="text-center p-4">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-4">
                        Are you sure you want to {command.label.toLowerCase()}?
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => executeCommand(command.id, false)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowConfirmation(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Command History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Command History</h2>
          <p className="text-sm text-gray-500 mt-1">Recent remote commands</p>
        </div>

        <div className="divide-y divide-gray-200">
          {commandHistory.map((command) => (
            <div key={command.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(command.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {command.command.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {command.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    command.status === 'acknowledged' ? 'bg-green-100 text-green-800' :
                    command.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  )}>
                    {command.status.toUpperCase()}
                  </div>
                  {command.response && (
                    <p className="text-xs text-gray-500 mt-1">{command.response}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {commandHistory.length === 0 && (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No commands sent</h3>
            <p className="text-gray-500">Command history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteControl;