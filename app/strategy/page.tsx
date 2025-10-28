"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function StrategyPage() {
  const router = useRouter()

  useEffect(() => {
    const apiKey = localStorage.getItem("tba_api_key")
    if (!apiKey) {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("tba_api_key")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[150px]" />

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

      <main className="relative z-10 p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Strategy</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Alliance Selection Tips</h2>
            <ul className="space-y-3 text-gray-300">
              <li>• Look for teams with high average scores</li>
              <li>• Consider win rate and consistency</li>
              <li>• Balance offensive and defensive capabilities</li>
              <li>• Check recent performance trends</li>
            </ul>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Match Strategy</h2>
            <ul className="space-y-3 text-gray-300">
              <li>• Analyze opponent strengths and weaknesses</li>
              <li>• Coordinate roles within your alliance</li>
              <li>• Adapt strategy based on match conditions</li>
              <li>• Use prediction data to inform decisions</li>
            </ul>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Data-Driven Insights</h2>
            <ul className="space-y-3 text-gray-300">
              <li>• Use AI predictions to assess matchups</li>
              <li>• Track team performance over time</li>
              <li>• Identify high-performing alliances</li>
              <li>• Make informed scouting decisions</li>
            </ul>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/predictor">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4">Run Prediction</Button>
              </Link>
              <Link href="/team-info">
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4">Scout Teams</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
