"use client"

import { useFormBuilder } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus } from "lucide-react"

export function PropertyPanel() {
  const { currentForm, selectedField, updateField } = useFormBuilder()

  if (!currentForm || !selectedField) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4">Properties</h3>
        <p className="text-gray-500">Select a field to edit its properties</p>
      </div>
    )
  }

  const field = currentForm.fields.find((f) => f.id === selectedField)
  if (!field) return null

  const handleUpdate = (updates: any) => {
    updateField(field.id, updates)
  }

  const addOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    handleUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    handleUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || []
    handleUpdate({ options: newOptions })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Field Properties</h3>

      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="field-label">Label</Label>
          <Input id="field-label" value={field.label} onChange={(e) => handleUpdate({ label: e.target.value })} />
        </div>

        {field.type !== "checkbox" && (
          <div>
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder || ""}
              onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="field-required">Required</Label>
          <Switch
          style={{background:'#7171ef'}}
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => handleUpdate({ required: checked })}
          />
        </div>

        <div>
          <Label htmlFor="field-help">Help Text</Label>
          <Textarea
            id="field-help"
            value={field.helpText || ""}
            onChange={(e) => handleUpdate({ helpText: e.target.value })}
            placeholder="Optional help text"
          />
        </div>

        {(field.type === "dropdown" || field.type === "radio") && (
          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeOption(index)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addOption} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium">Validation</h4>

          {(field.type === "text" || field.type === "textarea") && (
            <>
              <div>
                <Label htmlFor="min-length">Minimum Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  value={field.validation?.minLength || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...field.validation,
                        minLength: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="max-length">Maximum Length</Label>
                <Input
                  id="max-length"
                  type="number"
                  value={field.validation?.maxLength || ""}
                  onChange={(e) =>
                    handleUpdate({
                      validation: {
                        ...field.validation,
                        maxLength: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
              </div>
            </>
          )}

          {field.type === "text" && (
            <div>
              <Label htmlFor="pattern">Pattern (RegEx)</Label>
              <Input
                id="pattern"
                value={field.validation?.pattern || ""}
                onChange={(e) =>
                  handleUpdate({
                    validation: {
                      ...field.validation,
                      pattern: e.target.value,
                    },
                  })
                }
                placeholder="e.g., ^[A-Za-z]+$"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
