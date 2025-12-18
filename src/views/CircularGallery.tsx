import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Camera, Transform, Plane, Program, Mesh, Texture, Vec3 } from 'ogl';

interface CircularGalleryProps {
  items: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollEase?: number;
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "10px sans-serif",
  scrollEase = 0.05
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<null | typeof items[0]>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const container = containerRef.current;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl);
    camera.fov = 45;
    camera.position.z = 20;

    const scene = new Transform();

    const geometry = new Plane(gl, { width: 6, height: 8, widthSegments: 20, heightSegments: 20 });

    const vertex = `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float uTime;
      uniform float uSpeed;
      uniform float uBend;
      
      varying vec2 vUv;
      varying float vBend;

      void main() {
        vUv = uv;
        vec3 p = position;
        
        // Simple bending effect based on x position
        // This is an approximation of the circular effect
        float theta = p.x * 0.5 * uBend; 
        p.z += sin(theta) * 2.0;
        p.x -= sin(theta) * 0.5;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `;

    const fragment = `
      precision highp float;
      uniform sampler2D tMap;
      uniform float uRadius;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        
        vec4 color = texture2D(tMap, uv);
        
        gl_FragColor = color;
      }
    `;

    // Load textures
    const textures = items.map(item => {
      const texture = new Texture(gl);
      const img = new Image();
      img.src = item.image;
      img.onload = () => {
        texture.image = img;
      };
      return texture;
    });

    const meshes: Mesh[] = [];
    const gap = 7.0;
    const totalWidth = items.length * gap;

    items.forEach((item, i) => {
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: textures[i] },
          uBend: { value: bend },
          uRadius: { value: borderRadius }
        },
        transparent: true,
        cullFace: null
      });

      const mesh = new Mesh(gl, { geometry, program });
      mesh.position.x = i * gap;
      mesh.setParent(scene);
      meshes.push(mesh);
    });

    let scroll = 0;
    let scrollTarget = 0;
    let isDown = false;
    let isDragging = false;
    let startX = 0;
    let lastX = 0;

    // Auto scroll speed
    const autoScrollSpeed = 0.01;

    const update = () => {
      // Auto scroll logic: constantly increase target
      if (!isDragging && !isDown) {
        scrollTarget -= autoScrollSpeed;
      }

      // Smooth scroll
      scroll += (scrollTarget - scroll) * scrollEase;

      // Infinite loop logic
      meshes.forEach((mesh, i) => {
        const x = (i * gap) + scroll;
        // Wrap around
        const centeredX = ((x % totalWidth) + totalWidth) % totalWidth;
        mesh.position.x = centeredX - totalWidth / 2;
      });

      renderer.render({ scene, camera });
      requestAnimationFrame(update);
    };

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    const animationId = requestAnimationFrame(update);

    // Interaction
    const onTouchStart = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      isDragging = false;
      const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      startX = x;
      lastX = x;
    };

    const onTouchMove = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;

      if (!isDragging) {
        const dx = Math.abs(x - startX);
        if (dx > 5) {
          isDragging = true;
        }
      }

      if (isDragging) {
        const delta = (x - lastX) * 0.01;
        scrollTarget += delta;
        lastX = x;
      }
    };

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const x = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const y = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      // Convert to NDC
      const mouseX = (x / gl.canvas.width) * 2 - 1;
      const mouseY = -(y / gl.canvas.height) * 2 + 1;

      // Find match
      let bestDist = Infinity;
      let bestIndex = -1;

      meshes.forEach((mesh, i) => {
        const p = new Vec3().copy(mesh.position);
        // Project mesh position to NDC
        camera.project(p);

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if within bounds (approximate)
        if (dist < 0.5 && dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      });

      if (bestIndex !== -1) {
        setSelectedItem(items[bestIndex]);
      }
    };

    const onTouchEnd = (e: MouseEvent | TouchEvent) => {
      isDown = false;
      if (!isDragging) {
        handleClick(e);
      }
      isDragging = false;
    };

    container.addEventListener('mousedown', onTouchStart);
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('mouseup', onTouchEnd);
    container.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousedown', onTouchStart);
      window.removeEventListener('mousemove', onTouchMove);
      window.removeEventListener('mouseup', onTouchEnd);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [items, bend, borderRadius, scrollEase]);

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: 'grab' }} />
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '80%', maxHeight: '80%', transform: 'scale(1)', transition: 'transform 0.3s' }}>
            <img
              src={selectedItem.image}
              alt={selectedItem.text}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '0',
              width: '100%',
              textAlign: 'center',
              color: 'white',
              fontFamily: 'sans-serif',
              fontSize: '18px',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {selectedItem.text}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
