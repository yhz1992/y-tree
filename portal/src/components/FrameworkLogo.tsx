import React from "react";

type FrameworkId = "react" | "vue" | "angular";

const ReactLogo: React.FC = () => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" aria-hidden="true">
    <circle r="2.05" fill="#61DAFB" />
    <g stroke="#61DAFB" fill="none" strokeWidth="1">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

const VueLogo: React.FC = () => (
  <svg viewBox="0 0 256 221" aria-hidden="true">
    <path
      fill="#41B883"
      d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0z"
    />
    <path fill="#35495E" d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0z" />
    <path
      fill="#35495E"
      d="M50.56 0L128 132.48 204.8 0h-47.36L128 51.2 97.92 0z"
    />
  </svg>
);

const AngularLogo: React.FC = () => (
  <svg viewBox="0 0 250 250" aria-hidden="true">
    <polygon
      fill="#DD0031"
      points="125,30 31.9,63.2 46.1,186.3 125,230 203.9,186.3 218.1,63.2"
    />
    <polygon fill="#C3002F" points="125,30 125,230 203.9,186.3 218.1,63.2" />
    <path
      fill="#FFF"
      d="M125 52.1L66.8 182.6h21.7l11.7-29.2h49.4l11.7 29.2H193L125 52.1zm17 83.3h-34l17-40.9 17 40.9z"
    />
  </svg>
);

const LOGOS: Record<FrameworkId, React.FC> = {
  react: ReactLogo,
  vue: VueLogo,
  angular: AngularLogo,
};

export const FrameworkLogo: React.FC<{ id: FrameworkId }> = ({ id }) => {
  const Logo = LOGOS[id];
  return <Logo />;
};
