"use client";
import Link from 'next/link';
import React, { useState } from 'react';

export default function RegisterForm() {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    // TODO: Replace this timeout with your actual registration logic
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (err) {
      // handle error
    } finally {
      setPending(false);
    }
  };

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
          S'inscrire
        </h1>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-green-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </span>
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              className="pl-11 w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-green-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </span>
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              className="pl-11 w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>

          {/* Date de naissance field */}
          <div className="relative">
            <span className="absolute left-0.75 top-1/2 -translate-y-1/2 text-green-400">
              {/* Calendar icon */}
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
            {/* Overlay label for placeholder */}
            {selectedDate === '' && (
              <span className="absolute left-6.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none select-none text-lg">
                Date de naissance
              </span>
            )}
            <input
              type="date"
              name="dateNaissance"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className={`pl-11 w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm ${selectedDate === '' ? 'text-transparent' : 'text-black'}`}
            />
          </div>

          {/* Genre field */}
          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-green-400">
              {/* User icon */}
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <select
              name="genre"
              className={`bg-gray-50 pl-6 px-6 w-[81%] py-2.5 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm ${selectedGenre === '' ? 'text-gray-500' : 'text-black'}`}
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
            >
              <option value="" disabled className="text-gray-500">Genre</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
  
            </select>
          </div>
          <div className="relative w-full">
            <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-green-400">
              {/* Phone icon */}
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.09 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.13 1.07.39 2.11.76 3.11a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1 .37 2.04.63 3.11.76A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <input
              type="tel"
              name="telephone"
              placeholder="Numéro de téléphone"
              className="pl-11 pr-6 w-full py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-green-400">
              {/* Envelope icon */}
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
            <input
              type="text"
              name="email"
              placeholder="Email"
              className="pl-11 w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-green-400">
              {/* Lock icon */}
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="15" r="1" fill="currentColor" />
              </svg>
            </span>
            <input
              type="password"
              name="password"
              placeholder="Mot De Passe"
              className="pl-11 w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold py-4 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
            disabled={pending}
          >
            {pending ? (
              <span className="flex items-center justify-center h-6">
                <span className="dot bg-white"></span>
                <span className="dot bg-white"></span>
                <span className="dot bg-white"></span>
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
                    0% { opacity: 0.2; }
                    50%, 100% { opacity: 1; }
                  }
                `}</style>
              </span>
            ) : (
              <>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="inline-block"><path d="M5 12l5 5L20 7"/></svg>
                Créer compte
              </>
            )}
          </button>
          {/* Error message example, can be conditionally rendered */}
          <div className="bg-red-100 text-red-700 text-base py-2 px-5 rounded-md w-fit mx-auto shadow-sm border border-red-200 mt-2 animate-fade-in">
            Message d'Erreur
          </div>
          <Link className="text-sm mt-3 text-right block text-gray-600  transition-colors text-center" href={'/'}>
            Vous avez déjà un compte ? <span className="underline hover:text-green-600">Se connecter</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
