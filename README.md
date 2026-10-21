# TuneWave

TuneWave is a responsive React/Vite music discovery app with live catalogue search, language/storefront and genre filters, favourites, playlists, pagination, and a persistent player.

## Run locally

```sh
npm install
npm run dev
```

## Live catalogue and previews

With no backend configured, TuneWave searches the public Apple iTunes Search API. Search text is sent as entered, so Unicode queries (including Tamil, Sinhala, Hindi, Korean, and other scripts) are supported. Search results include Apple catalogue metadata, album artwork, genres, and a link to their Apple Music listing. The app grows the result limit in batches of 25, up to Apple's 200-result request limit.

The public Search API needs no API key or Apple developer account. Its language selector changes the Apple storefront (`US`, `IN`, `LK`, or `KR`); Apple does not return verified vocal-language metadata for each track, so a storefront is not a guarantee of a song's language. Search in the language's own script for more precise results. Genre filtering is applied to the returned catalogue metadata.

Apple preview URLs are short promotional samples, not full-song streaming rights. Apple requires Search API artwork and audio samples to promote Apple Store content, not for entertainment, and requires a store badge near those assets. TuneWave places Apple's official Listen on Apple Music badge on each result and links it to the matching listing. Follow Apple's current Search API terms before deployment. Do not use these preview clips as a substitute for a licensed streaming service.

## Connect a licensed streaming provider (optional)

For full playback or provider-specific rights, create an account with a service that grants your application the necessary metadata, artwork, preview/streaming, territory, and commercial rights. Complete its review and OAuth redirect/app approval steps. If credentials are required, store them only on your backend (environment variables or a secret manager); **never put secrets in frontend `VITE_*` variables or browser code**.

Set `VITE_TUNEWAVE_API_BASE_URL` in `.env.local` to your backend's public base URL. `.env.example` uses `http://localhost:8787` as a local example. Restart Vite after changing the environment.

Implement:

```text
GET /api/music/search?q=<text>&language=<optional>&genre=<optional>&category=<optional>&limit=<1-200>
```

Return:

```json
{
  "tracks": [
    {
      "id": "provider-track-id",
      "title": "Song title",
      "artist": "Artist name",
      "album": "Album name",
      "language": "Korean",
      "genre": "Pop",
      "artworkUrl": "https://provider.example/artwork",
      "categories": ["Trending Songs"],
      "playbackAuthorized": true,
      "playbackUrl": "https://provider.example/short-lived-authorized-preview",
      "sourceName": "Licensed provider"
    }
  ],
  "hasMore": false
}
```

Use real provider metadata and artwork only. A track is playable only when the backend confirms `playbackAuthorized: true` and supplies an HTTPS URL or an opaque same-origin `/api/music/playback/...` URL that the user's account is authorized to access. Use provider-approved short-lived streams or an authenticated playback route. Return `hasMore` when additional pages are available; the UI requests larger result batches when the user selects **Load more**. Return an empty `tracks` array for no matches and a non-2xx status for failures.

The app does not include provider credentials or a provider-specific backend. Until one is configured, the public Apple metadata API and its promotional previews power discovery; only rights-cleared provider playback should be used for a full streaming launch.
