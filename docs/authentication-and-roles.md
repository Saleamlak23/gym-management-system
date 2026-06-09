# Authentication & Roles

GymOS uses **JSON Web Tokens (JWT)** for stateless authentication. Passwords are hashed with **bcrypt** (12 salt rounds) before storage.

---

## Login flow

Both members and staff use the same endpoint: `POST /api/auth/login`.

```
1. Client sends { email, password }
2. Server searches members table by email
3. If not found, searches staff table
4. bcrypt.compare() validates password against stored hash
5. Server maps staff role_name → application role
6. JWT signed with payload: { id, email, role, branch_id }
7. Client stores token + user object in sessionStorage
8. Subsequent requests include: Authorization: Bearer <token>
```

### Staff role mapping

Database `staff_roles.role_name` is mapped to JWT `role`:

| Database role | JWT role |
|---|---|
| Enterprise Administrator | `enterprise_admin` |
| Branch Manager | `branch_manager` |
| Personal Trainer | `trainer` |
| Group Instructor | `trainer` |
| Receptionist | `staff` |
| Cleaner | `staff` |

Members always receive role `member` with `branch_id: null`.

---

## JWT payload

```json
{
  "id": 2,
  "email": "admin@gym.com",
  "role": "enterprise_admin",
  "branch_id": null,
  "iat": 1717920000,
  "exp": 1718524800
}
```

| Field | Type | Description |
|---|---|---|
| `id` | number | `member_id` or `staff_id` |
| `email` | string | User email |
| `role` | string | Application role (see below) |
| `branch_id` | number \| null | Staff branch; null for members and enterprise admins |

Token expiry is controlled by `JWT_EXPIRES_IN` (default: `7d`).

---

## User roles

| Role | Description | Scope |
|---|---|---|
| `enterprise_admin` | Full system access | All branches |
| `branch_manager` | Branch operations | Own branch only |
| `trainer` | Training and classes | Own branch + assigned sessions |
| `staff` | Front-desk operations | Own branch |
| `member` | Self-service portal | Own data only |

---

## Frontend role routing

After login, users are redirected based on role:

| Role | Home route |
|---|---|
| `enterprise_admin` | `/admin` |
| `branch_manager` | `/branch` |
| `staff` | `/staff` |
| `trainer` | `/staff` |
| `member` | `/member` |

The `ProtectedRoute` component enforces role requirements on each route. Unauthorized access redirects to `/unauthorized`.

---

## Middleware

### `protect`

Verifies the JWT in the `Authorization` header. Attaches decoded payload to `req.user`. Returns **401** if missing or invalid.

### `authorize(...roles)`

Checks `req.user.role` against allowed roles. Returns **403** if not permitted. Must run after `protect`.

```js
router.get('/', protect, authorize('enterprise_admin', 'branch_manager'), list);
```

### `authorizeSelf(...overrideRoles)`

Allows users to access their own resource (matching URL `:id` param). Override roles (e.g. admin) bypass the self-check.

```js
router.get('/member/:memberId', protect, authorizeSelf('enterprise_admin', 'staff'), listByMember);
```

### `authorizeBranch`

Ensures branch managers only access their own branch data. Enterprise admins bypass this check.

---

## Frontend auth storage

| Key | Storage | Content |
|---|---|---|
| `gymos_auth_token` | sessionStorage | JWT string |
| `gymos_auth_user` | sessionStorage | Serialized user object |

Session storage clears when the browser tab is closed. The Axios interceptor in `services/api.ts` reads the token via `setTokenGetter()` wired from `AuthContext`.

---

## Registration rules

Members self-register via `POST /api/auth/register`:

- Email must be unique
- Password: minimum 8 characters, one uppercase, one number
- Phone required in `+251-XX-XXX-XXXX` format
- New accounts receive role `member` automatically

Staff accounts are created by enterprise admins via `POST /api/staff`.

---

## Security notes

- Never commit `.env` files containing `JWT_SECRET` or database passwords
- Passwords are never returned in API responses
- Invalid login attempts return a generic "Invalid email or password" message
- Expired tokens return **401** with "Session expired. Please log in again."
- CORS is restricted to `CLIENT_URL` — mismatched origins are blocked by the browser

---

## Test accounts

Password for all seed accounts: **`Password@123`**

| Role | Email |
|---|---|
| Enterprise admin | `admin@gym.com` |
| Branch manager | `alem.bekele@gym.com` |
| Trainer | `tigabu.wolde@gym.com` |
| Staff | `yohannes.teklu@gym.com` |
| Member | `abebe.girma@email.com` |

See [Setup Guide — Seed data](./setup.md#seed-data) for the full list.
