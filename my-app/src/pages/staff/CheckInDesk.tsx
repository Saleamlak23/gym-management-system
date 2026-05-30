import { useState } from 'react';
import { Input, Button, Card, Badge } from '../../components';
import { checkIn, checkOut } from '../../services/attendance.service';
import '../../styles/checkin.css';

export function CheckInDesk() {
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage('');
      setMember(null);
      // In a real app, fetch member details from the server
      // For now, create a mock member object
      const mockMembers: Record<string, any> = {
        '1': { id: 1, first_name: 'John', last_name: 'Doe', subscription_status: 'active', expiry_date: '2025-12-31' },
        '2': { id: 2, first_name: 'Jane', last_name: 'Smith', subscription_status: 'expired', expiry_date: '2024-01-31' },
      };
      const foundMember = mockMembers[memberId];
      if (foundMember) {
        setMember(foundMember);
      } else {
        setMessage('Member not found');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Error searching for member');
      setMessageType('error');
    }
  };

  const handleCheckIn = async () => {
    if (!member) return;
    try {
      await checkIn(member.id);
      setMessage(`✓ ${member.first_name} checked in successfully`);
      setMessageType('success');
      setMemberId('');
      setMember(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Check-in failed');
      setMessageType('error');
    }
  };

  const handleCheckOut = async () => {
    if (!member) return;
    try {
      await checkOut(member.id);
      setMessage(`✓ ${member.first_name} checked out successfully`);
      setMessageType('success');
      setMemberId('');
      setMember(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Check-out failed');
      setMessageType('error');
    }
  };

  return (
    <div className="checkin-container">
      <Card className="checkin-card">
        <h1 className="checkin-title">Gym Check-In</h1>

        <form onSubmit={handleSearch} className="checkin-form">
          <Input
            label="Member ID or Name"
            placeholder="Enter member ID..."
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            autoFocus
            className="checkin-input"
          />
          <Button type="submit" className="checkin-button">Search</Button>
        </form>

        {message && (
          <div className={`checkin-message ${messageType}`}>
            {message}
          </div>
        )}

        {member && (
          <div className="member-info">
            <div className="member-avatar">👤</div>
            <h2>{member.first_name} {member.last_name}</h2>
            <Badge status={member.subscription_status}>{member.subscription_status}</Badge>
            <p className="expiry-date">Expires: {member.expiry_date}</p>

            {member.subscription_status === 'active' ? (
              <div className="action-buttons">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckIn}
                  className="checkin-btn"
                >
                  ✓ Check In
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleCheckOut}
                  className="checkout-btn"
                >
                  ✗ Check Out
                </Button>
              </div>
            ) : (
              <div className="access-denied">
                <p>❌ Access Denied</p>
                <p>No active subscription</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
