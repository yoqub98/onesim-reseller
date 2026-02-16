# Authentication Implementation Guide

## Overview
This document outlines the authentication UI implementation and provides guidance for backend integration with Supabase.

## Current Implementation (Mock/Prototype)

### What's Implemented
✅ **Login Page** (`src/pages/LoginPage.jsx`)
- Email/Password login form
- Google OAuth button (UI only)
- Password visibility toggle
- Forgot password link (UI only)
- Form validation
- Loading states
- Responsive design matching Figma prototype

✅ **Signup Page** (`src/pages/SignupPage.jsx`)
- Company registration form with fields:
  - Company Name (Название компании)
  - Official Legal Name (Официальное юридическое наименование)
  - ИНН (Tax ID / STIR)
  - Address (Адрес)
  - Email
  - Password
  - Contact Person (Контактное лицо):
    - Full Name (ФИО)
    - Phone Number (Телефон)
    - Contract Number (Договор-номер)
- Terms & conditions checkbox
- Form validation
- Loading states

✅ **Auth Context** (`src/context/AuthContext.jsx`)
- Mock authentication state management
- User session persistence (localStorage)
- Login/Logout functions

✅ **Protected Routes**
- Auto-redirect to login if not authenticated
- Auto-redirect to dashboard if already authenticated
- Route guards for all main application pages

✅ **UI Components**
- `AppInput` - Reusable form input component
- Consistent design system integration
- Proper error handling and validation

### Current Behavior (Mock)
- Any email/password combination will successfully "login"
- Typing anything and submitting navigates to dashboard
- Logout clears localStorage and redirects to login
- Session persists on page refresh

---

## Backend Integration Checklist

### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2. Setup Supabase Configuration
Create `src/config/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Add to `.env`:
```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Schema

Create the following tables in Supabase:

**partners** table:
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  inn TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_full_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contract_number TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own partner profile
CREATE POLICY "Users can read own partner profile"
ON partners FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own partner profile
CREATE POLICY "Users can insert own partner profile"
ON partners FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own partner profile
CREATE POLICY "Users can update own partner profile"
ON partners FOR UPDATE
USING (auth.uid() = user_id);
```

### 4. Update AuthContext

Replace mock implementation in `src/context/AuthContext.jsx`:

```javascript
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPartnerProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPartnerProfile(session.user.id);
      } else {
        setPartnerProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPartnerProfile = async (userId) => {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setPartnerProfile(data);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email, password, partnerData) => {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return { data: null, error: authError };

    // Create partner profile
    const { data: profileData, error: profileError } = await supabase
      .from('partners')
      .insert([
        {
          user_id: authData.user.id,
          ...partnerData,
        },
      ])
      .select()
      .single();

    return { data: { user: authData.user, profile: profileData }, error: profileError };
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { data, error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const value = {
    user,
    partnerProfile,
    isAuthenticated: !!user,
    isLoading,
    login,
    signUp,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### 5. Update LoginPage

Update the `handleLogin` function in `src/pages/LoginPage.jsx`:

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  const { error } = await login(email, password);

  setIsLoading(false);

  if (error) {
    // Show error toast
    setError(error.message);
    return;
  }

  // Navigation will happen automatically via auth state change
  navigate("/");
};

const handleGoogleLogin = async () => {
  setIsLoading(true);
  const { error } = await loginWithGoogle();
  setIsLoading(false);

  if (error) {
    // Show error toast
    alert(error.message);
  }
};
```

### 6. Update SignupPage

Update the `handleSignup` function in `src/pages/SignupPage.jsx`:

```javascript
const handleSignup = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  const partnerData = {
    company_name: companyName,
    legal_name: legalName,
    inn: inn,
    address: address,
    contact_full_name: contactFullName,
    contact_phone: contactPhone,
    contract_number: contractNumber || null,
  };

  const { error } = await signUp(email, password, partnerData);

  setIsLoading(false);

  if (error) {
    setError(error.message);
    return;
  }

  // Show success message
  alert("Registration successful! Please check your email to verify your account.");
  navigate("/login");
};
```

### 7. Setup Google OAuth in Supabase

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add OAuth credentials from Google Cloud Console
4. Configure authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`

### 8. Email Templates

Configure email templates in Supabase Dashboard > Authentication > Email Templates:
- Confirm signup
- Reset password
- Magic link

Customize with your branding and OneSIM logo.

### 9. Additional Security Features to Implement

- [ ] Add rate limiting for login attempts
- [ ] Implement email verification requirement
- [ ] Add password strength requirements
- [ ] Implement 2FA (optional)
- [ ] Add session timeout handling
- [ ] Implement refresh token rotation
- [ ] Add audit logging for auth events

### 10. Testing Checklist

- [ ] Test successful login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test email verification flow
- [ ] Test password reset flow
- [ ] Test Google OAuth flow
- [ ] Test logout functionality
- [ ] Test protected route access
- [ ] Test session persistence across page refreshes
- [ ] Test concurrent sessions (multiple tabs)
- [ ] Test mobile responsive design

---

## File Structure

```
src/
├── pages/
│   ├── LoginPage.jsx          # Login UI
│   └── SignupPage.jsx         # Registration UI
├── context/
│   └── AuthContext.jsx        # Auth state management
├── components/
│   ├── ui/
│   │   └── AppInput.jsx       # Form input component
│   └── layout/
│       └── AppTopbar.jsx      # Header with logout button
├── config/
│   └── supabase.js           # Supabase client (to be created)
└── i18n/
    ├── ru.js                  # Russian translations
    └── uz.js                  # Uzbek translations
```

---

## Design System Integration

All components use the existing design system:
- **Colors**: `uiColors` from `src/design-system/tokens.js`
- **Border Radius**: `uiRadii`
- **Shadows**: `uiShadows`
- **Components**: `AppButton`, `AppInput`

---

## Notes for Backend Team

1. **Contract Number**: This field is optional during signup. Assign it during admin approval process.

2. **Partner Status**: Implement a workflow where:
   - New partners have `status = 'pending'`
   - Admin reviews and approves/rejects
   - Only approved partners can access the platform

3. **Profile Completion**: Consider adding a profile completion step after initial signup for additional business details.

4. **Email Verification**: Strongly recommended to require email verification before allowing platform access.

5. **Error Handling**: Implement proper error messages for:
   - Duplicate email registration
   - Invalid credentials
   - Network errors
   - Session expiration

6. **Localization**: Auth error messages should be translated. Consider using i18n for Supabase error messages.

---

## Questions or Issues?

Contact the frontend team for any clarifications regarding the UI implementation or integration points.

**Current Status**: ✅ UI Complete, ⏳ Backend Integration Pending
