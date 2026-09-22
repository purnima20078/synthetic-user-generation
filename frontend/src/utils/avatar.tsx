import React from 'react';

/**
 * Zero-dependency deterministic avatar SVG generator.
 * Produces modern, playful vector portrait avatars based on a seed string.
 */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PALETTES = [
  { bg: '#3B82F6', accent: '#60A5FA', face: '#FDE047', hair: '#1E3A8A' },
  { bg: '#6366F1', accent: '#818CF8', face: '#FCD34D', hair: '#312E81' },
  { bg: '#0D9488', accent: '#2DD4BF', face: '#FDE68A', hair: '#134E4A' },
  { bg: '#EC4899', accent: '#F472B6', face: '#FED7AA', hair: '#831843' },
  { bg: '#F59E0B', accent: '#FBBF24', face: '#FEF08A', hair: '#78350F' },
  { bg: '#8B5CF6', accent: '#A78BFA', face: '#FDE047', hair: '#4C1D95' },
  { bg: '#10B981', accent: '#34D399', face: '#FEF08A', hair: '#064E3B' },
  { bg: '#0284C7', accent: '#38BDF8', face: '#FDE68A', hair: '#0C4A6E' },
];

export function generateAvatarSvg(seed: string, size = 64): string {
  const hash = hashString(seed || 'persona');
  const palette = PALETTES[hash % PALETTES.length];

  const eyeVariant = (hash >> 3) % 4;
  const mouthVariant = (hash >> 5) % 4;
  const hairVariant = (hash >> 7) % 5;
  const accessory = (hash >> 9) % 3;

  let eyeSvg = '';
  if (eyeVariant === 0) {
    eyeSvg = `<circle cx="38" cy="45" r="3.5" fill="#1E293B"/><circle cx="62" cy="45" r="3.5" fill="#1E293B"/>`;
  } else if (eyeVariant === 1) {
    eyeSvg = `<path d="M 34 45 Q 38 41 42 45" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M 58 45 Q 62 41 66 45" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  } else if (eyeVariant === 2) {
    eyeSvg = `<rect x="35" y="42" width="6" height="6" rx="2" fill="#1E293B"/><rect x="59" y="42" width="6" height="6" rx="2" fill="#1E293B"/>`;
  } else {
    eyeSvg = `<ellipse cx="38" cy="45" rx="4" ry="3" fill="#1E293B"/><ellipse cx="62" cy="45" rx="4" ry="3" fill="#1E293B"/><circle cx="39" cy="44" r="1.5" fill="#FFFFFF"/><circle cx="63" cy="44" r="1.5" fill="#FFFFFF"/>`;
  }

  let mouthSvg = '';
  if (mouthVariant === 0) {
    mouthSvg = `<path d="M 43 62 Q 50 69 57 62" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  } else if (mouthVariant === 1) {
    mouthSvg = `<path d="M 44 63 Q 50 59 56 63" stroke="#1E293B" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  } else if (mouthVariant === 2) {
    mouthSvg = `<ellipse cx="50" cy="63" rx="4" ry="3" fill="#E11D48"/>`;
  } else {
    mouthSvg = `<path d="M 44 61 L 56 61" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  let hairSvg = '';
  if (hairVariant === 0) {
    // Short buzz / crop
    hairSvg = `<path d="M 28 42 C 28 26 72 26 72 42 C 72 40 68 28 50 28 C 32 28 28 40 28 42 Z" fill="${palette.hair}"/>`;
  } else if (hairVariant === 1) {
    // Parted / pompadour
    hairSvg = `<path d="M 24 45 C 24 22 76 22 76 45 C 72 28 62 25 50 25 C 38 25 28 30 24 45 Z" fill="${palette.hair}"/>`;
  } else if (hairVariant === 2) {
    // Long hair
    hairSvg = `<path d="M 24 40 C 24 22 76 22 76 40 C 80 58 78 72 76 76 C 72 65 72 48 72 42 C 65 28 35 28 28 42 C 28 48 28 65 24 76 C 22 72 20 58 24 40 Z" fill="${palette.hair}"/>`;
  } else if (hairVariant === 3) {
    // Curly / afro top
    hairSvg = `<circle cx="50" cy="32" r="22" fill="${palette.hair}"/><circle cx="34" cy="36" r="14" fill="${palette.hair}"/><circle cx="66" cy="36" r="14" fill="${palette.hair}"/>`;
  } else {
    // Side fringe
    hairSvg = `<path d="M 26 42 C 26 24 74 24 74 42 C 60 30 40 38 26 42 Z" fill="${palette.hair}"/>`;
  }

  let accessorySvg = '';
  if (accessory === 1) {
    // Glasses
    accessorySvg = `
      <rect x="30" y="38" width="16" height="14" rx="4" fill="none" stroke="#0F172A" stroke-width="2.5"/>
      <rect x="54" y="38" width="16" height="14" rx="4" fill="none" stroke="#0F172A" stroke-width="2.5"/>
      <line x1="46" y1="45" x2="54" y2="45" stroke="#0F172A" stroke-width="2.5"/>
    `;
  } else if (accessory === 2) {
    // Round glasses
    accessorySvg = `
      <circle cx="38" cy="45" r="8" fill="none" stroke="#0F172A" stroke-width="2.5"/>
      <circle cx="62" cy="45" r="8" fill="none" stroke="#0F172A" stroke-width="2.5"/>
      <line x1="46" y1="45" x2="54" y2="45" stroke="#0F172A" stroke-width="2.5"/>
    `;
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="rounded-full shadow-inner">
      <rect width="100" height="100" rx="50" fill="${palette.bg}"/>
      <circle cx="50" cy="50" r="46" fill="${palette.accent}" opacity="0.3"/>
      <!-- Shoulders -->
      <path d="M 18 100 C 18 78 82 78 82 100 Z" fill="#334155"/>
      <!-- Neck -->
      <rect x="43" y="66" width="14" height="18" fill="${palette.face}" rx="2"/>
      <!-- Face -->
      <circle cx="50" cy="50" r="24" fill="${palette.face}"/>
      <!-- Hair back & front -->
      ${hairSvg}
      <!-- Blush -->
      <circle cx="34" cy="52" r="3.5" fill="#F43F5E" opacity="0.25"/>
      <circle cx="66" cy="52" r="3.5" fill="#F43F5E" opacity="0.25"/>
      <!-- Eyes -->
      ${eyeSvg}
      <!-- Mouth -->
      ${mouthSvg}
      <!-- Glasses / accessories -->
      ${accessorySvg}
    </svg>
  `.trim();
}

export function AvatarImage({ seed, size = 48, className = '' }: { seed: string; size?: number; className?: string }) {
  const svgString = generateAvatarSvg(seed, size);
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  return (
    <img
      src={dataUri}
      alt={seed}
      width={size}
      height={size}
      className={`inline-block rounded-full object-cover shrink-0 select-none ${className}`}
    />
  );
}
