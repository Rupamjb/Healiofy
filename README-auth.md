# Healiofy Authentication and Route Protection

This document outlines the authentication system and route protection implementation for the Healiofy application.

## Authentication System

The application uses a JWT-based authentication system with the following components:

### Backend (`server/`)

1. **Auth Controller** (`server/controllers/authController.js`): Handles user registration and login, generating JWT tokens.
2. **Auth Middleware** (`server/middleware/authMiddleware.js`): Verifies JWT tokens to protect API routes.
3. **Auth Routes** (`server/routes/authRoutes.js`): Defines the authentication endpoints.

### Frontend (`heal/src/`)

1. **Auth Context** (`contexts/AuthContext.tsx`): Manages authentication state across the application, providing:
   - User information
   - Authentication status
   - Login, register, and logout methods
   - Post-authentication redirects

2. **Auth Service** (`services/authService.ts`): Handles API communication:
   - Registration and login requests
   - Token storage in localStorage
   - JWT token inclusion in authenticated requests

3. **Auth Components**:
   - `components/auth/AuthModal.tsx`: Modal for login/registration
   - `components/auth/LoginForm.tsx`: Login form
   - `components/auth/RegisterForm.tsx`: Registration form
   - `components/auth/PrivateRoute.tsx`: Route protection component

## Route Protection

The application protects certain routes that require authentication:

1. **PrivateRoute Component**:
   - Wraps protected routes in `App.tsx`
   - Redirects unauthenticated users to the home page with a login prompt
   - Saves the intended destination using `sessionStorage` for post-login redirect

2. **Protected Routes**:
   - `/appointments`: User's appointment management
   - `/prescription-analysis`: Prescription analysis feature

3. **Redirect Handling**:
   - When a user tries to access a protected route while unauthenticated, they're redirected to the home page
   - The home page detects the redirect, shows the login modal, and displays a notification
   - After successful authentication, the user is redirected to their originally intended destination

## Navbar Integration

The navigation bar intelligently handles protected routes:

1. **Conditional Navigation**: 
   - For protected routes, clicking a link either navigates to the route (if authenticated) or shows the login modal (if not authenticated)
   - The dropdown menu in the user profile section only shows authenticated options when logged in

## Implementation Details

1. **Token Storage**: JWT tokens are stored in localStorage
2. **API Authentication**: Auth headers are added to API requests using the `authHeader()` function
3. **State Persistence**: Authentication state is restored on page reload from localStorage
4. **Error Handling**: Login/registration forms display error messages from the API

## Usage

Protected routes can be defined by wrapping components in the `PrivateRoute` component:

```tsx
<Route 
  path="/protected-path" 
  element={
    <PrivateRoute>
      <ProtectedComponent />
    </PrivateRoute>
  } 
/>
``` 