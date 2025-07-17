//this file will containg all the servr actions related to the authentication 
"use server";
import { signIn, signOut } from "next-auth/react"
import { revalidatePath } from "next/cache";
// or alternatively:
import { AuthError } from "@auth/core/errors";
 // Updated import path

// export const login=async(provider:string)=>{
//    await signIn(parovider,{redirectTo:"/"});
//    revalidatePath("/");
//    /*Contexte
// Dans Next.js, surtout avec le nouveau App Router et les Server Components, certaines pages sont mise en cache (par exemple, la page d’accueil /).

// Cela veut dire que Next.js garde en mémoire une version déjà générée de la page, pour qu’elle soit très rapide à afficher.

// Mais si des données changent (comme la connexion d’un utilisateur), cette version en cache peut devenir obsolète (ne pas montrer que l’utilisateur est connecté).

// Que fait revalidatePath("/") ?
// revalidatePath() est une fonction qui force Next.js à "rafraîchir" la page ciblée.

// Ici, en appelant revalidatePath("/"), tu dis à Next.js :
// "La page / a changé, regénère-là côté serveur et mets à jour le cache." */
// }



/*FormData is a built-in Web API interface that provides a way to easily construct a set of key/value pairs representing form fields and their values. */
import { db } from "../../db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.utilisateur.findUnique({ where: { email } });
    return user; // Will be null if not found
  } catch (error) {
    console.error(`Error in getUserByEmail for email ${email}:`, error);
    throw new Error('Database error while fetching user by email');
  }
};

export const loginWithCreds = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawFormData = {
    email,
    password,
    redirectTo: "/",
  };

  // Field validation is now handled in the frontend (loginForm.tsx)

  const user = await getUserByEmail(email);
  if (!user) {
    return { error: "No user found with this email" };
  }

  try {
    // Use redirect: false to get a JSON response from signIn
    const result = await signIn("credentials", { ...rawFormData, redirect: false });
    if (result?.error) {
      // NextAuth returns a string error in result.error
      // Map known errors to friendlier messages if needed
      if (result.error === "CredentialsSignin") {
        return { error: "Invalid password" };
      }
      return { error: result.error };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid password" };
        default:
          return { error: "Authentication failed" };
      }
    }
    return { error: error instanceof Error ? error.message : String(error) };
  }
  revalidatePath("/");
  return {};
}