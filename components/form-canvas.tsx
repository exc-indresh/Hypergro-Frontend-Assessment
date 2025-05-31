"use client"

import { useDrop } from "react-dnd"
import { useFormBuilder } from "@/lib/store"
import { FieldRenderer } from "./field-renderer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function FormCanvas() {
  const { currentForm, addField, setSelectedField, currentStep, setCurrentStep } = useFormBuilder()

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "FIELD",
    drop: (item: any) => {
      addField({
        type: item.fieldType.type,
        ...item.fieldType.defaultProps,
      })
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  if (!currentForm) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No Form Selected</h3>
          <p className="text-gray-600">Create a new form or load an existing one to get started.</p>
        </Card>
      </div>
    )
  }

  const currentStepFields = currentForm.isMultiStep
    ? currentForm.fields.filter((field) => field.step === currentStep)
    : currentForm.fields

  const totalSteps = currentForm.isMultiStep ? currentForm.steps.length : 1
  const currentStepData = currentForm.steps[currentStep]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Navigation */}
      {currentForm.isMultiStep && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Step
            </Button>

            <div className="text-center">
              <h3 className="font-semibold">
                Step {currentStep + 1} of {totalSteps}
              </h3>
              {currentStepData && <p className="text-sm text-gray-600">{currentStepData.title}</p>}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
              disabled={currentStep === totalSteps - 1}
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Header */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold">{currentForm.title}</h2>
        {currentForm.description && <p className="text-gray-600 mt-2">{currentForm.description}</p>}
      </Card>

      {/* Drop Zone */}
      <div
        ref={drop}
        className={`min-h-96 p-6 border-2 border-dashed rounded-lg transition-colors ${
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
        }`}
        onClick={() => setSelectedField(null)}
      >
        {currentStepFields.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">
              {currentForm.isMultiStep
                ? `Drop fields here for Step ${currentStep + 1}`
                : "Drop fields here to build your form"}
            </p>
            <p className="text-sm">Drag fields from the library on the left</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentStepFields.map((field, index) => (
              <FieldRenderer
                key={field.id}
                field={field}
                index={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedField(field.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
