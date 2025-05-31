import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface FormField {
  id: string
  type: "text" | "textarea" | "dropdown" | "checkbox" | "date" | "email" | "phone" | "number" | "radio"
  label: string
  placeholder?: string
  required: boolean
  helpText?: string
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  step?: number
}

export interface FormStep {
  id: string
  title: string
  description?: string
}

export interface FormData {
  id: string
  title: string
  description?: string
  fields: FormField[]
  steps: FormStep[]
  isMultiStep: boolean
  createdAt: string
  updatedAt: string
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  formData: Omit<FormData, "id" | "createdAt" | "updatedAt">
}

export interface FormResponse {
  id: string
  formId: string
  formTitle: string
  responses: Record<string, any>
  submittedAt: string
  ipAddress?: string
  userAgent?: string
}

interface HistoryState {
  form: FormData
  timestamp: number
}

interface FormBuilderState {
  currentForm: FormData | null
  selectedField: string | null
  previewMode: "desktop" | "tablet" | "mobile"
  currentStep: number
  templates: FormTemplate[]
  savedForms: FormData[]
  formResponses: FormResponse[]
  theme: "light" | "dark"

  // History for undo/redo
  history: HistoryState[]
  historyIndex: number
  maxHistorySize: number

  // Auto-save
  autoSaveEnabled: boolean
  lastSaved: string | null

  // Actions
  setCurrentForm: (form: FormData | null) => void
  addField: (field: Omit<FormField, "id">) => void
  updateField: (id: string, updates: Partial<FormField>) => void
  deleteField: (id: string) => void
  reorderFields: (dragIndex: number, hoverIndex: number) => void
  setSelectedField: (id: string | null) => void
  setPreviewMode: (mode: "desktop" | "tablet" | "mobile") => void
  setCurrentStep: (step: number) => void
  addStep: (step: Omit<FormStep, "id">) => void
  updateStep: (id: string, updates: Partial<FormStep>) => void
  deleteStep: (id: string) => void
  saveForm: () => void
  loadForm: (id: string) => void
  createNewForm: () => void
  saveAsTemplate: (name: string, description: string) => void
  loadTemplate: (templateId: string) => void
  generateShareableLink: () => string

  // Response management
  submitFormResponse: (formId: string, responses: Record<string, any>) => void
  getFormResponses: (formId: string) => FormResponse[]
  deleteResponse: (responseId: string) => void
  exportResponses: (formId: string) => void

  // Theme
  setTheme: (theme: "light" | "dark") => void
  toggleTheme: () => void

  // History/Undo-Redo
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Auto-save
  setAutoSave: (enabled: boolean) => void
  triggerAutoSave: () => void
}

const defaultTemplates: FormTemplate[] = [
  {
    id: "contact-us",
    name: "Contact Us",
    description: "A simple contact form with name, email, and message fields",
    formData: {
      title: "Contact Us",
      description: "Get in touch with us",
      isMultiStep: false,
      fields: [
        {
          id: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
          validation: { minLength: 2 },
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter your email",
          required: true,
        },
        {
          id: "message",
          type: "textarea",
          label: "Message",
          placeholder: "Enter your message",
          required: true,
          validation: { minLength: 10 },
        },
      ],
      steps: [],
    },
  },
  {
    id: "survey",
    name: "Customer Survey",
    description: "Multi-step customer feedback survey",
    formData: {
      title: "Customer Satisfaction Survey",
      description: "Help us improve our services",
      isMultiStep: true,
      fields: [
        {
          id: "name",
          type: "text",
          label: "Your Name",
          required: true,
          step: 0,
        },
        {
          id: "rating",
          type: "radio",
          label: "Overall Satisfaction",
          required: true,
          options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
          step: 1,
        },
        {
          id: "feedback",
          type: "textarea",
          label: "Additional Feedback",
          placeholder: "Tell us more about your experience",
          step: 1,
        },
      ],
      steps: [
        { id: "step1", title: "Personal Information" },
        { id: "step2", title: "Feedback" },
      ],
    },
  },
]

export const useFormBuilder = create<FormBuilderState>()(
  persist(
    (set, get) => ({
      currentForm: null,
      selectedField: null,
      previewMode: "desktop",
      currentStep: 0,
      templates: defaultTemplates,
      savedForms: [],
      formResponses: [],
      theme: "light",

      // History
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,

      // Auto-save
      autoSaveEnabled: true,
      lastSaved: null,

      setCurrentForm: (form) => {
        set({ currentForm: form })
        if (form) {
          get().saveToHistory()
        }
      },

      addField: (field) => {
        set((state) => {
          if (!state.currentForm) return state
          const newField: FormField = {
            ...field,
            id: Date.now().toString(),
            step: state.currentForm.isMultiStep ? state.currentStep : undefined,
          }
          const updatedForm = {
            ...state.currentForm,
            fields: [...state.currentForm.fields, newField],
            updatedAt: new Date().toISOString(),
          }
          return { currentForm: updatedForm }
        })
        get().saveToHistory()
        get().triggerAutoSave()
      },

      updateField: (id, updates) => {
        set((state) => {
          if (!state.currentForm) return state
          const updatedForm = {
            ...state.currentForm,
            fields: state.currentForm.fields.map((field) => (field.id === id ? { ...field, ...updates } : field)),
            updatedAt: new Date().toISOString(),
          }
          return { currentForm: updatedForm }
        })
        get().saveToHistory()
        get().triggerAutoSave()
      },

      deleteField: (id) => {
        set((state) => {
          if (!state.currentForm) return state
          const updatedForm = {
            ...state.currentForm,
            fields: state.currentForm.fields.filter((field) => field.id !== id),
            updatedAt: new Date().toISOString(),
          }
          return {
            currentForm: updatedForm,
            selectedField: state.selectedField === id ? null : state.selectedField,
          }
        })
        get().saveToHistory()
        get().triggerAutoSave()
      },

      reorderFields: (dragIndex, hoverIndex) => {
        set((state) => {
          if (!state.currentForm) return state
          const fields = [...state.currentForm.fields]
          const draggedField = fields[dragIndex]
          fields.splice(dragIndex, 1)
          fields.splice(hoverIndex, 0, draggedField)
          const updatedForm = {
            ...state.currentForm,
            fields,
            updatedAt: new Date().toISOString(),
          }
          return { currentForm: updatedForm }
        })
        get().saveToHistory()
        get().triggerAutoSave()
      },

      setSelectedField: (id) => set({ selectedField: id }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setCurrentStep: (step) => set({ currentStep: step }),

      addStep: (step) => {
        set((state) => {
          if (!state.currentForm) return state
          const newStep: FormStep = {
            ...step,
            id: Date.now().toString(),
          }
          const updatedForm = {
            ...state.currentForm,
            steps: [...state.currentForm.steps, newStep],
            updatedAt: new Date().toISOString(),
          }
          return { currentForm: updatedForm }
        })
        get().saveToHistory()
        get().triggerAutoSave()
      },

      updateStep: (id, updates) => {
        set((state) => {
          if (!state.currentForm) return state
          const updatedForm = {
            ...state.currentForm,
            steps: state.currentForm.steps.map((step) => (step.id === id ? { ...step, ...updates } : step)),
            updatedAt: new Date().toISOString(),
          }
          return { currentForm: updatedForm }
        })
        get().saveToHistory()
        get().triggerAutoSave()
      },

      deleteStep: (id) => {
        set((state) => {
          if (!state.currentForm) return state
          const updatedForm = {
            ...state.currentForm,
            steps: state.currentForm.steps.filter((step) => step.id !== id),
            updatedAt: new Date().toISOString(),
          }
          return { currentForm: updatedForm }
        })
        get().saveToHistory()
        get().triggerAutoSave()
      },

      saveForm: () => {
        set((state) => {
          if (!state.currentForm) return state
          const existingIndex = state.savedForms.findIndex((form) => form.id === state.currentForm!.id)
          let updatedForms
          if (existingIndex >= 0) {
            updatedForms = [...state.savedForms]
            updatedForms[existingIndex] = state.currentForm
          } else {
            updatedForms = [...state.savedForms, state.currentForm]
          }
          return {
            savedForms: updatedForms,
            lastSaved: new Date().toISOString(),
          }
        })
      },

      loadForm: (id) => {
        set((state) => {
          const form = state.savedForms.find((f) => f.id === id)
          if (form) {
            return { currentForm: form }
          }
          return state
        })
        get().saveToHistory()
      },

      createNewForm: () => {
        const newForm = {
          id: Date.now().toString(),
          title: "New Form",
          fields: [],
          steps: [],
          isMultiStep: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set({
          currentForm: newForm,
          selectedField: null,
          currentStep: 0,
          history: [],
          historyIndex: -1,
        })
        get().saveToHistory()
      },

      saveAsTemplate: (name, description) => {
        set((state) => {
          if (!state.currentForm) return state
          const template: FormTemplate = {
            id: Date.now().toString(),
            name,
            description,
            formData: {
              title: state.currentForm.title,
              description: state.currentForm.description,
              fields: state.currentForm.fields,
              steps: state.currentForm.steps,
              isMultiStep: state.currentForm.isMultiStep,
            },
          }
          return {
            templates: [...state.templates, template],
          }
        })
      },

      loadTemplate: (templateId) => {
        set((state) => {
          const template = state.templates.find((t) => t.id === templateId)
          if (!template) return state
          const newForm = {
            ...template.formData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          return {
            currentForm: newForm,
            history: [],
            historyIndex: -1,
          }
        })
        get().saveToHistory()
      },

      generateShareableLink: () => {
        const state = get()
        if (!state.currentForm) return ""
        state.saveForm()
        return `${window.location.origin}/form/${state.currentForm.id}`
      },

      // Response management
      submitFormResponse: (formId, responses) => {
        set((state) => {
          const form = state.savedForms.find((f) => f.id === formId)
          const newResponse: FormResponse = {
            id: Date.now().toString(),
            formId,
            formTitle: form?.title || "Unknown Form",
            responses,
            submittedAt: new Date().toISOString(),
            ipAddress: "127.0.0.1", // Mock IP
            userAgent: navigator.userAgent,
          }
          return {
            formResponses: [...state.formResponses, newResponse],
          }
        })
      },

      getFormResponses: (formId) => {
        const state = get()
        return state.formResponses.filter((response) => response.formId === formId)
      },

      deleteResponse: (responseId) => {
        set((state) => ({
          formResponses: state.formResponses.filter((response) => response.id !== responseId),
        }))
      },

      exportResponses: (formId) => {
        const state = get()
        const responses = state.getFormResponses(formId)
        const form = state.savedForms.find((f) => f.id === formId)

        if (responses.length === 0) return

        // Convert to CSV format
        const headers = ["Submission Date", ...(form?.fields.map((f) => f.label) || [])]
        const csvContent = [
          headers.join(","),
          ...responses.map((response) =>
            [
              new Date(response.submittedAt).toLocaleString(),
              ...(form?.fields.map((field) => response.responses[field.id] || "") || []),
            ]
              .map((value) => `"${value}"`)
              .join(","),
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${form?.title || "form"}_responses.csv`
        link.click()
        URL.revokeObjectURL(url)
      },

      // Theme
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle("dark", theme === "dark")
      },

      toggleTheme: () => {
        const state = get()
        const newTheme = state.theme === "light" ? "dark" : "light"
        state.setTheme(newTheme)
      },

      // History/Undo-Redo
      saveToHistory: () => {
        set((state) => {
          if (!state.currentForm) return state

          const newHistoryState: HistoryState = {
            form: JSON.parse(JSON.stringify(state.currentForm)),
            timestamp: Date.now(),
          }

          // Remove any history after current index (when undoing then making new changes)
          const newHistory = state.history.slice(0, state.historyIndex + 1)
          newHistory.push(newHistoryState)

          // Limit history size
          if (newHistory.length > state.maxHistorySize) {
            newHistory.shift()
          }

          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          }
        })
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex <= 0) return state

          const newIndex = state.historyIndex - 1
          const historyState = state.history[newIndex]

          return {
            currentForm: JSON.parse(JSON.stringify(historyState.form)),
            historyIndex: newIndex,
          }
        })
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state

          const newIndex = state.historyIndex + 1
          const historyState = state.history[newIndex]

          return {
            currentForm: JSON.parse(JSON.stringify(historyState.form)),
            historyIndex: newIndex,
          }
        })
      },

      canUndo: () => {
        const state = get()
        return state.historyIndex > 0
      },

      canRedo: () => {
        const state = get()
        return state.historyIndex < state.history.length - 1
      },

      // Auto-save
      setAutoSave: (enabled) => set({ autoSaveEnabled: enabled }),

      triggerAutoSave: () => {
        const state = get()
        if (state.autoSaveEnabled && state.currentForm) {
          setTimeout(() => {
            state.saveForm()
          }, 1000) // Auto-save after 1 second of inactivity
        }
      },
    }),
    {
      name: "form-builder-storage",
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme) {
          document.documentElement.classList.toggle("dark", state.theme === "dark")
        }
      },
    },
  ),
)
