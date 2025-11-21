import { NextResponse } from "next/server"
import { getOrRefreshToken } from "@/lib/auth"

export async function GET() {
  try {
    const token = await getOrRefreshToken()
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener token" }, { status: 500 })
  }
}
