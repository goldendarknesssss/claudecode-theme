import type { EngineInterface, Register, SessionRateLimit, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { FIGURE } from './figure'
import { sceneLayers, stageFor, STAGE_NAMES, STAGES } from './scene'
import type { Stage } from './scene'

// Crimson Rose: a dark look tinted wine-red, behind it the person's picture traced as vector art.
// The scene wakes as the five-hour usage window fills: 0-25% calm, 25/50/75% stronger, 90%+ blood moon.
const { theme, problems } = makeColors({
  label: 'Crimson Rose',
  only: 'dark',
  roles: { accent: '#d8344a', danger: '#e5533d', success: '#5f9e6e', warning: '#d9a03f', pro: '#b06ad0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#160a0d',
        'surface-1': '#1e0f13',
        'surface-2': '#261418',
        'surface-3': '#2c171c',
        'text-primary': '#f6ecec',
        'text-secondary': '#dcc8ca',
        'text-muted': '#b89ea2',
      },
    },
  },
})

const SCENE_PREFIX = 'crimson-rose-'
const GLASS = { blur: 2, tint: '#12060a', opacity: 0.35 } as const

const lookFor = (stage: Stage): ThemeSetArgs => ({
  colors: theme,
  backdrop: { scene: `${SCENE_PREFIX}${stage}`, glass: GLASS },
})

// Module state: a reload starts it over, and session.start sets it again from the live figures.
let shown: Stage | undefined
let pinned: Stage | undefined
let lastPercent: number | undefined

const fiveHour = (limits: readonly SessionRateLimit[]): number | undefined =>
  limits.find(limit => limit.kind === 'five_hour')?.percentUsed

function describe(stage: Stage): string {
  const usage = lastPercent === undefined ? '暂无 5h 用量数据' : `5h 用量 ${lastPercent}%`
  const mode = pinned === undefined ? '' : '（预览中，/crimson-stage auto 恢复）'

  return `🌹 ${STAGE_NAMES[stage]} · ${usage}${mode}`
}

async function show($: EngineInterface, stage: Stage): Promise<void> {
  if (stage !== shown) {
    const set = await $.theme.set(lookFor(stage))
    shown = stage

    if (!set.isDrawn) {
      $.ui.status(set.reason)

      return
    }
  }
  $.ui.status(describe(stage))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.command.register({
      name: 'crimson-stage',
      description: 'Preview a Crimson Rose stage (0-4), or "auto" to follow 5-hour usage again',
    })
    const usage = await $.session.usage()
    lastPercent = fiveHour(usage.rateLimits)
    shown = undefined
    await show($, pinned ?? stageFor(lastPercent))

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      const percent = fiveHour(e.rateLimits)

      if (percent !== undefined) {
        lastPercent = percent
      }
      const stage = pinned ?? stageFor(lastPercent)

      if (stage === 4 && shown !== 4 && pinned === undefined) {
        $.ui.toast('🌹 血月升起：5 小时用量已过 90%')
      }
      await show($, stage)
    }

    return next(e)
  })

  on('command.run', { command: 'crimson-stage' }, async ($, e) => {
    const arg = e.args.trim()

    if (arg === '' || arg === 'auto') {
      pinned = undefined
      await show($, stageFor(lastPercent))

      return { text: `已恢复跟随 5 小时用量：${describe(stageFor(lastPercent))}` }
    }
    const n = Number(arg)
    const stage = STAGES.find(s => s === n)

    if (stage === undefined) {
      return { text: '用法：/crimson-stage 0-4 预览某个阶段，/crimson-stage auto 恢复跟随用量' }
    }
    pinned = stage
    await show($, stage)

    return { text: `正在预览阶段 ${stage}（${STAGE_NAMES[stage]}）` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const match = /^crimson-rose-([0-4])$/.exec(e.props.scene)

    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || match === null) {
      return next(e)
    }
    const stage = STAGES.find(s => String(s) === match[1]) ?? 0
    const { Box, Svg } = $.ui.resolve(e)
    const alt = `A white-haired woman among red roses, stage ${STAGE_NAMES[stage]}`

    // Each Svg holds at most 131,072 characters and the whole backdrop about twice that, so the scene comes as two
    // stacked Svgs; the desktop app draws every one of them over the whole backdrop, in order.
    return (
      <Box position="relative" width="100%" height="100%">
        {sceneLayers(stage, FIGURE, 'main').map((source, i) => (
          <Box position="absolute" top={0} left={0} right={0} bottom={0}>
            <Svg source={source} alt={i === 0 ? alt : ' '} />
          </Box>
        ))}
      </Box>
    )
  })
}
