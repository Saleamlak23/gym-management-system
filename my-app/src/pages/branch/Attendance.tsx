import { useState } from 'react';
import { PageWrapper, Card, Input, Table } from '../../components';
import '../../styles/attendance.css';

export function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data
  const attendanceRecords = [
    { member_name: 'John Doe', check_in: '6:00 AM', check_out: '7:30 AM', duration: '1h 30m' },
    { member_name: 'Jane Smith', check_in: '6:15 AM', check_out: '7:45 AM', duration: '1h 30m' },
    { member_name: 'Mike Johnson', check_in: '7:00 AM', check_out: '8:30 AM', duration: '1h 30m' },
    { member_name: 'Sarah Williams', check_in: '7:30 AM', check_out: '9:00 AM', duration: '1h 30m' },
    { member_name: 'Tom Brown', check_in: '8:00 AM', check_out: '9:30 AM', duration: '1h 30m' },
  ];

  const columns = [
    { key: 'member_name', label: 'Member' },
    { key: 'check_in', label: 'Check In' },
    { key: 'check_out', label: 'Check Out' },
    { key: 'duration', label: 'Duration' },
  ];

  return (
    <PageWrapper title="Daily Attendance Log">
      <Card>
        <div style={{ marginBottom: '1.5rem' }}>
          <Input
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>
        <Table columns={columns} data={attendanceRecords} />
      </Card>

      {/* Heatmap placeholder */}
      <Card title="Peak Hours Heatmap">
        <div className="heatmap-grid">
          {[...Array(7)].map((_, day) => (
            <div key={`day-${day}`} className="heatmap-column">
              <div className="day-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day]}</div>
              {[...Array(24)].map((_, hour) => (
                <div
                  key={`hour-${hour}`}
                  className="heatmap-cell"
                  style={{
                    opacity: Math.random() * 0.8 + 0.2,
                  }}
                  title={`${hour}:00`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </PageWrapper>
  );
}
