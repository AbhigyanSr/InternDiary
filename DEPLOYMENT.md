# Deployment Guide for Intern Diary

This is a full-stack application with separate frontend (React) and backend (Express) that need to be deployed separately.

## Recommended Deployment Strategy

### Option 1: Vercel (Frontend) + Render/Railway (Backend) 

This is the **recommended approach** for this monorepo structure.

#### Deploy Frontend on Vercel:

1. **Connect GitHub to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Authorize Vercel to access your private repo

2. **Configure Build Settings**:
   - Framework Preset: `Create React App`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Set Environment Variables** in Vercel:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

#### Deploy Backend on Render:

1. Go to [Render Dashboard](https://render.com/)
2. Create a new "Web Service"
3. Connect your GitHub repo
4. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: `Node`

5. **Set Environment Variables**:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

6. Copy the backend URL (e.g., `https://intern-diary-api.onrender.com`)

7. **Update Frontend API URL**:
   - Go back to Vercel project settings
   - Update environment variable:
     ```
     REACT_APP_API_URL=https://intern-diary-api.onrender.com/api
     ```
   - Redeploy

#### Update API Service:

Update `client/src/services/api.js` to use environment variable:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

---

## Option 2: Deploy Everything on Render

1. Create a new "Web Service" on Render
2. Root Directory: Leave blank (use root)
3. Build Command: `npm run install-all && cd client && npm run build`
4. Start Command: `cd server && node server.js`
5. Configure server to serve static files from `client/build`

---

## Option 3: Vercel Only (with Serverless Functions)

This requires restructuring your backend into serverless functions. See [Vercel API Routes documentation](https://vercel.com/docs/concepts/functions/serverless-functions).

---

## Troubleshooting Vercel Deployment

### 404 NOT_FOUND Error

This error occurs when:
1. **Wrong build directory**: Vercel can't find the built files
   - Solution: Set Root Directory to `client` in Vercel settings
2. **Build failed**: Check build logs in Vercel dashboard
3. **Private repo access**: Reconnect GitHub integration

### Fix Steps:

1. Delete the failed deployment in Vercel
2. Reimport the project with correct settings:
   - **Root Directory**: `client`
   - **Framework**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. Redeploy

### Environment Variables

Make sure to set in Vercel:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

And restart the deployment after adding environment variables.

---

## Current vercel.json Configuration

The `vercel.json` in the root is configured for monorepo setup. If you set Root Directory to `client` in Vercel settings, you don't need this file.

**Choose one approach:**
- Use `vercel.json` with Root Directory = `/` (root)
- OR delete `vercel.json` and set Root Directory = `client`

---

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend can connect to backend API
- [ ] Environment variables are set correctly
- [ ] CORS is configured to allow frontend domain
- [ ] MongoDB connection is working
- [ ] Test authentication flow
- [ ] Test all CRUD operations

---

## Update Backend CORS

In `server/server.js`, update CORS to allow your Vercel domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```
