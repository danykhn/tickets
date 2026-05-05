"use client"

import { useState } from "react"
import { TicketForm } from "@/components/ticket-form"
import { TicketPreview } from "@/components/ticket-preview"
import { ExcelUploader } from "@/components/excel-uploader"
import { TicketTable } from "@/components/ticket-table"
import { PrintExport } from "@/components/print-export"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, FileSpreadsheet } from "lucide-react"
import type { TicketItem, Ticket, BusinessInfo, InvoiceInfo, CustomerInfo, PaymentInfo, FiscalInfo, CustomTax, TicketStyle } from "@/lib/ticket-types"
import { 
  generateId, 
  getDefaultBusinessInfo, 
  getDefaultInvoiceInfo, 
  getDefaultCustomerInfo, 
  getDefaultPaymentInfo, 
  getDefaultFiscalInfo,
  getDefaultTicketStyle
} from "@/lib/ticket-types"

export default function TicketGeneratorPage() {
  // Manual form state
  const [manualItems, setManualItems] = useState<TicketItem[]>([])
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(getDefaultBusinessInfo())
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>(getDefaultInvoiceInfo())
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(getDefaultCustomerInfo())
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(getDefaultPaymentInfo())
  const [fiscalInfo, setFiscalInfo] = useState<FiscalInfo>(getDefaultFiscalInfo())
  const [customTaxes, setCustomTaxes] = useState<CustomTax[]>([])
  const [ticketStyle, setTicketStyle] = useState<TicketStyle>(getDefaultTicketStyle())

  // Excel import state
  const [importedTickets, setImportedTickets] = useState<Ticket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  // Get the selected ticket's items for preview
  const selectedTicket = importedTickets.find((t) => t.id === selectedTicketId)

  const handleTicketsLoaded = (tickets: Ticket[]) => {
    setImportedTickets((prev) => [...prev, ...tickets])
    if (tickets.length > 0) {
      setSelectedTicketId(tickets[0].id)
    }
  }

  const handleDeleteTicket = (id: string) => {
    setImportedTickets((prev) => prev.filter((t) => t.id !== id))
    if (selectedTicketId === id) {
      setSelectedTicketId(importedTickets[0]?.id || null)
    }
  }

  const handleDuplicateTicket = (ticket: Ticket) => {
    const duplicated: Ticket = {
      ...ticket,
      id: generateId(),
      items: ticket.items.map((item) => ({ ...item, id: generateId() })),
      createdAt: new Date(),
    }
    setImportedTickets((prev) => [...prev, duplicated])
  }

  const handleUpdateSelectedTicketItems = (items: TicketItem[]) => {
    if (!selectedTicketId) return
    setImportedTickets((prev) =>
      prev.map((t) => (t.id === selectedTicketId ? { ...t, items } : t))
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Generador de Tickets
              </h1>
              <p className="text-sm text-muted-foreground">
               Genera e imprime tickets
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <Receipt className="h-4 w-4" />
              Entrada Manual
            </TabsTrigger>
            {/* <TabsTrigger value="excel" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Importar Excel
            </TabsTrigger> */}
          </TabsList>

          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <div className="grid lg:grid-cols-[1fr_350px] gap-6">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <TicketForm
                  items={manualItems}
                  onItemsChange={setManualItems}
                  businessInfo={businessInfo}
                  onBusinessInfoChange={setBusinessInfo}
                  invoiceInfo={invoiceInfo}
                  onInvoiceInfoChange={setInvoiceInfo}
                  customerInfo={customerInfo}
                  onCustomerInfoChange={setCustomerInfo}
                  paymentInfo={paymentInfo}
                  onPaymentInfoChange={setPaymentInfo}
                  fiscalInfo={fiscalInfo}
                  onFiscalInfoChange={setFiscalInfo}
                  customTaxes={customTaxes}
                  onCustomTaxesChange={setCustomTaxes}
                  ticketStyle={ticketStyle}
                  onTicketStyleChange={setTicketStyle}
                />
              </div>

              {/* Right Column - Preview & Export */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <PrintExport
                  items={manualItems}
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
          </TabsContent>

          {/* Excel Import Tab */}
          <TabsContent value="excel">
            <div className="grid lg:grid-cols-[1fr_350px] gap-6">
              {/* Left Column - Upload & Table */}
              <div className="space-y-6">
                <ExcelUploader onTicketsLoaded={handleTicketsLoaded} />
                <TicketTable
                  tickets={importedTickets}
                  selectedTicketId={selectedTicketId}
                  onSelectTicket={setSelectedTicketId}
                  onDeleteTicket={handleDeleteTicket}
                  onDuplicateTicket={handleDuplicateTicket}
                />
              </div>

              {/* Right Column - Preview & Export */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                {selectedTicket ? (
                  <PrintExport
                    items={selectedTicket.items}
                    businessInfo={selectedTicket.businessInfo}
                    invoiceInfo={selectedTicket.invoiceInfo}
                    customerInfo={selectedTicket.customerInfo}
                    paymentInfo={selectedTicket.paymentInfo}
                    fiscalInfo={selectedTicket.fiscalInfo}
                    customTaxes={selectedTicket.customTaxes}
                    ticketStyle={selectedTicket.ticketStyle}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vista Previa y Exportar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Selecciona un ticket para ver la vista previa
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
