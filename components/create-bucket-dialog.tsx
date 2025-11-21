"use client"

import { useState } from "react"
import { FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/hooks/use-api-client"
import { useRouter } from "next/navigation"

interface CreateBucketDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateBucketDialog({ open: controlledOpen, onOpenChange }: CreateBucketDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [bucketName, setBucketName] = useState("")
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  const apiClient = useApiClient()
  const router = useRouter()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  const validateBucketName = (name: string): string | null => {
    if (name.length === 0) return "El nombre no puede estar vacío"
    if (name.length > 40) return "El nombre no puede exceder 40 caracteres"
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
      return "Solo se permiten letras minúsculas, números y guiones (debe empezar y terminar con letra o número)"
    }
    return null
  }

  const handleCreate = async () => {
    const error = validateBucketName(bucketName)
    if (error) {
      toast({
        title: "Nombre inválido",
        description: error,
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      await apiClient.createBucket(bucketName)
      toast({
        title: "Bucket creado",
        description: `El bucket "${bucketName}" se creó correctamente`,
      })
      setOpen(false)
      setBucketName("")
      router.push(`/buckets/${bucketName}`)
    } catch (error) {
      toast({
        title: "Error al crear bucket",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            Crear Bucket
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo bucket</DialogTitle>
          <DialogDescription>
            Los nombres de bucket deben usar solo letras minúsculas, números y guiones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bucket-name">Nombre del bucket</Label>
            <Input
              id="bucket-name"
              placeholder="mi-bucket-ejemplo"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value.toLowerCase())}
              disabled={creating}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate()
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Ejemplo: datos-usuarios, archivos-2025
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              setBucketName("")
            }}
            disabled={creating}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating || !bucketName}>
            {creating ? "Creando..." : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
