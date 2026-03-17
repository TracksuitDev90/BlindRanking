// config.js
// Note: Keys in a public repo (GitHub Pages) are visible to everyone.
// These are read-only APIs, but move to a serverless proxy later if you want to hide them.

window.BR_CONFIG = {
  /* Primary movie/TV source */
  TMDB_KEY: "590bbc19952cc386c22c31ea4abb3114",

  /* Backups / category-specific sources */
  OMDB_KEY: "c139a613",                                   // Movies/TV posters (backup)
  LASTFM_KEY: "572f6e907e1e350d560363b452e2f9c7",         // Music artists (backup)
  AUDIO_KEY: "523532",                                     // Music artists (TheAudioDB key)

  /* Generic fallbacks (nice visuals) */
  PIXABAY_KEY: "52130276-cec6f70c4efde5dfb713cbce7",
  PEXELS_KEY: "",         // optional: add if you create a key
  UNSPLASH_KEY: "",       // optional: add if you create a key

  /* No-key providers (always on) */
  ENABLE_TVMAZE: true,        // TV shows
  ENABLE_WIKIPEDIA: true,     // PageImages
  ENABLE_WIKIDATA: true,      // P18 → Commons
  ENABLE_ITUNES: true         // artist/movie art
};
