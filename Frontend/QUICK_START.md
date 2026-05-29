# TitanSync Frontend - Quick Start

Get the frontend running in 5 minutes.

## Step 1: Prerequisites

Verify you have:
```bash
node -v     # Should be v18 or higher
npm -v      # Should be v9 or higher
```

## Step 2: Install & Configure

```bash
# Install dependencies (already done, but if needed)
npm install

# Create .env file with API URL
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

## Step 3: Start Dev Server

```bash
npm run dev
```

Output:
```
  VITE v5.4.8  ready in 150 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Open http://localhost:5173 in your browser.

## Step 4: Login

**Redirect to login page:**
- URL: http://localhost:5173/login

**Demo credentials:**
- Email: `admin@gym.com`
- Password: `Demo@123`

If you see "API is unreachable", start the backend first.

## Step 5: Explore

After logging in, you can:

1. **View Dashboard** - http://localhost:5173/admin
   - See KPI metrics
   - View branch overview
   
2. **Browse Members** - http://localhost:5173/admin/members
   - Search by name/email
   - Filter by status
   - Click a member to view details

3. **View Member Details** - http://localhost:5173/admin/members/1
   - See profile info
   - View subscription history

## Build for Production

```bash
npm run build
```

Output: `dist/` folder ready to deploy

## Common Commands

```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Check code quality
npm run typecheck   # Check TypeScript types
```

## File Structure at a Glance

```
src/
├── pages/          # Login, Dashboard, Members, etc.
├── components/     # Reusable UI elements
├── services/       # API integration (auth, members)
├── context/        # Global auth state
├── types/          # TypeScript interfaces
├── lib/            # API client setup
└── App.tsx         # Main router
```

## Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 5174
```

### API connection error?
1. Make sure backend is running on `http://localhost:5000`
2. Check `.env` has `VITE_API_URL=http://localhost:5000/api`
3. Check browser DevTools → Network tab for actual requests

### Login fails?
1. Verify backend is running
2. Check credentials: `admin@gym.com` / `Demo@123`
3. Check browser console for error messages

### TypeScript errors?
```bash
npm run typecheck    # See detailed errors
npm run lint         # Check for code issues
```

## Next: Start Backend

In a new terminal:
```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000`

## Useful URLs During Development

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Frontend app |
| http://localhost:5173/login | Login page |
| http://localhost:5173/admin | Dashboard |
| http://localhost:5173/admin/members | Members list |
| http://localhost:5000/api | Backend API |

## Documentation

For more details, see:
- `FRONTEND_README.md` - Complete guide
- `ARCHITECTURE.md` - Design & structure
- `API_INTEGRATION_GUIDE.md` - Backend integration

## Development Workflow

1. **Edit code** → Automatic hot reload
2. **See changes** → Browser updates instantly
3. **Check errors** → TypeScript catches issues
4. **Run tests** → (Ready for tests when needed)
5. **Build** → Production-optimized output

## Tips & Tricks

### React DevTools
Install [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools) browser extension to inspect components and state.

### Network Debugging
Open DevTools → Network tab to see API requests. Check:
- Request URL
- Request headers (Authorization token)
- Response status & data

### Hot Module Reload
Edit code and save - page refreshes automatically. State preserved when possible.

### Type Checking While Coding
TypeScript catches errors before runtime. Hover over code for type hints.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S or Cmd+S | Save file (auto-formats) |
| Ctrl+Shift+P | Open VSCode command palette |
| Ctrl+` | Open terminal in VSCode |
| F12 | Open browser DevTools |
| Ctrl+Shift+I | Inspect element |

## Ready? Let's Go!

1. ✓ Dependencies installed
2. ✓ Frontend code ready  
3. ✓ Backend running
4. ✓ Login working
5. ✓ Dashboard visible

**You're all set!**

Questions? See the docs in this folder or check browser console for error messages.

Happy coding!
