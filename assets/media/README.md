# Delaro media assets

This directory is reserved for approved, licensed media from the Delaro asset manifest.

Current status: the asset manifest and approved cinematic reference are not readable from the active workspace. No stock photography or URL-dependent imagery has been substituted.

## Media-stage contract

- Desktop and mobile poster assets should be exported separately when their crops differ.
- Posters are required and must carry explicit width and height attributes in markup.
- Optional `.webm` and `.mp4` files enhance the poster; they never contain required content.
- Use a shared basename for each poster/video set: `hero-architecture-poster.avif`, `hero-architecture.webm`, and `hero-architecture.mp4`. Use equivalent `philosophy-ocean-*` and `improvement-rock-*` names only after those assets are approved.
- File names should begin with the approved asset ID from `specs/ASSET_MANIFEST.md`.
- Record licensing source, usage restrictions, alt-text decision, and focal position before an asset is published.

## Video drop-in convention

Add video attributes only after both the approved poster and motion exports exist:

```html
<figure
  class="media-stage"
  data-media-stage
  data-video-webm="/assets/media/approved/hero-architecture.webm"
  data-video-mp4="/assets/media/approved/hero-architecture.mp4"
  data-video-autoplay="true"
  data-video-loop="false"
>
  <picture class="media-stage-poster">
    <img src="/assets/media/approved/hero-architecture-poster.avif" alt="" width="1600" height="2000" />
  </picture>
</figure>
```

The runtime keeps the poster as the layout and visual fallback. It does not create or load video when reduced motion or data saving is active, hydrates eligible video only near the viewport, pauses it offscreen or while the document is hidden, and loops only when `data-video-loop="true"` is explicitly present. Motion exports must be muted, contain no required information, and match the poster crop so the handoff does not shift layout.

The current homepage uses three provisional implementation IDs only:

- `HOME-HERO-MEDIA-PENDING` — full-bleed architectural hero photography.
- `HOME-PHILOSOPHY-MEDIA-PENDING` — ocean aerial for the philosophy split.
- `HOME-IMPROVEMENT-MEDIA-PENDING` — ocean/rock photography for continuous improvement.

All three deliberately render from the same clearly marked blueprint placeholder while approved media remains inaccessible. Replace each ID, poster, crop, and focal position from the manifest before launch.

## Rights and approval ledger

| Asset | Source | Current use | Rights / approval status |
| --- | --- | --- | --- |
| Delaro logo lockup | Supplied Delaro project asset | Header and footer brand mark | Present in the supplied project materials; owner must confirm publication rights before launch. |
| Blueprint placeholder SVGs | Authored for this repository | Temporary homepage media fallback | Project-authored and safe for internal preview; explicitly provisional and not approved as final launch media. |
| Final architectural photography / motion | Not supplied in the readable workspace | Not published | Blocked until the asset manifest, licensing source, usage restrictions, approved crop, and focal position are available. |

No third-party stock photography, remote media, client logos, testimonials, or unverified engagement imagery is included.
