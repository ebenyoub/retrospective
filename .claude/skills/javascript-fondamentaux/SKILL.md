---
name: javascript-fondamentaux
description: Syntaxe et conventions JavaScript de base telles qu'enseignées dans la formation d'Elyas (cours 10-JS Les Bases, 11-JS Les Fonctions, 12-Le DOM - la-plateforme.io). Couvre variables, types, fonctions (classiques et fléchées), et manipulation du DOM. À consulter systématiquement avant d'écrire du JavaScript vanilla dans un projet d'Elyas (hors React), pour respecter les conventions exactes enseignées (let/const, ===, camelCase, etc.).
---

# JavaScript Fondamentaux

Cours sources : 10-JS Les Bases, 11-JS Les Fonctions, 12-Le DOM, JOBS-Corrections jour 04 (exercice Fetch/JSON).

## Variables et types
- Déclaration : **`let`** (réassignable) ou **`const`** (non réassignable). `var` n'est jamais mentionné dans le cours — ne pas l'utiliser.
- Convention de nommage imposée : **camelCase** (première lettre minuscule, chaque mot suivant commence par une majuscule).
- Portée : une variable n'est pas utilisable en dehors de la fonction où elle a été créée.
- Types primitifs (immutables) : `String`, `Undefined`, `Boolean`, `Number`, `Null`.
- Types non-primitifs (mutables) : Objets, Fonctions, Tableaux. Distinction importante enseignée : on peut **altérer** un objet/tableau déclaré en `const` (ajouter une propriété, un élément) mais pas le **réassigner** entièrement.

## Tableaux et objets
- Tableau : `[]`, index à partir de 0, `.length`, `.push()`, `.pop()`. Un tableau est en réalité de type `object`.
- Objet : accès via `.` ou `[]`. Une fonction dans un objet est appelée une **méthode**.

## Opérateurs
- Arithmétiques : `+ - * / %` (modulo), `-` (négatif).
- Comparaison : `< > <= >=`, et **uniquement `===` / `!==`** (égalité/inégalité stricte). `==` et `!=` ne sont pas enseignés — ne jamais les utiliser.
- Logiques : `&&` (et), `||` (ou), `!` (non).
- Ternaire : `condition ? valeurSiVrai : valeurSiFaux`.

## Structures de contrôle
- Conditions : `if...else`, `switch`.
- Boucles : `for` (la plus utilisée dans le cours), `while`, `do...while`, `forEach`. Vigilance sur les boucles infinies.

## Fonctions
- Rôle pédagogique insisté par la prof : éviter la duplication de code (factorisation) et limiter les risques d'erreur.
- Déclaration classique : `function nom(paramètres) { ... return ...; }`.
- **Bonne pratique explicite de la prof** : privilégier une fonction qui `return` une valeur plutôt que modifier une variable externe (effet de bord) → réutilisabilité.
- `return` ≠ `console.log` : `return` interrompt l'exécution et renvoie une valeur ; `console.log` ne fait qu'afficher (debug).
- Paramètres (définis à la création) vs arguments (passés à l'appel).
- Fonctions anonymes : utilisées typiquement en argument d'une autre fonction.
- **Fonction fléchée (arrow function, ES6)** : `(params) => { ... }`, avec retour implicite si une seule instruction (`(a, b) => a + b`). Les deux syntaxes (classique et fléchée) sont enseignées et acceptées.

## Le DOM
- DOM = structure arborescente construite par le navigateur à partir du HTML.
- 3 notions clés enseignées, dans cet ordre : récupérer un élément → écouter un événement → modifier le DOM.
- Récupération : `document.getElementById('id')`, `getElementsByClassName`, `getElementsByTagName`, `document.querySelector('#id'/'.classe')`, `document.querySelectorAll('.classe')`.
- Écoute d'événement : `element.addEventListener('type', function)`. Un listener ne s'attache qu'à UN élément — sur un tableau d'éléments, boucler avec `for`.
- Modification du DOM : `document.createElement()` (puis insérer), `element.append()`, `element.innerHTML`, `element.classList.add/remove/toggle` (méthode enseignée pour le style dynamique — pas de manipulation directe de `element.style` inline).
- Data-attributes : `data-*` en HTML, lu en JS via `element.dataset.nomAttribut`.

## ⚠️ Notion vue en exercice sans support de cours dédié
- L'API **Fetch** et la manipulation de **JSON** apparaissent dans l'exercice "JOBS - Corrections jour 04", mais aucun cours dédié avec exemples de syntaxe n'a été fourni dans la liste de cours. Ne pas inventer la syntaxe fetch enseignée par la prof tant qu'un cours source n'a pas été identifié — vérifier dans le domaine `react` (les cours 21/22/23 sur POST/PUT/DELETE couvrent probablement fetch/axios en contexte React).

## Checklist avant d'écrire du JS vanilla
- [ ] `let`/`const` uniquement (jamais `var`) ?
- [ ] camelCase pour toutes les variables/fonctions ?
- [ ] `===`/`!==` uniquement (jamais `==`/`!=`) ?
- [ ] Les fonctions retournent-elles une valeur plutôt que de modifier une variable externe ?
