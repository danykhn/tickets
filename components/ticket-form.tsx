"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Trash2, Building2, FileText, User, CreditCard, Shield, Type, ImageIcon, X } from "lucide-react"
import type { TicketItem, BusinessInfo, InvoiceInfo, CustomerInfo, PaymentInfo, FiscalInfo, CustomTax, TicketStyle } from "@/lib/ticket-types"
import { 
  generateId, 
  TICKET_FONT_OPTIONS, 
  TICKET_FONT_SIZE_OPTIONS, 
  TICKET_FONT_WEIGHT_OPTIONS, 
  TICKET_LINE_HEIGHT_OPTIONS 
} from "@/lib/ticket-types"

interface TicketFormProps {
  items: TicketItem[]
  onItemsChange: (items: TicketItem[]) => void
  businessInfo: BusinessInfo
  onBusinessInfoChange: (info: BusinessInfo) => void
  invoiceInfo: InvoiceInfo
  onInvoiceInfoChange: (info: InvoiceInfo) => void
  customerInfo: CustomerInfo
  onCustomerInfoChange: (info: CustomerInfo) => void
  paymentInfo: PaymentInfo
  onPaymentInfoChange: (info: PaymentInfo) => void
  fiscalInfo: FiscalInfo
  onFiscalInfoChange: (info: FiscalInfo) => void
  customTaxes: CustomTax[]
  onCustomTaxesChange: (taxes: CustomTax[]) => void
  ticketStyle: TicketStyle
  onTicketStyleChange: (style: TicketStyle) => void
}

export function TicketForm({
  items,
  onItemsChange,
  businessInfo,
  onBusinessInfoChange,
  invoiceInfo,
  onInvoiceInfoChange,
  customerInfo,
  onCustomerInfoChange,
  paymentInfo,
  onPaymentInfoChange,
  fiscalInfo,
  onFiscalInfoChange,
  customTaxes,
  onCustomTaxesChange,
  ticketStyle,
  onTicketStyleChange,
}: TicketFormProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  const [newItem, setNewItem] = useState<Omit<TicketItem, "id">>({
    productName: "",
    brand: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 21,
  })

  const [newTax, setNewTax] = useState<Omit<CustomTax, "id">>({
    description: "",
    rate: 0,
  })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onBusinessInfoChange({ ...businessInfo, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    onBusinessInfoChange({ ...businessInfo, logo: undefined })
    if (logoInputRef.current) {
      logoInputRef.current.value = ""
    }
  }

  const addItem = () => {
    if (!newItem.productName.trim() || newItem.unitPrice <= 0) return

    const item: TicketItem = {
      ...newItem,
      id: generateId(),
    }
    onItemsChange([...items, item])
    setNewItem({
      productName: "",
      brand: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: newItem.taxRate,
    })
  }

  const updateItem = (id: string, field: keyof TicketItem, value: string | number) => {
    onItemsChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id))
  }

  const addCustomTax = () => {
    if (!newTax.description.trim() || newTax.rate <= 0) return

    const tax: CustomTax = {
      ...newTax,
      id: generateId(),
    }
    onCustomTaxesChange([...customTaxes, tax])
    setNewTax({
      description: "",
      rate: 0,
    })
  }

  const removeCustomTax = (id: string) => {
    onCustomTaxesChange(customTaxes.filter((tax) => tax.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem()
    }
  }

  const handleTaxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustomTax()
    }
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["business", "invoice", "products"]} className="space-y-2">
        {/* Business Info Section */}
        <AccordionItem value="business" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Datos del Negocio</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pb-4">
              {/* Logo Upload */}
              <div className="col-span-2">
                <Label className="text-xs">Logo del Negocio</Label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  {businessInfo.logo ? (
                    <div className="relative">
                      <img 
                        src={businessInfo.logo} 
                        alt="Logo" 
                        className="h-16 w-auto object-contain border rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5"
                        onClick={removeLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      className="h-16 w-24"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-xs">Cargar</span>
                      </div>
                    </Button>
                  )}
                  {businessInfo.logo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      Cambiar
                    </Button>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Nombre Comercial</Label>
                <Input
                  value={businessInfo.businessName}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, businessName: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Razon Social</Label>
                <Input
                  value={businessInfo.legalName}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, legalName: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">CUIT</Label>
                <Input
                  value={businessInfo.cuit}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, cuit: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Ingresos Brutos</Label>
                <Input
                  value={businessInfo.ingresosBrutos}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, ingresosBrutos: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Direccion</Label>
                <Input
                  value={businessInfo.address}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, address: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Ciudad</Label>
                <Input
                  value={businessInfo.city}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, city: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Codigo Postal</Label>
                <Input
                  value={businessInfo.postalCode}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, postalCode: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Provincia</Label>
                <Input
                  value={businessInfo.province}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, province: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Inicio de Actividad</Label>
                <Input
                  value={businessInfo.startDate}
                  onChange={(e) => onBusinessInfoChange({ ...businessInfo, startDate: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Condicion ante IVA</Label>
                <Select
                  value={businessInfo.taxCategory}
                  onValueChange={(value) => onBusinessInfoChange({ ...businessInfo, taxCategory: value })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IVA RESPONSABLE INSCRIPTO">IVA Responsable Inscripto</SelectItem>
                    <SelectItem value="IVA RESPONSABLE NO INSCRIPTO">IVA Responsable No Inscripto</SelectItem>
                    <SelectItem value="IVA EXENTO">IVA Exento</SelectItem>
                    <SelectItem value="CONSUMIDOR FINAL">Consumidor Final</SelectItem>
                    <SelectItem value="MONOTRIBUTISTA">Monotributista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Invoice Info Section */}
        <AccordionItem value="invoice" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Datos de la Factura</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pb-4">
              <div>
                <Label className="text-xs">Tipo de Factura</Label>
                <Select
                  value={invoiceInfo.invoiceType}
                  onValueChange={(value) => onInvoiceInfoChange({ ...invoiceInfo, invoiceType: value })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Factura A</SelectItem>
                    <SelectItem value="B">Factura B</SelectItem>
                    <SelectItem value="C">Factura C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Codigo</Label>
                <Input
                  value={invoiceInfo.invoiceCode}
                  onChange={(e) => onInvoiceInfoChange({ ...invoiceInfo, invoiceCode: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Punto de Venta</Label>
                <Input
                  value={invoiceInfo.pointOfSale}
                  onChange={(e) => onInvoiceInfoChange({ ...invoiceInfo, pointOfSale: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Numero de Factura</Label>
                <Input
                  value={invoiceInfo.invoiceNumber}
                  onChange={(e) => onInvoiceInfoChange({ ...invoiceInfo, invoiceNumber: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Fecha</Label>
                <Input
                  value={invoiceInfo.date}
                  onChange={(e) => onInvoiceInfoChange({ ...invoiceInfo, date: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Hora (24h)</Label>
                <Input
                  type="time"
                  step="1"
                  value={invoiceInfo.time}
                  onChange={(e) => onInvoiceInfoChange({ ...invoiceInfo, time: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Customer Info Section */}
        <AccordionItem value="customer" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Datos del Cliente</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pb-4">
              <div className="col-span-2">
                <Label className="text-xs">Condicion ante IVA</Label>
                <Select
                  value={customerInfo.taxCategory}
                  onValueChange={(value) => onCustomerInfoChange({ ...customerInfo, taxCategory: value })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IVA RESPONSABLE INSCRIPTO">IVA Responsable Inscripto</SelectItem>
                    <SelectItem value="IVA RESPONSABLE NO INSCRIPTO">IVA Responsable No Inscripto</SelectItem>
                    <SelectItem value="IVA EXENTO">IVA Exento</SelectItem>
                    <SelectItem value="CONSUMIDOR FINAL">Consumidor Final</SelectItem>
                    <SelectItem value="MONOTRIBUTISTA">Monotributista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ciudad</Label>
                <Input
                  value={customerInfo.city}
                  onChange={(e) => onCustomerInfoChange({ ...customerInfo, city: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Codigo Postal</Label>
                <Input
                  value={customerInfo.postalCode}
                  onChange={(e) => onCustomerInfoChange({ ...customerInfo, postalCode: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Provincia</Label>
                <Input
                  value={customerInfo.province}
                  onChange={(e) => onCustomerInfoChange({ ...customerInfo, province: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Products Section */}
        <AccordionItem value="products" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Productos ({items.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pb-4">
              {/* New Item Form */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="col-span-2">
                  <Label className="text-xs">Nombre del Producto</Label>
                  <Input
                    value={newItem.productName}
                    onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Ej: Multiherramienta 18v"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Marca (opcional)</Label>
                  <Input
                    value={newItem.brand || ""}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="Ej: Lusqtoff Powerlink"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                    onKeyDown={handleKeyDown}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Precio Unitario</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.unitPrice || ""}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    onKeyDown={handleKeyDown}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">IVA (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.taxRate}
                    onChange={(e) => setNewItem({ ...newItem, taxRate: parseFloat(e.target.value) || 0 })}
                    onKeyDown={handleKeyDown}
                    placeholder="Ej: 21"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addItem} size="sm" className="w-full h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_auto] gap-2 p-2 bg-muted/30 rounded-lg"
                    >
                      <div className="space-y-1">
                        <Input
                          value={item.productName}
                          onChange={(e) => updateItem(item.id, "productName", e.target.value)}
                          placeholder="Nombre"
                          className="h-7 text-xs"
                        />
                        <Input
                          value={item.brand || ""}
                          onChange={(e) => updateItem(item.id, "brand", e.target.value)}
                          placeholder="Marca"
                          className="h-7 text-xs"
                        />
                        <div className="grid grid-cols-3 gap-1">
                          <Input
                            type="number"
                            step="0.0001"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            placeholder="Cant."
                            className="h-7 text-xs"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            placeholder="Precio"
                            className="h-7 text-xs"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.taxRate}
                            onChange={(e) => updateItem(item.id, "taxRate", parseFloat(e.target.value) || 0)}
                            placeholder="IVA %"
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom Taxes Section */}
        <AccordionItem value="customTaxes" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Impuestos Adicionales ({customTaxes.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pb-4">
              <p className="text-xs text-muted-foreground">
                Agrega impuestos adicionales que se calcularan sobre el subtotal. Ej: Percepciones, retenciones, otros gravamenes.
              </p>
              {/* New Tax Form */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="col-span-2">
                  <Label className="text-xs">Descripcion del Impuesto</Label>
                  <Input
                    value={newTax.description}
                    onChange={(e) => setNewTax({ ...newTax, description: e.target.value })}
                    onKeyDown={handleTaxKeyDown}
                    placeholder="Ej: Percepcion IIBB 3%"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tasa (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTax.rate || ""}
                    onChange={(e) => setNewTax({ ...newTax, rate: parseFloat(e.target.value) || 0 })}
                    onKeyDown={handleTaxKeyDown}
                    placeholder="Ej: 3"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <Button onClick={addCustomTax} size="sm" className="w-full h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Impuesto
                  </Button>
                </div>
              </div>

              {/* Custom Taxes List */}
              {customTaxes.length > 0 && (
                <div className="space-y-2">
                  {customTaxes.map((tax) => (
                    <div
                      key={tax.id}
                      className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="text-sm">{tax.description}</span>
                        <span className="text-xs text-muted-foreground ml-2">({tax.rate}%)</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomTax(tax.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Payment Info Section */}
        <AccordionItem value="payment" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Forma de Pago</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pb-4">
              <div>
                <Label className="text-xs">Metodo de Pago</Label>
                <Select
                  value={paymentInfo.method}
                  onValueChange={(value) => onPaymentInfoChange({ ...paymentInfo, method: value })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta de Debito">Tarjeta de Debito</SelectItem>
                    <SelectItem value="Tarjeta de Credito">Tarjeta de Credito</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Monto Recibido</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentInfo.amount || ""}
                  onChange={(e) => onPaymentInfoChange({ ...paymentInfo, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Dejar vacio = total"
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fiscal Info Section */}
        <AccordionItem value="fiscal" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Datos Fiscales</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pb-4">
              <div className="col-span-2">
                <Label className="text-xs">CAE / CF</Label>
                <Input
                  value={fiscalInfo.cae}
                  onChange={(e) => onFiscalInfoChange({ ...fiscalInfo, cae: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Version DGI</Label>
                <Input
                  value={fiscalInfo.dgiVersion}
                  onChange={(e) => onFiscalInfoChange({ ...fiscalInfo, dgiVersion: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Nombre Operador</Label>
                <Input
                  value={fiscalInfo.operatorName}
                  onChange={(e) => onFiscalInfoChange({ ...fiscalInfo, operatorName: e.target.value })}
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Ticket Style Section */}
        <AccordionItem value="style" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="font-medium">Formato del Ticket</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pb-4">
              <div className="col-span-2">
                <Label className="text-xs">Tipografia</Label>
                <Select
                  value={ticketStyle.fontFamily}
                  onValueChange={(value) => onTicketStyleChange({ ...ticketStyle, fontFamily: value })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_FONT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span style={{ fontFamily: option.value }}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Se recomienda usar fuentes monoespaciadas para tickets fiscales
                </p>
              </div>
              <div>
                <Label className="text-xs">Tamano de Fuente</Label>
                <Select
                  value={ticketStyle.fontSize.toString()}
                  onValueChange={(value) => onTicketStyleChange({ ...ticketStyle, fontSize: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_FONT_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Peso de Fuente</Label>
                <Select
                  value={ticketStyle.fontWeight}
                  onValueChange={(value) => onTicketStyleChange({ ...ticketStyle, fontWeight: value })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_FONT_WEIGHT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Altura de Linea</Label>
                <Select
                  value={ticketStyle.lineHeight.toString()}
                  onValueChange={(value) => onTicketStyleChange({ ...ticketStyle, lineHeight: parseFloat(value) })}
                >
                  <SelectTrigger className="mt-1 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_LINE_HEIGHT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
