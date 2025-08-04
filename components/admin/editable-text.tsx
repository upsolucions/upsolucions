"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Edit, Check, X, Loader2 } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface EditableTextProps {
  path: string
  value: string
  className?: string
  multiline?: boolean
  placeholder?: string
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
}

export function EditableText({
  path,
  value,
  className = "",
  multiline = false,
  placeholder = "",
  as = "span",
}: EditableTextProps) {
  const { isAdmin, updateContent } = useAdmin()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Sync local editValue with prop value when prop changes (due to Realtime or initial load)
  useEffect(() => {
    setEditValue(value)
    setHasUnsavedChanges(false) // Reset unsaved changes flag
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      setHasUnsavedChanges(false)
      return
    }

    setIsSaving(true)
    try {
      await updateContent(path, editValue) // This now triggers Supabase update
      setIsEditing(false)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error saving content:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditValue(e.target.value)
    setHasUnsavedChanges(e.target.value !== value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (!isAdmin) {
    const Component = as
    return <Component className={className}>{value}</Component>
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`${className} min-h-[100px] ${hasUnsavedChanges ? "border-orange-500 bg-orange-50" : ""}`}
            placeholder={placeholder}
            disabled={isSaving}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`${className} ${hasUnsavedChanges ? "border-orange-500 bg-orange-50" : ""}`}
            placeholder={placeholder}
            disabled={isSaving}
          />
        )}
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {hasUnsavedChanges && <p className="text-xs text-orange-600 mt-1">Alterações não salvas</p>}
      </div>
    )
  }

  const Component = as
  const isInlineElement = as === 'span' || as === 'p'
  
  if (isInlineElement) {
    return (
      <span className="relative group">
        <Component className={className}>{value}</Component>
        <span
          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-blue-500 hover:text-blue-700"
          onClick={() => setIsEditing(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsEditing(true)
            }
          }}
          title="Clique para editar"
        >
          ✏️
        </span>
      </span>
    )
  }
  
  return (
    <div className="relative group inline-block">
      <Component className={className}>{value}</Component>
      <div
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-xs px-2 py-1 border border-gray-200 rounded cursor-pointer flex items-center justify-center"
        onClick={() => setIsEditing(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsEditing(true)
          }
        }}
      >
        <Edit className="w-3 h-3" />
      </div>
    </div>
  )
}
