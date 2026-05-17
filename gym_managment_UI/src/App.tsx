import { GymApp } from './Frontend/GymApp';
import { Login } from './Frontend/Login';
import { useStore } from './Frontend/store';
import './App.css';

function App() {
  const { isAuthenticated } = useStore();

  return isAuthenticated ? <GymApp /> : <Login />;
}

export default App;
