"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { trainModel, makePrediction } from "@/lib/ml-model"

export default function PredictorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [modelTrained, setModelTrained] = useState(false)
  const [redTeams, setRedTeams] = useState(["", "", ""])
  const [blueTeams, setBlueTeams] = useState(["", "", ""])
  const [prediction, setPrediction] = useState<any>(null)
  const [autoTraining, setAutoTraining] = useState(false)

  useEffect(() => {
    const apiKey = localStorage.getItem("tba_api_key")
    if (!apiKey) {
      router.push("/")
      return
    }

    const modelData = localStorage.getItem("ml_model")
    if (modelData) {
      setModelTrained(true)
      console.log("[v0] Model already trained")
    } else {
      console.log("[v0] No model found, starting auto-training...")
      setAutoTraining(true)
      trainModel(apiKey)
        .then(() => {
          setModelTrained(true)
          setAutoTraining(false)
          console.log("[v0] Auto-training complete!")
        })
        .catch((error) => {
          console.error("[v0] Auto-training failed:", error)
          setAutoTraining(false)
        })
    }
  }, [router])

  const handleTrainModel = async () => {
    setLoading(true)
    try {
      const apiKey = localStorage.getItem("tba_api_key")!
      await trainModel(apiKey)
      setModelTrained(true)
      alert("Model trained successfully!")
    } catch (error) {
      console.error("[v0] Training error:", error)
      alert("Error training model. Please check your API key.")
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!modelTrained) {
      alert("Please train the model first!")
      return
    }

    const redValid = redTeams.every((t) => t.trim() !== "")
    const blueValid = blueTeams.every((t) => t.trim() !== "")

    if (!redValid || !blueValid) {
      alert("Please enter all team numbers")
      return
    }

    setLoading(true)
    try {
      const apiKey = localStorage.getItem("tba_api_key")!
      console.log("[v0] Making prediction for:", { redTeams, blueTeams })
      const result = await makePrediction(
        apiKey,
        redTeams.map((t) => Number.parseInt(t)),
        blueTeams.map((t) => Number.parseInt(t)),
      )
      console.log("[v0] Prediction result received:", result)
      
      // Validate result before setting
      if (!result || typeof result !== "object") {
        throw new Error("Invalid prediction result received")
      }
      
      setPrediction(result)

      const predictions = JSON.parse(localStorage.getItem("predictions") || "[]")
      predictions.push({
        timestamp: new Date().toISOString(),
        redTeams,
        blueTeams,
        result,
      })
      localStorage.setItem("predictions", JSON.stringify(predictions))
    } catch (error) {
      console.error("[v0] Prediction error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`Error making prediction: ${errorMessage}`)
      setPrediction(null)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-4xl font-bold text-white mb-8">AI Predictor</h1>

        {autoTraining && (
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Training Model...</h2>
            <p className="text-gray-300 mb-4">
              The AI model is being trained on FRC team data. This will take a moment...
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: "100%" }} />
            </div>
          </Card>
        )}

        {!modelTrained && !autoTraining && (
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-purple-500/30 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Train Model First</h2>
            <p className="text-gray-300 mb-4">
              Train the linear regression model on FRC team data before making predictions.
            </p>
            <Button
              onClick={handleTrainModel}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg"
            >
              {loading ? "Training..." : "Train Model"}
            </Button>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Red Alliance</h2>
            <div className="space-y-4">
              {redTeams.map((team, idx) => (
                <div key={idx}>
                  <label className="text-sm text-gray-300 mb-2 block">Team {idx + 1}</label>
                  <Input
                    type="number"
                    value={team}
                    onChange={(e) => {
                      const newTeams = [...redTeams]
                      newTeams[idx] = e.target.value
                      setRedTeams(newTeams)
                    }}
                    placeholder="Enter team number"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/80 backdrop-blur-sm border-blue-500/30">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Blue Alliance</h2>
            <div className="space-y-4">
              {blueTeams.map((team, idx) => (
                <div key={idx}>
                  <label className="text-sm text-gray-300 mb-2 block">Team {idx + 1}</label>
                  <Input
                    type="number"
                    value={team}
                    onChange={(e) => {
                      const newTeams = [...blueTeams]
                      newTeams[idx] = e.target.value
                      setBlueTeams(newTeams)
                    }}
                    placeholder="Enter team number"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Button
          onClick={handlePredict}
          disabled={loading || !modelTrained}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 rounded-lg text-xl font-semibold mb-8"
        >
          {loading ? "Predicting..." : "Predict Winner"}
        </Button>

        {prediction && (
          <Card className="p-8 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-3xl font-bold text-white mb-6">Prediction Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">Red Alliance</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {(Number.isFinite(prediction.redScore) ? prediction.redScore : 0).toFixed(0)} points
                </p>
                <p className="text-lg text-gray-300">
                  Win Probability: {(Number.isFinite(prediction.redWinProbability) ? prediction.redWinProbability : 50).toFixed(1)}%
                </p>
                <div className="mt-4 space-y-2">
                  {prediction.redTeamData?.map((team: any) => (
                    <div key={team.teamNumber} className="text-sm text-gray-400">
                      <span className="font-semibold">{team.teamNumber}</span> - OPR: {(Number.isFinite(team.opr) ? team.opr : 0).toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-400 mb-2">Blue Alliance</h3>
                <p className="text-4xl font-bold text-white mb-2">
                  {(Number.isFinite(prediction.blueScore) ? prediction.blueScore : 0).toFixed(0)} points
                </p>
                <p className="text-lg text-gray-300">
                  Win Probability: {(Number.isFinite(prediction.blueWinProbability) ? prediction.blueWinProbability : 50).toFixed(1)}%
                </p>
                <div className="mt-4 space-y-2">
                  {prediction.blueTeamData?.map((team: any) => (
                    <div key={team.teamNumber} className="text-sm text-gray-400">
                      <span className="font-semibold">{team.teamNumber}</span> - OPR: {(Number.isFinite(team.opr) ? team.opr : 0).toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-2xl font-bold mb-2">
                <span className={prediction.winner === "red" ? "text-red-400" : "text-blue-400"}>
                  {(prediction.winner || "red").toUpperCase()} ALLIANCE
                </span>{" "}
                WINS
              </h3>
              <p className="text-gray-300">
                Confidence: {(Number.isFinite(prediction.confidence) ? prediction.confidence : 0).toFixed(1)}%
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
