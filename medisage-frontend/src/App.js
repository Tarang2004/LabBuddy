
import React, { useState, useEffect } from 'react';
import { Upload, FileText, User, Heart, CheckCircle, AlertTriangle, XCircle, Plus, Search, Activity, Calendar, TrendingUp } from 'lucide-react';

const MediSage = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

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
          <button
            onClick={() => setCurrentView('analysis')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'analysis' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'hover:bg-white/20'
            }`}
          >
            Report Analysis
          </button>
        </div>
      </div>
    </nav>
  );

  // Report Analysis Component
  const ReportAnalysis = () => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Normal': return 'text-green-600 bg-green-50 border-green-200';
        case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'Low': return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Normal': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'High': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        case 'Low': return <XCircle className="h-5 w-5 text-red-500" />;
        default: return <Activity className="h-5 w-5 text-gray-500" />;
      }
    };

    const getRecommendation = (param, status) => {
      const recommendations = {
        'WBC': {
          'High': 'Elevated white blood cell count may indicate infection, inflammation, or immune system disorder. Consult your doctor for further evaluation.',
          'Low': 'Low white blood cell count may indicate weakened immune system. Consider lifestyle changes and medical consultation.',
          'Normal': 'Your white blood cell count is within normal range, indicating good immune function.'
        },
        'RBC': {
          'High': 'High red blood cell count may indicate dehydration, lung disease, or blood disorders. Monitor and consult healthcare provider.',
          'Low': 'Low red blood cell count may indicate anemia. Consider iron-rich diet and medical evaluation.',
          'Normal': 'Your red blood cell count is normal, indicating good oxygen-carrying capacity.'
        },
        'HbA1c': {
          'High': 'Elevated HbA1c indicates poor blood sugar control. Diabetes management and lifestyle changes needed.',
          'Low': 'Very low HbA1c is rare but may indicate hypoglycemia risk. Monitor blood sugar levels.',
          'Normal': 'Your HbA1c is in excellent range, indicating good blood sugar control.'
        },
        'SGPT': {
          'High': 'Elevated SGPT/ALT indicates liver stress or damage. Avoid alcohol and consult hepatologist.',
          'Low': 'Low SGPT is generally not concerning but may indicate B6 deficiency in rare cases.',
          'Normal': 'Your liver enzyme levels are normal, indicating good liver health.'
        }
      };

      return recommendations[param]?.[status] || 'No specific recommendation available. Consult your healthcare provider.';
    };

    if (!selectedReport) {
      return (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Activity className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Report Analysis</h2>
              <p className="text-gray-600">Select a report to view detailed analysis</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Available Reports
              </h3>
              
              {reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports.map((report, index) => {
                    const user = users.find(u => u.user_id === report.user_id);
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
                        <p className="text-sm text-gray-600 mb-2">
                          {user ? user.name : `User ID: ${report.user_id}`}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Report #{report.report_id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reports uploaded yet</p>
                  <button
                    onClick={() => setCurrentView('upload')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload First Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    const user = users.find(u => u.user_id === selectedReport.user_id);
    const labResults = selectedReport.lab_results || {};
    const hasAbnormalValues = Object.values(labResults).some(result => result.status !== 'Normal');

    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="h-8 w-8 mr-3 text-blue-500" />
                Report Analysis
              </h2>
              <p className="text-gray-600 mt-1">{selectedReport.file_name}</p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Reports
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">{user ? user.name : 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Contact</label>
                    <p className="font-medium">{user ? user.mobile_number : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Role</label>
                    <p className="font-medium capitalize">{user ? user.role : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Report ID</label>
                    <p className="font-medium">#{selectedReport.report_id}</p>
                  </div>
                </div>
              </div>

              {/* Overall Status */}
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  Overall Status
                </h3>
                <div className={`p-4 rounded-lg border-2 ${hasAbnormalValues ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center mb-2">
                    {hasAbnormalValues ? (
                      <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    )}
                    <span className={`font-semibold ${hasAbnormalValues ? 'text-orange-700' : 'text-green-700'}`}>
                      {hasAbnormalValues ? 'Attention Required' : 'All Values Normal'}
                    </span>
                  </div>
                  <p className={`text-sm ${hasAbnormalValues ? 'text-orange-600' : 'text-green-600'}`}>
                    {hasAbnormalValues 
                      ? 'Some values are outside normal range. Please review recommendations.'
                      : 'All lab values are within normal ranges. Great health indicators!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Lab Results */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-500" />
                  Lab Results Analysis ({Object.keys(labResults).length} parameters)
                </h3>
                
                {Object.keys(labResults).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(labResults).map(([parameter, data]) => (
                      <div key={parameter} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            {getStatusIcon(data.status)}
                            <div className="ml-3">
                              <h4 className="text-lg font-semibold text-gray-800">{parameter}</h4>
                              <p className="text-sm text-gray-500">
                                {parameter === 'WBC' && 'White Blood Cells'}
                                {parameter === 'RBC' && 'Red Blood Cells'}
                                {parameter === 'HbA1c' && 'Hemoglobin A1c'}
                                {parameter === 'SGPT' && 'Liver Enzyme (ALT)'}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full border ${getStatusColor(data.status)}`}>
                            <span className="text-sm font-medium">{data.status}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Measured Value</label>
                            <p className="text-2xl font-bold text-gray-800">
                              {data.value} <span className="text-sm font-normal text-gray-600">{data.unit}</span>
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Reference Range</label>
                            <p className="text-sm text-gray-700 mt-1">
                              {parameter === 'WBC' && '4,000 - 11,000 /cmm'}
                              {parameter === 'RBC' && '4.2 - 5.9 mill/cmm'}
                              {parameter === 'HbA1c' && '4.0 - 5.6 %'}
                              {parameter === 'SGPT' && '7 - 56 U/L'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Clinical Recommendation</h5>
                          <p className="text-sm text-blue-700">{getRecommendation(parameter, data.status)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No lab values extracted from this report</p>
                    <p className="text-sm text-gray-400 mt-2">The system may not have recognized standard lab parameters</p>
                  </div>
                )}
              </div>

              {/* Extracted Text Preview */}
              {selectedReport.extracted_text_preview && (
                <div className="bg-white rounded-xl shadow-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Search className="h-5 w-5 mr-2 text-gray-500" />
                    Extracted Text Preview
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm text-gray-700 font-mono leading-relaxed">
                      {selectedReport.extracted_text_preview}
                      {selectedReport.extracted_text_preview.length === 200 && '...'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Showing first 200 characters of extracted text from the uploaded document
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Analyzed Parameters</p>
              <p className="text-3xl font-bold text-purple-800">
                {reports.reduce((total, report) => total + Object.keys(report.lab_results || {}).length, 0)}
              </p>
            </div>
            <Activity className="h-12 w-12 text-purple-500" />
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
              {uploadStatus === 'success' && (
                <div className="flex items-center justify-between">
                  <span>✅ Report uploaded and processed successfully!</span>
                  {lastUploadResult?.success && (
                    <button
                      onClick={() => {
                        setSelectedReport(lastUploadResult.data);
                        setCurrentView('analysis');
                      }}
                      className="ml-4 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      View Analysis
                    </button>
                  )}
                </div>
              )}
              {uploadStatus === 'error' && '❌ Upload failed. Please try again.'}
              {uploadStatus === 'uploading' && '📤 Processing your report...'}
            </div>
          )}

          {/* Lab Results Preview */}
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
        {currentView === 'analysis' && <ReportAnalysis />}
      </main>
    </div>
  );
};

export default MediSage;
