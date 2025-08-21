import React, { useState, useEffect } from 'react';
import { Upload, FileText, User, Heart, CheckCircle, AlertTriangle, XCircle, Plus, Search } from 'lucide-react';

const MediSage = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // API Base URL - adjust this to match your FastAPI server
  const API_BASE = 'http://localhost:8000';

  // Register new user
  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('mobile_number', userData.mobile);
      formData.append('role', userData.role);

      const response = await fetch(`${API_BASE}/register-user/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(prev => [...prev, result]);
        return { success: true, data: result };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  // Upload report
  const uploadReport = async (file, userId) => {
    setLoading(true);
    setUploadStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const response = await fetch(`${API_BASE}/upload-report/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setReports(prev => [...prev, result]);
        setUploadStatus('success');
        return { success: true, data: result };
      } else {
        const error = await response.json();
        setUploadStatus('error');
        return { success: false, error: error.detail };
      }
    } catch (error) {
      setUploadStatus('error');
      return { success: false, error: 'Upload failed' };
    } finally {
      setLoading(false);
    }
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-pink-300" />
          <h1 className="text-2xl font-bold">MediSage</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'dashboard' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'hover:bg-white/20'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('register')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'register' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'hover:bg-white/20'
            }`}
          >
            Register User
          </button>
          <button
            onClick={() => setCurrentView('upload')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'upload' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'hover:bg-white/20'
            }`}
          >
            Upload Report
          </button>
        </div>
      </div>
    </nav>
  );

  // Dashboard Component
  const Dashboard = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-800">{users.length}</p>
            </div>
            <User className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Reports Processed</p>
              <p className="text-3xl font-bold text-green-800">{reports.length}</p>
            </div>
            <FileText className="h-12 w-12 text-green-500" />
          </div>
        </div>
        
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            Recent Users
          </h3>
          <div className="space-y-3">
            {users.slice(-5).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.mobile_number}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'doctor' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-500 text-center py-4">No users registered yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-500" />
            Recent Reports
          </h3>
          <div className="space-y-3">
            {reports.slice(-5).map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{report.file_name}</p>
                  <p className="text-sm text-gray-600">User ID: {report.user_id}</p>
                </div>
                <div className="text-right">
                  {Object.keys(report.lab_results || {}).length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {Object.keys(report.lab_results).length} values
                    </span>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-gray-500 text-center py-4">No reports uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // User Registration Component
  const UserRegistration = () => {
    const [formData, setFormData] = useState({
      name: '',
      mobile: '',
      role: 'patient'
    });
    const [status, setStatus] = useState(null);

    const handleSubmit = async () => {
      const result = await registerUser(formData);
      
      if (result.success) {
        setStatus({ type: 'success', message: 'User registered successfully!' });
        setFormData({ name: '', mobile: '', role: 'patient' });
      } else {
        setStatus({ type: 'error', message: result.error });
      }
    };

    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg border p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Register New User
          </h2>
          
          {status && (
            <div className={`p-4 rounded-lg mb-4 ${
              status.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({...prev, mobile: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Registering...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Register User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Report Upload Component
  const ReportUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [lastUploadResult, setLastUploadResult] = useState(null);

    const handleFileSelect = (file) => {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a PDF or image file (PNG, JPG, JPEG)');
        return;
      }
      setSelectedFile(file);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    };

    const handleUpload = async () => {
      if (!selectedFile || !selectedUserId) {
        alert('Please select both a file and a user');
        return;
      }

      const result = await uploadReport(selectedFile, selectedUserId);
      setLastUploadResult(result);
      
      if (result.success) {
        setSelectedFile(null);
        setSelectedUserId('');
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'High': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        case 'Low': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
      }
    };

    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg border p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Upload Medical Report
          </h2>

          {/* User Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.name} ({user.mobile_number}) - {user.role}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {selectedFile ? (
              <div>
                <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Drop your medical report here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, PNG, JPG, JPEG files
                </p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
            >
              Browse Files
            </label>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedUserId || loading}
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Analyze
              </>
            )}
          </button>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : uploadStatus === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {uploadStatus === 'success' && '✅ Report uploaded and processed successfully!'}
              {uploadStatus === 'error' && '❌ Upload failed. Please try again.'}
              {uploadStatus === 'uploading' && '📤 Processing your report...'}
            </div>
          )}

          {/* Lab Results */}
          {lastUploadResult?.success && lastUploadResult.data.lab_results && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Lab Results Found:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(lastUploadResult.data.lab_results).map(([name, data]) => (
                  <div key={name} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{name}</span>
                      {getStatusIcon(data.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.value} {data.unit} - 
                      <span className={`ml-1 font-medium ${
                        data.status === 'Normal' ? 'text-green-600' :
                        data.status === 'High' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {data.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto py-6">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'register' && <UserRegistration />}
        {currentView === 'upload' && <ReportUpload />}
      </main>
    </div>
  );
};

export default MediSage;