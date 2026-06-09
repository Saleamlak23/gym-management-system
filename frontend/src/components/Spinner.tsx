import './components.css'

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

export default function Spinner({ size = 'md' }: Props) {
  return (
    <span
      className={`spinner spinner--${size}`}
      role="status"
      aria-label="Loading"
    />
  )
}
