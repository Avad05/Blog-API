const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://blog-api-31hl.onrender.com/api"
    : "http://localhost:5000/api");

export default API_BASE_URL;
