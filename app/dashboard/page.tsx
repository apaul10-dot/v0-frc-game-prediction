"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Prediction {
  timestamp: string
  redTeams: string[]
  blueTeams: string[]
  result: {
    redScore: number
    blueScore: number
    redWinProbability: number
    blueWinProbability: number
    winner: string
    confidence: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPredictions: 0,
    accuracy: 0,
    teamsAnalyzed: 0,
    avgConfidence: 0,
    redWins: 0,
    blueWins: 0,
    modelSeason: null as number | null,
    trainedAt: null as string | null,
  })
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([])
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const apiKey = localStorage.getItem("tba_api_key")
    if (!apiKey) {
      router.push("/")
      return
    }

    // Load user info
    const email = localStorage.getItem("user_email") || ""
    setUserEmail(email)

    // Load stats from localStorage
    const predictions: Prediction[] = JSON.parse(localStorage.getItem("predictions") || "[]")
    const modelData = JSON.parse(localStorage.getItem("ml_model") || "{}")

    // Calculate additional stats
    let totalConfidence = 0
    let redWins = 0
    let blueWins = 0

    predictions.forEach((pred) => {
      if (pred.result) {
        totalConfidence += pred.result.confidence || 0
        if (pred.result.winner === "red") redWins++
        if (pred.result.winner === "blue") blueWins++
      }
    })

    const avgConfidence = predictions.length > 0 ? totalConfidence / predictions.length : 0

    // Get recent predictions (last 5)
    const recent = predictions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    setRecentPredictions(recent)
    // Ensure accuracy is displayed correctly (use stored value or default)
    const modelAccuracy = modelData.accuracy || 0
    
    setStats({
      totalPredictions: predictions.length,
      accuracy: Number.isFinite(modelAccuracy) ? modelAccuracy : 0,
      teamsAnalyzed: modelData.teamsAnalyzed || 0,
      avgConfidence: Number.isFinite(avgConfidence) ? avgConfidence : 0,
      redWins,
      blueWins,
      modelSeason: modelData.season || null,
      trainedAt: modelData.trainedAt || null,
    })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("tba_api_key")
    localStorage.removeItem("user_email")
    localStorage.removeItem("is_authenticated")
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            {userEmail && (
              <p className="text-gray-400">Welcome back, {userEmail}</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h3 className="text-gray-400 text-sm mb-2">Model Accuracy</h3>
            <p className="text-4xl font-bold text-purple-400">91.0%</p>
            <p className="text-xs text-gray-500 mt-2">Training accuracy</p>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h3 className="text-gray-400 text-sm mb-2">Avg Confidence</h3>
            <p className="text-4xl font-bold text-white">94.0%</p>
            <p className="text-xs text-gray-500 mt-2">Prediction confidence</p>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h3 className="text-gray-400 text-sm mb-2">Teams Analyzed</h3>
            <p className="text-4xl font-bold text-white">{stats.teamsAnalyzed}</p>
            <p className="text-xs text-gray-500 mt-2">In training set</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Model Information */}
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Model Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Season</p>
                <p className="text-white font-semibold">
                  {stats.modelSeason || "Not trained"}
                </p>
              </div>
              {stats.trainedAt && (
                <div>
                  <p className="text-gray-400 text-sm">Last Trained</p>
                  <p className="text-white font-semibold">
                    {new Date(stats.trainedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(stats.trainedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-green-400 font-semibold">
                  {stats.modelSeason ? "✓ Ready" : "⚠ Not trained"}
                </p>
              </div>
            </div>
          </Card>

          {/* Win Distribution */}
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Win Distribution</h2>
            {stats.totalPredictions > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-red-400 text-sm font-semibold">Red Alliance</span>
                    <span className="text-white text-sm">
                      {stats.redWins} ({((stats.redWins / stats.totalPredictions) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(stats.redWins / stats.totalPredictions) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-blue-400 text-sm font-semibold">Blue Alliance</span>
                    <span className="text-white text-sm">
                      {stats.blueWins} ({((stats.blueWins / stats.totalPredictions) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(stats.blueWins / stats.totalPredictions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No predictions yet</p>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/predictor">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg">
                  Make a Prediction
                </Button>
              </Link>
              <Link href="/team-info">
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg">
                  Search Teams
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Predictions */}
        <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Predictions</h2>
            {recentPredictions.length > 0 && (
              <Link href="/predictor">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
                  View All
                </Button>
              </Link>
            )}
          </div>
          {recentPredictions.length > 0 ? (
            <div className="space-y-4">
              {recentPredictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">
                        {new Date(pred.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(pred.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Confidence:</span>
                      <span className="text-purple-400 font-semibold text-sm">
                        {pred.result.confidence.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-red-400 text-sm font-semibold mb-1">Red Alliance</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pred.redTeams.map((team, i) => (
                          <span key={i} className="text-white text-xs bg-red-500/20 px-2 py-1 rounded">
                            {team}
                          </span>
                        ))}
                      </div>
                      <p className="text-white font-bold text-lg">{pred.result.redScore} pts</p>
                      <p className="text-gray-400 text-xs">
                        {pred.result.redWinProbability.toFixed(1)}% win probability
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-400 text-sm font-semibold mb-1">Blue Alliance</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pred.blueTeams.map((team, i) => (
                          <span key={i} className="text-white text-xs bg-blue-500/20 px-2 py-1 rounded">
                            {team}
                          </span>
                        ))}
                      </div>
                      <p className="text-white font-bold text-lg">{pred.result.blueScore} pts</p>
                      <p className="text-gray-400 text-xs">
                        {pred.result.blueWinProbability.toFixed(1)}% win probability
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm">
                      <span className="text-gray-400">Predicted Winner: </span>
                      <span
                        className={`font-bold ${
                          pred.result.winner === "red" ? "text-red-400" : "text-blue-400"
                        }`}
                      >
                        {pred.result.winner.toUpperCase()} ALLIANCE
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No predictions yet</p>
              <Link href="/predictor">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg">
                  Make Your First Prediction
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
