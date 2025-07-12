import Link from "next/link";
import React from "react";

export default function LoginForm() {
  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans bg-gradient-to-br from-green-100 via-white to-green-200 px-4">
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-200 via-white to-green-300"></div>
      <div className="relative z-10 shadow-2xl p-10 rounded-3xl border-t-4 border-green-500 w-full max-w-xl bg-white/95 backdrop-blur-md">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3 shadow-md">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-green-600" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 13c.667 1 2 3 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold mb-8 text-center text-green-700 drop-shadow-sm">
          Veuillez saisir vos informations
        </h1>
        <form className="flex flex-col gap-5">
          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-green-400">
  {/* Envelope icon from RegisterForm */}
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
</span>
            <input
              type="text"
              placeholder="Email"
              className="pl-11 w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-green-400">
  {/* Lock icon from RegisterForm */}
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
  </svg>
</span>
            <input
              type="password"
              placeholder="Mot De Passe"
              className="pl-11 w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>
          <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold py-4 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="inline-block"><path d="M5 12l5 5L20 7"/></svg>
            Connexion
          </button>
          {/* Error message example, can be conditionally rendered */}
          <div className="bg-red-100 text-red-700 text-base py-2 px-5 rounded-md w-fit mx-auto shadow-sm border border-red-200 mt-2 animate-fade-in">
            Message d'Erreur
          </div>
          <Link className="text-sm mt-3 text-right block text-gray-600 transition-colors text-center" href={'/register'}>
            Vous n’avez pas de compte ? <span className="underline hover:text-green-600">S'inscrire</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
