import Image from "next/image";

export default function ShopByLook() {
  const looks = [
    { name: "Clean Girl", image: "/assets/skincare.png" },
    { name: "Soft Glam", image: "/assets/makeup.png" },
    { name: "Full Glam", image: "/assets/fragrance.png" },
    { name: "Everyday Makeup", image: "/assets/makeup.png" },
    { name: "Bridal Look", image: "/assets/haircare.png" },
    { name: "No Makeup Makeup", image: "/assets/skincare.png" },
    { name: "Bold Lips", image: "/assets/makeup.png" },
    { name: "Glass Skin", image: "/assets/skincare.png" },
  ];

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md text-center">Shop by Makeup Look</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {looks.map((look, index) => (
          <div key={index} className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <Image 
              className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100" 
              src={look.image}
              alt={look.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6">
              <span className="font-headline-lg text-xl md:text-2xl text-white transform group-hover:-translate-y-2 transition-transform">{look.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
