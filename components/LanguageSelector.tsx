'use client'

import React, { useState } from 'react'
import { ArrowLeft, Check, Globe } from 'lucide-react'

interface LanguageSelectorProps {
  onLanguageSelect: (language: string) => void
  selectedLanguage: string
}

const languages = [
  { code: 'hi', name: 'हिन्दी', native: 'हिन्दी' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'bn', name: 'বাংলা', native: 'বাংলা' },
  { code: 'te', name: 'తెలుగు', native: 'తెలుగు' },
  { code: 'mr', name: 'मराठी', native: 'मराठी' },
  { code: 'ta', name: 'தமிழ்', native: 'தமிழ்' },
  { code: 'gu', name: 'ગુજરાતી', native: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം', native: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'ଓଡ଼ିଆ', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'অসমীয়া', native: 'অসমীয়া' }
]

export default function LanguageSelector({ onLanguageSelect, selectedLanguage }: LanguageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.native.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-light to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-agri-green mr-2" />
            <h1 className="text-3xl font-bold text-agri-dark">
              Choose Your Language
            </h1>
          </div>
          <p className="text-gray-600">
            Select your preferred language for the best experience
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green focus:border-transparent text-lg"
          />
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => onLanguageSelect(language.code)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                selectedLanguage === language.code
                  ? 'border-agri-green bg-agri-light shadow-md'
                  : 'border-gray-200 bg-white hover:border-agri-green'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-semibold text-lg text-gray-900">
                    {language.native}
                  </div>
                  <div className="text-sm text-gray-500">
                    {language.name}
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="w-5 h-5 text-agri-green" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        {selectedLanguage && (
          <div className="text-center">
            <button
              onClick={() => onLanguageSelect(selectedLanguage)}
              className="bg-agri-green hover:bg-agri-dark text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Continue with {languages.find(l => l.code === selectedLanguage)?.native}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Bhashini AI • Supporting 22+ Indian Languages</p>
        </div>
      </div>
    </div>
  )
}
