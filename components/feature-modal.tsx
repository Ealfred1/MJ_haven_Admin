"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import api from "@/services/api"

interface Feature {
  name: string
  description: string
}

interface FeatureModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: number
  onSuccess?: () => void
}

export function FeatureModal({ isOpen, onClose, propertyId, onSuccess }: FeatureModalProps) {
  const [features, setFeatures] = useState<Feature[]>([{ name: "", description: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleAddFeature = () => {
    setFeatures([...features, { name: "", description: "" }])
  }

  const handleRemoveFeature = (index: number) => {
    if (features.length === 1) {
      // Don't remove the last feature, just clear it
      setFeatures([{ name: "", description: "" }])
      return
    }

    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFeatures(newFeatures)
  }

  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...features]
    newFeatures[index][field] = value
    setFeatures(newFeatures)
  }

  const resetForm = () => {
    setFeatures([{ name: "", description: "" }])
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate features
    const validFeatures = features.filter((feature) => feature.name.trim() !== "")
    if (validFeatures.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one feature with a name",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Adding features to property:", propertyId)
      // Add each feature one by one
      for (const feature of validFeatures) {
        await api.post(`/api/properties/${propertyId}/add_feature/`, feature)
      }

      toast({
        title: "Success",
        description: `${validFeatures.length} feature(s) added successfully`,
      })

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error: any) {
      console.error("Failed to add features:", error)

      let errorMessage = "Failed to add features. Please try again."
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log(isOpen, propertyId)
  if (!isOpen || !propertyId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add Property Features</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="p-4 border rounded-lg relative">
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name*</label>
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) => handleFeatureChange(index, "name", e.target.value)}
                      placeholder="e.g., Swimming Pool, Air Conditioning"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                      placeholder="Add details about this feature..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px]"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Add Another Feature
              </button>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? "Adding..." : "Add Features"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

