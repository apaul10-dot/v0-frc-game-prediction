"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false)
  const apiKey = "ferB29ThWDdfoz4qP1CnvchwyNnn378a6ZH0gSivKEiols3nkFi1Qf8qivHXtT6h"

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("tba_api_key", apiKey)
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Purple glow effects */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-[400px] w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">ROBODATA</span>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => setIsLogin(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-6 rounded-full text-lg font-semibold"
          >
            LOGIN
          </Button>
          <Button
            onClick={() => setIsLogin(false)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-6 rounded-full text-lg font-semibold"
          >
            SIGN UP
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <h1 className="text-center mb-12">
          <div className="text-7xl md:text-8xl font-bold text-purple-400 mb-2">FRC GAME</div>
          <div className="text-7xl md:text-8xl font-bold text-white">PREDICTION</div>
        </h1>

        {/* Auth Modal */}
        {isLogin !== null && (
          <Card className="w-full max-w-md p-8 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-6">{isLogin ? "Login" : "Sign Up"}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <p className="text-gray-300 mb-4">
                  Click below to access the FRC Game Prediction system with pre-configured API access.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 rounded-full text-lg font-semibold"
              >
                {isLogin ? "Login" : "Get Started"}
              </Button>
            </form>
          </Card>
        )}
      </main>
    </div>
  )
}
