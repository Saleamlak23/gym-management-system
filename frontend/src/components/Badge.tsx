import type {
  SubscriptionStatus,
  TrainingStatus,
  EquipmentStatus,
} from '@/types'
import './components.css'

type BadgeStatus =
  | SubscriptionStatus
  | TrainingStatus
  | EquipmentStatus
  | string

const DOT: Record<string, string> = {
  active:      '●',
  expired:     '●',
  cancelled:   '●',
  frozen:      '●',
  pending:     '●',
  scheduled:   '●',
  confirmed:   '●',
  completed:   '✓',
  maintenance: '⚙',
  retired:     '○',
}

interface Props {
  status: BadgeStatus
}

export default function Badge({ status }: Props) {
  const key = status.toLowerCase()
  const dot = DOT[key] ?? '●'

  return (
    <span className={`badge badge--${key}`}>
      {dot} {status}
    </span>
  )
}
