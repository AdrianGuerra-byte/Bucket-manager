"use server"

import { cookies } from "next/headers"
import type { TokenResponse } from "@/types/files"

const TOKEN_COOKIE_NAME = "bucket_access_token"
const TOKEN_EXPIRY_COOKIE_NAME = "bucket_token_expiry"
const CLIENT_ID_COOKIE_NAME = "bucket_client_id"
const CLIENT_SECRET_COOKIE_NAME = "bucket_client_secret"

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken()
  return token !== null
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value
  const expiry = cookieStore.get(TOKEN_EXPIRY_COOKIE_NAME)?.value

  console.log("[AUTH] getAccessToken - Cookie values:", {
    hasToken: !!token,
    tokenPreview: token?.substring(0, 20) + "...",
    expiry: expiry,
    expiryDate: expiry ? new Date(Number.parseInt(expiry)).toISOString() : null,
    currentTime: new Date().toISOString(),
    isExpired: expiry ? Date.now() >= Number.parseInt(expiry) : null,
  })

  if (!token || !expiry) {
    console.log("[AUTH] getAccessToken - No token or expiry found")
    return null
  }

  // Valida si el Token ya mamó
  if (Date.now() >= Number.parseInt(expiry)) {
    console.log("[AUTH] getAccessToken - Token expired")
    return null
  }

  return token
}

export async function authenticateWithCredentials(
  clientId: string,
  clientSecret: string,
): Promise<{ success: boolean; error?: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!apiUrl) {
    return { success: false, error: "Configuración de API faltante" }
  }

  try {
    const response = await fetch(`${apiUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: "Credenciales inválidas" }
      }
      return { success: false, error: "Error al autenticar" }
    }

    const data: TokenResponse = await response.json()
    console.log("[AUTH] Token recibido del backend:", {
      hasToken: !!data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      tokenPreview: data.access_token?.substring(0, 20) + "...",
    })
    const expiresAt = Date.now() + data.expires_in * 1000

    // Guarda las credenciales y el token en Cookies
    const cookieStore = await cookies()

    cookieStore.set(CLIENT_ID_COOKIE_NAME, clientId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    })

    cookieStore.set(CLIENT_SECRET_COOKIE_NAME, clientSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    })

    cookieStore.set(TOKEN_COOKIE_NAME, data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.expires_in,
    })

    cookieStore.set(TOKEN_EXPIRY_COOKIE_NAME, expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.expires_in,
    })

    console.log("[AUTH] Token almacenado en cookies exitosamente")

    return { success: true }
  } catch (error) {
    console.error(" Error de autenticación:", error)
    return { success: false, error: "Error de conexión" }
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE_NAME)
  cookieStore.delete(TOKEN_EXPIRY_COOKIE_NAME)
  cookieStore.delete(CLIENT_ID_COOKIE_NAME)
  cookieStore.delete(CLIENT_SECRET_COOKIE_NAME)
}

export async function refreshAccessToken(): Promise<string> {
  console.log("[AUTH] refreshAccessToken - Starting refresh...")
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const cookieStore = await cookies()
  const clientId = cookieStore.get(CLIENT_ID_COOKIE_NAME)?.value
  const clientSecret = cookieStore.get(CLIENT_SECRET_COOKIE_NAME)?.value

  console.log("[AUTH] refreshAccessToken - Credentials:", {
    hasApiUrl: !!apiUrl,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
  })

  if (!apiUrl || !clientId || !clientSecret) {
    console.error("[AUTH] refreshAccessToken - Missing configuration")
    throw new Error("Configuración de autenticación faltante")
  }

  console.log("[AUTH] refreshAccessToken - Requesting new token from backend...")
  const response = await fetch(`${apiUrl}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    console.error("[AUTH] refreshAccessToken - Failed:", response.status)
    throw new Error("Error al obtener token de acceso")
  }

  const data: TokenResponse = await response.json()
  console.log("[AUTH] refreshAccessToken - New token received:", {
    hasToken: !!data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  })
  
  const expiresAt = Date.now() + data.expires_in * 1000

  // Definimos las Cookies
  cookieStore.set(TOKEN_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: data.expires_in,
  })

  cookieStore.set(TOKEN_EXPIRY_COOKIE_NAME, expiresAt.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: data.expires_in,
  })

  return data.access_token
}

export async function getOrRefreshToken(): Promise<string> {
  let token = await getAccessToken()
  console.log("[AUTH] Obteniendo token de las cookies:", {
    hasToken: !!token,
    tokenPreview: token?.substring(0, 20) + "...",
  })

  if (!token) {
    token = await refreshAccessToken()
  }

  if (!token) {
    throw new Error("No hay token de autenticación disponible")
  }

  return token
}
