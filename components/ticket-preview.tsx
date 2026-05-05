"use client"

import { forwardRef } from "react"
import type { TicketItem, BusinessInfo, InvoiceInfo, CustomerInfo, PaymentInfo, FiscalInfo } from "@/lib/ticket-types"
import { calculateTicket, formatCurrency, formatQuantity } from "@/lib/ticket-types"

interface TicketPreviewProps {
  items: TicketItem[]
  businessInfo: BusinessInfo
  invoiceInfo: InvoiceInfo
  customerInfo: CustomerInfo
  paymentInfo: PaymentInfo
  fiscalInfo: FiscalInfo
  className?: string
}

export const TicketPreview = forwardRef<HTMLDivElement, TicketPreviewProps>(
  function TicketPreview({ items, businessInfo, invoiceInfo, customerInfo, paymentInfo, fiscalInfo, className = "" }, ref) {
    const calculations = calculateTicket(items)

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
        className={`ticket-preview bg-white text-black font-mono text-[10px] leading-tight ${className}`}
        style={{
          width: "80mm",
          minHeight: "80mm",
          padding: "3mm",
          boxSizing: "border-box",
        }}
      >
        {/* Business Header */}
        <div className="text-center mb-2">
          <div className="font-bold text-[11px] italic">{businessInfo.businessName}</div>
        </div>

        {/* Business Details */}
        <div className="mb-2 space-y-0.5">
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
            <span className="font-bold">TICKET FACTURA  {invoiceInfo.invoiceType}</span>
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
        <div className="mb-2 space-y-0.5">
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
            <div className="border-t border-gray-400 pt-2 mt-2 space-y-0.5">
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

              <div className="flex justify-between font-bold pt-1">
                <span>TOTAL</span>
                <span>{formatCurrency(calculations.total)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-t border-gray-400 pt-2 mt-2 space-y-0.5">
              <div className="font-bold">RECIBIMOS</div>
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
            <div className="border-t border-gray-400 pt-2 mt-4 space-y-0.5">
              <div className="font-bold">{fiscalInfo.cae}</div>
              <div className="flex justify-between italic">
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
