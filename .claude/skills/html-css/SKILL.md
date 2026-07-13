---
name: html-css
description: Conventions HTML et CSS réellement enseignées dans la formation d'Elyas (cours 03-HTML Basics, 04-CSS Basics - la-plateforme.io). Couvre la structure de document HTML, la sémantique et l'accessibilité, ainsi que les sélecteurs CSS et la règle de spécificité. À consulter systématiquement avant d'écrire ou de relire du HTML/CSS dans un projet d'Elyas, pour vérifier que le code reste au niveau et dans le style enseigné (pas de framework CSS non validé, sémantique correcte, CSS toujours externe).
---

# HTML & CSS

Cours sources : 03-HTML Basics, 04-CSS Basics.

## HTML — règles enseignées
- HTML = langage de balisage, PAS un langage de programmation.
- Structure de document obligatoire :
  ```html
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="..." />
      <title>Titre de la page</title>
    </head>
    <body>
      ...
    </body>
  </html>
  ```
- Attributs : déclarés en minuscule dans la balise ouvrante, valeur entre guillemets. `id`/`class` sont génériques, d'autres sont spécifiques à une balise (`href` sur `<a>`).
- **Règle forte de la prof : la sémantique HTML.** Toujours utiliser la balise la plus adaptée au sens du contenu (pas de `<div>` partout) — bénéfices : lisibilité pour les devs, accessibilité (lecteurs d'écran), SEO.
- Balises sémantiques enseignées : `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<h1>`-`<h6>`, `<figure>`/`<figcaption>`.
- Accessibilité — attributs enseignés à utiliser : `alt` (obligatoire sur les images), `aria-label`, `aria-hidden="true"`, `role`, `tabindex`.

### Squelette sémantique type (exemple donné par la prof)
```html
<body>
  <header role="banner">
    <h1>Titre du site</h1>
    <nav aria-label="Navigation principale">
      <ul>
        <li><a href="/" aria-current="page">Accueil</a></li>
      </ul>
    </nav>
  </header>
  <main id="content" tabindex="-1">
    <article aria-labelledby="article-title">
      <h2 id="article-title">...</h2>
    </article>
    <aside aria-label="...">...</aside>
  </main>
  <footer role="contentinfo">...</footer>
</body>
```

## CSS — règles enseignées
- CSS = Cascading StyleSheet, langage de règles (sélecteur + déclarations `propriété: valeur;`).
- **CSS externe uniquement** (`<link rel="stylesheet" href="style.css">`). La prof marque explicitement l'inline (`style=""`) et l'interne (`<style>` dans `<head>`) comme mauvaises pratiques (✗). Raison donnée : réutilisabilité entre pages + séparation structure (HTML) / présentation (CSS).
- Sélecteurs enseignés : universel (`*`), type (`h1`), classe (`.main-heading`), id (`#aboutHeading`), descendant (`div.content ul li`), multiple (`h1, li`), frère adjacent (`h1 + p`), frères suivants (`h1 ~ p`), enfant direct (`section > p`), pseudo-classes (`:nth-child(2n)`, `:hover`).
- **Spécificité** (du moins au plus prioritaire) : type < classe < id < style inline (à éviter). À spécificité égale, le dernier sélecteur déclaré l'emporte — attention à l'ordre d'import des CSS dans le `<head>`.

## Checklist avant d'écrire du HTML/CSS
- [ ] La structure utilise-t-elle des balises sémantiques plutôt que des `<div>` génériques ?
- [ ] Chaque image a-t-elle un `alt` pertinent ?
- [ ] Le CSS est-il dans un fichier externe (jamais de `style=""` inline, jamais de `<style>` dans le head) ?
- [ ] Les sélecteurs restent-ils simples (éviter la sur-spécificité avec des id partout) ?
