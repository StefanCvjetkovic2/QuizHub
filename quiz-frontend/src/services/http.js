import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // npr. http://localhost:5274
  withCredentials: false,
});

export default http; 
