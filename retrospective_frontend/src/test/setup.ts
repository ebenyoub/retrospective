import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Nettoie le DOM entre chaque test (Vitest ne le fait pas automatiquement,
// contrairement à Jest avec @testing-library/react).
afterEach(() => {
  cleanup();
});
