# Sécurité

## Authentification

### Mots de passe
- Hachage avec **bcrypt** (salt rounds : 10)
- Jamais stockés en clair
- Jamais renvoyés dans les réponses API

```typescript
// Hachage lors de l'inscription
const hashedPassword = await bcrypt.hash(password, 10)

// Vérification lors de la connexion
const isValid = await bcrypt.compare(password, user.password)
```

### JWT (JSON Web Token)
- Signé avec une clé secrète stockée dans `.env`
- Durée de validité : 24h
- Envoyé dans le header `Authorization: Bearer <token>`
- Vérifié par le middleware avant chaque route protégée

```typescript
// Génération
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: '24h'
})

// Vérification (dans le middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET)
```

## Protection des données

### Injection SQL
- Toutes les requêtes utilisent des **paramètres préparés** avec `?`
- Jamais de concaténation de strings dans les requêtes SQL

```typescript
// Bien — paramètre préparé
db.execute('SELECT * FROM users WHERE email = ?', [email])

// JAMAIS — injection possible
db.execute(`SELECT * FROM users WHERE email = '${email}'`)
```

### Données sensibles dans les réponses
- Le champ `password` n'est jamais inclus dans les réponses API
- Les informations sensibles ne sont pas loguées en production

```typescript
// Retirer le mot de passe avant d'envoyer
const { password, ...userWithoutPassword } = user
res.json(userWithoutPassword)
```

## CORS

Configuration explicite pour éviter les requêtes cross-origin non autorisées.

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
```

## Variables d'environnement

- Secrets dans un fichier `.env` à la racine du backend
- `.env` ajouté dans `.gitignore` — jamais versionné
- Un fichier `.env.example` versionné avec les clés (sans valeurs)
- `JWT_SECRET` généré hors dépôt avec une valeur longue et aléatoire
- `GMAIL_APP_PASSWORD` stocké uniquement en variable d'environnement si l'envoi
  d'email est activé

Exemple de génération d'une clé JWT :

```bash
openssl rand -base64 48
```

## Validation des entrées

- Validation côté serveur obligatoire (ne pas faire confiance au client)
- Vérification de la présence des champs requis
- Vérification du format (email, longueur mot de passe)

```typescript
// Validation simple dans le contrôleur
if (!email || !password) {
  return res.status(400).json({ message: 'Email et mot de passe requis' })
}

if (password.length < 8) {
  return res.status(400).json({ message: 'Mot de passe trop court (8 caractères minimum)' })
}
```

## Ce qu'on ne fait pas

- Pas de stockage du token JWT en base de données
- Pas de secrets en dur dans le code
- Pas de `console.log` avec des données utilisateur en production
- Pas de routes sensibles sans middleware d'authentification
