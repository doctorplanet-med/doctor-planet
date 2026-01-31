'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'

type Step = 'email' | 'code' | 'password' | 'success'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(120) // 2 minutes
  const [canResend, setCanResend] = useState(false)
  
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for code expiry
  useEffect(() => {
    if (step === 'code' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [step, countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStep('code')
        setCountdown(120)
        setCanResend(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send verification code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newCode = [...code]
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit
        }
      })
      setCode(newCode)
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + digits.length, 5)
      codeInputRefs.current[nextIndex]?.focus()
    } else {
      // Handle single digit
      const newCode = [...code]
      newCode[index] = value.replace(/\D/g, '')
      setCode(newCode)
      
      // Auto-focus next input
      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyCode = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })

      if (response.ok) {
        setStep('password')
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid or expired code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setIsLoading(true)
    setCode(['', '', '', '', '', ''])

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setCountdown(120)
        setCanResend(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to resend code')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          code: code.join(''), 
          password 
        }),
      })

      if (response.ok) {
        setStep('success')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-20 pb-16 flex items-center justify-center bg-secondary-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/logos/logo.png"
                alt="Doctor Planet"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-heading font-bold text-xl sm:text-2xl">
              <span className="text-primary-600">doctor</span>
              <span className="text-secondary-950">planet</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Step 1: Enter Email */}
          {step === 'email' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-secondary-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-secondary-600 text-sm sm:text-base">
                  Enter your email and we'll send you a verification code.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="input-field pl-11"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sending...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Enter Code */}
          {step === 'code' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-secondary-900 mb-2">
                  Enter Verification Code
                </h1>
                <p className="text-secondary-600 text-sm">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Code Input */}
              <div className="flex justify-center gap-2 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { codeInputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center mb-4">
                {countdown > 0 ? (
                  <p className="text-sm text-secondary-600">
                    Code expires in <span className="font-bold text-primary-600">{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">
                    Code expired
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || code.join('').length !== 6}
                className="btn-primary w-full py-3 mb-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                onClick={handleResendCode}
                disabled={!canResend || isLoading}
                className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
                  canResend 
                    ? 'text-primary-600 hover:bg-primary-50' 
                    : 'text-secondary-400 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Resend Code' : `Resend in ${formatTime(countdown)}`}
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-700 font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Use different email
                </button>
              </div>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-secondary-900 mb-2">
                  Create New Password
                </h1>
                <p className="text-secondary-600 text-sm">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="input-field pl-11 pr-11"
                      required
                      minLength={8}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="input-field pl-11"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-secondary-900 mb-2">
                Password Reset Successful!
              </h1>
              <p className="text-secondary-600 mb-6">
                Your password has been reset. Redirecting to login...
              </p>
              <Link href="/login" className="btn-primary">
                Go to Login
              </Link>
            </motion.div>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-secondary-500 text-xs sm:text-sm mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@doctorplanet.com" className="text-primary-600 hover:underline">
            support@doctorplanet.com
          </a>
        </p>
      </motion.div>
    </div>
  )
}
