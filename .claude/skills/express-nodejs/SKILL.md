---
name: express-nodejs
description: Architecture et conventions Express/Node.js/MySQL telles qu'enseignées dans la formation d'Elyas (cours 28 à 33, 41 à 43, 50 - la-plateforme.io). Couvre l'architecture MVC, le CRUD, l'authentification JWT, les autorisations par rôle, la gestion d'erreurs centralisée, la validation avec express-validator, et les tests (Vitest/Supertest). À consulter systématiquement avant d'écrire du code backend Express dans un projet d'Elyas — cette version reflète l'état final enseigné (ES Modules + async/await), qui remplace la version initiale CommonJS + callbacks vue en tout début de parcours.
---

# Express & Node.js

Cours sources : 28-Rest API, 29-Express Intro, 30-Express CRUD, 31-Express MVC, 32-Authentification, 33-Autorisations, 41-JS moderne, 42-Gestion des erreurs, 43-Validations, 50-Tester son application Express part01.

## ⚠️ Note de version importante
Le cours a évolué en deux temps : d'abord CommonJS (`require`/`module.exports`) + callbacks (cours 29-33), puis une migration explicite vers **ES Modules (`import`/`export`) + `async`/`await`** (cours 41), présentée comme la pratique professionnelle standard. **Ce skill documente la version finale (ES Modules + async/await) — c'est celle à utiliser pour tout nouveau code.**

## Architecture REST (cours 28)
- API = interface entre deux programmes. API Web = serveur HTTP qui répond en JSON.
- Méthodes HTTP / usage REST : `GET` (lecture), `POST` (création), `PUT` (modification totale), `PATCH` (modification partielle), `DELETE` (suppression).
- URI stable par ressource, seule la méthode change. Sous-ressources : `/items/56/reviews/14`.
- **Filtres/tris toujours en query string**, jamais dans le chemin : `?category=game&sort=price&order=asc` (pas `/category/game/sort/price/asc`).
- Codes HTTP à respecter strictement :

| Code | Nom | Quand |
|---|---|---|
| 200 | OK | Succès général (GET, PUT) |
| 201 | Created | Ressource créée (POST) |
| 204 | No Content | Suppression réussie (DELETE) |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Authentifié mais non autorisé |
| 404 | Not Found | Ressource introuvable |
| 500 | Internal Server Error | Erreur serveur |

## Setup projet
```bash
mkdir blog-api && cd blog-api
npm init -y
npm install express mysql2 dotenv cors bcrypt jsonwebtoken express-validator
npm install --save-dev nodemon vitest supertest
```
- `"type": "module"` dans `package.json` pour activer les ES Modules (ne jamais mélanger `require` et `import` dans le même projet).
- Scripts `package.json` : `"start": "node server.js"`, `"dev": "nodemon server.js"`, `"test": "vitest"`.
- Séparer la **création de l'app Express** (`app.js`, exportée) du **démarrage du serveur** (`app.listen`) — nécessaire pour Supertest (cours 50).

## Architecture MVC imposée (cours 31)
```
blog-api/
├── app.js                    → crée l'app Express (export default app)
├── server.js                 → importe app.js et fait app.listen()
├── routes/*.routes.js        → mapping URL -> controller, AUCUNE logique métier
├── controllers/*.controller.js → reçoit req, appelle le model, construit la réponse HTTP
├── models/*.model.js         → exécute les requêtes SQL, parle à la BDD
├── middlewares/              → authenticateToken.js, authorizeRoles.js, validate.js, errorHandler.js
├── validators/*.validator.js → règles express-validator par ressource
├── errors/AppError.js        → classe d'erreur avec statusCode
├── helpers/resetDatabase.js  → réinitialisation BDD de test
└── config/database.js        → pool de connexions MySQL
```
- **Convention de nommage stricte** : un fichier par ressource, suffixé `.routes.js` / `.controller.js` / `.model.js` / `.validator.js` / `.test.js`.
- Formule de la prof : **"le Model parle à la base, le Controller parle au client."**

### Base de données (config/database.js)
```js
import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;
```
- `createPool` (pas `createConnection`) : pratique professionnelle standard, pas de `.connect()` manuel.
- **Règle de sécurité absolue** : jamais d'identifiants en dur dans le code → toujours via `.env` (jamais versionné, dans `.gitignore`).

### Routes
```js
// category.routes.js
import express from "express";
const router = express.Router();
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
export default router;
```

### Controllers (CRUD = "BREAD" : Browse, Read, Edit, Add, Delete)
Avec Express 5, un controller reste simple : pas de `try/catch` si son seul rôle serait d'appeler `next(error)` — Express le fait automatiquement (voir "Gestion des erreurs" ci-dessous).
```js
const getAllCategories = async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
};
```

### Models
```js
// category.model.js
import db from "../config/database.js";

const findAll = async () => {
  const [rows] = await db.query("SELECT * FROM category");
  return rows;
};
export { findAll };
```
- **Requêtes préparées obligatoires** : toujours un placeholder `?` + tableau de valeurs, jamais de concaténation/template string dans le SQL (protection injection SQL).
  ```js
  const sql = "SELECT * FROM category WHERE id = ?";
  const [rows] = await db.query(sql, [id]);
  ```

## Middleware obligatoire pour lire le body JSON
```js
app.use(express.json());
```

## ES Modules — règles d'import/export
- Export nommé : `export const findAll = () => {...}` → `import { findAll } from "./x.js"`.
- Export par défaut : **un seul par fichier** → `export default router` → `import router from "./x.js"` (nom libre à l'import).
- Import groupé : `import * as ArticleService from "../services/article.service.js"` (utile en namespace si beaucoup de fonctions exportées, notamment pour mocker dans les tests).

## Authentification (cours 32)
- Inscription : `POST /auth/register` → mot de passe **hashé avec bcrypt** (`bcrypt.hash`, version async) avant stockage, jamais en clair.
- Connexion : `POST /auth/login` → `User.findByEmail` puis `bcrypt.compare`. **Message d'erreur générique identique** que ce soit l'email ou le mot de passe qui soit faux (`401 "Identifiants invalides"`) — ne jamais révéler lequel des deux est incorrect.
- JWT généré avec `jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "1h" })`, `JWT_SECRET` dans `.env`.
- Routes d'authentification regroupées sous le préfixe `/auth`, ne suivent pas le modèle REST classique (actions, pas ressources).

## Autorisations par rôle (cours 33)
- Rôle stocké dans la table `user` : `role ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER'`, inclus dans le payload du JWT.
- Middlewares dédiés dans `middlewares/` :
  - `authenticateToken.js` : lit `req.headers.authorization`, `jwt.verify`, remplit `req.user`, appelle `next()`. 401 si absent, 403 si invalide/expiré.
  - `authorizeRoles.js` : factory `(allowedRoles) => (req, res, next) => {...}`, 403 si le rôle ne fait pas partie de `allowedRoles`.
- Chaînage dans les routes (**ordre = ordre d'exécution**) :
  ```js
  router.get("/articles", authenticateToken, authorizeRoles(["ADMIN", "USER"]), getAllArticles);
  ```
- Convention `GET /users/me` : profil de l'utilisateur **connecté**, jamais d'id en paramètre d'URL — s'appuie uniquement sur `req.user.userId` du JWT.
- Vérifier la propriété d'une ressource : comparer `req.user.userId` (JWT) et `Number(req.params.id)` (URL) avant d'autoriser une action.

### CORS
```js
import cors from "cors";
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
```
Le middleware CORS doit être déclaré **avant** les routes.

## Gestion des erreurs (cours 42, mis à jour pour Express 5)
- **Express 5 propage automatiquement les erreurs des fonctions `async`** : si un controller/middleware `async` lève (`throw`) ou qu'un `await` est rejeté, Express appelle lui-même `next(error)` et transmet au middleware d'erreur. Plus besoin d'un `try/catch` dont le seul rôle serait de faire `next(error)`.
- **Ne pas utiliser `try/catch` juste pour relayer l'erreur.** Un controller reste le plus simple possible :
  ```js
  // ✓ Pas de try/catch inutile — Express 5 route l'erreur vers errorHandler
  const getArticleById = async (req, res) => {
    const article = await Article.findById(req.params.id); // lève AppError si introuvable
    res.json(article);
  };
  ```
- **`try/catch` reste justifié uniquement si un traitement local est réellement nécessaire** : logger un détail avant de relancer, nettoyer une ressource (fichier temporaire, connexion), transformer une erreur technique en `AppError` métier, ou faire un rollback :
  ```js
  // ✓ try/catch légitime : transformation + log, pas juste next(error)
  const createArticle = async (req, res) => {
    try {
      const article = await Article.create(req.body);
      res.status(201).json(article);
    } catch (error) {
      console.error("Échec création article:", error.message);
      throw new AppError("Impossible de créer l'article", 500);
    }
  };
  ```
- **Toute la gestion des erreurs est centralisée dans le middleware `errorHandler`**, reconnu par sa signature à 4 paramètres, déclaré en **dernier**, juste avant `app.listen` :
  ```js
  const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur interne" });
  };
  export default errorHandler;
  ```
- Classe `AppError` pour des erreurs avec code HTTP précis :
  ```js
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = "AppError";
    }
  }
  ```
  Usage dans un model/service : `throw new AppError("Article introuvable", 404);` — pas de `try/catch` autour de l'appel dans le controller, Express 5 s'en charge.

## Validation des données (cours 43)
- **Règle fondamentale** : ne jamais faire confiance aux données reçues — la validation HTML côté front n'est qu'UX, la validation côté API est toujours obligatoire.
- Bibliothèque : `express-validator`. Un fichier `validators/<ressource>.validator.js` par ressource.
  ```js
  import { body, param } from "express-validator";
  export const validateArticleBody = [
    body("title").notEmpty().withMessage("Le titre est requis").isLength({ min: 3, max: 255 }),
    body("content").notEmpty().withMessage("Le contenu est requis"),
  ];
  export const validateArticleId = [param("id").isInt({ min: 1 }).withMessage("L'id doit être un entier positif")];
  ```
- Middleware `validate.js` centralisé (utilise `validationResult`), branché en cascade avant le controller :
  ```js
  router.post("/", validateArticleBody, validate, createArticle);
  ```
  Le controller ne s'exécute que si les données sont valides.

## Tests (cours 50)
- Outils : **Vitest** (unitaire — choisi plutôt que Jest pour son support natif des ES Modules) + **Supertest** (intégration — requêtes HTTP sur l'app sans démarrer de vrai serveur).
- Convention de nommage : `<fichier>.test.js`, au même endroit que le fichier testé.
- Structure de chaque test : **Arrange / Act / Assert**.
- Tests unitaires : services et middlewares, dépendances mockées avec `vi.fn()` / `vi.mock()`.
- Tests d'intégration : base de données dédiée `_test`, jamais la base de dev, réinitialisée avant chaque test (`beforeEach(resetDatabase)`), pilotée par `NODE_ENV` et un fichier `.env.test` séparé.
- Un bon test d'intégration vérifie aussi les cas d'erreur (404, 401, 403), pas seulement le happy path.

## Checklist avant d'écrire du code Express
- [ ] ES Modules (`import`/`export`) + `async`/`await` partout (pas de `require`/callback) ?
- [ ] Architecture MVC respectée (routes / controllers / models séparés, bons suffixes) ?
- [ ] Toutes les requêtes SQL utilisent-elles des placeholders `?` (jamais de concaténation) ?
- [ ] Le mot de passe est-il hashé avec bcrypt, jamais stocké en clair ?
- [ ] Les routes sensibles passent-elles par `authenticateToken` + `authorizeRoles` ?
- [ ] Les données entrantes sont-elles validées avec `express-validator` avant d'atteindre le controller ?
- [ ] Les controllers sont-ils sans `try/catch` sauf traitement local réel (log, nettoyage, transformation d'erreur, rollback) — jamais un `try/catch` qui ne sert qu'à appeler `next(error)` ?
- [ ] Les identifiants sensibles (BDD, JWT_SECRET) sont-ils dans `.env`, jamais en dur ?
