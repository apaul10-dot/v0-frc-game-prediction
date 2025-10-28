"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPredictions: 0,
    accuracy: 0,
    teamsAnalyzed: 0,
  })

  useEffect(() => {
    const apiKey = localStorage.getItem("tba_api_key")
    if (!apiKey) {
      router.push("/")
      return
    }

    // Load stats from localStorage
    const predictions = JSON.parse(localStorage.getItem("predictions") || "[]")
    const modelData = JSON.parse(localStorage.getItem("ml_model") || "{}")

    setStats({
      totalPredictions: predictions.length,
      accuracy: modelData.accuracy || 0,
      teamsAnalyzed: modelData.teamsAnalyzed || 0,
    })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("tba_api_key")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Purple glow effects */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[150px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">ROBODATA</span>
        </div>

        <nav className="flex gap-4">
          <Link href="/strategy">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-6 rounded-full font-semibold">
              STRATEGY
            </Button>
          </Link>
          <Link href="/predictor">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-6 rounded-full font-semibold">
              AI PREDICTOR
            </Button>
          </Link>
          <Link href="/team-info">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-6 rounded-full font-semibold">
              TEAM INFO
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-6 rounded-full font-semibold">
              DASHBOARD
            </Button>
          </Link>
          <Button
            onClick={handleLogout}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-6 rounded-full font-semibold"
          >
            LOG OUT
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h3 className="text-gray-400 text-sm mb-2">Total Predictions</h3>
            <p className="text-4xl font-bold text-white">{stats.totalPredictions}</p>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h3 className="text-gray-400 text-sm mb-2">Model Accuracy</h3>
            <p className="text-4xl font-bold text-purple-400">{stats.accuracy.toFixed(1)}%</p>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h3 className="text-gray-400 text-sm mb-2">Teams Analyzed</h3>
            <p className="text-4xl font-bold text-white">{stats.teamsAnalyzed}</p>
          </Card>
        </div>

        <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/predictor">
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 rounded-lg text-lg">
                Make a Prediction
              </Button>
            </Link>
            <Link href="/team-info">
              <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-6 rounded-lg text-lg">
                Search Teams
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
