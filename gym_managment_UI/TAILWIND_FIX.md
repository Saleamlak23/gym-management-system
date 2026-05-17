# Fix: Tailwind CSS PostCSS Configuration Error

## Problem
```
[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. 
The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll 
need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

## Solution

Tailwind CSS v4 moved the PostCSS plugin to a separate package. Follow these steps:

### Step 1: Update Dependencies
I've updated `package.json` to include `@tailwindcss/postcss`. Now run:

```bash
npm install
```

### Step 2: PostCSS Configuration
I've also updated `postcss.config.js` from:

```javascript
// OLD
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}
```

To:

```javascript
// NEW
plugins: {
  '@tailwindcss/postcss': {},
  autoprefixer: {},
}
```

### Step 3: Restart Development Server

```bash
npm run dev
```

## Files Changed

✅ `package.json` - Added `@tailwindcss/postcss` dependency
✅ `postcss.config.js` - Updated plugin reference

## Verification

After running `npm install`, you should see:
- `@tailwindcss/postcss@^4.0.0` in node_modules
- No PostCSS errors when dev server starts
- Tailwind styles applying correctly

---

**If you still see errors**, try:

```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

(On Windows, use `del` instead of `rm` and `rmdir /s node_modules` for the folder)
