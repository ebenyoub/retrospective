export interface RetroCard {
  id: number;
  sessionId: number;
  authorId: number;
  columnType: "start" | "stop" | "continue";
  content: string;
  createdAt: string;
}

interface RetroCardItemProps {
  card: RetroCard;
  accentClassName: string;
}

const RetroCardItem = ({ card, accentClassName }: RetroCardItemProps) => {
  return (
    <div className={`bg-slate-800 border border-white/10 border-l-4 ${accentClassName} rounded-lg p-3`}>
      <p className="text-sm text-slate-100 leading-relaxed">{card.content}</p>
    </div>
  );
};

export default RetroCardItem;
