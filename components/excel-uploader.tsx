"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"
import type { TicketItem, Ticket } from "@/lib/ticket-types"
import { 
  generateId, 
  getDefaultBusinessInfo, 
  getDefaultInvoiceInfo, 
  getDefaultCustomerInfo, 
  getDefaultPaymentInfo, 
  getDefaultFiscalInfo,
  getDefaultTicketStyle
} from "@/lib/ticket-types"

interface ExcelUploaderProps {
  onTicketsLoaded: (tickets: Ticket[]) => void
}

interface ExcelRow {
  productName?: string
  product_name?: string
  ProductName?: string
  name?: string
  Name?: string
  nombre?: string
  Nombre?: string
  nombreProducto?: string
  brand?: string
  Brand?: string
  marca?: string
  Marca?: string
  quantity?: number
  Quantity?: number
  qty?: number
  Qty?: number
  cantidad?: number
  Cantidad?: number
  unitPrice?: number
  unit_price?: number
  UnitPrice?: number
  price?: number
  Price?: number
  precio?: number
  Precio?: number
  precioUnitario?: number
  taxRate?: number
  tax_rate?: number
  TaxRate?: number
  tax?: number
  Tax?: number
  iva?: number
  IVA?: number
  tasaIva?: number
}

export function ExcelUploader({ onTicketsLoaded }: ExcelUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setFileName(file.name)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet)

      // Parse rows into tickets (each row becomes a ticket with one item)
      const tickets: Ticket[] = jsonData
        .map((row) => {
          const productName =
            row.productName ||
            row.product_name ||
            row.ProductName ||
            row.name ||
            row.Name ||
            row.nombre ||
            row.Nombre ||
            row.nombreProducto ||
            ""
          const brand =
            row.brand ||
            row.Brand ||
            row.marca ||
            row.Marca ||
            ""
          const quantity =
            row.quantity || row.Quantity || row.qty || row.Qty || row.cantidad || row.Cantidad || 1
          const unitPrice =
            row.unitPrice ||
            row.unit_price ||
            row.UnitPrice ||
            row.price ||
            row.Price ||
            row.precio ||
            row.Precio ||
            row.precioUnitario ||
            0
          const taxRate =
            row.taxRate || row.tax_rate || row.TaxRate || row.tax || row.Tax || row.iva || row.IVA || row.tasaIva || 21

          if (!productName || unitPrice <= 0) return null

          const item: TicketItem = {
            id: generateId(),
            productName: String(productName),
            brand: brand ? String(brand) : undefined,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
            taxRate: Number(taxRate),
          }

          return {
            id: generateId(),
            businessInfo: getDefaultBusinessInfo(),
            invoiceInfo: getDefaultInvoiceInfo(),
            customerInfo: getDefaultCustomerInfo(),
            items: [item],
            customTaxes: [],
            paymentInfo: getDefaultPaymentInfo(),
            fiscalInfo: getDefaultFiscalInfo(),
            ticketStyle: getDefaultTicketStyle(),
            createdAt: new Date(),
          } as Ticket
        })
        .filter((ticket): ticket is Ticket => ticket !== null)

      onTicketsLoaded(tickets)
    } catch (error) {
      console.error("Error al procesar el archivo Excel:", error)
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar desde Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Sube un archivo Excel con las columnas:
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              nombre, marca, cantidad, precio, iva (o en ingles)
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Archivo
              </>
            )}
          </Button>
          {fileName && !isLoading && (
            <p className="text-xs text-muted-foreground">
              Ultimo archivo: {fileName}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
