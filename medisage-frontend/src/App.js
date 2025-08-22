
import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Upload, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  LogOut,
  LogIn
} from 'lucide-react';
import './App.css';

const MediSage = () => {
  const [currentView, setCurrentView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const API_BASE = 'http://localhost:8000';

  // Load initial data
  useEffect(() => {
    loadUsers();
    loadAllReports();
  }, []);

  // Load user reports when user changes
  useEffect(() => {
    if (currentUser) {
      loadUserReports();
      setCurrentView('dashboard');
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAllReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/`);
      if (response.ok) {
        const data = await response.json();
        setAllReports(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadUserReports = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE}/user/${currentUser.user_id}/reports/`);
      if (response.ok) {
        const data = await response.json();
        setUserReports(data);
      }
    } catch (error) {
      console.error('Error loading user reports:', error);
    }
  };

  const loginUser = async (mobile_number) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('mobile_number', mobile_number);

      const response = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result);
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

  const uploadReport = async (file) => {
    setLoading(true);
    setUploadStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', currentUser.user_id);

      const response = await fetch(`${API_BASE}/upload-report/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUserReports(prev => [...prev, result]);
        setAllReports(prev => [...prev, result]);
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

  const logout = () => {
    setCurrentUser(null);
    setUserReports([]);
    setCurrentView('login');
    setSelectedReport(null);
  };

  // Login Component
  const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [mobileNumber, setMobileNumber] = useState('');
    const [formData, setFormData] = useState({ name: '', mobile: '', role: 'patient' });
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      if (!mobileNumber.trim()) {
        setError('Please enter mobile number');
        return;
      }
      
      const result = await loginUser(mobileNumber);
      if (!result.success) {
        setError(result.error);
      }
    };

    const handleRegister = async (e) => {
      e.preventDefault();
      if (!formData.name || !formData.mobile) {
        setError('Please fill all fields');
        return;
      }
      
      const result = await registerUser(formData);
      if (result.success) {
        setIsLogin(true);
        setError('');
        setFormData({ name: '', mobile: '', role: 'patient' });
      } else {
        setError(result.error);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">MediSage</h1>
            <p className="text-gray-600">Your Medical Report Assistant</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <h2 className="text-xl font-semibold mb-4">Login</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your mobile number"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <p className="text-center mt-4 text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-500 hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2 className="text-xl font-semibold mb-4">Register</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
              <p className="text-center mt-4 text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-blue-500 hover:underline"
                >
                  Login here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Activity className="h-8 w-8" />
          <h1 className="text-xl font-bold">MediSage</h1>
          <span className="text-sm bg-white/20 px-2 py-1 rounded">
            Welcome, {currentUser?.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
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
            onClick={() => setCurrentView('upload')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'upload' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'hover:bg-white/20'
            }`}
          >
            Upload Report
          </button>
          <button
            onClick={() => setCurrentView('analysis')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'analysis' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'hover:bg-white/20'
            }`}
          >
            My Reports
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg hover:bg-white/20 flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );

  // Dashboard Component
  const Dashboard = () => {
    const totalLabValues = userReports.reduce((acc, report) => 
      acc + Object.keys(report.lab_results || {}).length, 0
    );

    return (
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
                <p className="text-green-600 text-sm font-medium">My Reports</p>
                <p className="text-3xl font-bold text-green-800">{userReports.length}</p>
              </div>
              <FileText className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Analyzed Parameters</p>
                <p className="text-3xl font-bold text-purple-800">{totalLabValues}</p>
              </div>
              <Activity className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-500" />
            Recent Reports
          </h3>
          <div className="space-y-3">
            {userReports.slice(-5).map((report, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setSelectedReport(report);
                  setCurrentView('analysis');
                }}
              >
                <div>
                  <p className="font-medium">{report.file_name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(report.upload_time).toLocaleDateString()}
                  </p>
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
            {userReports.length === 0 && (
              <p className="text-gray-500 text-center py-4">No reports uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Report Upload Component
  const ReportUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
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
      if (!selectedFile) {
        alert('Please select a file');
        return;
      }

      const result = await uploadReport(selectedFile);
      setLastUploadResult(result);
      
      if (result.success) {
        setSelectedFile(null);
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

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, PNG, JPG, JPEG (Max 10MB)
            </p>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer inline-block"
            >
              Choose File
            </label>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Upload & Analyze'}
          </button>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              uploadStatus === 'success' ? 'bg-green-50 border border-green-200' :
              uploadStatus === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`font-medium ${
                uploadStatus === 'success' ? 'text-green-800' :
                uploadStatus === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {uploadStatus === 'uploading' && '📤 Uploading and analyzing...'}
                {uploadStatus === 'success' && '✅ Report uploaded successfully!'}
                {uploadStatus === 'error' && '❌ Upload failed. Please try again.'}
              </p>

              {lastUploadResult?.success && lastUploadResult.data.lab_results && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Analysis Results:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(lastUploadResult.data.lab_results).map(([param, data]) => (
                      <div key={param} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="font-medium">{param}</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(data.status)}
                          <span className="text-sm">
                            {data.value} {data.unit}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            data.status === 'Normal' ? 'bg-green-100 text-green-800' :
                            data.status === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
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
          )}
        </div>
      </div>
    );
  };

  // Report Analysis Component
  const ReportAnalysis = () => {
    const recommendations = {
      WBC: {
        High: 'High WBC count may indicate infection or inflammation. Consult your doctor.',
        Low: 'Low WBC count may indicate weakened immunity. Avoid crowded places and maintain hygiene.',
        Normal: 'Your WBC count is normal. Continue maintaining good health practices.'
      },
      RBC: {
        High: 'High RBC count may indicate dehydration or lung disease. Stay hydrated.',
        Low: 'Low RBC count may indicate anemia. Include iron-rich foods in your diet.',
        Normal: 'Your RBC count is normal. Keep up the good work!'
      },
      HbA1c: {
        High: 'High HbA1c indicates poor blood sugar control. Follow diabetic diet and exercise.',
        Low: 'Your HbA1c is in excellent range. Continue your current lifestyle.',
        Normal: 'Your HbA1c is normal. Maintain current diet and exercise habits.'
      },
      SGPT: {
        High: 'High SGPT may indicate liver stress. Avoid alcohol and fatty foods.',
        Low: 'Low SGPT is generally not concerning.',
        Normal: 'Your liver function appears normal.'
      }
    };

    const getRecommendation = (param, status) => {
      return recommendations[param]?.[status] || 'No specific recommendation available. Consult your healthcare provider.';
    };

    if (!selectedReport) {
      return (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Activity className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">My Reports</h2>
              <p className="text-gray-600">Select a report to view detailed analysis</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                My Reports
              </h3>
              
              {userReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userReports.map((report, index) => {
                    const labCount = Object.keys(report.lab_results || {}).length;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedReport(report)}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-all hover:from-blue-100 hover:to-indigo-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {labCount} values
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-800 mb-1 truncate">
                          {report.file_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(report.upload_time).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No reports uploaded yet</p>
                  <button
                    onClick={() => setCurrentView('upload')}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Upload Your First Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    const labResults = selectedReport.lab_results || {};

    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Report Analysis</h2>
              <p className="text-gray-600">{selectedReport.file_name}</p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Back to Reports
            </button>
          </div>

          {Object.keys(labResults).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(labResults).map(([param, data]) => (
                <div key={param} className="bg-white rounded-xl shadow-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{param}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.status === 'Normal' ? 'bg-green-100 text-green-800' :
                      data.status === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-800">
                      {data.value} <span className="text-lg text-gray-600">{data.unit}</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Recommendation:</h4>
                    <p className="text-gray-700">{getRecommendation(param, data.status)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Lab Values Found</h3>
              <p className="text-gray-600">
                We couldn't extract any lab values from this report. Please ensure the file contains clear lab results.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render
  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'upload' && <ReportUpload />}
        {currentView === 'analysis' && <ReportAnalysis />}
      </main>
    </div>
  );
};

export default MediSage;
