import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.energyReading.deleteMany()

  console.log('✅ Cleared existing energy readings')

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
    
    // Calculate cost based on standard tariff
    const cost = consumption * 0.12 // €0.12 per kWh
    
    energyReadings.push({
      timestamp: date,
      kWh: Math.round(consumption * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      co2: Math.round(consumption * 0.4 * 100) / 100, // 0.4 kg CO2 per kWh
      source: 'seed'
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

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   • ${energyReadings.length} energy readings created`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })