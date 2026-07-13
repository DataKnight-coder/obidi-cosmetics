import { Flower2, Contrast, Sparkles, Droplet, ShieldPlus, Fingerprint, ScanFace, Waves } from "lucide-react";

export default function ShopBySkinConcern() {
  const concerns = [
    { name: "Acne", icon: <Flower2 size={36} /> },
    { name: "Hyperpigmentation", icon: <Contrast size={36} /> },
    { name: "Oily Skin", icon: <Sparkles size={36} /> },
    { name: "Dry Skin", icon: <Droplet size={36} /> },
    { name: "Sensitive Skin", icon: <ShieldPlus size={36} /> },
    { name: "Uneven Tone", icon: <Fingerprint size={36} /> },
    { name: "Dark Spots", icon: <ScanFace size={36} /> },
    { name: "Fine Lines", icon: <Waves size={36} /> },
  ];

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md text-center text-primary">Shop by Skin Concern</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {concerns.map((concern, index) => (
          <div key={index} className="glass-card p-6 rounded-2xl text-center hover:bg-white/10 hover:-translate-y-1 transition-all cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="text-primary mb-2 group-hover:scale-110 transition-transform flex justify-center">
              {concern.icon}
            </div>
            <h3 className="font-headline-lg text-xl">{concern.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
