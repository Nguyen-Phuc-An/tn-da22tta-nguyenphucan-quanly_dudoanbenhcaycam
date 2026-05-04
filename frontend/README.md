# 🌿 Frontend - Quản lý Vườn Cây (AI Disease Detection)

React + Vite + TailwindCSS frontend application for the agricultural management system with AI-powered disease detection.

## 📦 Installation

```bash
npm install
```

## 🚀 Development

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── LoginPage.jsx          # Login page with validation
│   ├── RegisterPage.jsx       # Sign up page with validation
│   └── DashboardPage.jsx      # Main dashboard
├── components/
│   └── Layout/
│       ├── AuthLayout.jsx     # Auth pages layout wrapper
│       └── PrivateRoute.jsx   # Protected route component
├── services/
│   ├── apiClient.js          # Axios instance with interceptors
│   └── authService.js        # Authentication service
├── App.jsx                    # Main app with routing
├── main.jsx                   # React entry point
└── index.css                  # Global styles + TailwindCSS
```

## 🔐 Features

### ✅ Authentication
- **Login**: Email + Password validation
- **Register**: Full name, Email, Password validation
- **Protected Routes**: Automatic redirect to login if not authenticated
- **Role-based Access**: Admin vs User differentiation
- **Token Management**: Auto token refresh on 401 responses

### 🎨 UI/UX
- Responsive design (mobile + desktop)
- TailwindCSS styling
- Smooth transitions and animations
- Toast notifications (success/error)
- Show/Hide password toggle
- Loading states on buttons

### ✔️ Validation
- Email format validation
- Password length requirements (min 6 chars)
- Confirm password matching
- Form error display
- Real-time validation feedback

### 📱 Responsive
- Mobile-first approach
- Desktop optimized layout
- Flexible card design
- Touch-friendly buttons

## 🔧 Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:3000/api
```

Default: `http://localhost:3000/api`

## 🧩 Demo Credentials

```
Email: admin@gmail.com
Password: admin123
Role: admin → redirects to /admin
Role: user → redirects to /
```

## 📚 Technologies

- **React 18** - UI library
- **React Router 6** - Navigation
- **React Hook Form** - Form validation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **React Hot Toast** - Notifications
- **Vite** - Build tool

## 🚀 Next Steps

1. Run `npm install` to install dependencies
2. Create `.env` file with API URL
3. Run `npm run dev` to start development server
4. Open `http://localhost:5173` in browser

## 📝 Notes

- Token is stored in localStorage
- 401 responses auto-redirect to login
- User info is persisted in localStorage
- All API calls include Authorization header with token
- Form validation uses React Hook Form with custom rules
