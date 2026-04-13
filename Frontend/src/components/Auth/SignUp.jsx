import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Plane, RefreshCw, Facebook, Twitter, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { auth, googleProvider, facebookProvider, twitterProvider } from '../../config/firebase'
import { signInWithPopup } from 'firebase/auth'
import tropicalBg from '../../assets/tropical_canoe.png'

const STEPS = ['Identity', 'Security', 'Finish']

const passwordStrength = (pwd) => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-teal-400', 'bg-[#20e3d2]']

export default function SignUp() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isFocused, setIsFocused] = useState(null)
  const [termsAgreed, setTermsAgreed] = useState(true)
  const { signUp, socialSignIn, loading } = useAuth()
  const navigate = useNavigate()

  const strength = passwordStrength(password)

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 0) {
      if (!name.trim()) { toast.error('Enter your name'); return }
      if (!email.includes('@')) { toast.error('Enter a valid email'); return }
      setStep(1)
    } else {
      if (password.length < 8) { toast.error('Password must be 8+ characters'); return }
      if (password !== confirm) { toast.error('Passwords do not match'); return }
      if (!termsAgreed) { toast.error('You must agree to terms of service'); return }
      handleSignUp()
    }
  }

  const handleSignUp = async () => {
    try {
      await signUp(name, email, password)
      setStep(2)
      setTimeout(() => {
        toast.success('Account created! Let\'s explore 🌍')
        navigate('/dashboard')
      }, 2500)
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleSocialLogin = async (providerInstance, name) => {
    try {
      if (!termsAgreed) { toast.error('You must agree to terms to sign up'); return }
      const result = await signInWithPopup(auth, providerInstance)
      const user = result.user

      await socialSignIn(user.email, user.displayName, user.uid)
      setStep(2)
      setTimeout(() => {
        toast.success(`Account connected via ${name}! 🌍`)
        navigate('/dashboard')
      }, 2500)
    } catch (err) {
      console.error(err)
      toast.error(`Failed to register with ${name}: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden font-sans selection:bg-[#20e3d2] selection:text-[#021d24] bg-[#021d24]">

      {/* Background Image Area */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={tropicalBg}
          alt="Tropical canoe"
          className="w-full h-full object-cover opacity-80"
        />
        {/* Soft fading gradient to seamlessly blend the image under the glass panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#021d24] via-[#021d24]/50 to-transparent pointer-events-none" />

        {/* Overlay Text */}
        <div className="absolute bottom-16 right-16 md:right-32 text-right pointer-events-none hidden lg:block z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-6xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] tracking-tight leading-none"
          >
            BEAUTIFUL
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-2xl font-bold text-[#20e3d2] drop-shadow-lg tracking-[0.3em] mt-3"
          >
            DESTINATIONS AWAIT
          </motion.p>
        </div>
      </div>

      {/* Left Form Panel - Premium Glassmorphism */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-[45%] bg-[#041a20]/60 backdrop-blur-2xl border-r border-white/10 h-full relative z-20 flex flex-col justify-center px-8 sm:px-12 md:px-20 min-h-screen overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Soft floating background orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#17b2a4]/20 rounded-full filter blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#0cd1c2]/10 rounded-full filter blur-[100px] pointer-events-none z-0" />

        {/* Content Wrapper */}
        <div className="max-w-[420px] w-full mx-auto lg:mr-auto lg:ml-0 z-30 py-10 relative">

          {/* Logo & Branding */}
          <div className="flex items-center gap-4 mb-16 cursor-pointer opacity-90 hover:opacity-100 transition-opacitygroup" onClick={() => navigate('/')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#20e3d2] to-[#0cd1c2] flex items-center justify-center shadow-lg shadow-[#0cd1c2]/30 group-hover:rotate-12 transition-transform duration-500">
              <Plane size={24} className="text-[#021d24] rotate-45" />
            </div>
            <div>
              <span className="font-black text-white tracking-tight text-xl block leading-tight">SMART TRAVEL</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#20e3d2]">Companion</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-[2.75rem] font-black text-white tracking-tight mb-8 text-left">
            Create Account
          </h2>

          <form onSubmit={handleNext} className="space-y-6">
            <AnimatePresence mode="wait">
              {step < 2 ? (
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-5">
                    {step === 0 ? (
                      <>
                        <div className={clsx("relative w-full transition-all duration-300 rounded-2xl border", isFocused === 'name' ? 'scale-[1.02] shadow-[0_0_20px_rgba(32,227,210,0.15)] bg-white/10 border-[#20e3d2]/50' : 'bg-white/5 border-transparent hover:bg-white/10')}>
                          <div className={clsx("absolute left-5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 pointer-events-none", isFocused === 'name' ? 'text-[#20e3d2]' : 'text-slate-400')}>
                            <User size={20} strokeWidth={2.5} />
                          </div>
                          <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onFocus={() => setIsFocused('name')}
                            onBlur={() => setIsFocused(null)}
                            className="w-full h-14 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-400/80 font-bold pl-14 pr-4 tracking-wide outline-none placeholder:font-semibold rounded-2xl [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#062129_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                          />
                        </div>

                        <div className={clsx("relative w-full transition-all duration-300 rounded-2xl border", isFocused === 'email' ? 'scale-[1.02] shadow-[0_0_20px_rgba(32,227,210,0.15)] bg-white/10 border-[#20e3d2]/50' : 'bg-white/5 border-transparent hover:bg-white/10')}>
                          <div className={clsx("absolute left-5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 pointer-events-none", isFocused === 'email' ? 'text-[#20e3d2]' : 'text-slate-400')}>
                            <Mail size={20} strokeWidth={2.5} />
                          </div>
                          <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setIsFocused('email')}
                            onBlur={() => setIsFocused(null)}
                            className="w-full h-14 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-400/80 font-bold pl-14 pr-4 tracking-wide outline-none placeholder:font-semibold rounded-2xl [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#062129_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={clsx("relative w-full transition-all duration-300 rounded-2xl border", isFocused === 'pass' ? 'scale-[1.02] shadow-[0_0_20px_rgba(32,227,210,0.15)] bg-white/10 border-[#20e3d2]/50' : 'bg-white/5 border-transparent hover:bg-white/10')}>
                          <div className={clsx("absolute left-5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 pointer-events-none", isFocused === 'pass' ? 'text-[#20e3d2]' : 'text-slate-400')}>
                            <Lock size={20} strokeWidth={2.5} />
                          </div>
                          <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="Create password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setIsFocused('pass')}
                            onBlur={() => setIsFocused(null)}
                            className="w-full h-14 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-400/80 font-bold pl-14 pr-12 tracking-wide outline-none placeholder:font-semibold rounded-2xl [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#062129_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                          />
                          <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-5 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-[#20e3d2] transition-colors">
                            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>

                        {password.length > 0 && (
                          <div className="px-5 py-1">
                            <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-full mb-1">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className={clsx("h-1.5 flex-1 rounded-full transition-all duration-500", i <= strength ? strengthColor[strength] : "bg-white/20")} />
                              ))}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1 mt-1.5">Strength: <span className={clsx("ml-1", strengthColor[strength].replace('bg-', 'text-'))}>{strengthLabel[strength] || 'Too short'}</span></p>
                          </div>
                        )}

                        <div className={clsx("relative w-full transition-all duration-300 rounded-2xl border mt-2", isFocused === 'conf' ? 'scale-[1.02] shadow-[0_0_20px_rgba(32,227,210,0.15)] bg-white/10 border-[#20e3d2]/50' : 'bg-white/5 border-transparent hover:bg-white/10')}>
                          <div className={clsx("absolute left-5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 pointer-events-none", isFocused === 'conf' ? 'text-[#20e3d2]' : 'text-slate-400')}>
                            <Lock size={20} strokeWidth={2.5} />
                          </div>
                          <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            onFocus={() => setIsFocused('conf')}
                            onBlur={() => setIsFocused(null)}
                            className="w-full h-14 bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-400/80 font-bold pl-14 pr-4 tracking-wide outline-none placeholder:font-semibold rounded-2xl [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#062129_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-3 py-1 px-1 mt-2">
                      <input
                        type="checkbox"
                        id="terms-signup"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="w-4 h-4 rounded text-[#20e3d2] focus:ring-[#20e3d2] border-white/20 bg-white/5 outline-none transition-colors cursor-pointer"
                      />
                      <label htmlFor="terms-signup" className="text-[11px] font-bold text-slate-300 uppercase tracking-wide cursor-pointer select-none">
                        I agree all statements in <a href="#" className="text-[#20e3d2] hover:text-white transition-colors uppercase tracking-wide">terms of service.</a>
                      </label>
                    </div>

                    <div className="pt-2 flex flex-col gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 h-14 bg-gradient-to-r from-[#20e3d2] to-[#0cd1c2] text-[#021d24] rounded-2xl font-black uppercase tracking-[0.15em] text-sm shadow-[0_10px_30px_rgba(32,227,210,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:shadow-[0_10px_40px_rgba(32,227,210,0.5)]"
                      >
                        {loading ? (
                          <RefreshCw size={20} className="animate-spin" />
                        ) : (
                          step === 0 ? 'Continue to Security' : 'Create Access'
                        )}
                      </motion.button>

                      {step === 1 && (
                        <button type="button" onClick={() => setStep(0)} className="text-slate-400 hover:text-[#20e3d2] text-[10px] font-extrabold uppercase tracking-widest w-fit mt-1 transition-colors mx-auto block">
                          ← Edit Identity
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 rounded-3xl bg-white/5 border-4 border-[#20e3d2] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#20e3d2]/20">
                    <Check size={40} className="text-[#20e3d2]" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-3">Welcome, {name.split(' ')[0]}</h3>
                  <p className="text-slate-400 font-bold mb-10">Preparing your personalized travel cockpit...</p>

                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="w-3 h-3 rounded-full bg-[#20e3d2]"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Social Logins */}
          {step < 2 && (
            <>
              <div className="mt-10 flex items-center gap-4 w-full">
                <div className="h-px bg-gradient-to-r from-transparent to-slate-700 flex-1"></div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">or continue with</span>
                <div className="h-px bg-gradient-to-l from-transparent to-slate-700 flex-1"></div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-5">
                <motion.button type="button" onClick={() => handleSocialLogin(facebookProvider, 'Facebook')} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#3b5998] shadow-lg border border-white/10 hover:border-white/30 hover:bg-white transition-colors group">
                  <Facebook size={20} fill="currentColor" className="text-[#3b5998] group-hover:text-[#3b5998] transition-colors" />
                </motion.button>
                <motion.button type="button" onClick={() => handleSocialLogin(googleProvider, 'Google')} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-lg border border-white/10 hover:border-white/30 hover:bg-white transition-colors group">
                  <svg width="20" height="20" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                    <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                </motion.button>
                <motion.button type="button" onClick={() => handleSocialLogin(twitterProvider, 'Twitter')} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#1da1f2] shadow-lg border border-white/10 hover:border-white/30 hover:bg-white transition-colors group">
                  <Twitter size={20} fill="currentColor" className="text-[#1da1f2] transition-colors" />
                </motion.button>
              </div>
            </>
          )}

          {step < 2 && (
            <p className="mt-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              Already an explorer?{' '}
              <Link to="/signin" className="text-[#20e3d2] hover:text-white border-b-2 border-[#20e3d2]/50 hover:border-white transition-colors pb-0.5 ml-1">
                Sign in
              </Link>
            </p>
          )}

        </div>
      </motion.div>
    </div>
  )
}