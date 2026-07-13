// Règle CORS partagée entre Express (server.ts) et Socket.IO (realtime/socket.ts),
// pour ne jamais avoir deux définitions de "quelle origine est autorisée" qui divergent.
const localViteOrigin = /^http:\/\/(localhost|127\.0\.0\.1):51[0-9]{2}$/;

export const isOriginAllowed = (origin: string | undefined, frontendOrigin: string): boolean => {
  if (!origin) return true;
  if (origin === frontendOrigin) return true;
  if (process.env.NODE_ENV !== "production" && localViteOrigin.test(origin)) return true;
  return false;
};
