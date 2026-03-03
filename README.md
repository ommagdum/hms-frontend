# 🏨 HMS - Hotel Management System (Frontend)

A modern, elegant, and feature-rich frontend application for hotel management, built with React, TypeScript, and Tailwind CSS. This system provides comprehensive tools for managing hotel operations including bookings, rooms, customers, staff, and detailed reporting.

## ✨ Features

### 🎯 Core Functionality
- **Role-Based Access Control** - Secure authentication with ADMIN, MANAGER, and RECEPTIONIST roles
- **Real-time Dashboard** - Comprehensive analytics with occupancy rates, revenue metrics, and booking trends
- **Room Management** - Complete room inventory management with status tracking
- **Booking System** - Full booking lifecycle from creation to modification and cancellation
- **Customer Management** - Guest profiles, booking history, and preferences
- **Staff Administration** - Employee management (Admin access only)
- **Advanced Reporting** - Daily revenue, monthly occupancy, and customer history reports

### 🎨 User Experience
- **Modern UI/UX** - Clean, intuitive interface with hotel-themed design
- **Responsive Design** - Optimized for desktop and tablet devices
- **Interactive Calendar** - Visual room availability and booking management
- **Real-time Updates** - Live status updates and notifications
- **Data Visualization** - Charts and graphs for better insights

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.2.0** - Modern React with latest features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.3.1** - Fast development and build tool

### UI & Styling
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **Lucide React 0.575.0** - Beautiful icon library
- **Recharts 3.7.0** - Data visualization charts

### State Management & Routing
- **React Router DOM 7.13.1** - Client-side routing
- **Context API** - Authentication and state management

### HTTP Client & Utilities
- **Axios 1.13.5** - HTTP client with interceptors
- **JWT Decode 4.0.0** - Token handling
- **Date-fns 4.1.0** - Date manipulation utilities

## 🏗️ Project Structure

```
src/
├── api/                 # API service layers
│   ├── bookingService.ts
│   ├── customerService.ts
│   ├── dashboardService.ts
│   ├── roomService.ts
│   ├── staffService.ts
│   └── reportService.ts
├── components/          # Reusable UI components
│   ├── ProtectedRoute.tsx
│   ├── CustomerModal.tsx
│   ├── InvoiceModal.tsx
│   └── StaffModal.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── layouts/            # Layout components
│   └── AppLayout.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Bookings.tsx
│   ├── Rooms.tsx
│   ├── Customers.tsx
│   ├── Staff.tsx
│   └── Reports/
└── utils/              # Utility functions
    └── auth.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Backend API server running on `http://localhost:8080`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hms-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Ensure your backend API is running on `http://localhost:8080`
   - The frontend is configured to connect to this endpoint

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔐 Authentication & Authorization

### User Roles
- **ADMIN**: Full system access including staff management
- **MANAGER**: Dashboard, reports, bookings, customers, rooms
- **RECEPTIONIST**: Bookings, customers, rooms, calendar

### Protected Routes
All routes except `/login` are protected and require authentication. Access is granted based on user roles with automatic redirects to appropriate pages.

## 📊 Key Features in Detail

### Dashboard Analytics
- Real-time occupancy metrics
- Revenue tracking and trends
- Room status distribution
- Recent booking activities
- Performance indicators

### Booking Management
- Multi-step booking process
- Room availability checking
- Guest information collection
- Invoice generation
- Booking modifications and cancellations

### Reporting System
- **Daily Revenue Reports**: Financial performance tracking
- **Monthly Occupancy Reports**: Capacity utilization analysis
- **Customer History Reports**: Guest behavior insights

### Room Management
- Room status tracking (Occupied, Available, Maintenance)
- Room details and amenities
- Availability calendar integration

## 🎨 Design System

### Color Palette
- **Primary**: `#2C4A3E` (Deep forest green)
- **Accent**: `#C6A15B` (Warm gold)
- **Background**: `#F5F4F0` (Warm off-white)
- **Surface**: `#E8E7E3` (Light neutral)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

## 🔧 Configuration

### API Configuration
The API client is configured in `src/api/client.ts`:
- Base URL: `http://localhost:8080/api`
- Automatic JWT token attachment
- 401 error handling with automatic logout

### Build Configuration
- **Vite**: Fast development and optimized builds
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Tailwind CSS**: Utility-first styling

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The build artifacts are stored in the `dist/` directory.

### Environment Variables
Create a `.env.production` file for production configuration:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Notes

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Component-based architecture
- Custom hooks for reusable logic

### State Management
- React Context for authentication
- Local component state for UI interactions
- API layer for data fetching

### Error Handling
- Global error interceptors
- User-friendly error messages
- Automatic token refresh handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by luxury hotel management systems
- Designed for exceptional user experience
