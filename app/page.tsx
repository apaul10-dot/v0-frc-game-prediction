"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Password strength checker
  const checkPasswordStrength = (pwd: string): number => {
    if (pwd.length === 0) return 0
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return Math.min(strength, 5)
  }

  // Email validation
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate email
      if (!email || !isValidEmail(email)) {
        setError("Please enter a valid email address")
        setLoading(false)
        return
      }

      // Validate password
      if (!password) {
        setError("Password is required")
        setLoading(false)
        return
      }

      if (!isLogin) {
        // Sign up validations
        if (password.length < 8) {
          setError("Password must be at least 8 characters long")
          setLoading(false)
          return
        }

        if (passwordStrength < 3) {
          setError("Password is too weak. Use a mix of uppercase, lowercase, numbers, and special characters")
          setLoading(false)
          return
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }

        if (!apiKey.trim()) {
          setError("TBA API key is required for sign up")
          setLoading(false)
          return
        }

        // Validate API key format (TBA keys are typically long alphanumeric strings)
        if (apiKey.length < 20) {
          setError("Invalid API key format. Please check your TBA API key.")
          setLoading(false)
          return
        }
      }

      // For demo purposes, we'll use localStorage to simulate auth
      // In production, you'd make API calls to your backend
      const userData = {
        email,
        password: btoa(password), // Simple encoding (not secure, just for demo)
        apiKey: apiKey || localStorage.getItem("tba_api_key") || "ferB29ThWDdfoz4qP1CnvchwyNnn378a6ZH0gSivKEiols3nkFi1Qf8qivHXtT6h",
        createdAt: new Date().toISOString(),
      }

      if (isLogin) {
        // Check if user exists
        const existingUser = localStorage.getItem(`user_${email}`)
        if (!existingUser) {
          setError("User not found. Please sign up first.")
          setLoading(false)
          return
        }

        const user = JSON.parse(existingUser)
        if (user.password !== btoa(password)) {
          setError("Invalid password")
          setLoading(false)
          return
        }

        // Store API key and user session
        localStorage.setItem("tba_api_key", user.apiKey)
        localStorage.setItem("user_email", email)
        localStorage.setItem("is_authenticated", "true")
      } else {
        // Sign up
        localStorage.setItem(`user_${email}`, JSON.stringify(userData))
        localStorage.setItem("tba_api_key", userData.apiKey)
        localStorage.setItem("user_email", email)
        localStorage.setItem("is_authenticated", "true")
      }

      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("[v0] Auth error:", err)
      setLoading(false)
    }
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
            onClick={() => {
              setIsLogin(true)
              setError("")
              setPassword("")
              setConfirmPassword("")
            }}
            className={`px-8 py-6 rounded-full text-lg font-semibold ${
              isLogin
                ? "bg-purple-500 hover:bg-purple-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            LOGIN
          </Button>
          <Button
            onClick={() => {
              setIsLogin(false)
              setError("")
              setPassword("")
              setConfirmPassword("")
            }}
            className={`px-8 py-6 rounded-full text-lg font-semibold ${
              !isLogin
                ? "bg-purple-500 hover:bg-purple-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
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
        <Card className="w-full max-w-md p-8 bg-gray-900/80 backdrop-blur-sm border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-6">{isLogin ? "Login" : "Sign Up"}</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordStrength(checkPasswordStrength(e.target.value))
                  }}
                  placeholder="Enter your password"
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {!isLogin && password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {passwordStrength <= 2
                      ? "Weak password"
                      : passwordStrength <= 3
                      ? "Medium strength"
                      : "Strong password"}
                  </p>
                </div>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Confirm Password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    TBA API Key <span className="text-purple-400">(Required)</span>
                  </label>
                  <Input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your The Blue Alliance API key"
                    className="bg-gray-800 border-gray-700 text-white"
                    required={!isLogin}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Get your API key from{" "}
                    <a
                      href="https://www.thebluealliance.com/account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline"
                    >
                      The Blue Alliance
                    </a>
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
                  Remember me
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || (!isLogin && passwordStrength < 3)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 rounded-full text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
