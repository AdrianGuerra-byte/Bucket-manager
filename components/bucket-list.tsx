"use client"

import type { Bucket } from "@/types/files"
import { BucketCard } from "./bucket-card"

interface BucketListProps {
  buckets: Bucket[]
}

export function BucketList({ buckets }: BucketListProps) {
  if (buckets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No se encontraron buckets.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {buckets.map((bucket) => (
        <BucketCard key={bucket.name} bucket={bucket} />
      ))}
    </div>
  )
}