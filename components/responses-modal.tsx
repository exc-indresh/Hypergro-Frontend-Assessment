"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFormBuilder } from "@/lib/store"
import { useState } from "react"
import { Download, Trash2, Calendar, User, Globe } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ResponsesModalProps {
  open: boolean
  onClose: () => void
}

export function ResponsesModal({ open, onClose }: ResponsesModalProps) {
  const { currentForm, getFormResponses, deleteResponse, exportResponses } = useFormBuilder()
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null)

  if (!currentForm) return null

  const responses = getFormResponses(currentForm.id)
  const selectedResponseData = responses.find((r) => r.id === selectedResponse)

  const handleExport = () => {
    exportResponses(currentForm.id)
    toast({
      title: "Export Complete",
      description: "Responses have been exported to CSV file.",
    })
  }

  const handleDeleteResponse = (responseId: string) => {
    deleteResponse(responseId)
    if (selectedResponse === responseId) {
      setSelectedResponse(null)
    }
    toast({
      title: "Response Deleted",
      description: "The response has been deleted successfully.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Form Responses - {currentForm.title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {responses.length} {responses.length === 1 ? "Response" : "Responses"}
              </Badge>
              {responses.length > 0 && (
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[70vh]">
          {/* Responses List */}
          <div className="w-1/2 border-r pr-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Submissions</h3>

            {responses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No responses yet</p>
                <p className="text-sm text-muted-foreground mt-2">Share your form to start collecting responses</p>
              </div>
            ) : (
              <div className="space-y-2">
                {responses.map((response) => (
                  <Card
                    key={response.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedResponse === response.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedResponse(response.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(response.submittedAt).toLocaleString()}</span>
                        </div>

                        {/* Show first few field values as preview */}
                        <div className="space-y-1">
                          {currentForm.fields.slice(0, 2).map((field) => {
                            const value = response.responses[field.id]
                            if (!value) return null
                            return (
                              <div key={field.id} className="text-sm">
                                <span className="font-medium">{field.label}:</span>{" "}
                                <span className="text-muted-foreground">
                                  {typeof value === "string" && value.length > 30
                                    ? `${value.substring(0, 30)}...`
                                    : String(value)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteResponse(response.id)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Response Details */}
          <div className="w-1/2 pl-4 overflow-y-auto">
            {selectedResponseData ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Response Details</h3>
                  <Badge variant="outline">{new Date(selectedResponseData.submittedAt).toLocaleDateString()}</Badge>
                </div>

                {/* Metadata */}
                <Card className="p-4 mb-4">
                  <h4 className="font-medium mb-2">Submission Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Submitted: {new Date(selectedResponseData.submittedAt).toLocaleString()}</span>
                    </div>
                    {selectedResponseData.ipAddress && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>IP: {selectedResponseData.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Form Responses */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Form Data</h4>
                  <div className="space-y-4">
                    {currentForm.fields.map((field) => {
                      const value = selectedResponseData.responses[field.id]
                      return (
                        <div key={field.id} className="border-b pb-3 last:border-b-0">
                          <div className="font-medium text-sm mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {value ? (
                              typeof value === "boolean" ? (
                                value ? (
                                  "Yes"
                                ) : (
                                  "No"
                                )
                              ) : Array.isArray(value) ? (
                                value.join(", ")
                              ) : (
                                String(value)
                              )
                            ) : (
                              <span className="italic">No response</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Select a response to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
