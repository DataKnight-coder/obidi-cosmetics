export default function AnnouncementBar() {
  return (
    <div className="w-full bg-primary text-on-primary py-2 overflow-hidden whitespace-nowrap ticker-wrapper relative z-[60]">
      <div className="inline-block animate-marquee font-label-sm tracking-widest uppercase">
        <span className="mx-8">✨ Free delivery on orders over ₦50k</span>
        <span className="mx-8">✨ New Arrivals Just Dropped</span>
        <span className="mx-8">✨ Beauty That Speaks For Itself</span>
        {/* Duplicate for seamless loop */}
        <span className="mx-8">✨ Free delivery on orders over ₦50k</span>
        <span className="mx-8">✨ New Arrivals Just Dropped</span>
        <span className="mx-8">✨ Beauty That Speaks For Itself</span>
      </div>
    </div>
  );
}
