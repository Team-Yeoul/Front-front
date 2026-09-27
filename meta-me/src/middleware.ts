// The real login/signup flow stores its session in `useAuthStore` (zustand),
// never in a next-auth session — so gating these routes with next-auth's
// `withAuth` blocked every real user regardless of login state. Route-level
// auth is handled client-side (each page checks `accessToken` itself).
export const config = {
  matcher: [],
};
