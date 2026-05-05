export interface TicketItem {
  id: string
  productName: string
  brand?: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export interface CustomTax {
  id: string
  description: string
  rate: number
}

export interface BusinessInfo {
  logo?: string
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

export interface TicketStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string
  lineHeight: number
}

export interface Ticket {
  id: string
  businessInfo: BusinessInfo
  invoiceInfo: InvoiceInfo
  customerInfo: CustomerInfo
  items: TicketItem[]
  customTaxes: CustomTax[]
  paymentInfo: PaymentInfo
  fiscalInfo: FiscalInfo
  ticketStyle: TicketStyle
  createdAt: Date
}

export interface TicketCalculations {
  lineTotal: number
  subtotal: number
  taxAmount: number
  customTaxesAmount: number
  total: number
}

export function calculateTicket(items: TicketItem[], customTaxes: CustomTax[] = []): TicketCalculations {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice
    return sum + (lineTotal * item.taxRate) / 100
  }, 0)
  
  // Calculate custom taxes based on subtotal
  const customTaxesAmount = customTaxes.reduce((sum, tax) => {
    return sum + (subtotal * tax.rate) / 100
  }, 0)
  
  const total = subtotal + taxAmount + customTaxesAmount

  return {
    lineTotal: subtotal,
    subtotal,
    taxAmount,
    customTaxesAmount,
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
    logo: undefined,
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
    time: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
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

export function getDefaultTicketStyle(): TicketStyle {
  return {
    fontFamily: "Courier New",
    fontSize: 10,
    fontWeight: "normal",
    lineHeight: 1.3,
  }
}

// Recommended font options for fiscal tickets
export const TICKET_FONT_OPTIONS = [
  { value: "Courier New", label: "Courier New (Recomendado)" },
  { value: "Consolas", label: "Consolas" },
  { value: "Monaco", label: "Monaco" },
  { value: "Lucida Console", label: "Lucida Console" },
  { value: "monospace", label: "Monospace Generica" },
]

export const TICKET_FONT_SIZE_OPTIONS = [
  { value: 8, label: "8px - Muy Pequeno" },
  { value: 9, label: "9px - Pequeno" },
  { value: 10, label: "10px - Normal (Recomendado)" },
  { value: 11, label: "11px - Mediano" },
  { value: 12, label: "12px - Grande" },
]

export const TICKET_FONT_WEIGHT_OPTIONS = [
  { value: "normal", label: "Normal (Recomendado)" },
  { value: "bold", label: "Negrita" },
]

export const TICKET_LINE_HEIGHT_OPTIONS = [
  { value: 1.1, label: "1.1 - Compacto" },
  { value: 1.2, label: "1.2 - Ajustado" },
  { value: 1.3, label: "1.3 - Normal (Recomendado)" },
  { value: 1.4, label: "1.4 - Espaciado" },
  { value: 1.5, label: "1.5 - Amplio" },
]
