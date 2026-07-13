/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../App.css';

import SessionResults from '../pages/session/components/SessionResults';
import type { RetroCard } from '../pages/session/components/RetroCardItem';

// Aperçu VISUEL UNIQUEMENT (non livré) pour comparer avec le prototype Figma.
// Paramètres d'URL : ?cards=0|1|6|many

const LONG =
  "Ceci est une carte volontairement très longue pour vérifier que le texte passe correctement à la ligne, ne déborde pas horizontalement et ne casse pas la mise en page même lorsqu'un participant écrit un paragraphe entier sans respirer une seule fois.";

const AUTHORS = [
  [1, 'Elyas'],
  [2, 'Sarah'],
  [3, 'Marc'],
  [4, 'Julie'],
  [5, 'Tom'],
  [6, 'Nadia'],
] as const;

const COLS: RetroCard['columnType'][] = ['continue', 'stop', 'start'];

function makeCards(count: number): RetroCard[] {
  const contents = [
    "Bonne communication dans l'équipe",
    'Trop de réunions cette semaine',
    'Automatiser le déploiement',
    LONG,
    'Livraison dans les temps',
    'Documentation à améliorer',
    'Mettre en place des revues de code',
    'Ambiance au top',
    'Bugs en production',
    'Prévoir des pauses régulières',
  ];
  const cards: RetroCard[] = [];
  for (let i = 0; i < count; i++) {
    const [authorId, authorName] = AUTHORS[i % AUTHORS.length];
    cards.push({
      id: i + 1,
      sessionId: 1,
      authorId,
      authorName,
      columnType: COLS[i % COLS.length],
      content: contents[i % contents.length],
      createdAt: '2026-07-13T10:00:00.000Z',
      votesCount: count === 1 ? 1 : (i * 3 + 1) % 8,
    });
  }
  return cards;
}

const params = new URLSearchParams(window.location.search);
const cardsParam = params.get('cards') ?? '6';
const count = cardsParam === 'many' ? 24 : Number(cardsParam);
const cards = makeCards(count);
const isDesktop = window.innerWidth >= 768;

function Toolbar() {
  return (
    <div className="flex flex-shrink-0 flex-wrap items-center justify-between w-full bg-navy-mid border-b border-navy-border px-5 py-2.5 gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h1 className="text-sm font-bold text-slate-50 truncate">Sprint 42 — Revue</h1>
        <span className="text-xs font-semibold bg-navy-surface-med text-slate-300 border border-navy-border-med rounded px-2 py-0.5">
          Facilitateur
        </span>
        <span className="text-xs font-semibold text-green-figma uppercase bg-green-figma/10 px-2 py-0.5 rounded">
          Résultats
        </span>
        <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider">Code : A4F7K2</span>
      </div>
      <button className="text-xs font-semibold bg-navy-surface-med text-slate-200 border border-navy-border-med rounded-lg px-3 py-1.5">
        Quitter la session
      </button>
    </div>
  );
}

function Preview() {
  return (
    <div className="flex flex-col h-screen bg-navy overflow-hidden">
      <Toolbar />
      <SessionResults cards={cards} isDesktop={isDesktop} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
