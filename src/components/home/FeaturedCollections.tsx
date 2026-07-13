import Image from "next/image";

export default function FeaturedCollections() {
  const collections = [
    {
      title: "Soft Life Essentials",
      desc: "Curated for the ultimate soft life. You sabi.",
      image: "/assets/makeup.png"
    },
    {
      title: "Everyday Glow",
      desc: "Your daily dose of radiance.",
      image: "/assets/skincare.png"
    },
    {
      title: "Weekend Glam",
      desc: "E choke. For when you need to show out.",
      image: "/assets/haircare.png"
    }
  ];

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item bg-white/5 my-stack-lg rounded-[40px]">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md text-center">Featured Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.map((col, index) => (
          <div key={index} className="flex flex-col gap-4 text-center group cursor-pointer">
            <div className="h-64 rounded-3xl overflow-hidden relative glass-card">
              <Image 
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" 
                src={col.image} 
                alt={col.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <h3 className="font-headline-lg text-2xl text-primary">{col.title}</h3>
            <p className="font-body-md text-on-surface-variant">{col.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
