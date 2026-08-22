export const categoryControlClass = active => [
  'relative z-0 shrink-0 snap-start border px-4 py-3 text-[10px] font-extrabold tracking-[.14em] uppercase outline-none',
  'transition-[color,background-color,border-color,box-shadow]',
  'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[#8f4a14] focus-visible:ring-offset-2',
  active
    ? 'border-bakery bg-gold text-bakery shadow-[0_4px_0_#8f4a14]'
    : 'border-[#7c4729] bg-[#3b0e06] text-gold hover:border-gold',
].join(' ');

export const categoryToolbarClass =
  'mx-auto min-h-[62px] w-full max-w-[1440px] snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-1 pt-5 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
