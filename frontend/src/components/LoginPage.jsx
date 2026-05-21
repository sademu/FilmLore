import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ArrowLeft, Upload } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // creating s state variable by default value login
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    dateOfBirth: '',
    rememberMe: false,
    agreeToTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'login') {
      // Handle login
      try {
        const endpoint = loginType === 'admin' 
          ? 'http://localhost:5004/api/auth/admin/login'
          : 'http://localhost:5004/api/auth/login';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Store token in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Navigate to home
          alert('Login successful!');
          navigate('/movies');
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
      }
    } else {
      // Handle signup
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      if (!formData.agreeToTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
      }

      try {
        const response = await fetch('http://localhost:5004/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            dateOfBirth: formData.dateOfBirth,
            profileImage: profileImage, // Base64 image
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Account created successfully! Please login.');
          setActiveTab('login');
          // Reset form
          setFormData({
            fullName: '',
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            dateOfBirth: '',
            rememberMe: false,
            agreeToTerms: false
          });
          setProfileImage(null);
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during registration. Please try again.');
      }
    }
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-background">
        <div className="login-overlay" />
      </div>

      {/* Back Button */}
      <button className="back-to-home" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">FILMLORE</h1>
          <p className="login-subtitle">
            Welcome back! Sign in to continue your cinematic journey
          </p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Login Type Selection - Only for Login */}
        {activeTab === 'login' && (
          <div className="login-type-selection">
            <button
              className={`login-type-btn ${loginType === 'user' ? 'active' : ''}`}
              onClick={() => setLoginType('user')}
            >
              <User size={24} />
              <span>User Login</span>
            </button>
            <button
              className={`login-type-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => setLoginType('admin')}
            >
              <Shield size={24} />
              <span>Admin Login</span>
            </button>
          </div>
        )}

        {/* Profile Picture Upload - Only for Signup */}
        {activeTab === 'signup' && (
          <div className="profile-upload-section">
            <div className="profile-picture-wrapper">
              <div className="profile-picture">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" />
                ) : (
                  <User size={48} />
                )}
              </div>
              <label htmlFor="profile-upload" className="upload-btn">
                <Upload size={16} />
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p className="upload-text">Upload Profile Picture</p>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {activeTab === 'signup' ? (
            <>
              {/* Signup Form */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>

              <button type="submit" className="submit-btn">
                Create Account
              </button>
            </>
          ) : (
            <>
              {/* Login Form */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="submit-btn">
                Login as {loginType === 'user' ? 'User' : 'Admin'}
              </button>
            </>
          )}
        </form>

        {activeTab === 'signup' && (
          <p className="login-footer">
            Already have an account?{' '}
            <button onClick={() => setActiveTab('login')} className="switch-tab">
              Login here
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
