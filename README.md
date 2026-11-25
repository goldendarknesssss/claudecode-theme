# Crimson Rose

A dark, wine-red theme for the Claude desktop app. Behind the conversation sits a white-haired figure among red roses and spider lilies, drawn as vector art, with a slowly turning magic circle and drifting petals to the left of her.

The scene wakes as your five-hour usage window fills:

| Stage | 5-hour usage | What changes |
| --- | --- | --- |
| 0 Slumber | 0–25% | Dim figure, a few petals, a faint slow ring |
| 1 Stirring | 25–50% | Figure brightens, more petals, the ring shows |
| 2 Whisper | 50–75% | Golden glow in her eyes, stronger red light, faster ring |
| 3 Bloom | 75–90% | Red sky, a second ring, a red tint, many petals |
| 4 Blood Moon | 90%+ | A blood moon rises, the ring at its brightest and fastest |

The status line shows the current stage and usage. With no five-hour reading (an API key account, or before the first reply) the scene stays at stage 0.

## Install

At the prompt of a terminal session:

```
/plugin install crimson-rose --marketplace goldendarknesssss/claudecode-theme
```

Answer `y` to add the marketplace, then pick a scope (user scope applies it to every session).

From a shell:

```bash
claude plugin install crimson-rose --marketplace goldendarknesssss/claudecode-theme
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `goldendarknesssss/claudecode-theme`, then Add plugin.

## Use

- `/crimson-stage 0` to `/crimson-stage 4` previews a stage.
- `/crimson-stage auto` follows your five-hour usage again.

The theme draws in the Claude desktop and mobile apps only; the terminal, editors and the browser show no backdrop. It applies to every session where the plugin is on, in place of any other theme.

## Notes

- The app only accepts pure vector backdrops, so the figure is a posterized trace of an illustration (about 20 colors, in one SVG under 131,072 characters), not the original picture.
- The portrait is traced from an illustration whose rights belong to its original artist.
