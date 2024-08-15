'use client';

import { usePageStore } from '../Page/PageProvider';

export default function BackgroundGlobal() {
  const color = usePageStore((state) => state.backgroundColor);

  return (
    <style global jsx>{`
      main,
      main + footer,
      #modal-root > div {
        background-color: ${color};
      }
    `}</style>
  );
}
