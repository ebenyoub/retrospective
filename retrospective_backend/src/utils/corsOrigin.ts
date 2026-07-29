// Règle CORS partagée entre Express (server.ts) et Socket.IO (realtime/socket.ts),
// pour ne jamais avoir deux définitions de "quelle origine est autorisée" qui divergent.
//
// En dehors de la production, on autorise aussi les IP privées du réseau
// local (192.168.x.x, 10.x.x.x, 172.16-31.x.x) sur un port Vite courant :
// ça permet d'ouvrir le frontend depuis un autre poste du même réseau
// (`vite --host`) sans avoir à coder une IP précise en dur ni à modifier
// FRONTEND_ORIGIN à chaque fois que l'IP de la machine change.
const devOrigin =
  /^http:\/\/(localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2}):51\d{2}$/;

export const isOriginAllowed = (origin: string | undefined, frontendOrigin: string): boolean => {
  if (!origin) return true;
  if (origin === frontendOrigin) return true;
  if (process.env.NODE_ENV !== "production" && devOrigin.test(origin)) return true;
  return false;
};
