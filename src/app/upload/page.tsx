"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react"
import Papa from "papaparse"

interface EnergyData {
  timestamp: string
  kWh: number
  cost: number
  co2: number
  source: string
}

interface ParseResult {
  data: EnergyData[]
  errors: string[]
  preview: EnergyData[]
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = []
        const validData: EnergyData[] = []

        results.data.forEach((row: any, index: number) => {
          try {
            // Validate required fields
            if (!row.timestamp || !row.kWh || !row.cost) {
              errors.push(`Row ${index + 1}: Missing required fields (timestamp, kWh, cost)`)
              return
            }

            // Parse and validate data
            const timestamp = new Date(row.timestamp)
            if (isNaN(timestamp.getTime())) {
              errors.push(`Row ${index + 1}: Invalid timestamp format`)
              return
            }

            const kWh = parseFloat(row.kWh)
            const cost = parseFloat(row.cost)
            const co2 = parseFloat(row.co2 || '0')

            if (isNaN(kWh) || isNaN(cost) || isNaN(co2)) {
              errors.push(`Row ${index + 1}: Invalid numeric values`)
              return
            }

            validData.push({
              timestamp: timestamp.toISOString(),
              kWh,
              cost,
              co2,
              source: row.source || 'Manual Upload'
            })
          } catch (error) {
            errors.push(`Row ${index + 1}: ${error}`)
          }
        })

        setParseResult({
          data: validData,
          errors,
          preview: validData.slice(0, 5)
        })
      },
      error: (error) => {
        setParseResult({
          data: [],
          errors: [`Parse error: ${error.message}`],
          preview: []
        })
      }
    })
  }

  const handleUpload = async () => {
    if (!parseResult?.data.length) return

    setIsUploading(true)
    try {
      const response = await fetch('/api/energy-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: parseResult.data })
      })

      if (response.ok) {
        setUploadStatus('success')
        // Reset form after successful upload
        setTimeout(() => {
          setFile(null)
          setParseResult(null)
          setUploadStatus('idle')
        }, 3000)
      } else {
        setUploadStatus('error')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      'timestamp,kWh,cost,co2,source',
      '2024-01-01T00:00:00Z,125.5,45.20,62.75,Main Meter',
      '2024-01-01T01:00:00Z,118.3,42.60,59.15,Main Meter',
      '2024-01-01T02:00:00Z,95.7,34.45,47.85,Main Meter'
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'energy-data-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Upload Energy Data</h1>
            <p className="text-muted-foreground">
              Import your energy consumption data from CSV files
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>File Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Download */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-2">Need a template?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download our CSV template with the correct format and sample data.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Template</span>
                  </Button>
                </div>

                {/* File Input */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        {file ? file.name : 'Choose CSV file'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click to browse or drag and drop your CSV file here
                      </p>
                    </label>
                  </div>

                  {/* Upload Button */}
                  {parseResult && parseResult.data.length > 0 && (
                    <Button 
                      onClick={handleUpload} 
                      disabled={isUploading}
                      className="w-full"
                      size="lg"
                    >
                      {isUploading ? 'Uploading...' : `Upload ${parseResult.data.length} Records`}
                    </Button>
                  )}

                  {/* Status Messages */}
                  {uploadStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                      <span>Data uploaded successfully!</span>
                    </div>
                  )}

                  {uploadStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <span>Upload failed. Please try again.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {!parseResult ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a CSV file to see data preview</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Valid Records</p>
                        <p className="text-2xl font-bold text-green-600">{parseResult.data.length}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Errors</p>
                        <p className="text-2xl font-bold text-red-600">{parseResult.errors.length}</p>
                      </div>
                    </div>

                    {/* Errors */}
                    {parseResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-600">Errors Found:</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {parseResult.errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                              {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preview Table */}
                    {parseResult.preview.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Sample Data (First 5 rows):</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Timestamp</th>
                                <th className="text-left p-2">kWh</th>
                                <th className="text-left p-2">Cost</th>
                                <th className="text-left p-2">CO₂</th>
                                <th className="text-left p-2">Source</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parseResult.preview.map((row, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                                  <td className="p-2">{row.kWh}</td>
                                  <td className="p-2">${row.cost}</td>
                                  <td className="p-2">{row.co2} kg</td>
                                  <td className="p-2">{row.source}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Format Requirements */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Required Columns:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><code className="bg-muted px-2 py-1 rounded">timestamp</code> - ISO 8601 format (e.g., 2024-01-01T00:00:00Z)</li>
                    <li><code className="bg-muted px-2 py-1 rounded">kWh</code> - Energy consumption in kilowatt-hours</li>
                    <li><code className="bg-muted px-2 py-1 rounded">cost</code> - Cost in dollars (decimal format)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Optional Columns:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><code className="bg-muted px-2 py-1 rounded">co2</code> - CO₂ emissions in kg (defaults to 0)</li>
                    <li><code className="bg-muted px-2 py-1 rounded">source</code> - Data source identifier (defaults to 'Manual Upload')</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}