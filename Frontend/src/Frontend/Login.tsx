import React, { useState } from 'react';
import { LogIn, Briefcase } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success && result.data) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        onLoginSuccess(result.data.token, result.data.user);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError('Connection error: ' + err.message);
      // Mock login for testing
      const mockUser = { id: 1, email, role: 'admin', name: 'Test User' };
      const mockToken = 'mock_token_' + Date.now();
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      onLoginSuccess(mockToken, mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          firstName,
          lastName,
          role: 'member'
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        onLoginSuccess(result.data.token, result.data.user);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setError('Connection error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Briefcase size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold ml-3 text-gray-900">GymPro</h1>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>

        {/* Form */}
        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
          {/* Name Fields (Sign up only) */}
          {isSignup && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            {isLoading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-700 font-semibold ml-1"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900 font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-800">Email: admin@gym.com</p>
          <p className="text-xs text-blue-800">Password: password123</p>
        </div>
      </div>
    </div>
  );
};
