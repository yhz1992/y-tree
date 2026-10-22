import React, { useEffect, useRef } from "react";
import type { FrameworkId } from "../App";

interface NeuralTreeCanvasProps {
  activeFw: FrameworkId;
}

interface TreeNodeParticle {
  id: number;
  parentId: number | null;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  depth: number;
  radius: number;
  phase: number;
  speed: number;
}

interface SignalPulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
}

const FW_PALETTE: Record<
  FrameworkId,
  { primary: [number, number, number]; secondary: [number, number, number] }
> = {
  react: {
    primary: [56, 189, 248], // Sky Cyan
    secondary: [16, 185, 129], // Emerald
  },
  vue: {
    primary: [52, 211, 153], // Emerald
    secondary: [56, 189, 248], // Cyan
  },
  angular: {
    primary: [251, 113, 133], // Rose
    secondary: [56, 189, 248], // Cyan
  },
};

export const NeuralTreeCanvas: React.FC<NeuralTreeCanvasProps> = ({
  activeFw,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fwRef = useRef<FrameworkId>(activeFw);
  fwRef.current = activeFw;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = { x: -9999, y: -9999, active: false };
    let nodes: TreeNodeParticle[] = [];
    let pulses: SignalPulse[] = [];

    // 构建左右对称向外生长的空间分形拓扑树节点
    const buildTopology = (w: number, h: number) => {
      nodes = [];
      pulses = [];

      // 移动端自动精简层级并向顶部两侧扩散，避免遮挡文字且保持满帧
      const isMobile = w < 760;
      const maxDepth = isMobile ? 3 : 4;
      const stepFactor = isMobile ? 0.14 : 0.075;

      const createCluster = (
        originX: number,
        originY: number,
        dirX: number,
        spreadY: number,
      ) => {
        const rootId = nodes.length;
        nodes.push({
          id: rootId,
          parentId: null,
          baseX: originX,
          baseY: originY,
          x: originX,
          y: originY,
          depth: 0,
          radius: 3.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.4,
        });

        let currentLevelIds = [rootId];

        for (let d = 1; d <= maxDepth; d++) {
          const nextLevelIds: number[] = [];
          const branchCount = d === 1 ? (isMobile ? 2 : 3) : 2;

          currentLevelIds.forEach((pId, idx) => {
            const parent = nodes[pId];
            for (let b = 0; b < branchCount; b++) {
              const id = nodes.length;
              const angleOffset =
                ((b - (branchCount - 1) / 2) / branchCount) *
                  (spreadY / Math.pow(d, 0.65)) +
                (idx - 0.5) * 18;
              const stepX =
                dirX *
                (w * (stepFactor + Math.random() * 0.035)) *
                (1.05 - d * 0.1);
              const bx = parent.baseX + stepX;
              const by =
                parent.baseY + angleOffset + (Math.random() - 0.5) * 36;

              nodes.push({
                id,
                parentId: pId,
                baseX: bx,
                baseY: by,
                x: bx,
                y: by,
                depth: d,
                radius: Math.max(1.3, 3.0 - d * 0.45),
                phase: Math.random() * Math.PI * 2,
                speed: 0.35 + Math.random() * 0.55,
              });
              nextLevelIds.push(id);
            }
          });
          currentLevelIds = nextLevelIds;
        }
      };

      // 左右两翼神经树簇，留出中央标题气场区，同时细枝向中心自然延伸
      createCluster(
        isMobile ? w * 0.02 : w * 0.08,
        isMobile ? h * 0.22 : h * 0.34,
        1,
        isMobile ? h * 0.32 : h * 0.42,
      );
      createCluster(
        isMobile ? w * 0.98 : w * 0.92,
        isMobile ? h * 0.22 : h * 0.34,
        -1,
        isMobile ? h * 0.32 : h * 0.42,
      );
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.floor(
        rect && rect.width > 0
          ? rect.width
          : document.documentElement.clientWidth,
      );
      height = Math.max(860, window.innerHeight * 1.05);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = "100%";
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildTopology(width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.y >= -100 && mouse.y <= height + 100;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      const palette = FW_PALETTE[fwRef.current];
      const [pr, pg, pb] = palette.primary;
      const [sr, sg, sb] = palette.secondary;

      // 随机发射沿树枝传导的 O(1) 信号脉冲
      if (pulses.length < 18 && Math.random() < 0.18 && nodes.length > 2) {
        const childIdx = 1 + Math.floor(Math.random() * (nodes.length - 1));
        const child = nodes[childIdx];
        if (child && child.parentId !== null) {
          // 50% 向下广播，50% 向上 O(1) 回溯父链
          const up = Math.random() > 0.45;
          pulses.push({
            fromIdx: up ? child.id : child.parentId,
            toIdx: up ? child.parentId : child.id,
            progress: 0,
            speed: 0.014 + Math.random() * 0.018,
          });
        }
      }

      // 更新节点呼吸坐标与鼠标引力场响应
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const floatX = Math.cos(time * n.speed + n.phase) * (5 + n.depth * 2.2);
        const floatY = Math.sin(time * n.speed + n.phase) * (6 + n.depth * 2.2);

        let targetX = n.baseX + floatX;
        let targetY = n.baseY + floatY;

        if (mouse.active) {
          const dx = mouse.x - targetX;
          const dy = mouse.y - targetY;
          const dist = Math.hypot(dx, dy);
          const maxDist = 260;
          if (dist < maxDist && dist > 1) {
            const pull = Math.pow(1 - dist / maxDist, 2) * 22;
            targetX += (dx / dist) * pull;
            targetY += (dy / dist) * pull;
          }
        }

        n.x += (targetX - n.x) * 0.08;
        n.y += (targetY - n.y) * 0.08;
      }

      // 1. 绘制父子拓扑曲线连线
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.parentId === null) continue;
        const p = nodes[n.parentId];

        const midX = (p.x + n.x) * 0.5;
        const alpha = Math.max(0.05, 0.22 - n.depth * 0.035);

        // 鼠标靠近时点亮连线
        let boost = 0;
        if (mouse.active) {
          const dMouse = Math.hypot(mouse.x - n.x, mouse.y - n.y);
          if (dMouse < 220) {
            boost = (1 - dMouse / 220) * 0.35;
          }
        }

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.bezierCurveTo(midX, p.y, midX, n.y, n.x, n.y);
        ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha + boost})`;
        ctx.stroke();
      }

      // 2. 绘制沿贝塞尔树枝高速穿梭的数据脉冲光点
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const a = nodes[pulse.fromIdx];
        const b = nodes[pulse.toIdx];
        if (!a || !b) continue;

        const t = pulse.progress;
        const mt = 1 - t;
        const midX = (a.x + b.x) * 0.5;

        // 三次贝塞尔插值坐标
        const px =
          mt * mt * mt * a.x +
          3 * mt * mt * t * midX +
          3 * mt * t * t * midX +
          t * t * t * b.x;
        const py =
          mt * mt * mt * a.y +
          3 * mt * mt * t * a.y +
          3 * mt * t * t * b.y +
          t * t * t * b.y;

        const glowAlpha = Math.sin(t * Math.PI);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 10);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * glowAlpha})`);
        grad.addColorStop(0.4, `rgba(${sr}, ${sg}, ${sb}, ${0.75 * glowAlpha})`);
        grad.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. 绘制树节点微光粒子
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let nodeAlpha = Math.max(0.2, 0.7 - n.depth * 0.11);

        if (mouse.active) {
          const dMouse = Math.hypot(mouse.x - n.x, mouse.y - n.y);
          if (dMouse < 200) {
            nodeAlpha = Math.min(1, nodeAlpha + (1 - dMouse / 200) * 0.5);
          }
        }

        // 外层柔和光晕
        const halo = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          n.radius * 4.5,
        );
        halo.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${nodeAlpha * 0.45})`);
        halo.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 节点亮核
        ctx.fillStyle = `rgba(248, 250, 252, ${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="neural-tree-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="neural-tree-canvas" />
    </div>
  );
};

