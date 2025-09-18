# IdeaDrop Full Stack Deployment Guide

## The Problem
You're getting "Network Error" because your frontend is trying to connect to `localhost:8000` instead of your deployed backend API.

## Quick Fix Steps

### 1. Get Your Backend URL
First, find your backend Vercel deployment URL (something like `https://your-backend-name.vercel.app`)

### 2. Configure Frontend Environment Variables
In your **frontend** Vercel project dashboard:

1. Go to Settings → Environment Variables
2. Add this variable:
   - **Name**: `VITE_PRODUCTION_API_URL`
   - **Value**: `https://your-backend-vercel-url.vercel.app` (replace with actual URL)

### 3. Configure Backend Environment Variables (Optional)
In your **backend** Vercel project dashboard:

1. Go to Settings → Environment Variables  
2. Add this variable:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://your-frontend-vercel-url.vercel.app` (your frontend URL)

### 4. Redeploy
1. Redeploy your backend first (if you added FRONTEND_URL)
2. Redeploy your frontend (this will pick up the new VITE_PRODUCTION_API_URL)

## How the Fix Works

### Before (Broken):
- Frontend tries to call: `http://localhost:8000/api/auth/refresh`
- This fails because localhost doesn't exist in Vercel's environment

### After (Fixed):
- Frontend calls: `https://your-backend.vercel.app/api/auth/refresh`
- This works because it points to your actual deployed backend

## Files Modified

### Frontend (`IdeaDrop-UI-main/`):
- `src/lib/axios.ts` - Updated to use production API URL when deployed
- `.env.example` - Shows required environment variables
- `src/vite-env.d.ts` - TypeScript definitions for environment variables

### Backend (`IdeaDrop-API-master/`):
- `vercel.json` - Added Vercel configuration for Node.js deployment
- `server.js` - Updated CORS to support dynamic frontend URL

## Testing the Fix

1. After redeploying, open your frontend in the browser
2. Open browser dev tools (F12) → Network tab
3. Try to login or register
4. You should see API calls going to `https://your-backend.vercel.app/api/...` instead of `localhost:8000`

## Common Issues

1. **Still seeing localhost calls**: Environment variable not set correctly
2. **CORS errors**: Backend not configured with correct frontend URL
3. **404 errors**: Backend not deployed properly or wrong URL

## Environment Variables Summary

### Frontend Vercel Project:
```
VITE_PRODUCTION_API_URL=https://your-backend.vercel.app
```

### Backend Vercel Project (Optional):
```
FRONTEND_URL=https://your-frontend.vercel.app
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```
