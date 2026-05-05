"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Download } from "lucide-react"
import { jsPDF } from "jspdf"
import type { TicketItem, BusinessInfo, InvoiceInfo, CustomerInfo, PaymentInfo, FiscalInfo } from "@/lib/ticket-types"
import { calculateTicket, formatCurrency, formatQuantity } from "@/lib/ticket-types"
import { TicketPreview } from "./ticket-preview"

interface PrintExportProps {
  items: TicketItem[]
  businessInfo: BusinessInfo
  invoiceInfo: InvoiceInfo
  customerInfo: CustomerInfo
  paymentInfo: PaymentInfo
  fiscalInfo: FiscalInfo
}

export function PrintExport({ items, businessInfo, invoiceInfo, customerInfo, paymentInfo, fiscalInfo }: PrintExportProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = previewRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 10px;
              line-height: 1.3;
              width: 80mm;
              padding: 3mm;
            }
            .header { text-align: center; margin-bottom: 2mm; }
            .business-name { font-weight: bold; font-size: 11px; font-style: italic; }
            .section { margin-bottom: 2mm; }
            .separator { border-top: 1px dashed #999; margin: 2mm 0; }
            .row { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .italic { font-style: italic; }
            .product { margin-bottom: 2mm; }
            .totals { border-top: 1px solid black; padding-top: 2mm; margin-top: 2mm; }
          </style>
        </head>
        <body>
          ${generatePrintHTML(items, businessInfo, invoiceInfo, customerInfo, paymentInfo, fiscalInfo)}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleExportPDF = () => {
    const calculations = calculateTicket(items)
    const actualPayment = paymentInfo.amount || calculations.total
    const change = actualPayment - calculations.total
    
    // Create PDF with 80mm width
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200],
    })

    doc.setFont("courier", "normal")
    let y = 6
    const leftMargin = 3
    const rightMargin = 77
    const lineHeight = 3.5

    // Business Header
    doc.setFontSize(10)
    doc.setFont("courier", "bolditalic")
    doc.text(businessInfo.businessName, 40, y, { align: "center" })
    y += lineHeight + 1

    doc.setFontSize(8)
    doc.setFont("courier", "normal")
    doc.text(businessInfo.legalName, leftMargin, y)
    y += lineHeight
    doc.text(`CUIT Nro: ${businessInfo.cuit}`, leftMargin, y)
    y += lineHeight
    doc.text(`ING. BRUTOS: ${businessInfo.ingresosBrutos}`, leftMargin, y)
    y += lineHeight
    doc.text(businessInfo.address, leftMargin, y)
    y += lineHeight
    doc.text(`${businessInfo.city} (${businessInfo.postalCode}) - ${businessInfo.province}`, leftMargin, y)
    y += lineHeight
    doc.text(`INICIO DE ACT.: ${businessInfo.startDate}`, leftMargin, y)
    y += lineHeight
    doc.text(businessInfo.taxCategory, leftMargin, y)
    y += lineHeight + 1

    // Separator
    doc.setLineDashPattern([1, 1], 0)
    doc.line(leftMargin, y, rightMargin, y)
    y += 3

    // Invoice Info
    doc.setFont("courier", "bold")
    doc.text(`TICKET FACTURA  ${invoiceInfo.invoiceType}`, leftMargin, y)
    doc.text(`N°${invoiceInfo.pointOfSale}-${invoiceInfo.invoiceNumber.padStart(8, "0")}`, rightMargin, y, { align: "right" })
    y += lineHeight
    doc.setFont("courier", "normal")
    doc.text(`(COD ${invoiceInfo.invoiceCode})`, leftMargin, y)
    doc.text(`Fecha ${invoiceInfo.date}`, rightMargin, y, { align: "right" })
    y += lineHeight
    doc.text(`Hora ${invoiceInfo.time}`, rightMargin, y, { align: "right" })
    y += lineHeight + 1

    // Separator
    doc.line(leftMargin, y, rightMargin, y)
    y += 3

    // Customer Info
    doc.text(customerInfo.taxCategory, leftMargin, y)
    y += lineHeight
    doc.text(`${customerInfo.city} (${customerInfo.postalCode})`, leftMargin, y)
    y += lineHeight
    doc.text(customerInfo.province, leftMargin, y)
    y += lineHeight + 1

    // Separator
    doc.line(leftMargin, y, rightMargin, y)
    y += 3

    // Products
    items.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice
      doc.text(`${formatQuantity(item.quantity)} U x ${formatCurrency(item.unitPrice)}`, leftMargin, y)
      y += lineHeight
      doc.text(item.productName.substring(0, 35), leftMargin, y)
      y += lineHeight
      if (item.brand) {
        doc.text(item.brand.substring(0, 35), leftMargin, y)
        y += lineHeight
      }
      doc.text(`(${item.taxRate.toFixed(2)})`, leftMargin, y)
      doc.text(formatCurrency(lineTotal), rightMargin, y, { align: "right" })
      y += lineHeight + 2
    })

    // Totals section
    doc.setLineDashPattern([], 0)
    doc.line(leftMargin, y, rightMargin, y)
    y += 3

    doc.text("SUBTOT. IMP. NETO GRAVADO", leftMargin, y)
    doc.text(formatCurrency(calculations.subtotal), rightMargin, y, { align: "right" })
    y += lineHeight

    // Tax by rate
    const taxGroups = items.reduce(
      (groups, item) => {
        const rate = item.taxRate
        if (!groups[rate]) groups[rate] = 0
        groups[rate] += (item.quantity * item.unitPrice * rate) / 100
        return groups
      },
      {} as Record<number, number>
    )

    Object.entries(taxGroups).forEach(([rate, amount]) => {
      doc.text(`ALICUOTA  ${parseFloat(rate).toFixed(2)}%`, leftMargin, y)
      doc.text(formatCurrency(amount), rightMargin, y, { align: "right" })
      y += lineHeight
    })

    doc.setFont("courier", "bold")
    doc.text("TOTAL", leftMargin, y)
    doc.text(formatCurrency(calculations.total), rightMargin, y, { align: "right" })
    y += lineHeight + 2

    // Payment section
    doc.line(leftMargin, y, rightMargin, y)
    y += 3

    doc.text("RECIBIMOS", leftMargin, y)
    y += lineHeight
    doc.setFont("courier", "normal")
    doc.text(paymentInfo.method, leftMargin, y)
    doc.text(formatCurrency(actualPayment), rightMargin, y, { align: "right" })
    y += lineHeight
    doc.text("Suma de sus pagos", leftMargin, y)
    doc.text(formatCurrency(actualPayment), rightMargin, y, { align: "right" })
    y += lineHeight
    doc.text("Su vuelto", leftMargin, y)
    doc.text(formatCurrency(change > 0 ? change : 0), rightMargin, y, { align: "right" })
    y += lineHeight + 2

    // Fiscal footer
    doc.line(leftMargin, y, rightMargin, y)
    y += 3
    doc.setFont("courier", "bold")
    doc.text(fiscalInfo.cae, leftMargin, y)
    y += lineHeight
    doc.setFont("courier", "italic")
    doc.text("DGI", leftMargin, y)
    doc.text(`${fiscalInfo.dgiVersion}  ${fiscalInfo.operatorName}`, rightMargin, y, { align: "right" })

    doc.save(`ticket_${businessInfo.businessName}_${invoiceInfo.invoiceNumber}_${invoiceInfo.date}.pdf`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vista Previa y Exportar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden preview for printing */}
        <div className="hidden">
          <TicketPreview
            ref={previewRef}
            items={items}
            businessInfo={businessInfo}
            invoiceInfo={invoiceInfo}
            customerInfo={customerInfo}
            paymentInfo={paymentInfo}
            fiscalInfo={fiscalInfo}
          />
        </div>

        {/* Visible preview */}
        <div className="flex justify-center bg-muted/30 rounded-lg p-4 overflow-auto max-h-[600px]">
          <div className="shadow-lg">
            <TicketPreview
              items={items}
              businessInfo={businessInfo}
              invoiceInfo={invoiceInfo}
              customerInfo={customerInfo}
              paymentInfo={paymentInfo}
              fiscalInfo={fiscalInfo}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            disabled={items.length === 0}
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={items.length === 0}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function generatePrintHTML(
  items: TicketItem[],
  businessInfo: BusinessInfo,
  invoiceInfo: InvoiceInfo,
  customerInfo: CustomerInfo,
  paymentInfo: PaymentInfo,
  fiscalInfo: FiscalInfo
): string {
  const calculations = calculateTicket(items)
  const actualPayment = paymentInfo.amount || calculations.total
  const change = actualPayment - calculations.total

  const taxGroups = items.reduce(
    (groups, item) => {
      const rate = item.taxRate
      if (!groups[rate]) groups[rate] = 0
      groups[rate] += (item.quantity * item.unitPrice * rate) / 100
      return groups
    },
    {} as Record<number, number>
  )

  let html = ""

  // Business Header
  html += `<div class="header"><div class="business-name">${businessInfo.businessName}</div></div>`
  html += `<div class="section">`
  html += `<div>${businessInfo.legalName}</div>`
  html += `<div>CUIT Nro: ${businessInfo.cuit}</div>`
  html += `<div>ING. BRUTOS: ${businessInfo.ingresosBrutos}</div>`
  html += `<div>${businessInfo.address}</div>`
  html += `<div>${businessInfo.city} (${businessInfo.postalCode}) - ${businessInfo.province}</div>`
  html += `<div>INICIO DE ACT.: ${businessInfo.startDate}</div>`
  html += `<div>${businessInfo.taxCategory}</div>`
  html += `</div>`

  // Separator
  html += `<div class="separator"></div>`

  // Invoice Info
  html += `<div class="section">`
  html += `<div class="row"><span class="bold">TICKET FACTURA  ${invoiceInfo.invoiceType}</span><span>N°${invoiceInfo.pointOfSale}-${invoiceInfo.invoiceNumber.padStart(8, "0")}</span></div>`
  html += `<div class="row"><span>(COD ${invoiceInfo.invoiceCode})</span><span>Fecha ${invoiceInfo.date}</span></div>`
  html += `<div style="text-align: right">Hora ${invoiceInfo.time}</div>`
  html += `</div>`

  // Separator
  html += `<div class="separator"></div>`

  // Customer Info
  html += `<div class="section">`
  html += `<div>${customerInfo.taxCategory}</div>`
  html += `<div>${customerInfo.city} (${customerInfo.postalCode})</div>`
  html += `<div>${customerInfo.province}</div>`
  html += `</div>`

  // Separator
  html += `<div class="separator"></div>`

  // Products
  items.forEach((item) => {
    const lineTotal = item.quantity * item.unitPrice
    html += `<div class="product">`
    html += `<div>${formatQuantity(item.quantity)} U x ${formatCurrency(item.unitPrice)}</div>`
    html += `<div>${item.productName}</div>`
    if (item.brand) {
      html += `<div>${item.brand}</div>`
    }
    html += `<div class="row"><span>(${item.taxRate.toFixed(2)})</span><span>${formatCurrency(lineTotal)}</span></div>`
    html += `</div>`
  })

  // Totals
  html += `<div class="totals">`
  html += `<div class="row"><span>SUBTOT. IMP. NETO GRAVADO</span><span>${formatCurrency(calculations.subtotal)}</span></div>`

  Object.entries(taxGroups).forEach(([rate, amount]) => {
    html += `<div class="row"><span>ALICUOTA  ${parseFloat(rate).toFixed(2)}%</span><span>${formatCurrency(amount)}</span></div>`
  })

  html += `<div class="row bold"><span>TOTAL</span><span>${formatCurrency(calculations.total)}</span></div>`
  html += `</div>`

  // Payment
  html += `<div class="separator" style="border-top: 1px solid black;"></div>`
  html += `<div class="section">`
  html += `<div class="bold">RECIBIMOS</div>`
  html += `<div class="row"><span>${paymentInfo.method}</span><span>${formatCurrency(actualPayment)}</span></div>`
  html += `<div class="row"><span>Suma de sus pagos</span><span>${formatCurrency(actualPayment)}</span></div>`
  html += `<div class="row"><span>Su vuelto</span><span>${formatCurrency(change > 0 ? change : 0)}</span></div>`
  html += `</div>`

  // Fiscal Footer
  html += `<div class="separator" style="border-top: 1px solid black;"></div>`
  html += `<div class="section">`
  html += `<div class="bold">${fiscalInfo.cae}</div>`
  html += `<div class="row italic"><span>DGI</span><span>${fiscalInfo.dgiVersion}  ${fiscalInfo.operatorName}</span></div>`
  html += `</div>`

  return html
}
