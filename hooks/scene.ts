/** A traced picture: its own box, the defs its chunks name, and chunks in paint order, each small enough for one Svg. */
export type Figure = { w: number | string; h: number | string; defs: string; chunks: readonly string[] }

/** How awake the scene is: 0 calm .. 4 blood moon. */
export type Stage = 0 | 1 | 2 | 3 | 4

export const STAGES: readonly Stage[] = [0, 1, 2, 3, 4]

/** The five-hour window's percent used where each stage begins. */
const THRESHOLDS = [0, 25, 50, 75, 90] as const

export const STAGE_NAMES = ['沉眠', '苏醒', '低语', '绽放', '血月'] as const

export function stageFor(percentUsed: number | undefined): Stage {
  if (percentUsed === undefined) {
    return 0
  }
  let stage: Stage = 0

  for (const s of STAGES) {
    if (percentUsed >= THRESHOLDS[s]) {
      stage = s
    }
  }

  return stage
}

type Params = {
  petals: number
  ringOpacity: number
  ringSpin: number
  ringColor: string
  glow: [number, number]
  breathe: number
  dim: number
  tint: number
  eyes: number
}

const PARAMS: Record<Stage, Params> = {
  0: { petals: 6, ringOpacity: 0.22, ringSpin: 260, ringColor: '#5e1020', glow: [0.25, 0.45], breathe: 16, dim: 0.38, tint: 0, eyes: 0 },
  1: { petals: 12, ringOpacity: 0.35, ringSpin: 200, ringColor: '#7a1424', glow: [0.4, 0.7], breathe: 14, dim: 0.22, tint: 0, eyes: 0 },
  2: { petals: 20, ringOpacity: 0.5, ringSpin: 140, ringColor: '#93182c', glow: [0.55, 0.85], breathe: 12, dim: 0.1, tint: 0, eyes: 0.35 },
  3: { petals: 30, ringOpacity: 0.65, ringSpin: 90, ringColor: '#b01d33', glow: [0.7, 1], breathe: 10, dim: 0, tint: 0.08, eyes: 0.55 },
  4: { petals: 40, ringOpacity: 0.8, ringSpin: 60, ringColor: '#cf2540', glow: [0.8, 1], breathe: 8, dim: 0, tint: 0.16, eyes: 0.75 },
}

// A fixed pseudo-random sequence, so each stage's petals keep their places across redraws.
function seeded(seed: number): () => number {
  let s = seed

  return () => {
    s = (s * 1103515245 + 12345) % 2147483648

    return s / 2147483648
  }
}

function petals(count: number): string {
  const rand = seeded(7)
  const out: string[] = []

  for (let i = 0; i < count; i++) {
    const x = Math.round(-1750 + rand() * 2350)
    const y = Math.round(-40 + rand() * 940)
    const r = Math.round(rand() * 360)
    const s = [1.6, 2, 2.4, 3][Math.floor(rand() * 4)]
    const d = i % 3
    const c = Math.floor(rand() * 3)
    const delay = Math.round(rand() * 40)

    out.push(
      `<g transform="translate(${x} ${y})"><g class="pt d${d} c${c}" style="animation-delay:-${delay}s"><use href="#p-petal" transform="rotate(${r}) scale(${s})"/></g></g>`,
    )
  }

  return out.join('')
}

function ring(cx: number, cy: number, p: Params, stage: Stage): string {
  const outer =
    stage >= 3
      ? `<circle cx="${cx}" cy="${cy}" r="360" stroke-width="1" stroke-dasharray="1 7"/><circle cx="${cx}" cy="${cy}" r="384" stroke-width="2"/>`
      : ''

  return (
    `<g class="ring" fill="none" stroke="${p.ringColor}" opacity="${p.ringOpacity}">` +
    `<circle cx="${cx}" cy="${cy}" r="300" stroke-width="2"/>` +
    `<circle cx="${cx}" cy="${cy}" r="268" stroke-width="1" stroke-dasharray="4 10"/>` +
    `<circle cx="${cx}" cy="${cy}" r="200" stroke-width="1.5"/>` +
    `<path stroke-width="1.5" d="M${cx} ${cy - 300}L${cx + 260} ${cy + 150}H${cx - 260}ZM${cx} ${cy + 300}L${cx - 260} ${cy - 150}H${cx + 260}Z"/>` +
    `<circle cx="${cx}" cy="${cy}" r="120" stroke-width="1" stroke-dasharray="2 6"/>${outer}</g>`
  )
}


const OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 670 1000" width="100%" height="100%" preserveAspectRatio="xMaxYMid meet" overflow="visible" fill-rule="evenodd">'

const BACK_DEFS =
  '<radialGradient id="bg-glow" gradientUnits="userSpaceOnUse" cx="300" cy="420" r="1700"><stop offset="0" stop-color="#4a0c18"/><stop offset=".45" stop-color="#22090e"/><stop offset="1" stop-color="#110507"/></radialGradient>' +
  '<radialGradient id="bg-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#a3142b" stop-opacity=".55"/><stop offset="1" stop-color="#a3142b" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="moon-halo" cx=".5" cy=".5" r=".5"><stop offset=".4" stop-color="#c0182f" stop-opacity=".5"/><stop offset="1" stop-color="#c0182f" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="sky-red" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="-100" y2="650"><stop offset="0" stop-color="#6a0a18"/><stop offset="1" stop-color="#6a0a18" stop-opacity="0"/></linearGradient>'

const FRONT_DEFS =
  '<radialGradient id="eye-gold" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc24a" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a1e" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="dim-fade" x1="0" x2="1"><stop offset="0" stop-color="#0b0306" stop-opacity="0"/><stop offset=".1" stop-color="#0b0306"/></linearGradient>' +
  '<linearGradient id="tint-fade" x1="0" x2="1"><stop offset="0" stop-color="#8a0f22" stop-opacity="0"/><stop offset=".1" stop-color="#8a0f22"/></linearGradient>' +
  '<path id="p-petal" d="M0 0C5-9 17-10 22-2C17 7 6 8 0 0Z"/>'

const figureDefs = (f: Figure): string =>
  '<linearGradient id="fig-fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".1" stop-color="#fff"/></linearGradient>' +
  `<mask id="fig-mask" maskContentUnits="userSpaceOnUse"><rect width="${f.w}" height="${f.h}" fill="url(#fig-fade)"/></mask>${f.defs}`

// The figure fills 0..670 x 0..1000 of the scene, its left edge fading into the ground.
const figurePart = (f: Figure, chunk: string): string =>
  `<svg x="0" y="0" width="670" height="1000" viewBox="0 0 ${f.w} ${f.h}" preserveAspectRatio="xMaxYMid meet"><g mask="url(#fig-mask)">${chunk}</g></svg>`

const cache = new Map<string, readonly string[]>()

/**
 * The scene for a stage, as Svg documents to stack in order: the first holds the ground, the ring, glow and moon;
 * each holds the next chunk of the figure; the last adds the overlays and petals. Every one shares the same viewBox,
 * so they line up: the figure fills the viewBox, pinned right at full height, and the rest lies left of it,
 * outside the viewBox, showing wherever the window is wider.
 */
export function sceneLayers(stage: Stage, figure: Figure, key: string): readonly string[] {
  const id = `${key}-${stage}`
  const hit = cache.get(id)

  if (hit !== undefined) {
    return hit
  }
  const p = PARAMS[stage]
  const backCss =
    `.ring{transform-box:fill-box;transform-origin:center;animation:spin ${p.ringSpin}s linear infinite}` +
    '@keyframes spin{to{transform:rotate(360deg)}}' +
    `.glow{opacity:${p.glow[1]};animation:breathe ${p.breathe}s ease-in-out infinite alternate}` +
    `@keyframes breathe{from{opacity:${p.glow[0]}}to{opacity:${p.glow[1]}}}`
  const frontCss =
    '.pt{opacity:.75;animation:fall 34s linear infinite}.d1{animation-duration:28s}.d2{animation-duration:41s}' +
    '.c0{fill:#b3122a}.c1{fill:#d01f36}.c2{fill:#8e0f22}' +
    '@keyframes fall{0%{transform:translate(0,-140px) rotate(0deg);opacity:0}12%{opacity:.75}85%{opacity:.75}100%{transform:translate(-160px,1150px) rotate(420deg);opacity:0}}' +
    `.eye{opacity:${p.eyes};animation:wake 7s ease-in-out infinite alternate}` +
    `@keyframes wake{from{opacity:${(p.eyes * 0.55).toFixed(2)}}to{opacity:${p.eyes}}}`
  const moon =
    stage === 4
      ? '<circle cx="-430" cy="230" r="260" fill="url(#moon-halo)"/><circle cx="-430" cy="230" r="120" fill="#8f0d1d"/><circle cx="-470" cy="200" r="120" fill="#5a0812" opacity=".35"/>'
      : ''
  const sky = stage >= 3 ? `<rect x="-6000" y="-4000" width="6670" height="4650" fill="url(#sky-red)" opacity="${stage === 4 ? 0.9 : 0.5}"/>` : ''
  const eyes =
    p.eyes > 0
      ? '<g class="eye" fill="url(#eye-gold)"><ellipse cx="304" cy="250" rx="30" ry="16"/><ellipse cx="386" cy="275" rx="30" ry="16"/></g>'
      : ''
  const dim = p.dim > 0 ? `<rect width="670" height="1000" fill="url(#dim-fade)" opacity="${p.dim}"/>` : ''
  const tint = p.tint > 0 ? `<rect width="670" height="1000" fill="url(#tint-fade)" opacity="${p.tint}"/>` : ''
  const back =
    '<rect x="-6000" y="-4000" width="6670" height="9000" fill="url(#bg-glow)"/>' +
    sky +
    moon +
    ring(-620, 780, p, stage) +
    '<ellipse class="glow" cx="40" cy="420" rx="620" ry="520" fill="url(#bg-halo)"/>'
  const front = dim + tint + eyes + petals(p.petals)
  const last = figure.chunks.length - 1

  const layers = figure.chunks.map((chunk, i) => {
    const isFirst = i === 0
    const isLast = i === last
    const css = (isFirst ? backCss : '') + (isLast ? frontCss : '')

    return (
      OPEN +
      (css === '' ? '' : `<style>${css}</style>`) +
      `<defs>${isFirst ? BACK_DEFS : ''}${isLast ? FRONT_DEFS : ''}${figureDefs(figure)}</defs>` +
      (isFirst ? back : '') +
      figurePart(figure, chunk) +
      (isLast ? front : '') +
      '</svg>'
    )
  })

  cache.set(id, layers)

  return layers
}
