# Phone Number + OTP Authentication Implementation Plan

This plan outlines the architecture for adding role-based phone number + OTP authentication to the `loeffler-map` project.

## User Review Required

1. **SMS Provider**: Do you have a specific SMS API (like Twilio, MSG91) you want to use? Or should I implement a mock OTP sender (e.g., logging the OTP to the console) for now?
2. **Allowed Numbers**: "Only phone numbers who are given access can login." How would you like these numbers added to the database initially? Should I create an admin script, or do you already have these in the database?
3. **Dependencies**: I will need to install `jose` (for JWT session management in Next.js middleware). Is that okay?

## Proposed Changes

### Dependencies

- **[NEW]** `jose` (for JWT creation and verification, Edge compatible)

---

### Backend Components

#### [NEW] `src/models/User.ts` (or equivalent schema/types)

- Will define the structure for the `users` collection in MongoDB, storing `phoneNumber`, `role`, `otp`, and `otpExpiry`.

#### [NEW] `src/app/api/auth/request-otp/route.ts`

- Receives `phoneNumber`.
- Checks if the phone number exists in the `users` collection (i.e., is allowed).
- Generates a 6-digit OTP, updates the user record with the OTP and expiration time (e.g., 5 minutes).
- Sends the OTP via the chosen SMS method (or mock).

#### [NEW] `src/app/api/auth/verify-otp/route.ts`

- Receives `phoneNumber` and `otp`.
- Validates the OTP against the database and checks expiration.
- If valid, generates a JWT session token and sets it as an `HttpOnly` cookie.
- Clears the OTP from the database.

#### [NEW] `src/lib/auth.ts`

- Utility functions to sign and verify JWTs using `jose`, and to manage the cookie.

---

### Frontend Components

#### [NEW] `src/app/login/page.tsx`

- A login page UI.
- Step 1: Input phone number.
- Step 2: Input OTP using the existing `input-otp` and `lucide-react` components.

#### [NEW] `src/middleware.ts`

- Next.js middleware to inspect incoming requests.
- Checks for the presence of the JWT session cookie.
- Redirects unauthenticated users attempting to access protected routes (e.g., `/`, `/results`) to `/login`.

## Verification Plan

### Automated/Manual Tests

- **Database Test**: Create a dummy user in MongoDB to test the "allowed numbers only" rule.
- **Request OTP**: Submit the phone number on `/login` and verify that the OTP is generated/logged/sent and the database is updated.
- **Verify OTP**: Submit the OTP, observe the `Set-Cookie` header in the response, and ensure the UI redirects to a protected route.
- **Middleware Test**: Attempt to access the root page `/` without a cookie to ensure it redirects to `/login`.
