export default function CircuitBackground() {
  return (
    <svg className="circuit-bg" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#d97706" strokeWidth="0.4" fill="none" opacity="0.07">
        <path d="M0,100 L200,100 L200,150 L400,150" />
        <path d="M800,200 L600,200 L600,250 L300,250" />
        <path d="M100,0 L100,180 L150,180 L150,300" />
        <path d="M700,600 L700,400 L650,400 L650,200" />
        <path d="M0,400 L250,400 L250,350 L500,350" />
        <path d="M400,0 L400,80 L450,80 L450,200 L600,200" />
        <path d="M200,600 L200,500 L350,500 L350,420" />
        <circle cx="200" cy="100" r="3" fill="#d97706" opacity="0.4" />
        <circle cx="200" cy="150" r="3" fill="#d97706" opacity="0.4" />
        <circle cx="600" cy="200" r="3" fill="#d97706" opacity="0.4" />
        <circle cx="100" cy="180" r="3" fill="#d97706" opacity="0.4" />
        <circle cx="700" cy="400" r="3" fill="#d97706" opacity="0.4" />
        <circle cx="250" cy="400" r="3" fill="#d97706" opacity="0.4" />
        <circle cx="400" cy="80"  r="3" fill="#d97706" opacity="0.4" />
        <circle cx="350" cy="500" r="3" fill="#d97706" opacity="0.4" />
      </g>
    </svg>
  );
}
