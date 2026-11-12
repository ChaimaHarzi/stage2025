# Gestion des équipements industriels avec traçabilité par code-barres

Projet de fin d'année — Sagemcom Tunisie (2024-2025).

Monorepo Turborepo :

| Dossier | Rôle | Technologies |
|---|---|---|
| `apps/api` | API GraphQL (port 5000) | NestJS, GraphQL (Apollo), Prisma, MongoDB, Argon2, JWT |
| `apps/front` | Application web (port 3000) | Next.js, NextAuth, Tailwind, Radix UI, Flowbite |

Le système embarqué (Raspberry Pi + lecteur) est développé séparément ; ce dépôt fournit seulement
l'API qu'il appelle (voir plus bas).

## Installation

```bash
npm install
```

Créer les fichiers d'environnement à partir des exemples :

- `apps/api/.env` ← `apps/api/.env.example` (URL MongoDB, `JWT_SECRET`, `DEVICE_API_KEY`, compte admin initial)
- `apps/front/.env.local` ← `apps/front/.env.example` (`NEXTAUTH_SECRET`, URL de l'API)

Ces fichiers contiennent des secrets : ils sont ignorés par git.

Initialiser la base (index + premier administrateur) :

```bash
npm run db:push    # crée les collections et index uniques
npm run db:seed    # complète les anciens comptes et crée l'admin (ADMIN_EMAIL / ADMIN_PASSWORD)
```

## Lancement

```bash
npm run dev        # API sur http://localhost:5000/graphql, front sur http://localhost:3000
```

## Fonctionnalités (d'après le rapport)

- **Sprint 1 — Authentification et utilisateurs** : connexion (JWT, mots de passe Argon2), inscription
  (compte ouvrier), gestion des comptes par l'administrateur, profil et changement de mot de passe.
  Les routes `/admin` et `/ouvrier` sont réservées à leur rôle.
- **Sprint 2 — Équipements** : CRUD administrateur, liste restreinte (nom + statut) pour l'ouvrier,
  scan de code-barres.
- **Sprint 3 — Catégories** et **Sprint 4 — Familles** : CRUD ; suppression refusée tant que des
  équipements y sont rattachés.
- **Traçabilité** : 1 scan → *en production*, 2 scans → *en stock*, 3 scans → *en réparation*.
  Chaque scan est journalisé (page *Scan Logs*) ; le tableau de bord se met à jour toutes les 15 s.

### Scanner depuis l'interface web (ouvrier)

Un lecteur de code-barres USB se comporte comme un clavier : il « tape » le code puis Entrée dans le
champ de scan. Les lectures successives du même code pendant 2,5 s sont regroupées et envoyées ensemble.

### Interface pour le système embarqué

Le Raspberry Pi compte lui-même les lectures successives, puis appelle l'API :

```http
POST http://<serveur>:5000/graphql
Content-Type: application/json
x-device-key: <valeur de DEVICE_API_KEY dans apps/api/.env>

{"query": "mutation($i: ScanInput!) { scanEquipement(input: $i) { ancienStatus nouveauStatus } }",
 "variables": {"i": {"reference": "EQ-001", "nombreScans": 2}}}
```

`nombreScans` vaut 1, 2 ou 3. La clé `x-device-key` ne donne accès qu'à cette opération ; les scans
reçus ainsi apparaissent dans les Scan Logs avec la source « Raspberry Pi ».
