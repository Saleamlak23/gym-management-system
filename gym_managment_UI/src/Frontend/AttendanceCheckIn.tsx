import React, { useState } from 'react';
import { CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import type { AttendanceCheckIn as AttendanceCheckInType } from './types';

export const AttendanceCheckIn: React.FC = () => {
  const [memberId, setMemberId] = useState('');
  const [checkInResult, setCheckInResult] = useState<AttendanceCheckInType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: number; checkInTime: string } | null>(null);

  const handleCheckIn = async () => {
    if (!memberId) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCheckInResult(result.data);
        if (result.data.canCheckIn) {
          setActiveSession({
            id: parseInt(memberId),
            checkInTime: new Date().toISOString()
          });
          // Auto-clear after 3 seconds
          setTimeout(() => {
            setCheckInResult(null);
            setMemberId('');
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Check-in error:', err);
      // Mock response for testing
      setCheckInResult({
        memberId: parseInt(memberId),
        subscriptionStatus: 'active',
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        canCheckIn: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeSession) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: activeSession.id })
      });

      if (response.ok) {
        setActiveSession(null);
        setCheckInResult(null);
        setMemberId('');
      }
    } catch (err) {
      console.error('Check-out error:', err);
      // Mock response
      setActiveSession(null);
      setCheckInResult(null);
      setMemberId('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 sm:p-8 rounded-t-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold">Gym Check-In</h1>
          <p className="text-blue-100 mt-2">Tablet-Friendly Access Control</p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {!activeSession ? (
            <>
              {/* Check-In Form */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Enter Member ID or Scan Card
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
                    className="flex-1 px-6 py-4 text-2xl border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="000000"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    onClick={handleCheckIn}
                    disabled={isLoading || !memberId}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors text-lg"
                  >
                    {isLoading ? '...' : 'Check In'}
                  </button>
                </div>
              </div>

              {/* Check-In Result */}
              {checkInResult && (
                <div className={`rounded-lg p-6 ${
                  checkInResult.canCheckIn 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : 'bg-red-50 border-2 border-red-500'
                }`}>
                  <div className="flex items-start gap-4">
                    {checkInResult.canCheckIn ? (
                      <CheckCircle size={48} className="text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <AlertCircle size={48} className="text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      {checkInResult.canCheckIn ? (
                        <>
                          <h3 className="text-2xl font-bold text-green-900">Welcome!</h3>
                          <p className="text-green-700 mt-2">You've been checked in successfully</p>
                          <div className="mt-4 text-sm text-green-600">
                            <p>Subscription valid until: {new Date(checkInResult.subscriptionEndDate).toLocaleDateString()}</p>
                            <p>Time: {new Date().toLocaleTimeString()}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold text-red-900">Access Denied</h3>
                          <p className="text-red-700 mt-2">{checkInResult.reason || 'Your subscription has expired'}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Active Session */}
              <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 mb-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Member Checked In</h3>
                <div className="space-y-3 text-lg text-blue-800">
                  <p><strong>Member ID:</strong> {activeSession.id}</p>
                  <p><strong>Check-In Time:</strong> {new Date(activeSession.checkInTime).toLocaleTimeString()}</p>
                  <p><strong>Duration:</strong> {Math.round((Date.now() - new Date(activeSession.checkInTime).getTime()) / 60000)} minutes</p>
                </div>
              </div>

              {/* Check-Out Button */}
              <button
                onClick={handleCheckOut}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors text-lg flex items-center justify-center gap-3"
              >
                <LogOut size={28} />
                {isLoading ? 'Checking Out...' : 'Check Out'}
              </button>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 p-6 sm:p-8 rounded-b-2xl border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900">Current Time</p>
              <p className="text-lg font-bold text-gray-900">{new Date().toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Status</p>
              <p className="text-lg font-bold text-green-600">{activeSession ? 'Checked In' : 'Ready'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Facility</p>
              <p className="text-lg font-bold text-gray-900">Downtown Gym</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
