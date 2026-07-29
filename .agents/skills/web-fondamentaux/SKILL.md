---
name: web-fondamentaux
description: Vocabulaire et concepts fondamentaux du Web tels qu'enseignés dans la formation d'Elyas (cours 01, 05, 06, 07 - la-plateforme.io). Couvre Internet vs Web, architecture client-serveur, HTTP/DNS, responsive design (unités CSS, grid, flexbox, media queries), et méthodologie de conception (wireframe -> maquette -> prototype). À consulter avant toute explication théorique du fonctionnement du web, avant de justifier un choix responsive, ou avant de concevoir/wireframer une interface pour un projet.
---

# Web Fondamentaux

Cours sources : 01-Web Basics, 05-Responsive, 06-Web Conception, 07-Web Design.

## Vocabulaire de base (cours 01)
- **Internet** ≠ **Web** : Internet est l'infrastructure (câbles, IP, TCP, ARP) ; le Web est une application parmi d'autres (avec email, streaming, jeux vidéo...) qui tourne sur Internet.
- **Architecture client-serveur** : un logiciel client envoie une requête, un logiciel serveur répond. Les deux rôles peuvent cohabiter sur une même machine.
- **URL** = protocole + domaine + chemin. **DNS** fait la correspondance nom de domaine ↔ IP.
- **Requête HTTP** = URL + méthode + en-têtes + corps (optionnel). **Réponse HTTP** = statut + en-têtes + corps (optionnel).

## Responsive design (cours 05)
- Objectif enseigné : UNE seule interface auto-adaptable, jamais plusieurs sites séparés.
- Unités : absolues (px) à utiliser en dernier recours (risque de débordement) ; relatives — `%`/`em` (parent), `rem` (racine/taille police user), `vw`/`vh`/`vmin`/`vmax` (viewport).
- Variables CSS : déclarées dans `:root { --nom: valeur; }`, utilisées via `var(--nom)`.
- Fonctions CSS enseignées : `calc()` (espaces obligatoires autour des opérateurs), `min()`, `max()`, `clamp(min, idéal, max)` — préférée aux media queries pour une adaptation fluide.
- **CSS Grid** : `display: grid` sur le parent, `grid-template-columns`/`grid-template-rows` (unité `fr`), `gap`, `grid-column`/`grid-row` pour étendre/positionner un item.
- **Flexbox** : `display: flex`, `gap`, `justify-content` (axe principal), `align-items` (axe croisé) — dépendent de `flex-direction` (row par défaut).
- **Media queries** : `@media screen and (min-width: Xpx) and (max-width: Ypx) { ... }`.
- Frameworks CSS cités en connaissance générale (pas de TP dédié à ce stade) : Bootstrap, Bulma, Pico CSS, Tailwind CSS.

## Méthodologie de conception (cours 06 et 07)
Chaîne enseignée, à respecter dans cet ordre pour tout nouveau projet/page :
1. **Wireframe papier** — structure et navigation uniquement, zéro graphisme.
2. **Wireframe numérique** — reproduit en noir/blanc/gris, police neutre, toujours sans graphisme.
3. **Maquette graphique** (low → mid → hi-fidelity) — couleurs, typographies, hiérarchie visuelle. Outil recommandé par la prof : **Figma**.
4. **Prototype interactif** (optionnel selon le projet) — maquette cliquable pour valider la navigation avec le client.
5. **Développement** — le dev front reproduit la maquette, il ne l'invente pas.

### Règles UI/UX données par la prof (cours 07)
- Couleurs : palette restreinte et harmonieuse, respecter le contraste (accessibilité, daltonisme).
- Typographie : limiter à 1 police pour le texte + 1 pour les titres ; serif pour les titres, sans-serif pour le corps.
- Lisibilité : éviter les majuscules, taille de paragraphe ~20px, `line-height` ~1.5, largeur de ligne 60-75 caractères, texte aligné à gauche (jamais centré ni justifié).
- Hiérarchie : cohérence stricte h1 > h2 > h3, utiliser taille/graisse/couleur pour hiérarchiser.
- Affordance : un élément doit visuellement suggérer son usage (un bouton ressemble à un bouton, un lien est souligné, un inactif est grisé) — ne pas réinventer les comportements attendus.
- Espacements : marges/paddings cohérents, astuce = multiples de 8px.
- Cohérence globale sur tout le site (couleurs, typo, positionnement, style d'images) — créer un style guide.

## Checklist avant de démarrer un nouveau projet/page
- [ ] Ai-je un wireframe (même papier) avant de coder l'HTML ?
- [ ] La palette de couleurs et les polices sont-elles définies et limitées ?
- [ ] Le layout est-il pensé responsive dès le départ (mobile/desktop) ?
- [ ] Les unités CSS choisies sont-elles relatives par défaut (rem, %, fr) plutôt que fixes en px ?
