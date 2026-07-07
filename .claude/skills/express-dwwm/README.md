# Skill : express-dwwm

## Rôle

Développer des routes et contrôleurs Express + TypeScript simples, sécurisés et adaptés au niveau DWWM.

## Quand l'utiliser

- Lors de la création d'un nouveau contrôleur
- Lors de l'ajout d'une nouvelle route
- Pour valider la sécurité d'une route
- Pour déboguer une erreur HTTP

## Niveau attendu

Routes Express simples, contrôleurs asynchrones avec try/catch, middleware JWT, réponses JSON cohérentes.

## Bonnes pratiques

- Un fichier de routes par domaine fonctionnel
- Un contrôleur par action (getSession, createSession, etc.)
- Toujours try/catch dans les contrôleurs async
- Valider les entrées en début de contrôleur
- Codes HTTP cohérents : 200, 201, 400, 401, 403, 404, 500

## Structure d'un contrôleur

```typescript
export const createSession = async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    const userId = req.user.id  // Attaché par le middleware auth

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Le nom est requis' })
    }

    const sessionId = await insertSession(name, userId)
    res.status(201).json({ message: 'Session créée', id: sessionId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
```

## Middleware auth

```typescript
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = decoded as TokenPayload
    next()
  } catch {
    res.status(401).json({ message: 'Token invalide' })
  }
}
```

## Erreurs à éviter

- Oublier le `return` devant `res.status().json()` dans les branches conditionnelles
- Mettre de la logique métier dans les routes (ça va dans les contrôleurs)
- Exposer les détails de l'erreur serveur au client en production
- Oublier de protéger une route avec le middleware auth
- Requêtes SQL directement dans les routes

## Checklist avant de committer un contrôleur

- [ ] Validation des entrées en début de fonction
- [ ] Try/catch présent
- [ ] Tous les chemins retournent une réponse (pas de `res` oublié)
- [ ] Code HTTP approprié utilisé
- [ ] Route protégée par authMiddleware si besoin
- [ ] Pas de données sensibles dans la réponse
