"use client"

import type React from "react"

import { useState } from "react"
import { useFormBuilder } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function FormPreview() {
  const { currentForm, submitFormResponse } = useFormBuilder()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!currentForm) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No form to preview</p>
      </div>
    )
  }

  const validateField = (field: any, value: any) => {
    const errors: string[] = []

    if (field.required && (!value || value.toString().trim() === "")) {
      errors.push("This field is required")
    }

    if (value && field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        errors.push(`Minimum length is ${field.validation.minLength}`)
      }
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        errors.push(`Maximum length is ${field.validation.maxLength}`)
      }
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        errors.push("Invalid format")
      }
    }

    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push("Invalid email format")
    }

    if (field.type === "phone" && value && !/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ""))) {
      errors.push("Invalid phone format")
    }

    return errors[0] || null
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))

    const field = currentForm.fields.find((f) => f.id === fieldId)
    if (field) {
      const error = validateField(field, value)
      setErrors((prev) => ({ ...prev, [fieldId]: error || "" }))
    }
  }

  const validateStep = (step: number) => {
    const stepFields = currentForm.isMultiStep
      ? currentForm.fields.filter((field) => field.step === step)
      : currentForm.fields

    const newErrors: Record<string, string> = {}
    let isValid = true

    stepFields.forEach((field) => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    })

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentForm.isMultiStep) {
      if (validateStep(currentStep)) {
        // Submit the form response
        submitFormResponse(currentForm.id, formData)
        toast({
          title: "Form Submitted!",
          description: "Your response has been recorded successfully.",
        })
        // Reset form
        setFormData({})
        setCurrentStep(0)
        setErrors({})
      }
    } else {
      if (validateStep(0)) {
        // Submit the form response
        submitFormResponse(currentForm.id, formData)
        toast({
          title: "Form Submitted!",
          description: "Your response has been recorded successfully.",
        })
        // Reset form
        setFormData({})
        setErrors({})
      }
    }
  }

  const currentStepFields = currentForm.isMultiStep
    ? currentForm.fields.filter((field) => field.step === currentStep)
    : currentForm.fields

  const totalSteps = currentForm.isMultiStep ? currentForm.steps.length : 1
  const currentStepData = currentForm.steps[currentStep]

  const renderField = (field: any) => {
    const hasError = errors[field.id]
    const commonProps = {
      value: formData[field.id] || "",
      onChange: (e: any) => handleInputChange(field.id, e.target.value),
      className: `w-full ${hasError ? "border-red-500" : ""}`,
      placeholder: field.placeholder,
    }

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return <Input {...commonProps} type={field.type} />

      case "textarea":
        return <Textarea {...commonProps} />

      case "dropdown":
        return (
          <Select onValueChange={(value) => handleInputChange(field.id, value)}>
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string, i: number) => (
                <SelectItem key={i} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={formData[field.id] || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, i: number) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}_${i}`}
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
                <Label htmlFor={`${field.id}_${i}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case "date":
        return <Input {...commonProps} type="date" />

      default:
        return <Input {...commonProps} />
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Step Progress */}
      {currentForm.isMultiStep && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Step {currentStep + 1} of {totalSteps}
            </h3>
            {currentStepData && <p className="text-sm text-muted-foreground">{currentStepData.title}</p>}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{currentForm.title}</h2>
          {currentForm.description && <p className="text-muted-foreground mt-2">{currentForm.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStepFields.map((field) => (
            <div key={field.id}>
              {field.type !== "checkbox" && (
                <Label className="block mb-2 font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
              {renderField(field)}
              {errors[field.id] && <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>}
              {field.helpText && <p className="text-muted-foreground text-sm mt-1">{field.helpText}</p>}
            </div>
          ))}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            {currentForm.isMultiStep && currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}

            <div className="ml-auto">
              {currentForm.isMultiStep && currentStep < totalSteps - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" style={{background:'rgb(184, 184, 184)'}}>Submit Form</Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
