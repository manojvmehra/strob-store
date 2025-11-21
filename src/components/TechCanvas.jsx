import React, { useEffect, useRef } from 'react';

const TechCanvas = ({ isDarkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    let mouse = { x: -1000, y: -1000 }; 

    const lines = [];
    const gap = 30; 
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initLines();
    };

    const initLines = () => {
      lines.length = 0;
      for (let y = 0; y < canvas.height + gap; y += gap) {
        lines.push({
          baseY: y,
          amplitude: 15 + Math.random() * 15,
          speed: 0.002 + Math.random() * 0.002,
          frequency: 0.005 + Math.random() * 0.005,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1.5;

      lines.forEach(line => {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 10) {
          let y = line.baseY + Math.sin(x * line.frequency + time * line.speed + line.phase) * line.amplitude;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const interactionRadius = 200;

          if (dist < interactionRadius) {
            const force = (interactionRadius - dist) / interactionRadius;
            y += Math.sin(force * Math.PI) * (mouse.y > line.baseY ? -40 : 40); 
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      time += 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="absolute top-0 right-0 w-full md:w-2/3 h-full pointer-events-auto opacity-60" />;
};

export default TechCanvas;