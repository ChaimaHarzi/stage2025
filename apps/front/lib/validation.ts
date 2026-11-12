/** Règles de validation des comptes, identiques à celles de l'API (apps/api/src/utilisateurs). */

export interface UserForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  genre: "" | "Homme" | "Femme";
  dateDeNaissance: string;
  password: string;
  role?: "ADMIN" | "OUVRIER";
}

export const validateEmail = (v: string) => {
  if (!v.trim()) return "Veuillez saisir l'email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Veuillez saisir une adresse email valide.";
  return "";
};

export const validatePassword = (v: string) => {
  if (!v) return "Veuillez saisir un mot de passe.";
  if (v.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v)) return "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.";
  return "";
};

export const validateTelephone = (v: string) => {
  if (!v.trim()) return "Veuillez saisir le numéro de téléphone.";
  if (!/^\d{8,15}$/.test(v.trim())) return "Le numéro doit contenir uniquement des chiffres (8 à 15).";
  return "";
};

export const validateDateNaissance = (v: string) => {
  if (!v) return "Veuillez saisir la date de naissance.";
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - 18);
  if (new Date(v) > limite) return "La personne doit avoir au moins 18 ans.";
  return "";
};

export function validateUser(f: UserForm, { passwordRequired }: { passwordRequired: boolean }) {
  const errors: Partial<Record<keyof UserForm, string>> = {};
  const set = (k: keyof UserForm, msg: string) => msg && (errors[k] = msg);
  set("nom", f.nom.trim() ? "" : "Veuillez saisir le nom.");
  set("prenom", f.prenom.trim() ? "" : "Veuillez saisir le prénom.");
  set("email", validateEmail(f.email));
  set("telephone", validateTelephone(f.telephone));
  set("genre", f.genre ? "" : "Veuillez sélectionner un genre.");
  set("dateDeNaissance", validateDateNaissance(f.dateDeNaissance));
  if (passwordRequired || f.password) set("password", validatePassword(f.password));
  return errors;
}
