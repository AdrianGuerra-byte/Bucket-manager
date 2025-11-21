"use client"

import { useState } from "react"
import type { Bucket } from "@/types/files"
import { BucketCard } from "./bucket-card"
import { CreateBucketDialog } from "./create-bucket-dialog"
import { Button } from "./ui/button"
import { FolderPlus } from "lucide-react"

interface BucketListProps {
  buckets: Bucket[]
}

export function BucketList({ buckets }: BucketListProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  if (buckets.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Crear Bucket
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No se encontraron buckets.</p>
        </div>
        <CreateBucketDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Crear Bucket
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {buckets.map((bucket) => (
          <BucketCard key={bucket.name} bucket={bucket} />
        ))}
      </div>
      <CreateBucketDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}