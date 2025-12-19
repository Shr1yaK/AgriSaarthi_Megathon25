'use client'

import React, { useEffect, useState } from 'react'
import { Sprout, Mic, MessageCircle, Camera } from 'lucide-react'

export default function SplashScreen() {
  const [currentFeature, setCurrentFeature] = useState(0)
  
  const features = [
    { icon: Mic, text: "Speak in your language", color: "text-blue-500" },
    { icon: MessageCircle, text: "Get instant advice", color: "text-green-500" },
    { icon: Camera, text: "Upload documents", color: "text-purple-500" },
    { icon: Sprout, text: "Grow better crops", color: "text-agri-green" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-agri-light to-white">
      <div className="text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-agri-green rounded-full flex items-center justify-center animate-bounce-gentle">
            <Sprout className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-agri-dark">
            AgriSaarthi
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            One chat. Every crop. Every language.
          </p>
        </div>

        {/* Animated Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            {features[currentFeature].icon && React.createElement(features[currentFeature].icon, {
              className: `w-8 h-8 ${features[currentFeature].color} animate-pulse-slow`
            })}
            <span className="text-lg font-medium text-gray-700">
              {features[currentFeature].text}
            </span>
          </div>
          
          <div className="flex space-x-2 justify-center">
            {features.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentFeature ? 'bg-agri-green' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-agri-green rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-agri-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-agri-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        <p className="text-sm text-gray-500">
          Powered by Bhashini AI
        </p>
      </div>
    </div>
  )
}
