//In cookie domain do not include http://
//production domain : 'localhost'
//deployment domain : 'cooperative-backend.vercel.app'
export const COOKIE_NAME  = "auth_token";
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost";