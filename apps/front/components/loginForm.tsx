/** @format */

"use client";
/** @format */

import Link from "next/link";
import React, { useState } from "react";
import { loginWithCreds } from "../app/actions/auth";

export default function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) return "Veuillez saisir votre email.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Veuillez saisir une adresse email valide.";
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Veuillez saisir votre mot de passe.";
    if (value.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Don't set error here, only on blur or submit
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Don't set error here, only on blur or submit
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // On submit, mark both fields as touched so errors show if invalid
    setEmailTouched(true);
    setPasswordTouched(true);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) return;
    setPending(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const result = await loginWithCreds(formData);
      if (result && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Erreur lors de la connexion");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className='relative min-h-screen flex items-center justify-center font-sans overflow-hidden'>
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-emerald-100/40"></div>
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className='relative z-10 w-full max-w-md mx-4 animate-[slideIn_0.6s_ease-out]'>
        {/* Enhanced card with glassmorphism */}
        <div className='backdrop-blur-xl bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-8 relative overflow-hidden'>
          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400/10 via-transparent to-emerald-400/10 pointer-events-none"></div>
          
          {/* Enhanced logo with animation */}
          <div className='flex justify-center mb-6'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-green-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500'></div>
              <div className='relative rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-4 shadow-lg border border-green-200/50 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3'>
                <svg
                  width='32'
                  height='32'
                  viewBox='0 0 24 24'
                  fill='none'
                  className='text-green-600 transition-colors duration-300 group-hover:text-green-700'
                  xmlns='http://www.w3.org/2000/svg'>
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                  <path
                    d='M8 13c.667 1 2 3 4 0'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                  <circle cx='9' cy='10' r='1' fill='currentColor' />
                  <circle cx='15' cy='10' r='1' fill='currentColor' />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className='text-2xl font-bold mb-8 text-center bg-gradient-to-br from-green-700 to-emerald-700 bg-clip-text text-transparent'>
            Veuillez saisir vos informations
          </h1>
          
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* Enhanced email field */}
            <div className='space-y-2'>
              <div className='relative group'>
                <div className='relative flex items-center w-full bg-white/50 border-2 rounded-xl overflow-hidden'>
                  <span className='flex-shrink-0 ml-4'>
                    <svg
                      width='20'
                      height='20'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      viewBox='0 0 24 24'
                      className='text-green-500'>
                      <rect x='3' y='5' width='18' height='14' rx='2' />
                      <path d='M3 7l9 6 9-6' />
                    </svg>
                  </span>
                  <input
                    type='text'
                    name='email'
                    placeholder='Email'
                    className={`w-full px-4 py-4 bg-transparent border-none outline-none ring-0 focus:ring-0 ${
                      (emailTouched && emailError) 
                        ? 'placeholder-red-400'
                        : 'placeholder-gray-500'
                    }`}
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    autoComplete="username"
                  />
                </div>
              </div>
              {(emailTouched && emailError) && (
                <div className="flex items-center gap-2 text-red-600 text-sm ml-2 animate-[slideInUp_0.3s_ease-out]">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {emailError}
                </div>
              )}
            </div>

            {/* Enhanced password field */}
            <div className='space-y-2'>
              <div className='relative group'>
                <div className='relative flex items-center w-full bg-white/50 border-2 rounded-xl overflow-hidden'>
                  <span className='flex-shrink-0 ml-4'>
                    <svg
                      width='20'
                      height='20'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      viewBox='0 0 24 24'
                      className='text-green-500'>
                      <rect x='5' y='11' width='14' height='8' rx='2' />
                      <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder='Mot De Passe'
                    className={`w-full px-4 py-4 bg-transparent border-none outline-none ring-0 focus:ring-0 ${
                      (passwordTouched && passwordError)
                        ? 'placeholder-red-400'
                        : 'placeholder-gray-500'
                    }`}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex-shrink-0 mr-4 text-gray-500 hover:text-green-600"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {(passwordTouched && passwordError) && (
                <div className="flex items-center gap-2 text-red-600 text-sm ml-2 animate-[slideInUp_0.3s_ease-out]">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {passwordError}
                </div>
              )}
            </div>

            {/* Enhanced submit button */}
            <button
              type='submit'
              className='relative w-full group overflow-hidden'
              disabled={pending}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`relative flex items-center justify-center gap-3 py-4 px-6 text-white font-semibold rounded-xl transition-all duration-300 ${pending ? 'cursor-not-allowed' : 'group-hover:scale-[1.02] active:scale-[0.98]'}`}>
                {pending ? (
                  <div className='flex items-center justify-center gap-1'>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="ml-2">Connexion...</span>
                  </div>
                ) : (
                  <>
                    <svg
                      width='20'
                      height='20'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      viewBox='0 0 24 24'
                      className='transition-transform duration-300 group-hover:scale-110'>
                      <path d='M5 12l5 5L20 7' />
                    </svg>
                    Connexion
                  </>
                )}
              </div>
            </button>

            {/* Enhanced error message */}
            {error && (
              <div className='relative p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl animate-[slideInUp_0.3s_ease-out]'>
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" fill="currentColor" className="text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Enhanced link */}
            <div className="text-center pt-4">
              <Link
                className='text-sm text-gray-600 hover:text-green-600 transition-all duration-300 group'
                href={"/register"}>
                <span>Vous n'avez pas de compte ? </span>
                <span className='font-semibold underline decoration-2 underline-offset-2 decoration-transparent group-hover:decoration-green-500 transition-all duration-300'>
                  S'inscrire
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}