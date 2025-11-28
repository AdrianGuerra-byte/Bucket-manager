import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ bucket: string }>
  searchParams: Promise<{ subfolder?: string }>
}

export default async function BucketPage({ params, searchParams }: PageProps) {
  // Redirect to home page - bucket system has been replaced with document system
  redirect("/")
}
