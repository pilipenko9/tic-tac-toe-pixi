import type { AssetsMapTypeDescriptions } from './descriptions';

export const assetsMap: AssetsMapTypeDescriptions = {
  sprites: [
    { name: 'playfield', url: './assets/images/playfield.png' },
    { name: 'win_highlight', url: './assets/images/win_highlight.png' },
  ],
  sequences: [{ name: 'sequence', url: './assets/sequences/sequence.json' }],
  bitMapFonts: [
    {
      name: 'bitmapFontLight',
      url: './assets/bitmapFonts/lightFont.fnt',
    },
  ],
};
