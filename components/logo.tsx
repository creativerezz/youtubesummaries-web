export function Logo() {
  return (
    <div className="relative flex items-center gap-2 text-base font-medium text-foreground sm:gap-3 sm:text-lg">
      <div className="h-[14px] w-[5px] rotate-20 rounded-[3px] bg-primary/80 sm:h-[16px] sm:w-[6px] sm:rounded-[4px]"></div>
      <div className="absolute left-1.5 h-[14px] w-[5px] rotate-20 rounded-[3px] bg-primary sm:left-2 sm:h-[16px] sm:w-[6px] sm:rounded-[4px]"></div>
      <span className="ml-1.5">youtube<span className="text-primary">summaries</span></span>
    </div>
  );
}
