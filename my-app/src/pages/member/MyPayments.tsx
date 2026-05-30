import { useState, useEffect } from 'react';
import { PageWrapper, Card, Table } from '../../components';
import { getMemberPayments } from '../../services/payments.service';
import '../../styles/payments.css';

export function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        // In real app, use user ID from auth context
        const memberId = 1;
        const response = await getMemberPayments(memberId);
        setPayments(response.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const columns = [
    { key: 'amount', label: 'Amount' },
    { key: 'method', label: 'Method' },
    { key: 'created_at', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <PageWrapper title="My Payment History">
      {error && <div className="error-banner">{error}</div>}
      <Card>
        <Table columns={columns} data={payments} loading={loading} />
      </Card>
    </PageWrapper>
  );
}
