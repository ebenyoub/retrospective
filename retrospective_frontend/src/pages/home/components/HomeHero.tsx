import RtcLogo from "@/assets/Logo";

interface HomeHeroProps {
  connectedCount: number;
}

const HomeHero = ({ connectedCount }: HomeHeroProps) => {
  return (
    <div className="text-center mb-9">
      <RtcLogo className="h-10 w-auto mx-auto mb-6 text-green-500" />

      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-xs font-medium text-slate-400">
          {connectedCount} participants connectés
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 mb-2 leading-tight">
        Rétrospective collaborative
      </h1>

      <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
        Collectez les retours de votre équipe, votez et définissez des actions en quelques minutes.
      </p>
    </div>
  );
};

export default HomeHero;
