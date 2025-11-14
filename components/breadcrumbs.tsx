"use client"

import { ChevronRight, Home, FolderOpen } from "lucide-react"
import Link from "next/link"

interface BreadcrumbsProps {
  bucketName: string
  subfolder?: string
}

export function Breadcrumbs({ bucketName, subfolder }: BreadcrumbsProps) {
  const parts = subfolder ? subfolder.split("/").filter(Boolean) : []

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <FolderOpen className="h-4 w-4" />
        <span>Buckets</span>
      </Link>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      
      <Link
        href={`/buckets/${bucketName}`}
        className={`flex items-center gap-1 transition-colors ${
          parts.length === 0 ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Home className="h-4 w-4" />
        <span>{bucketName}</span>
      </Link>

      {parts.map((part, index) => {
        const path = parts.slice(0, index + 1).join("/")
        const isLast = index === parts.length - 1

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{part}</span>
            ) : (
              <Link
                href={`/buckets/${bucketName}?subfolder=${path}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {part}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
