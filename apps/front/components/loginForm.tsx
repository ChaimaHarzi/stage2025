import Link from "next/link";
import React from "react";

export default function LoginForm() {
  return (
    <div className="grid place-items-center h-screen font-sans bg-gray-50 px-4">
      <div className="shadow-2xl p-10 rounded-2xl border-t-4 border-green-500 w-full max-w-xl bg-white">
        <h1 className="text-3xl font-extrabold mb-8 text-center">
          Veuillez saisir vos informations
        </h1>

        <form className="flex flex-col gap-6">
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
            Connexion
          </button>

          <div className="bg-red-500 text-white text-base py-2 px-5 rounded-md w-fit">
            Message d'Erreur
          </div>

          <div className="text-base text-center">
            Vous n’avez pas de compte ?{" "}
            <Link href="/register" className="underline font-semibold">
              S’inscrire
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
