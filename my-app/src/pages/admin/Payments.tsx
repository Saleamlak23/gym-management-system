import { useState, useEffect } from 'react';
import { PageWrapper, Card, Input, Button, Modal, Table } from '../../components';
import { getPayments, recordPayment } from '../../services/payments.service';
import '../../styles/payments.css';

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [method, setMethod] = useState('');
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    method: 'cash',
  });

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const response = await getPayments(startDate || undefined, endDate || undefined, method || undefined);
        setPayments(response.data || []);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [startDate, endDate, method]);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordPayment(formData);
      setShowModal(false);
      setFormData({ member_id: '', amount: '', method: 'cash' });
      const response = await getPayments();
      setPayments(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const columns = [
    { key: 'member_name', label: 'Member' },
    { key: 'amount', label: 'Amount' },
    { key: 'method', label: 'Method' },
    { key: 'created_at', label: 'Date' },
    {
      key: 'id',
      label: 'Actions',
      render: () => (
        <button className="action-link">Print Receipt</button>
      ),
    },
  ];

  return (
    <PageWrapper title="Payments Management">
      {error && <div className="error-banner">{error}</div>}

      <Card>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
            <Input
              label="From Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <Input
              label="To Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="form-select"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
          <Button onClick={() => setShowModal(true)}>Record Payment</Button>
        </div>

        <Table columns={columns} data={payments} loading={loading} />
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={handleSubmitPayment}>
          <Input
            label="Member ID"
            type="number"
            value={formData.member_id}
            onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
            required
          />
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <select
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            className="form-select"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
          <Button type="submit" variant="primary" style={{ width: '100%' }}>Record Payment</Button>
        </form>
      </Modal>
    </PageWrapper>
  );
}
