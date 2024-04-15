const dev = process.env.NODE_ENV !== 'production';

export const API_BASE_URL = dev
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_API_BASE_URL;
