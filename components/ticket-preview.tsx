"use client"

import { forwardRef } from "react"
import type { TicketItem, BusinessInfo, InvoiceInfo, CustomerInfo, PaymentInfo, FiscalInfo, CustomTax, TicketStyle } from "@/lib/ticket-types"
import { calculateTicket, formatCurrency, formatQuantity } from "@/lib/ticket-types"

interface TicketPreviewProps {
  items: TicketItem[]
  businessInfo: BusinessInfo
  invoiceInfo: InvoiceInfo
  customerInfo: CustomerInfo
  paymentInfo: PaymentInfo
  fiscalInfo: FiscalInfo
  customTaxes: CustomTax[]
  ticketStyle: TicketStyle
  className?: string
}

export const TicketPreview = forwardRef<HTMLDivElement, TicketPreviewProps>(
  function TicketPreview({ items, businessInfo, invoiceInfo, customerInfo, paymentInfo, fiscalInfo, customTaxes, ticketStyle, className = "" }, ref) {
    const calculations = calculateTicket(items, customTaxes)

    // Group items by tax rate for display
    const taxGroups = items.reduce(
      (groups, item) => {
        const rate = item.taxRate
        if (!groups[rate]) {
          groups[rate] = { subtotal: 0, taxAmount: 0 }
        }
        const lineTotal = item.quantity * item.unitPrice
        groups[rate].subtotal += lineTotal
        groups[rate].taxAmount += (lineTotal * rate) / 100
        return groups
      },
      {} as Record<number, { subtotal: number; taxAmount: number }>
    )

    const actualPayment = paymentInfo.amount || calculations.total
    const change = actualPayment - calculations.total

    return (
      <div
        ref={ref}
        className={`ticket-preview bg-white text-black ${className}`}
        style={{
          width: "80mm",
          minHeight: "80mm",
          padding: "3mm",
          boxSizing: "border-box",
          fontFamily: ticketStyle.fontFamily,
          fontSize: `${ticketStyle.fontSize}px`,
          fontWeight: ticketStyle.fontWeight,
          lineHeight: ticketStyle.lineHeight,
        }}
      >
        {/* Logo */}
        {businessInfo.logo && (
          <div className="text-center mb-2">
            <img 
              src={businessInfo.logo} 
              alt="Logo" 
              style={{ maxHeight: "60px", maxWidth: "100%", margin: "0 auto" }}
            />
          </div>
        )}

        {/* Business Header */}
        <div className="text-center mb-2">
          <div style={{ fontWeight: "bold", fontSize: `${ticketStyle.fontSize + 1}px`, fontStyle: "italic" }}>
            {businessInfo.businessName}
          </div>
        </div>

        {/* Business Details */}
        <div className="mb-2" style={{ lineHeight: ticketStyle.lineHeight }}>
          <div>{businessInfo.legalName}</div>
          <div>CUIT Nro: {businessInfo.cuit}</div>
          <div>ING. BRUTOS: {businessInfo.ingresosBrutos}</div>
          <div>{businessInfo.address}</div>
          <div>{businessInfo.city} ({businessInfo.postalCode}) - {businessInfo.province}</div>
          <div>INICIO DE ACT.: {businessInfo.startDate}</div>
          <div>{businessInfo.taxCategory}</div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Invoice Info */}
        <div className="mb-2">
          <div className="flex justify-between">
            <span style={{ fontWeight: "bold" }}>TICKET FACTURA  {invoiceInfo.invoiceType}</span>
            <span>N°{invoiceInfo.pointOfSale}-{invoiceInfo.invoiceNumber.padStart(8, "0")}</span>
          </div>
          <div className="flex justify-between">
            <span>(COD {invoiceInfo.invoiceCode})</span>
            <span>Fecha {invoiceInfo.date}</span>
          </div>
          <div className="text-right">Hora {invoiceInfo.time}</div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Customer Info */}
        <div className="mb-2" style={{ lineHeight: ticketStyle.lineHeight }}>
          <div>{customerInfo.taxCategory}</div>
          <div>{customerInfo.city} ({customerInfo.postalCode})</div>
          <div>{customerInfo.province}</div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Products */}
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-gray-400">
            No hay productos agregados
          </div>
        ) : (
          <div className="mb-2">
            {items.map((item) => {
              const lineTotal = item.quantity * item.unitPrice
              return (
                <div key={item.id} className="mb-2">
                  <div>{formatQuantity(item.quantity)} U x {formatCurrency(item.unitPrice)}</div>
                  <div>{item.productName}</div>
                  {item.brand && <div>{item.brand}</div>}
                  <div className="flex justify-between">
                    <span>({item.taxRate.toFixed(2)})</span>
                    <span>{formatCurrency(lineTotal)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {items.length > 0 && (
          <>
            {/* Totals Section */}
            <div className="border-t border-gray-400 pt-2 mt-2" style={{ lineHeight: ticketStyle.lineHeight }}>
              <div className="flex justify-between">
                <span>SUBTOT. IMP. NETO GRAVADO</span>
                <span>{formatCurrency(calculations.subtotal)}</span>
              </div>

              {Object.entries(taxGroups).map(([rate, data]) => (
                <div key={rate} className="flex justify-between">
                  <span>ALICUOTA  {parseFloat(rate).toFixed(2)}%</span>
                  <span>{formatCurrency(data.taxAmount)}</span>
                </div>
              ))}

              {/* Custom Taxes */}
              {customTaxes.map((tax) => {
                const taxAmount = (calculations.subtotal * tax.rate) / 100
                return (
                  <div key={tax.id} className="flex justify-between">
                    <span>{tax.description} {tax.rate.toFixed(2)}%</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )
              })}

              <div className="flex justify-between pt-1" style={{ fontWeight: "bold" }}>
                <span>TOTAL</span>
                <span>{formatCurrency(calculations.total)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-t border-gray-400 pt-2 mt-2" style={{ lineHeight: ticketStyle.lineHeight }}>
              <div style={{ fontWeight: "bold" }}>RECIBIMOS</div>
              <div className="flex justify-between">
                <span>{paymentInfo.method}</span>
                <span>{formatCurrency(actualPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Suma de sus pagos</span>
                <span>{formatCurrency(actualPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span>Su vuelto</span>
                <span>{formatCurrency(change > 0 ? change : 0)}</span>
              </div>
            </div>

            {/* Fiscal Footer */}
            <div className="border-t border-gray-400 pt-2 mt-4" style={{ lineHeight: ticketStyle.lineHeight }}>
              <div style={{ fontWeight: "bold" }}>{fiscalInfo.cae}</div>
              <div className="flex justify-between" style={{ fontStyle: "italic" }}>
                <span>DGI</span>
                <span>{fiscalInfo.dgiVersion}  {fiscalInfo.operatorName}</span>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
)
