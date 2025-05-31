"use client"

import React, { useRef } from "react"
import { useDrag } from "react-dnd"
import { Card } from "@/components/ui/card"
import type { FormField } from "@/lib/store"
import {
  Type,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Calendar,
  Mail,
  Phone,
  Hash,
  RadioIcon,
} from "lucide-react"

const fieldTypes: Array<{
  type: FormField["type"]
  label: string
  icon: React.ComponentType<{ className?: string }>
  defaultProps: Partial<FormField>
}> = [
  {
    type: "text",
    label: "Text Input",
    icon: Type,
    defaultProps: {
      label: "Text Input",
      placeholder: "Enter text",
      required: false,
    },
  },
  {
    type: "textarea",
    label: "Textarea",
    icon: AlignLeft,
    defaultProps: {
      label: "Textarea",
      placeholder: "Enter your message",
      required: false,
    },
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: ChevronDown,
    defaultProps: {
      label: "Dropdown",
      required: false,
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: CheckSquare,
    defaultProps: {
      label: "Checkbox",
      required: false,
    },
  },
  {
    type: "radio",
    label: "Radio Group",
    icon: RadioIcon,
    defaultProps: {
      label: "Radio Group",
      required: false,
      options: ["Option 1", "Option 2", "Option 3"],
    },
  },
  {
    type: "date",
    label: "Date",
    icon: Calendar,
    defaultProps: {
      label: "Date",
      required: false,
    },
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    defaultProps: {
      label: "Email",
      placeholder: "Enter email address",
      required: false,
    },
  },
  {
    type: "phone",
    label: "Phone",
    icon: Phone,
    defaultProps: {
      label: "Phone Number",
      placeholder: "Enter phone number",
      required: false,
    },
  },
  {
    type: "number",
    label: "Number",
    icon: Hash,
    defaultProps: {
      label: "Number",
      placeholder: "Enter number",
      required: false,
    },
  },
]

function DraggableField({ fieldType }: { fieldType: (typeof fieldTypes)[0] }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "FIELD",
    item: { fieldType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const Icon = fieldType.icon

  // Create a ref and apply the drag source to it
  const cardRef = useRef<HTMLDivElement>(null)
  drag(cardRef)

  return (
    <Card
      ref={cardRef}
      className={`p-4 cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="font-medium">{fieldType.label}</span>
      </div>
    </Card>
  )
}

export function FieldLibrary() {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Field Library</h3>
      {fieldTypes.map((fieldType) => (
        <DraggableField key={fieldType.type} fieldType={fieldType} />
      ))}
    </div>
  )
}
