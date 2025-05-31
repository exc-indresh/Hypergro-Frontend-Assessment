"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormBuilder } from "@/lib/store"
import { useState } from "react"
import { Trash2, Edit } from "lucide-react"

interface StepManagerProps {
  onClose: () => void
}

export function StepManager({ onClose }: StepManagerProps) {
  const { currentForm, addStep, updateStep, deleteStep } = useFormBuilder()
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [stepTitle, setStepTitle] = useState("")
  const [stepDescription, setStepDescription] = useState("")

  if (!currentForm) return null

  const handleAddStep = () => {
    if (stepTitle.trim()) {
      addStep({
        title: stepTitle,
        description: stepDescription,
      })
      setStepTitle("")
      setStepDescription("")
    }
  }

  const handleEditStep = (stepId: string) => {
    const step = currentForm.steps.find((s) => s.id === stepId)
    if (step) {
      setEditingStep(stepId)
      setStepTitle(step.title)
      setStepDescription(step.description || "")
    }
  }

  const handleUpdateStep = () => {
    if (editingStep && stepTitle.trim()) {
      updateStep(editingStep, {
        title: stepTitle,
        description: stepDescription,
      })
      setEditingStep(null)
      setStepTitle("")
      setStepDescription("")
    }
  }

  const handleDeleteStep = (stepId: string) => {
    deleteStep(stepId)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Form Steps</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add/Edit Step Form */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">{editingStep ? "Edit Step" : "Add New Step"}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="step-title">Step Title</Label>
                <Input
                  id="step-title"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  placeholder="Enter step title"
                />
              </div>
              <div>
                <Label htmlFor="step-description">Step Description (Optional)</Label>
                <Textarea
                  id="step-description"
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  placeholder="Enter step description"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={editingStep ? handleUpdateStep : handleAddStep}>
                  {editingStep ? "Update Step" : "Add Step"}
                </Button>
                {editingStep && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingStep(null)
                      setStepTitle("")
                      setStepDescription("")
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Existing Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold">Current Steps</h3>
            {currentForm.steps.map((step, index) => (
              <Card key={step.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      Step {index + 1}: {step.title}
                    </h4>
                    {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      {currentForm.fields.filter((field) => field.step === index).length} fields
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditStep(step.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStep(step.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {currentForm.steps.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No steps created yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
