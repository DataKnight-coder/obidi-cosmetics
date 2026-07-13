import { Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="relative z-[60] bg-[#211017] px-4 py-2.5 text-[#fff8fa]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 text-center font-label-sm text-[10px] font-bold uppercase tracking-[0.18em] sm:text-xs">
        <Sparkles aria-hidden="true" size={13} className="shrink-0 text-[#e5bd78]" />
        <span>Free nationwide delivery on orders over ₦50,000</span>
      </div>
    </div>
  );
}
