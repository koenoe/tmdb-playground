'use client';

import { forwardRef, useCallback, useState } from 'react';

import { cva } from 'class-variance-authority';

const textStyles = cva(
  'leading-loose md:!line-clamp-none md:pointer-events-none',
  {
    variants: {
      state: {
        open: ['line-clamp-none'],
        closed: ['line-clamp-3'],
      },
    },
    defaultVariants: {
      state: 'open',
    },
  },
);

const ExpandableText = forwardRef<
  HTMLParagraphElement,
  Readonly<{ children: React.ReactNode; className?: string }>
>(({ className, children }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = useCallback(
    () => setIsOpen((previousState) => !previousState),
    [],
  );

  return (
    <p
      ref={ref}
      className={textStyles({ state: isOpen ? 'open' : 'closed', className })}
      onClick={handleClick}
    >
      {children}
    </p>
  );
});

ExpandableText.displayName = 'ExpandableText';

export default ExpandableText;
