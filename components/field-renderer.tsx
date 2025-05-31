"use client"

import type React from "react"

import { useDrag, useDrop } from "react-dnd"
import { useRef } from "react"
import { useFormBuilder, type FormField } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, GripVertical } from "lucide-react"

interface FieldRendererProps {
  field: FormField
  index: number
  onClick: (e: React.MouseEvent) => void
}

export function FieldRenderer({ field, index, onClick }: FieldRendererProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { selectedField, deleteField, reorderFields } = useFormBuilder()

  interface DragItem {
    id: string
    index: number
  }

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: "FIELD_ITEM",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      reorderFields(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: "FIELD_ITEM",
    item: () => {
      return { id: field.id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  const isSelected = selectedField === field.id

  const renderField = () => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      required: field.required,
      className: "w-full",
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
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => (
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
            <input type="checkbox" id={field.id} />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" id={`${field.id}_${i}`} name={field.id} />
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
    <Card
      ref={ref}
      className={`p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-sm"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={onClick}
      data-handler-id={handlerId}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {field.type !== "checkbox" && (
            <Label className="block mb-2 font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {renderField()}
          {field.helpText && <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <div className="cursor-grab">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              deleteField(field.id)
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
