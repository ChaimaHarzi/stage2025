import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import LoginForm from "@/components/loginForm";
import { HOME_BY_ROLE } from "@/lib/config";

export default async function Home() {
  // Un utilisateur déjà connecté est envoyé directement vers son espace.
  const session = await getServerSession(authOptions);
  if (session?.user?.role) redirect(HOME_BY_ROLE[session.user.role]);
  return <LoginForm />;
}
