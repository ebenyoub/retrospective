import { useCallback, useState } from 'react';

import { DEFAULT_RETRO_FORMAT_ID, getRetroFormatById } from '@/lib/retroFormats';
import { getSessionDetails } from '../services/sessionApi';
import type { SessionDetails, SessionStep } from '../types/session.types';
import type { UseSessionDetailsOptions } from './types/useSessionDetails.types';

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

export const useSessionDetails = ({ sessionId }: UseSessionDetailsOptions) => {
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [step, setStep] = useState<SessionStep>('waiting');
  const [formatName, setFormatName] = useState<string>(defaultFormat.name);
  const [formatColumns, setFormatColumns] = useState<string[]>(defaultFormat.columns);
  const [stepDurationMinutes, setStepDurationMinutes] = useState<number>(5);
  const [stepEndsAt, setStepEndsAt] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('open');
  const [hasLoadedSession, setHasLoadedSession] = useState<boolean>(false);

  // guestToken : transmis par l'appelant (SessionDashboard connaît l'identité
  // invitée stockée localement) pour qu'un ancien invité puisse rouvrir une
  // session close en lecture seule, sans avoir de cookie d'authentification.
  const fetchSessionDetails = useCallback(async (guestToken?: string): Promise<void> => {
    const sessionIdNumber = Number(sessionId);
    if (!sessionId || sessionId === 'undefined' || isNaN(sessionIdNumber) || sessionIdNumber <= 0) return;

    try {
      const result = await getSessionDetails(sessionId, guestToken);

      if (result.ok) {
        setSessionName(result.data.name);
        setSessionCode(result.data.joinCode ?? '');
        setStep(result.data.step || 'writing');
        setFormatName(result.data.formatName ?? defaultFormat.name);
        setFormatColumns(normalizeFormatColumns(result.data.formatColumns));
        setStepDurationMinutes(result.data.stepDurationMinutes ?? 5);
        setStepEndsAt(result.data.stepEndsAt ?? null);
        setOwnerId(result.data.ownerId);
        setStatus(result.data.status || 'open');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la session :', error);
    } finally {
      setHasLoadedSession(true);
    }
  }, [sessionId]);

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
    setStepDurationMinutes,
    setStepEndsAt,
    setStatus,
    step,
    stepDurationMinutes,
    stepEndsAt,
    status,
  };
};
