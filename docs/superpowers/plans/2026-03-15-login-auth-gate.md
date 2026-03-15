# Login Auth Gate Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a PBKDF2 client-side auth gate to all HTML pages, protecting them behind a login screen on GitHub Pages.

**Architecture:** A `login.html` entry page computes PBKDF2 of submitted credentials and compares against hashes in `auth-config.js`. Every protected page checks `sessionStorage` for a valid token on load; missing/mismatched token redirects to `login.html`. A Node.js script generates `auth-config.js` from a gitignored `.env` file.

**Tech Stack:** Vanilla HTML/CSS/JS, browser `crypto.subtle` (PBKDF2), Node.js 18+ `crypto` module (no npm dependencies), GitHub Pages static hosting.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `scripts/generate-auth.js` | Create | Reads `.env`, computes SHA-256 + PBKDF2 hashes, writes `auth-config.js` |
| `auth-config.js` | Create (generated) | `window.AUTH_CONFIG = { userHash, passHash, salt }` — safe to commit, hash only |
| `.env` | Create (gitignored) | Plaintext credentials — never committed |
| `.env.example` | Create | Template with placeholder values — safe to commit |
| `.gitignore` | Create | Ignores `.env` and any future secrets |
| `package.json` (root) | Create | Adds `generate-auth` npm script |
| `login.html` | Create | Full login page matching design system |
| `index.html` | Modify | Inject auth check after `<body>`, add logout button |
| `presentation.html` | Modify | Same |
| `presentation-201.html` | Modify | Same |
| `presentation-301.html` | Modify | Same |
| `presentation-startup.html` | Modify | Same |
| `presentation-rnd.html` | Modify | Same |
| `International_Tax_Planning_Guide.html` | Modify | Same |
| `viewer.html` | Modify | Same |
| `dashboard/out/*.html` (8 files) | Modify | Auth check with `../../` prefix |
| `dashboard/out/countries/*.html` (6 files) | Modify | Auth check with `../../../` prefix |
| `dashboard/out/` stale dirs | Delete | Remove `cases 2/3`, `compare 2/3`, `countries 2/3`, `deductions 2/3`, `investors 2/3`, `pipeline 2/3`, `rnd 2/3`, `treaty 2/3`, `_next 3`, `_not-found 2/3` |

---

## Chunk 1: Foundation — generate-auth.js, credentials, .gitignore, package.json

### Task 1: Create `.gitignore`

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore` at repo root**

```
# Auth secrets — never commit plaintext credentials
.env

# Generated auth config — commit this (hash only, no plaintext)
# auth-config.js is intentionally NOT gitignored

# macOS
.DS_Store

# Editor
.vscode/
```

Save to `/Users/evintleovonzko/Documents/Works/Kolosal/tax-planning/.gitignore`

- [ ] **Step 2: Verify**

Run: `cat .gitignore`
Expected: file exists with `.env` listed

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore with .env exclusion"
```

---

### Task 2: Create `.env.example` and root `package.json`

**Files:**
- Create: `.env.example`
- Create: `package.json`

- [ ] **Step 1: Create `.env.example`**

```
# Kolosal Tax Planning — Auth Configuration
# Copy this file to .env and fill in real values
# NEVER commit .env to git

AUTH_USER=ops@example.com
AUTH_PASSWORD=your-strong-password-here
AUTH_SALT=generate-a-random-hex-string-here
```

Save to `/Users/evintleovonzko/Documents/Works/Kolosal/tax-planning/.env.example`

- [ ] **Step 2: Create root `package.json`**

```json
{
  "name": "kolosal-tax-planning",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "generate-auth": "node scripts/generate-auth.js"
  }
}
```

Save to `/Users/evintleovonzko/Documents/Works/Kolosal/tax-planning/package.json`

- [ ] **Step 3: Commit**

```bash
git add .env.example package.json
git commit -m "chore: add .env.example and root package.json with generate-auth script"
```

---

### Task 3: Create `scripts/generate-auth.js`

**Files:**
- Create: `scripts/generate-auth.js`

- [ ] **Step 1: Create scripts directory and generate-auth.js**

```javascript
#!/usr/bin/env node
/**
 * scripts/generate-auth.js
 *
 * Reads AUTH_USER, AUTH_PASSWORD, AUTH_SALT from .env
 * Computes SHA-256(user) and PBKDF2(password, salt, 310000) hashes
 * Writes window.AUTH_CONFIG to auth-config.js at repo root
 *
 * Usage: node scripts/generate-auth.js
 * Runtime: Node.js >= 18 (uses built-in crypto — no npm install needed)
 */

const { createHash, pbkdf2 } = require('crypto');
const fs = require('fs');
const path = require('path');

// ── Load .env ────────────────────────────────────────────────────────────────

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env not found. Copy .env.example to .env and fill in values.');
  process.exit(1);
}

const envVars = {};
fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    envVars[key] = value;
  });

const { AUTH_USER, AUTH_PASSWORD, AUTH_SALT } = envVars;

if (!AUTH_USER || !AUTH_PASSWORD || !AUTH_SALT) {
  console.error('Error: .env must contain AUTH_USER, AUTH_PASSWORD, and AUTH_SALT.');
  console.error('Generate a salt with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// ── Compute hashes ───────────────────────────────────────────────────────────

// SHA-256 of username
const userHash = createHash('sha256').update(AUTH_USER, 'utf8').digest('hex');

// PBKDF2 of password: SHA-256, 310,000 iterations, 32-byte key
// IMPORTANT: AUTH_SALT is a hex string — must decode to raw bytes before use.
// Both Node and browser must treat salt as the same raw bytes, not ASCII chars.
const saltBuffer = Buffer.from(AUTH_SALT, 'hex');
pbkdf2(AUTH_PASSWORD, saltBuffer, 310000, 32, 'sha256', (err, derivedKey) => {
  if (err) {
    console.error('Error computing PBKDF2:', err.message);
    process.exit(1);
  }

  const passHash = derivedKey.toString('hex');

  // ── Write auth-config.js ───────────────────────────────────────────────────

  const outputPath = path.join(__dirname, '..', 'auth-config.js');
  const content = `// Auto-generated by scripts/generate-auth.js — DO NOT edit manually
// Contains only hashes. Plaintext credentials are in .env (gitignored).
window.AUTH_CONFIG = {
  userHash: "${userHash}",
  passHash: "${passHash}",
  salt: "${AUTH_SALT}"
};
`;

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log('✓ auth-config.js written successfully');
  console.log(`  User hash:  ${userHash.slice(0, 16)}...`);
  console.log(`  Pass hash:  ${passHash.slice(0, 16)}...`);
  console.log(`  Salt:       ${AUTH_SALT.slice(0, 16)}...`);
});
```

Save to `/Users/evintleovonzko/Documents/Works/Kolosal/tax-planning/scripts/generate-auth.js`

- [ ] **Step 2: Verify the script has no syntax errors**

Run: `node --check scripts/generate-auth.js`
Expected: no output (clean parse)

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-auth.js
git commit -m "feat: add generate-auth.js script for PBKDF2 hash generation"
```

---

### Task 4: Create `.env`, run the script, commit `auth-config.js`

**Files:**
- Create: `.env` (gitignored — do NOT commit)
- Create: `auth-config.js` (generated — DO commit)

- [ ] **Step 1: Generate a random AUTH_SALT**

Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Copy the output — you'll use it as AUTH_SALT in the next step.

- [ ] **Step 2: Create `.env` with real credentials**

```
AUTH_USER=ops@kolosal.ai
AUTH_PASSWORD=koLosAl!0perationaL
AUTH_SALT=<paste the hex string from step 1>
```

Save to `/Users/evintleovonzko/Documents/Works/Kolosal/tax-planning/.env`

**Do NOT commit this file.** It is gitignored.

- [ ] **Step 3: Run the generator**

Run: `node scripts/generate-auth.js`

Expected output:
```
✓ auth-config.js written successfully
  User hash:  <16 hex chars>...
  Pass hash:  <16 hex chars>...
  Salt:       <16 hex chars>...
```

- [ ] **Step 4: Verify `auth-config.js` was written**

Run: `cat auth-config.js`

Expected: file starts with `// Auto-generated` and contains `window.AUTH_CONFIG = {`

- [ ] **Step 5: Verify `.env` is NOT tracked by git**

Run: `git status`

Expected: `.env` should NOT appear in the output. `auth-config.js` should appear as untracked.

- [ ] **Step 6: Commit `auth-config.js` only**

```bash
git add auth-config.js
git commit -m "feat: add auth-config.js with PBKDF2 credentials hash"
```

---

## Chunk 2: login.html

### Task 5: Create `login.html`

**Files:**
- Create: `login.html`

This is a self-contained HTML file. It must:
- Load `auth-config.js` (relative, same directory)
- On submit: compute SHA-256(email) and PBKDF2(password) using `crypto.subtle`
- Compare against `AUTH_CONFIG.userHash` and `AUTH_CONFIG.passHash`
- On success: `sessionStorage.setItem('kolosal_auth', AUTH_CONFIG.passHash)` → `location.replace('index.html')`
- On failure: show "Invalid credentials" error + shake animation
- Match the design system: Inter font, CSS variables

- [ ] **Step 1: Create `login.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign In — Kolosal Tax Advisory</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #FFFFFF;
    --fg: #0D0E0F;
    --border: #E4E7E9;
    --muted: #6A6F73;
    --light: #F1F3F4;
    --medium: #DDE1E3;
    --accent: #0052C4;
    --accent-light: #F0F6FE;
    --accent-mid: #0066F5;
    --red: #CC2727;
    --red-light: #FFF3F3;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 2px 8px rgba(0,0,0,0.06);
    --shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
    --sans: 'Inter', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: var(--sans);
    background: var(--light);
    color: var(--fg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    padding: 40px;
    width: 100%;
    max-width: 400px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    background: var(--accent);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .logo-mark svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: white;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--fg);
  }

  .logo-text span {
    color: var(--muted);
    font-weight: 400;
  }

  h1 {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: var(--fg);
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 28px;
  }

  .field {
    margin-bottom: 16px;
  }

  label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg);
    margin-bottom: 6px;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--sans);
    font-size: 14px;
    color: var(--fg);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 82, 196, 0.12);
  }

  input.error {
    border-color: var(--red);
    background: var(--red-light);
  }

  input.error:focus {
    box-shadow: 0 0 0 3px rgba(204, 39, 39, 0.12);
  }

  .error-msg {
    font-size: 12px;
    color: var(--red);
    margin-top: 12px;
    display: none;
    align-items: center;
    gap: 6px;
  }

  .error-msg.visible {
    display: flex;
  }

  .btn {
    width: 100%;
    padding: 11px 16px;
    margin-top: 24px;
    font-family: var(--sans);
    font-size: 14px;
    font-weight: 700;
    color: white;
    background: var(--accent);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
  }

  .btn:hover:not(:disabled) { background: var(--accent-mid); }
  .btn:active:not(:disabled) { transform: scale(0.99); }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: none;
  }

  .btn.loading .spinner { display: block; }
  .btn.loading .btn-text { display: none; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  .card.shake {
    animation: shake 0.4s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (max-width: 480px) {
    .card { padding: 28px 20px; }
    h1 { font-size: 20px; }
  }
</style>
</head>
<body>
<script src="auth-config.js"></script>
<script>
  // If already authenticated, skip login
  if (window.AUTH_CONFIG && sessionStorage.getItem('kolosal_auth') === window.AUTH_CONFIG.passHash) {
    location.replace('index.html');
  }
</script>

<div class="card" id="card">
  <div class="logo">
    <div class="logo-mark">
      <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
    </div>
    <div class="logo-text">Kolosal <span>Tax Advisory</span></div>
  </div>

  <h1>Sign in</h1>
  <p class="subtitle">Access the Kolosal Tax Planning resource hub.</p>

  <form id="form" novalidate>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" autocomplete="email" placeholder="ops@kolosal.ai" required>
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" autocomplete="current-password" required>
    </div>

    <div class="error-msg" id="errorMsg">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      Invalid credentials. Please try again.
    </div>

    <button type="submit" class="btn" id="submitBtn">
      <span class="btn-text">Sign in</span>
      <div class="spinner"></div>
    </button>
  </form>
</div>

<script>
(function () {
  const form = document.getElementById('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submitBtn');
  const errorMsg = document.getElementById('errorMsg');
  const card = document.getElementById('card');

  function hexFromBuffer(buf) {
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function sha256Hex(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return hexFromBuffer(buf);
  }

  async function pbkdf2Hex(password, saltHex, iterations) {
    const passKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const saltBuf = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const derivedBuf = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuf, iterations },
      passKey,
      256  // 32 bytes = 256 bits
    );
    return hexFromBuffer(derivedBuf);
  }

  function showError() {
    emailInput.classList.add('error');
    passwordInput.classList.add('error');
    errorMsg.classList.add('visible');
    card.classList.remove('shake');
    // Force reflow to restart animation
    void card.offsetWidth;
    card.classList.add('shake');
  }

  function clearError() {
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    errorMsg.classList.remove('visible');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();

    if (!window.AUTH_CONFIG) {
      showError();
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError();
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      const userHash = await sha256Hex(email);
      const passHash = await pbkdf2Hex(password, window.AUTH_CONFIG.salt, 310000);

      if (userHash === window.AUTH_CONFIG.userHash && passHash === window.AUTH_CONFIG.passHash) {
        sessionStorage.setItem('kolosal_auth', passHash);
        location.replace('index.html');
      } else {
        showError();
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
      }
    } catch (err) {
      showError();
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

  // Clear error state when user starts typing
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', clearError);
  });
})();
</script>
</body>
</html>
```

Save to `/Users/evintleovonzko/Documents/Works/Kolosal/tax-planning/login.html`

- [ ] **Step 2: Verify the file was created**

Run: `wc -l login.html`
Expected: ~180+ lines

- [ ] **Step 3: Open in browser and verify visually (optional but recommended)**

Open `login.html` in a browser. Should see: Kolosal logo, "Sign in" heading, email + password fields, blue submit button.

- [ ] **Step 4: Commit**

```bash
git add login.html
git commit -m "feat: add login.html with PBKDF2 auth gate and design system styling"
```

---

## Chunk 3: Auth Check — Root HTML Files

### Task 6: Inject auth check into root-level HTML files

**Files to modify:**
- `index.html`
- `presentation.html`
- `presentation-201.html`
- `presentation-301.html`
- `presentation-startup.html`
- `presentation-rnd.html`
- `International_Tax_Planning_Guide.html`
- `viewer.html`

The auth check snippet (same for all root-level pages):
```html
<script src="auth-config.js"></script>
<script>
  if (!window.AUTH_CONFIG || sessionStorage.getItem('kolosal_auth') !== window.AUTH_CONFIG.passHash) {
    location.replace('login.html');
  }
</script>
```

Place it immediately after the opening `<body>` tag.

The logout button (add to each page's existing UI — top-right corner or nav area):
```html
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('login.html')" style="position:fixed;top:12px;right:16px;z-index:9999;padding:5px 12px;font-family:inherit;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#fff;color:#6A6F73;border:1px solid #E4E7E9;border-radius:6px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04);" onmouseover="this.style.color='#0D0E0F'" onmouseout="this.style.color='#6A6F73'">Sign out</button>
```

Place the logout button inside `<body>` after the auth check.

- [ ] **Step 1: Inject into `index.html`**

Find the `<body>` tag in `index.html` (it's around line 509). Insert the auth check + logout button immediately after `<body>`.

Use the Edit tool with:
- old_string: `<body>`
- new_string:
```html
<body>
<script src="auth-config.js"></script>
<script>
  if (!window.AUTH_CONFIG || sessionStorage.getItem('kolosal_auth') !== window.AUTH_CONFIG.passHash) {
    location.replace('login.html');
  }
</script>
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('login.html')" style="position:fixed;top:12px;right:16px;z-index:9999;padding:5px 12px;font-family:inherit;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#fff;color:#6A6F73;border:1px solid #E4E7E9;border-radius:6px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04);" onmouseover="this.style.color='#0D0E0F'" onmouseout="this.style.color='#6A6F73'">Sign out</button>
```

- [ ] **Step 2: Repeat for `presentation.html`** — same auth check + logout button after `<body>`

- [ ] **Step 3: Repeat for `presentation-201.html`**

- [ ] **Step 4: Repeat for `presentation-301.html`**

- [ ] **Step 5: Repeat for `presentation-startup.html`**

- [ ] **Step 6: Repeat for `presentation-rnd.html`**

- [ ] **Step 7: Repeat for `International_Tax_Planning_Guide.html`**

- [ ] **Step 8: Repeat for `viewer.html`**

- [ ] **Step 9: Quick verify — check each file has the auth check**

Run:
```bash
grep -l "kolosal_auth" index.html presentation.html presentation-201.html presentation-301.html presentation-startup.html presentation-rnd.html International_Tax_Planning_Guide.html viewer.html
```
Expected: all 8 filenames printed

- [ ] **Step 10: Commit**

```bash
git add index.html presentation.html presentation-201.html presentation-301.html presentation-startup.html presentation-rnd.html International_Tax_Planning_Guide.html viewer.html
git commit -m "feat: add auth gate to all root-level HTML pages"
```

---

## Chunk 4: Auth Check — Dashboard HTML Files + Stale Dir Cleanup

### Task 7: Delete stale duplicate build directories in `dashboard/out/`

**Files to delete:**
- `dashboard/out/cases 2/`, `dashboard/out/cases 3/`
- `dashboard/out/compare 2/`, `dashboard/out/compare 3/`
- `dashboard/out/countries 2/`, `dashboard/out/countries 3/`
- `dashboard/out/deductions 2/`, `dashboard/out/deductions 3/`
- `dashboard/out/investors 2/`, `dashboard/out/investors 3/`
- `dashboard/out/pipeline 2/`, `dashboard/out/pipeline 3/`
- `dashboard/out/rnd 2/`, `dashboard/out/rnd 3/`
- `dashboard/out/treaty 2/`, `dashboard/out/treaty 3/`
- `dashboard/out/_next 3/`
- `dashboard/out/_not-found 2/`, `dashboard/out/_not-found 3/`

- [ ] **Step 1: Verify the stale dirs are empty (safety check)**

Run:
```bash
find "dashboard/out/cases 2" "dashboard/out/cases 3" "dashboard/out/compare 2" "dashboard/out/compare 3" -type f 2>/dev/null | head -20
```
Expected: no output (directories are empty) — if files appear, investigate before deleting.

- [ ] **Step 2: Delete stale directories**

Run:
```bash
rm -rf \
  "dashboard/out/cases 2" "dashboard/out/cases 3" \
  "dashboard/out/compare 2" "dashboard/out/compare 3" \
  "dashboard/out/countries 2" "dashboard/out/countries 3" \
  "dashboard/out/deductions 2" "dashboard/out/deductions 3" \
  "dashboard/out/investors 2" "dashboard/out/investors 3" \
  "dashboard/out/pipeline 2" "dashboard/out/pipeline 3" \
  "dashboard/out/rnd 2" "dashboard/out/rnd 3" \
  "dashboard/out/treaty 2" "dashboard/out/treaty 3" \
  "dashboard/out/_next 3" \
  "dashboard/out/_not-found 2" "dashboard/out/_not-found 3"
```

- [ ] **Step 3: Verify cleanup**

Run: `find "dashboard/out" -maxdepth 1 -name "* [23]" | wc -l`
Expected: `0`

- [ ] **Step 4: Commit deletion**

```bash
git add -A dashboard/out/
git commit -m "chore: delete stale duplicate build directories from dashboard/out"
```

---

### Task 8: Inject auth check into `dashboard/out/*.html` files

Auth check for dashboard pages (depth `../../`):
```html
<script src="../../auth-config.js"></script>
<script>
  if (!window.AUTH_CONFIG || sessionStorage.getItem('kolosal_auth') !== window.AUTH_CONFIG.passHash) {
    location.replace('../../login.html');
  }
</script>
```

Logout button for dashboard pages:
```html
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('../../login.html')" style="position:fixed;top:12px;right:16px;z-index:9999;padding:5px 12px;font-family:inherit;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#fff;color:#6A6F73;border:1px solid #E4E7E9;border-radius:6px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04);" onmouseover="this.style.color='#0D0E0F'" onmouseout="this.style.color='#6A6F73'">Sign out</button>
```

Files to modify (8 total):
- `dashboard/out/index.html`
- `dashboard/out/cases.html`
- `dashboard/out/compare.html`
- `dashboard/out/deductions.html`
- `dashboard/out/investors.html`
- `dashboard/out/pipeline.html`
- `dashboard/out/rnd.html`
- `dashboard/out/treaty.html`
- `dashboard/out/404.html`
- `dashboard/out/_not-found.html` ← intentionally protected: unauthenticated requests to non-existent routes redirect to login rather than showing a 404. This is correct for a fully locked site.

The dashboard HTML files are generated by Next.js and have a body tag with class attributes. The exact tag in all `dashboard/out/*.html` and `dashboard/out/countries/*.html` files is:

```
<body class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable antialiased">
```

Use this exact string as the old_string in the Edit tool. The class attributes are always the same across all generated pages.

> **Note:** `dashboard/out/index.html` is a large file (200KB+). The Edit tool can still handle it — use the exact body class string as old_string.

- [ ] **Step 1: Confirm the body tag is consistent across dashboard files (safety check)**

Run:
```bash
grep -oh '<body[^>]*>' dashboard/out/index.html dashboard/out/cases.html dashboard/out/countries/AU.html | sort | uniq
```
Expected: a single unique `<body class="...">` line (confirms all files share the same tag format)

- [ ] **Step 2: Inject into `dashboard/out/index.html`**

Use the Edit tool with:
- old_string: `<body class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable antialiased">`
- new_string: same body tag + auth check snippet + logout button (see template below)

Template for dashboard pages — paste as new_string:
```html
<body class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable antialiased">
<script src="../../auth-config.js"></script>
<script>
  if (!window.AUTH_CONFIG || sessionStorage.getItem('kolosal_auth') !== window.AUTH_CONFIG.passHash) {
    location.replace('../../login.html');
  }
</script>
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('../../login.html')" style="position:fixed;top:12px;right:16px;z-index:9999;padding:5px 12px;font-family:inherit;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#fff;color:#6A6F73;border:1px solid #E4E7E9;border-radius:6px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04);" onmouseover="this.style.color='#0D0E0F'" onmouseout="this.style.color='#6A6F73'">Sign out</button>
```

- [ ] **Step 3: Repeat for `dashboard/out/cases.html`**

- [ ] **Step 4: Repeat for `dashboard/out/compare.html`**

- [ ] **Step 5: Repeat for `dashboard/out/deductions.html`**

- [ ] **Step 6: Repeat for `dashboard/out/investors.html`**

- [ ] **Step 7: Repeat for `dashboard/out/pipeline.html`**

- [ ] **Step 8: Repeat for `dashboard/out/rnd.html`**

- [ ] **Step 9: Repeat for `dashboard/out/treaty.html`**

- [ ] **Step 10: Repeat for `dashboard/out/404.html`**

- [ ] **Step 11: Repeat for `dashboard/out/_not-found.html`**

- [ ] **Step 12: Verify all dashboard HTML files have the auth check**

Run:
```bash
grep -l "kolosal_auth" dashboard/out/*.html
```
Expected: all 10 filenames printed

- [ ] **Step 13: Commit**

```bash
git add dashboard/out/*.html
git commit -m "feat: add auth gate to dashboard/out HTML pages"
```

---

### Task 9: Inject auth check into `dashboard/out/countries/*.html` files

Auth check for country pages (depth `../../../`):
```html
<script src="../../../auth-config.js"></script>
<script>
  if (!window.AUTH_CONFIG || sessionStorage.getItem('kolosal_auth') !== window.AUTH_CONFIG.passHash) {
    location.replace('../../../login.html');
  }
</script>
```

Logout button for country pages:
```html
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('../../../login.html')" style="position:fixed;top:12px;right:16px;z-index:9999;padding:5px 12px;font-family:inherit;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#fff;color:#6A6F73;border:1px solid #E4E7E9;border-radius:6px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04);" onmouseover="this.style.color='#0D0E0F'" onmouseout="this.style.color='#6A6F73'">Sign out</button>
```

Files to modify (7 total):
- `dashboard/out/countries/AU.html`
- `dashboard/out/countries/BR.html`
- `dashboard/out/countries/CA.html`
- `dashboard/out/countries/ID.html`
- `dashboard/out/countries/MX.html`
- `dashboard/out/countries/SG.html`
- `dashboard/out/countries/US.html`

Country pages share the same Next.js body tag as dashboard pages:
```
<body class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable antialiased">
```

Template for country pages — use as new_string in Edit tool:
```html
<body class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable antialiased">
<script src="../../../auth-config.js"></script>
<script>
  if (!window.AUTH_CONFIG || sessionStorage.getItem('kolosal_auth') !== window.AUTH_CONFIG.passHash) {
    location.replace('../../../login.html');
  }
</script>
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('../../../login.html')" style="position:fixed;top:12px;right:16px;z-index:9999;padding:5px 12px;font-family:inherit;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:#fff;color:#6A6F73;border:1px solid #E4E7E9;border-radius:6px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.04);" onmouseover="this.style.color='#0D0E0F'" onmouseout="this.style.color='#6A6F73'">Sign out</button>
```

- [ ] **Step 1: Inject into `dashboard/out/countries/AU.html`**

Use the Edit tool with the country pages template above.

- [ ] **Step 2: Repeat for `BR.html`**

- [ ] **Step 3: Repeat for `CA.html`**

- [ ] **Step 4: Repeat for `ID.html`**

- [ ] **Step 5: Repeat for `MX.html`**

- [ ] **Step 6: Repeat for `SG.html`**

- [ ] **Step 7: Repeat for `US.html`**

- [ ] **Step 8: Verify all country pages have auth check**

Run:
```bash
grep -l "kolosal_auth" dashboard/out/countries/*.html
```
Expected: all 7 filenames printed

- [ ] **Step 9: Commit**

```bash
git add dashboard/out/countries/*.html
git commit -m "feat: add auth gate to dashboard country pages"
```

---

## Chunk 5: Final Verification

### Task 10: End-to-end verification checklist

- [ ] **Step 1: Confirm no plaintext credentials in git history**

Run:
```bash
git log --all -p | grep -i "koLosAl" | head -5
```
Expected: no output (password never committed)

- [ ] **Step 2: Confirm `.env` is not tracked**

Run: `git ls-files .env`
Expected: no output

- [ ] **Step 3: Confirm `auth-config.js` IS tracked**

Run: `git ls-files auth-config.js`
Expected: `auth-config.js`

- [ ] **Step 4: Confirm all root HTML files have auth check**

Run:
```bash
for f in index.html presentation.html presentation-201.html presentation-301.html presentation-startup.html presentation-rnd.html International_Tax_Planning_Guide.html viewer.html login.html; do
  if grep -q "kolosal_auth" "$f" || [ "$f" = "login.html" ]; then
    echo "✓ $f"
  else
    echo "✗ MISSING: $f"
  fi
done
```
Expected: all lines show ✓

- [ ] **Step 5: Confirm `login.html` does NOT redirect (it's the auth page itself)**

Run: `grep -c "kolosal_auth" login.html`
Expected: output like `2` (it reads sessionStorage to skip login if already auth'd, but does not redirect away)

- [ ] **Step 6: Count total protected pages**

Run:
```bash
grep -rl "kolosal_auth" --include="*.html" . | grep -v node_modules | grep -v ".next" | sort
```
Expected: ~25+ files listed

- [ ] **Step 7: Verify no stale duplicate dirs remain**

Run: `ls "dashboard/out/" | grep -E " [0-9]$"`
Expected: no output

- [ ] **Step 8: Final commit — bump any stray untracked files**

Run `git status` to check for anything missed. Commit if needed.

---

## Credential Rotation Guide

When credentials need to change:

```bash
# 1. Update .env with new values (never commit .env)
# 2. Regenerate hash
node scripts/generate-auth.js

# 3. Commit only the hash file
git add auth-config.js
git commit -m "chore: rotate auth credentials"

# 4. Push to GitHub
git push
```

The new hash takes effect as soon as the updated `auth-config.js` is deployed.
