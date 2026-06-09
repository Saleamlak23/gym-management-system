import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPayments, getPaymentSummary } from '@/services/payments.service';
import { formatDateTime, formatCurrency } from '@/utils/formatters';
import { getPaymentMethodLabel } from '@/utils/status-helpers';
import { CreditCard, Plus, Search } from 'lucide-react';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [paymentsRes, summaryRes] = await Promise.all([
          getPayments(),
          getPaymentSummary(),
        ]);
        setPayments(paymentsRes.data?.payments || []);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPayments = payments.filter((payment) =>
    payment.member_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <PageWrapper title="Payments">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="Payments & Billing">
      <div className="space-y-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold">
                {summary.by_method?.reduce((acc: number, m: any) => acc + m.transaction_count, 0) || 0}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  summary.total_revenue /
                    (summary.by_method?.reduce((acc: number, m: any) => acc + m.transaction_count, 0) || 1)
                )}
              </p>
            </Card>
          </div>
        )}

        {/* Search and Actions */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments recorded"
            message="Start by recording your first payment."
            actionLabel="Record Payment"
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Member</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{payment.member_name}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="outline">
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDateTime(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};
