import axios from "axios";

const finesApi = axios.create({
  baseURL: "http://localhost:5001/api",
});

export default finesApi;