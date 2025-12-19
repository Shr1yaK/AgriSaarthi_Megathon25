'use client'

import React, { useState } from 'react'
import { MessageCircle, Cloud, ArrowLeft } from 'lucide-react'
import ChatInterface from './ChatInterface'
import WeatherTab from './WeatherTab'

interface TabNavigationProps {
  selectedLanguage: string
  onBackToLanguageSelect: () => void
}

type TabType = 'chat' | 'weather'

export default function TabNavigation({ selectedLanguage, onBackToLanguageSelect }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  const tabs = [
    {
      id: 'chat' as TabType,
      label: 'Chat',
      icon: MessageCircle,
      description: 'Ask questions about farming'
    },
    {
      id: 'weather' as TabType,
      label: 'Weather',
      icon: Cloud,
      description: 'Get weather reports & advisories'
    }
  ]

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-agri-green text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanguageSelect}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">AgriSaarthi</h1>
              <p className="text-sm opacity-90">
                {selectedLanguage === 'hi' ? 'हिन्दी' : 
                 selectedLanguage === 'en' ? 'English' : 
                 selectedLanguage.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-agri-green text-white border-b-2 border-white'
                    : 'text-gray-600 hover:text-agri-green hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatInterface 
            selectedLanguage={selectedLanguage}
            onBackToLanguageSelect={onBackToLanguageSelect}
          />
        )}
        {activeTab === 'weather' && (
          <WeatherTab selectedLanguage={selectedLanguage} />
        )}
      </div>
    </div>
  )
}
