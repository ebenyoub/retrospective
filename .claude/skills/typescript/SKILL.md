---
name: typescript
description: Conventions TypeScript telles qu'enseignées dans la formation d'Elyas (cours 13-Installation et Types Basiques, 14-Custom Types - la-plateforme.io). Couvre le typage des variables/fonctions, interfaces, types custom, unions/intersections, et la configuration tsconfig.json. À consulter systématiquement avant d'écrire du TypeScript dans un projet d'Elyas, et pour vérifier qu'une notion TS avancée (generics, classes, assertions) n'est pas utilisée avant d'avoir été explicitement enseignée.
---

# TypeScript

Cours sources : 13-TS Installation et Types Basiques, 14-TS Custom Types.

## Pourquoi TypeScript (justification pédagogique)
JS est interprété + à typage dynamique → des erreurs de type (ex. concaténer des strings au lieu d'additionner des numbers) ou l'accès à des propriétés `null`/inexistantes ne sont détectées qu'à l'exécution. TS = superset de JS qui ajoute le typage **statique** (vérifié avant exécution) sans changer la logique du code.

## Installation et configuration
- `npm install typescript --save-dev` (installation locale au projet, à privilégier).
- Compilation : `tsc index.ts` → `index.js` (les types disparaissent à la compilation).
- `tsconfig.json` (généré via `tsc --init`), options enseignées :
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "outDir": "./dist",
      "rootDir": "./src",
      "module": "ESNext",
      "strict": true
    }
  }
  ```
- Une fois `tsconfig.json` en place : `tsc` (compile tout) ou `tsc --watch` (recompile à la sauvegarde).

## Règles imposées par la prof (à respecter systématiquement)
1. **Chaque variable doit être typée.**
2. **Chaque fonction doit être typée** (paramètres ET valeur de retour).
3. **Les types permissifs (`any`) doivent être évités.**

## Typage de base
```ts
let age: number = 25;
let city: string = "Lyon";
let isLoggedIn: boolean = true;
let numbers: number[] = [1, 2, 3, 4];       // ou Array<number>
let student: { name: string; age: number } = { name: "Thomas", age: 23 };

function prettyDate(date: Date): string {
  return date.toLocaleString();
}
```
- Les types sont toujours indiqués après `:`.
- TS infère automatiquement le type si non précisé — pas besoin de sur-typer une valeur littérale évidente, mais rester explicite reste la règle de base ci-dessus.
- Types spéciaux : `any` (à éviter — désactive la vérification TS), `unknown` (plus sûr que `any`, force à re-typer avant utilisation), `void` (fonction qui ne retourne rien).

## Types complexes (cours 14)
- **Interface** — définit la forme d'un objet, `?` pour une propriété optionnelle :
  ```ts
  interface User {
    name: string;
    age: number;
    isAdmin?: boolean;
  }
  ```
- Extension d'interface : `interface Admin extends User { permissions: string[]; }`
- **`type`** — alternative à `interface`, pour nommer un type complexe (objets, unions, tuples, fonctions).
- **Union (`|`)** — plusieurs types ou énumération de valeurs possibles : `type Status = "online" | "offline";`
- **Intersection (`&`)** — combine plusieurs types en un seul : `type Person = Contact & Address;`
- **Null/undefined** — TS bloque l'accès direct à une propriété potentiellement `null`/`undefined`. Utiliser l'**optional chaining** `?.` : `user.status?.toUpperCase()`.

## ⚠️ Notions explicitement annoncées comme "pas encore vues" (cours 14)
La prof liste elle-même ce qui sera enseigné plus tard dans la formation. **Ne pas utiliser ces notions dans le code d'Elyas tant qu'un cours correspondant n'a pas été identifié et intégré à cette base** :
- Interfaces combinées aux classes (programmation orientée objet)
- Assertions / type casting
- Types génériques (generics)

## Checklist avant d'écrire du TypeScript
- [ ] Toutes les variables et fonctions sont-elles typées explicitement ?
- [ ] `any` est-il évité (préférer `unknown` si le type est vraiment inconnu) ?
- [ ] Les accès à des valeurs potentiellement `null`/`undefined` utilisent-ils `?.` ?
- [ ] Le code n'utilise-t-il pas de generics, classes typées ou assertions (non enseignés à ce stade) ?
