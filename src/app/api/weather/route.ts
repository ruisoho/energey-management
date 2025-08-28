import { NextRequest, NextResponse } from 'next/server'

interface WeatherData {
  date: string
  tavg: number // Average temperature
  tmin: number // Minimum temperature
  tmax: number // Maximum temperature
  prcp: number // Precipitation
  wspd: number // Wind speed
  pres: number // Pressure
}

interface MeteostatResponse {
  data: WeatherData[]
}

// GET - Fetch weather data from Meteostat API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const station = searchParams.get('station') || '10637' // Default to Berlin station
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.METEOSTAT_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Meteostat API key not configured' },
        { status: 500 }
      )
    }

    // Format dates for Meteostat API (YYYY-MM-DD)
    const formattedStart = new Date(startDate).toISOString().split('T')[0]
    const formattedEnd = new Date(endDate).toISOString().split('T')[0]

    const url = `https://meteostat.p.rapidapi.com/stations/daily?station=${station}&start=${formattedStart}&end=${formattedEnd}`
    
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      throw new Error(`Meteostat API error: ${response.status} ${response.statusText}`)
    }

    const weatherData: MeteostatResponse = await response.json()
    
    // Process and enhance the weather data
    const processedData = weatherData.data.map((day: WeatherData) => ({
      date: day.date,
      avgTemp: day.tavg || 0,
      minTemp: day.tmin || 0,
      maxTemp: day.tmax || 0,
      precipitation: day.prcp || 0,
      windSpeed: day.wspd || 0,
      pressure: day.pres || 0,
      // Calculate heating/cooling degree days (base 18°C)
      heatingDegreeDays: Math.max(0, 18 - (day.tavg || 0)),
      coolingDegreeDays: Math.max(0, (day.tavg || 0) - 18)
    }))

    // Calculate summary statistics
    const summary = {
      totalDays: processedData.length,
      avgTemperature: processedData.reduce((sum: number, day: any) => sum + day.avgTemp, 0) / processedData.length,
      totalPrecipitation: processedData.reduce((sum: number, day: any) => sum + day.precipitation, 0),
      totalHeatingDegreeDays: processedData.reduce((sum: number, day: any) => sum + day.heatingDegreeDays, 0),
      totalCoolingDegreeDays: processedData.reduce((sum: number, day: any) => sum + day.coolingDegreeDays, 0),
      minTemperature: Math.min(...processedData.map((day: any) => day.minTemp)),
      maxTemperature: Math.max(...processedData.map((day: any) => day.maxTemp))
    }

    return NextResponse.json({
      data: processedData,
      summary,
      station,
      dateRange: {
        start: formattedStart,
        end: formattedEnd
      }
    })
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

// GET weather stations near a location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lat, lon, limit = 10 } = body
    
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.METEOSTAT_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Meteostat API key not configured' },
        { status: 500 }
      )
    }

    const url = `https://meteostat.p.rapidapi.com/stations/nearby?lat=${lat}&lon=${lon}&limit=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      throw new Error(`Meteostat API error: ${response.status} ${response.statusText}`)
    }

    const stationsData = await response.json()
    
    return NextResponse.json({
      stations: stationsData.data,
      location: { lat, lon }
    })
  } catch (error) {
    console.error('Error fetching weather stations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch weather stations' },
      { status: 500 }
    )
  }
}