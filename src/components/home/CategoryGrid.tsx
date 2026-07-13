import Link from "next/link";
import Image from "next/image";

export default function CategoryGrid() {
  const categories = [
    { name: "Makeup", image: "/assets/makeup.png" },
    { name: "Skincare", image: "/assets/skincare.png" },
    { name: "Hair Care", image: "/assets/haircare.png" },
    { name: "Fragrances", image: "/assets/fragrance.png" },
    { name: "Body Care", image: "/assets/makeup.png" },
    { name: "Beauty Tools", image: "/assets/skincare.png" },
    { name: "Accessories", image: "/assets/haircare.png" },
    { name: "Gift Sets", image: "/assets/fragrance.png" },
  ];

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg waka-item">
      <h2 className="font-headline-lg text-headline-lg mb-stack-md text-center text-primary">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <Link key={index} href={`/categories/${cat.name.toLowerCase().replace(" ", "-")}`} className="group relative h-48 rounded-2xl overflow-hidden glass-card flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <Image 
              className="absolute inset-0 object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" 
              src={cat.image} 
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <span className="relative z-20 font-headline-lg text-xl text-white">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
