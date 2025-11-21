"use client"

import { useMemo } from "react"
import { ApiClient } from "@/lib/api-client"

async function getClientToken(): Promise<string> {
  const response = await fetch("/api/auth/token", {
    credentials: "same-origin",
  })
  
  if (!response.ok) {
    throw new Error("Error al obtener token")
  }
  
  const data = await response.json()
  return data.token
}

export function useApiClient() {
  return useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    return new ApiClient(baseUrl, getClientToken)
  }, [])
}
