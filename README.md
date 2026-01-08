# BaiTapVui Frontend

A modern, responsive educational platform built with React, TypeScript, and Tailwind CSS.

## Features

### Login/Signup Page

The login page includes:

- **Dual Role Support**: Toggle between Student and Teacher login
- **Modern Design**: Based on the design specifications with a two-panel layout
  - Left panel: Hero section with background image and tagline
  - Right panel: Login form
- **OAuth Integration**: Placeholders for Google and Microsoft authentication
- **Responsive Design**: Mobile-friendly with single panel on small screens
- **Dark Mode Support**: Built-in dark mode theming (class-based)
- **Language Toggle**: Switch between EN and VN (English/Vietnamese)
- **Form Validation**: Email and password inputs with validation
- **Forgot Password**: Link to password recovery flow

## Tech Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Material Symbols**: Google's icon font

## Design System

### Colors
```
Primary: #13ec5b (Bright Green)
Background Light: #f6f8f6
Background Dark: #102216
Surface Light: #ffffff
Surface Dark: #1a2c20
```

### Fonts
- **Display**: Lexend (100-900 weight)
- **Body**: Noto Sans (300-800 weight)

### Components
- `Button`: Primary, secondary, and outline variants
- `Input`: Email, password, and text inputs with icons
- `Header`: Navigation bar with logo and language toggle

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The app will be available at [http://localhost:5173/](http://localhost:5173/)

### Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── layout/          # Layout components
│       └── Header.tsx
├── pages/               # Page components
│   └── LoginPage.tsx
├── App.tsx              # Main app component with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles and Tailwind imports
```

### Available Routes

- `/` - Redirects to `/login`
- `/login` - Login/Signup page

## Design Specifications

The UI is based on the design files in the `design/` folder:
- `design/code/login-screen.html` - HTML/CSS reference
- `design/image/login-screen.png` - Visual design mockup

All styling follows the Tailwind configuration with custom colors, fonts, and border radii matching the design system.

## Next Steps

To complete the login functionality:

1. **Backend Integration**
   - Connect to authentication API endpoints
   - Implement JWT token handling
   - Add form validation with React Hook Form + Zod

2. **OAuth Integration**
   - Set up Google OAuth 2.0 flow
   - Set up Microsoft OAuth 2.0 flow
   - Handle OAuth callbacks

3. **Additional Pages**
   - Signup page (separate from login)
   - Forgot password page
   - Reset password page
   - Teacher dashboard
   - Student dashboard
   - Assignment creation

4. **State Management**
   - Add Auth context for global auth state
   - Implement protected routes
   - Handle token refresh

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

© 2024 hoctapvui Inc. All rights reserved.
