"use client"

import { useEffect, useState } from "react"
import { useFormBuilder, type FormData } from "@/lib/store"
import { FormPreview } from "./form-preview"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface FormFillerProps {
  formId: string
}

export function FormFiller({ formId }: FormFillerProps) {
  const { savedForms, setCurrentForm } = useFormBuilder()
  const [form, setForm] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundForm = savedForms.find((f) => f.id === formId)
    setForm(foundForm || null)
    setLoading(false)

    // Set the current form for the preview component to work
    if (foundForm) {
      setCurrentForm(foundForm)
    }
  }, [formId, savedForms, setCurrentForm])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Form...</h2>
          <p className="text-muted-foreground">Please wait while we load your form.</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The form you're looking for doesn't exist or may have been removed.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form Builder
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">Fill Form</h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Button>
          </Link>
        </div>
      </header>

      <div className="py-8">
        <FormPreview />
      </div>
    </div>
  )
}
