// Minimal fixture mirroring topics.js shapes, used by the offline test run.
window.BR_MOODS = [];
window.TOPICS = [
  { name: "Test Movies", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    { label: "Test Movie (2020 film)" }
  ]},
  { name: "Best NFL Quarterbacks Test", mood: "sports", provider: "wiki", items: [
    { label: "Test QB" }, { label: "Wrong Guy" }
  ]},
  { name: "Best Burgers Test", mood: "food", provider: "wiki", items: [
    { label: "Test Burger" }, { label: "Missing Thing" }
  ]},
  { name: "Tech Brands Test", mood: "tech", provider: "wiki", items: [
    { label: "Test Brand" }
  ]}
];
