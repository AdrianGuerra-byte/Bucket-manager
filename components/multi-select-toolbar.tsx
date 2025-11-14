"use client"

import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"

interface MultiSelectToolbarProps {
  selectedCount: number
  onDelete: () => void
  onClear: () => void
}

export function MultiSelectToolbar({ selectedCount, onDelete, onClear }: MultiSelectToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? "archivo seleccionado" : "archivos seleccionados"}
      </span>

      <div className="flex items-center gap-2">
        <Button variant="destructive" size="sm" onClick={onDelete} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>

        <Button variant="ghost" size="sm" onClick={onClear} className="gap-2">
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
