import SessionResults from '../components/SessionResults';
import { useSessionContext } from '../context/useSessionContext';

const ResultsStep = () => {
  const { sessionCards, details, viewport } = useSessionContext();

  return (
    <SessionResults cards={sessionCards.cards} formatColumns={details.formatColumns} isDesktop={viewport.isDesktop} />
  );
};

export default ResultsStep;
