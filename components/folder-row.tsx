"use client"

import Link from "next/link"
import { Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileItem } from "@/types/files"

interface FolderRowProps {
  item: FileItem
  bucketName: string
}

export function FolderRow({ item, bucketName }: FolderRowProps) {
  return (
    <Link
      href={`/buckets/${bucketName}?subfolder=${item.path}`}
      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="w-8" />
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Folder className="h-5 w-5 flex-shrink-0 text-yellow-500" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" title={item.filename}>
            {item.filename}
          </p>
        </div>
      </div>
    </Link>
  )
}
