"use client"

import Link from "next/link"
import type { Bucket } from "@/types/files"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, File, HardDrive } from "lucide-react"
import { formatBytes } from "@/utils/formatters"

interface BucketCardProps {
  bucket: Bucket
}

export function BucketCard({ bucket }: BucketCardProps) {
  return (
    <Link href={`/buckets/${bucket.name}`} className="block hover:scale-105 transition-transform duration-200">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-md">
              <HardDrive className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="truncate">{bucket.name}</CardTitle>
          </div>
          <CardDescription>Creado: {new Date(bucket.created).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <span>{bucket.total_files} archivos</span>
            </div>
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>{formatBytes(bucket.total_size_bytes)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground truncate">
                Path: {bucket.path}
            </p>
        </CardFooter>
      </Card>
    </Link>
  )
}
