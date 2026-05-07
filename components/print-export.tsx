"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Download } from "lucide-react"
import { jsPDF } from "jspdf"
import type { TicketItem, BusinessInfo, InvoiceInfo, CustomerInfo, PaymentInfo, FiscalInfo, CustomTax, TicketStyle } from "@/lib/ticket-types"
import { calculateTicket, formatCurrency, formatQuantity } from "@/lib/ticket-types"
import { TicketPreview } from "./ticket-preview"
import { createBusiness } from "@/lib/api/business"

interface PrintExportProps {
  items: TicketItem[]
  businessInfo: BusinessInfo
  invoiceInfo: InvoiceInfo
  customerInfo: CustomerInfo
  paymentInfo: PaymentInfo
  fiscalInfo: FiscalInfo
  customTaxes: CustomTax[]
  ticketStyle: TicketStyle
}

export function PrintExport({ 
  items, 
  businessInfo, 
  invoiceInfo, 
  customerInfo, 
  paymentInfo, 
  fiscalInfo,
  customTaxes,
  ticketStyle 
}: PrintExportProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    // Guardar negocio en el backend
    let startDateFormatted = null
    if (businessInfo.startDate) {
      const date = new Date(businessInfo.startDate)
      if (!isNaN(date.getTime())) {
        startDateFormatted = date.toISOString()
      }
    }
    
    const businessData = {
      businessName: businessInfo.businessName,
      legalName: businessInfo.legalName,
      cuit: businessInfo.cuit,
      ingresosBrutos: businessInfo.ingresosBrutos,
      address: businessInfo.address,
      city: businessInfo.city,
      postalCode: businessInfo.postalCode,
      province: businessInfo.province,
      startDate: startDateFormatted,
      taxCategory: businessInfo.taxCategory,
      logo: businessInfo.logo,
    }
    
    try {
      await createBusiness(businessData)
    } catch (error) {
      console.error("Error saving business:", error)
    }

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
              font-family: '${ticketStyle.fontFamily}', 'Courier New', Courier, monospace;
              font-size: ${ticketStyle.fontSize}px;
              font-weight: ${ticketStyle.fontWeight};
              line-height: ${ticketStyle.lineHeight};
              width: 80mm;
              height: 180mm;
              padding: 3mm;
              margin-bottom: 50mm;
            }
            .header { text-align: center; margin-bottom: 2mm; }
            .logo { max-height: 60px; max-width: 100%; margin: 0 auto 2mm auto; display: block; }
            .business-name { font-weight: bold; font-size: ${ticketStyle.fontSize + 1}px; font-style: italic; margin-top: 15px; margin-bottom: 15px; }
            .section { margin-bottom: 2mm; }
            .separator { border-top: 1px dashed #999; margin: 2mm 0; }
            .row { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .italic { font-style: italic; }
            .product { height: auto;}
            .totals {  margin-top: 20px; }
          </style>
        </head>
        <body>
          ${generatePrintHTML(items, businessInfo, invoiceInfo, customerInfo, paymentInfo, fiscalInfo, customTaxes, ticketStyle)}
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
    const calculations = calculateTicket(items, customTaxes)
    const actualPayment = paymentInfo.amount || calculations.total
    const change = actualPayment - calculations.total
    
    // Map font names to jsPDF-compatible fonts
    const fontMap: Record<string, string> = {
      "Courier New": "courier",
      "Consolas": "courier",
      "Monaco": "courier",
      "Lucida Console": "courier",
      "monospace": "courier",
    }
    const pdfFont = fontMap[ticketStyle.fontFamily] || "courier"
    
    // Create PDF with 80mm width x 180mm height
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 180],
    })

    doc.setFont(pdfFont, ticketStyle.fontWeight === "bold" ? "bold" : "normal")
    let y = 6
    const leftMargin = 3
    const rightMargin = 77
    const lineHeight = ticketStyle.lineHeight * 2.5

    // Logo (if present - note: jsPDF has limitations with base64 images)
    if (businessInfo.logo) {
      try {
        doc.addImage(businessInfo.logo, "JPEG", 25, y, 30, 15)
        y += 18
      } catch {
        // Skip logo if it can't be added
      }
    }

    // Business Header
    doc.setFontSize(ticketStyle.fontSize + 1)
    doc.setFont(pdfFont, "bolditalic")
    doc.text(businessInfo.businessName, 40, y, { align: "center" })
    y += lineHeight + 1

    doc.setFontSize(ticketStyle.fontSize)
    doc.setFont(pdfFont, ticketStyle.fontWeight === "bold" ? "bold" : "normal")
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
    doc.setFont(pdfFont, "bold")
    doc.text(`TICKET FACTURA  ${invoiceInfo.invoiceType}`, leftMargin, y)
    doc.text(`N°${invoiceInfo.pointOfSale}-${invoiceInfo.invoiceNumber.padStart(8, "0")}`, rightMargin, y, { align: "right" })
    y += lineHeight
    doc.setFont(pdfFont, ticketStyle.fontWeight === "bold" ? "bold" : "normal")
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

    // Custom taxes
    customTaxes.forEach((tax) => {
      const taxAmount = (calculations.subtotal * tax.rate) / 100
      doc.text(`${tax.description} ${tax.rate.toFixed(2)}%`.substring(0, 30), leftMargin, y)
      doc.text(formatCurrency(taxAmount), rightMargin, y, { align: "right" })
      y += lineHeight
    })

    doc.setFont(pdfFont, "bold")
    doc.text("TOTAL", leftMargin, y)
    doc.text(formatCurrency(calculations.total), rightMargin, y, { align: "right" })
    y += lineHeight + 2

    // Payment section
    doc.line(leftMargin, y, rightMargin, y)
    y += 3

    doc.text("RECIBIMOS", leftMargin, y)
    y += lineHeight
    doc.setFont(pdfFont, ticketStyle.fontWeight === "bold" ? "bold" : "normal")
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
  
    doc.setFont(pdfFont, "bold")
    doc.text(`CF ${fiscalInfo.cae}`, leftMargin, y)
    y += lineHeight
    doc.setFont(pdfFont, "italic")
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
            customTaxes={customTaxes}
            ticketStyle={ticketStyle}
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
              customTaxes={customTaxes}
              ticketStyle={ticketStyle}
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
  fiscalInfo: FiscalInfo,
  customTaxes: CustomTax[],
  ticketStyle: TicketStyle
): string {
  const calculations = calculateTicket(items, customTaxes)
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

  // Logo
  if (businessInfo.logo) {
    html += `<div class="header"><img src="${businessInfo.logo}" alt="Logo" class="logo" /></div>`
  }

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

  // Custom taxes
  customTaxes.forEach((tax) => {
    const taxAmount = (calculations.subtotal * tax.rate) / 100
    html += `<div class="row"><span>${tax.description} ${tax.rate.toFixed(2)}%</span><span>${formatCurrency(taxAmount)}</span></div>`
  })

  html += `<div class="row bold" style="margin-top:15px;"><span>TOTAL</span><span>${formatCurrency(calculations.total)}</span></div>`
  html += `</div>`

  // Payment
 
  html += `<div class="section">`
  html += `<div class="bold">RECIBIMOS</div>`
  html += `<div class="row"><span>${paymentInfo.method}</span><span>${formatCurrency(actualPayment)}</span></div>`
  html += `<div class="row"><span>Suma de sus pagos</span><span>${formatCurrency(actualPayment)}</span></div>`
  html += `<div class="row"><span>Su vuelto</span><span>${formatCurrency(change > 0 ? change : 0)}</span></div>`
  html += `</div>`

  // Fiscal Footer

  html += `<div class="section" style="margin-top:30px; margin-bottom: 30px;">`
  html += `<div class="bold"><span style="font-family:'Bradley Hand ITC', cursive;">CF</span> ${fiscalInfo.cae}</div>`
  html += `<div class="row italic"><span style="font-family:'Bradley Hand ITC', cursive;">DGI</span><span>${fiscalInfo.dgiVersion}  ${fiscalInfo.operatorName}</span></div>`
  html += `</div>`

  return html
}
