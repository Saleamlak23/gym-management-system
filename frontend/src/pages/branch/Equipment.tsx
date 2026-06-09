import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Table, Button, Input, Modal, Spinner, StatCard } from '@/components'
import type { Column } from '@/components'
import {
  getEquipment,
  addEquipment,
  updateEquipmentStatus,
  getMaintenanceHistory,
  logMaintenance,
} from '@/services/equipment.service'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { validateRequired, validatePositiveNumber, validateForm, isValid } from '@/utils/validators'
import type { Equipment, EquipmentStatus, MaintenanceLog } from '@/types'

const STATUS_OPTIONS: EquipmentStatus[] = ['active', 'maintenance', 'retired']

// ── Add equipment form ────────────────────────────────────

interface AddForm {
  model_number: string
  name: string
  category_id: string
  purchase_date: string
}

interface AddErrors {
  model_number?: string
  name?: string
  category_id?: string
  purchase_date?: string
}

// ── Log maintenance form ──────────────────────────────────

interface LogForm {
  service_date: string
  description: string
  cost: string
}

interface LogErrors {
  service_date?: string
  description?: string
  cost?: string
}

// ── Main page ─────────────────────────────────────────────

export default function Equipment() {
  const { user }  = useAuth()
  const branchId  = user?.branch_id ?? 1

  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Add modal
  const [addModal,    setAddModal]    = useState(false)
  const [addForm,     setAddForm]     = useState<AddForm>({ model_number: '', name: '', category_id: '', purchase_date: '' })
  const [addErrors,   setAddErrors]   = useState<AddErrors>({})
  const [addApiError, setAddApiError] = useState('')
  const [addSaving,   setAddSaving]   = useState(false)

  // Maintenance modal
  const [maintModal,    setMaintModal]    = useState(false)
  const [maintItem,     setMaintItem]     = useState<Equipment | null>(null)
  const [maintHistory,  setMaintHistory]  = useState<MaintenanceLog[]>([])
  const [maintLoading,  setMaintLoading]  = useState(false)
  const [logForm,       setLogForm]       = useState<LogForm>({ service_date: '', description: '', cost: '' })
  const [logErrors,     setLogErrors]     = useState<LogErrors>({})
  const [logApiError,   setLogApiError]   = useState('')
  const [logSaving,     setLogSaving]     = useState(false)

  const fetchEquipment = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getEquipment({
        branch_id: branchId,
        status: statusFilter !== 'all' ? (statusFilter as EquipmentStatus) : undefined,
      })
      setEquipment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }, [branchId, statusFilter])

  useEffect(() => { fetchEquipment() }, [fetchEquipment])

  // ── Status quick-update ────────────────────────────────
  const handleStatusChange = async (id: number, status: EquipmentStatus) => {
    try {
      const updated = await updateEquipmentStatus(id, { status })
      setEquipment((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed')
    }
  }

  // ── Add equipment ──────────────────────────────────────
  const handleAdd = async () => {
    const errs: AddErrors = validateForm(
      { model_number: addForm.model_number, name: addForm.name, category_id: addForm.category_id, purchase_date: addForm.purchase_date },
      { model_number: validateRequired, name: validateRequired, category_id: validateRequired, purchase_date: validateRequired },
    )
    if (!isValid(errs)) { setAddErrors(errs); return }

    setAddSaving(true)
    setAddApiError('')
    try {
      await addEquipment({
        model_number:  addForm.model_number.trim(),
        name:          addForm.name.trim(),
        category_id:   Number(addForm.category_id),
        branch_id:     branchId,
        purchase_date: addForm.purchase_date,
      })
      await fetchEquipment()
      setAddModal(false)
      setAddForm({ model_number: '', name: '', category_id: '', purchase_date: '' })
    } catch (err) {
      setAddApiError(err instanceof Error ? err.message : 'Failed to add equipment')
    } finally {
      setAddSaving(false)
    }
  }

  // ── Open maintenance modal ─────────────────────────────
  const openMaintenance = async (item: Equipment) => {
    setMaintItem(item)
    setMaintModal(true)
    setMaintLoading(true)
    try {
      const history = await getMaintenanceHistory(item.id)
      setMaintHistory(history)
    } finally {
      setMaintLoading(false)
    }
  }

  // ── Log maintenance ────────────────────────────────────
  const handleLog = async () => {
    if (!maintItem) return
    const errs: LogErrors = validateForm(
      { service_date: logForm.service_date, description: logForm.description, cost: logForm.cost },
      { service_date: validateRequired, description: validateRequired, cost: validatePositiveNumber },
    )
    if (!isValid(errs)) { setLogErrors(errs); return }

    setLogSaving(true)
    setLogApiError('')
    try {
      await logMaintenance(maintItem.id, {
        service_date: logForm.service_date,
        description:  logForm.description,
        cost:         Number(logForm.cost),
      })
      const history = await getMaintenanceHistory(maintItem.id)
      setMaintHistory(history)
      await fetchEquipment()
      setLogForm({ service_date: '', description: '', cost: '' })
    } catch (err) {
      setLogApiError(err instanceof Error ? err.message : 'Failed to log maintenance')
    } finally {
      setLogSaving(false)
    }
  }

  // ── Derived stats ──────────────────────────────────────
  const activeCount      = equipment.filter((e) => e.status === 'active').length
  const maintenanceCount = equipment.filter((e) => e.status === 'maintenance').length
  const retiredCount     = equipment.filter((e) => e.status === 'retired').length

  // ── Columns ────────────────────────────────────────────
  const columns: Column<Equipment>[] = [
    {
      key: 'name',
      label: 'Equipment',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v as string}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {row.model_number}
          </div>
        </div>
      ),
    },
    {
      key: 'category_name',
      label: 'Category',
      render: (v) => (v as string) || '—',
    },
    {
      key: 'purchase_date',
      label: 'Purchased',
      render: (v) => formatDate(v as string),
    },
    {
      key: 'last_serviced_date',
      label: 'Last Service',
      render: (v) => {
        if (!v) return <span style={{ color: 'var(--danger)' }}>Never</span>
        const days = Math.floor((Date.now() - new Date(v as string).getTime()) / 86_400_000)
        return (
          <span className="mono" style={{ color: days > 90 ? 'var(--danger)' : 'var(--text-1)' }}>
            {formatDate(v as string)}
            {days > 90 && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--danger)' }}>overdue</span>}
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => (
        <select
          className="input-field"
          style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }}
          value={v as string}
          onChange={(e) => handleStatusChange(row.id!, e.target.value as EquipmentStatus)}
          aria-label={`Status for ${row.name}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'id',
      label: '',
      sortable: false,
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={() => openMaintenance(row)}>
          Maintenance →
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Equipment"
      subtitle={`${equipment.length} item${equipment.length !== 1 ? 's' : ''}`}
      actions={
        <Button variant="neon" size="sm" onClick={() => setAddModal(true)}>
          + Add Equipment
        </Button>
      }
    >
      {error && <div className="alert alert--danger">{error}</div>}

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <StatCard label="Active"      value={activeCount}      icon="◉" />
        <StatCard label="Maintenance" value={maintenanceCount} icon="⚙" trendDir={maintenanceCount > 0 ? 'down' : 'up'} />
        <StatCard label="Retired"     value={retiredCount}     icon="○" />
      </div>

      <Card>
        {/* Filters */}
        <div className="filters-bar">
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={fetchEquipment}>Refresh</Button>
        </div>

        <Table
          columns={columns}
          data={equipment}
          loading={loading}
          emptyMessage="No equipment found"
        />
      </Card>

      {/* Add Equipment Modal */}
      <Modal
        open={addModal}
        onClose={() => { setAddModal(false); setAddApiError('') }}
        title="Add Equipment"
      >
        {addApiError && <div className="alert alert--danger">{addApiError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-grid">
            <Input label="Name" value={addForm.name}
              onChange={(e) => { setAddForm((f) => ({ ...f, name: e.target.value })); setAddErrors((er) => ({ ...er, name: undefined })) }}
              error={addErrors.name} required />
            <Input label="Model Number" value={addForm.model_number}
              onChange={(e) => { setAddForm((f) => ({ ...f, model_number: e.target.value })); setAddErrors((er) => ({ ...er, model_number: undefined })) }}
              error={addErrors.model_number} required />
          </div>
          <div className="form-grid">
            <div className="input-wrap">
              <label className="input-label" htmlFor="cat-select">Category <span className="input-required">*</span></label>
              <select id="cat-select"
                className={`input-field${addErrors.category_id ? ' input-field--error' : ''}`}
                value={addForm.category_id}
                onChange={(e) => { setAddForm((f) => ({ ...f, category_id: e.target.value })); setAddErrors((er) => ({ ...er, category_id: undefined })) }}>
                <option value="">Select…</option>
                <option value="1">Cardio</option>
                <option value="2">Strength</option>
                <option value="3">Flexibility</option>
                <option value="4">Free Weights</option>
              </select>
              {addErrors.category_id && <span className="input-error">⚠ {addErrors.category_id}</span>}
            </div>
            <Input label="Purchase Date" type="date" value={addForm.purchase_date}
              onChange={(e) => { setAddForm((f) => ({ ...f, purchase_date: e.target.value })); setAddErrors((er) => ({ ...er, purchase_date: undefined })) }}
              error={addErrors.purchase_date} required />
          </div>
          <Button variant="neon" size="lg" loading={addSaving} onClick={handleAdd} style={{ width: '100%' }}>
            Add Equipment
          </Button>
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        open={maintModal}
        onClose={() => { setMaintModal(false); setLogApiError(''); setLogErrors({}) }}
        title={`Maintenance — ${maintItem?.name ?? ''}`}
      >
        {/* Log new entry */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-2)', marginBottom: 12 }}>
            Log Service Event
          </div>
          {logApiError && <div className="alert alert--danger">{logApiError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-grid">
              <Input label="Service Date" type="date" value={logForm.service_date}
                onChange={(e) => { setLogForm((f) => ({ ...f, service_date: e.target.value })); setLogErrors((er) => ({ ...er, service_date: undefined })) }}
                error={logErrors.service_date} required />
              <Input label="Cost (USD)" type="number" min="0" step="0.01" value={logForm.cost}
                onChange={(e) => { setLogForm((f) => ({ ...f, cost: e.target.value })); setLogErrors((er) => ({ ...er, cost: undefined })) }}
                error={logErrors.cost} required />
            </div>
            <Input label="Description" value={logForm.description} placeholder="Describe the service performed…"
              onChange={(e) => { setLogForm((f) => ({ ...f, description: e.target.value })); setLogErrors((er) => ({ ...er, description: undefined })) }}
              error={logErrors.description} required />
            <Button variant="neon" size="md" loading={logSaving} onClick={handleLog}>
              Log Service
            </Button>
          </div>
        </div>

        {/* History */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-2)', marginBottom: 12 }}>
            Service History
          </div>
          {maintLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}><Spinner size="sm" /></div>
          ) : maintHistory.length ? (
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Description</th><th>Cost</th></tr>
              </thead>
              <tbody>
                {maintHistory.map((log) => (
                  <tr key={log.id}>
                    <td className="mono" style={{ fontSize: 12 }}>{formatDate(log.service_date)}</td>
                    <td style={{ fontSize: 13 }}>{log.description}</td>
                    <td className="mono">{formatCurrency(log.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>No service history recorded.</p>
          )}
        </div>
      </Modal>
    </PageWrapper>
  )
}
