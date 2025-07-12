import Link from 'next/link'
import React from 'react'

export default function RegisterForm() {
  return (
     <div className="grid place-items-center h-screen font-sans bg-gray-50 px-4">
      <div className="shadow-2xl p-10 rounded-2xl border-t-4 border-green-500 w-full max-w-xl bg-white">
        <h1 className="text-3xl font-extrabold mb-8 text-center">
          S'inscrire
        </h1>

        <form className="flex flex-col gap-6">
            <input
            type="text"
            placeholder="Nom"
            className="self-center w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
            <input
            type="text"
            placeholder="Prénom"
            className="self-center w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
         
          <div className="self-center w-full flex flex-1 px-12 py-2 text-lg">
              <span className="flex-shrink-0 flex items-center bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-4 text-lg select-none">
                {/* Tunisian flag SVG */}
                <svg width="24" height="18" viewBox="0 0 24 16" className="mr-2" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="16" fill="#E70013"/><circle cx="12" cy="8" r="5" fill="#fff"/><circle cx="13" cy="8" r="2.5" fill="#E70013"/><path d="M14.5 8A2.5 2.5 0 1 1 12 5.5" fill="#fff"/></svg>
                +216
              </span>
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                className="border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
          </div>
       
       

          <input
            type="text"
            placeholder="Email"
            className="self-center w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="password"
            placeholder="Mot De Passe"
            className="self-center w-full px-6 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button className="w-full bg-green-600 text-white text-lg font-bold py-4 rounded-lg hover:bg-green-700 transition-colors">
            Créer compte
          </button>

          <div className="bg-red-500 text-white text-base py-2 px-5 rounded-md w-fit">
            Message d'Erreur
          </div>

        <Link className="text-sm mt-3 text-right" href={'/'}>Vous avez déja un compte ?{" "}
        <span className="underline">Se connecter</span>
        </Link>
         
        </form>
      </div>
    </div>
  )
}
