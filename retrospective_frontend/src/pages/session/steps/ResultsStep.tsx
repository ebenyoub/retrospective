import SessionResults from '../components/SessionResults';
import type { RetroCard } from '../types/card.types';

interface ResultsStepProps {
  cards: RetroCard[];
  formatColumns: string[];
  isDesktop: boolean;
}

const ResultsStep = ({ cards, formatColumns, isDesktop }: ResultsStepProps) => (
  <SessionResults cards={cards} formatColumns={formatColumns} isDesktop={isDesktop} />
);

export default ResultsStep;
