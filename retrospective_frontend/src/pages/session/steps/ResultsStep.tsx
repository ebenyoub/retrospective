import SessionResults from '../components/SessionResults';
import { useSessionCardsState, useSessionDetailsState, useSessionViewportState } from '../context/useSessionContext';

const ResultsStep = () => {
  const sessionCards = useSessionCardsState();
  const { details } = useSessionDetailsState();
  const viewport = useSessionViewportState();

  return (
    <SessionResults cards={sessionCards.cards} formatColumns={details.formatColumns} isDesktop={viewport.isDesktop} />
  );
};

export default ResultsStep;
