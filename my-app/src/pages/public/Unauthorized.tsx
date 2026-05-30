import { Link } from 'react-router-dom';
import { Card, Button } from '../../components';
import '../../styles/auth.css';

export function Unauthorized() {
  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page</p>
        </div>

        <div className="auth-footer" style={{ borderTop: 'none', marginTop: '2rem' }}>
          <Link to="/">
            <Button variant="primary" style={{ width: '100%' }}>
              Go Back Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
