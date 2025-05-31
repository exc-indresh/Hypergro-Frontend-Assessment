"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useFormBuilder } from "@/lib/store"
import { FormPreview } from "./form-preview"
import { Monitor, Tablet, Smartphone } from "lucide-react"

interface PreviewModalProps {
  open: boolean
  onClose: () => void
}

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const { previewMode, setPreviewMode } = useFormBuilder()

  const getWidthClass = () => {
    switch (previewMode) {
      case "tablet":
        return "max-w-2xl"
      case "mobile":
        return "max-w-sm"
      default:
        return "max-w-4xl"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${getWidthClass()} max-h-[90vh]`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Form Preview</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("tablet")}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh]">
          <FormPreview />
        </div>
      </DialogContent>
    </Dialog>
  )
}
