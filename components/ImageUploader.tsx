'use client'

import React, { useState, useRef } from 'react'
import { X, Upload, Camera, FileImage } from 'lucide-react'

interface ImageUploaderProps {
  onUpload: (file: File) => void
  onClose: () => void
}

export default function ImageUploader({ onUpload, onClose }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  const handleCameraCapture = () => {
    // This would integrate with device camera
    // For now, we'll simulate it
    alert('Camera capture would be implemented here')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Document
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-agri-green bg-agri-light' 
                : 'border-gray-300 hover:border-agri-green'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-agri-light rounded-full flex items-center justify-center mx-auto">
                <FileImage className="w-8 h-8 text-agri-green" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your image here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Or click to browse files
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-agri-green hover:bg-agri-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Browse Files
                </button>
                
                <button
                  onClick={handleCameraCapture}
                  className="flex-1 border border-gray-300 hover:border-agri-green text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Camera
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <img
                src={preview || ''}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <p className="text-sm text-gray-500 mt-2">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreview(null)
                }}
                className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 bg-agri-green hover:bg-agri-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload & Analyze
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Supported: JPG, PNG, PDF • Max size: 10MB</p>
          <p>Documents will be processed using OCR and translated</p>
        </div>
      </div>
    </div>
  )
}
