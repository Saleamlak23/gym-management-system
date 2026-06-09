import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getMemberPayments } from '@/services/payments.service';
import { initiatePayment } from '@/services/chapa.service';
import { formatDateTime, formatCurrency } from '@/utils/formatters';
import { getPaymentMethodLabel } from '@/utils/status-helpers';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus } from 'lucide-react';

export const MyPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await getMemberPayments(user.id);
        setPayments(response.data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user?.id]);

  const handleOnlinePayment = async (typeId: number) => {
    try {
      const response = await initiatePayment(typeId);
      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate payment',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <PageWrapper title="My Payments">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="Payment History">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Payments</h2>
          <Button onClick={() => handleOnlinePayment(1)}>
            <Plus className="h-4 w-4 mr-2" />
            Renew Subscription
          </Button>
        </div>

        {/* Summary */}
        {payments && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-3xl font-bold text-blue-900">
              {formatCurrency(payments.total_spend)}
            </p>
          </Card>
        )}

        {/* Payments List */}
        {payments?.payments?.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            message="Your payment history will appear here."
            actionLabel="Make Payment"
            onAction={() => handleOnlinePayment(1)}
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold">Method</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments?.payments?.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {formatDateTime(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm">
                          View Receipt
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
