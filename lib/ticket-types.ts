export interface TicketItem {
  id: string
  productName: string
  brand?: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export interface BusinessInfo {
  businessName: string
  legalName: string
  cuit: string
  ingresosBrutos: string
  address: string
  city: string
  postalCode: string
  province: string
  startDate: string
  taxCategory: string
}

export interface InvoiceInfo {
  invoiceType: string
  invoiceCode: string
  invoiceNumber: string
  pointOfSale: string
  date: string
  time: string
}

export interface CustomerInfo {
  taxCategory: string
  city: string
  postalCode: string
  province: string
}

export interface PaymentInfo {
  method: string
  amount: number
  totalPaid: number
  change: number
}

export interface FiscalInfo {
  cae: string
  dgiVersion: string
  operatorName: string
}

export interface Ticket {
  id: string
  businessInfo: BusinessInfo
  invoiceInfo: InvoiceInfo
  customerInfo: CustomerInfo
  items: TicketItem[]
  paymentInfo: PaymentInfo
  fiscalInfo: FiscalInfo
  createdAt: Date
}

export interface TicketCalculations {
  lineTotal: number
  subtotal: number
  taxAmount: number
  total: number
}

export function calculateTicket(items: TicketItem[]): TicketCalculations {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice
    return sum + (lineTotal * item.taxRate) / 100
  }, 0)
  const total = subtotal + taxAmount

  return {
    lineTotal: subtotal,
    subtotal,
    taxAmount,
    total,
  }
}

export function formatCurrency(value: number): string {
  return value.toFixed(2)
}

export function formatQuantity(value: number): string {
  return value.toFixed(4)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function getDefaultBusinessInfo(): BusinessInfo {
  return {
    businessName: "NOMBRE DEL NEGOCIO",
    legalName: "RAZON SOCIAL S.A.",
    cuit: "30-00000000-0",
    ingresosBrutos: "30-00000000-0",
    address: "DIRECCION 123",
    city: "CIUDAD",
    postalCode: "0000",
    province: "PROVINCIA",
    startDate: "01/01/2020",
    taxCategory: "IVA RESPONSABLE INSCRIPTO",
  }
}

export function getDefaultInvoiceInfo(): InvoiceInfo {
  const now = new Date()
  return {
    invoiceType: "A",
    invoiceCode: "081",
    invoiceNumber: "00000001",
    pointOfSale: "0001",
    date: now.toLocaleDateString("es-AR"),
    time: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  }
}

export function getDefaultCustomerInfo(): CustomerInfo {
  return {
    taxCategory: "IVA RESPONSABLE INSCRIPTO",
    city: "CIUDAD",
    postalCode: "0000",
    province: "PROVINCIA",
  }
}

export function getDefaultPaymentInfo(): PaymentInfo {
  return {
    method: "Efectivo",
    amount: 0,
    totalPaid: 0,
    change: 0,
  }
}

export function getDefaultFiscalInfo(): FiscalInfo {
  return {
    cae: "CF    XXXXXXXXXXXXXXXXX",
    dgiVersion: "V:01.02",
    operatorName: "Operador",
  }
}
