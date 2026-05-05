"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Trash2, Copy } from "lucide-react"
import type { Ticket } from "@/lib/ticket-types"
import { calculateTicket, formatCurrency } from "@/lib/ticket-types"

interface TicketTableProps {
  tickets: Ticket[]
  selectedTicketId: string | null
  onSelectTicket: (id: string) => void
  onDeleteTicket: (id: string) => void
  onDuplicateTicket: (ticket: Ticket) => void
}

export function TicketTable({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onDeleteTicket,
  onDuplicateTicket,
}: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tickets Importados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay tickets importados aun. Sube un archivo Excel para comenzar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Tickets Importados ({tickets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket, index) => {
                const calculations = calculateTicket(ticket.items)
                const firstItem = ticket.items[0]
                const isSelected = selectedTicketId === ticket.id

                return (
                  <TableRow
                    key={ticket.id}
                    className={isSelected ? "bg-muted" : "cursor-pointer hover:bg-muted/50"}
                    onClick={() => onSelectTicket(ticket.id)}
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {firstItem?.productName || "Sin productos"}
                      {ticket.items.length > 1 && (
                        <span className="text-muted-foreground ml-1">
                          (+{ticket.items.length - 1})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {ticket.items.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${formatCurrency(calculations.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectTicket(ticket.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDuplicateTicket(ticket)
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTicket(ticket.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
