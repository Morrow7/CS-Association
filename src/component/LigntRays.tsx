import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

const DEFAULT_COLOR = '#ffffff';

type RaysOrigin =
    | 'top-left'
    | 'top-right'
    | 'left'
    | 'right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'top-center';

type Vec2 = [number, number];
type Vec3 = [number, number, number];

type Uniforms = {
    iTime: { value: number };
    iResolution: { value: Vec2 };
    rayPos: { value: Vec2 };
    rayDir: { value: Vec2 };
    raysColor: { value: Vec3 };
    raysSpeed: { value: number };
    lightSpread: { value: number };
    rayLength: { value: number };
    pulsating: { value: number };
    fadeDistance: { value: number };
    saturation: { value: number };
    mousePos: { value: Vec2 };
    mouseInfluence: { value: number };
    noiseAmount: { value: number };
    distortion: { value: number };
};

type LightRaysProps = {
    raysOrigin?: RaysOrigin;
    raysColor?: string;
    raysSpeed?: number;
    lightSpread?: number;
    rayLength?: number;
    pulsating?: boolean;
    fadeDistance?: number;
    saturation?: number;
    followMouse?: boolean;
    mouseInfluence?: number;
    noiseAmount?: number;
    distortion?: number;
    className?: string;
};

const hexToRgb = (hex: string): Vec3 => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [
            parseInt(m[1], 16) / 255,
            parseInt(m[2], 16) / 255,
            parseInt(m[3], 16) / 255
        ]
        : [1, 1, 1];
};

const getAnchorAndDir = (
    origin: RaysOrigin,
    w: number,
    h: number
): { anchor: Vec2; dir: Vec2 } => {
    const outside = 0.2;
    switch (origin) {
        case 'top-left':
            return { anchor: [0, -outside * h], dir: [0, 1] };
        case 'top-right':
            return { anchor: [w, -outside * h], dir: [0, 1] };
        case 'left':
            return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
        case 'right':
            return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
        case 'bottom-left':
            return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
        case 'bottom-center':
            return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
        case 'bottom-right':
            return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
        default:
            return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
    }
};

const LightRays = ({
    raysOrigin = 'top-center',
    raysColor = DEFAULT_COLOR,
    raysSpeed = 1,
    lightSpread = 1,
    rayLength = 2,
    pulsating = false,
    fadeDistance = 1.0,
    saturation = 1.0,
    followMouse = true,
    mouseInfluence = 0.1,
    noiseAmount = 0.0,
    distortion = 0.0,
    className = ''
}: LightRaysProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const uniformsRef = useRef<Uniforms | null>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const smoothMouseRef = useRef<{ x: number; y: number }>({
        x: 0.5,
        y: 0.5
    });
    const animationIdRef = useRef<number | null>(null);
    const meshRef = useRef<Mesh | null>(null);
    const cleanupFunctionRef = useRef<(() => void) | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const [isVisible, setIsVisible] = useState<boolean>(false);

    /** ================== Intersection Observer ================== */
    useEffect(() => {
        if (!containerRef.current) return;

        observerRef.current = new IntersectionObserver(
            entries => {
                setIsVisible(entries[0].isIntersecting);
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(containerRef.current);

        return () => {
            observerRef.current?.disconnect();
            observerRef.current = null;
        };
    }, []);

    /** ================== WebGL Init ================== */
    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        cleanupFunctionRef.current?.();

        const renderer = new Renderer({
            dpr: Math.min(window.devicePixelRatio, 2),
            alpha: true
        });

        rendererRef.current = renderer;

        const gl = renderer.gl;
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(gl.canvas);

        const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

        const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453);
}

float rayStrength(vec2 raySource, vec2 rayRefDir, vec2 coord,
                  float seedA, float seedB, float speed) {

  vec2 toCoord = coord - raySource;
  vec2 dirNorm = normalize(toCoord);
  float cosAngle = dot(dirNorm, rayRefDir);

  float distorted = cosAngle + distortion * sin(iTime * 2.0) * 0.2;
  float spread = pow(max(distorted, 0.0), 1.0 / max(lightSpread, 0.001));

  float dist = length(toCoord);
  float maxDist = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDist - dist) / maxDist, 0.0, 1.0);

  float pulse = pulsating > 0.5
      ? (0.8 + 0.2 * sin(iTime * speed * 3.0))
      : 1.0;

  float base =
      (0.45 + 0.15 * sin(distorted * seedA + iTime * speed)) +
      (0.3 + 0.2 * cos(-distorted * seedB + iTime * speed));

  return clamp(base, 0.0, 1.0) * lengthFalloff * spread * pulse;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);

  vec2 finalDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreen = mousePos * iResolution;
    vec2 mouseDir = normalize(mouseScreen - rayPos);
    finalDir = normalize(mix(rayDir, mouseDir, mouseInfluence));
  }

  float r1 = rayStrength(rayPos, finalDir, coord, 36.2, 21.1, raysSpeed * 1.5);
  float r2 = rayStrength(rayPos, finalDir, coord, 22.3, 18.0, raysSpeed * 1.1);

  vec3 color = (r1 * 0.5 + r2 * 0.4) * raysColor;

  if (noiseAmount > 0.0) {
    color *= mix(1.0, noise(coord * 0.01 + iTime), noiseAmount);
  }

  if (saturation != 1.0) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(g), color, saturation);
  }

  gl_FragColor = vec4(color, 1.0);
}`;

        const uniforms: Uniforms = {
            iTime: { value: 0 },
            iResolution: { value: [1, 1] as Vec2 },
            rayPos: { value: [0, 0] as Vec2 },
            rayDir: { value: [0, 1] as Vec2 },
            raysColor: { value: hexToRgb(raysColor) },
            raysSpeed: { value: raysSpeed },
            lightSpread: { value: lightSpread },
            rayLength: { value: rayLength },
            pulsating: { value: pulsating ? 1 : 0 },
            fadeDistance: { value: fadeDistance },
            saturation: { value: saturation },
            mousePos: { value: [0.5, 0.5] as Vec2 },
            mouseInfluence: { value: mouseInfluence },
            noiseAmount: { value: noiseAmount },
            distortion: { value: distortion }
        };

        uniformsRef.current = uniforms;

        const geometry = new Triangle(gl);
        const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
        meshRef.current = new Mesh(gl, { geometry, program });

        const resize = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            renderer.setSize(clientWidth, clientHeight);

            const dpr = renderer.dpr;
            uniforms.iResolution.value = [
                clientWidth * dpr,
                clientHeight * dpr
            ];

            const { anchor, dir } = getAnchorAndDir(
                raysOrigin,
                clientWidth * dpr,
                clientHeight * dpr
            );

            uniforms.rayPos.value = anchor;
            uniforms.rayDir.value = dir;
        };

        const loop = (t: number) => {
            if (!meshRef.current) return;
            uniforms.iTime.value = t * 0.001;
            try {
                renderer.render({ scene: meshRef.current });
                animationIdRef.current = requestAnimationFrame(loop);
            } catch (e) {
                console.warn('LightRays render error', e);
            }
        };

        resize();
        window.addEventListener('resize', resize);
        animationIdRef.current = requestAnimationFrame(loop);

        cleanupFunctionRef.current = () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            window.removeEventListener('resize', resize);
            renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
            rendererRef.current = null;
            uniformsRef.current = null;
            meshRef.current = null;
        };

        return () => {
            cleanupFunctionRef.current?.();
        };
    }, [isVisible, raysOrigin]);

    /** ================== Mouse ================== */
    useEffect(() => {
        if (!followMouse) return;

        const move = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mouseRef.current = {
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height
            };
        };

        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, [followMouse]);

    /** ================== Render ================== */
    return (
        <div
            ref={containerRef}
            className={`light-rays-container ${className}`.trim()}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                pointerEvents: 'none',
                zIndex: 3,
                overflow: 'hidden'
            }}
        />
    );
};

export default LightRays;
