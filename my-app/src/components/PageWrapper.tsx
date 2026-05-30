import { type ReactNode } from 'react';
import '../styles/components.css';

interface PageWrapperProps {
  title: string;
  children: ReactNode;
}

export function PageWrapper({ title, children }: PageWrapperProps) {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      <div className="page-content">{children}</div>
    </div>
  );
}
