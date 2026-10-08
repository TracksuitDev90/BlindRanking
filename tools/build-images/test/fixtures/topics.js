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
  ]},
  { name: "Island Paradises Test", mood: "places", provider: "wiki", items: [
    { label: "Test Island" }
  ]},
  { name: "Best Fast-Food Chains Test", mood: "food", provider: "wiki", items: [
    { label: "Test Chain" }
  ]},
  // Accuracy rules v2
  { name: "Best Snacks Test", mood: "food", provider: "wiki", items: [
    { label: "Sour Thing" }, { label: "Fizzy Pop" }, { label: "Test Soda" }
  ]},
  { name: "Electric Cars Test", mood: "tech", provider: "wiki", items: [
    { label: "Tesla Model Z" }, { label: "Testla S30" }, { label: "Plymouth Test" }
  ]},
  { name: "Twin Movies Test", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    { label: "Twin Title (2001 film)" }
  ]},
  { name: "Best YouTubers Test", mood: "people", provider: "wiki", mediaType: "person", items: [
    { label: "Test Channel" }
  ]},
  { name: "Best Soccer Clubs Test", mood: "sports", provider: "wiki", items: [
    { label: "Test City" }, { label: "Test FC" }
  ]},
  { name: "Best Indie Games Test", mood: "games", provider: "wiki", items: [
    { label: "Test Game" }
  ]},
  { name: "Best Board Games Test", mood: "games", provider: "wiki", items: [
    { label: "Test Board Game" }
  ]},
  { name: "Best NFL Teams Test", mood: "sports", provider: "wiki", items: [
    { label: "2000 Test Team season", hints: { kind: "team" } }
  ]}
];
