import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

interface EnergyDataInput {
  timestamp: string
  kWh: number
  cost: number
  co2: number
  source: string
}

// GET - Fetch energy data with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const source = searchParams.get('source')
    const limit = searchParams.get('limit')

    const where: {
      timestamp?: {
        gte: Date;
        lte: Date;
      };
      source?: string;
    } = {}
    
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (source) {
      where.source = source
    }

    const energyData = await prisma.energyReading.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    })

    // Calculate summary statistics
    const totalKWh = energyData.reduce((sum: number, reading: { kWh: number }) => sum + reading.kWh, 0)
    const totalCost = energyData.reduce((sum: number, reading: { cost: number }) => sum + reading.cost, 0)
    const totalCO2 = energyData.reduce((sum: number, reading: { co2: number }) => sum + reading.co2, 0)
    const avgKWh = energyData.length > 0 ? totalKWh / energyData.length : 0

    return NextResponse.json({
      data: energyData,
      summary: {
        totalRecords: energyData.length,
        totalKWh,
        totalCost,
        totalCO2,
        avgKWh,
        dateRange: energyData.length > 0 ? {
          start: energyData[energyData.length - 1].timestamp,
          end: energyData[0].timestamp
        } : null
      }
    })
  } catch (error) {
    console.error('Error fetching energy data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch energy data' },
      { status: 500 }
    )
  }
}

// POST - Create new energy data records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data }: { data: EnergyDataInput[] } = body

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of energy readings.' },
        { status: 400 }
      )
    }

    // Validate each record
    const validatedData = data.map((record, index) => {
      if (!record.timestamp || typeof record.kWh !== 'number' || typeof record.cost !== 'number') {
        throw new Error(`Invalid record at index ${index}: missing required fields`)
      }

      return {
        timestamp: new Date(record.timestamp),
        kWh: record.kWh,
        cost: record.cost,
        co2: record.co2 || 0,
        source: record.source || 'API Upload'
      }
    })

    // Use transaction to ensure all records are created or none
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdRecords = await tx.energyReading.createMany({
        data: validatedData,
        skipDuplicates: true // Skip records with duplicate timestamps
      })

      return createdRecords
    })

    return NextResponse.json({
      message: 'Energy data uploaded successfully',
      recordsCreated: result.count,
      totalSubmitted: data.length
    })
  } catch (error) {
    console.error('Error creating energy data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create energy data' },
      { status: 500 }
    )
  }
}

// DELETE - Delete energy data records
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (id) {
      // Delete specific record
      await prisma.energyReading.delete({
        where: { id: parseInt(id) }
      })
      return NextResponse.json({ message: 'Record deleted successfully' })
    } else if (startDate && endDate) {
      // Delete records in date range
      const result = await prisma.energyReading.deleteMany({
        where: {
          timestamp: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      })
      return NextResponse.json({ 
        message: 'Records deleted successfully',
        deletedCount: result.count
      })
    } else {
      return NextResponse.json(
        { error: 'Must provide either id or date range for deletion' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error deleting energy data:', error)
    return NextResponse.json(
      { error: 'Failed to delete energy data' },
      { status: 500 }
    )
  }
}