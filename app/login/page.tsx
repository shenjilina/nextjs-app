"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/lib/i18n";
import useFetch from "@/lib/hooks/useFetch";
import { cn } from "@/lib/utils";
import { deleteCookie, setCookie } from "@/lib/utils/storage";

type VisualTheme = {
  primary: string;
  primary2: string;
  glow: string;
  bg: {
    a: string;
    b: string;
    c: string;
  };
};

const JUDY_THEME: VisualTheme = {
  primary: "#6A0DAD",
  primary2: "#8B5CF6",
  glow: "#1E3A8A",
  bg: { a: "#0B0420", b: "#1E3A8A", c: "#05030D" }
};

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "login.validation.usernameRequired")
    .max(64, "login.validation.usernameTooLong"),
  password: z
    .string()
    .min(6, "login.validation.passwordTooShort")
    .max(128, "login.validation.passwordTooLong")
});

type LoginFormState = z.infer<typeof loginSchema> & { remember: boolean };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeCanvas(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");
  return { canvas, ctx };
}

function createParticleTexture(color: string) {
  const { canvas, ctx } = makeCanvas(256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `${color}FF`);
  g.addColorStop(0.2, `${color}CC`);
  g.addColorStop(0.5, `${color}55`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

function createIconTexture() {
  const { canvas, ctx } = makeCanvas(256);
  ctx.clearRect(0, 0, 256, 256);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(255,255,255,0)";
  ctx.fillRect(0, 0, 256, 256);
  ctx.translate(128, 128);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(-52, 0, 46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(52, 0, 46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(6, -34);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 44;
    const y = Math.sin(angle) * 44;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  return canvas;
}

function createSilhouetteTexture(theme: VisualTheme) {
  const { canvas, ctx } = makeCanvas(1024);
  ctx.clearRect(0, 0, 1024, 1024);
  ctx.translate(512, 512);

  const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, 520);
  bg.addColorStop(0, "rgba(255,255,255,0.12)");
  bg.addColorStop(0.35, "rgba(255,255,255,0.06)");
  bg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(0, 0, 520, 0, Math.PI * 2);
  ctx.fill();

  const silhouette = ctx.createLinearGradient(-260, -420, 260, 420);
  silhouette.addColorStop(0, `${theme.glow}CC`);
  silhouette.addColorStop(0.5, `${theme.primary2}B3`);
  silhouette.addColorStop(1, `${theme.primary}99`);

  ctx.shadowColor = `${theme.glow}80`;
  ctx.shadowBlur = 60;

  ctx.fillStyle = silhouette;
  ctx.beginPath();
  ctx.ellipse(-170, -240, 80, 200, -0.15, 0, Math.PI * 2);
  ctx.ellipse(170, -240, 80, 200, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, 40, 260, 300, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 30;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 180, 210, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 60;
  ctx.fillStyle = silhouette;
  ctx.beginPath();
  ctx.moveTo(-230, -40);
  ctx.quadraticCurveTo(0, -190, 230, -40);
  ctx.quadraticCurveTo(120, -90, 0, -70);
  ctx.quadraticCurveTo(-120, -90, -230, -40);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 34;
    const y = Math.sin(angle) * 34 - 120;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  return canvas;
}

type SceneController = {
  setPointer: (x: number, y: number) => void;
  burst: (x: number, y: number) => void;
  dispose: () => void;
};

function useThreeLoginScene(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  theme: VisualTheme,
  onReady: () => void
) {
  const controllerRef = useRef<SceneController | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const THREE = (await import("three")) as any;
      if (cancelled) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance"
      });
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
      camera.position.set(0, 0, 160);

      const particleGroup = new THREE.Group();
      const iconGroup = new THREE.Group();
      const heroGroup = new THREE.Group();
      scene.add(particleGroup);
      scene.add(iconGroup);
      scene.add(heroGroup);

      const reducedMotion =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const density = clamp((window.innerWidth || 1024) / 1440, 0.55, 1);
      const particleCount = Math.round((reducedMotion ? 2400 : 4200) * density);
      const box = { x: 260, y: 170, z: 240 };
      const pos = new Float32Array(particleCount * 3);
      const vel = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pos[i3 + 0] = (Math.random() - 0.5) * box.x;
        pos[i3 + 1] = (Math.random() - 0.5) * box.y;
        pos[i3 + 2] = (Math.random() - 0.5) * box.z;
        const speed = 0.08 + Math.random() * 0.28;
        vel[i3 + 0] = (Math.random() - 0.5) * speed;
        vel[i3 + 1] = (Math.random() - 0.5) * speed;
        vel[i3 + 2] = (Math.random() - 0.5) * speed;
      }

      const particleGeom = new THREE.BufferGeometry();
      particleGeom.setAttribute("position", new THREE.BufferAttribute(pos, 3));

      const particleTexCanvas = createParticleTexture("#FFFFFF");
      const particleTexture = new THREE.CanvasTexture(particleTexCanvas);
      particleTexture.needsUpdate = true;

      const particleMaterial = new THREE.PointsMaterial({
        size: 1.8,
        map: particleTexture,
        transparent: true,
        opacity: 0.75,
        color: new THREE.Color(theme.primary2),
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const particles = new THREE.Points(particleGeom, particleMaterial);
      particleGroup.add(particles);

      const iconCount = 140;
      const iconPos = new Float32Array(iconCount * 3);
      const iconVel = new Float32Array(iconCount * 3);
      for (let i = 0; i < iconCount; i++) {
        const i3 = i * 3;
        iconPos[i3 + 0] = (Math.random() - 0.5) * 260;
        iconPos[i3 + 1] = (Math.random() - 0.5) * 180;
        iconPos[i3 + 2] = (Math.random() - 0.5) * 220;
        const speed = 0.04 + Math.random() * 0.16;
        iconVel[i3 + 0] = (Math.random() - 0.5) * speed;
        iconVel[i3 + 1] = (Math.random() - 0.5) * speed;
        iconVel[i3 + 2] = (Math.random() - 0.5) * speed;
      }
      const iconGeomA = new THREE.BufferGeometry();
      iconGeomA.setAttribute("position", new THREE.BufferAttribute(iconPos, 3));

      const iconTexA = new THREE.CanvasTexture(createIconTexture());
      iconTexA.needsUpdate = true;
      const iconMatA = new THREE.PointsMaterial({
        size: 10,
        map: iconTexA,
        transparent: true,
        opacity: 0.48,
        color: new THREE.Color(theme.glow),
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const iconsA = new THREE.Points(iconGeomA, iconMatA);
      iconGroup.add(iconsA);

      const spriteMatA = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(createSilhouetteTexture(theme)),
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      });
      const spriteA = new THREE.Sprite(spriteMatA);
      spriteA.scale.set(150, 150, 1);
      heroGroup.add(spriteA);

      const pointer = { x: 0, y: 0 };

      const bursts: {
        points: any;
        geom: any;
        mat: any;
        vel: Float32Array;
        start: number;
        duration: number;
      }[] = [];

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = canvas;
        const width = Math.max(1, w);
        const height = Math.max(1, h);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const ro = new ResizeObserver(() => resize());
      ro.observe(canvas);
      resize();

      const setPointer = (x: number, y: number) => {
        pointer.x = clamp(x, -1, 1);
        pointer.y = clamp(y, -1, 1);
      };

      const burst = (x: number, y: number) => {
        const world = new THREE.Vector3(x, y, 0.5).unproject(camera);
        const dir = world.sub(camera.position).normalize();
        const dist = (0 - camera.position.z) / dir.z;
        const hit = camera.position.clone().add(dir.multiplyScalar(dist));

        const count = 280;
        const bPos = new Float32Array(count * 3);
        const bVel = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          bPos[i3 + 0] = hit.x;
          bPos[i3 + 1] = hit.y;
          bPos[i3 + 2] = hit.z;
          const a = Math.random() * Math.PI * 2;
          const u = Math.random() * 2 - 1;
          const r = Math.sqrt(1 - u * u);
          const sp = 0.8 + Math.random() * 1.9;
          bVel[i3 + 0] = Math.cos(a) * r * sp;
          bVel[i3 + 1] = u * sp;
          bVel[i3 + 2] = Math.sin(a) * r * sp;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
        const mat = new THREE.PointsMaterial({
          size: 2.6,
          map: particleTexture,
          transparent: true,
          opacity: 0.85,
          color: new THREE.Color(theme.glow),
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const pts = new THREE.Points(geom, mat);
        scene.add(pts);
        bursts.push({ points: pts, geom, mat, vel: bVel, start: performance.now(), duration: 900 });
      };

      let raf = 0;
      let last = performance.now();
      let markedReady = false;

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const now = performance.now();
        const dt = clamp((now - last) / 16.6667, 0.2, 2);
        last = now;

        const p = particleGeom.getAttribute("position") as any;
        const arr = p.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          arr[i3 + 0] += vel[i3 + 0] * dt;
          arr[i3 + 1] += vel[i3 + 1] * dt;
          arr[i3 + 2] += vel[i3 + 2] * dt;

          if (arr[i3 + 0] < -box.x / 2) arr[i3 + 0] = box.x / 2;
          if (arr[i3 + 0] > box.x / 2) arr[i3 + 0] = -box.x / 2;
          if (arr[i3 + 1] < -box.y / 2) arr[i3 + 1] = box.y / 2;
          if (arr[i3 + 1] > box.y / 2) arr[i3 + 1] = -box.y / 2;
          if (arr[i3 + 2] < -box.z / 2) arr[i3 + 2] = box.z / 2;
          if (arr[i3 + 2] > box.z / 2) arr[i3 + 2] = -box.z / 2;
        }
        p.needsUpdate = true;

        const ip = iconGeomA.getAttribute("position") as any;
        const ia = ip.array as Float32Array;
        for (let i = 0; i < iconCount; i++) {
          const i3 = i * 3;
          ia[i3 + 0] += iconVel[i3 + 0] * dt;
          ia[i3 + 1] += iconVel[i3 + 1] * dt;
          ia[i3 + 2] += iconVel[i3 + 2] * dt;

          if (ia[i3 + 0] < -260 / 2) ia[i3 + 0] = 260 / 2;
          if (ia[i3 + 0] > 260 / 2) ia[i3 + 0] = -260 / 2;
          if (ia[i3 + 1] < -180 / 2) ia[i3 + 1] = 180 / 2;
          if (ia[i3 + 1] > 180 / 2) ia[i3 + 1] = -180 / 2;
          if (ia[i3 + 2] < -220 / 2) ia[i3 + 2] = 220 / 2;
          if (ia[i3 + 2] > 220 / 2) ia[i3 + 2] = -220 / 2;
        }
        ip.needsUpdate = true;

        particleGroup.rotation.y = lerp(particleGroup.rotation.y, pointer.x * 0.35, 0.06);
        particleGroup.rotation.x = lerp(particleGroup.rotation.x, -pointer.y * 0.25, 0.06);

        iconGroup.rotation.y += 0.0015 * dt;
        heroGroup.rotation.z += 0.0012 * dt;

        camera.position.x = lerp(camera.position.x, pointer.x * 10, 0.08);
        camera.position.y = lerp(camera.position.y, pointer.y * 8, 0.08);
        camera.lookAt(0, 0, 0);

        for (let i = bursts.length - 1; i >= 0; i--) {
          const b = bursts[i];
          const bt = (now - b.start) / b.duration;
          const tt = clamp(bt, 0, 1);
          const ease = 1 - (1 - tt) * (1 - tt);

          const attr = b.geom.getAttribute("position") as any;
          const barr = attr.array as Float32Array;
          for (let j = 0; j < barr.length / 3; j++) {
            const j3 = j * 3;
            barr[j3 + 0] += b.vel[j3 + 0] * dt;
            barr[j3 + 1] += b.vel[j3 + 1] * dt;
            barr[j3 + 2] += b.vel[j3 + 2] * dt;
            b.vel[j3 + 0] *= 0.95;
            b.vel[j3 + 1] *= 0.95;
            b.vel[j3 + 2] *= 0.95;
          }
          attr.needsUpdate = true;
          b.mat.opacity = 0.85 * (1 - ease);
          b.mat.size = 2.6 + ease * 1.8;

          if (bt >= 1) {
            scene.remove(b.points);
            b.geom.dispose();
            b.mat.dispose();
            bursts.splice(i, 1);
          }
        }

        renderer.render(scene, camera);

        if (!markedReady) {
          markedReady = true;
          onReady();
        }
      };

      animate();

      controllerRef.current = {
        setPointer,
        burst,
        dispose: () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          bursts.splice(0, bursts.length).forEach((b) => {
            scene.remove(b.points);
            b.geom.dispose();
            b.mat.dispose();
          });
          particleGeom.dispose();
          particleMaterial.dispose();
          particleTexture.dispose();
          iconGeomA.dispose();
          iconMatA.dispose();
          (spriteMatA.map as any)?.dispose?.();
          spriteMatA.dispose();
          renderer.dispose();
        }
      };

      cleanup = () => controllerRef.current?.dispose();
    };

    init().catch(() => {
      onReady();
    });

    return () => {
      cancelled = true;
      cleanup?.();
      controllerRef.current = null;
    };
  }, [canvasRef, onReady, theme]);

  return controllerRef;
}

function ThreeBackdrop({ theme, onReady }: { theme: VisualTheme; onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useThreeLoginScene(canvasRef, theme, onReady);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      controllerRef.current?.setPointer(x, y);
    };
    const onDown = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      controllerRef.current?.burst(x, y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [controllerRef]);

  return (
    <>
      <ZootopiaBackdrop />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(900px 640px at 18% 10%, ${theme.primary}24, transparent 60%), radial-gradient(900px 740px at 82% 30%, ${theme.glow}26, transparent 58%)`
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_50%_15%,rgba(255,255,255,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),rgba(0,0,0,0.55))]" />
    </>
  );
}

function Skyline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
      <path
        d="M0 260L60 250C120 240 240 220 360 204C480 188 600 176 720 170C840 164 960 164 1080 176C1200 188 1320 212 1380 224L1440 236V320H0V260Z"
        fill="#1E3A8A"
        fillOpacity="0.30"
      />
      <path
        d="M0 250L48 252C96 254 192 258 288 242C384 226 480 190 576 168C672 146 768 138 864 154C960 170 1056 210 1152 214C1248 218 1344 186 1392 170L1440 154V320H0V250Z"
        fill="#0B1020"
        fillOpacity="0.55"
      />
      <path
        d="M0 240H80V150H120V210H160V130H220V200H260V120H320V170H360V110H420V200H460V140H520V180H560V120H620V210H700V140H760V200H820V110H900V170H940V130H1000V220H1060V150H1120V200H1180V120H1260V210H1320V150H1380V230H1440V240V320H0V240Z"
        fill="#111827"
        fillOpacity="0.55"
      />
      <path
        d="M0 252H90V176H130V220H170V150H240V214H290V160H340V200H390V140H460V228H520V170H580V210H640V150H710V224H770V176H840V218H900V148H980V240H1060V176H1140V220H1210V160H1300V236H1380V186H1440V252V320H0V252Z"
        fill="#E5E7EB"
        fillOpacity="0.20"
      />
    </svg>
  );
}

function BunnyPawIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.2 10.6c1 0 1.7-.8 1.7-1.9 0-1-.7-1.9-1.7-1.9S5.5 7.7 5.5 8.7c0 1.1.7 1.9 1.7 1.9Zm9.6 0c1 0 1.7-.8 1.7-1.9 0-1-.7-1.9-1.7-1.9s-1.7.8-1.7 1.9c0 1 .7 1.9 1.7 1.9ZM12 9.8c1.1 0 2-1 2-2.2 0-1.2-.9-2.2-2-2.2s-2 1-2 2.2c0 1.2.9 2.2 2 2.2Zm0 11c3.7 0 7-2 7-4.9 0-2.3-2.3-3.8-4.4-4.7-.8-.3-1.7-.1-2.6.4-.9-.5-1.8-.7-2.6-.4-2.1.9-4.4 2.4-4.4 4.7 0 2.9 3.3 4.9 7 4.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ZootopiaBackdrop() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px 700px at 22% 18%, rgba(106,13,173,0.60), transparent 55%), radial-gradient(920px 680px at 78% 22%, rgba(30,58,138,0.38), transparent 60%), linear-gradient(180deg, #0B1020, #05030D)"
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[46vh]">
        <Skyline className="absolute inset-0 h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_22%,rgba(229,231,235,0.08),transparent_62%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.22),rgba(0,0,0,0.62))]" />
    </div>
  );
}

export default function LoginPage() {
  const { t, lang, setLanguage } = useI18n();
  const { post } = useFetch();
  const [sceneReady, setSceneReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [loginSuccess, setLoginSuccess] = useState<string | undefined>();
  const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);

  const theme = JUDY_THEME;
  const PawIcon = BunnyPawIcon;

  const form = useForm<LoginFormState>({
    defaultValues: { username: "", password: "", remember: true },
    mode: "onChange"
  });

  const rules = useMemo(
    () => ({
      username: {
        validate: (value: string) => {
          const result = loginSchema.shape.username.safeParse(value);
          if (result.success) return true;
          return result.error.issues[0]?.message || "login.validation.invalid";
        }
      },
      password: {
        validate: (value: string) => {
          const result = loginSchema.shape.password.safeParse(value);
          if (result.success) return true;
          return result.error.issues[0]?.message || "login.validation.invalid";
        }
      }
    }),
    []
  );

  const onSubmit = useCallback(
    async (values: LoginFormState) => {
      try {
        setSubmitting(true);
        setGlobalError(undefined);
        setLoginSuccess(undefined);

        const res = (await post(
          "/api/v1/login",
          { email: values.username, username: values.username, password: values.password },
          { headers: { "Content-Type": "application/json" } }
        )) as any;

        const token = res?.data?.token ?? res?.data?.data?.token ?? res?.token;
        const userId = res?.data?.userId ?? res?.data?.data?.userId ?? res?.userId;

        if (values.remember) {
          if (token) setCookie("auth_token", String(token), { expires: 14 });
          if (userId) setCookie("auth_user", String(userId), { expires: 14 });
        } else {
          deleteCookie("auth_token");
          deleteCookie("auth_user");
        }

        setLoginSuccess("login.success");
      } catch (error) {
        setGlobalError(error instanceof Error ? "login.failure" : "login.failure");
      } finally {
        setSubmitting(false);
      }
    },
    [post]
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ThreeBackdrop theme={theme} onReady={() => setSceneReady(true)} />

      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <Button
          type="button"
          variant={lang === "zh" ? "default" : "secondary"}
          className="rounded-full px-3"
          onClick={() => setLanguage("zh")}
        >
          中文
        </Button>
        <Button
          type="button"
          variant={lang === "en" ? "default" : "secondary"}
          className="rounded-full px-3"
          onClick={() => setLanguage("en")}
        >
          EN
        </Button>
      </div>

      {!sceneReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur">
            <Spinner className="text-white/90" />
            <span>{t("login.loading3d")}</span>
          </div>
        </div>
      )}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="mx-auto w-[400px] max-w-2xl">
          <div className="items-center gap-10">
            <div className="w-full">
              <div className="rounded-2xl border border-white/10 bg-[#E5E7EB]/10 p-6 shadow-[0_22px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
                <div className="space-y-1 text-center">
                  <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: theme.primary2 }}
                    />
                    <span>{t("login.judySubtitle")}</span>
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    {t("login.title")}
                  </h1>
                  <p className="text-sm text-white/75">{t("login.tagline")}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                      <FormField
                        name="username"
                        rules={rules.username}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">{t("login.username")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder={t("login.usernamePlaceholder")}
                                  {...field}
                                  disabled={submitting}
                                  aria-invalid={!!fieldState.error}
                                  className="h-11 border-white/10 bg-[#E5E7EB]/10 pr-10 text-white placeholder:text-white/50 focus-visible:ring-[rgba(229,231,235,0.20)]"
                                  onFocus={() => setFocusedField("username")}
                                  onBlur={() => {
                                    setFocusedField(null);
                                    field.onBlur();
                                  }}
                                  onChange={(event) => {
                                    setGlobalError(undefined);
                                    setLoginSuccess(undefined);
                                    field.onChange(event);
                                  }}
                                />
                                <PawIcon
                                  className={cn(
                                    "pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 drop-shadow-sm transition-all duration-200",
                                    "text-[#6A0DAD]/85",
                                    focusedField === "username"
                                      ? "opacity-100 scale-100"
                                      : "opacity-0 scale-90"
                                  )}
                                />
                              </div>
                            </FormControl>
                            {fieldState.error && (
                              <FormMessage>{t(fieldState.error.message)}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="password"
                        rules={rules.password}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">{t("login.password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="password"
                                  placeholder={t("login.passwordPlaceholder")}
                                  {...field}
                                  disabled={submitting}
                                  aria-invalid={!!fieldState.error}
                                  className="h-11 border-white/10 bg-[#E5E7EB]/10 pr-10 text-white placeholder:text-white/50 focus-visible:ring-[rgba(229,231,235,0.20)]"
                                  onFocus={() => setFocusedField("password")}
                                  onBlur={() => {
                                    setFocusedField(null);
                                    field.onBlur();
                                  }}
                                  onChange={(event) => {
                                    setGlobalError(undefined);
                                    setLoginSuccess(undefined);
                                    field.onChange(event);
                                  }}
                                />
                                <PawIcon
                                  className={cn(
                                    "pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 drop-shadow-sm transition-all duration-200",
                                    "text-[#6A0DAD]/85",
                                    focusedField === "password"
                                      ? "opacity-100 scale-100"
                                      : "opacity-0 scale-90"
                                  )}
                                />
                              </div>
                            </FormControl>
                            {fieldState.error && (
                              <FormMessage>{t(fieldState.error.message)}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="remember"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-white/80">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="size-4 rounded border-white/25 bg-[#E5E7EB]/10 accent-white/90"
                              />
                              {t("login.remember")}
                            </label>
                            <Link
                              href="#"
                              className="text-sm text-white/85 underline-offset-4 hover:underline"
                            >
                              {t("login.forgotPassword")}
                            </Link>
                          </div>
                        )}
                      />

                      {globalError && (
                        <FormMessage className="text-center">{t(globalError)}</FormMessage>
                      )}
                      {loginSuccess && (
                        <div className="text-center text-xs text-white/90">{t(loginSuccess)}</div>
                      )}

                      <Button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                          "h-12 w-full rounded-none font-semibold tracking-wide shadow-[0_18px_44px_-24px_rgba(0,0,0,0.95)] transition-transform active:translate-y-0.5 active:scale-[0.99]",
                          "focus-visible:ring-[rgba(229,231,235,0.22)]"
                        )}
                        style={{
                          backgroundColor: theme.primary,
                          color: "#fff"
                        }}
                      >
                        {submitting && <Spinner className="text-current" />}
                        {t("login.submit")}
                      </Button>
                    </form>
                  </Form>
                </div>

                <div className="mt-6 text-center text-xs text-white/60">
                  {t("login.hintInteraction")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
