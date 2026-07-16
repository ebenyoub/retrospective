import { useCallback, useState } from 'react';

import { DEFAULT_RETRO_FORMAT_ID, getRetroFormatById } from '@/lib/retroFormats';
import { getSessionDetails } from '../services/sessionApi';
import type { SessionDetails, SessionStep } from '../types/session.types';

const defaultFormat = getRetroFormatById(DEFAULT_RETRO_FORMAT_ID);
const legacyDefaultFormatColumns = ['Start', 'Stop', 'Continue'];

const normalizeLegacyDefaultColumns = (columns: string[]): string[] => (
  columns.every((column, index) => column === legacyDefaultFormatColumns[index])
    ? defaultFormat.columns
    : columns
);

const normalizeFormatColumns = (columns: SessionDetails['formatColumns']): string[] => {
  if (Array.isArray(columns) && columns.length === 3) {
    return normalizeLegacyDefaultColumns(columns);
  }

  if (typeof columns === 'string') {
    try {
      const parsed: unknown = JSON.parse(columns);
      if (Array.isArray(parsed) && parsed.length === 3 && parsed.every((column) => typeof column === 'string')) {
        return normalizeLegacyDefaultColumns(parsed);
      }
    } catch {
      return defaultFormat.columns;
    }
  }

  return defaultFormat.columns;
};

interface UseSessionDetailsOptions {
  sessionId: string;
  token: string;
}

export const useSessionDetails = ({ sessionId, token }: UseSessionDetailsOptions) => {
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [step, setStep] = useState<SessionStep>('waiting');
  const [formatName, setFormatName] = useState<string>(defaultFormat.name);
  const [formatColumns, setFormatColumns] = useState<string[]>(defaultFormat.columns);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [hasLoadedSession, setHasLoadedSession] = useState<boolean>(false);

  const fetchSessionDetails = useCallback(async (): Promise<void> => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === 'undefined' || isNaN(sessionIdNumber) || sessionIdNumber <= 0) return;

    try {
      const result = await getSessionDetails(sessionId, token);

      if (result.ok) {
        setSessionName(result.data.name);
        setSessionCode(result.data.code);
        setStep(result.data.step || 'writing');
        setFormatName(result.data.formatName ?? defaultFormat.name);
        setFormatColumns(normalizeFormatColumns(result.data.formatColumns));
        setOwnerId(result.data.ownerId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la session :', error);
    } finally {
      setHasLoadedSession(true);
    }
  }, [sessionId, token]);

  return {
    fetchSessionDetails,
    formatColumns,
    formatName,
    hasLoadedSession,
    ownerId,
    sessionCode,
    sessionName,
    setFormatColumns,
    setFormatName,
    setStep,
    step,
  };
};
