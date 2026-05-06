import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const res = await fetch(`${process.env.API_URL || "http://localhost:3334"}/api/business`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating business:", error)
    return NextResponse.json({ error: "Error creating business" }, { status: 500 })
  }
}