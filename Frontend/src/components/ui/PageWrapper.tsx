import React from 'react';

interface PageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ title, description, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-2 text-lg text-slate-600">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};
