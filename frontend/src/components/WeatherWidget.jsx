import { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // OpenWeatherMap API configuration
  const API_KEY = '26e865d91e9e1fe1a7b9eb2d2df195ea';
  const LAT = -27.4705; // Brisbane latitude
  const LON = 153.0260; // Brisbane longitude
  
  // Using coordinates instead of city name for better accuracy
  const API_URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&appid=${API_KEY}&exclude=minutely,hourly,alerts&units=metric`;


  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(API_URL);
      setWeather(response.data);
    } catch (error) {
      console.error('Weather API Error:', error);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if API key is provided
    if (API_KEY !== 'YOUR_API_KEY_HERE') {
      fetchWeather();
    } else {
      setLoading(false);
      setError('Please add your OpenWeatherMap API key');
    }
  }, []);

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDayName = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-AU', { weekday: 'long' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3">Loading weather forecast...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !weather) {
    return (
      <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-6 text-white shadow-lg">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Weather Unavailable</h3>
          <p className="text-sm opacity-90">{error}</p>
          {API_KEY === 'YOUR_API_KEY_HERE' && (
            <div className="mt-4 p-3 bg-black bg-opacity-20 rounded">
              <p className="text-xs">
                Get your free API key from{' '}
                <a 
                  href="https://openweathermap.org/api/one-call-3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  OpenWeatherMap One Call API 3.0
                </a>
              </p>
            </div>
          )}
          <button
            onClick={fetchWeather}
            className="mt-4 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get first 5 days for display
  const dailyForecast = weather.daily ? weather.daily.slice(0, 5) : [];

  return (
    <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Brisbane Weather</h3>
          <p className="text-sm opacity-90">5-Day Forecast</p>
        </div>
        <button
          onClick={fetchWeather}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
          title="Refresh weather"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {dailyForecast.map((day, index) => (
          <div 
            key={day.dt} 
            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              index === 0 
                ? 'bg-white bg-opacity-20' 
                : 'bg-white bg-opacity-10 hover:bg-opacity-15'
            }`}
          >
            <div className="flex items-center flex-1">
              <div className="text-sm font-medium w-20">
                {getDayName(day.dt)}
              </div>
              
              <img
                src={getWeatherIcon(day.weather[0].icon)}
                alt={day.weather[0].description}
                className="w-10 h-10 mx-2"
              />
              
              <div className="flex-1">
                <div className="text-sm capitalize opacity-90">
                  {day.weather[0].description}
                </div>
                {day.summary && (
                  <div className="text-xs opacity-75 mt-1">
                    {day.summary}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="opacity-75">High:</span>
                <span className="font-semibold text-lg">
                  {Math.round(day.temp.max)}°
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="opacity-75">Low:</span>
                <span className="font-medium">
                  {Math.round(day.temp.min)}°
                </span>
              </div>

              <div className="flex items-center space-x-1 text-xs opacity-75">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14l-5-5m0 0l-5 5m5-5v10" />
                </svg>
                <span>{day.humidity}%</span>
              </div>

              {day.pop > 0 && (
                <div className="flex items-center space-x-1 text-xs opacity-75">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                  <span>{Math.round(day.pop * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs opacity-60 text-center">
        Last updated: {new Date().toLocaleTimeString('en-AU')}
      </div>
    </div>
  );
};

export default WeatherWidget;