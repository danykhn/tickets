import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://tickets.danykhn.com",
  headers: {
    "Content-Type": "application/json",
  },
})

export default apiClient
