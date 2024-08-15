import { cva } from 'class-variance-authority';

import hexToRgb from '@/utils/hexToRgb';

import { type BackgroundContext } from './Background';
import BackgroundImage from './BackgroundImage';

export const backgroundBaseStyles = cva('absolute inset-0');

function BackgroundBase({
  color = '#000',
  context,
  image,
}: Readonly<{ color?: string; image?: string; context: BackgroundContext }>) {
  const rgbString = hexToRgb(color).join(',');

  return (
    <>
      <BackgroundImage
        src={image}
        style={{
          opacity: context === 'spotlight' ? 0.3 : 1,
        }}
      />

      {context === 'page' && (
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `linear-gradient(270deg, rgba(${rgbString}, 0) 0%, rgba(${rgbString}, 0.9) 50%, rgba(${rgbString}, 1) 100%)`,
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(${rgbString}, 0) 0%, rgba(${rgbString}, 1) 100%)`,
        }}
      />

      <div
        className="absolute bottom-0 left-0 h-1/5 w-full"
        style={{
          backgroundImage: `linear-gradient(to top, ${color}, ${color} 50%, transparent)`,
        }}
      />
    </>
  );
}

export default BackgroundBase;
