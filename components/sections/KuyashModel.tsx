"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const NODES = [
  {
    label: "CROPS",
    sub: ["Field crops &", "production"],
    angle: -90, // 12 o'clock
    labelSide: "right",
  },
  {
    label: "LIVESTOCK",
    sub: ["Cattle, Sheep &", "Animal Rearing"],
    angle: -18, // 2–3 o'clock
    labelSide: "right",
  },
  {
    label: "AQUACULTURE",
    sub: ["Catfish Production", "& Fish Ponds"],
    angle: 54, // 4–5 o'clock
    labelSide: "right",
  },
  {
    label: "PROCESSING",
    sub: ["Value Addition &", "Food Processing"],
    angle: 126, // 7–8 o'clock
    labelSide: "left",
  },
  {
    label: "HORTICULTURE",
    sub: ["Vegetables, Fruits &", "Greenhouse Farming"],
    angle: 198, // 9–10 o'clock
    labelSide: "left",
  },
];

// SVG canvas center and radii
const VW = 700;
const VH = 560;
const CX = 350;
const CY = 280;
const ORBIT_R = 185;   // orbit of nodes
const NODE_R  = 32;    // node circle radius
const CENTER_R = 80;   // center circle radius

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Leaf icon centered at (cx, cy) with given size
function LeafIcon({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s}) scale(${size / 24})`}>
      <path
        d="M12 2C8 2 4 6 4 11c0 3.5 2 6.5 5 8l-1 3h8l-1-3c3-1.5 5-4.5 5-8 0-5-4-9-8-9zm0 2c2.5 2 5 5 5 7a5 5 0 0 1-10 0c0-2 2.5-5 5-7z"
        fill="none"
        stroke="var(--primary-green)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line x1="12" y1="13" x2="12" y2="22" stroke="var(--primary-green)" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

// Cow-head icon for LIVESTOCK
function CowIcon({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s}) scale(${size / 24})`}>
      <path
        d="M4 6 C2 6 2 10 4 10 L4 14 C4 18 8 20 12 20 C16 20 20 18 20 14 L20 10 C22 10 22 6 20 6 L18 6 C17 4 15 3 12 3 C9 3 7 4 6 6 Z"
        fill="none" stroke="var(--primary-green)" strokeWidth="1.4" strokeLinejoin="round"
      />
      <circle cx="9" cy="12" r="1.2" fill="var(--primary-green)" />
      <circle cx="15" cy="12" r="1.2" fill="var(--primary-green)" />
      <path d="M10 16 Q12 17.5 14 16" fill="none" stroke="var(--primary-green)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

// Fish icon for AQUACULTURE
function FishIcon({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s}) scale(${size / 24})`}>
      <path
        d="M2 12 C2 12 6 5 14 5 C14 5 20 5 21 12 C20 19 14 19 14 19 C6 19 2 12 2 12Z"
        fill="none" stroke="var(--primary-green)" strokeWidth="1.4" strokeLinejoin="round"
      />
      <path d="M21 12 L24 9 M21 12 L24 15" fill="none" stroke="var(--primary-green)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1.3" fill="var(--primary-green)" />
    </g>
  );
}

// Gear icon for PROCESSING
function GearIcon({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s}) scale(${size / 24})`}>
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="var(--primary-green)" strokeWidth="1.4" />
      <path
        d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"
        stroke="var(--primary-green)" strokeWidth="1.4" strokeLinecap="round"
      />
    </g>
  );
}

// Plant/seedling icon for HORTICULTURE
function PlantIcon({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s}) scale(${size / 24})`}>
      <path
        d="M12 22 L12 10"
        stroke="var(--primary-green)" strokeWidth="1.4" strokeLinecap="round"
      />
      <path
        d="M12 10 C12 10 6 10 5 5 C5 5 11 4 12 10Z"
        fill="none" stroke="var(--primary-green)" strokeWidth="1.4" strokeLinejoin="round"
      />
      <path
        d="M12 14 C12 14 18 13 19 8 C19 8 13 7 12 14Z"
        fill="none" stroke="var(--primary-green)" strokeWidth="1.4" strokeLinejoin="round"
      />
    </g>
  );
}

// Double leaf for center
function CenterLeaf({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path
        d={`M${cx} ${cy - 4} C${cx - 8} ${cy - 16} ${cx - 14} ${cy - 28} ${cx} ${cy - 34} C${cx + 14} ${cy - 28} ${cx + 8} ${cy - 16} ${cx} ${cy - 4}Z`}
        fill="none" stroke="var(--primary-green)" strokeWidth="1.8" strokeLinejoin="round"
      />
      <path
        d={`M${cx} ${cy - 4} C${cx - 10} ${cy - 14} ${cx - 16} ${cy - 24} ${cx - 4} ${cy - 32}`}
        fill="none" stroke="var(--primary-green)" strokeWidth="1.2" strokeLinecap="round"
        strokeDasharray="0"
        opacity="0.5"
      />
      <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 6} stroke="var(--primary-green)" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

const ICON_COMPONENTS = [LeafIcon, CowIcon, FishIcon, GearIcon, PlantIcon];

// Build the circular arrow path for the orbit ring with arrowheads
/**
 * Round a computed coordinate before it becomes markup.
 *
 * **This exists to stop a hydration mismatch, not to tidy the numbers.**
 * `Math.sin` and `Math.cos` are not required by the ECMAScript spec to be
 * correctly rounded, so an implementation may differ in the last unit in the
 * last place. Node and Chrome ship different V8 builds, and they disagree
 * here: the server rendered `200.33185604063473` and the browser computed
 * `200.3318560406347`. React compared the two `d` attributes, found them
 * different, and gave up on the tree — "this won't be patched up" — which
 * leaves the diagram unhydrated.
 *
 * Three decimals is far below anything visible: the viewBox is 700x560, so a
 * thousandth of a user unit is a small fraction of a pixel at any size this
 * renders. What matters is that both engines now produce the *same string*
 * from the same inputs, which is what hydration actually compares.
 *
 * Any coordinate derived from trigonometry and interpolated into an attribute
 * has to go through this. Two functions here do it; both are covered.
 */
function coord(value: number): string {
  return value.toFixed(3);
}

function buildOrbitPath() {
  const r = ORBIT_R;
  // We'll draw 5 arc segments, one between each adjacent node pair, with a gap near each node
  const arcs: string[] = [];
  const GAP_DEG = 18; // degrees to skip around each node

  for (let i = 0; i < NODES.length; i++) {
    const startAngle = NODES[i].angle + GAP_DEG;
    const endAngle = NODES[(i + 1) % NODES.length].angle - GAP_DEG;

    const startRad = toRad(startAngle);
    const endRad = toRad(endAngle);

    const x1 = CX + r * Math.cos(startRad);
    const y1 = CY + r * Math.sin(startRad);
    const x2 = CX + r * Math.cos(endRad);
    const y2 = CY + r * Math.sin(endRad);

    // large-arc-flag: 0 if arc < 180 deg
    let delta = endAngle - startAngle;
    if (delta < 0) delta += 360;
    const largeArc = delta > 180 ? 1 : 0;

    arcs.push(
      `M ${coord(x1)} ${coord(y1)} A ${r} ${r} 0 ${largeArc} 1 ${coord(x2)} ${coord(y2)}`,
    );
  }
  return arcs;
}

// Arrowhead at a given angle along the orbit
function OrbitArrow({ angle }: { angle: number }) {
  const r = ORBIT_R;
  const rad = toRad(angle);
  const ax = CX + r * Math.cos(rad);
  const ay = CY + r * Math.sin(rad);
  // tangent direction (clockwise = perpendicular to radius, rotated +90)
  const tx = -Math.sin(rad);
  const ty = Math.cos(rad);
  const size = 6;
  // arrowhead triangle points
  const p1x = ax + tx * size;
  const p1y = ay + ty * size;
  const p2x = ax - tx * (size * 0.5) + Math.cos(rad) * (size * 0.6);
  const p2y = ay - ty * (size * 0.5) + Math.sin(rad) * (size * 0.6);
  const p3x = ax - tx * (size * 0.5) - Math.cos(rad) * (size * 0.6);
  const p3y = ay - ty * (size * 0.5) - Math.sin(rad) * (size * 0.6);
  return (
    <polygon
      points={`${coord(p1x)},${coord(p1y)} ${coord(p2x)},${coord(p2y)} ${coord(p3x)},${coord(p3y)}`}
      fill="#a8d4b8"
    />
  );
}

export function KuyashModel() {
  const arcPaths = buildOrbitPath();

  return (
    <section id="projects" className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT — copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-4">
              The Kuyash Model
            </p>
            <h2
              className="font-serif font-bold text-ink leading-[1.08] mb-5"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}
            >
              An Integrated<br />Farming System
            </h2>
            <p className="text-gray-500 font-sans text-sm leading-relaxed mb-8 max-w-[380px]">
              Our operations work together in a sustainable cycle that improves productivity,
              protects resources and creates lasting value. Every arm of the farm feeds into
              the next — reducing waste and maximising output.
            </p>
            <Link
              href="/services/crop-vegetable-production"
              className="inline-flex items-center gap-2 border border-edge text-primary font-semibold text-sm px-6 py-3 rounded-full hover:bg-mist transition-colors duration-200"
            >
              Discover The Model <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* ── RIGHT — SVG diagram ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              className="w-full max-w-[560px]"
              aria-label="Kuyash Farms ecosystem diagram"
            >
              {/* ── orbit arc segments ── */}
              {arcPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="var(--edge)"
                  strokeWidth="1.2"
                />
              ))}

              {/* ── arrowheads at midpoint of each arc ── */}
              {NODES.map((node, i) => {
                const nextAngle = NODES[(i + 1) % NODES.length].angle;
                let mid = (node.angle + nextAngle) / 2;
                // handle wrap around 360
                if (nextAngle < node.angle) mid = (node.angle + nextAngle + 360) / 2;
                return <OrbitArrow key={i} angle={mid} />;
              })}

              {/* ── center circle ── */}
              <circle
                cx={CX} cy={CY} r={CENTER_R}
                fill="white"
                stroke="var(--primary-green)"
                strokeWidth="1.2"
              />
              <CenterLeaf cx={CX} cy={CY} />
              {/*
                The trading name, on two lines rather than three.

                This read "KUYASH / INTEGRATED / FARM" and survived the rename
                sweep because it is split across separate <text> elements — no
                search for "Kuyash Integrated Farm" could ever match it. Worth
                remembering for any future rename: a name broken across
                elements is invisible to grep and visible to every customer.
              */}
              <text x={CX} y={CY + 22} textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="11" fill="var(--primary-green)" letterSpacing="1.5">KUYASH</text>
              <text x={CX} y={CY + 36} textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="11" fill="var(--primary-green)" letterSpacing="1.5">FARMS</text>

              {/* ── nodes ── */}
              {NODES.map((node, i) => {
                const rad = toRad(node.angle);
                const nx = CX + ORBIT_R * Math.cos(rad);
                const ny = CY + ORBIT_R * Math.sin(rad);
                const isLeft = node.labelSide === "left";
                const IconComponent = ICON_COMPONENTS[i];

                // label positioning — push outward from node
                const labelGap = NODE_R + 14;
                const lx = isLeft ? nx - labelGap : nx + labelGap;
                const textAnchor = isLeft ? "end" : "start";

                // vertical offset for label group centring
                const subCount = node.sub.length;
                const labelTotalH = 14 + subCount * 12;
                const ly = ny - labelTotalH / 2 + 5;

                return (
                  <g key={node.label}>
                    {/* node circle */}
                    <circle
                      cx={nx} cy={ny} r={NODE_R}
                      fill="white"
                      stroke="var(--primary-green)"
                      strokeWidth="1.2"
                    />
                    {/* icon */}
                    <IconComponent cx={nx} cy={ny} size={20} />

                    {/* label heading */}
                    <text
                      x={lx} y={ly}
                      textAnchor={textAnchor}
                      fontFamily="'Georgia', serif"
                      fontWeight="700"
                      fontSize="11.5"
                      fill="var(--primary-dark)"
                      letterSpacing="0.8"
                    >
                      {node.label}
                    </text>
                    {/* sub lines */}
                    {node.sub.map((line, li) => (
                      <text
                        key={li}
                        x={lx}
                        y={ly + 13 + li * 12}
                        textAnchor={textAnchor}
                        fontFamily="'Arial', sans-serif"
                        fontSize="9.5"
                        fill="#9ca3af"
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                );
              })}
            </svg>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
