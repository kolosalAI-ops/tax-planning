# Login Auth Gate — Design Spec
**Date:** 2026-03-15
**Status:** Approved
**Deployment target:** GitHub Pages (static only)

---

## Problem

The Kolosal tax planning repository is deployed to GitHub Pages. All HTML presentations, the index hub, the international guide, viewer, and the Next.js dashboard are currently publicly accessible. Access needs to be restricted to a single authorized user.

---

## Solution: Client-Side PBKDF2 Auth Gate

A `login.html` entry page checks username + password against a PBKDF2-derived key. On success, the derived key hash is stored in `sessionStorage`. Every protected page checks for the token on load and redirects to `login.html` if absent.

---

## Credentials

- **Username:** `ops@kolosal.ai`
- **Password:** stored in `.env` (gitignored), never committed in plaintext
- **Hash algorithm:** PBKDF2 — SHA-256, 310,000 iterations (NIST recommendation), fixed salt
- **Hash input:** PBKDF2(`password`, salt=`AUTH_SALT`, iterations=310000, hash=`SHA-256`, keylen=32)
- **Stored values in `auth-config.js`:** `AUTH_USER_HASH` (SHA-256 of username), `AUTH_PASS_HASH` (PBKDF2 of password), `AUTH_SALT` (random hex string)

**Security posture:** The hash is visible in page source (GitHub Pages serves files publicly). PBKDF2 with 310,000 iterations makes offline brute-force attacks computationally expensive, but this remains a client-side-only gate. This is appropriate for an internal operations tool, not for protecting sensitive PII or financial data at rest.

---

## Files

### Created

| File | Purpose |
|------|---------|
| `login.html` | Styled login page (design system: Inter, CSS variables) |
| `auth-config.js` | `window.AUTH_CONFIG = { userHash, passHash, salt }` |
| `scripts/generate-auth.js` | Node.js script: reads `.env`, computes hashes, writes `auth-config.js` to repo root |
| `.env` | `AUTH_USER`, `AUTH_PASSWORD`, `AUTH_SALT` — gitignored, never committed |
| `.env.example` | Safe-to-commit template (see contents below) |

### Modified

| File | Change |
|------|--------|
| `.gitignore` | Add `.env` if not already present |
| `index.html` | Add auth check snippet |
| `presentation.html` | Add auth check snippet |
| `presentation-201.html` | Add auth check snippet |
| `presentation-301.html` | Add auth check snippet |
| `presentation-startup.html` | Add auth check snippet |
| `presentation-rnd.html` | Add auth check snippet |
| `International_Tax_Planning_Guide.html` | Add auth check snippet |
| `viewer.html` | Add auth check snippet (file exists at repo root) |
| `dashboard/out/*.html` | Add auth check snippet to all exported dashboard HTML files (incl. `404.html`, `_not-found.html`) |
| `dashboard/out/countries/*.html` | Add auth check snippet to all country pages |

> **Pre-deployment cleanup:** The `dashboard/out/` directory contains stale duplicate build directories (`cases 2`, `cases 3`, `compare 2`, `compare 3`, `countries 2`, `countries 3`, etc.) from prior Next.js export runs. These must be deleted before applying the auth gate to avoid leaving unprotected page copies accessible on GitHub Pages.

---

## Relative Path Strategy

GitHub Pages serves the repo at `https://<org>.github.io/<repo>/`. All paths in the auth system use **relative paths** to avoid 404s regardless of subdirectory depth.

**Depth correctness:** Relative paths (`../../auth-config.js`) resolve by directory levels, not absolute URL segments. From `dashboard/out/countries/AU.html`, `../../../auth-config.js` correctly traverses `countries/` → `out/` → `dashboard/` to reach the repo root `auth-config.js`, regardless of whether the repo is served from a subpath. This works correctly on GitHub Pages project sites.

**Root-level pages** (`index.html`, `presentation*.html`, etc.):
```html
<script src="auth-config.js"></script>
<script>
  const stored = sessionStorage.getItem('kolosal_auth');
  if (!window.AUTH_CONFIG || stored !== window.AUTH_CONFIG.passHash) {
    location.replace('login.html');
  }
</script>
```

**Dashboard pages** (`dashboard/out/index.html`, etc.):
```html
<script src="../../auth-config.js"></script>
<script>
  const stored = sessionStorage.getItem('kolosal_auth');
  if (!window.AUTH_CONFIG || stored !== window.AUTH_CONFIG.passHash) {
    location.replace('../../login.html');
  }
</script>
```

**Dashboard country pages** (`dashboard/out/countries/*.html`):
```html
<script src="../../../auth-config.js"></script>
<script>
  const stored = sessionStorage.getItem('kolosal_auth');
  if (!window.AUTH_CONFIG || stored !== window.AUTH_CONFIG.passHash) {
    location.replace('../../../login.html');
  }
</script>
```

---

## Auth Flow

```
User visits protected page
  └─ loads auth-config.js (relative path)
  └─ checks sessionStorage.getItem('kolosal_auth') === AUTH_CONFIG.passHash
       ├─ match → page renders normally
       └─ mismatch/missing → location.replace('<relative>/login.html')

User on login.html
  └─ submits email + password
       └─ SHA-256(email) === AUTH_CONFIG.userHash  (username check)
       └─ PBKDF2(password, AUTH_CONFIG.salt, 310000) → derived key
            ├─ derived key === AUTH_CONFIG.passHash
            │    └─ sessionStorage.setItem('kolosal_auth', passHash)
            │    └─ location.replace('index.html')
            └─ mismatch → "Invalid credentials" + shake animation

User clicks logout (link on every protected page)
  └─ sessionStorage.removeItem('kolosal_auth')
  └─ location.replace('login.html')  (relative)
```

---

## login.html Design

- Full-page centered card, matching design system (Inter, `--accent`, `--fg`, `--bg`, `--border`)
- Kolosal wordmark at top
- Fields: Email (`type="email"`) + Password (`type="password"`)
- Submit button with loading spinner during PBKDF2 computation (~1s at 310k iterations)
- Error state: red border on inputs + "Invalid credentials" message
- Shake animation on failed attempt
- `prefers-reduced-motion` respected
- Responsive (single breakpoint 768px)

---

## Logout

Every protected page includes a small logout link/button (top-right corner, unobtrusive). The `login.html` path must match the same relative depth as the auth-check snippet for that page tier:

**Root-level pages** (`index.html`, `presentation*.html`, etc.):
```html
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('login.html')">Sign out</button>
```

**Dashboard pages** (`dashboard/out/*.html`):
```html
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('../../login.html')">Sign out</button>
```

**Dashboard country pages** (`dashboard/out/countries/*.html`):
```html
<button onclick="sessionStorage.removeItem('kolosal_auth'); location.replace('../../../login.html')">Sign out</button>
```

Exact placement and styling adapts to each page's existing layout.

---

## sessionStorage Scope (Accepted Behavior)

`sessionStorage` is tab-scoped. Each new tab starts unauthenticated and redirects to login. This is **intentional** — it limits session exposure on shared machines. Users working across multiple tabs will need to log in once per tab. If cross-tab persistence is needed in future, switch to `localStorage` with an explicit logout link (this is out of scope for this version).

---

## generate-auth.js

```
Location: scripts/generate-auth.js
Output:   auth-config.js  (written to repo root, overwrites silently)
Runtime:  Node.js >= 18 (uses built-in crypto module, no npm install needed)

Usage:
  node scripts/generate-auth.js

Reads from .env:
  AUTH_USER      e.g. ops@kolosal.ai
  AUTH_PASSWORD  e.g. koLosAl!0perationaL
  AUTH_SALT      e.g. a3f8b2c1d4e5... (random hex, generated once)

Output auth-config.js:
  window.AUTH_CONFIG = {
    userHash: "<sha256 of AUTH_USER>",
    passHash: "<pbkdf2 derived key hex>",
    salt: "<AUTH_SALT value>"
  };
```

Add to `package.json` scripts (root level, not dashboard):
```json
"scripts": {
  "generate-auth": "node scripts/generate-auth.js"
}
```

---

## .env.example Contents

```
# Kolosal Tax Planning — Auth Configuration
# Copy this file to .env and fill in real values
# NEVER commit .env to git

AUTH_USER=ops@example.com
AUTH_PASSWORD=your-strong-password-here
AUTH_SALT=generate-a-random-hex-string-here
```

---

## Developer Workflow

```bash
# First time setup
cp .env.example .env
# Edit .env with real credentials
# Generate a random AUTH_SALT (e.g. run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Generate hash
node scripts/generate-auth.js
# → writes auth-config.js to repo root

# Commit only the hash file (not .env)
git add auth-config.js
git commit -m "chore: update auth hash"

# Re-run generate-auth.js any time credentials change
```

---

## Security Properties

| Property | Value |
|----------|-------|
| Hash algorithm | PBKDF2 (SHA-256, 310,000 iterations, 32-byte key) |
| Salt | Fixed random hex stored in `auth-config.js` and `.env` |
| Username check | SHA-256 of username (prevents username enumeration via timing) |
| Plaintext in repo | Never |
| Hash in source | Yes — hash + salt in `auth-config.js` (visible on GitHub Pages) |
| Session scope | Tab (`sessionStorage`) — clears on tab close |
| Logout | Explicit `sessionStorage.removeItem` on all protected pages |
| Brute-force cost | PBKDF2 310k iterations ≈ ~1s per attempt in browser — high cost for attacker |
| Limitation | Client-side only. Not a substitute for server-side auth. Suitable for internal ops tools. |

---

## Out of Scope

- Multi-user support
- Server-side session validation
- Rate limiting / lockout (no server)
- Remember me / persistent login across tabs
- Password reset flow
- Protecting raw source files in the GitHub repository itself (use repo visibility settings)
