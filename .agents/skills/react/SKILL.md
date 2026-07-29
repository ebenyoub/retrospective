---
name: react
description: Conventions React (composants, JSX, props, state, hooks, routing, authentification, formulaires, tests) telles qu'enseignées dans la formation d'Elyas (cours 15 à 24, 44 à 49 - la-plateforme.io). À consulter systématiquement avant d'écrire du code frontend React dans un projet d'Elyas — reflète l'état final enseigné (React Hook Form, React Testing Library, Context API pour l'auth) qui doit primer sur les versions manuelles vues en première approche.
---

# React

Cours sources : 15-Intro, 16-Composants, 17-Props, 18-Events/State, 19-useEffect, 20-Router, 21-POST, 22-PUT, 23-DELETE, 24-Performances, 44/45-Authentification, 46-Validation, 47-Erreurs, 48-Tests (intro générique), 49-Tests React.

## Fondamentaux (cours 15)
- React est une **librairie** (pas un framework complet) : elle gère uniquement la vue. Pour le reste : routage → React Router, état global → Context API, HTTP → Fetch.
- Composant = brique réutilisable, écrite en fonction JS retournant du JSX.
- **Outil de build imposé : Vite** (pas create-react-app). `npm create vite@latest my-blog -- --template react`.
- Règles JSX strictes :
  1. Un composant ne retourne qu'**un seul** élément parent racine (ou un fragment `<>...</>`).
  2. Attributs HTML en camelCase, notamment `class` → `className`.
  3. Toute balise doit être fermée (`<img src="..." />`, jamais `<img src="...">`).

## Structure de projet imposée
```
src/
├── components/     → composants réutilisables (Header, ArticleThumbnail...)
├── pages/          → composants de page entière (conteneurs)
├── context/         → AuthContext.jsx, AuthProvider.jsx...
├── hooks/           → hooks custom (useFetch...)
├── utils/           → fonctions utilitaires (jwt.utils.js...)
└── App.jsx
```
- Un fichier `.css` par composant, importé directement dans le `.jsx` correspondant.
- Convention de nommage : **PascalCase** pour les composants, **camelCase** pour les variables/fonctions.
- Règle qualité explicite : aucun warning/erreur dans la console du navigateur, code indenté et lisible.

## Composants et props (cours 16-17)
```jsx
// Header.jsx
function Header() {
  const title = "Bienvenue"; // --- Logique : au-dessus du return ---
  return ( // --- Template (JSX) ---
    <header><h1>{title}</h1></header>
  );
}
export default Header;
```
- Props reçues par **déstructuration** (syntaxe à privilégier) : `function ArticleThumbnail({ title, author }) {...}`.
- Listes dynamiques avec `.map()`, **`key` obligatoire et unique** sur chaque élément généré :
  ```jsx
  {articles.map((article) => (
    <ArticleThumbnail key={article.id} title={article.title} author={article.author} />
  ))}
  ```

## Événements et state (cours 18)
- Événements en camelCase : `onClick`, `onChange`, `onSubmit`.
- **Règle fondamentale** : une variable JS classique ne provoque pas de re-rendu — il faut le state React.
- `useState` : `const [state, setState] = useState(valeurInitiale)`.
  ```jsx
  const [count, setCount] = useState(0);
  function increment() { setCount(count + 1); }
  ```
- Input contrôlé : `<input onChange={(e) => setName(e.target.value)} />`.

## Cycle de vie et useEffect (cours 19)
- 3 phases : Montage, Mise à jour, Démontage.
- `useEffect(() => {...}, [])` : exécuté une seule fois au montage (ex. fetch initial).
- `useEffect(() => {...}, [dep])` : relancé à chaque changement de `dep`.
- `useEffect(() => { ...; return () => {...cleanup...}; }, [])` : la fonction retournée s'exécute au démontage (nettoyage timer/listener).

## Requêtes HTTP — pattern des 3 états (cours 19, 21-23)
```jsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setIsLoading(true);
  setError(null);
  fetch(url)
    .then((res) => { if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`); return res.json(); })
    .then((data) => setData(data))
    .catch((err) => setError(err.message))
    .finally(() => setIsLoading(false));
}, []);
```
- Affichage : `if (isLoading) return <p>Chargement...</p>; if (error) return <p>Erreur : {error}</p>; if (!data) return <p>Aucune donnée trouvée.</p>;` puis le rendu normal.
- **Toujours vérifier `res.ok`** avant `res.json()` — fetch ne rejette pas sur un 4xx/5xx.
- POST/PUT : `method`, `headers: {"Content-Type": "application/json"}`, `body: JSON.stringify(objet)`.
- DELETE : ni body ni Content-Type nécessaires.
- Formulaire contrôlé : `setForm({ ...form, [e.target.name]: e.target.value })`.
- `handleSubmit(e)` commence toujours par `e.preventDefault()`.

## React Router (cours 20)
- `npm install react-router-dom`. `<BrowserRouter>` dans `main.jsx`, englobe `<App />`.
- `<Routes>` regroupe, `<Route path="..." element={<Composant/>} />` associe.
- Composants persistants (header, nav) : au-dessus de `<Routes>`, dans `<BrowserRouter>`.
- **Règle stricte : jamais `<a href="...">` pour un lien interne** (recharge la page) — toujours `<Link to="...">`. `<NavLink>` ajoute automatiquement la classe `.active`.
- `useNavigate()` pour naviguer depuis une fonction (après suppression, soumission...).
- Route dynamique : `path="/articles/:id"`, récupération via `const { id } = useParams();`.
- Page 404 : `<Route path="*" element={<NotFoundPage />} />`, en dernier.
- Routes imbriquées : `<Route path="/articles" element={<ArticlesLayout/>}>` + routes enfants (`index`, path relatif, `:id`) ; le layout parent contient `<Outlet />`.

## Performances — optimisation des images (cours 24)
- Format recommandé : **WebP** (avec fallback JPEG via `<picture><source type="image/webp">`).
- Ne jamais charger une image plus grande que sa taille d'affichage ; `srcset`/`sizes` pour le responsive.
- `loading="lazy"` sur les `<img>` **sauf** sur les images visibles sans scroll (hero, logo, above the fold).
- Toujours définir `width`/`height` sur `<img>` pour éviter le CLS (Cumulative Layout Shift).
- Objectif Lighthouse : score > 90 ; LCP < 2,5s.

## Authentification (cours 44-45)
- Stockage du JWT : **localStorage** (choix du cours ; en production un cookie `httpOnly` serait préférable mais nécessite une config back, non traité ici).
- **Context API** pour partager l'état de connexion (`src/context/AuthContext.jsx` + `AuthProvider.jsx`) :
  ```jsx
  export const AuthContext = createContext();
  export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    function login(token) { localStorage.setItem('token', token); setIsLoggedIn(true); }
    function logout() { localStorage.removeItem('token'); setIsLoggedIn(false); }
    return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>;
  }
  ```
  Wrapping dans `main.jsx` : `<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>` (`BrowserRouter` à l'extérieur — `useNavigate` doit être disponible dans `AuthProvider`).
- Consommation : `const { isLoggedIn, logout } = useContext(AuthContext);`.
- **`jwt-decode`** (`npm install jwt-decode`) pour lire le payload côté front, dans `utils/jwt.utils.js` :
  ```js
  export function isTokenValid(token) {
    try { const d = jwtDecode(token); if (!d.exp) return false; return d.exp * 1000 > Date.now(); }
    catch { return false; }
  }
  ```
- **3 moments à vérifier le token** :
  1. Au démarrage (`AuthProvider`) : token expiré → supprimé avant d'initialiser le state.
  2. À la navigation : composant `ProtectedRoute` (redirige `/connexion` si non connecté/expiré, `/` si mauvais rôle).
  3. À chaque requête : hook custom `useFetch` (dossier `src/hooks/`) qui ajoute automatiquement `Authorization` et appelle `logout()` sur un 401.

## Validation des formulaires (cours 46)
- **Règle absolue** : la validation front ne remplace jamais le back.
- **React Hook Form** (`npm install react-hook-form`) est la solution préconisée (remplace la gestion manuelle useState+validateField) :
  ```jsx
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onTouched" });
  <form onSubmit={handleSubmit(onSubmitFn)}>
    <input {...register("title", { required: "Le titre est obligatoire.", minLength: { value: 3, message: "..." } })} />
    {errors.title && <p>{errors.title.message}</p>}
  ```
- `mode: "onTouched"` respecte les règles UX enseignées : valider à la sortie du champ (`onBlur`) puis en temps réel une fois touché — jamais dès la première frappe.

## Gestion des erreurs (cours 47)
- 2 familles : erreurs de **validation (400)** → tableau `{path, msg}` affiché **sous chaque champ** ; erreurs **globales (401/403/404/500)** → `{message}` affiché en **toast**.
- Librairie toast : **`sonner`** (`npm install sonner`), `<Toaster richColors position="top-right" />` dans `App.jsx`, `toast.success(...)`/`toast.error(...)`.
- Centraliser dans `useFetch` : sur 400, retourner `{ validationErrors }` (pas de throw) ; sur tout autre statut non-ok, `throw new Error(data.message)`.
- Injecter une erreur backend dans React Hook Form : `setError(path, { message: msg })`.

## Tests (cours 48-49)
- **Vitest** pour la logique pure (fonctions utilitaires, ex. `isTokenValid`) — pas besoin de React Testing Library.
- **React Testing Library** (RTL, `npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`) pour tester l'affichage et les interactions, comme un utilisateur — jamais les détails d'implémentation (HTML, classes CSS).
- Config `vite.config.js` : `test: { globals: true, environment: 'jsdom', setupFiles: ['./src/setupTests.js'] }`, et `src/setupTests.js` importe `@testing-library/jest-dom`.
- `render()` monte le composant, `screen` interroge le DOM : `getByText` (lève une erreur si absent), `queryByText` (retourne `null`, à utiliser pour vérifier une **absence** avec `.not.toBeInTheDocument()`), `getByRole` (préféré pour les éléments interactifs).
- Wrapper les composants dépendants du routeur avec `<MemoryRouter>`.
- Interactions : `@testing-library/user-event`, toujours `await userEvent.click(...)` (asynchrone).
- Matchers DOM : `toBeInTheDocument()`, `toHaveTextContent()`, `toBeVisible()`, `toBeDisabled()`, `toHaveValue()`.

## Checklist avant d'écrire du code React
- [ ] Composants en PascalCase, un seul élément racine (ou fragment), attributs en camelCase ?
- [ ] Props déstructurées, `key` unique sur chaque élément de `.map()` ?
- [ ] `useState` utilisé pour toute donnée qui doit déclencher un re-rendu ?
- [ ] Pattern `data`/`isLoading`/`error` pour toute requête HTTP, avec vérification de `res.ok` ?
- [ ] Navigation interne via `<Link>`/`<NavLink>`, jamais `<a href>` ?
- [ ] Formulaires validés avec React Hook Form (`mode: "onTouched"`) plutôt qu'à la main ?
- [ ] Erreurs de validation sous les champs, erreurs globales en toast (`sonner`) ?
- [ ] JWT géré via `AuthContext`/`ProtectedRoute`/`useFetch`, jamais manipulé directement dans chaque composant ?
