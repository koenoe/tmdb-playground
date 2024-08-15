import { forwardRef } from 'react';

import { cx } from 'class-variance-authority';
import Image from 'next/image';

import { type TvSeries } from '@/types/tv-series';

const TitleTreatment = forwardRef<
  HTMLHeadingElement,
  Readonly<{ tvSeries: TvSeries; className?: string }>
>(({ className, tvSeries }, ref) => {
  return tvSeries.titleTreatmentImage ? (
    <h1
      ref={ref}
      className={cx('relative h-28 w-full md:h-40 md:w-3/5', className)}
    >
      <Image
        className="max-w-[500px] object-contain object-bottom md:object-left-bottom"
        src={tvSeries.titleTreatmentImage}
        alt=""
        priority
        fill
        draggable={false}
        unoptimized
      />
      <span className="hidden">{tvSeries.title}</span>
    </h1>
  ) : (
    <h1
      ref={ref}
      className={cx(
        'relative w-full text-center text-3xl font-bold !leading-tight md:w-3/5 md:text-left md:text-4xl lg:text-5xl xl:text-6xl',
        className,
      )}
    >
      {tvSeries.title}
    </h1>
  );
});

TitleTreatment.displayName = 'TitleTreatment';

export default TitleTreatment;
