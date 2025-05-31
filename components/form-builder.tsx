"use client"

import React from "react"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FieldLibrary } from "./field-library"
import { FormCanvas } from "./form-canvas"
import { PropertyPanel } from "./property-panel"
import { PreviewModal } from "./preview-modal"
import { TemplateModal } from "./template-modal"
import { StepManager } from "./step-manager"
import { ResponsesModal } from "./responses-modal"
import { useFormBuilder } from "@/lib/store"
import {
  Eye,
  Save,
  Share2,
  FileDown,
  Upload,
  Plus,
  Settings,
  Moon,
  Sun,
  Undo,
  Redo,
  BarChart3,
  Check,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function FormBuilder() {
  const {
    currentForm,
    setCurrentForm,
    createNewForm,
    saveForm,
    generateShareableLink,
    theme,
    toggleTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    autoSaveEnabled,
    setAutoSave,
    lastSaved,
  } = useFormBuilder()

  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showStepManager, setShowStepManager] = useState(false)
  const [showResponses, setShowResponses] = useState(false)

  // Auto-save indicator
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false)

  useEffect(() => {
    if (lastSaved) {
      setShowAutoSaveIndicator(true)
      const timer = setTimeout(() => setShowAutoSaveIndicator(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            if (e.shiftKey) {
              e.preventDefault()
              if (canRedo()) redo()
            } else {
              e.preventDefault()
              if (canUndo()) undo()
            }
            break
          case "y":
            e.preventDefault()
            if (canRedo()) redo()
            break
          case "s":
            e.preventDefault()
            handleSave()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canUndo, canRedo, undo, redo])

  const handleSave = () => {
    if (!currentForm) return
    saveForm()
    toast({
      title: "Form Saved",
      description: "Your form has been saved successfully.",
    })
  }

  const handleShare = () => {
    const link = generateShareableLink()
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to clipboard.",
    })
  }

  const handleExport = () => {
    if (!currentForm) return
    const dataStr = JSON.stringify(currentForm, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${currentForm.title.replace(/\s+/g, "_")}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const formData = JSON.parse(e.target?.result as string)
        setCurrentForm({
          ...formData,
          id: Date.now().toString(),
          updatedAt: new Date().toISOString(),
        })
        toast({
          title: "Form Imported",
          description: "Form has been imported successfully.",
        })
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import form. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`flex flex-col h-screen ${theme === "dark" ? "dark" : ""}`}>
        {/* Header */}
        <header className="border-b p-4" style={{background:'#bbbbbb'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Form Builder</h1>
              {currentForm && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="form-title">Title:</Label>
                  <Input
                    id="form-title"
                    value={currentForm.title}
                    onChange={(e) =>
                      setCurrentForm({
                        ...currentForm,
                        title: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-48"
                  />
                </div>
              )}

              {/* Auto-save indicator */}
              {showAutoSaveIndicator && (
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Auto-saved</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Undo/Redo */}
              <Button className="btn" variant="outline" size="sm" onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)">
                <Undo className="w-4 h-4" />
              </Button>

              <Button className="btn" variant="outline" size="sm" onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)">
                <Redo className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border" />

              {/* Theme Toggle */}
              <Button className="btn" variant="outline" size="sm" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              <div className="w-px h-6 bg-border" />

              {/* Responses */}
              <Button className="btn" variant="outline" onClick={() => setShowResponses(true)} disabled={!currentForm}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Responses
              </Button>

              <Button className="btn" variant="outline" onClick={() => setShowTemplates(true)}>
                <Upload className="w-4 h-4 mr-2 " />
                Templates
              </Button>

              <label>
                <Button className="btn" variant="outline" asChild>
                  <span>
                    <FileDown className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>

              <Button className="btn" variant="outline" onClick={handleExport} disabled={!currentForm}>
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button className="btn" variant="outline" onClick={() => setShowPreview(true)} disabled={!currentForm}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              <Button className="btn" variant="outline" onClick={handleSave} disabled={!currentForm}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              
              <Button className="btn" onClick={handleShare} disabled={!currentForm}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <div style={{display:'inline-block'}}>
              <Button className="btn" variant="outline" onClick={createNewForm}>
                <Plus className="w-4 h-4 mr-2" />
                New Form
              </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex bg-background" style={{background:'rgb(221 217 217)'}}>
          {/* Left Sidebar - Field Library */}
          <div className="w-80 border-r bg-card p-4 overflow-y-auto">
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="mt-4">
                <FieldLibrary />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  {/* Auto-save setting */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Auto-save</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-save"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSave(e.target.checked)}
                      />
                      <Label htmlFor="auto-save">Enable auto-save</Label>
                    </div>
                    {lastSaved && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last saved: {new Date(lastSaved).toLocaleString()}
                      </p>
                    )}
                  </Card>

                  {currentForm && (
                    <>
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2">Form Settings</h3>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="form-description">Description</Label>
                            <Input
                              id="form-description"
                              value={currentForm.description || ""}
                              onChange={(e) =>
                                setCurrentForm({
                                  ...currentForm,
                                  description: e.target.value,
                                  updatedAt: new Date().toISOString(),
                                })
                              }
                              placeholder="Form description"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="multi-step"
                              checked={currentForm.isMultiStep}
                              onChange={(e) =>
                                setCurrentForm({
                                  ...currentForm,
                                  isMultiStep: e.target.checked,
                                  updatedAt: new Date().toISOString(),
                                })
                              }
                            />
                            <Label htmlFor="multi-step">Multi-step Form</Label>
                          </div>

                          {currentForm.isMultiStep && (
                            <Button  variant="outline" onClick={() => setShowStepManager(true)} className="w-full btn">
                              <Settings className="w-4 h-4 mr-2" />
                              Manage Steps
                            </Button>
                          )}
                        </div>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Form Canvas */}
          <div className="flex-1 p-4 overflow-y-auto bg-muted/30">
            <FormCanvas />
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-80 border-l bg-card p-4 overflow-y-auto">
            <PropertyPanel />
          </div>
        </div>

        {/* Modals */}
        <PreviewModal open={showPreview} onClose={() => setShowPreview(false)} />
        <TemplateModal open={showTemplates} onClose={() => setShowTemplates(false)} />
        <ResponsesModal open={showResponses} onClose={() => setShowResponses(false)} />
        {showStepManager && <StepManager onClose={() => setShowStepManager(false)} />}
      </div>
    </DndProvider>
  )
}
