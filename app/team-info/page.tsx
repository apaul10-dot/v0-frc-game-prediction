"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchTeamData } from "@/lib/ml-model"

export default function TeamInfoPage() {
  const router = useRouter()
  const [teamNumber, setTeamNumber] = useState("")
  const [teamData, setTeamData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const currentYear = new Date().getFullYear()
  const [season, setSeason] = useState(currentYear.toString())

  useEffect(() => {
    const apiKey = localStorage.getItem("tba_api_key")
    if (!apiKey) {
      router.push("/")
    }
  }, [router])

  const handleSearch = async () => {
    if (!teamNumber.trim()) return

    setLoading(true)
    try {
      const apiKey = localStorage.getItem("tba_api_key")!
      const data = await fetchTeamData(apiKey, Number.parseInt(teamNumber), Number.parseInt(season))
      setTeamData(data)
    } catch (error) {
      console.error("[v0] Team search error:", error)
      alert("Error fetching team data. Please check the team number.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("tba_api_key")
    localStorage.removeItem("user_email")
    localStorage.removeItem("is_authenticated")
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
        <h1 className="text-4xl font-bold text-white mb-8">Team Information</h1>

        <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30 mb-8">
          <div className="flex gap-4">
            <Input
              type="number"
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
              placeholder="Enter team number (e.g., 254)"
              className="bg-gray-800 border-gray-700 text-white flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-white">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </Card>

        {teamData && (
          <div className="space-y-6">
            {/* Main Team Stats */}
            <Card className="p-8 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
              <h2 className="text-3xl font-bold text-white mb-2">Team {teamData.teamNumber}</h2>
              <p className="text-xl text-purple-400 mb-6">{teamData.nickname}</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Average Score</h3>
                  <p className="text-2xl font-bold text-white">{Number.isFinite(teamData.avgScore) ? teamData.avgScore.toFixed(1) : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Win Rate</h3>
                  <p className="text-2xl font-bold text-purple-400">{(teamData.winRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">OPR</h3>
                  <p className="text-2xl font-bold text-white">{Number.isFinite(teamData.opr) ? teamData.opr.toFixed(1) : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">DPR</h3>
                  <p className="text-2xl font-bold text-white">{Number.isFinite(teamData.dpr) ? teamData.dpr.toFixed(1) : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">CCWM</h3>
                  <p className="text-2xl font-bold text-purple-400">{Number.isFinite(teamData.ccwm) ? teamData.ccwm.toFixed(1) : "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Current Ranking</h3>
                  <p className="text-xl font-bold text-white">#{teamData.ranking}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Matches Played</h3>
                  <p className="text-xl font-bold text-white">{teamData.matchesPlayed}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Years Active</h3>
                  <p className="text-xl font-bold text-white">
                    {teamData.rookie_year ? new Date().getFullYear() - teamData.rookie_year + 1 : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Team Details */}
            <Card className="p-8 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Team Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p className="mb-2">
                    <span className="text-gray-400">Location:</span> {teamData.city || "N/A"}, {teamData.state_prov || "N/A"}, {teamData.country || "N/A"}
                  </p>
                  <p className="mb-2">
                    <span className="text-gray-400">Rookie Year:</span> {teamData.rookie_year || "N/A"}
                  </p>
                </div>
                <div>
                  {teamData.website && (
                    <p className="mb-2">
                      <span className="text-gray-400">Website:</span>{" "}
                      <a
                        href={teamData.website.startsWith("http") ? teamData.website : `https://${teamData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                      >
                        {teamData.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Recent Awards */}
            {teamData.historicalStats?.awards && teamData.historicalStats.awards.length > 0 && (
              <Card className="p-8 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">Recent Awards ({teamData.historicalStats.awards.length} most recent)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamData.historicalStats.awards.slice(0, 10).map((award: any, index: number) => {
                    // Extract event name from event_key (format: YYYYEVENT_CODE)
                    const eventKeyParts = award.event_key?.match(/(\d{4})(.+)/)
                    const eventYear = eventKeyParts ? eventKeyParts[1] : award.year
                    const eventCode = eventKeyParts ? eventKeyParts[2] : award.event_key?.replace(/^\d{4}/, '') || ''
                    
                    return (
                      <div key={index} className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                        <p className="text-white font-semibold text-lg mb-1">{award.name}</p>
                        <p className="text-sm text-gray-400">
                          <span className="text-purple-400">{eventYear}</span>
                          {eventCode && ` • ${eventCode.toUpperCase()}`}
                        </p>
                        {award.event_key && (
                          <p className="text-xs text-gray-500 mt-1">Event: {award.event_key}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                {teamData.historicalStats.awards.length > 10 && (
                  <p className="text-sm text-gray-400 mt-4">
                    Showing 10 of {teamData.historicalStats.awards.length} most recent awards
                  </p>
                )}
              </Card>
            )}

          </div>
        )}
      </main>
    </div>
  )
}
