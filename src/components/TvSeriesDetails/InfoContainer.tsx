export default function TvSeriesDetailsInfoContainer({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex h-[calc(95vh-16rem)] items-end md:h-[calc(70vh-8rem)]">
      <div className="w-full xl:w-4/5 2xl:w-3/5">{children}</div>
    </div>
  );
}
