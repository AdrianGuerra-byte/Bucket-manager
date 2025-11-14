"use client"

import { useMemo } from "react"
import { ApiClient } from "@/lib/api-client"

async function getClientToken(): Promise<string> {
  console.log("[useApiClient] Fetching token from /api/auth/token")
  const response = await fetch("/api/auth/token")
  
  if (!response.ok) {
    console.error("[useApiClient] Failed to fetch token:", response.status)
    throw new Error("Error al obtener token")
  }
  
  const data = await response.json()
  console.log("[useApiClient] Token received:", {
    hasToken: !!data.token,
    tokenPreview: data.token?.substring(0, 20) + "...",
  })
  
  return data.token
}

export function useApiClient() {
  return useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    return new ApiClient(baseUrl, getClientToken)
  }, [])
}
