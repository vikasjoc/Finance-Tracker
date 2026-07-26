# Deployment Checklist

## 📋 Pre-Deployment Checklist

### Environment Variables

#### Backend (Server) - Required on Render / Vercel / MongoDB Atlas

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | Yes | `5001` |
| `MONGO_URI` | MongoDB connection string | **Yes** | - |
| `JWT_SECRET` | JWT signing secret | **Yes** | - |
| `JWT_EXPIRE` | Token expiry duration | Yes | `30d` |
| `JWT_COOKIE_EXPIRE` | Cookie expiry in days | Yes | `30` |
| `CLIENT_URL` | Frontend URL (for CORS) | **Yes** | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No | - |
| `SMTP_HOST` | Email SMTP host | No | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | No | `587` |
| `SMTP_EMAIL` | SMTP email address | No | - |
| `SMTP_PASSWORD` | SMTP app password | No | - |
| `FROM_EMAIL` | Sender email address | No | - |
| `FROM_NAME` | Sender display name | No | `Finance Tracker` |

#### Frontend (Client) - Required on Vercel

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | **Yes** | `/api` (dev proxy) |

---

## 🚀 Deployment Steps

### 1. MongoDB Atlas Setup

1. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) account
2. Create a new cluster (free M0 tier is sufficient)
3. Configure **Network Access** → Add IP `0.0.0.0/0` (allow all) or your deployment platform's IP range
4. Create a **Database User** with read/write permissions
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace `<username>`, `<password>`, and `<dbname>` in the string

Example connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/finance-tracker?retryWrites=true&w=majority
```

### 2. Backend Deployment on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `finance-tracker-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add all environment variables listed above
6. Click **Deploy**
7. Once deployed, copy the URL (e.g., `https://finance-tracker-api.onrender.com`)

### 3. Backend Deployment on Vercel (Alternative)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Framework Preset**: `Other`
   - **Build Command**: `npm install`
   - **Output Directory**: (leave blank)
5. Add environment variables
6. Deploy

**Note**: For Vercel serverless deployment, the `server/vercel.json` is already configured.

### 4. Frontend Deployment on Vercel

1. Click **Add New** → **Project**
2. Import the same GitHub repository
3. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://finance-tracker-api.onrender.com/api` (your Render backend URL + `/api`)
5. Click **Deploy**

### 5. Seed Production Database

After deployment, run the seed script once:

```bash
# Set MONGO_URI to your production MongoDB Atlas connection string
MONGO_URI="your_mongodb_atlas_uri" node server/seed.js
```

Or, you can trigger seeding by making a request to the health endpoint (seeding happens automatically at server startup).

---

## ✅ Post-Deployment Verification

### API Health Check
```bash
curl https://finance-tracker-api.onrender.com/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "Finance Tracker API is running",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Verify Endpoints
- [ ] `GET /api/health` - Health check
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/login` - User login
- [ ] `GET /api/auth/me` - Get user profile
- [ ] `GET /api/transactions` - List transactions
- [ ] `GET /api/budgets` - List budgets
- [ ] `GET /api/categories` - List categories
- [ ] `GET /api/goals` - List goals
- [ ] `GET /api/recurring` - List recurring transactions
- [ ] `GET /api/notifications` - List notifications
- [ ] `GET /api/ai/insights` - AI insights
- [ ] `GET /api/admin/analytics` - Admin analytics

### Verify Frontend Routes
- [ ] `/login` - Login page loads
- [ ] `/register` - Registration page loads
- [ ] `/dashboard` - Dashboard loads with data
- [ ] `/transactions` - Transactions page loads
- [ ] `/budgets` - Budgets page loads
- [ ] `/categories` - Categories page loads
- [ ] `/reports` - Reports page loads
- [ ] `/ai` - AI Budget Planner loads
- [ ] `/profile` - Profile settings loads
- [ ] `/notifications` - Notifications page loads
- [ ] `/admin` - Admin dashboard loads

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **CORS Error** | Ensure `CLIENT_URL` is set correctly on the backend |
| **MongoDB Connection Error** | Check Atlas IP whitelist and connection string |
| **JWT Auth Failed** | Verify `JWT_SECRET` is set and consistent |
| **404 on API Routes** | Check route paths are correctly mounted in `server.js` |
| **Frontend can't reach backend** | Ensure `VITE_API_URL` points to the correct backend URL |
| **Email not sending** | Verify SMTP credentials and check if using app password for Gmail |
| **File upload not working** | Ensure Cloudinary credentials are configured |
| **Build fails on Vercel** | Check build logs for missing dependencies |
| **Rate limiting too strict** | Adjust rate limit settings in production if needed |

---

## 📌 Important Notes

1. **Domain Setup**: Configure custom domains in Vercel/Render settings if needed
2. **SSL**: Vercel and Render provide SSL certificates automatically
3. **Database Backups**: Enable MongoDB Atlas automated backups
4. **Monitoring**: Use Render's built-in logging or integrate with Sentry
5. **Scaling**: Free tiers have limitations; upgrade as your user base grows

---

## 📞 Support

If you encounter any deployment issues:
- Check the application logs on Render/Vercel
- Review MongoDB Atlas connection status
- Verify all environment variables are correctly set
- Ensure the database has been seeded with default categories

