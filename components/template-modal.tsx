"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormBuilder } from "@/lib/store"
import { useState } from "react"
import { Save, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TemplateModalProps {
  open: boolean
  onClose: () => void
}

export function TemplateModal({ open, onClose }: TemplateModalProps) {
  const { templates, loadTemplate, saveAsTemplate, currentForm } = useFormBuilder()
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")

  const handleLoadTemplate = (templateId: string) => {
    loadTemplate(templateId)
    onClose()
    toast({
      title: "Template Loaded",
      description: "Template has been loaded successfully.",
    })
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name.",
        variant: "destructive",
      })
      return
    }

    saveAsTemplate(templateName, templateDescription)
    setTemplateName("")
    setTemplateDescription("")
    setShowSaveTemplate(false)
    toast({
      title: "Template Saved",
      description: "Template has been saved successfully.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save Current Form as Template */}
          {currentForm && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Save Current Form as Template</h3>
                <Button variant="outline" onClick={() => setShowSaveTemplate(!showSaveTemplate)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
              </div>

              {showSaveTemplate && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="Enter template description"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveTemplate}>Save Template</Button>
                    <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Template List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Available Templates</h3>
            {templates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {template.formData.fields.length} fields
                      {template.formData.isMultiStep && ` • ${template.formData.steps.length} steps`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleLoadTemplate(template.id)}>
                    <Download className="w-4 h-4 mr-2" />
                    Load
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No templates available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
