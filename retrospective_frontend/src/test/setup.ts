import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Node 22+ expose son propre global `localStorage` expérimental (lié à
// --localstorage-file), qui masque celui fourni par jsdom et se retrouve, dans
// cet environnement, non fonctionnel (setItem absent). On le remplace par un
// shim mémoire minimal implémentant l'interface Storage, uniquement pour les tests.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof window.localStorage?.setItem !== 'function') {
  const storageShim = new MemoryStorage();
  Object.defineProperty(window, 'localStorage', { value: storageShim, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: storageShim, configurable: true });
}

// jsdom ne fait pas de mise en page réelle et n'implémente donc ni
// scrollIntoView (DiscussionDrawer) ni scrollTo (CardCommentsSection) : des
// stubs inoffensifs suffisent, les navigateurs réels ont leur propre implémentation.
if (typeof window.HTMLElement.prototype.scrollIntoView !== 'function') {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
if (typeof window.HTMLElement.prototype.scrollTo !== 'function') {
  window.HTMLElement.prototype.scrollTo = () => {};
}

// Nettoie le DOM entre chaque test (Vitest ne le fait pas automatiquement,
// contrairement à Jest avec @testing-library/react).
afterEach(() => {
  cleanup();
});
