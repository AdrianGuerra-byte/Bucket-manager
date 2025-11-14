import { NextResponse } from "next/server"
import { getOrRefreshToken } from "@/lib/auth"

export async function GET() {
  try {
    console.log("[API /api/auth/token] Fetching token...")
    const token = await getOrRefreshToken()
    console.log("[API /api/auth/token] Token actualizado:", {
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + "...",
    })
    return NextResponse.json({ token })
  } catch (error) {
    console.error("[API /api/auth/token] Error:", error)
    return NextResponse.json({ error: "Error al obtener token" }, { status: 500 })
  }
}
