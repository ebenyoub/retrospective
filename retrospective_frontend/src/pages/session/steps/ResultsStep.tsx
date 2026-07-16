import SessionResults from '../components/SessionResults';
import type { ResultsStepProps } from './types/ResultsStep.types';

const ResultsStep = ({ cards, formatColumns, isDesktop }: ResultsStepProps) => (
  <SessionResults cards={cards} formatColumns={formatColumns} isDesktop={isDesktop} />
);

export default ResultsStep;
