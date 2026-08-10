import React from 'react';

interface AdmLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textVariant?: 'short' | 'full' | 'stacked';
  textColor?: string;
}

export const AdmLogo: React.FC<AdmLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  textVariant = 'short',
  textColor = 'currentColor',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Extracted Geometric 'A' Emblem Icon (Isolated without text) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          {/* Gradients matching the teal/blue geometric facets from the image */}
          <linearGradient id="admlogo-facet-left-outer" x1="10" y1="105" x2="60" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#084763" />
            <stop offset="60%" stopColor="#11739b" />
            <stop offset="100%" stopColor="#1e9ec4" />
          </linearGradient>

          <linearGradient id="admlogo-facet-right-outer" x1="60" y1="10" x2="110" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#188ba3" />
            <stop offset="50%" stopColor="#106b8e" />
            <stop offset="100%" stopColor="#084562" />
          </linearGradient>

          <linearGradient id="admlogo-facet-crossbar" x1="25" y1="62" x2="95" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1c8cae" />
            <stop offset="50%" stopColor="#137295" />
            <stop offset="100%" stopColor="#0b4e6d" />
          </linearGradient>

          <linearGradient id="admlogo-facet-inner-top" x1="60" y1="28" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0a3d58" />
            <stop offset="100%" stopColor="#146d90" />
          </linearGradient>

          <linearGradient id="admlogo-facet-fold-shadow" x1="70" y1="65" x2="105" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#063249" />
            <stop offset="100%" stopColor="#0d5475" />
          </linearGradient>

          {/* Subtle drop shadow filter for 3D depth */}
          <filter id="admlogo-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#041a27" floodOpacity="0.35" />
          </filter>
        </defs>

        <g filter="url(#admlogo-shadow)">
          {/* Main Left Outer Ribbon Arm */}
          <path
            d="M 60 10 L 15 102 L 34 102 L 60 48 L 86 102 L 105 102 Z"
            fill="url(#admlogo-facet-left-outer)"
          />

          {/* Faceted Top Peak Edge (Left Apex Highlight) */}
          <path
            d="M 60 10 L 53 102 L 34 102 L 60 38 L 60 10 Z"
            fill="#23add4"
            opacity="0.28"
          />

          {/* Right Outer Facet Face */}
          <path
            d="M 60 10 L 60 48 L 86 102 L 105 102 Z"
            fill="url(#admlogo-facet-right-outer)"
          />

          {/* Inner Inverted Triangle Cutout Shadow Background */}
          <path
            d="M 60 30 L 41 68 L 79 68 Z"
            fill="url(#admlogo-facet-inner-top)"
          />

          {/* Geometric Ribbed Crossbar Feature */}
          <path
            d="M 28 72 L 92 72 L 108 102 L 88 102 L 78 86 L 28 86 Z"
            fill="url(#admlogo-facet-crossbar)"
          />

          {/* Top Crossbar Edge Highlight */}
          <path
            d="M 33 62 L 87 62 L 93 72 L 27 72 Z"
            fill="#28b7de"
            opacity="0.85"
          />

          {/* Lower Right Fold Under Wing */}
          <path
            d="M 72 72 L 108 102 L 92 102 L 66 82 Z"
            fill="url(#admlogo-facet-fold-shadow)"
          />

          {/* Inner Triangular Bevel Accent */}
          <path
            d="M 60 35 L 47 62 L 73 62 Z"
            fill="#083850"
          />
          <path
            d="M 60 35 L 73 62 L 60 62 Z"
            fill="#1ba8cf"
            opacity="0.4"
          />
        </g>
      </svg>

      {/* Optional Text Label */}
      {showText && (
        <div className="flex flex-col leading-none">
          {textVariant === 'short' && (
            <span
              className="font-extrabold tracking-wider font-sans text-base"
              style={{ color: textColor }}
            >
              ADM
            </span>
          )}

          {textVariant === 'full' && (
            <div className="flex flex-col">
              <span
                className="font-black text-lg tracking-wider font-sans leading-none"
                style={{ color: textColor }}
              >
                ADM
              </span>
              <span
                className="text-[10px] font-medium tracking-normal opacity-80 mt-0.5"
                style={{ color: textColor }}
              >
                Archimedes Download Manager
              </span>
            </div>
          )}

          {textVariant === 'stacked' && (
            <div className="flex flex-col">
              <span
                className="font-black text-xl tracking-widest font-sans"
                style={{ color: textColor }}
              >
                ADM
              </span>
              <span
                className="text-[9px] font-semibold tracking-wider uppercase opacity-75 mt-0.5"
                style={{ color: textColor }}
              >
                Archimedes
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
