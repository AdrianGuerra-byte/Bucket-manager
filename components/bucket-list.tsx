"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiClient } from "@/hooks/use-api-client"
import type { Bucket } from "@/types/files"

export function BucketList() {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const apiClient = useApiClient()
  const router = useRouter()

  useEffect(() => {
    async function loadBuckets() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.listBuckets()
        setBuckets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar buckets")
      } finally {
        setLoading(false)
      }
    }

    loadBuckets()
  }, [apiClient])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (buckets.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No se encontraron buckets disponibles.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {buckets.map((bucket) => (
        <Card
          key={bucket.name}
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
          onClick={() => router.push(`/buckets/${encodeURIComponent(bucket.name)}`)}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Folder className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{bucket.name}</CardTitle>
                {bucket.file_count !== undefined && (
                  <CardDescription>
                    {bucket.file_count} {bucket.file_count === 1 ? "archivo" : "archivos"}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
