# mohamed-osama-aboelkheir.github.io

The landing page behind the QR code on my talk slides — talks, slides, recordings,
series, and channels, all on one screen.

Built with [Eleventy](https://www.11ty.dev/). **All content lives in YAML files under
`src/_data/` — you never need to touch HTML to add a talk or a link.**

## Run it locally

```bash
npm install
npm start        # http://localhost:8080 with live reload
```

Edit any file in `src/_data/` and the browser reloads on save.

```bash
npm run build    # one-off build into _site/
```

## Where the content lives

| File | What it controls |
| --- | --- |
| `src/_data/site.yaml` | Name, headline, tagline, avatar, CV link, page metadata |
| `src/_data/channels.yaml` | The "Watch & Read" cards (YouTube, Medium, dev.to, …) |
| `src/_data/resources.yaml` | The "Wiki & Skills" cards (the AppSec wiki, the Claude Code marketplace) |
| `src/_data/series.yaml` | The "Series" cards (Secure Code Review Challenge, …) |
| `src/_data/talks.yaml` | Talks, with every conference nested under `appearances` |
| `src/_data/connect.yaml` | The profile pills at the bottom (LinkedIn, GitHub, X) |

Each file has comments at the top explaining every field.

### Adding a talk

One entry per **talk**, with each conference it was given at nested underneath — so a
talk given three times renders once, with three venues beneath it:

```yaml
- title: "Beyond STRIDE: Doors, Windows & Holes"
  abstract: A methodology for threat modelling web apps
  slides_url: https://...          # the canonical deck
  appearances:
    - event: ThreatModCon
      location: San Francisco, US
      date: 2026-10-15
      status: upcoming             # hides links, shows an "Upcoming" badge
    - event: Black Hat Europe
      location: London, UK
      date: 2026-12-10
      slides_url: https://...      # optional override if that deck differed
      recording_url: https://...
```

Talks sort themselves by their **most recent** appearance, so the file order doesn't matter.

### Unfilled links

Any entry with an empty `url` renders greyed out with a `SOON` badge instead of a dead
link — so placeholders are visible while you collect the real URLs. Delete the entry to
remove it entirely; empty a whole file's list and its section disappears.

## Anything else worth knowing

- **Images:** drop files in `src/img/`, reference as `/img/<name>`. A square photo at
  `src/img/avatar.jpg` + `avatar: avatar.jpg` in `site.yaml` replaces the initials circle.
- **Colours / layout:** `src/css/style.css`. Light and dark themes both defined there.
- **No `pathPrefix`:** this repo is a *user* site (`<username>.github.io`), served from
  the root. If you ever move this to a project repo, add
  `pathPrefix: "/<repo-name>/"` to `eleventy.config.js` and drop it again when a custom
  domain is attached.

## Deploying

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. Before the
first push: repo **Settings → Pages → Source → GitHub Actions**.
