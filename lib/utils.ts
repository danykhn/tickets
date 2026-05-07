import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateToDDMMYYYY(date: string | Date | null | undefined): string {
  if (!date) return ""
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""
    const day = String(dateObj.getDate()).padStart(2, "0")
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const year = dateObj.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return ""
  }
}

export function parseDDMMYYYYToISO(dateString: string): string | null {
  if (!dateString) return null
  try {
    const [day, month, year] = dateString.split("/")
    if (!day || !month || !year) return null
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

