# Delaro media assets

This directory is reserved for approved, licensed media from the Delaro asset manifest.

Current status: the supplied asset manifest and approved cinematic reference were reviewed on October 17, 2026. The homepage uses owner-supplied stills exported into responsive desktop and mobile crops. No stock photography or URL-dependent imagery has been substituted.

## Media-stage contract

- Desktop and mobile poster assets should be exported separately when their crops differ.
- Posters are required and must carry explicit width and height attributes in markup.
- Optional `.webm` and `.mp4` files enhance the poster; they never contain required content.
- Use a shared basename for each poster/video set: `hero-architecture-desktop.jpg`, `hero-architecture.webm`, and `hero-architecture.mp4`. Equivalent coastline and rock/surf names follow the approved manifest IDs recorded below.
- File names map directly to approved IDs from `specs/ASSET_MANIFEST.md`.
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

The homepage resolves three manifest IDs:

- `HERO-01` — full-bleed architectural hero using dedicated 1672×941 desktop and 753×941 mobile crops.
- `PHIL-01` — diagonal ocean-break image using 1176×941 desktop and 753×941 mobile crops.
- `PARTNER-01` — rock/surf aerial using 1672×941 desktop and 753×941 mobile crops.

JPEG is the current production format because the available local conversion runtime does not include AVIF or WebP encoders. The exports are already compressed and retain JPEG fallbacks as required by the manifest. A later format migration must preserve the exact crops and intrinsic dimensions in markup.

## Rights and approval ledger

| Asset | Source | Current use | Rights / approval status |
| --- | --- | --- | --- |
| Delaro logo lockup | Supplied Delaro project asset | Header and footer brand mark | Present in the supplied project materials; owner must confirm publication rights before launch. |
| `HERO-01` architectural waterfront | Owner-supplied `ChatGPT Image Oct 17, 2026, 12_20_13 PM.png` | Homepage hero | Supplied and approved by the owner for this implementation. Commercial-rights paperwork was not independently reviewed. Decorative; empty alt. Desktop focal position 50% 50%; mobile 46% 50%. |
| `PHIL-01` coastline aerial | Owner-supplied `ChatGPT Image Oct 17, 2026, 12_20_18 PM.png` | Homepage philosophy split | Supplied and approved by the owner for this implementation. Commercial-rights paperwork was not independently reviewed. Decorative; empty alt. Desktop focal position 54% 50%; mobile 50% 50%. |
| `PARTNER-01` rock/surf aerial | Owner-supplied `ChatGPT Image Oct 17, 2026, 12_20_21 PM.png` | Homepage continuous-improvement stage | Supplied and approved by the owner for this implementation. Commercial-rights paperwork was not independently reviewed. Decorative; empty alt. Desktop focal position 50% 44%; mobile 44% 48%. |
| Motion exports | Not supplied | Not published | No video has been added. Future exports require separate approval. |

No third-party stock photography, remote media, client logos, testimonials, or unverified engagement imagery is included. The owner remains responsible for retaining the original generation record and confirming commercial-use rights before public launch.
