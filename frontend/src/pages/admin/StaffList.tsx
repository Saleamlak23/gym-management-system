import { useEffect, useCallback, useState } from 'react'
import { PageWrapper, Card, Table, Badge, Button, Input, Modal } from '@/components'
import type { Column } from '@/components'
import {
  getStaff,
  createStaff,
  getRoles,
} from '@/services/staff.service'
import { validateEmail, validatePassword, validateRequired, validateForm, isValid } from '@/utils/validators'
import type { Staff, StaffRole } from '@/types'

interface StaffForm {
  first_name: string
  last_name: string
  email: string
  password: string
  role_id: string
  branch_id: string
}

interface StaffFormErrors {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  role_id?: string
  branch_id?: string
}

export default function StaffList() {
  const [staff,   setStaff]   = useState<Staff[]>([])
  const [roles,   setRoles]   = useState<StaffRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Filters
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [debounced,  setDebounced]  = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Modal
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState<StaffForm>({
    first_name: '', last_name: '', email: '',
    password: '', role_id: '', branch_id: '',
  })
  const [formErrors, setFormErrors] = useState<StaffFormErrors>({})
  const [apiError,   setApiError]   = useState('')
  const [saving,     setSaving]     = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const roleId = roleFilter !== 'all' ? Number(roleFilter) : undefined
      const [s, r] = await Promise.all([
        getStaff({
          search:  debounced  || undefined,
          role_id: Number.isInteger(roleId) ? roleId : undefined,
        }),
        getRoles(),
      ])
      setStaff(s)
      setRoles(r)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [debounced, roleFilter])

  useEffect(() => { fetchAll() }, [fetchAll])

  const setField =
    (field: keyof StaffForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setFormErrors((er) => ({ ...er, [field]: undefined }))
    }

  const handleCreate = async () => {
    const errs: StaffFormErrors = validateForm(
      {
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        password:   form.password,
        role_id:    form.role_id,
        branch_id:  form.branch_id,
      },
      {
        first_name: validateRequired,
        last_name:  validateRequired,
        email:      validateEmail,
        password:   validatePassword,
        role_id:    validateRequired,
        branch_id:  validateRequired,
      },
    )
    if (!isValid(errs)) { setFormErrors(errs); return }

    setSaving(true)
    setApiError('')
    try {
      await createStaff({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        password:   form.password,
        role_id:    Number(form.role_id),
        branch_id:  Number(form.branch_id),
      })
      await fetchAll()
      setModal(false)
      setForm({ first_name: '', last_name: '', email: '', password: '', role_id: '', branch_id: '' })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create staff member')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Staff>[] = [
    {
      key: 'first_name',
      label: 'Name',
      render: (_, row) => (
        <span style={{ fontWeight: 600 }}>
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (v) => (
        <span className="mono" style={{ fontSize: 12 }}>{v as string}</span>
      ),
    },
    {
      key: 'role_name',
      label: 'Role',
      render: (v) => v ? <Badge status={v as string} /> : '—',
    },
    {
      key: 'branch_name',
      label: 'Branch',
      render: (v) => (v as string) || '—',
    },
  ]

  return (
    <PageWrapper
      title="Staff"
      subtitle={`${staff.length} staff member${staff.length !== 1 ? 's' : ''}`}
      actions={
        <Button variant="neon" size="sm" onClick={() => setModal(true)}>
          + Add Staff
        </Button>
      }
    >
      {error && <div className="alert alert--danger">{error}</div>}

      <Card>
        {/* Filters */}
        <div className="filters-bar">
          <div style={{ flex: 1, maxWidth: 300 }}>
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search staff"
            />
          </div>
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.role_name}</option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={fetchAll}>
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          data={staff}
          loading={loading}
          emptyMessage="No staff members found"
        />
      </Card>

      {/* Add Staff Modal */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setApiError('') }}
        title="Add Staff Member"
      >
        {apiError && <div className="alert alert--danger">{apiError}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-grid">
            <Input
              label="First Name"
              value={form.first_name}
              onChange={setField('first_name')}
              error={formErrors.first_name}
              autoComplete="given-name"
              required
            />
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={setField('last_name')}
              error={formErrors.last_name}
              autoComplete="family-name"
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={formErrors.email}
            autoComplete="email"
            required
          />

          <Input
            label="Temporary Password"
            type="password"
            value={form.password}
            onChange={setField('password')}
            error={formErrors.password}
            autoComplete="new-password"
            required
          />

          <div className="form-grid">
            <div className="input-wrap">
              <label className="input-label" htmlFor="role-select">
                Role <span className="input-required">*</span>
              </label>
              <select
                id="role-select"
                className={`input-field${formErrors.role_id ? ' input-field--error' : ''}`}
                value={form.role_id}
                onChange={setField('role_id')}
              >
                <option value="">Select role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.role_name}</option>
                ))}
              </select>
              {formErrors.role_id && (
                <span className="input-error">⚠ {formErrors.role_id}</span>
              )}
            </div>

            <div className="input-wrap">
              <label className="input-label" htmlFor="branch-select">
                Branch <span className="input-required">*</span>
              </label>
              <select
                id="branch-select"
                className={`input-field${formErrors.branch_id ? ' input-field--error' : ''}`}
                value={form.branch_id}
                onChange={setField('branch_id')}
              >
                <option value="">Select branch…</option>
                <option value="1">Main Branch</option>
                <option value="2">North Branch</option>
                <option value="3">South Branch</option>
              </select>
              {formErrors.branch_id && (
                <span className="input-error">⚠ {formErrors.branch_id}</span>
              )}
            </div>
          </div>

          <Button
            variant="neon"
            size="lg"
            loading={saving}
            onClick={handleCreate}
            style={{ width: '100%' }}
          >
            Add Staff Member
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
