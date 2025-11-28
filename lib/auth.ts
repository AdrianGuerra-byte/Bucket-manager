"use server"

import { cookies } from "next/headers"
import type { TokenResponse } from "@/types/files"
import { ApiClient } from "./api-client"

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

  if (!token || !expiry) {
    return null
  }

  if (Date.now() >= Number.parseInt(expiry)) {
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
    const expiresAt = Date.now() + data.expires_in * 1000

    const cookieStore = await cookies()
    const isSecure = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith("https")

    cookieStore.set(CLIENT_ID_COOKIE_NAME, clientId, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/",
      maxAge: data.expires_in,
    })

    cookieStore.set(CLIENT_SECRET_COOKIE_NAME, clientSecret, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/",
      maxAge: data.expires_in,
    })

    cookieStore.set(TOKEN_COOKIE_NAME, data.access_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/",
      maxAge: data.expires_in,
    })

    cookieStore.set(TOKEN_EXPIRY_COOKIE_NAME, expiresAt.toString(), {
      httpOnly: true,
      secure: isSecure,
      sameSite: "strict",
      path: "/",
      maxAge: data.expires_in,
    })

    return { success: true }
  } catch (error) {
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
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const cookieStore = await cookies()
  const clientId = cookieStore.get(CLIENT_ID_COOKIE_NAME)?.value
  const clientSecret = cookieStore.get(CLIENT_SECRET_COOKIE_NAME)?.value

  if (!apiUrl || !clientId || !clientSecret) {
    throw new Error("Configuración de autenticación faltante")
  }

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
    throw new Error("Error al obtener token de acceso")
  }

  const data: TokenResponse = await response.json()
  const expiresAt = Date.now() + data.expires_in * 1000
  const isSecure = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith("https")

  cookieStore.set(TOKEN_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
    path: "/",
    maxAge: data.expires_in,
  })

  cookieStore.set(TOKEN_EXPIRY_COOKIE_NAME, expiresAt.toString(), {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
    path: "/",
    maxAge: data.expires_in,
  })

  return data.access_token
}

export async function getOrRefreshToken(): Promise<string> {
  let token = await getAccessToken()

  if (!token) {
    token = await refreshAccessToken()
  }

  if (!token) {
    throw new Error("No hay token de autenticación disponible")
  }

  return token
}