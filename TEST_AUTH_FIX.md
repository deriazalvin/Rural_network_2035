# Fix for 401 Unauthorized Error

## Problem
The frontend was throwing `401 Unauthorized` errors on startup because `chargerDonnees()` was being called in a `useEffect` without checking if the user had an authentication token.

### Error Flow (Before Fix)
1. App.jsx component mounts
2. `useEffect` at line 68 detects changes in `enLigne` or `utilisateur`
3. At startup: `enLigne=true`, `utilisateur=null` (no token exists yet)
4. `chargerDonnees()` executes immediately
5. Calls `serviceDonnees.obtenirTousLesVillages()` → POST to `/api/villages`
6. Backend rejects with 401 Unauthorized (no Authorization header)
7. ServiceDonnees.js throws: "Invalid or missing authorization token"

### Solution (After Fix)
✅ Modified `App.jsx` line 68-70 to check for token before loading data:

```javascript
// BEFORE (problematic)
useEffect(() => {
  chargerDonnees();
}, [enLigne, utilisateur]);

// AFTER (fixed)
useEffect(() => {
  const token = gestionSession.obtenirToken();
  if (token) {
    chargerDonnees();
  }
}, [enLigne, utilisateur]);
```

## Correct Authentication Flow (Now)
1. App.jsx renders
2. No token exists → user sees PublicPages (LandingPage + AuthForm)
3. User clicks "Connexion" 
4. AuthForm shows login/signup modal
5. User provides credentials
6. AuthForm calls `ServiceDonnees.login()` or `.register()`
7. Backend returns `{id, email, token}`
8. AuthForm dispatches `'rn-user-logged'` event with user data
9. App.jsx listener saves token via `gestionSession.sauvegarderToken(res.token)`
10. `setUtilisateur(user)` triggers re-render
11. Token now exists → App.jsx calls `chargerDonnees()`
12. All API calls now include `Authorization: Bearer {token}` header
13. Backend accepts requests and returns data

## Verification
- ✅ Backend API confirmed working: `POST /api/auth/register` returns token
- ✅ Backend API confirmed working: `GET /api/villages` with token returns data (empty list for new user)
- ✅ Frontend fix: Token check added before data loading
- ✅ Vite proxy configured correctly: `/api` → `http://localhost:8080`
- ✅ CORS configured in backend: Allows `localhost:5173`, `localhost:5174`, `localhost:5175`

## How to Test
1. Start backend: `cd backend && bash start-backend.sh`
2. Start frontend: `npm run dev`
3. Frontend loads on http://localhost:5173 or http://localhost:5174
4. LandingPage displays with "Connexion" button
5. Click "Connexion" → AuthForm appears
6. Click "Pas de compte ? Créer un" → Registration tab
7. Fill in email, password, name
8. Click "Créer" 
9. Backend creates user and returns token
10. AuthForm dispatches login event
11. App receives token, clears auth screen
12. App loads data WITHOUT 401 errors
13. User sees dashboard with villages, routes, trucks, etc.

## Status
🎉 **FIXED** - The 401 Unauthorized error should now be resolved!
