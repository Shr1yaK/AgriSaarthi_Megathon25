'use client'

import React, { useState, useEffect } from 'react'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  MapPin, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

interface WeatherData {
  location: string
  temperature: number
  condition: string
  windSpeed: number
  humidity: number
  advisory: string
  timestamp: string
}

interface WeatherTabProps {
  selectedLanguage: string
}

export default function WeatherTab({ selectedLanguage }: WeatherTabProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentLocations, setRecentLocations] = useState<string[]>([])

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weatherLocations')
    if (saved) {
      setRecentLocations(JSON.parse(saved))
    }
  }, [])

  const fetchWeatherData = async (loc: string) => {
    if (!loc.trim()) return

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`http://localhost:8004/data/weather_advisory?location=${encodeURIComponent(loc)}`)
      
      if (!response.ok) {
        throw new Error('Weather service unavailable')
      }
      
      const data = await response.json()
      
      // Parse the message to extract weather details
      const message = data.message
      const tempMatch = message.match(/(\d+(?:\.\d+)?)°C/)
      const windMatch = message.match(/(\d+(?:\.\d+)?) km\/h/)
      const humidityMatch = message.match(/(\d+)%/)
      const conditionMatch = message.match(/with ([^.]+)\./)
      
      const weatherInfo: WeatherData = {
        location: loc,
        temperature: tempMatch ? parseFloat(tempMatch[1]) : 0,
        condition: conditionMatch ? conditionMatch[1] : 'Unknown',
        windSpeed: windMatch ? parseFloat(windMatch[1]) : 0,
        humidity: humidityMatch ? parseInt(humidityMatch[1]) : 0,
        advisory: message,
        timestamp: new Date().toLocaleString()
      }
      
      setWeatherData(weatherInfo)
      
      // Add to recent locations
      const newLocations = [loc, ...recentLocations.filter(l => l !== loc)].slice(0, 5)
      setRecentLocations(newLocations)
      localStorage.setItem('weatherLocations', JSON.stringify(newLocations))
      
    } catch (err) {
      setError('Unable to fetch weather data. Please check your connection and try again.')
      console.error('Weather fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.trim()) {
      fetchWeatherData(location.trim())
    }
  }

  const handleRefresh = () => {
    if (weatherData?.location) {
      fetchWeatherData(weatherData.location)
    }
  }

  const handleCopyAdvisory = async () => {
    if (weatherData?.advisory) {
      try {
        await navigator.clipboard.writeText(weatherData.advisory)
        // You could add a toast notification here
        alert('Advisory copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy: ', err)
        alert('Failed to copy advisory')
      }
    }
  }

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase()
    if (cond.includes('rain') || cond.includes('shower')) return <CloudRain className="w-8 h-8 text-blue-500" />
    if (cond.includes('cloud')) return <Cloud className="w-8 h-8 text-gray-500" />
    if (cond.includes('sun') || cond.includes('clear')) return <Sun className="w-8 h-8 text-yellow-500" />
    return <Cloud className="w-8 h-8 text-gray-500" />
  }

  const getAdvisoryIcon = (advisory: string) => {
    if (advisory.includes('warning') || advisory.includes('avoid') || advisory.includes('risk')) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
    if (advisory.includes('suitable') || advisory.includes('good') || advisory.includes('excellent')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    return <Clock className="w-5 h-5 text-blue-500" />
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 35) return 'text-red-600'
    if (temp > 25) return 'text-orange-600'
    if (temp < 10) return 'text-blue-600'
    return 'text-green-600'
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Cloud className="w-8 h-8 text-blue-500" />
            Weather Reports
          </h1>
          <p className="text-gray-600">Get real-time weather data and agricultural advisories</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city, district, or village name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!location.trim() || isLoading}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isLoading ? 'Loading...' : 'Get Weather'}
            </button>
          </form>

          {/* Recent Locations */}
          {recentLocations.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentLocations.map((loc, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLocation(loc)
                      fetchWeatherData(loc)
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Weather Data Display */}
        {weatherData && (
          <div className="space-y-6">
            {/* Main Weather Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(weatherData.condition)}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{weatherData.location}</h2>
                    <p className="text-gray-600">{weatherData.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getTemperatureColor(weatherData.temperature)}`}>
                    {weatherData.temperature}°C
                  </div>
                  <p className="text-sm text-gray-500">Updated: {weatherData.timestamp}</p>
                </div>
              </div>

              {/* Weather Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Wind Speed</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{weatherData.windSpeed} km/h</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">Humidity</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{weatherData.humidity}%</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-700">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{weatherData.temperature}°C</div>
                </div>
              </div>

              {/* Agricultural Advisory */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-start gap-3">
                  {getAdvisoryIcon(weatherData.advisory)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Agricultural Advisory
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{weatherData.advisory}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleRefresh}
                className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Refresh Data</h3>
                    <p className="text-sm text-gray-600">Get latest weather information</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={handleCopyAdvisory}
                className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Copy Advisory</h3>
                    <p className="text-sm text-gray-600">Share with other farmers</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!weatherData && !isLoading && !error && (
          <div className="text-center py-12">
            <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Weather Data</h3>
            <p className="text-gray-500">Enter a location above to get weather information and agricultural advisories.</p>
          </div>
        )}
      </div>
    </div>
  )
}
