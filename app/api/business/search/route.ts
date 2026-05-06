import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (!q || q.length < 3) {
    return NextResponse.json({ businesses: [] })
  }

  try {
    const res = await fetch(`${process.env.API_URL || "http://localhost:3334"}/api/business/search?q=${encodeURIComponent(q)}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    const data = await res.json()
    
    // El backend puede retornar { businesses: [...] } o un array directo [...]
    let businesses = []
    if (Array.isArray(data)) {
      businesses = data
    } else if (data.businesses) {
      businesses = data.businesses
    } else if (data.data) {
      businesses = data.data
    } else if (data.items) {
      businesses = data.items
    } else {
      // Si es un objeto único, envolverlo en array
      businesses = [data]
    }
    
    return NextResponse.json({ businesses })
  } catch (error) {
    console.error("Error searching businesses:", error)
    return NextResponse.json({ businesses: [] })
  }
}