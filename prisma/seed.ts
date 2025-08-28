import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.energyReading.deleteMany()
  await prisma.weatherData.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.building.deleteMany()

  // Create a sample building
  const building = await prisma.building.create({
    data: {
      name: 'Corporate Headquarters',
      address: 'Alexanderplatz 1, 10178 Berlin, Germany',
      latitude: 52.5200,
      longitude: 13.4050,
      floorArea: 15000,
      constructionYear: 2010,
      buildingType: 'OFFICE',
      heatingSystem: 'GAS',
      coolingSystem: 'ELECTRIC',
      energyTariff: 0.12,
      co2Factor: 0.4,
      weatherStationId: '10382',
      timezone: 'Europe/Berlin',
      currency: 'EUR'
    }
  })

  console.log('✅ Created building:', building.name)

  // Generate energy readings for the last 12 months
  const energyReadings = []
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Simulate seasonal variation and daily patterns
    const month = date.getMonth()
    const hour = date.getHours()
    
    // Base consumption with seasonal variation
    let baseConsumption = 120 // kWh base
    
    // Winter heating (Dec, Jan, Feb) and summer cooling (Jun, Jul, Aug)
    if (month >= 11 || month <= 1) {
      baseConsumption += 60 // Winter heating
    } else if (month >= 5 && month <= 7) {
      baseConsumption += 40 // Summer cooling
    }
    
    // Daily pattern (higher during business hours)
    if (hour >= 8 && hour <= 18) {
      baseConsumption *= 1.5
    } else if (hour >= 19 && hour <= 22) {
      baseConsumption *= 0.8
    } else {
      baseConsumption *= 0.4
    }
    
    // Add some random variation
    const variation = (Math.random() - 0.5) * 0.3
    const consumption = baseConsumption * (1 + variation)
    
    // Calculate cost based on tariff
    const cost = consumption * building.energyTariff
    
    energyReadings.push({
      buildingId: building.id,
      timestamp: date,
      kWh: Math.round(consumption * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      temperature: 20 + (Math.random() - 0.5) * 10, // 15-25°C range
      humidity: 45 + Math.random() * 20, // 45-65% range
      co2ppm: 400 + Math.random() * 200 // 400-600 ppm range
    })
  }

  // Insert energy readings in batches
  const batchSize = 100
  for (let i = 0; i < energyReadings.length; i += batchSize) {
    const batch = energyReadings.slice(i, i + batchSize)
    await prisma.energyReading.createMany({
      data: batch
    })
  }

  console.log(`✅ Created ${energyReadings.length} energy readings`)

  // Generate weather data for the same period
  const weatherData = []
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const month = date.getMonth()
    
    // Simulate Berlin weather patterns
    let avgTemp = 10 // Base temperature
    
    // Seasonal temperature variation
    if (month >= 11 || month <= 1) {
      avgTemp = 2 + Math.random() * 6 // Winter: 2-8°C
    } else if (month >= 2 && month <= 4) {
      avgTemp = 8 + Math.random() * 10 // Spring: 8-18°C
    } else if (month >= 5 && month <= 7) {
      avgTemp = 18 + Math.random() * 12 // Summer: 18-30°C
    } else {
      avgTemp = 10 + Math.random() * 8 // Autumn: 10-18°C
    }
    
    weatherData.push({
      buildingId: building.id,
      date: date,
      temperature: Math.round(avgTemp * 10) / 10,
      humidity: 60 + (Math.random() - 0.5) * 30, // 45-75%
      windSpeed: Math.random() * 15, // 0-15 m/s
      precipitation: Math.random() < 0.3 ? Math.random() * 10 : 0, // 30% chance of rain
      pressure: 1013 + (Math.random() - 0.5) * 40, // 993-1033 hPa
      heatingDegreeDays: Math.max(0, 18 - avgTemp),
      coolingDegreeDays: Math.max(0, avgTemp - 24)
    })
  }

  // Insert weather data in batches
  for (let i = 0; i < weatherData.length; i += batchSize) {
    const batch = weatherData.slice(i, i + batchSize)
    await prisma.weatherData.createMany({
      data: batch
    })
  }

  console.log(`✅ Created ${weatherData.length} weather records`)

  // Create some sample alerts
  const alerts = [
    {
      buildingId: building.id,
      type: 'HIGH_USAGE',
      severity: 'HIGH',
      title: 'Unusually High Energy Consumption',
      message: 'Energy consumption is 25% above normal for this time of day. Check HVAC systems.',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      buildingId: building.id,
      type: 'MAINTENANCE',
      severity: 'MEDIUM',
      title: 'Scheduled Maintenance Due',
      message: 'HVAC system maintenance is due within the next 7 days.',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      buildingId: building.id,
      type: 'EFFICIENCY',
      severity: 'LOW',
      title: 'Energy Efficiency Opportunity',
      message: 'Lighting systems could be optimized to reduce consumption by 15%.',
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      buildingId: building.id,
      type: 'ANOMALY',
      severity: 'MEDIUM',
      title: 'Energy Usage Anomaly Detected',
      message: 'Unusual energy pattern detected in Zone B. Investigation recommended.',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    }
  ]

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert })
  }

  console.log(`✅ Created ${alerts.length} alerts`)

  // Create additional buildings for demonstration
  const additionalBuildings = [
    {
      name: 'Manufacturing Plant A',
      address: 'Industriestraße 15, 80339 München, Germany',
      latitude: 48.1351,
      longitude: 11.5820,
      floorArea: 25000,
      constructionYear: 2005,
      buildingType: 'INDUSTRIAL',
      heatingSystem: 'GAS',
      coolingSystem: 'ELECTRIC',
      energyTariff: 0.10,
      co2Factor: 0.45,
      weatherStationId: '10865',
      timezone: 'Europe/Berlin',
      currency: 'EUR'
    },
    {
      name: 'Retail Store Hamburg',
      address: 'Mönckebergstraße 7, 20095 Hamburg, Germany',
      latitude: 53.5511,
      longitude: 9.9937,
      floorArea: 3500,
      constructionYear: 2018,
      buildingType: 'RETAIL',
      heatingSystem: 'HEAT_PUMP',
      coolingSystem: 'ELECTRIC',
      energyTariff: 0.14,
      co2Factor: 0.35,
      weatherStationId: '10147',
      timezone: 'Europe/Berlin',
      currency: 'EUR'
    },
    {
      name: 'Warehouse Frankfurt',
      address: 'Cargo City Süd, 60549 Frankfurt am Main, Germany',
      latitude: 50.0379,
      longitude: 8.5622,
      floorArea: 12000,
      constructionYear: 2015,
      buildingType: 'WAREHOUSE',
      heatingSystem: 'GAS',
      coolingSystem: 'NONE',
      energyTariff: 0.11,
      co2Factor: 0.42,
      weatherStationId: '10637',
      timezone: 'Europe/Berlin',
      currency: 'EUR'
    }
  ]

  for (const buildingData of additionalBuildings) {
    await prisma.building.create({ data: buildingData })
  }

  console.log(`✅ Created ${additionalBuildings.length} additional buildings`)

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   • ${1 + additionalBuildings.length} buildings created`)
  console.log(`   • ${energyReadings.length} energy readings created`)
  console.log(`   • ${weatherData.length} weather records created`)
  console.log(`   • ${alerts.length} alerts created`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })