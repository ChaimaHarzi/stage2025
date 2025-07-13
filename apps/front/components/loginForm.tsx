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
    <div className='relative min-h-screen flex items-center justify-center font-sans bg-gradient-to-br from-green-100 via-white to-green-200 px-4'>
      <div className='absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-200 via-white to-green-300'></div>
      <div className='relative z-10 shadow-2xl p-10 rounded-3xl border-t-4 border-green-500 w-full max-w-xl bg-white/95 backdrop-blur-md'>
        {/* Logo placeholder */}
        <div className='flex justify-center mb-4'>
          <div className='rounded-full bg-green-100 p-3 shadow-md'>
            <svg
              width='40'
              height='40'
              viewBox='0 0 24 24'
              fill='none'
              className='text-green-600'
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
        <h1 className='text-3xl font-extrabold mb-8 text-center text-green-700 drop-shadow-sm'>
          Veuillez saisir vos informations
        </h1>
        <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-0'>
  <div className='relative flex items-center'>
    <span className='absolute left-1 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none'>
      {/* Envelope icon from RegisterForm */}
      <svg
        width='20'
        height='20'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        viewBox='0 0 24 24'>
        <rect
          x='3'
          y='5'
          width='18'
          height='14'
          rx='2'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <path
          d='M3 7l9 6 9-6'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
      </svg>
    </span>
    <input
      type='text'
      name='email'
      placeholder='Email'
      className={`pl-11 w-full px-6 py-4 border ${(emailTouched && emailError) ? 'border-red-500' : 'border-gray-300'} rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm`}
      value={email}
      onChange={handleEmailChange}
      onBlur={handleEmailBlur}
      autoComplete="username"
    />
  </div>
  {(emailTouched && emailError) && (
    <div className="text-red-600 text-sm mt-1 ml-2 animate-fade-in">{emailError}</div>
  )}
</div>
          <div className='flex flex-col gap-0'>
  <div className='relative flex items-center'>
    <span className='absolute left-1 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none'>
      {/* Lock icon from RegisterForm */}
      <svg
        width='20'
        height='20'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        viewBox='0 0 24 24'>
        <rect
          x='5'
          y='11'
          width='14'
          height='8'
          rx='2'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <path
          d='M7 11V7a5 5 0 0 1 10 0v4'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <circle cx='12' cy='15' r='1' fill='currentColor' />
      </svg>
    </span>
    <input
      type='password'
      name='password'
      placeholder='Mot De Passe'
      className={`pl-11 w-full px-6 py-4 border ${(passwordTouched && passwordError) ? 'border-red-500' : 'border-gray-300'} rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm`}
      value={password}
      onChange={handlePasswordChange}
      onBlur={handlePasswordBlur}
      autoComplete="current-password"
    />
  </div>
  {(passwordTouched && passwordError) && (
    <div className="text-red-600 text-sm mt-1 ml-2 animate-fade-in">{passwordError}</div>
  )}
</div>
          <button
            type='submit'
            className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold py-4 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2'
            disabled={pending}>
            {pending ? (
              <span className='flex items-center justify-center h-6'>
                <span className='dot bg-white'></span>
                <span className='dot bg-white'></span>
                <span className='dot bg-white'></span>
                <style jsx>{`
                  .dot {
                    height: 10px;
                    width: 10px;
                    margin: 0 2px;
                    border-radius: 50%;
                    display: inline-block;
                    animation: dotFlashing 1s infinite linear alternate;
                  }
                  .dot:nth-child(2) {
                    animation-delay: 0.2s;
                  }
                  .dot:nth-child(3) {
                    animation-delay: 0.4s;
                  }
                  @keyframes dotFlashing {
                    0% {
                      opacity: 0.2;
                    }
                    50%,
                    100% {
                      opacity: 1;
                    }
                  }
                `}</style>
              </span>
            ) : (
              <>
                <svg
                  width='22'
                  height='22'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  className='inline-block'>
                  <path d='M5 12l5 5L20 7' />
                </svg>
                Connexion
              </>
            )}
          </button>
          {/* Error message example, can be conditionally rendered */}
          {error && (
            <div className='bg-red-100 text-red-700 text-base py-2 px-5 rounded-md w-fit mx-auto shadow-sm border border-red-200 mt-2 animate-fade-in'>
              {error}
            </div>
          )}
          <Link
            className='text-sm mt-3 text-right block text-gray-600 transition-colors text-center'
            href={"/register"}>
            Vous n’avez pas de compte ?{" "}
            <span className='underline hover:text-green-600'>S'inscrire</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
