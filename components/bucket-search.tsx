"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FolderOpen } from "lucide-react"

export function BucketSearch() {
  const [bucketName, setBucketName] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (bucketName.trim()) {
      router.push(`/buckets/${encodeURIComponent(bucketName.trim())}`)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Buscar Bucket</CardTitle>
          <CardDescription>
            Ingresa el nombre del bucket que deseas acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nombre del bucket"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={!bucketName.trim()}>
              <Search className="mr-2 h-5 w-5" />
              Acceder al Bucket
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
