import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable custom cursor on mobile/touch screens
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      
      // Move dot immediately
      gsap.to(dotRef.current, {
        x: clientX,
        y: clientY,
        duration: 0.1,
        ease: 'power2.out'
      });

      // Move ring with lag delay
      gsap.to(ringRef.current, {
        x: clientX,
        y: clientY,
        duration: 0.35,
        ease: 'power2.out'
      });
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    // Click hover interactions
    const addHoverState = () => {
      gsap.to(ringRef.current, { scale: 1.6, backgroundColor: 'rgba(255, 140, 0, 0.1)', duration: 0.2 });
      gsap.to(dotRef.current, { scale: 0.5, duration: 0.2 });
    };

    const removeHoverState = () => {
      gsap.to(ringRef.current, { scale: 1.0, backgroundColor: 'transparent', duration: 0.2 });
      gsap.to(dotRef.current, { scale: 1.0, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    const interactiveElements = document.querySelectorAll('a, button, select, input, textarea, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', addHoverState);
      el.addEventListener('mouseleave', removeHoverState);
    });

    // Observer to handle dynamic elements added later
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const targets = node.querySelectorAll('a, button, select, input, textarea, [role="button"]');
            if (node.matches('a, button, select, input, textarea, [role="button"]')) {
              node.addEventListener('mouseenter', addHoverState);
              node.addEventListener('mouseleave', removeHoverState);
            }
            targets.forEach(t => {
              t.addEventListener('mouseenter', addHoverState);
              t.addEventListener('mouseleave', removeHoverState);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', addHoverState);
        el.removeEventListener('mouseleave', removeHoverState);
      });
      observer.disconnect();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor fixed pointer-events-none z-[9999]" />
      <div ref={ringRef} className="custom-cursor-ring fixed pointer-events-none z-[9998]" />
    </>
  );
};

export default CustomCursor;
