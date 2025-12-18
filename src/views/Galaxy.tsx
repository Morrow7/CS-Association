import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Geometry, Program, Mesh, Color, Vec3 } from 'ogl';

interface GalaxyProps {
  mouseRepulsion?: boolean;
  mouseInteraction?: boolean;
  density?: number;
  glowIntensity?: number;
  saturation?: number;
  hueShift?: number;
  starSpeed?: number;
  rotationSpeed?: number;
  focal?: [number, number];
  rotation?: [number, number];
  transparent?: boolean;
}

export default function Galaxy({
  mouseRepulsion = true,
  mouseInteraction = true,
  density = 1,
  glowIntensity = 0.5,
  saturation = 0.9,
  hueShift = 240,
  starSpeed = 0.5,
  rotationSpeed = 0.1,
  focal = [0.5, 0.5],
  rotation = [1, 0],
  transparent = true,
}: GalaxyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: transparent });
    const gl = renderer.gl;
    if (!transparent) {
      gl.clearColor(0, 0, 0, 1);
    } else {
      gl.clearColor(0, 0, 0, 0);
    }

    const container = containerRef.current;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.set(0, 4, 10);
    camera.lookAt([0, 0, 0]);

    const scene = new Transform();

    const count = 3000 * density;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spiral logic
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 5;
      // Add some spiral arms structure
      const armAngle = angle + radius * 0.5;

      const x = Math.cos(armAngle) * radius;
      const y = (Math.random() - 0.5) * 0.5; // Flattened in Y
      const z = Math.sin(armAngle) * radius;

      positions.set([x, y, z], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random()], i * 3);

      // Base color
      const color = new Color([1, 1, 1]);
      colors.set(color, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 4, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const vertex = `
      precision highp float;
      attribute vec3 position;
      attribute vec3 random;
      attribute vec3 color;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float uTime;
      uniform float uStarSpeed;
      uniform float uHueShift;
      uniform float uSaturation;
      
      varying vec3 vColor;
      varying float vAlpha;

      // HSL to RGB helper
      float hue2rgb(float p, float q, float t) {
        if (t < 0.0) t += 1.0;
        if (t > 1.0) t -= 1.0;
        if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
        if (t < 1.0/2.0) return q;
        if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
        return p;
      }

      vec3 hsl2rgb(vec3 hsl) {
        float h = hsl.x;
        float s = hsl.y;
        float l = hsl.z;
        
        if (s == 0.0) {
            return vec3(l); // achromatic
        } else {
            float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
            float p = 2.0 * l - q;
            return vec3(hue2rgb(p, q, h + 1.0/3.0), hue2rgb(p, q, h), hue2rgb(p, q, h - 1.0/3.0));
        }
      }

      void main() {
        vec3 pos = position;
        
        // Rotate around center
        float angle = uTime * uStarSpeed * (0.1 + random.x * 0.1);
        float s = sin(angle);
        float c = cos(angle);
        
        float x = pos.x * c - pos.z * s;
        float z = pos.x * s + pos.z * c;
        pos.x = x;
        pos.z = z;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size attenuation
        gl_PointSize = (20.0 * random.y + 5.0) * (1.0 / -mvPosition.z);
        
        // Color calculation with hue shift and saturation
        float hue = uHueShift / 360.0 + random.z * 0.1;
        vec3 hsl = vec3(hue, uSaturation, 0.5 + random.y * 0.5);
        vColor = hsl2rgb(hsl);
        vAlpha = 0.5 + random.x * 0.5;
      }
    `;

    const fragment = `
      precision highp float;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uGlowIntensity;

      void main() {
        // Circular particle
        vec2 uv = gl_PointCoord.xy - 0.5;
        float dist = length(uv);
        if (dist > 0.5) discard;
        
        // Soft glow
        float glow = 1.0 - (dist * 2.0);
        glow = pow(glow, 1.5);
        
        gl_FragColor = vec4(vColor, vAlpha * glow * uGlowIntensity);
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uStarSpeed: { value: starSpeed },
        uHueShift: { value: hueShift },
        uSaturation: { value: saturation },
        uGlowIntensity: { value: glowIntensity * 5.0 } // Scale up for visibility
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    particles.setParent(scene);

    let animationId: number;
    let time = 0;

    // Mouse interaction
    const mouse = new Vec3(0, 0, 0);
    const targetMouse = new Vec3(0, 0, 0);

    const update = (t: number) => {
      time += 0.01;
      program.uniforms.uTime.value = time;

      if (mouseInteraction) {
        // Smooth mouse follow/rotation
        mouse.lerp(targetMouse, 0.05);
        scene.rotation.x = mouse.y * 0.5;
        scene.rotation.y = mouse.x * 0.5 + time * rotationSpeed;
      } else {
        scene.rotation.y = time * rotationSpeed;
      }

      renderer.render({ scene, camera });
      animationId = requestAnimationFrame(update);
    };

    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouse.set(x, y, 0);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    animationId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      if (container && container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [mouseRepulsion, mouseInteraction, density, glowIntensity, saturation, hueShift, starSpeed, rotationSpeed, transparent]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />;
}
