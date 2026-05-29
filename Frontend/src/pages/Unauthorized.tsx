import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Access Denied</h1>
        <p className="text-slate-600 mb-8">You don't have permission to access this resource. Please contact your administrator.</p>
        <Link to="/login">
          <Button>Back to Login</Button>
        </Link>
      </div>
    </div>
  );
};
