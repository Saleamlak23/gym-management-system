import { useAuth } from './AuthContext'

function App() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="App">
      <header>
        <h1>Gym Management System</h1>
        {isAuthenticated && <p>Welcome, {user?.name}</p>}
      </header>
      <main>
        {/* Your app content goes here */}
      </main>
    </div>
  )
}

export default App
