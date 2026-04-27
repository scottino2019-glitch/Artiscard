export const FONT_FAMILIES = [
  { name: 'Modern Sans', value: 'Inter' },
  { name: 'Space Tech', value: 'Space Grotesk' },
  { name: 'Elegant Serif', value: 'Playfair Display' },
  { name: 'Classic Art', value: 'Cormorant Garamond' },
  { name: 'Marker Style', value: 'Permanent Marker' },
  { name: 'Cursive Script', value: 'Satisfy' },
];

export const POSTCARD_SIZES = {
  standard: { width: 800, height: 533, label: 'Standard (Large)' },
  square: { width: 700, height: 700, label: 'Square (Premium)' },
  portrait: { width: 533, height: 800, label: 'Portrait (Tall)' },
};

export const STICKER_PACKS = [
  { id: 'shapes', name: 'Geo Shapes', items: ['circle', 'rect', 'triangle', 'star'] },
  { id: 'speech', name: 'Bubbles', items: ['💬', '💭', '🗯️', '🗨' ] },
  { id: 'icons', name: 'Post-Icons', items: ['💌', '😂', '✈️', '🥰', '📷', '💤', '🎉', '❤️', '✨', '🫶', '😘', '🌟', '🌜', '🌞', '👀', '🌺', '🎀', '📎'] },
];

export const FILTERS = [
  { id: 'none', name: 'Original' },
  { id: 'grayscale', name: 'B&W' },
  { id: 'sepia', name: 'Vintage' },
  { id: 'invert', name: 'Negative' },
  { id: 'blur', name: 'Soft Focus' },
  { id: 'polaroid', name: 'Polaroid' },
];
