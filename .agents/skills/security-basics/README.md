# Skill : security-basics

## Rôle

Appliquer les bonnes pratiques de sécurité de base dans une application web. Niveau DWWM : ce qui est attendu par le jury et ce qui est indispensable en production.

## Quand l'utiliser

- Lors de l'implémentation de l'authentification
- Lors de l'écriture de requêtes SQL
- Avant de committer du code qui gère des données utilisateur
- Pour préparer la partie sécurité du dossier professionnel

## Niveau attendu

Sécurité OWASP de base : injection SQL, authentification faible, exposition de données sensibles. Pas de sécurité avancée (PKI, audit, WAF).

## Les incontournables DWWM

### 1. Mots de passe
```typescript
// Toujours hasher avec bcrypt
const hash = await bcrypt.hash(password, 10)

// Vérifier sans déchiffrer
const ok = await bcrypt.compare(inputPassword, storedHash)
```

### 2. Injection SQL
```typescript
// Toujours des paramètres préparés
db.execute('SELECT * FROM users WHERE email = ?', [email])

// JAMAIS de concaténation
db.execute(`SELECT * FROM users WHERE email = '${email}'`) // DANGEREUX
```

### 3. JWT
```typescript
// Vérifier le token sur chaque route protégée
const decoded = jwt.verify(token, process.env.JWT_SECRET!)
```

### 4. Données sensibles
```typescript
// Ne jamais renvoyer le mot de passe
const { password, ...safeUser } = user
res.json(safeUser)
```

### 5. Variables d'environnement
```bash
# .env — jamais versionné
JWT_SECRET=ma_cle_secrete_longue
DB_PASSWORD=mon_mot_de_passe
```

## Erreurs à éviter (classiques du jury)

- Stocker les mots de passe en clair → bcrypt obligatoire
- Requêtes SQL construites par concaténation → paramètres préparés
- Clé JWT en dur dans le code → variable d'environnement
- Renvoyer le mot de passe hashé dans la réponse API → filtrer avant envoi
- Routes sensibles sans vérification du token → middleware auth
- `.env` dans le dépôt Git → ajouter au `.gitignore`

## Checklist sécurité

- [ ] Mots de passe hashés avec bcrypt (jamais en clair)
- [ ] JWT_SECRET dans une variable d'environnement
- [ ] `.env` dans `.gitignore`
- [ ] Toutes les requêtes SQL utilisent des paramètres préparés
- [ ] Le champ `password` n'apparaît jamais dans les réponses API
- [ ] Toutes les routes privées ont le middleware d'authentification
- [ ] CORS configuré avec l'URL du frontend uniquement
- [ ] Validation des entrées côté serveur (email, longueur mdp)
