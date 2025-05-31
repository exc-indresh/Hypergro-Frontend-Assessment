"use client"

import { FormFiller } from "@/components/form-filler"
import { use } from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function FormPage({ params }: PageProps) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-gray-50">
      <FormFiller formId={id} />
    </div>
  )
}
