import { BadgeCheck, Headphones, LockKeyhole, Truck } from "lucide-react";

const promises = [
  { icon: BadgeCheck, title: "Authentic, always", detail: "Products you can trust" },
  { icon: Truck, title: "Nationwide delivery", detail: "Across Nigeria" },
  { icon: LockKeyhole, title: "Secure checkout", detail: "Protected payments" },
  { icon: Headphones, title: "Real support", detail: "Help when you need it" },
];

export default function TrustBar() {
  return (
    <section className="section-shell py-5 sm:py-8" aria-label="Our promises">
      <div className="grid grid-cols-2 divide-x divide-y divide-outline-variant overflow-hidden rounded-3xl border border-outline-variant bg-surface md:grid-cols-4 md:divide-y-0">
        {promises.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="flex min-h-28 items-center gap-3 p-4 sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary sm:h-12 sm:w-12">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span>
              <strong className="block font-headline-lg text-sm font-bold text-on-surface sm:text-base">{title}</strong>
              <span className="mt-1 hidden text-xs text-on-surface-variant sm:block">{detail}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
