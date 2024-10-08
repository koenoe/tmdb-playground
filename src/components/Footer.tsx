import Link from 'next/link';

import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="relative mt-auto flex h-[12rem] w-full items-center">
      <div className="container z-10 flex flex-col gap-4">
        <Logo />
        <p className="text-xs leading-loose opacity-60">
          This website uses the TMDb API but is neither endorsed nor certified
          by{' '}
          <Link
            href="https://themoviedb.org"
            target="_blank"
            className="underline"
            prefetch={false}
          >
            TMDb
          </Link>
          . The information on watch providers is courtesy of{' '}
          <Link
            href="https://www.justwatch.com/"
            target="_blank"
            className="underline"
            prefetch={false}
          >
            JustWatch
          </Link>
          .
        </p>
      </div>
      <div className="z-5 absolute inset-0 h-full w-full bg-black/5" />
    </footer>
  );
}
