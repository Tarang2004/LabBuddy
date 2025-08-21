import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, User, Heart, CheckCircle, AlertTriangle, XCircle, 
  Plus, Search, Users, Activity, Brain, MessageCircle, TrendingUp, 
  Shield, Database, Eye, Languages, Stethoscope, BarChart3 
} from 'lucide-react';

const MediSage = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // API Base URL - adjust this to match your FastAPI server
  const API_BASE = 'http://localhost:8000';

  // Project Modules Configuration
  const modules = [
    {
      id: 'user-management',
      name: 'User Management',
      icon: Users,
      description: 'Registration, authentication, and role-based access',
      status: 'active',
      color: 'blue'
    },
    {
      id: 'report-upload',
      name: 'Report Upload & Storage',
      icon: Database,
      description: 'Upload and store lab reports securely',
      status: 'active',
      color: 'green'
    },
    {
      id: 'ocr-processing',
      name: 'OCR & Lab Data Processing',
      icon: Eye,
      description: 'Extract and structure health parameters',
      status: 'active',
      color: 'purple'
    },
    {
      id: 'ai-gujarati',
      name: 'AI/NLP & Gujarati Glossary',
      icon: Languages,
      description: 'AI explanations with Gujarati medical terms',
      status: 'coming-soon',
      color: 'orange'
    },
    {
      id: 'doctor-consultation',
      name: 'Doctor Consultation & Feedback',
      icon: Stethoscope,
      description: 'Secure doctor-patient communication',
      status: 'coming-soon',
      color: 'red'
    },
    {
      id: 'health-insights',
      name: 'Health Visualization & Insights',
      icon: BarChart3,
      description: 'Interactive trends and health analytics',
      status: 'coming-soon',
      color: 'teal'
    }
  ];

  // Register new user (Module 1: User Management)
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

  // Upload report (Module 2: Report Upload & Storage)
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
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-pink-300" />
            <div>
              <h1 className="text-2xl font-bold">MediSage</h1>
              <p className="text-xs text-blue-100">Intelligent Medical Report Analysis</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentModule('dashboard')}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                currentModule === 'dashboard' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'hover:bg-white/20'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentModule('user-management')}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                currentModule === 'user-management' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'hover:bg-white/20'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Dashboard Component - Overview with integrated upload
  const Dashboard = () => {
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
      <div className="p-6">
        {/* System Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-blue-800">{users.length}</p>
                </div>
                <Users className="h-12 w-12 text-blue-500" />
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
        </div>

        {/* Report Upload Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Medical Report</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-green-500" />
                Upload & Analyze
              </h3>

              {/* User Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient/User *
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
                {users.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">⚠️ No users found. Register users first.</p>
                )}
              </div>

              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                {selectedFile ? (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <p className="font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Drop your report here or click to browse</p>
                    <p className="text-sm text-gray-500 mb-3">Supports PDF, PNG, JPG, JPEG files</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  id="file-upload-dashboard"
                />
                <label
                  htmlFor="file-upload-dashboard"
                  className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm"
                >
                  Browse Files
                </label>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedUserId || loading}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
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
                <div className={`mt-4 p-3 rounded-lg border ${
                  uploadStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : uploadStatus === 'error'
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  <div className="flex items-center text-sm">
                    {uploadStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
                    {uploadStatus === 'error' && <XCircle className="h-4 w-4 mr-2" />}
                    {uploadStatus === 'uploading' && <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-2"></div>}
                    <span>
                      {uploadStatus === 'success' && 'Report processed successfully!'}
                      {uploadStatus === 'error' && 'Upload failed. Please try again.'}
                      {uploadStatus === 'uploading' && 'Processing report...'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Analysis Results
              </h3>

              {lastUploadResult?.success && lastUploadResult.data.lab_results ? (
                <div>
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {Object.entries(lastUploadResult.data.lab_results).map(([name, data]) => (
                      <div key={name} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{name}</span>
                          {getStatusIcon(data.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-lg">{data.value}</span>
                          <span className="ml-1">{data.unit}</span>
                        </div>
                        <div className="mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            data.status === 'Normal' ? 'bg-green-100 text-green-700' :
                            data.status === 'High' ? 'bg-orange-100 text-orange-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {data.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p>📊 Lab values extracted and analyzed against reference ranges.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No analysis results yet</p>
                  <p className="text-sm text-gray-400">Upload a medical report to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Recent User Registrations
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
              Recent Report Uploads
            </h3>
            <div className="space-y-3">
              {reports.slice(-5).map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{report.file_name}</p>
                    <p className="text-xs text-gray-600">User ID: {report.user_id}</p>
                  </div>
                  <div className="text-right">
                    {report.lab_results && Object.keys(report.lab_results).length > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
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
  };

  // Module 1: User Management
  const UserManagementModule = () => {
    const [formData, setFormData] = useState({
      name: '',
      mobile: '',
      role: 'patient'
    });
    const [status, setStatus] = useState(null);

    const handleSubmit = async () => {
      const result = await registerUser(formData);
      
      if (result.success) {
        setStatus({ type: 'success', message: '✅ User registered successfully!' });
        setFormData({ name: '', mobile: '', role: 'patient' });
      } else {
        setStatus({ type: 'error', message: result.error });
      }
    };

    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Management Module</h2>
          <p className="text-gray-600">Registration, authentication, and secure role-based access control</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-500" />
              Register New User
            </h3>
            
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
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({...prev, mobile: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
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
                disabled={loading || !formData.name || !formData.mobile}
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

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-500" />
              Registered Users ({users.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      user.role === 'doctor' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.mobile_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'doctor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">ID: {user.user_id}</p>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users registered yet</p>
                  <p className="text-sm text-gray-400">Register the first user to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Module 2: Report Upload & Storage
  const ReportUploadModule = () => {
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
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Upload & Storage Module</h2>
          <p className="text-gray-600">Upload lab reports in PDF or image formats for secure storage and analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-green-500" />
                Upload Medical Report
              </h3>

              {/* User Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient/User *
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
                {users.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">⚠️ No users found. Register users first.</p>
                )}
              </div>

              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
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
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg text-gray-600 mb-2">
                      Drop your medical report here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports PDF, PNG, JPG, JPEG files (Max: 10MB)
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        Images
                      </div>
                    </div>
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
                  className="mt-4 inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
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
                    Processing Report...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Analyze Report
                  </>
                )}
              </button>

              {/* Upload Status */}
              {uploadStatus && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  uploadStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : uploadStatus === 'error'
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  <div className="flex items-center">
                    {uploadStatus === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {uploadStatus === 'error' && <XCircle className="h-5 w-5 mr-2" />}
                    {uploadStatus === 'uploading' && <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>}
                    <span className="font-medium">
                      {uploadStatus === 'success' && 'Report uploaded and processed successfully!'}
                      {uploadStatus === 'error' && 'Upload failed. Please try again.'}
                      {uploadStatus === 'uploading' && 'Processing your medical report...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Lab Results Display */}
              {lastUploadResult?.success && lastUploadResult.data.lab_results && (
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-600" />
                    OCR Analysis Results
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(lastUploadResult.data.lab_results).map(([name, data]) => (
                      <div key={name} className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{name}</span>
                          {getStatusIcon(data.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-lg">{data.value}</span>
                          <span className="ml-1">{data.unit}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            data.status === 'Normal' ? 'bg-green-100 text-green-700' :
                            data.status === 'High' ? 'bg-orange-100 text-orange-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {data.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>📊 <strong>Next Steps:</strong> Lab values have been extracted and analyzed against reference ranges.</p>
                    <p className="text-xs text-gray-500 mt-1">Future modules will provide AI explanations and Gujarati translations.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reports Sidebar */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Recent Reports ({reports.length})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.map((report, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800 truncate">{report.file_name}</p>
                      <p className="text-xs text-gray-600">User ID: {report.user_id}</p>
                    </div>
                  </div>
                  
                  {report.lab_results && Object.keys(report.lab_results).length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(report.lab_results).slice(0, 3).map(([name, data]) => (
                          <span key={name} className={`text-xs px-2 py-1 rounded ${
                            data.status === 'Normal' ? 'bg-green-100 text-green-700' :
                            data.status === 'High' ? 'bg-orange-100 text-orange-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {name}: {data.status}
                          </span>
                        ))}
                        {Object.keys(report.lab_results).length > 3 && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            +{Object.keys(report.lab_results).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No reports uploaded yet</p>
                  <p className="text-xs text-gray-400">Upload your first medical report</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Coming Soon Modules
  const ComingSoonModule = ({ moduleInfo }) => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{moduleInfo.name}</h2>
        <p className="text-gray-600">{moduleInfo.description}</p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <moduleInfo.icon className="h-16 w-16 text-orange-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-orange-800 mb-4">Coming Soon</h3>
          <p className="text-orange-700 mb-6">
            This module is currently under development and will be available in future updates.
          </p>
          
          {moduleInfo.id === 'ocr-processing' && (
            <div className="text-left bg-white p-4 rounded-lg border border-orange-100 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Current OCR Features (Active):</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Text extraction from PDF files</li>
                <li>✅ OCR processing for images (PNG, JPG, JPEG)</li>
                <li>✅ Lab value parsing (WBC, RBC, HbA1c, SGPT)</li>
                <li>✅ Reference range analysis</li>
              </ul>
              <h4 className="font-semibold text-gray-800 mb-2 mt-4">Upcoming Enhancements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>🔄 Advanced NLP processing</li>
                <li>🔄 More lab parameters support</li>
                <li>🔄 Better accuracy algorithms</li>
              </ul>
            </div>
          )}
          
          {moduleInfo.id === 'ai-gujarati' && (
            <div className="text-left bg-white p-4 rounded-lg border border-orange-100 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Planned Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>🤖 AI-powered health explanations</li>
                <li>🗣️ Gujarati medical glossary</li>
                <li>📝 Plain language interpretations</li>
                <li>🌐 Multi-language support</li>
              </ul>
            </div>
          )}
          
          {moduleInfo.id === 'doctor-consultation' && (
            <div className="text-left bg-white p-4 rounded-lg border border-orange-100 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Planned Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>👩‍⚕️ Secure doctor dashboard</li>
                <li>💬 Patient-doctor messaging</li>
                <li>📋 Professional feedback system</li>
                <li>🔔 Real-time notifications</li>
              </ul>
            </div>
          )}
          
          {moduleInfo.id === 'health-insights' && (
            <div className="text-left bg-white p-4 rounded-lg border border-orange-100 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Planned Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>📈 Interactive health trends</li>
                <li>📊 Visual analytics dashboard</li>
                <li>⚠️ Risk level indicators</li>
                <li>📱 Progress tracking</li>
              </ul>
            </div>
          )}
          
          <button className="bg-orange-200 text-orange-800 px-6 py-2 rounded-lg cursor-not-allowed">
            🚧 Under Development
          </button>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto">
        {currentModule === 'dashboard' && <Dashboard />}
        {currentModule === 'user-management' && <UserManagementModule />}
        {currentModule === 'report-upload' && <ReportUploadModule />}
        
        {/* Coming Soon Modules */}
        {currentModule === 'ocr-processing' && (
          <ComingSoonModule moduleInfo={modules.find(m => m.id === 'ocr-processing')} />
        )}
        {currentModule === 'ai-gujarati' && (
          <ComingSoonModule moduleInfo={modules.find(m => m.id === 'ai-gujarati')} />
        )}
        {currentModule === 'doctor-consultation' && (
          <ComingSoonModule moduleInfo={modules.find(m => m.id === 'doctor-consultation')} />
        )}
        {currentModule === 'health-insights' && (
          <ComingSoonModule moduleInfo={modules.find(m => m.id === 'health-insights')} />
        )}
      </main>
    </div>
  );
};

export default MediSage