'use client'

import { Film, Play, Ticket } from 'lucide-react'

// This component is self-contained and renders the moving SVG shapes.
export function BackgroundAnimation() {
  // We use simple divs with SVG fills to create the shapes for better performance.
  // Using Lucide icons directly for animation can be less performant.
  const shapes = [
    { icon: <Film />, size: 'w-16 h-16', top: '15%', left: '10%', delay: '0s', duration: '25s' },
    { icon: <Play />, size: 'w-10 h-10', top: '20%', left: '80%', delay: '-5s', duration: '30s' },
    { icon: <Ticket />, size: 'w-20 h-20', top: '75%', left: '20%', delay: '-8s', duration: '35s' },
    { icon: <Film />, size: 'w-8 h-8', top: '80%', left: '90%', delay: '-12s', duration: '20s' },
    { icon: <Play />, size: 'w-24 h-24', top: '50%', left: '50%', delay: '-2s', duration: '40s' },
    { icon: <Ticket />, size: 'w-12 h-12', top: '5%', left: '40%', delay: '-15s', duration: '28s' },
  ];

  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden" aria-hidden="true">
      {shapes.map((shape, index) => (
        <div
          key={index}
          className="floating-shape absolute text-cyan-400/20"
          style={{
            width: shape.size.split(' ')[0].replace('w-', ''),
            height: shape.size.split(' ')[1].replace('h-', ''),
            top: shape.top,
            left: shape.left,
            animationDelay: shape.delay,
            animationDuration: shape.duration,
          }}
        >
          {shape.icon}
        </div>
      ))}
    </div>
  );
}


