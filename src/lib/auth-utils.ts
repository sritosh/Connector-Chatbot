/**
 * Utility to get the site URL for Supabase redirects.
 * Handles production (Vercel) and local development.
 */
export const getSiteURL = () => {
  let url =
    window?.location?.origin || // Browser
    'http://localhost:3000'; // Fallback
  
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  
  // Remove trailing slash
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  
  return url;
};

export const getAuthRedirectURL = (path: string = '/auth/callback') => {
  const base = getSiteURL();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
