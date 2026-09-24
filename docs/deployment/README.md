# Deployment Documentation

This folder contains guides for deploying SchoolERP to production environments.

## Contents

```
docs/deployment/
├── README.md              This file
├── frontend-deploy.md     Deploy React SPA (Vercel / Netlify / S3)
├── backend-deploy.md      Deploy Express API (Render / Railway / EC2)
├── database-setup.md      MongoDB Atlas provisioning guide
├── environment-setup.md   Production environment variable checklist
└── cicd.md                GitHub Actions CI/CD pipeline setup
```

## Quick Reference

### Frontend Deployment (Vercel — Recommended)

1. Push `frontend/` to GitHub
2. Import project at vercel.com
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-api.com/api/v1`

### Backend Deployment (Render — Recommended)

1. Push `backend/` to GitHub
2. Create a new Web Service at render.com
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `backend/.env.example`

### Production Checklist

- [ ] `NODE_ENV=production` set on backend
- [ ] Strong `JWT_SECRET` (32+ random characters)
- [ ] MongoDB Atlas IP whitelist includes backend server IP
- [ ] `CLIENT_URL` on backend matches frontend production URL
- [ ] `VITE_API_URL` on frontend matches backend production URL
- [ ] HTTPS enforced on both frontend and backend
- [ ] Error stack traces **not** exposed in production responses
