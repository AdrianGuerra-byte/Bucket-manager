"use client"

import { useMemo } from "react"
import { ApiClient } from "@/lib/api-client"

async function getClientToken(): Promise<string> {
  console.log('[useApiClient] Solicitando token...')
  const response = await fetch("/api/auth/token", {
    credentials: "same-origin",
  })
  
  if (!response.ok) {
    console.error('[useApiClient] Error al obtener token:', response.status)
    throw new Error("Error al obtener token")
  }
  
  const data = await response.json()
  console.log('[useApiClient] Token obtenido exitosamente')
  return data.token
}

export function useApiClient() {
  return useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    console.log('[useApiClient] Inicializando ApiClient con baseUrl:', baseUrl)
    return new ApiClient(baseUrl, getClientToken)
  }, [])
}
