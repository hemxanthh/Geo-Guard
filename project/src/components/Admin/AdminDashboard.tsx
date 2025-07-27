import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  BarChart3, 
  Shield, 
  Settings, 
  AlertTriangle,
  Database,
  Activity,
  UserPlus,
  CarIcon,
  TrendingUp,
  Bell,
  FileText,
  Monitor,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import clsx from 'clsx';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVehicles: number;
  activeVehicles: number;
  totalTrips: number;
  totalAlerts: number;
  systemHealth: number;
  storageUsed: number;
}

interface SystemUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  status: 'active' | 'suspended';
  lastActive: string; // API returns string, we convert to Date when displaying
  vehicleCount: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalTrips: 0,
    totalAlerts: 0,
    systemHealth: 95,
    storageUsed: 67
  });
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user' as 'user' | 'admin' | 'manager'
  });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <Lock className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load admin statistics
      const statsResponse = await fetch('http://localhost:3001/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load users data
      const usersResponse = await fetch('http://localhost:3001/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    // Basic validation
    if (!newUser.username.trim() || !newUser.password.trim()) {
      alert('Username and password are required');
      return;
    }

    if (newUser.username.length < 3) {
      alert('Username must be at least 3 characters long');
      return;
    }

    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setShowAddUserModal(false);
        setNewUser({ username: '', password: '', email: '', role: 'user' });
        loadAdminData(); // Refresh the user list
        alert('User added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add user: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Network error occurred while adding user');
    }
  };

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const confirmMessage = `Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`http://localhost:3001/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadAdminData(); // Refresh the user list
          alert('User deleted successfully!');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete user: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Network error occurred while deleting user');
      }
    }
  };

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'vehicles', label: 'Fleet Management', icon: Car },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Settings },
  ];

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={clsx(
              "text-sm mt-2 flex items-center",
              change > 0 ? "text-green-600" : "text-red-600"
            )}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={clsx(
          "p-3 rounded-lg",
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'orange' ? 'bg-orange-100' : 'bg-purple-100'
        )}>
          <Icon className={clsx(
            "w-8 h-8",
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'orange' ? 'text-orange-600' : 'text-purple-600'
          )} />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={8}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Vehicles"
          value={stats.activeVehicles}
          change={5}
          icon={Car}
          color="green"
        />
        <StatCard
          title="Total Trips Today"
          value={stats.totalTrips}
          change={-2}
          icon={Activity}
          color="orange"
        />
        <StatCard
          title="Active Alerts"
          value={stats.totalAlerts}
          change={-15}
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Health</span>
                <span className="font-medium">{stats.systemHealth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.systemHealth}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Storage Used</span>
                <span className="font-medium">{stats.storageUsed}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.storageUsed}%` }}
                ></div>
              </div>
            </div>

            <div className={clsx(
              "flex items-center space-x-2 text-sm",
              connected ? "text-green-600" : "text-red-600"
            )}>
              <div className={clsx(
                "w-2 h-2 rounded-full",
                connected ? "bg-green-500" : "bg-red-500"
              )}></div>
              <span>{connected ? 'System Online' : 'System Offline'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Add User</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <CarIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Add Vehicle</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <FileText className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Generate Report</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Bell className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Send Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.vehicleCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'vehicles':
        return <div className="text-center py-12 text-gray-500">Fleet Management - Coming Soon</div>;
      case 'reports':
        return <div className="text-center py-12 text-gray-500">Advanced Reports - Coming Soon</div>;
      case 'security':
        return <div className="text-center py-12 text-gray-500">Security Management - Coming Soon</div>;
      case 'system':
        return <div className="text-center py-12 text-gray-500">System Configuration - Coming Soon</div>;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-1">System administration and management</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={clsx(
              "flex items-center space-x-2 px-3 py-1 rounded-full text-sm",
              connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              <Monitor className="w-4 h-4" />
              <span>{connected ? 'System Online' : 'System Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {renderTabContent()}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'admin' | 'manager'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setNewUser({ username: '', password: '', email: '', role: 'user' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
