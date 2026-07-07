interface Feature {
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    title: "Collectez",
    description: "Chaque participant partage ce qui a bien fonctionné, les problèmes et les idées.",
  },
  {
    title: "Votez",
    description: "L'équipe priorise les sujets les plus importants avec un nombre de votes limité.",
  },
  {
    title: "Agissez",
    description: "Transformez les échanges en actions concrètes, assignées et datées.",
  },
];

const HomeFeatureSection = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mx-auto mt-14">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="text-center sm:text-left">
          <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-1">
            {feature.title}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default HomeFeatureSection;
