// URL de base de l'API backend, définie en un seul endroit (fetch et
// Socket.IO s'appuient tous les deux dessus).
// Surchargée par la variable d'environnement Vite `VITE_API_URL` (voir
// `.env.example`) pour permettre un déploiement propre en production.
//
// Sans cette variable (développement), on reprend l'hôte utilisé pour
// charger la page plutôt qu'un "localhost" figé : en local ça reste
// http://localhost:8000 comme avant, et si le frontend est ouvert depuis un
// autre poste du réseau via son IP (ex. http://192.168.50.93:5173), l'API
// pointe automatiquement vers la même IP au lieu du "localhost" de ce
// poste-là (qui ne désignerait pas la machine hébergeant le backend).
// Pas d'IP en dur à maintenir : ça suit l'IP réelle utilisée pour se connecter.
export const API_BASE = (import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8000`) + '/api';
