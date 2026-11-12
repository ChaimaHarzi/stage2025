/**
 * Initialisation de la base : npm run db:seed -w api
 *  1. Complète les anciens comptes créés avant l'ajout des champs role/createdAt/updatedAt.
 *  2. Crée un administrateur (ADMIN_EMAIL / ADMIN_PASSWORD) s'il n'en existe aucun.
 * Le script est idempotent : on peut le relancer sans risque.
 */
import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const now = { $date: new Date().toISOString() };
  const fixes: [string, object][] = [
    ['role', { role: 'OUVRIER' }],
    ['createdAt', { createdAt: now }],
    ['updatedAt', { updatedAt: now }],
  ];
  for (const [field, set] of fixes) {
    const res = (await prisma.$runCommandRaw({
      update: 'Utilisateur',
      updates: [{ q: { [field]: { $exists: false } }, u: { $set: set }, multi: true }],
    })) as { nModified?: number };
    if (res.nModified) console.log(`- ${res.nModified} compte(s) complété(s) : champ « ${field} »`);
  }

  if (await prisma.utilisateur.findFirst({ where: { role: Role.ADMIN } })) {
    console.log('Un administrateur existe déjà.');
    return;
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans apps/api/.env');

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    await prisma.utilisateur.update({ where: { email }, data: { role: Role.ADMIN } });
    console.log(`Le compte ${email} a été promu administrateur.`);
  } else {
    await prisma.utilisateur.create({
      data: {
        email,
        password: await argon2.hash(password, { type: argon2.argon2id }),
        nom: 'Administrateur',
        prenom: 'Sagemcom',
        role: Role.ADMIN,
      },
    });
    console.log(`Administrateur créé : ${email} (changez le mot de passe après la première connexion).`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
