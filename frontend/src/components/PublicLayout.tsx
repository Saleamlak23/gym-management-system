import { Outlet } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import './components.css'

export default function PublicLayout() {
  return (
    <>
      <ThemeToggle className="theme-toggle--floating" />
      <Outlet />
    </>
  )
}
