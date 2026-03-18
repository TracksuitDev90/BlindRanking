// topics.js
// 200 categories, 5 items each. Movies/TV use TMDB (needs TMDB key). Others use Wikipedia PageImages.
// You can override any item's image with: { label: "X", imageUrl: "https://..." }
// Each topic has a `mood` tag for the mood filter picker.

// Available moods: movies, tv, music, food, sports, animals, places, tech, games, culture, people
window.BR_MOODS = [
  { id: 'movies',  label: 'Movies' },
  { id: 'tv',      label: 'TV' },
  { id: 'music',   label: 'Music' },
  { id: 'food',    label: 'Food & Drink' },
  { id: 'sports',  label: 'Sports' },
  { id: 'animals', label: 'Animals' },
  { id: 'places',  label: 'Places' },
  { id: 'tech',    label: 'Tech' },
  { id: 'games',   label: 'Games' },
  { id: 'culture', label: 'Culture' },
  { id: 'people',  label: 'People' }
];

window.TOPICS = [
  // ---- Movies (TMDB) ----
  { name: "Comfort Movies", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Spirited Away"}, {label:"Pride & Prejudice (2005 film)"}, {label:"The Princess Bride"},
    {label:"Amélie"}, {label:"Back to the Future"}
  ], itemPool: [
    {label:"Spirited Away"}, {label:"Pride & Prejudice (2005 film)"}, {label:"The Princess Bride"},
    {label:"Amélie"}, {label:"Back to the Future"}, {label:"The Grand Budapest Hotel"},
    {label:"My Neighbor Totoro"}, {label:"Ferris Bueller's Day Off"}, {label:"When Harry Met Sally..."},
    {label:"Forrest Gump"}, {label:"The Wizard of Oz"}, {label:"Groundhog Day"},
    {label:"Notting Hill (film)"}, {label:"E.T. the Extra-Terrestrial"}, {label:"Paddington 2"},
    {label:"Moonrise Kingdom"}, {label:"The Sound of Music"}, {label:"Clueless"},
    {label:"Singin' in the Rain"}, {label:"Stardust (2007 film)"}, {label:"About Time (2013 film)"},
    {label:"Chef (2014 film)"}, {label:"Ratatouille (film)"}, {label:"Little Women (2019 film)"},
    {label:"Big Fish (film)"}
  ]},
  { name: "Sci-Fi Movies", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Blade Runner"}, {label:"Interstellar (film)"}, {label:"The Matrix"}, {label:"Arrival (film)"}, {label:"Dune (2021 film)"}
  ], itemPool: [
    {label:"Blade Runner"}, {label:"Interstellar (film)"}, {label:"The Matrix"}, {label:"Arrival (film)"}, {label:"Dune (2021 film)"},
    {label:"2001: A Space Odyssey"}, {label:"Alien (film)"}, {label:"Terminator 2: Judgment Day"},
    {label:"Ex Machina (film)"}, {label:"The Martian (film)"}, {label:"Inception"},
    {label:"Star Wars: Episode V – The Empire Strikes Back"}, {label:"E.T. the Extra-Terrestrial"},
    {label:"District 9"}, {label:"Annihilation (film)"}, {label:"Gravity (2013 film)"},
    {label:"Blade Runner 2049"}, {label:"Moon (2009 film)"}, {label:"Edge of Tomorrow"},
    {label:"Close Encounters of the Third Kind"}, {label:"The Fifth Element"}, {label:"Minority Report (film)"},
    {label:"Looper (film)"}, {label:"Eternal Sunshine of the Spotless Mind"}, {label:"Her (film)"}
  ]},
  { name: "Horror Movies", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Shining"}, {label:"Get Out"}, {label:"Hereditary"}, {label:"A Quiet Place"}, {label:"It Follows"}
  ], itemPool: [
    {label:"The Shining"}, {label:"Get Out"}, {label:"Hereditary"}, {label:"A Quiet Place"}, {label:"It Follows"},
    {label:"The Exorcist"}, {label:"Halloween (1978 film)"}, {label:"Scream (1996 film)"},
    {label:"A Nightmare on Elm Street"}, {label:"The Conjuring"}, {label:"Midsommar"},
    {label:"The Texas Chain Saw Massacre"}, {label:"Psycho (1960 film)"}, {label:"The Babadook"},
    {label:"28 Days Later"}, {label:"Rosemary's Baby (film)"}, {label:"The Ring (2002 film)"},
    {label:"Suspiria (1977 film)"}, {label:"Us (2019 film)"}, {label:"The Witch (2015 film)"},
    {label:"Paranormal Activity"}, {label:"Saw (2004 film)"}, {label:"Nope (film)"},
    {label:"The Cabin in the Woods"}, {label:"Train to Busan"}
  ]},
  { name: "90s Blockbusters", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Jurassic Park"}, {label:"Titanic (1997 film)"}, {label:"Independence Day (1996 film)"}, {label:"The Lion King (1994 film)"}, {label:"The Matrix"}
  ], itemPool: [
    {label:"Jurassic Park"}, {label:"Titanic (1997 film)"}, {label:"Independence Day (1996 film)"},
    {label:"The Lion King (1994 film)"}, {label:"The Matrix"}, {label:"Forrest Gump"},
    {label:"Saving Private Ryan"}, {label:"Pulp Fiction"}, {label:"Men in Black (film)"},
    {label:"Braveheart"}, {label:"The Sixth Sense"}, {label:"Armageddon (1998 film)"},
    {label:"Fight Club"}, {label:"Good Will Hunting"}, {label:"Schindler's List"},
    {label:"The Shawshank Redemption"}, {label:"Speed (1994 film)"}, {label:"Twister (1996 film)"},
    {label:"Mrs. Doubtfire"}, {label:"Home Alone"}, {label:"Aladdin (1992 Disney film)"},
    {label:"Mission: Impossible (film)"}, {label:"Toy Story"}, {label:"The Mask (1994 film)"},
    {label:"Dumb and Dumber"}
  ]},
  { name: "Animated Classics", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Lion King (1994 film)"}, {label:"Beauty and the Beast (1991 film)"}, {label:"Aladdin (1992 Disney film)"},
    {label:"Toy Story"}, {label:"Princess Mononoke"}
  ], itemPool: [
    {label:"The Lion King (1994 film)"}, {label:"Beauty and the Beast (1991 film)"}, {label:"Aladdin (1992 Disney film)"},
    {label:"Toy Story"}, {label:"Princess Mononoke"}, {label:"The Little Mermaid (1989 film)"},
    {label:"Spirited Away"}, {label:"Bambi"}, {label:"Snow White and the Seven Dwarfs (1937 film)"},
    {label:"Cinderella (1950 film)"}, {label:"Fantasia (1940 film)"}, {label:"The Jungle Book (1967 film)"},
    {label:"Mulan (1998 film)"}, {label:"Sleeping Beauty (1959 film)"}, {label:"Pinocchio (1940 film)"},
    {label:"My Neighbor Totoro"}, {label:"Akira (1988 film)"}, {label:"An American Tail"},
    {label:"The Iron Giant"}, {label:"Howl's Moving Castle (film)"}, {label:"Tarzan (1999 film)"},
    {label:"Pocahontas (1995 film)"}, {label:"The Hunchback of Notre Dame (1996 film)"}
  ]},
  { name: "Pixar Movies", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Toy Story"}, {label:"Up (2009 film)"}, {label:"Inside Out (2015 film)"}, {label:"Coco (2017 film)"}, {label:"Ratatouille (film)"}
  ], itemPool: [
    {label:"Toy Story"}, {label:"Up (2009 film)"}, {label:"Inside Out (2015 film)"}, {label:"Coco (2017 film)"}, {label:"Ratatouille (film)"},
    {label:"Finding Nemo"}, {label:"The Incredibles"}, {label:"WALL-E"}, {label:"Monsters, Inc."},
    {label:"Toy Story 3"}, {label:"Finding Dory"}, {label:"Brave (2012 film)"}, {label:"Soul (2020 film)"},
    {label:"Turning Red"}, {label:"Luca (2021 film)"}, {label:"Onward (film)"}, {label:"A Bug's Life"},
    {label:"Toy Story 2"}, {label:"Cars (film)"}, {label:"The Good Dinosaur"},
    {label:"Inside Out 2"}, {label:"Elemental (2023 film)"}
  ]},
  { name: "DreamWorks Animation", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Shrek"}, {label:"How to Train Your Dragon"}, {label:"Kung Fu Panda"}, {label:"Madagascar"}, {label:"Megamind"}
  ], itemPool: [
    {label:"Shrek"}, {label:"How to Train Your Dragon"}, {label:"Kung Fu Panda"}, {label:"Madagascar"}, {label:"Megamind"},
    {label:"Shrek 2"}, {label:"Puss in Boots: The Last Wish"}, {label:"The Prince of Egypt"},
    {label:"Bee Movie"}, {label:"Over the Hedge"}, {label:"Monsters vs. Aliens"},
    {label:"The Croods"}, {label:"The Boss Baby"}, {label:"Trolls (film)"},
    {label:"Spirit: Stallion of the Cimarron"}, {label:"Antz"}, {label:"Chicken Run"},
    {label:"Wallace & Gromit: The Curse of the Were-Rabbit"}, {label:"Flushed Away"},
    {label:"Kung Fu Panda 2"}, {label:"How to Train Your Dragon 2"}
  ]},
  { name: "Superhero Movies", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Dark Knight"}, {label:"Avengers: Endgame"}, {label:"Spider-Man: Into the Spider-Verse"},
    {label:"Iron Man (2008 film)"}, {label:"Black Panther (film)"}
  ], itemPool: [
    {label:"The Dark Knight"}, {label:"Avengers: Endgame"}, {label:"Spider-Man: Into the Spider-Verse"},
    {label:"Iron Man (2008 film)"}, {label:"Black Panther (film)"}, {label:"Logan (film)"},
    {label:"The Avengers (2012 film)"}, {label:"Spider-Man: No Way Home"}, {label:"Guardians of the Galaxy (film)"},
    {label:"Thor: Ragnarok"}, {label:"Captain America: The Winter Soldier"}, {label:"Wonder Woman (2017 film)"},
    {label:"Batman Begins"}, {label:"X-Men: Days of Future Past"}, {label:"Deadpool (film)"},
    {label:"Doctor Strange (2016 film)"}, {label:"Shazam! (film)"}, {label:"Spider-Man 2"},
    {label:"Superman (1978 film)"}, {label:"Avengers: Infinity War"}, {label:"Ant-Man"},
    {label:"Captain America: Civil War"}, {label:"Aquaman (film)"}
  ]},
  { name: "Rom-Com Favorites", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"When Harry Met Sally..."}, {label:"Notting Hill (film)"}, {label:"10 Things I Hate About You"},
    {label:"Crazy Rich Asians (film)"}, {label:"Love Actually (film)"}
  ], itemPool: [
    {label:"When Harry Met Sally..."}, {label:"Notting Hill (film)"}, {label:"10 Things I Hate About You"},
    {label:"Crazy Rich Asians (film)"}, {label:"Love Actually (film)"}, {label:"Bridget Jones's Diary (film)"},
    {label:"Pretty Woman"}, {label:"The Proposal (film)"}, {label:"Sleepless in Seattle"},
    {label:"You've Got Mail"}, {label:"Clueless"}, {label:"My Big Fat Greek Wedding"},
    {label:"Hitch (film)"}, {label:"13 Going on 30"}, {label:"Mean Girls"},
    {label:"She's the Man"}, {label:"The Holiday (film)"}, {label:"Set It Up"},
    {label:"Always Be My Maybe (2019 film)"}, {label:"To All the Boys I've Loved Before (film)"},
    {label:"50 First Dates"}, {label:"How to Lose a Guy in 10 Days"}, {label:"Sweet Home Alabama (film)"}
  ]},
  { name: "Best Picture Winners", mood: "movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Godfather"}, {label:"The Silence of the Lambs (1991 film)"}, {label:"No Country for Old Men (film)"},
    {label:"The Departed"}, {label:"Parasite (film)"}
  ], itemPool: [
    {label:"The Godfather"}, {label:"The Silence of the Lambs (1991 film)"}, {label:"No Country for Old Men (film)"},
    {label:"The Departed"}, {label:"Parasite (film)"}, {label:"Schindler's List"},
    {label:"Forrest Gump"}, {label:"The Shawshank Redemption"}, {label:"Gladiator (2000 film)"},
    {label:"Braveheart"}, {label:"Titanic (1997 film)"}, {label:"American Beauty (1999 film)"},
    {label:"A Beautiful Mind (film)"}, {label:"Chicago (2002 film)"}, {label:"The Lord of the Rings: The Return of the King"},
    {label:"Million Dollar Baby"}, {label:"Crash (2004 film)"}, {label:"Slumdog Millionaire"},
    {label:"The Hurt Locker"}, {label:"12 Years a Slave (film)"}, {label:"Moonlight (2016 film)"},
    {label:"The Shape of Water"}, {label:"Green Book (film)"}, {label:"Nomadland"},
    {label:"CODA (2021 film)"}
  ]},

  // ---- TV (TMDB) ----
  { name: "Popular TV Dramas", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"Breaking Bad"}, {label:"Game of Thrones"}, {label:"The Crown (TV series)"},
    {label:"Stranger Things"}, {label:"The Last of Us (TV series)"}
  ], itemPool: [
    {label:"Breaking Bad"}, {label:"Game of Thrones"}, {label:"The Crown (TV series)"},
    {label:"Stranger Things"}, {label:"The Last of Us (TV series)"}, {label:"The Walking Dead"},
    {label:"Lost (TV series)"}, {label:"This Is Us"}, {label:"Yellowstone (American TV series)"},
    {label:"Grey's Anatomy"}, {label:"The Handmaid's Tale (TV series)"}, {label:"Better Call Saul"},
    {label:"Ozark (TV series)"}, {label:"Succession (TV series)"}, {label:"House of Cards (American TV series)"},
    {label:"Westworld (TV series)"}, {label:"The Mandalorian"}, {label:"Peaky Blinders"},
    {label:"Mare of Easttown"}, {label:"Big Little Lies (TV series)"}, {label:"Euphoria (American TV series)"},
    {label:"Severance (TV series)"}, {label:"The Bear (TV series)"}, {label:"Shogun (2024 miniseries)"},
    {label:"Wednesday (TV series)"}
  ]},
  { name: "Sitcoms", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"Friends (TV series)"}, {label:"The Office (American TV series)"}, {label:"Parks and Recreation"},
    {label:"Seinfeld"}, {label:"Brooklyn Nine-Nine"}
  ], itemPool: [
    {label:"Friends (TV series)"}, {label:"The Office (American TV series)"}, {label:"Parks and Recreation"},
    {label:"Seinfeld"}, {label:"Brooklyn Nine-Nine"}, {label:"How I Met Your Mother"},
    {label:"Modern Family"}, {label:"The Big Bang Theory"}, {label:"Schitt's Creek"},
    {label:"New Girl"}, {label:"30 Rock"}, {label:"Arrested Development"},
    {label:"Scrubs (TV series)"}, {label:"It's Always Sunny in Philadelphia"}, {label:"Ted Lasso"},
    {label:"The Good Place"}, {label:"Community (TV series)"}, {label:"Curb Your Enthusiasm"},
    {label:"Frasier"}, {label:"Abbott Elementary"}, {label:"Superstore (TV series)"},
    {label:"What We Do in the Shadows (TV series)"}, {label:"Only Murders in the Building"},
    {label:"Fresh Off the Boat"}, {label:"Veep"}
  ]},
  { name: "Prestige TV", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"The Sopranos"}, {label:"Mad Men"}, {label:"The Wire (TV series)"}, {label:"The Leftovers (TV series)"}, {label:"Succession (TV series)"}
  ], itemPool: [
    {label:"The Sopranos"}, {label:"Mad Men"}, {label:"The Wire (TV series)"}, {label:"The Leftovers (TV series)"}, {label:"Succession (TV series)"},
    {label:"Breaking Bad"}, {label:"Six Feet Under (TV series)"}, {label:"Deadwood (TV series)"},
    {label:"The Americans (2013 TV series)"}, {label:"Fargo (TV series)"}, {label:"True Detective"},
    {label:"Boardwalk Empire"}, {label:"Halt and Catch Fire"}, {label:"Rectify"},
    {label:"Mr. Robot"}, {label:"Better Call Saul"}, {label:"Ozark (TV series)"},
    {label:"The Bear (TV series)"}, {label:"Severance (TV series)"}, {label:"Chernobyl (miniseries)"},
    {label:"Band of Brothers"}, {label:"The West Wing"}, {label:"Homeland (TV series)"}
  ]},
  { name: "Crime Series", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"True Detective"}, {label:"Narcos"}, {label:"Mindhunter (TV series)"}, {label:"Broadchurch"}, {label:"Fargo (TV series)"}
  ], itemPool: [
    {label:"True Detective"}, {label:"Narcos"}, {label:"Mindhunter (TV series)"}, {label:"Broadchurch"}, {label:"Fargo (TV series)"},
    {label:"Ozark (TV series)"}, {label:"Dexter (TV series)"}, {label:"Breaking Bad"},
    {label:"The Killing (American TV series)"}, {label:"Mare of Easttown"}, {label:"Sherlock (TV series)"},
    {label:"Luther (TV series)"}, {label:"Peaky Blinders"}, {label:"Line of Duty"},
    {label:"The Night Of"}, {label:"Criminal Minds"}, {label:"NCIS"},
    {label:"CSI: Crime Scene Investigation"}, {label:"Law & Order"}, {label:"Hannibal (TV series)"},
    {label:"Killing Eve"}, {label:"Bosch (TV series)"}, {label:"Better Call Saul"}
  ]},
  { name: "Fantasy TV", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"The Witcher (TV series)"}, {label:"House of the Dragon"}, {label:"His Dark Materials (TV series)"},
    {label:"Shadow and Bone"}, {label:"The Sandman (TV series)"}
  ], itemPool: [
    {label:"The Witcher (TV series)"}, {label:"House of the Dragon"}, {label:"His Dark Materials (TV series)"},
    {label:"Shadow and Bone"}, {label:"The Sandman (TV series)"}, {label:"Game of Thrones"},
    {label:"The Lord of the Rings: The Rings of Power"}, {label:"Merlin (TV series)"}, {label:"The Wheel of Time (TV series)"},
    {label:"Once Upon a Time (TV series)"}, {label:"Outlander (TV series)"}, {label:"Good Omens (TV series)"},
    {label:"Supernatural (American TV series)"}, {label:"Xena: Warrior Princess"}, {label:"Buffy the Vampire Slayer"},
    {label:"Legend of the Seeker"}, {label:"Penny Dreadful (TV series)"}, {label:"American Gods (TV series)"},
    {label:"Carnival Row"}, {label:"The Dark Crystal: Age of Resistance"}, {label:"Willow (TV series)"}
  ]},
  { name: "Animated TV", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"Rick and Morty"}, {label:"BoJack Horseman"}, {label:"Adventure Time"}, {label:"Avatar: The Last Airbender"}, {label:"The Simpsons"}
  ], itemPool: [
    {label:"Rick and Morty"}, {label:"BoJack Horseman"}, {label:"Adventure Time"}, {label:"Avatar: The Last Airbender"}, {label:"The Simpsons"},
    {label:"Family Guy"}, {label:"South Park"}, {label:"Futurama"}, {label:"Bob's Burgers"},
    {label:"Archer (TV series)"}, {label:"SpongeBob SquarePants"}, {label:"Gravity Falls"},
    {label:"Steven Universe"}, {label:"The Legend of Korra"}, {label:"Regular Show"},
    {label:"King of the Hill"}, {label:"Invincible (TV series)"}, {label:"Arcane (TV series)"},
    {label:"Over the Garden Wall"}, {label:"Castlevania (TV series)"}, {label:"Primal (TV series)"},
    {label:"Batman: The Animated Series"}, {label:"Samurai Jack"}, {label:"Teen Titans (TV series)"}
  ]},
  { name: "K-Drama Hits", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"Crash Landing on You"}, {label:"Squid Game"}, {label:"Guardian: The Lonely and Great God"},
    {label:"Itaewon Class"}, {label:"Vincenzo (TV series)"}
  ], itemPool: [
    {label:"Crash Landing on You"}, {label:"Squid Game"}, {label:"Guardian: The Lonely and Great God"},
    {label:"Itaewon Class"}, {label:"Vincenzo (TV series)"}, {label:"Extraordinary Attorney Woo"},
    {label:"My Love from the Star"}, {label:"Reply 1988"}, {label:"Hospital Playlist"},
    {label:"Kingdom (South Korean TV series)"}, {label:"Sky Castle"}, {label:"The Glory (TV series)"},
    {label:"All of Us Are Dead"}, {label:"Hometown Cha-Cha-Cha"}, {label:"Start-Up (South Korean TV series)"},
    {label:"True Beauty (TV series)"}, {label:"Twenty-Five Twenty-One"}, {label:"Alchemy of Souls"},
    {label:"Flower of Evil (TV series)"}, {label:"Signal (South Korean TV series)"},
    {label:"Mr. Sunshine (2018 TV series)"}
  ]},
  { name: "British TV", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"Sherlock (TV series)"}, {label:"Downton Abbey"}, {label:"Black Mirror"}, {label:"Peaky Blinders"}, {label:"Doctor Who"}
  ], itemPool: [
    {label:"Sherlock (TV series)"}, {label:"Downton Abbey"}, {label:"Black Mirror"}, {label:"Peaky Blinders"}, {label:"Doctor Who"},
    {label:"The Office (UK TV series)"}, {label:"Fleabag"}, {label:"Line of Duty"},
    {label:"Luther (TV series)"}, {label:"Broadchurch"}, {label:"Killing Eve"},
    {label:"The Crown (TV series)"}, {label:"Skins (TV series)"}, {label:"Misfits (TV series)"},
    {label:"Fawlty Towers"}, {label:"Monty Python's Flying Circus"}, {label:"Blackadder"},
    {label:"The IT Crowd"}, {label:"Inbetweeners"}, {label:"Top Gear"},
    {label:"Derry Girls"}, {label:"Happy Valley (TV series)"}, {label:"Bodyguard (TV series)"}
  ]},
  { name: "Reality Competitions", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"Survivor (American TV series)"}, {label:"The Voice (franchise)"}, {label:"Top Chef"},
    {label:"The Great British Bake Off"}, {label:"RuPaul's Drag Race"}
  ], itemPool: [
    {label:"Survivor (American TV series)"}, {label:"The Voice (franchise)"}, {label:"Top Chef"},
    {label:"The Great British Bake Off"}, {label:"RuPaul's Drag Race"}, {label:"The Amazing Race"},
    {label:"American Idol"}, {label:"MasterChef"}, {label:"Project Runway"},
    {label:"Dancing with the Stars"}, {label:"Big Brother (American TV series)"}, {label:"The Bachelor (American TV series)"},
    {label:"Love Island"}, {label:"Chopped (TV series)"}, {label:"America's Got Talent"},
    {label:"The Challenge (TV series)"}, {label:"Ink Master"}, {label:"Nailed It!"},
    {label:"The Circle (American TV series)"}, {label:"Love Is Blind"}, {label:"Too Hot to Handle"}
  ]},
  { name: "Anime Series", mood: "tv", provider: "tmdb", mediaType: "tv", items: [
    {label:"Naruto"}, {label:"One Piece"}, {label:"Attack on Titan"}, {label:"Demon Slayer: Kimetsu no Yaiba"}, {label:"Fullmetal Alchemist: Brotherhood"}
  ], itemPool: [
    {label:"Naruto"}, {label:"One Piece"}, {label:"Attack on Titan"}, {label:"Demon Slayer: Kimetsu no Yaiba"}, {label:"Fullmetal Alchemist: Brotherhood"},
    {label:"Dragon Ball Z"}, {label:"Death Note (TV series)"}, {label:"Hunter × Hunter"},
    {label:"My Hero Academia"}, {label:"Jujutsu Kaisen"}, {label:"Cowboy Bebop"},
    {label:"Neon Genesis Evangelion"}, {label:"Bleach (TV series)"}, {label:"Spy × Family"},
    {label:"Chainsaw Man"}, {label:"Vinland Saga"}, {label:"Mob Psycho 100"},
    {label:"One Punch Man"}, {label:"Steins;Gate"}, {label:"Code Geass"},
    {label:"Sailor Moon"}, {label:"Yu Yu Hakusho"}, {label:"Tokyo Ghoul"},
    {label:"Sword Art Online"}, {label:"Violet Evergarden"}
  ]},

  // ---- Music & People (Wikipedia) ----
  { name: "Pop Artists", mood: "music", provider: "wiki", items: [
    {label:"Taylor Swift"}, {label:"Billie Eilish"}, {label:"The Weeknd"}, {label:"Dua Lipa"}, {label:"Harry Styles"}
  ], itemPool: [
    {label:"Taylor Swift"}, {label:"Billie Eilish"}, {label:"The Weeknd"}, {label:"Dua Lipa"}, {label:"Harry Styles"},
    {label:"Ariana Grande"}, {label:"Ed Sheeran"}, {label:"Bruno Mars"}, {label:"Adele"},
    {label:"Lady Gaga"}, {label:"Justin Bieber"}, {label:"Rihanna"}, {label:"Beyoncé"},
    {label:"Katy Perry"}, {label:"Post Malone"}, {label:"Olivia Rodrigo"}, {label:"SZA"},
    {label:"Shawn Mendes"}, {label:"Selena Gomez"}, {label:"Lizzo"}, {label:"Miley Cyrus"},
    {label:"Bad Bunny"}, {label:"Shakira"}, {label:"Lorde"}, {label:"Khalid (singer)"}
  ]},
  { name: "Rock Legends", mood: "music", provider: "wiki", items: [
    {label:"The Beatles"}, {label:"The Rolling Stones"}, {label:"Led Zeppelin"}, {label:"Queen (band)"}, {label:"Pink Floyd"}
  ], itemPool: [
    {label:"The Beatles"}, {label:"The Rolling Stones"}, {label:"Led Zeppelin"}, {label:"Queen (band)"}, {label:"Pink Floyd"},
    {label:"The Who"}, {label:"Jimi Hendrix"}, {label:"AC/DC"}, {label:"Nirvana (band)"},
    {label:"Guns N' Roses"}, {label:"The Eagles (band)"}, {label:"Aerosmith"}, {label:"U2"},
    {label:"Fleetwood Mac"}, {label:"Black Sabbath"}, {label:"The Doors"},
    {label:"Metallica"}, {label:"David Bowie"}, {label:"Red Hot Chili Peppers"},
    {label:"Foo Fighters"}, {label:"Pearl Jam"}, {label:"Radiohead"},
    {label:"The Clash"}, {label:"Creedence Clearwater Revival"}, {label:"Bon Jovi"}
  ]},
  { name: "Indie Bands", mood: "music", provider: "wiki", items: [
    {label:"The National (band)"}, {label:"Arctic Monkeys"}, {label:"Tame Impala"}, {label:"The 1975"}, {label:"Vampire Weekend"}
  ], itemPool: [
    {label:"The National (band)"}, {label:"Arctic Monkeys"}, {label:"Tame Impala"}, {label:"The 1975"}, {label:"Vampire Weekend"},
    {label:"Radiohead"}, {label:"The Strokes"}, {label:"Bon Iver"}, {label:"Fleet Foxes"},
    {label:"Arcade Fire"}, {label:"Modest Mouse"}, {label:"The Black Keys"}, {label:"Death Cab for Cutie"},
    {label:"Interpol (band)"}, {label:"Phoebe Bridgers"}, {label:"Mac DeMarco"}, {label:"Cage the Elephant"},
    {label:"Glass Animals"}, {label:"Alt-J"}, {label:"Hozier"}, {label:"Mitski"},
    {label:"Beach House (band)"}, {label:"The War on Drugs (band)"}, {label:"Mumford & Sons"},
    {label:"Florence and the Machine"}
  ]},
  { name: "Hip-Hop Artists", mood: "music", provider: "wiki", items: [
    {label:"Kendrick Lamar"}, {label:"Drake (musician)"}, {label:"J. Cole"}, {label:"Nicki Minaj"}, {label:"Travis Scott"}
  ], itemPool: [
    {label:"Kendrick Lamar"}, {label:"Drake (musician)"}, {label:"J. Cole"}, {label:"Nicki Minaj"}, {label:"Travis Scott"},
    {label:"Kanye West"}, {label:"Jay-Z"}, {label:"Eminem"}, {label:"Lil Wayne"},
    {label:"Cardi B"}, {label:"Megan Thee Stallion"}, {label:"21 Savage"}, {label:"Tyler, the Creator"},
    {label:"A$AP Rocky"}, {label:"Future (rapper)"}, {label:"Childish Gambino"}, {label:"Mac Miller"},
    {label:"Lil Nas X"}, {label:"Jack Harlow"}, {label:"Doja Cat"}, {label:"Metro Boomin"},
    {label:"Post Malone"}, {label:"Chance the Rapper"}, {label:"Ice Cube"}, {label:"Snoop Dogg"}
  ]},
  { name: "Country Artists", mood: "music", provider: "wiki", items: [
    {label:"Luke Combs"}, {label:"Carrie Underwood"}, {label:"Chris Stapleton"}, {label:"Kacey Musgraves"}, {label:"Morgan Wallen"}
  ], itemPool: [
    {label:"Luke Combs"}, {label:"Carrie Underwood"}, {label:"Chris Stapleton"}, {label:"Kacey Musgraves"}, {label:"Morgan Wallen"},
    {label:"Johnny Cash"}, {label:"Dolly Parton"}, {label:"Garth Brooks"}, {label:"Shania Twain"},
    {label:"Tim McGraw"}, {label:"Faith Hill"}, {label:"Keith Urban"}, {label:"Blake Shelton"},
    {label:"Miranda Lambert"}, {label:"Zac Brown Band"}, {label:"Kenny Chesney"}, {label:"George Strait"},
    {label:"Reba McEntire"}, {label:"Jason Aldean"}, {label:"Maren Morris"}, {label:"Thomas Rhett"},
    {label:"Willie Nelson"}, {label:"Lainey Wilson"}, {label:"Dierks Bentley"}, {label:"Alan Jackson"}
  ]},
  { name: "EDM DJs", mood: "music", provider: "wiki", items: [
    {label:"Calvin Harris"}, {label:"Avicii"}, {label:"Skrillex"}, {label:"Deadmau5"}, {label:"Marshmello"}
  ], itemPool: [
    {label:"Calvin Harris"}, {label:"Avicii"}, {label:"Skrillex"}, {label:"Deadmau5"}, {label:"Marshmello"},
    {label:"David Guetta"}, {label:"Tiësto"}, {label:"Martin Garrix"}, {label:"Diplo"},
    {label:"Kygo"}, {label:"Zedd"}, {label:"The Chainsmokers"}, {label:"Armin van Buuren"},
    {label:"Swedish House Mafia"}, {label:"Daft Punk"}, {label:"Flume (musician)"},
    {label:"Porter Robinson"}, {label:"Illenium"}, {label:"Above & Beyond"},
    {label:"Disclosure (band)"}, {label:"Major Lazer"}, {label:"Odesza"},
    {label:"DJ Snake"}, {label:"Alesso"}, {label:"Steve Aoki"}
  ]},
  { name: "Jazz Legends", mood: "music", provider: "wiki", items: [
    {label:"Miles Davis"}, {label:"John Coltrane"}, {label:"Ella Fitzgerald"}, {label:"Louis Armstrong"}, {label:"Duke Ellington"}
  ]},
  { name: "Classical Composers", mood: "music", provider: "wiki", items: [
    {label:"Wolfgang Amadeus Mozart"}, {label:"Ludwig van Beethoven"}, {label:"Johann Sebastian Bach"}, {label:"Pyotr Ilyich Tchaikovsky"}, {label:"Frédéric Chopin"}
  ]},
  { name: "Boy Bands", mood: "music", provider: "wiki", items: [
    {label:"BTS"}, {label:"Backstreet Boys"}, {label:"NSYNC"}, {label:"One Direction"}, {label:"Jonas Brothers"}
  ], itemPool: [
    {label:"BTS"}, {label:"Backstreet Boys"}, {label:"NSYNC"}, {label:"One Direction"}, {label:"Jonas Brothers"},
    {label:"New Kids on the Block"}, {label:"Boyz II Men"}, {label:"98 Degrees"}, {label:"Westlife"},
    {label:"New Edition"}, {label:"Take That"}, {label:"Hanson (band)"}, {label:"O-Town (group)"},
    {label:"B2K"}, {label:"Mindless Behavior"}, {label:"Big Time Rush (band)"}, {label:"Why Don't We"},
    {label:"SEVENTEEN (South Korean band)"}, {label:"EXO"}, {label:"SHINee"},
    {label:"Stray Kids"}, {label:"TXT (band)"}, {label:"GOT7"}, {label:"ENHYPEN"}, {label:"NCT (band)"}
  ]},
  { name: "Girl Groups", mood: "music", provider: "wiki", items: [
    {label:"BLACKPINK"}, {label:"Spice Girls"}, {label:"Destiny's Child"}, {label:"Little Mix"}, {label:"Fifth Harmony"}
  ], itemPool: [
    {label:"BLACKPINK"}, {label:"Spice Girls"}, {label:"Destiny's Child"}, {label:"Little Mix"}, {label:"Fifth Harmony"},
    {label:"TLC (group)"}, {label:"The Supremes"}, {label:"En Vogue"}, {label:"The Pussycat Dolls"},
    {label:"Girls' Generation"}, {label:"TWICE"}, {label:"Red Velvet"}, {label:"(G)I-dle"},
    {label:"Sugababes"}, {label:"All Saints (group)"}, {label:"Girls Aloud"}, {label:"Atomic Kitten"},
    {label:"The Bangles"}, {label:"Wilson Phillips"}, {label:"Salt-N-Pepa"},
    {label:"aespa"}, {label:"ITZY"}, {label:"NewJeans"}, {label:"IVE (group)"}, {label:"Le Sserafim"}
  ]},

  // ---- Food & Drink (Wikipedia) ----
  { name: "Foods", mood: "food", provider: "wiki", items: [
    {label:"Pizza"}, {label:"Sushi"}, {label:"Hamburger"}, {label:"Taco"}, {label:"Ramen"}
  ], itemPool: [
    {label:"Pizza"}, {label:"Sushi"}, {label:"Hamburger"}, {label:"Taco"}, {label:"Ramen"},
    {label:"Pad thai"}, {label:"Steak"}, {label:"Fried chicken"}, {label:"Pasta"}, {label:"Curry"},
    {label:"Dumpling"}, {label:"Burrito"}
  ]},
  { name: "Italian Dishes", mood: "food", provider: "wiki", items: [
    {label:"Lasagna"}, {label:"Risotto"}, {label:"Carbonara"}, {label:"Pizza Margherita"}, {label:"Tiramisu"}
  ], itemPool: [
    {label:"Lasagna"}, {label:"Risotto"}, {label:"Carbonara"}, {label:"Pizza Margherita"}, {label:"Tiramisu"},
    {label:"Osso buco"}, {label:"Gnocchi"}, {label:"Bruschetta"}, {label:"Panna cotta"}, {label:"Minestrone"},
    {label:"Focaccia"}, {label:"Arancini"}
  ]},
  { name: "Japanese Dishes", mood: "food", provider: "wiki", items: [
    {label:"Ramen"}, {label:"Tempura"}, {label:"Okonomiyaki"}, {label:"Tonkatsu"}, {label:"Sushi"}
  ], itemPool: [
    {label:"Ramen"}, {label:"Tempura"}, {label:"Okonomiyaki"}, {label:"Tonkatsu"}, {label:"Sushi"},
    {label:"Yakitori"}, {label:"Udon"}, {label:"Miso soup"}, {label:"Gyoza"}, {label:"Katsu curry"},
    {label:"Takoyaki"}, {label:"Onigiri"}
  ]},
  { name: "Mexican Dishes", mood: "food", provider: "wiki", items: [
    {label:"Tacos al pastor"}, {label:"Enchilada"}, {label:"Chile relleno"}, {label:"Mole sauce"}, {label:"Quesadilla"}
  ], itemPool: [
    {label:"Tacos al pastor"}, {label:"Enchilada"}, {label:"Chile relleno"}, {label:"Mole sauce"}, {label:"Quesadilla"},
    {label:"Tamale"}, {label:"Churro"}, {label:"Pozole"}, {label:"Elote"}, {label:"Chilaquiles"},
    {label:"Burrito"}, {label:"Guacamole"}
  ]},
  { name: "Indian Dishes", mood: "food", provider: "wiki", items: [
    {label:"Butter chicken"}, {label:"Biryani"}, {label:"Masala dosa"}, {label:"Palak paneer"}, {label:"Rogan josh"}
  ], itemPool: [
    {label:"Butter chicken"}, {label:"Biryani"}, {label:"Masala dosa"}, {label:"Palak paneer"}, {label:"Rogan josh"},
    {label:"Tandoori chicken"}, {label:"Samosa"}, {label:"Naan"}, {label:"Chana masala"}, {label:"Vindaloo"},
    {label:"Dal makhani"}, {label:"Gulab jamun"}
  ]},
  { name: "Breakfast Foods", mood: "food", provider: "wiki", items: [
    {label:"Pancake"}, {label:"French toast"}, {label:"Omelette"}, {label:"Bagel"}, {label:"Waffle"}
  ], itemPool: [
    {label:"Pancake"}, {label:"French toast"}, {label:"Omelette"}, {label:"Bagel"}, {label:"Waffle"},
    {label:"Eggs Benedict"}, {label:"Croissant"}, {label:"Granola"}, {label:"Breakfast burrito"}, {label:"Acai bowl"}
  ]},
  { name: "Desserts", mood: "food", provider: "wiki", items: [
    {label:"Cheesecake"}, {label:"Brownie"}, {label:"Doughnut"}, {label:"Apple pie"}, {label:"Ice cream"}
  ], itemPool: [
    {label:"Cheesecake"}, {label:"Brownie"}, {label:"Doughnut"}, {label:"Apple pie"}, {label:"Ice cream"},
    {label:"Crème brûlée"}, {label:"Macaron"}, {label:"Churro"}, {label:"Cannoli"}, {label:"Baklava"},
    {label:"Mochi"}, {label:"Panna cotta"}
  ]},
  { name: "Cheeses", mood: "food", provider: "wiki", items: [
    {label:"Cheddar cheese"}, {label:"Mozzarella"}, {label:"Brie cheese"}, {label:"Gouda cheese"}, {label:"Parmigiano Reggiano"}
  ], itemPool: [
    {label:"Cheddar cheese"}, {label:"Mozzarella"}, {label:"Brie"}, {label:"Gouda cheese"}, {label:"Parmigiano Reggiano"},
    {label:"Gruyère cheese"}, {label:"Camembert"}, {label:"Manchego"}, {label:"Feta cheese"}, {label:"Roquefort"}
  ]},
  { name: "Street Foods", mood: "food", provider: "wiki", items: [
    {label:"Falafel"}, {label:"Bánh mì"}, {label:"Arepa"}, {label:"Poutine"}, {label:"Samosa"}
  ], itemPool: [
    {label:"Falafel"}, {label:"Bánh mì"}, {label:"Arepa"}, {label:"Poutine"}, {label:"Samosa"},
    {label:"Empanada"}, {label:"Gyoza"}, {label:"Churro"}, {label:"Takoyaki"}, {label:"Jerk chicken"},
    {label:"Currywurst"}, {label:"Shawarma"}
  ]},
  { name: "Beverages", mood: "food", provider: "wiki", items: [
    {label:"Coffee"}, {label:"Tea"}, {label:"Lemonade"}, {label:"Hot chocolate"}, {label:"Smoothie"}
  ], itemPool: [
    {label:"Coffee"}, {label:"Tea"}, {label:"Lemonade"}, {label:"Hot chocolate"}, {label:"Smoothie"},
    {label:"Matcha"}, {label:"Kombucha"}, {label:"Horchata"}, {label:"Chai tea"}, {label:"Bubble tea"}
  ]},

  // ---- Animals & Nature (Wikipedia) ----
  { name: "Big Cats", mood: "animals", provider: "wiki", items: [
    {label:"Lion"}, {label:"Tiger"}, {label:"Leopard"}, {label:"Cheetah"}, {label:"Jaguar (animal)"}
  ]},
  { name: "Dog Breeds", mood: "animals", provider: "wiki", items: [
    {label:"Labrador Retriever"}, {label:"German Shepherd"}, {label:"Bulldog"}, {label:"Poodle"}, {label:"Beagle"}
  ]},
  { name: "Cat Breeds", mood: "animals", provider: "wiki", items: [
    {label:"Persian cat"}, {label:"Siamese cat"}, {label:"Maine Coon"}, {label:"Bengal cat"}, {label:"Sphynx cat"}
  ]},
  { name: "Birds", mood: "animals", provider: "wiki", items: [
    {label:"Parrot"}, {label:"Owl"}, {label:"Penguin"}, {label:"Flamingo"}, {label:"Eagle"}
  ]},
  { name: "Sea Creatures", mood: "animals", provider: "wiki", items: [
    {label:"Dolphin"}, {label:"Shark"}, {label:"Octopus"}, {label:"Sea turtle"}, {label:"Whale"}
  ]},
  { name: "Dinosaurs", mood: "animals", provider: "wiki", items: [
    {label:"Tyrannosaurus"}, {label:"Triceratops"}, {label:"Stegosaurus"}, {label:"Velociraptor"}, {label:"Brachiosaurus"}
  ]},
  { name: "Insects", mood: "animals", provider: "wiki", items: [
    {label:"Butterfly"}, {label:"Dragonfly"}, {label:"Ladybird"}, {label:"Honey bee"}, {label:"Ant"}
  ]},
  { name: "Bears", mood: "animals", provider: "wiki", items: [
    {label:"Polar bear"}, {label:"Grizzly bear"}, {label:"Giant panda"}, {label:"American black bear"}, {label:"Brown bear"}
  ]},
  { name: "Primates", mood: "animals", provider: "wiki", items: [
    {label:"Chimpanzee"}, {label:"Gorilla"}, {label:"Orangutan"}, {label:"Gibbon"}, {label:"Baboon"}
  ]},
  { name: "Horse Breeds", mood: "animals", provider: "wiki", items: [
    {label:"Arabian horse"}, {label:"Thoroughbred"}, {label:"Clydesdale horse"}, {label:"Mustang (horse)"}, {label:"Friesian horse"}
  ]},

  // ---- Places & Travel (Wikipedia) ----
  { name: "European Cities", mood: "places", provider: "wiki", items: [
    {label:"Paris"}, {label:"London"}, {label:"Rome"}, {label:"Berlin"}, {label:"Barcelona"}
  ]},
  { name: "US National Parks", mood: "places", provider: "wiki", items: [
    {label:"Yellowstone National Park"}, {label:"Yosemite National Park"}, {label:"Grand Canyon National Park"},
    {label:"Zion National Park"}, {label:"Acadia National Park"}
  ]},
  { name: "World Landmarks", mood: "places", provider: "wiki", items: [
    {label:"Eiffel Tower"}, {label:"Great Wall of China"}, {label:"Taj Mahal"}, {label:"Machu Picchu"}, {label:"Statue of Liberty"}
  ]},
  { name: "Beaches", mood: "places", provider: "wiki", items: [
    {label:"Bondi Beach"}, {label:"Waikiki Beach"}, {label:"Copacabana, Rio de Janeiro"}, {label:"Whitehaven Beach"}, {label:"Navagio"}
  ]},
  { name: "Mountains", mood: "places", provider: "wiki", items: [
    {label:"Mount Everest"}, {label:"K2"}, {label:"Matterhorn"}, {label:"Mount Fuji"}, {label:"Kilimanjaro"}
  ]},
  { name: "Islands", mood: "places", provider: "wiki", items: [
    {label:"Santorini"}, {label:"Bali"}, {label:"Maui"}, {label:"Iceland"}, {label:"Seychelles"}
  ]},
  { name: "US Cities", mood: "places", provider: "wiki", items: [
    {label:"New York City"}, {label:"Los Angeles"}, {label:"Chicago"}, {label:"Miami"}, {label:"Seattle"}
  ]},
  { name: "Asian Cities", mood: "places", provider: "wiki", items: [
    {label:"Tokyo"}, {label:"Seoul"}, {label:"Singapore"}, {label:"Bangkok"}, {label:"Hong Kong"}
  ]},
  { name: "Castles", mood: "places", provider: "wiki", items: [
    {label:"Neuschwanstein Castle"}, {label:"Edinburgh Castle"}, {label:"Himeji Castle"}, {label:"Windsor Castle"}, {label:"Bran Castle"}
  ]},
  { name: "Museums", mood: "places", provider: "wiki", items: [
    {label:"Louvre"}, {label:"British Museum"}, {label:"Metropolitan Museum of Art"}, {label:"Prado Museum"}, {label:"Hermitage Museum"}
  ]},

  // ---- Sports (Wikipedia) ----
  { name: "NBA Teams", mood: "sports", provider: "wiki", items: [
    {label:"Los Angeles Lakers"}, {label:"Boston Celtics"}, {label:"Golden State Warriors"}, {label:"Chicago Bulls"}, {label:"Miami Heat"}
  ], itemPool: [
    {label:"Los Angeles Lakers"}, {label:"Boston Celtics"}, {label:"Golden State Warriors"}, {label:"Chicago Bulls"}, {label:"Miami Heat"},
    {label:"San Antonio Spurs"}, {label:"Philadelphia 76ers"}, {label:"New York Knicks"}, {label:"Brooklyn Nets"},
    {label:"Dallas Mavericks"}, {label:"Houston Rockets"}, {label:"Phoenix Suns"}, {label:"Milwaukee Bucks"},
    {label:"Denver Nuggets"}, {label:"Toronto Raptors"}, {label:"Portland Trail Blazers"},
    {label:"Cleveland Cavaliers"}, {label:"Detroit Pistons"}, {label:"Atlanta Hawks"},
    {label:"Los Angeles Clippers"}, {label:"Oklahoma City Thunder"}, {label:"Minnesota Timberwolves"},
    {label:"Sacramento Kings"}, {label:"Memphis Grizzlies"}, {label:"Indiana Pacers"}
  ]},
  { name: "NFL Teams", mood: "sports", provider: "wiki", items: [
    {label:"New England Patriots"}, {label:"Dallas Cowboys"}, {label:"Green Bay Packers"}, {label:"Pittsburgh Steelers"}, {label:"San Francisco 49ers"}
  ], itemPool: [
    {label:"New England Patriots"}, {label:"Dallas Cowboys"}, {label:"Green Bay Packers"}, {label:"Pittsburgh Steelers"}, {label:"San Francisco 49ers"},
    {label:"Kansas City Chiefs"}, {label:"Philadelphia Eagles"}, {label:"Buffalo Bills"}, {label:"Baltimore Ravens"},
    {label:"Minnesota Vikings"}, {label:"Seattle Seahawks"}, {label:"Denver Broncos"}, {label:"Chicago Bears"},
    {label:"New York Giants"}, {label:"Miami Dolphins"}, {label:"Las Vegas Raiders"},
    {label:"Tampa Bay Buccaneers"}, {label:"Los Angeles Rams"}, {label:"Cincinnati Bengals"},
    {label:"Tennessee Titans"}, {label:"Detroit Lions"}, {label:"New Orleans Saints"},
    {label:"Cleveland Browns"}, {label:"Jacksonville Jaguars"}, {label:"Arizona Cardinals"}
  ]},
  { name: "Soccer Clubs", mood: "sports", provider: "wiki", items: [
    {label:"Real Madrid CF"}, {label:"FC Barcelona"}, {label:"Manchester United F.C."}, {label:"FC Bayern Munich"}, {label:"Paris Saint-Germain F.C."}
  ], itemPool: [
    {label:"Real Madrid CF"}, {label:"FC Barcelona"}, {label:"Manchester United F.C."}, {label:"FC Bayern Munich"}, {label:"Paris Saint-Germain F.C."},
    {label:"Liverpool F.C."}, {label:"Manchester City F.C."}, {label:"Chelsea F.C."}, {label:"Arsenal F.C."},
    {label:"Juventus F.C."}, {label:"AC Milan"}, {label:"Inter Milan"}, {label:"Borussia Dortmund"},
    {label:"Tottenham Hotspur F.C."}, {label:"Atlético Madrid"}, {label:"Ajax Amsterdam"},
    {label:"Benfica"}, {label:"Porto F.C."}, {label:"Napoli"},
    {label:"AS Roma"}, {label:"Flamengo"}, {label:"Santos FC"}, {label:"Boca Juniors"},
    {label:"River Plate"}, {label:"Celtic F.C."}
  ]},
  { name: "Tennis Players", mood: "sports", provider: "wiki", mediaType: "person", items: [
    {label:"Roger Federer"}, {label:"Rafael Nadal"}, {label:"Novak Djokovic"}, {label:"Serena Williams"}, {label:"Naomi Osaka"}
  ], itemPool: [
    {label:"Roger Federer"}, {label:"Rafael Nadal"}, {label:"Novak Djokovic"}, {label:"Serena Williams"}, {label:"Naomi Osaka"},
    {label:"Steffi Graf"}, {label:"Pete Sampras"}, {label:"Andre Agassi"}, {label:"Venus Williams"},
    {label:"Billie Jean King"}, {label:"Boris Becker"}, {label:"John McEnroe"}, {label:"Bjorn Borg"},
    {label:"Andy Murray"}, {label:"Maria Sharapova"}, {label:"Iga Świątek"}, {label:"Carlos Alcaraz"},
    {label:"Coco Gauff"}, {label:"Arthur Ashe"}, {label:"Rod Laver"}, {label:"Martina Navratilova"},
    {label:"Simona Halep"}, {label:"Ashleigh Barty"}, {label:"Daniil Medvedev"}
  ]},
  { name: "Olympians", mood: "sports", provider: "wiki", mediaType: "person", items: [
    {label:"Michael Phelps"}, {label:"Usain Bolt"}, {label:"Simone Biles"}, {label:"Katie Ledecky"}, {label:"Carl Lewis"}
  ], itemPool: [
    {label:"Michael Phelps"}, {label:"Usain Bolt"}, {label:"Simone Biles"}, {label:"Katie Ledecky"}, {label:"Carl Lewis"},
    {label:"Jesse Owens"}, {label:"Nadia Comăneci"}, {label:"Mark Spitz"}, {label:"Jackie Joyner-Kersee"},
    {label:"Muhammad Ali"}, {label:"Ian Thorpe"}, {label:"Shaun White"}, {label:"Allyson Felix"},
    {label:"Mo Farah"}, {label:"Eliud Kipchoge"}, {label:"Larisa Latynina"}, {label:"Paavo Nurmi"},
    {label:"Florence Griffith-Joyner"}, {label:"Sebastian Coe"}, {label:"Gabby Douglas"},
    {label:"Kohei Uchimura"}, {label:"Suni Lee"}, {label:"Yuzuru Hanyu"}, {label:"Cathy Freeman"}
  ]},
  { name: "Formula 1 Drivers", mood: "sports", provider: "wiki", mediaType: "person", items: [
    {label:"Lewis Hamilton"}, {label:"Max Verstappen"}, {label:"Sebastian Vettel"}, {label:"Ayrton Senna"}, {label:"Michael Schumacher"}
  ], itemPool: [
    {label:"Lewis Hamilton"}, {label:"Max Verstappen"}, {label:"Sebastian Vettel"}, {label:"Ayrton Senna"}, {label:"Michael Schumacher"},
    {label:"Alain Prost"}, {label:"Niki Lauda"}, {label:"Fernando Alonso"}, {label:"Kimi Räikkönen"},
    {label:"Mika Häkkinen"}, {label:"Nigel Mansell"}, {label:"Juan Manuel Fangio"}, {label:"Jenson Button"},
    {label:"Daniel Ricciardo"}, {label:"Charles Leclerc"}, {label:"Lando Norris"}, {label:"Carlos Sainz Jr."},
    {label:"George Russell (racing driver)"}, {label:"James Hunt"}, {label:"Jackie Stewart"},
    {label:"Nelson Piquet"}, {label:"Damon Hill"}, {label:"Rubens Barrichello"},
    {label:"Valtteri Bottas"}, {label:"Pierre Gasly"}
  ]},
  { name: "MLB Teams", mood: "sports", provider: "wiki", items: [
    {label:"New York Yankees"}, {label:"Los Angeles Dodgers"}, {label:"Boston Red Sox"}, {label:"Chicago Cubs"}, {label:"San Francisco Giants"}
  ], itemPool: [
    {label:"New York Yankees"}, {label:"Los Angeles Dodgers"}, {label:"Boston Red Sox"}, {label:"Chicago Cubs"}, {label:"San Francisco Giants"},
    {label:"St. Louis Cardinals"}, {label:"Atlanta Braves"}, {label:"Houston Astros"}, {label:"Philadelphia Phillies"},
    {label:"New York Mets"}, {label:"Detroit Tigers"}, {label:"Cincinnati Reds"}, {label:"Oakland Athletics"},
    {label:"Cleveland Guardians"}, {label:"Minnesota Twins"}, {label:"Pittsburgh Pirates"},
    {label:"Baltimore Orioles"}, {label:"Toronto Blue Jays"}, {label:"Texas Rangers (baseball)"},
    {label:"San Diego Padres"}, {label:"Milwaukee Brewers"}, {label:"Seattle Mariners"},
    {label:"Colorado Rockies"}, {label:"Tampa Bay Rays"}, {label:"Arizona Diamondbacks"}
  ]},
  { name: "NHL Teams", mood: "sports", provider: "wiki", items: [
    {label:"Montreal Canadiens"}, {label:"Toronto Maple Leafs"}, {label:"Detroit Red Wings"}, {label:"Chicago Blackhawks"}, {label:"New York Rangers"}
  ], itemPool: [
    {label:"Montreal Canadiens"}, {label:"Toronto Maple Leafs"}, {label:"Detroit Red Wings"}, {label:"Chicago Blackhawks"}, {label:"New York Rangers"},
    {label:"Boston Bruins"}, {label:"Pittsburgh Penguins"}, {label:"Edmonton Oilers"}, {label:"Philadelphia Flyers"},
    {label:"Colorado Avalanche"}, {label:"Tampa Bay Lightning"}, {label:"Washington Capitals"},
    {label:"Dallas Stars"}, {label:"New Jersey Devils"}, {label:"Carolina Hurricanes"},
    {label:"Vancouver Canucks"}, {label:"Calgary Flames"}, {label:"St. Louis Blues"},
    {label:"Nashville Predators"}, {label:"Minnesota Wild"}, {label:"Florida Panthers (NHL)"},
    {label:"Ottawa Senators"}, {label:"Winnipeg Jets"}, {label:"Los Angeles Kings"},
    {label:"San Jose Sharks"}
  ]},
  { name: "Golfers", mood: "sports", provider: "wiki", mediaType: "person", items: [
    {label:"Tiger Woods"}, {label:"Jack Nicklaus"}, {label:"Rory McIlroy"}, {label:"Phil Mickelson"}, {label:"Arnold Palmer"}
  ], itemPool: [
    {label:"Tiger Woods"}, {label:"Jack Nicklaus"}, {label:"Rory McIlroy"}, {label:"Phil Mickelson"}, {label:"Arnold Palmer"},
    {label:"Ben Hogan"}, {label:"Gary Player"}, {label:"Tom Watson (golfer)"}, {label:"Seve Ballesteros"},
    {label:"Lee Trevino"}, {label:"Sam Snead"}, {label:"Bobby Jones (golfer)"}, {label:"Jordan Spieth"},
    {label:"Justin Thomas (golfer)"}, {label:"Brooks Koepka"}, {label:"Dustin Johnson"},
    {label:"Jon Rahm"}, {label:"Scottie Scheffler"}, {label:"Annika Sörenstam"}, {label:"Nancy Lopez"},
    {label:"Nelly Korda"}, {label:"Collin Morikawa"}, {label:"Bryson DeChambeau"}
  ]},
  { name: "Track Sprinters", mood: "sports", provider: "wiki", mediaType: "person", items: [
    {label:"Usain Bolt"}, {label:"Carl Lewis"}, {label:"Florence Griffith-Joyner"}, {label:"Shelly-Ann Fraser-Pryce"}, {label:"Yohan Blake"}
  ], itemPool: [
    {label:"Usain Bolt"}, {label:"Carl Lewis"}, {label:"Florence Griffith-Joyner"}, {label:"Shelly-Ann Fraser-Pryce"}, {label:"Yohan Blake"},
    {label:"Jesse Owens"}, {label:"Michael Johnson"}, {label:"Justin Gatlin"}, {label:"Allyson Felix"},
    {label:"Elaine Thompson-Herah"}, {label:"Sha'Carri Richardson"}, {label:"Tyson Gay"},
    {label:"Asafa Powell"}, {label:"Marion Jones"}, {label:"Ben Johnson (sprinter)"},
    {label:"Wayde van Niekerk"}, {label:"Donovan Bailey"}, {label:"Linford Christie"},
    {label:"Noah Lyles"}, {label:"Fred Kerley"}, {label:"Tommie Smith"},
    {label:"Maurice Greene (sprinter)"}, {label:"Flo-Jo"}, {label:"Andre De Grasse"}
  ]},

  // ---- Tech & Brands (Wikipedia) ----
  { name: "Tech Companies", mood: "tech", provider: "wiki", items: [
    {label:"Google"}, {label:"Apple Inc."}, {label:"Microsoft"}, {label:"Amazon (company)"}, {label:"Meta Platforms"}
  ]},
  { name: "Smartphone Brands", mood: "tech", provider: "wiki", items: [
    {label:"Samsung"}, {label:"Apple Inc."}, {label:"Google Pixel"}, {label:"OnePlus"}, {label:"Xiaomi"}
  ]},
  { name: "Camera Brands", mood: "tech", provider: "wiki", items: [
    {label:"Canon Inc."}, {label:"Nikon Corporation"}, {label:"Sony"}, {label:"Fujifilm"}, {label:"Leica Camera"}
  ]},
  { name: "Car Brands", mood: "tech", provider: "wiki", items: [
    {label:"Toyota"}, {label:"Ford Motor Company"}, {label:"BMW"}, {label:"Mercedes-Benz"}, {label:"Honda"}
  ]},
  { name: "Electric Cars", mood: "tech", provider: "wiki", items: [
    {label:"Tesla Model 3"}, {label:"Nissan Leaf"}, {label:"Chevrolet Bolt"}, {label:"Hyundai Ioniq 5"}, {label:"Volkswagen ID.4"}
  ]},
  { name: "Game Consoles", mood: "tech", provider: "wiki", items: [
    {label:"Nintendo Switch"}, {label:"PlayStation 5"}, {label:"Xbox Series X and Series S"}, {label:"Steam Deck"}, {label:"Nintendo 3DS"}
  ]},
  { name: "Programming Languages", mood: "tech", provider: "wiki", mediaType: "software", items: [
    {label:"JavaScript"}, {label:"Python (programming language)"}, {label:"Java (programming language)"},
    {label:"C Sharp (programming language)"}, {label:"Go (programming language)"}
  ]},
  { name: "JS Frameworks", mood: "tech", provider: "wiki", mediaType: "software", items: [
    {label:"React (software)"}, {label:"Vue.js"}, {label:"Angular (web framework)"}, {label:"Svelte"}, {label:"Next.js"}
  ]},
  { name: "Databases", mood: "tech", provider: "wiki", mediaType: "software", items: [
    {label:"PostgreSQL"}, {label:"MySQL"}, {label:"SQLite"}, {label:"MongoDB"}, {label:"Redis"}
  ]},
  { name: "Cloud Providers", mood: "tech", provider: "wiki", items: [
    {label:"Amazon Web Services"}, {label:"Microsoft Azure"}, {label:"Google Cloud Platform"}, {label:"IBM Cloud"}, {label:"Oracle Cloud"}
  ]},

  // ---- Games, Books, Comics (Wikipedia) ----
  { name: "Board Games", mood: "games", provider: "wiki", items: [
    {label:"Chess"}, {label:"Monopoly (game)"}, {label:"Catan"}, {label:"Scrabble"}, {label:"Ticket to Ride (board game)"}
  ]},
  { name: "Card Games", mood: "games", provider: "wiki", items: [
    {label:"Poker"}, {label:"Blackjack"}, {label:"Bridge (card game)"}, {label:"Uno (card game)"}, {label:"Hearts (card game)"}
  ]},
  { name: "Party Games", mood: "games", provider: "wiki", items: [
    {label:"Charades"}, {label:"Pictionary"}, {label:"Taboo (game)"}, {label:"Codenames (board game)"}, {label:"Telestrations"}
  ]},
  { name: "Video Game Franchises", mood: "games", provider: "wiki", items: [
    {label:"The Legend of Zelda"}, {label:"Super Mario"}, {label:"Pokémon"}, {label:"Grand Theft Auto"}, {label:"Call of Duty"}
  ], itemPool: [
    {label:"The Legend of Zelda"}, {label:"Super Mario"}, {label:"Pokémon"}, {label:"Grand Theft Auto"}, {label:"Call of Duty"},
    {label:"Halo (franchise)"}, {label:"Final Fantasy"}, {label:"Minecraft"}, {label:"The Elder Scrolls"},
    {label:"Resident Evil"}, {label:"Assassin's Creed"}, {label:"God of War (franchise)"}, {label:"Uncharted"},
    {label:"Metal Gear"}, {label:"FIFA (video game series)"}, {label:"Sonic the Hedgehog"},
    {label:"Mortal Kombat"}, {label:"Street Fighter"}, {label:"Dark Souls"}, {label:"Fallout (series)"},
    {label:"Mass Effect"}, {label:"Borderlands (series)"}, {label:"Tomb Raider"},
    {label:"Red Dead Redemption"}, {label:"BioShock (series)"}
  ]},
  { name: "Open-World Games", mood: "games", provider: "wiki", items: [
    {label:"The Witcher 3: Wild Hunt"}, {label:"Red Dead Redemption 2"}, {label:"The Elder Scrolls V: Skyrim"},
    {label:"Assassin's Creed Odyssey"}, {label:"Grand Theft Auto V"}
  ], itemPool: [
    {label:"The Witcher 3: Wild Hunt"}, {label:"Red Dead Redemption 2"}, {label:"The Elder Scrolls V: Skyrim"},
    {label:"Assassin's Creed Odyssey"}, {label:"Grand Theft Auto V"}, {label:"The Legend of Zelda: Breath of the Wild"},
    {label:"Horizon Zero Dawn"}, {label:"Elden Ring"}, {label:"Spider-Man (2018 video game)"},
    {label:"Ghost of Tsushima"}, {label:"Cyberpunk 2077"}, {label:"Fallout 4"},
    {label:"Far Cry 5"}, {label:"Assassin's Creed Valhalla"}, {label:"Horizon Forbidden West"},
    {label:"Death Stranding"}, {label:"Days Gone"}, {label:"Just Cause 3"},
    {label:"Watch Dogs 2"}, {label:"Minecraft"}, {label:"No Man's Sky"},
    {label:"Starfield (video game)"}, {label:"The Legend of Zelda: Tears of the Kingdom"}
  ]},
  { name: "Nintendo Characters", mood: "games", provider: "wiki", items: [
    {label:"Mario"}, {label:"Luigi"}, {label:"Princess Peach"}, {label:"Bowser"}, {label:"Yoshi"}
  ], itemPool: [
    {label:"Mario"}, {label:"Luigi"}, {label:"Princess Peach"}, {label:"Bowser"}, {label:"Yoshi"},
    {label:"Link (The Legend of Zelda)"}, {label:"Zelda (character)"}, {label:"Donkey Kong"},
    {label:"Kirby (character)"}, {label:"Pikachu"}, {label:"Samus Aran"}, {label:"Fox McCloud"},
    {label:"Captain Falcon"}, {label:"Toad (Nintendo)"}, {label:"Wario"}, {label:"Waluigi"},
    {label:"Meta Knight"}, {label:"Ganondorf"}, {label:"Diddy Kong"}, {label:"Princess Daisy"},
    {label:"Rosalina (character)"}, {label:"Inkling"}, {label:"Villager (Animal Crossing)"},
    {label:"Isabelle (Animal Crossing)"}, {label:"Ness (EarthBound)"}
  ]},
  { name: "Pokémon Starters", mood: "games", provider: "wiki", items: [
    {label:"Bulbasaur"}, {label:"Charmander"}, {label:"Squirtle"}, {label:"Chikorita"}, {label:"Cyndaquil"}
  ], itemPool: [
    {label:"Bulbasaur"}, {label:"Charmander"}, {label:"Squirtle"}, {label:"Chikorita"}, {label:"Cyndaquil"},
    {label:"Totodile"}, {label:"Treecko"}, {label:"Torchic"}, {label:"Mudkip"}, {label:"Turtwig"},
    {label:"Chimchar"}, {label:"Piplup"}, {label:"Snivy"}, {label:"Tepig"}, {label:"Oshawott"},
    {label:"Froakie"}, {label:"Fennekin"}, {label:"Chespin"}, {label:"Rowlet"}, {label:"Litten"},
    {label:"Popplio"}, {label:"Grookey"}, {label:"Scorbunny"}, {label:"Sobble"}, {label:"Pikachu"}
  ]},
  { name: "Zelda Games", mood: "games", provider: "wiki", items: [
    {label:"The Legend of Zelda: Ocarina of Time"}, {label:"The Legend of Zelda: Majora's Mask"},
    {label:"The Legend of Zelda: The Wind Waker"}, {label:"The Legend of Zelda: Breath of the Wild"},
    {label:"The Legend of Zelda: Tears of the Kingdom"}
  ]},
  { name: "Comic Book Villains", mood: "culture", provider: "wiki", items: [
    {label:"Joker (character)"}, {label:"Thanos"}, {label:"Loki (Marvel Comics)"}, {label:"Magneto (Marvel Comics)"}, {label:"Green Goblin (Marvel Comics)"}
  ], itemPool: [
    {label:"Joker (character)"}, {label:"Thanos"}, {label:"Loki (Marvel Comics)"}, {label:"Magneto (Marvel Comics)"}, {label:"Green Goblin (Marvel Comics)"},
    {label:"Doctor Doom"}, {label:"Venom (character)"}, {label:"Lex Luthor"}, {label:"Darkseid"},
    {label:"Catwoman"}, {label:"Kingpin (character)"}, {label:"Bane (DC Comics)"}, {label:"Deathstroke"},
    {label:"Ultron"}, {label:"Galactus"}, {label:"Red Skull"}, {label:"Mystique (character)"},
    {label:"Harley Quinn"}, {label:"Deadshot"}, {label:"Riddler"}, {label:"Scarecrow (DC Comics)"},
    {label:"Brainiac (character)"}, {label:"Apocalypse (character)"}, {label:"Hela (character)"}
  ]},
  { name: "Superheroes", mood: "culture", provider: "wiki", items: [
    {label:"Spider-Man"}, {label:"Batman"}, {label:"Superman"}, {label:"Wonder Woman"}, {label:"Iron Man"}
  ], itemPool: [
    {label:"Spider-Man"}, {label:"Batman"}, {label:"Superman"}, {label:"Wonder Woman"}, {label:"Iron Man"},
    {label:"Captain America"}, {label:"Thor (Marvel Comics)"}, {label:"Wolverine (character)"}, {label:"The Flash"},
    {label:"Hulk"}, {label:"Aquaman"}, {label:"Black Panther (character)"}, {label:"Green Lantern"},
    {label:"Deadpool"}, {label:"Black Widow (Marvel Comics)"}, {label:"Doctor Strange"},
    {label:"Hawkeye (Clint Barton)"}, {label:"Ant-Man"}, {label:"Scarlet Witch"},
    {label:"Nightwing"}, {label:"Daredevil"}, {label:"Storm (character)"}, {label:"Shazam (character)"},
    {label:"Green Arrow"}, {label:"Captain Marvel (DC Comics)"}
  ]},

  // ---- Lifestyle & Misc (Wikipedia) ----
  { name: "Fashion Brands", mood: "culture", provider: "wiki", mediaType: "fashion", items: [
    {label:"Gucci"}, {label:"Prada"}, {label:"Louis Vuitton"}, {label:"Balenciaga"}, {label:"Off-White"}
  ], itemPool: [
    {label:"Gucci"}, {label:"Prada"}, {label:"Louis Vuitton"}, {label:"Balenciaga"}, {label:"Off-White"},
    {label:"Chanel"}, {label:"Dior"}, {label:"Versace"}, {label:"Givenchy"}, {label:"Burberry"},
    {label:"Hermès"}, {label:"Fendi"}, {label:"Valentino (fashion house)"}, {label:"Saint Laurent (brand)"},
    {label:"Alexander McQueen"}, {label:"Bottega Veneta"}, {label:"Celine (brand)"}, {label:"Loewe"},
    {label:"Balmain"}, {label:"Tom Ford (brand)"}, {label:"Marc Jacobs"}, {label:"Calvin Klein"},
    {label:"Ralph Lauren"}, {label:"Nike, Inc."}, {label:"Adidas"}
  ]},
  { name: "Luxury Watches", mood: "culture", provider: "wiki", mediaType: "fashion", items: [
    {label:"Rolex"}, {label:"Omega (watchmaker)"}, {label:"Patek Philippe SA"}, {label:"Audemars Piguet"}, {label:"TAG Heuer"}
  ], itemPool: [
    {label:"Rolex"}, {label:"Omega (watchmaker)"}, {label:"Patek Philippe SA"}, {label:"Audemars Piguet"}, {label:"TAG Heuer"},
    {label:"Cartier (jeweler)"}, {label:"Breitling SA"}, {label:"IWC Schaffhausen"}, {label:"Jaeger-LeCoultre"},
    {label:"Vacheron Constantin"}, {label:"Hublot"}, {label:"Panerai"}, {label:"Tudor (watch brand)"},
    {label:"Longines"}, {label:"Tissot"}, {label:"Zenith (watchmaker)"}, {label:"Seiko"},
    {label:"Grand Seiko"}, {label:"A. Lange & Söhne"}, {label:"Blancpain"}, {label:"Girard-Perregaux"},
    {label:"Bell & Ross"}, {label:"Richard Mille"}, {label:"Chopard"}
  ]},
  { name: "Coffee Drinks", mood: "food", provider: "wiki", items: [
    {label:"Espresso"}, {label:"Latte"}, {label:"Cappuccino"}, {label:"Caffè Americano"}, {label:"Caffè mocha"}
  ]},
  { name: "Tea Varieties", mood: "food", provider: "wiki", items: [
    {label:"Green tea"}, {label:"Black tea"}, {label:"Oolong tea"}, {label:"Chamomile tea"}, {label:"Earl Grey tea"}
  ]},
  { name: "Ice Cream Flavors", mood: "food", provider: "wiki", items: [
    {label:"Vanilla ice cream"}, {label:"Chocolate ice cream"}, {label:"Strawberry ice cream"}, {label:"Mint chocolate chip"}, {label:"Cookies and cream"}
  ]},
  { name: "Hobbies", mood: "culture", provider: "wiki", mediaType: "activity", items: [
    {label:"Reading (process)"}, {label:"Gardening"}, {label:"Painting"}, {label:"Cycling (sport)"}, {label:"Cooking"}
  ]},
  { name: "School Subjects", mood: "culture", provider: "wiki", items: [
    {label:"Mathematics"}, {label:"Science"}, {label:"History"}, {label:"Literature"}, {label:"Art"}
  ]},
  { name: "Space Missions", mood: "tech", provider: "wiki", items: [
    {label:"Apollo 11"}, {label:"Voyager 1"}, {label:"Hubble Space Telescope"}, {label:"Curiosity (rover)"}, {label:"James Webb Space Telescope"}
  ]},
  { name: "Constellations", mood: "culture", provider: "wiki", items: [
    {label:"Orion (constellation)"}, {label:"Ursa Major"}, {label:"Cassiopeia (constellation)"}, {label:"Scorpius (constellation)"}, {label:"Leo (constellation)"}
  ]},
  { name: "Planets", mood: "culture", provider: "wiki", items: [
    {label:"Mercury (planet)"}, {label:"Venus (planet)"}, {label:"Earth"}, {label:"Mars (planet)"}, {label:"Jupiter (planet)"}
  ]}
];

const MORE_TOPICS = [
  // ————— Food & Drink —————
  { name:"Best Pizza Toppings", mood:"food", provider:"wiki",
    items:[{label:"Pepperoni"},{label:"Mushroom"},{label:"Italian sausage"},{label:"Mozzarella"},{label:"Onion"}],
    itemPool:[{label:"Pepperoni"},{label:"Mushroom"},{label:"Italian sausage"},{label:"Mozzarella"},{label:"Onion"},{label:"Bell pepper"},{label:"Black olive"},{label:"Jalapeño"},{label:"Pineapple"},{label:"Anchovy"},{label:"Basil"},{label:"Prosciutto"}] },
  { name:"Best Types of Pizza", mood:"food", provider:"wiki",
    items:[{label:"Pizza Margherita"},{label:"Pepperoni pizza"},{label:"Hawaiian pizza"},{label:"Meat lover's pizza"},{label:"Vegetarian pizza"}],
    itemPool:[{label:"Pizza Margherita"},{label:"Pepperoni pizza"},{label:"Hawaiian pizza"},{label:"Meat lover's pizza"},{label:"Vegetarian pizza"},{label:"Four cheese pizza"},{label:"Pizza capricciosa"},{label:"Buffalo chicken pizza"},{label:"White pizza"},{label:"Pizza marinara"}] },
  { name:"Best Burger Styles", mood: "food", provider:"wiki",
    items:[{label:"Cheeseburger"},{label:"Bacon cheeseburger"},{label:"Patty melt"},{label:"Slider (sandwich)"},{label:"Smash burger"}],
    itemPool:[{label:"Cheeseburger"},{label:"Bacon cheeseburger"},{label:"Patty melt"},{label:"Slider (sandwich)"},{label:"Smash burger"},{label:"Mushroom Swiss burger"},{label:"Veggie burger"},{label:"Turkey burger"},{label:"Bison burger"},{label:"Jucy Lucy"}] },
  { name:"Best Sandwiches", mood: "food", provider:"wiki",
    items:[{label:"BLT"},{label:"Club sandwich"},{label:"Reuben sandwich"},{label:"Grilled cheese"},{label:"Cheesesteak"}],
    itemPool:[{label:"BLT"},{label:"Club sandwich"},{label:"Reuben sandwich"},{label:"Grilled cheese"},{label:"Cheesesteak"},{label:"Po' boy"},{label:"Bánh mì"},{label:"Cuban sandwich"},{label:"Monte Cristo sandwich"},{label:"Muffuletta"}] },
  { name:"Best Breakfast Cereals", mood: "food", provider:"wiki",
    items:[{label:"Cheerios"},{label:"Frosted Flakes"},{label:"Cinnamon Toast Crunch"},{label:"Lucky Charms"},{label:"Froot Loops"}],
    itemPool:[{label:"Cheerios"},{label:"Frosted Flakes"},{label:"Cinnamon Toast Crunch"},{label:"Lucky Charms"},{label:"Froot Loops"},{label:"Cap'n Crunch"},{label:"Cocoa Puffs"},{label:"Honey Nut Cheerios"},{label:"Rice Krispies"},{label:"Apple Jacks"}] },
  { name:"Best Ice Cream Flavors", mood: "food", provider:"wiki",
    items:[{label:"Vanilla ice cream"},{label:"Chocolate ice cream"},{label:"Strawberry ice cream"},{label:"Cookies and cream"},{label:"Mint chocolate chip ice cream"}],
    itemPool:[{label:"Vanilla ice cream"},{label:"Chocolate ice cream"},{label:"Strawberry ice cream"},{label:"Cookies and cream"},{label:"Mint chocolate chip ice cream"},{label:"Rocky road ice cream"},{label:"Pistachio ice cream"},{label:"Cookie dough ice cream"},{label:"Butter pecan ice cream"},{label:"Neapolitan ice cream"}] },
  { name:"Best Sodas", mood: "food", provider:"wiki",
    items:[{label:"Coca-Cola"},{label:"Pepsi"},{label:"Sprite (drink)"},{label:"Dr Pepper"},{label:"Mountain Dew"}],
    itemPool:[{label:"Coca-Cola"},{label:"Pepsi"},{label:"Sprite (drink)"},{label:"Dr Pepper"},{label:"Mountain Dew"},{label:"Fanta"},{label:"7 Up"},{label:"Root beer"},{label:"Ginger ale"},{label:"Cream soda"}] },
  { name:"Best Coffee Drinks", mood: "food", provider:"wiki",
    items:[{label:"Espresso"},{label:"Cappuccino"},{label:"Latte"},{label:"Cold brew coffee"},{label:"Caffè Americano"}],
    itemPool:[{label:"Espresso"},{label:"Cappuccino"},{label:"Latte"},{label:"Cold brew coffee"},{label:"Caffè Americano"},{label:"Flat white"},{label:"Macchiato"},{label:"Irish coffee"},{label:"Affogato"},{label:"Mocha coffee"}] },
  { name:"Best Teas", mood: "food", provider:"wiki",
    items:[{label:"Green tea"},{label:"Black tea"},{label:"Earl Grey tea"},{label:"Oolong tea"},{label:"Masala chai"}],
    itemPool:[{label:"Green tea"},{label:"Black tea"},{label:"Earl Grey tea"},{label:"Oolong tea"},{label:"Masala chai"},{label:"Matcha"},{label:"Chamomile tea"},{label:"Peppermint tea"},{label:"White tea"},{label:"Rooibos"}] },
  { name:"Best Chocolate Candy", mood: "food", provider:"wiki",
    items:[{label:"Snickers"},{label:"Kit Kat"},{label:"Reese's Peanut Butter Cups"},{label:"Twix"},{label:"M&M's"}],
    itemPool:[{label:"Snickers"},{label:"Kit Kat"},{label:"Reese's Peanut Butter Cups"},{label:"Twix"},{label:"M&M's"},{label:"Milky Way (chocolate bar)"},{label:"Butterfinger"},{label:"3 Musketeers (candy bar)"},{label:"Toblerone"},{label:"Ferrero Rocher"}] },
  { name:"Best Potato Chip Flavors", mood: "food", provider:"wiki",
    items:[{label:"Potato chip"},{label:"Sour cream and onion"},{label:"Barbecue chip"},{label:"Salt and vinegar chips"},{label:"Cheddar cheese chip"}],
    itemPool:[{label:"Potato chip"},{label:"Sour cream and onion"},{label:"Barbecue chip"},{label:"Salt and vinegar chips"},{label:"Cheddar cheese chip"},{label:"Kettle chip"},{label:"Jalapeño chip"},{label:"Dill pickle chip"},{label:"Ranch dressing chip"},{label:"Sweet chili chip"}] },
  { name:"Best Hot Sauces", mood: "food", provider:"wiki",
    items:[{label:"Sriracha"},{label:"Tabasco sauce"},{label:"Frank's RedHot"},{label:"Cholula Hot Sauce"},{label:"Tapatío"}],
    itemPool:[{label:"Sriracha"},{label:"Tabasco sauce"},{label:"Frank's RedHot"},{label:"Cholula Hot Sauce"},{label:"Tapatío"},{label:"Crystal Hot Sauce"},{label:"Valentina (hot sauce)"},{label:"Harissa"},{label:"Sambal"},{label:"Gochujang"}] },
  { name:"Best Fruits", mood: "food", provider:"wiki",
    items:[{label:"Mango"},{label:"Apple (fruit)"},{label:"Banana"},{label:"Strawberry"},{label:"Pineapple"}],
    itemPool:[{label:"Mango"},{label:"Apple (fruit)"},{label:"Banana"},{label:"Strawberry"},{label:"Pineapple"},{label:"Watermelon"},{label:"Peach"},{label:"Blueberry"},{label:"Cherry"},{label:"Grape"},{label:"Kiwifruit"},{label:"Raspberry"}] },
  { name:"Best Vegetables", mood: "food", provider:"wiki",
    items:[{label:"Broccoli"},{label:"Carrot"},{label:"Spinach"},{label:"Corn"},{label:"Tomato"}],
    itemPool:[{label:"Broccoli"},{label:"Carrot"},{label:"Spinach"},{label:"Corn"},{label:"Tomato"},{label:"Asparagus"},{label:"Brussels sprout"},{label:"Sweet potato"},{label:"Zucchini"},{label:"Avocado"},{label:"Cauliflower"},{label:"Green bean"}] },
  { name:"Best Sushi Rolls", mood: "food", provider:"wiki",
    items:[{label:"California roll"},{label:"Spicy tuna roll"},{label:"Sashimi"},{label:"Nigiri"},{label:"Temaki"}],
    itemPool:[{label:"California roll"},{label:"Spicy tuna roll"},{label:"Sashimi"},{label:"Nigiri"},{label:"Temaki"},{label:"Maki (sushi)"},{label:"Uramaki"},{label:"Chirashizushi"},{label:"Inari sushi"},{label:"Futomaki"}] },
  { name:"Best Pasta Shapes", mood: "food", provider:"wiki",
    items:[{label:"Spaghetti"},{label:"Penne"},{label:"Fettuccine"},{label:"Rigatoni"},{label:"Farfalle"}],
    itemPool:[{label:"Spaghetti"},{label:"Penne"},{label:"Fettuccine"},{label:"Rigatoni"},{label:"Farfalle"},{label:"Linguine"},{label:"Fusilli"},{label:"Orecchiette"},{label:"Tagliatelle"},{label:"Pappardelle"},{label:"Orzo"},{label:"Cavatappi"}] },
  { name:"Best Cheeses", mood: "food", provider:"wiki",
    items:[{label:"Cheddar cheese"},{label:"Mozzarella"},{label:"Gouda cheese"},{label:"Parmesan cheese"},{label:"Brie cheese"}],
    itemPool:[{label:"Cheddar cheese"},{label:"Mozzarella"},{label:"Gouda cheese"},{label:"Parmesan cheese"},{label:"Brie cheese"},{label:"Gruyère cheese"},{label:"Manchego"},{label:"Feta cheese"},{label:"Roquefort"},{label:"Camembert"}] },
  { name:"Best Breads", mood: "food", provider:"wiki",
    items:[{label:"Sourdough bread"},{label:"Baguette"},{label:"Ciabatta"},{label:"Rye bread"},{label:"Brioche"}],
    itemPool:[{label:"Sourdough bread"},{label:"Baguette"},{label:"Ciabatta"},{label:"Rye bread"},{label:"Brioche"},{label:"Focaccia"},{label:"Pita bread"},{label:"Challah"},{label:"Naan"},{label:"Pretzel"},{label:"Cornbread"},{label:"Pumpernickel"}] },
  { name:"Best Soups", mood: "food", provider:"wiki",
    items:[{label:"Chicken soup"},{label:"Tomato soup"},{label:"Clam chowder"},{label:"French onion soup"},{label:"Minestrone"}],
    itemPool:[{label:"Chicken soup"},{label:"Tomato soup"},{label:"Clam chowder"},{label:"French onion soup"},{label:"Minestrone"},{label:"Pho"},{label:"Lobster bisque"},{label:"Gazpacho"},{label:"Miso soup"},{label:"Goulash"},{label:"Borscht"},{label:"Hot and sour soup"}] },
  { name:"Best Salads", mood: "food", provider:"wiki",
    items:[{label:"Caesar salad"},{label:"Greek salad"},{label:"Cobb salad"},{label:"Caprese salad"},{label:"Salade niçoise"}],
    itemPool:[{label:"Caesar salad"},{label:"Greek salad"},{label:"Cobb salad"},{label:"Caprese salad"},{label:"Salade niçoise"},{label:"Waldorf salad"},{label:"Tabbouleh"},{label:"Fattoush"},{label:"Panzanella"},{label:"Coleslaw"}] },
  { name:"Best BBQ Meats", mood: "food", provider:"wiki",
    items:[{label:"Brisket"},{label:"Pulled pork"},{label:"Ribs"},{label:"Barbecue chicken"},{label:"Sausage"}],
    itemPool:[{label:"Brisket"},{label:"Pulled pork"},{label:"Ribs"},{label:"Barbecue chicken"},{label:"Sausage"},{label:"Tri-tip"},{label:"Pork belly"},{label:"Burnt ends"},{label:"Smoked turkey"},{label:"Lamb chops"}] },
  { name:"Best Fast-Food Chains (US)", mood: "food", provider:"wiki",
    items:[{label:"McDonald's"},{label:"Burger King"},{label:"Wendy's"},{label:"Taco Bell"},{label:"Chick-fil-A"}],
    itemPool:[{label:"McDonald's"},{label:"Burger King"},{label:"Wendy's"},{label:"Taco Bell"},{label:"Chick-fil-A"},{label:"Popeyes Louisiana Kitchen"},{label:"Five Guys"},{label:"In-N-Out Burger"},{label:"Shake Shack"},{label:"Whataburger"}] },
  { name:"Best Breakfast Items", mood: "food", provider:"wiki",
    items:[{label:"Pancake"},{label:"Waffle"},{label:"French toast"},{label:"Omelette"},{label:"Bagel"}],
    itemPool:[{label:"Pancake"},{label:"Waffle"},{label:"French toast"},{label:"Omelette"},{label:"Bagel"},{label:"Eggs Benedict"},{label:"Croissant"},{label:"Breakfast burrito"},{label:"Granola"},{label:"Acai bowl"}] },
  { name:"Best Pizza Regional Styles", mood: "food", provider:"wiki",
    items:[{label:"New York-style pizza"},{label:"Chicago-style pizza"},{label:"Neapolitan pizza"},{label:"Detroit-style pizza"},{label:"Sicilian pizza"}],
    itemPool:[{label:"New York-style pizza"},{label:"Chicago-style pizza"},{label:"Neapolitan pizza"},{label:"Detroit-style pizza"},{label:"Sicilian pizza"},{label:"Roman pizza"},{label:"Greek pizza"},{label:"St. Louis-style pizza"},{label:"New Haven-style pizza"},{label:"Grandma pizza"}] },
  { name:"Best Milkshakes", mood: "food", provider:"wiki",
    items:[{label:"Chocolate milkshake"},{label:"Vanilla milkshake"},{label:"Strawberry milkshake"},{label:"Oreo milkshake"},{label:"Milkshake"}],
    itemPool:[{label:"Chocolate milkshake"},{label:"Vanilla milkshake"},{label:"Strawberry milkshake"},{label:"Oreo milkshake"},{label:"Milkshake"},{label:"Peanut butter milkshake"},{label:"Banana milkshake"},{label:"Malt (drink)"},{label:"Cookies and cream milkshake"},{label:"Caramel milkshake"}] },
  { name:"Best Cookies", mood: "food", provider:"wiki",
    items:[{label:"Chocolate chip cookie"},{label:"Oatmeal raisin cookie"},{label:"Peanut butter cookie"},{label:"Snickerdoodle"},{label:"Shortbread"}],
    itemPool:[{label:"Chocolate chip cookie"},{label:"Oatmeal raisin cookie"},{label:"Peanut butter cookie"},{label:"Snickerdoodle"},{label:"Shortbread"},{label:"Macaron"},{label:"Sugar cookie"},{label:"Biscotti"},{label:"Gingerbread cookie"},{label:"Macaroon"}] },
  { name:"Best Taco Fillings", mood: "food", provider:"wiki",
    items:[{label:"Carnitas"},{label:"Tacos al pastor"},{label:"Carne asada"},{label:"Tinga"},{label:"Fish taco"}],
    itemPool:[{label:"Carnitas"},{label:"Tacos al pastor"},{label:"Carne asada"},{label:"Tinga"},{label:"Fish taco"},{label:"Barbacoa"},{label:"Chorizo"},{label:"Birria"},{label:"Pollo asado"},{label:"Lengua (taco)"}] },
  { name:"Best Indian Dishes", mood: "food", provider:"wiki",
    items:[{label:"Butter chicken"},{label:"Biryani"},{label:"Palak paneer"},{label:"Masala dosa"},{label:"Rogan josh"}],
    itemPool:[{label:"Butter chicken"},{label:"Biryani"},{label:"Palak paneer"},{label:"Masala dosa"},{label:"Rogan josh"},{label:"Tandoori chicken"},{label:"Chana masala"},{label:"Vindaloo"},{label:"Korma"},{label:"Tikka masala"},{label:"Dal makhani"},{label:"Samosa"}] },
  { name:"Best Chinese Dishes", mood: "food", provider:"wiki",
    items:[{label:"Kung Pao chicken"},{label:"Sweet and sour pork"},{label:"Mapo tofu"},{label:"Peking duck"},{label:"Chow mein"}],
    itemPool:[{label:"Kung Pao chicken"},{label:"Sweet and sour pork"},{label:"Mapo tofu"},{label:"Peking duck"},{label:"Chow mein"},{label:"Dim sum"},{label:"Hot pot"},{label:"Char siu"},{label:"Wonton soup"},{label:"Fried rice"},{label:"Spring roll"},{label:"Dan dan noodles"}] },
  { name:"Best Italian Dishes", mood: "food", provider:"wiki",
    items:[{label:"Lasagna"},{label:"Risotto"},{label:"Carbonara"},{label:"Osso buco"},{label:"Gnocchi"}],
    itemPool:[{label:"Lasagna"},{label:"Risotto"},{label:"Carbonara"},{label:"Osso buco"},{label:"Gnocchi"},{label:"Bruschetta"},{label:"Arancini"},{label:"Panna cotta"},{label:"Tiramisu"},{label:"Focaccia"},{label:"Minestrone"},{label:"Caprese salad"}] },

  // ————— TV / Movies —————
  { name:"Top 90s Boy Bands", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Backstreet Boys"},{label:"NSYNC"},{label:"Boyz II Men"},{label:"98 Degrees"},{label:"New Kids on the Block"}],
    itemPool:[{label:"Backstreet Boys"},{label:"NSYNC"},{label:"Boyz II Men"},{label:"98 Degrees"},{label:"New Kids on the Block"},{label:"Hanson (band)"},{label:"LFO (American band)"},{label:"Dream Street"},{label:"All-4-One"},{label:"3T (band)"},{label:"Az Yet"},{label:"Shai (band)"},{label:"Five (band)"},{label:"911 (band)"},{label:"Take That"},{label:"Boyzone"},{label:"Worlds Apart (group)"},{label:"A1 (band)"},{label:"Another Level (band)"},{label:"Plus One (band)"},{label:"O-Town (group)"}] },
  { name:"Top Early 00s Boy Bands", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Westlife"},{label:"Blue (English group)"},{label:"O-Town (group)"},{label:"Busted (band)"},{label:"Jonas Brothers"}],
    itemPool:[{label:"Westlife"},{label:"Blue (English group)"},{label:"O-Town (group)"},{label:"Busted (band)"},{label:"Jonas Brothers"},{label:"B2K"},{label:"Dream Street"},{label:"McFly"},{label:"The Click Five"},{label:"Big Time Rush (band)"},{label:"Backstreet Boys"},{label:"NSYNC"},{label:"98 Degrees"},{label:"Son by Four"},{label:"Natural (band)"},{label:"Plus One (band)"},{label:"V (band)"},{label:"Blazin' Squad"},{label:"A1 (band)"},{label:"D-Side"},{label:"Phixx"}] },
  { name:"Best Cartoons of the 90s", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Rugrats"},{label:"Dexter's Laboratory"},{label:"The Powerpuff Girls"},{label:"Batman: The Animated Series"},{label:"Doug (TV series)"}],
    itemPool:[{label:"Rugrats"},{label:"Dexter's Laboratory"},{label:"The Powerpuff Girls"},{label:"Batman: The Animated Series"},{label:"Doug (TV series)"},{label:"Animaniacs"},{label:"Hey Arnold!"},{label:"Johnny Bravo"},{label:"Recess (TV series)"},{label:"Courage the Cowardly Dog"},{label:"Ed, Edd n Eddy"},{label:"Pinky and the Brain"},{label:"The Wild Thornberrys"},{label:"CatDog"},{label:"Rocket Power"},{label:"The Ren & Stimpy Show"},{label:"Gargoyles (TV series)"},{label:"Tiny Toon Adventures"},{label:"Darkwing Duck"},{label:"Pepper Ann"},{label:"Daria"}] },
  { name:"Best Cartoons of the 00s", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Avatar: The Last Airbender"},{label:"Teen Titans (TV series)"},{label:"Kim Possible"},{label:"Ben 10"},{label:"SpongeBob SquarePants"}],
    itemPool:[{label:"Avatar: The Last Airbender"},{label:"Teen Titans (TV series)"},{label:"Kim Possible"},{label:"Ben 10"},{label:"SpongeBob SquarePants"},{label:"Fairly OddParents"},{label:"Danny Phantom"},{label:"Codename: Kids Next Door"},{label:"Foster's Home for Imaginary Friends"},{label:"The Grim Adventures of Billy & Mandy"},{label:"Samurai Jack"},{label:"Phineas and Ferb"},{label:"My Life as a Teenage Robot"},{label:"Justice League (TV series)"},{label:"Static Shock"},{label:"Xiaolin Showdown"},{label:"American Dragon: Jake Long"},{label:"The Life and Times of Juniper Lee"},{label:"Chowder (TV series)"},{label:"Flapjack (TV series)"},{label:"Generator Rex"}] },
  { name:"Best 90s Sitcoms", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Friends (TV series)"},{label:"Seinfeld"},{label:"Frasier"},{label:"The Fresh Prince of Bel-Air"},{label:"Home Improvement (TV series)"}],
    itemPool:[{label:"Friends (TV series)"},{label:"Seinfeld"},{label:"Frasier"},{label:"The Fresh Prince of Bel-Air"},{label:"Home Improvement (TV series)"},{label:"Everybody Loves Raymond"},{label:"Will & Grace"},{label:"Spin City"},{label:"Boy Meets World"},{label:"Mad About You"},{label:"3rd Rock from the Sun"},{label:"The Nanny"},{label:"Sabrina the Teenage Witch (TV series)"},{label:"Martin (TV series)"},{label:"Living Single"},{label:"NewsRadio"},{label:"King of Queens"},{label:"That '70s Show"},{label:"Malcolm in the Middle"},{label:"Drew Carey Show"},{label:"Moesha"}] },
  { name:"Best 2000s Sitcoms", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"The Office (American TV series)"},{label:"How I Met Your Mother"},{label:"Arrested Development"},{label:"Scrubs (TV series)"},{label:"30 Rock"}],
    itemPool:[{label:"The Office (American TV series)"},{label:"How I Met Your Mother"},{label:"Arrested Development"},{label:"Scrubs (TV series)"},{label:"30 Rock"},{label:"Parks and Recreation"},{label:"It's Always Sunny in Philadelphia"},{label:"The Big Bang Theory"},{label:"My Name Is Earl"},{label:"Curb Your Enthusiasm"},{label:"Two and a Half Men"},{label:"Everybody Hates Chris"},{label:"Community (TV series)"},{label:"Brooklyn Nine-Nine"},{label:"New Girl"},{label:"Modern Family"},{label:"The Mindy Project"},{label:"Cougar Town"},{label:"Better Off Ted"},{label:"Ugly Betty"},{label:"Weeds (TV series)"}] },
  { name:"Best Fantasy TV Shows", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Game of Thrones"},{label:"The Witcher (TV series)"},{label:"His Dark Materials (TV series)"},{label:"Shadow and Bone (TV series)"},{label:"Merlin (TV series)"}],
    itemPool:[{label:"Game of Thrones"},{label:"The Witcher (TV series)"},{label:"His Dark Materials (TV series)"},{label:"Shadow and Bone (TV series)"},{label:"Merlin (TV series)"},{label:"House of the Dragon"},{label:"The Lord of the Rings: The Rings of Power"},{label:"Once Upon a Time (TV series)"},{label:"Outlander (TV series)"},{label:"The Sandman (TV series)"},{label:"Good Omens (TV series)"},{label:"Buffy the Vampire Slayer"},{label:"Supernatural (American TV series)"},{label:"Carnival Row"},{label:"American Gods (TV series)"},{label:"Penny Dreadful (TV series)"},{label:"Xena: Warrior Princess"},{label:"Legend of the Seeker"},{label:"The Dark Crystal: Age of Resistance"},{label:"The Wheel of Time (TV series)"},{label:"Willow (TV series)"}] },
  { name:"Best Sci-Fi TV Shows", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Star Trek: The Next Generation"},{label:"The X-Files"},{label:"Battlestar Galactica"},{label:"Black Mirror"},{label:"The Expanse"}],
    itemPool:[{label:"Star Trek: The Next Generation"},{label:"The X-Files"},{label:"Battlestar Galactica"},{label:"Black Mirror"},{label:"The Expanse"},{label:"Doctor Who"},{label:"Westworld (TV series)"},{label:"Stranger Things"},{label:"Fringe (TV series)"},{label:"Lost (TV series)"},{label:"Dark (TV series)"},{label:"Firefly (TV series)"},{label:"Star Trek: Deep Space Nine"},{label:"Stargate SG-1"},{label:"The Mandalorian"},{label:"Severance (TV series)"},{label:"Altered Carbon (TV series)"},{label:"Orphan Black"},{label:"For All Mankind (TV series)"},{label:"Foundation (TV series)"},{label:"Devs (miniseries)"}] },
  { name:"Best HBO Dramas", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"The Sopranos"},{label:"The Wire (TV series)"},{label:"Succession (TV series)"},{label:"True Detective"},{label:"Boardwalk Empire"}],
    itemPool:[{label:"The Sopranos"},{label:"The Wire (TV series)"},{label:"Succession (TV series)"},{label:"True Detective"},{label:"Boardwalk Empire"},{label:"The Leftovers (TV series)"},{label:"Chernobyl (miniseries)"},{label:"Band of Brothers"},{label:"Game of Thrones"},{label:"Westworld (TV series)"},{label:"Euphoria (American TV series)"},{label:"The White Lotus"},{label:"Mare of Easttown"},{label:"Big Little Lies (TV series)"},{label:"Six Feet Under (TV series)"},{label:"Deadwood (TV series)"},{label:"Rome (TV series)"},{label:"Barry (TV series)"},{label:"Curb Your Enthusiasm"},{label:"House of the Dragon"},{label:"The Last of Us (TV series)"}] },
  { name:"Best Netflix Originals (TV)", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Stranger Things"},{label:"The Crown (TV series)"},{label:"Narcos"},{label:"Ozark (TV series)"},{label:"Mindhunter (TV series)"}],
    itemPool:[{label:"Stranger Things"},{label:"The Crown (TV series)"},{label:"Narcos"},{label:"Ozark (TV series)"},{label:"Mindhunter (TV series)"},{label:"Squid Game"},{label:"Wednesday (TV series)"},{label:"Bridgerton"},{label:"The Witcher (TV series)"},{label:"Dark (TV series)"},{label:"You (TV series)"},{label:"BoJack Horseman"},{label:"Cobra Kai"},{label:"House of Cards (American TV series)"},{label:"Orange Is the New Black"},{label:"The Queen's Gambit (miniseries)"},{label:"Arcane (TV series)"},{label:"Lupin (French TV series)"},{label:"Money Heist"},{label:"Sex Education (TV series)"},{label:"All of Us Are Dead"}] },
  { name:"Best 90s Comedy Films", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"Dumb and Dumber"},{label:"Home Alone"},{label:"Groundhog Day"},{label:"The Big Lebowski"},{label:"Mrs. Doubtfire"}],
    itemPool:[{label:"Dumb and Dumber"},{label:"Home Alone"},{label:"Groundhog Day"},{label:"The Big Lebowski"},{label:"Mrs. Doubtfire"},{label:"Clueless"},{label:"Austin Powers: International Man of Mystery"},{label:"Happy Gilmore"},{label:"Ace Ventura: Pet Detective"},{label:"The Mask (1994 film)"},{label:"Liar Liar"},{label:"American Pie (film)"},{label:"Rush Hour (1998 film)"},{label:"Wayne's World"},{label:"Billy Madison"},{label:"There's Something About Mary"},{label:"My Cousin Vinny"},{label:"Office Space"},{label:"Space Jam"},{label:"10 Things I Hate About You"},{label:"Tommy Boy"}] },
  { name:"Best 2000s Action Films", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"The Dark Knight"},{label:"Gladiator (2000 film)"},{label:"The Bourne Identity (2002 film)"},{label:"Kill Bill: Volume 1"},{label:"Casino Royale (2006 film)"}],
    itemPool:[{label:"The Dark Knight"},{label:"Gladiator (2000 film)"},{label:"The Bourne Identity (2002 film)"},{label:"Kill Bill: Volume 1"},{label:"Casino Royale (2006 film)"},{label:"The Lord of the Rings: The Return of the King"},{label:"Spider-Man 2"},{label:"300 (film)"},{label:"Iron Man (2008 film)"},{label:"Batman Begins"},{label:"Pirates of the Caribbean: The Curse of the Black Pearl"},{label:"The Matrix Reloaded"},{label:"Mission: Impossible III"},{label:"Inception"},{label:"District 9"},{label:"Crouching Tiger, Hidden Dragon"},{label:"Troy (film)"},{label:"Taken (film)"},{label:"V for Vendetta (film)"},{label:"Ong-Bak"},{label:"John Wick"}] },
  { name:"Best Pixar Movies", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"Toy Story"},{label:"Finding Nemo"},{label:"The Incredibles"},{label:"Up (2009 film)"},{label:"Coco (2017 film)"}],
    itemPool:[{label:"Toy Story"},{label:"Finding Nemo"},{label:"The Incredibles"},{label:"Up (2009 film)"},{label:"Coco (2017 film)"},{label:"WALL-E"},{label:"Monsters, Inc."},{label:"Ratatouille (film)"},{label:"Inside Out (2015 film)"},{label:"Toy Story 3"},{label:"Finding Dory"},{label:"Brave (2012 film)"},{label:"Soul (2020 film)"},{label:"Turning Red"},{label:"Luca (2021 film)"},{label:"Onward (film)"},{label:"A Bug's Life"},{label:"Toy Story 2"},{label:"Cars (film)"},{label:"Inside Out 2"},{label:"Elemental (2023 film)"}] },
  { name:"Best Disney Animated Classics", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"The Lion King (1994 film)"},{label:"Aladdin (1992 Disney film)"},{label:"Beauty and the Beast (1991 film)"},{label:"Mulan (1998 film)"},{label:"The Little Mermaid (1989 film)"}],
    itemPool:[{label:"The Lion King (1994 film)"},{label:"Aladdin (1992 Disney film)"},{label:"Beauty and the Beast (1991 film)"},{label:"Mulan (1998 film)"},{label:"The Little Mermaid (1989 film)"},{label:"Frozen (2013 film)"},{label:"Moana (2016 film)"},{label:"Tangled"},{label:"Wreck-It Ralph"},{label:"Zootopia"},{label:"Big Hero 6 (film)"},{label:"Encanto"},{label:"Lilo & Stitch"},{label:"The Emperor's New Groove"},{label:"Hercules (1997 film)"},{label:"Tarzan (1999 film)"},{label:"Pocahontas (1995 film)"},{label:"The Hunchback of Notre Dame (1996 film)"},{label:"Cinderella (1950 film)"},{label:"Snow White and the Seven Dwarfs (1937 film)"},{label:"Bambi"}] },
  { name:"Best Superhero Movies", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"Iron Man (2008 film)"},{label:"The Avengers (2012 film)"},{label:"Spider-Man: No Way Home"},{label:"The Dark Knight"},{label:"Black Panther (film)"}],
    itemPool:[{label:"Iron Man (2008 film)"},{label:"The Avengers (2012 film)"},{label:"Spider-Man: No Way Home"},{label:"The Dark Knight"},{label:"Black Panther (film)"},{label:"Logan (film)"},{label:"Spider-Man: Into the Spider-Verse"},{label:"Guardians of the Galaxy (film)"},{label:"Thor: Ragnarok"},{label:"Captain America: The Winter Soldier"},{label:"Wonder Woman (2017 film)"},{label:"Batman Begins"},{label:"X-Men: Days of Future Past"},{label:"Deadpool (film)"},{label:"Avengers: Infinity War"},{label:"Avengers: Endgame"},{label:"Shazam! (film)"},{label:"Superman (1978 film)"},{label:"Captain America: Civil War"},{label:"Spider-Man 2"},{label:"Ant-Man"}] },
  { name:"Best Horror Films", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"The Exorcist"},{label:"Halloween (1978 film)"},{label:"The Shining"},{label:"Get Out"},{label:"A Nightmare on Elm Street"}],
    itemPool:[{label:"The Exorcist"},{label:"Halloween (1978 film)"},{label:"The Shining"},{label:"Get Out"},{label:"A Nightmare on Elm Street"},{label:"Hereditary"},{label:"Scream (1996 film)"},{label:"The Conjuring"},{label:"Midsommar"},{label:"The Texas Chain Saw Massacre"},{label:"Psycho (1960 film)"},{label:"28 Days Later"},{label:"It Follows"},{label:"A Quiet Place"},{label:"The Witch (2015 film)"},{label:"The Babadook"},{label:"Rosemary's Baby (film)"},{label:"The Ring (2002 film)"},{label:"Nope (film)"},{label:"Train to Busan"},{label:"Suspiria (1977 film)"}] },
  { name:"Best Romantic Comedies", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"When Harry Met Sally..."},{label:"Notting Hill (film)"},{label:"10 Things I Hate About You"},{label:"Crazy Rich Asians (film)"},{label:"The Proposal (film)"}],
    itemPool:[{label:"When Harry Met Sally..."},{label:"Notting Hill (film)"},{label:"10 Things I Hate About You"},{label:"Crazy Rich Asians (film)"},{label:"The Proposal (film)"},{label:"Pretty Woman"},{label:"Bridget Jones's Diary (film)"},{label:"Sleepless in Seattle"},{label:"You've Got Mail"},{label:"My Big Fat Greek Wedding"},{label:"Hitch (film)"},{label:"13 Going on 30"},{label:"Mean Girls"},{label:"Clueless"},{label:"Love Actually (film)"},{label:"50 First Dates"},{label:"How to Lose a Guy in 10 Days"},{label:"The Holiday (film)"},{label:"Sweet Home Alabama (film)"},{label:"She's the Man"},{label:"Set It Up"}] },
  { name:"Best Film Trilogies", mood: "movies", provider:"tmdb", mediaType:"movie", items:[{label:"The Lord of the Rings: The Fellowship of the Ring"},{label:"The Godfather"},{label:"The Dark Knight"},{label:"Back to the Future"},{label:"The Matrix"}],
    itemPool:[{label:"The Lord of the Rings: The Fellowship of the Ring"},{label:"The Godfather"},{label:"The Dark Knight"},{label:"Back to the Future"},{label:"The Matrix"},{label:"Star Wars: Episode IV – A New Hope"},{label:"Indiana Jones and the Raiders of the Lost Ark"},{label:"Toy Story"},{label:"The Bourne Identity (2002 film)"},{label:"Mad Max: Fury Road"},{label:"Spider-Man (2002 film)"},{label:"Jurassic Park"},{label:"Alien (film)"},{label:"Die Hard"},{label:"Pirates of the Caribbean: The Curse of the Black Pearl"},{label:"Iron Man (2008 film)"},{label:"Rocky (1976 film)"},{label:"Mission: Impossible (film)"},{label:"John Wick"},{label:"The Hunger Games (film)"},{label:"Planet of the Apes (1968 film)"}] },
  { name:"Best Film Directors", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Steven Spielberg"},{label:"Christopher Nolan"},{label:"Quentin Tarantino"},{label:"Martin Scorsese"},{label:"James Cameron"}],
    itemPool:[{label:"Steven Spielberg"},{label:"Christopher Nolan"},{label:"Quentin Tarantino"},{label:"Martin Scorsese"},{label:"James Cameron"},{label:"Stanley Kubrick"},{label:"Alfred Hitchcock"},{label:"Ridley Scott"},{label:"David Fincher"},{label:"Denis Villeneuve"},{label:"Greta Gerwig"},{label:"Coen brothers"},{label:"Wes Anderson"},{label:"Francis Ford Coppola"},{label:"Tim Burton"},{label:"Spike Lee"},{label:"Jordan Peele"},{label:"Guillermo del Toro"},{label:"Peter Jackson"},{label:"Bong Joon-ho"},{label:"Akira Kurosawa"},{label:"Sofia Coppola"},{label:"Clint Eastwood"},{label:"Ron Howard"},{label:"Kathryn Bigelow"}] },
  { name:"Best Actresses (Modern)", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Meryl Streep"},{label:"Saoirse Ronan"},{label:"Viola Davis"},{label:"Scarlett Johansson"},{label:"Cate Blanchett"}],
    itemPool:[{label:"Meryl Streep"},{label:"Saoirse Ronan"},{label:"Viola Davis"},{label:"Scarlett Johansson"},{label:"Cate Blanchett"},{label:"Natalie Portman"},{label:"Nicole Kidman"},{label:"Charlize Theron"},{label:"Emma Stone"},{label:"Jennifer Lawrence"},{label:"Margot Robbie"},{label:"Florence Pugh"},{label:"Zendaya"},{label:"Sandra Bullock"},{label:"Angelina Jolie"},{label:"Anne Hathaway"},{label:"Lupita Nyong'o"},{label:"Amy Adams"},{label:"Julia Roberts"},{label:"Reese Witherspoon"},{label:"Gal Gadot"},{label:"Halle Berry"},{label:"Tilda Swinton"},{label:"Kate Winslet"},{label:"Michelle Yeoh"}] },
  { name:"Best Actors (Modern)", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Denzel Washington"},{label:"Leonardo DiCaprio"},{label:"Tom Hanks"},{label:"Keanu Reeves"},{label:"Christian Bale"}],
    itemPool:[{label:"Denzel Washington"},{label:"Leonardo DiCaprio"},{label:"Tom Hanks"},{label:"Keanu Reeves"},{label:"Christian Bale"},{label:"Brad Pitt"},{label:"Morgan Freeman"},{label:"Robert Downey Jr."},{label:"Johnny Depp"},{label:"Will Smith"},{label:"Matt Damon"},{label:"Ryan Gosling"},{label:"Joaquin Phoenix"},{label:"Samuel L. Jackson"},{label:"Timothée Chalamet"},{label:"Oscar Isaac"},{label:"Tom Hardy"},{label:"Cillian Murphy"},{label:"Adam Driver"},{label:"Jake Gyllenhaal"},{label:"Pedro Pascal"},{label:"Daniel Craig"},{label:"Benedict Cumberbatch"},{label:"Idris Elba"},{label:"Chris Hemsworth"}] },
  { name:"Best MCU Heroes", mood: "people", provider:"wiki", items:[{label:"Iron Man"},{label:"Captain America"},{label:"Thor (Marvel Comics)"},{label:"Black Widow (Marvel Comics)"},{label:"Doctor Strange"}],
    itemPool:[{label:"Iron Man"},{label:"Captain America"},{label:"Thor (Marvel Comics)"},{label:"Black Widow (Marvel Comics)"},{label:"Doctor Strange"},{label:"Spider-Man"},{label:"Hulk"},{label:"Black Panther (character)"},{label:"Ant-Man"},{label:"Scarlet Witch"},{label:"Hawkeye (Clint Barton)"},{label:"Captain Marvel (Marvel Comics)"},{label:"Falcon (comics)"},{label:"War Machine"},{label:"Vision (Marvel Comics)"},{label:"Groot"},{label:"Rocket Raccoon"},{label:"Gamora"},{label:"Star-Lord"},{label:"Shang-Chi (Marvel Comics)"},{label:"Moon Knight"},{label:"She-Hulk"},{label:"Kate Bishop"},{label:"Ms. Marvel"},{label:"Loki (Marvel Comics)"}] },
  { name:"Best Star Wars Characters", mood: "people", provider:"wiki", items:[{label:"Luke Skywalker"},{label:"Darth Vader"},{label:"Han Solo"},{label:"Princess Leia"},{label:"Yoda"}],
    itemPool:[{label:"Luke Skywalker"},{label:"Darth Vader"},{label:"Han Solo"},{label:"Princess Leia"},{label:"Yoda"},{label:"Obi-Wan Kenobi"},{label:"Chewbacca"},{label:"R2-D2"},{label:"C-3PO"},{label:"Boba Fett"},{label:"Lando Calrissian"},{label:"Palpatine"},{label:"Ahsoka Tano"},{label:"Din Djarin"},{label:"Rey (Star Wars)"},{label:"Kylo Ren"},{label:"Mace Windu"},{label:"Qui-Gon Jinn"},{label:"Darth Maul"},{label:"Count Dooku"},{label:"General Grievous"},{label:"Padmé Amidala"},{label:"Grogu"},{label:"Anakin Skywalker"},{label:"Jabba the Hutt"}] },
  { name:"Best Anime of the 90s", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Neon Genesis Evangelion"},{label:"Cowboy Bebop"},{label:"Sailor Moon"},{label:"Dragon Ball Z"},{label:"Yu Yu Hakusho"}],
    itemPool:[{label:"Neon Genesis Evangelion"},{label:"Cowboy Bebop"},{label:"Sailor Moon"},{label:"Dragon Ball Z"},{label:"Yu Yu Hakusho"},{label:"Rurouni Kenshin"},{label:"Cardcaptor Sakura"},{label:"Serial Experiments Lain"},{label:"Trigun"},{label:"Outlaw Star"},{label:"GTO: Great Teacher Onizuka"},{label:"Berserk (1997 TV series)"},{label:"Pokemon (TV series)"},{label:"Detective Conan"},{label:"Slam Dunk (manga)"},{label:"Hunter × Hunter (1999 TV series)"},{label:"Initial D"},{label:"Digimon Adventure"},{label:"Mobile Suit Gundam Wing"},{label:"Tenchi Muyo!"},{label:"Ranma ½"}] },
  { name:"Best Anime of the 2000s", mood: "tv", provider:"tmdb", mediaType:"tv", items:[{label:"Fullmetal Alchemist: Brotherhood"},{label:"Naruto"},{label:"Death Note (TV series)"},{label:"One Piece"},{label:"Bleach (TV series)"}],
    itemPool:[{label:"Fullmetal Alchemist: Brotherhood"},{label:"Naruto"},{label:"Death Note (TV series)"},{label:"One Piece"},{label:"Bleach (TV series)"},{label:"Code Geass"},{label:"Steins;Gate"},{label:"Clannad"},{label:"Tengen Toppa Gurren Lagann"},{label:"Samurai Champloo"},{label:"Ghost in the Shell: Stand Alone Complex"},{label:"Fruits Basket (2001 TV series)"},{label:"Inuyasha"},{label:"Elfen Lied"},{label:"Claymore (TV series)"},{label:"Soul Eater (anime)"},{label:"Ouran High School Host Club"},{label:"Eureka Seven"},{label:"Darker than Black"},{label:"D.Gray-man"},{label:"Shakugan no Shana"}] },

  // ————— Music —————
  { name:"Best Pop Divas", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Beyoncé"},{label:"Taylor Swift"},{label:"Ariana Grande"},{label:"Adele"},{label:"Lady Gaga"}],
    itemPool:[{label:"Beyoncé"},{label:"Taylor Swift"},{label:"Ariana Grande"},{label:"Adele"},{label:"Lady Gaga"},{label:"Rihanna"},{label:"Katy Perry"},{label:"P!nk"},{label:"Christina Aguilera"},{label:"Britney Spears"},{label:"Dua Lipa"},{label:"Shakira"},{label:"Mariah Carey"},{label:"Whitney Houston"},{label:"Madonna (entertainer)"},{label:"Celine Dion"},{label:"Janet Jackson"},{label:"Miley Cyrus"},{label:"Olivia Rodrigo"},{label:"SZA"},{label:"Billie Eilish"},{label:"Lizzo"},{label:"Doja Cat"},{label:"Lorde"},{label:"Selena Gomez"}] },
  { name:"Best Rock Bands", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"The Beatles"},{label:"The Rolling Stones"},{label:"Led Zeppelin"},{label:"Queen (band)"},{label:"Pink Floyd"}],
    itemPool:[{label:"The Beatles"},{label:"The Rolling Stones"},{label:"Led Zeppelin"},{label:"Queen (band)"},{label:"Pink Floyd"},{label:"The Who"},{label:"Jimi Hendrix"},{label:"AC/DC"},{label:"Nirvana (band)"},{label:"Guns N' Roses"},{label:"U2"},{label:"Aerosmith"},{label:"Metallica"},{label:"David Bowie"},{label:"Red Hot Chili Peppers"},{label:"Foo Fighters"},{label:"Pearl Jam"},{label:"Radiohead"},{label:"The Clash"},{label:"Black Sabbath"},{label:"Fleetwood Mac"},{label:"The Doors"},{label:"The Eagles (band)"},{label:"Bon Jovi"},{label:"Creedence Clearwater Revival"}] },
  { name:"Best 90s Hip-Hop Artists", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Tupac Shakur"},{label:"The Notorious B.I.G."},{label:"Nas"},{label:"Snoop Dogg"},{label:"Dr. Dre"}],
    itemPool:[{label:"Tupac Shakur"},{label:"The Notorious B.I.G."},{label:"Nas"},{label:"Snoop Dogg"},{label:"Dr. Dre"},{label:"Jay-Z"},{label:"Wu-Tang Clan"},{label:"Ice Cube"},{label:"DMX"},{label:"Lauryn Hill"},{label:"Eminem"},{label:"Busta Rhymes"},{label:"A Tribe Called Quest"},{label:"OutKast"},{label:"Missy Elliott"},{label:"Redman (rapper)"},{label:"Method Man"},{label:"Lil' Kim"},{label:"Mobb Deep"},{label:"Bone Thugs-n-Harmony"},{label:"Raekwon"},{label:"Common (rapper)"},{label:"Mos Def"},{label:"Puff Daddy"},{label:"Coolio"}] },
  { name:"Best EDM DJs", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Calvin Harris"},{label:"Avicii"},{label:"David Guetta"},{label:"Deadmau5"},{label:"Tiësto"}],
    itemPool:[{label:"Calvin Harris"},{label:"Avicii"},{label:"David Guetta"},{label:"Deadmau5"},{label:"Tiësto"},{label:"Martin Garrix"},{label:"Skrillex"},{label:"Marshmello"},{label:"Diplo"},{label:"Kygo"},{label:"Zedd"},{label:"The Chainsmokers"},{label:"Armin van Buuren"},{label:"Swedish House Mafia"},{label:"Daft Punk"},{label:"Flume (musician)"},{label:"Porter Robinson"},{label:"Illenium"},{label:"DJ Snake"},{label:"Steve Aoki"},{label:"Odesza"},{label:"Alesso"},{label:"Major Lazer"},{label:"Above & Beyond"},{label:"Disclosure (band)"}] },
  { name:"Best Country Artists", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Johnny Cash"},{label:"Dolly Parton"},{label:"Garth Brooks"},{label:"Shania Twain"},{label:"Chris Stapleton"}],
    itemPool:[{label:"Johnny Cash"},{label:"Dolly Parton"},{label:"Garth Brooks"},{label:"Shania Twain"},{label:"Chris Stapleton"},{label:"Willie Nelson"},{label:"Hank Williams"},{label:"George Strait"},{label:"Reba McEntire"},{label:"Tim McGraw"},{label:"Faith Hill"},{label:"Carrie Underwood"},{label:"Keith Urban"},{label:"Blake Shelton"},{label:"Miranda Lambert"},{label:"Luke Combs"},{label:"Morgan Wallen"},{label:"Kacey Musgraves"},{label:"Zac Brown Band"},{label:"Kenny Chesney"},{label:"Alan Jackson"},{label:"Lainey Wilson"},{label:"Patsy Cline"},{label:"Loretta Lynn"},{label:"Waylon Jennings"}] },
  { name:"Best 2000s Pop-Punk Bands", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Blink-182"},{label:"Green Day"},{label:"Sum 41"},{label:"Good Charlotte"},{label:"Fall Out Boy"}],
    itemPool:[{label:"Blink-182"},{label:"Green Day"},{label:"Sum 41"},{label:"Good Charlotte"},{label:"Fall Out Boy"},{label:"My Chemical Romance"},{label:"Paramore"},{label:"Simple Plan"},{label:"All Time Low"},{label:"Yellowcard"},{label:"New Found Glory"},{label:"The Used"},{label:"Taking Back Sunday"},{label:"Jimmy Eat World"},{label:"AFI (band)"},{label:"The All-American Rejects"},{label:"Panic! at the Disco"},{label:"Bowling for Soup"},{label:"MxPx"},{label:"Less Than Jake"},{label:"The Starting Line"},{label:"Boys Like Girls"},{label:"Mayday Parade"},{label:"We the Kings"},{label:"The Academy Is..."}] },
  { name:"Best K-pop Groups", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"BTS"},{label:"BLACKPINK"},{label:"EXO"},{label:"TWICE"},{label:"Red Velvet"}],
    itemPool:[{label:"BTS"},{label:"BLACKPINK"},{label:"EXO"},{label:"TWICE"},{label:"Red Velvet"},{label:"Girls' Generation"},{label:"SHINee"},{label:"GOT7"},{label:"SEVENTEEN (South Korean band)"},{label:"Stray Kids"},{label:"ENHYPEN"},{label:"TXT (band)"},{label:"NCT (band)"},{label:"(G)I-dle"},{label:"aespa"},{label:"IVE (group)"},{label:"NewJeans"},{label:"Le Sserafim"},{label:"ITZY"},{label:"Monsta X"},{label:"ATEEZ"},{label:"Super Junior"},{label:"2NE1"},{label:"Big Bang (South Korean band)"},{label:"MAMAMOO"}] },
  { name:"Best 2000s R&B Artists", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Usher"},{label:"Alicia Keys"},{label:"Beyoncé"},{label:"Mary J. Blige"},{label:"Ne-Yo"}],
    itemPool:[{label:"Usher"},{label:"Alicia Keys"},{label:"Beyoncé"},{label:"Mary J. Blige"},{label:"Ne-Yo"},{label:"Rihanna"},{label:"Chris Brown"},{label:"Destiny's Child"},{label:"Aaliyah"},{label:"John Legend"},{label:"Trey Songz"},{label:"Ciara"},{label:"Ashanti (singer)"},{label:"Brandy Norwood"},{label:"Monica (singer)"},{label:"Erykah Badu"},{label:"Lauryn Hill"},{label:"D'Angelo"},{label:"Musiq Soulchild"},{label:"Tank (singer)"},{label:"Keyshia Cole"},{label:"Amerie"},{label:"Maxwell (musician)"},{label:"Anthony Hamilton (musician)"},{label:"Fantasia Barrino"}] },
  { name:"Best Rap Groups", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Wu-Tang Clan"},{label:"N.W.A"},{label:"OutKast"},{label:"A Tribe Called Quest"},{label:"Run-D.M.C."}],
    itemPool:[{label:"Wu-Tang Clan"},{label:"N.W.A"},{label:"OutKast"},{label:"A Tribe Called Quest"},{label:"Run-D.M.C."},{label:"Public Enemy"},{label:"Migos"},{label:"Bone Thugs-n-Harmony"},{label:"Cypress Hill"},{label:"De La Soul"},{label:"Beastie Boys"},{label:"Mobb Deep"},{label:"Three 6 Mafia"},{label:"Naughty by Nature"},{label:"The Fugees"},{label:"Salt-N-Pepa"},{label:"Digital Underground"},{label:"Geto Boys"},{label:"Onyx (group)"},{label:"Goodie Mob"},{label:"Clipse"},{label:"Dipset"},{label:"Das EFX"},{label:"EPMD"},{label:"Eric B. & Rakim"}] },
  { name:"Best Female Rappers", mood: "music", provider:"wiki", mediaType:"person", items:[{label:"Nicki Minaj"},{label:"Missy Elliott"},{label:"Cardi B"},{label:"Lauryn Hill"},{label:"Megan Thee Stallion"}],
    itemPool:[{label:"Nicki Minaj"},{label:"Missy Elliott"},{label:"Cardi B"},{label:"Lauryn Hill"},{label:"Megan Thee Stallion"},{label:"Lil' Kim"},{label:"Eve (rapper)"},{label:"Queen Latifah"},{label:"Salt-N-Pepa"},{label:"Doja Cat"},{label:"GloRilla"},{label:"Ice Spice"},{label:"Saweetie"},{label:"Foxy Brown (rapper)"},{label:"MC Lyte"},{label:"Roxanne Shanté"},{label:"Sha'Carri Richardson"},{label:"Tierra Whack"},{label:"Noname (rapper)"},{label:"Rico Nasty"},{label:"Remy Ma"},{label:"Iggy Azalea"},{label:"M.I.A. (rapper)"},{label:"Azealia Banks"},{label:"Lizzo"}] },

  // ————— Games & Hobbies —————
  { name:"Best Video Game Franchises", mood: "games", provider:"wiki", items:[{label:"The Legend of Zelda"},{label:"Super Mario"},{label:"Halo (franchise)"},{label:"Final Fantasy"},{label:"Grand Theft Auto"}],
    itemPool:[{label:"The Legend of Zelda"},{label:"Super Mario"},{label:"Halo (franchise)"},{label:"Final Fantasy"},{label:"Grand Theft Auto"},{label:"Pokémon"},{label:"Call of Duty"},{label:"Minecraft"},{label:"The Elder Scrolls"},{label:"Resident Evil"},{label:"Assassin's Creed"},{label:"God of War (franchise)"},{label:"Uncharted"},{label:"Metal Gear"},{label:"Sonic the Hedgehog"},{label:"Mortal Kombat"},{label:"Street Fighter"},{label:"Dark Souls"},{label:"Fallout (series)"},{label:"Mass Effect"},{label:"Tomb Raider"},{label:"Red Dead Redemption"},{label:"BioShock (series)"},{label:"FIFA (video game series)"},{label:"Borderlands (series)"}] },
  { name:"Best Open-World Games", mood: "games", provider:"wiki", items:[{label:"The Witcher 3: Wild Hunt"},{label:"Grand Theft Auto V"},{label:"Red Dead Redemption 2"},{label:"The Legend of Zelda: Breath of the Wild"},{label:"Assassin's Creed Odyssey"}],
    itemPool:[{label:"The Witcher 3: Wild Hunt"},{label:"Grand Theft Auto V"},{label:"Red Dead Redemption 2"},{label:"The Legend of Zelda: Breath of the Wild"},{label:"Assassin's Creed Odyssey"},{label:"Elden Ring"},{label:"Horizon Zero Dawn"},{label:"Cyberpunk 2077"},{label:"Spider-Man (2018 video game)"},{label:"Ghost of Tsushima"},{label:"Fallout 4"},{label:"The Elder Scrolls V: Skyrim"},{label:"Far Cry 5"},{label:"Death Stranding"},{label:"No Man's Sky"},{label:"Minecraft"},{label:"Days Gone"},{label:"Assassin's Creed Valhalla"},{label:"Horizon Forbidden West"},{label:"The Legend of Zelda: Tears of the Kingdom"},{label:"Starfield (video game)"}] },
  { name:"Best PlayStation Exclusives", mood: "games", provider:"wiki", items:[{label:"The Last of Us"},{label:"God of War (2018 video game)"},{label:"Uncharted 4: A Thief's End"},{label:"Ghost of Tsushima"},{label:"Bloodborne"}],
    itemPool:[{label:"The Last of Us"},{label:"God of War (2018 video game)"},{label:"Uncharted 4: A Thief's End"},{label:"Ghost of Tsushima"},{label:"Bloodborne"},{label:"Horizon Zero Dawn"},{label:"Spider-Man (2018 video game)"},{label:"The Last of Us Part II"},{label:"God of War Ragnarök"},{label:"Ratchet & Clank: Rift Apart"},{label:"Returnal (video game)"},{label:"Shadow of the Colossus"},{label:"Persona 5"},{label:"Final Fantasy VII Remake"},{label:"Gran Turismo 7"},{label:"Infamous Second Son"},{label:"Days Gone"},{label:"Death Stranding"},{label:"Demon's Souls (2020 video game)"},{label:"Astro Bot"},{label:"Uncharted 2: Among Thieves"}] },
  { name:"Best Nintendo Switch Games", mood: "games", provider:"wiki", items:[{label:"Mario Kart 8 Deluxe"},{label:"Animal Crossing: New Horizons"},{label:"Super Smash Bros. Ultimate"},{label:"The Legend of Zelda: Tears of the Kingdom"},{label:"Splatoon 3"}],
    itemPool:[{label:"Mario Kart 8 Deluxe"},{label:"Animal Crossing: New Horizons"},{label:"Super Smash Bros. Ultimate"},{label:"The Legend of Zelda: Tears of the Kingdom"},{label:"Splatoon 3"},{label:"The Legend of Zelda: Breath of the Wild"},{label:"Super Mario Odyssey"},{label:"Pokémon Scarlet and Violet"},{label:"Fire Emblem: Three Houses"},{label:"Xenoblade Chronicles 3"},{label:"Metroid Dread"},{label:"Kirby and the Forgotten Land"},{label:"Luigi's Mansion 3"},{label:"Bayonetta 3"},{label:"Hollow Knight"},{label:"Celeste (video game)"},{label:"Hades (video game)"},{label:"Ring Fit Adventure"},{label:"Pikmin 4"},{label:"Mario + Rabbids Kingdom Battle"},{label:"Astral Chain"}] },
  { name:"Best Indie Games", mood: "games", provider:"wiki", items:[{label:"Hades (video game)"},{label:"Celeste (video game)"},{label:"Hollow Knight"},{label:"Stardew Valley"},{label:"Undertale"}],
    itemPool:[{label:"Hades (video game)"},{label:"Celeste (video game)"},{label:"Hollow Knight"},{label:"Stardew Valley"},{label:"Undertale"},{label:"Cuphead"},{label:"Dead Cells"},{label:"Ori and the Blind Forest"},{label:"Shovel Knight"},{label:"Terraria"},{label:"Outer Wilds"},{label:"Disco Elysium"},{label:"Slay the Spire"},{label:"Into the Breach"},{label:"Return of the Obra Dinn"},{label:"Katana Zero"},{label:"Hotline Miami"},{label:"FTL: Faster Than Light"},{label:"Braid (video game)"},{label:"Limbo (video game)"},{label:"Inside (video game)"},{label:"Inscryption"},{label:"Balatro"},{label:"Vampire Survivors"},{label:"Tunic (video game)"}] },
  { name:"Best Board Games", mood: "games", provider:"wiki", items:[{label:"Catan"},{label:"Ticket to Ride (board game)"},{label:"Carcassonne (board game)"},{label:"Pandemic (board game)"},{label:"Chess"}],
    itemPool:[{label:"Catan"},{label:"Ticket to Ride (board game)"},{label:"Carcassonne (board game)"},{label:"Pandemic (board game)"},{label:"Chess"},{label:"Monopoly (game)"},{label:"Scrabble"},{label:"Risk (game)"},{label:"Clue (board game)"},{label:"Codenames (board game)"},{label:"Azul (board game)"},{label:"Wingspan (board game)"},{label:"7 Wonders (board game)"},{label:"Splendor (game)"},{label:"Terraforming Mars (board game)"},{label:"Gloomhaven"},{label:"Betrayal at House on the Hill"},{label:"Dixit (board game)"},{label:"Spirit Island (board game)"},{label:"Dominion (card game)"},{label:"Agricola (board game)"}] },
  { name:"Best Card Games", mood: "games", provider:"wiki", items:[{label:"Poker"},{label:"Blackjack"},{label:"Uno (card game)"},{label:"Magic: The Gathering"},{label:"Hearthstone"}],
    itemPool:[{label:"Poker"},{label:"Blackjack"},{label:"Uno (card game)"},{label:"Magic: The Gathering"},{label:"Hearthstone"},{label:"Bridge (card game)"},{label:"Hearts (card game)"},{label:"Spades (card game)"},{label:"Rummy"},{label:"Solitaire"},{label:"Yu-Gi-Oh!"},{label:"Pokémon Trading Card Game"},{label:"Exploding Kittens"},{label:"Cards Against Humanity"},{label:"Phase 10"},{label:"Skip-Bo"},{label:"Dominion (card game)"},{label:"Gwent: The Witcher Card Game"},{label:"Rook (card game)"},{label:"Euchre"},{label:"Cribbage"}] },

  // ————— Sports —————
  { name:"Best NBA Legends", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Michael Jordan"},{label:"LeBron James"},{label:"Kobe Bryant"},{label:"Magic Johnson"},{label:"Larry Bird"}],
    itemPool:[{label:"Michael Jordan"},{label:"LeBron James"},{label:"Kobe Bryant"},{label:"Magic Johnson"},{label:"Larry Bird"},{label:"Shaquille O'Neal"},{label:"Tim Duncan"},{label:"Kareem Abdul-Jabbar"},{label:"Wilt Chamberlain"},{label:"Bill Russell"},{label:"Stephen Curry"},{label:"Kevin Durant"},{label:"Hakeem Olajuwon"},{label:"Julius Erving"},{label:"Oscar Robertson"},{label:"Charles Barkley"},{label:"Scottie Pippen"},{label:"Karl Malone"},{label:"Allen Iverson"},{label:"Dirk Nowitzki"},{label:"Dwyane Wade"},{label:"Kevin Garnett"},{label:"Giannis Antetokounmpo"},{label:"Isiah Thomas"},{label:"Patrick Ewing"}] },
  { name:"Best NFL Quarterbacks", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Tom Brady"},{label:"Peyton Manning"},{label:"Joe Montana"},{label:"Patrick Mahomes"},{label:"Aaron Rodgers"}],
    itemPool:[{label:"Tom Brady"},{label:"Peyton Manning"},{label:"Joe Montana"},{label:"Patrick Mahomes"},{label:"Aaron Rodgers"},{label:"Johnny Unitas"},{label:"Brett Favre"},{label:"Dan Marino"},{label:"John Elway"},{label:"Drew Brees"},{label:"Russell Wilson"},{label:"Steve Young"},{label:"Troy Aikman"},{label:"Terry Bradshaw"},{label:"Roger Staubach"},{label:"Bart Starr"},{label:"Josh Allen (quarterback)"},{label:"Lamar Jackson"},{label:"Jalen Hurts"},{label:"Joe Burrow"},{label:"Justin Herbert"},{label:"Dak Prescott"},{label:"Matthew Stafford"},{label:"Eli Manning"},{label:"Kurt Warner"}] },
  { name:"Best Soccer Players", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Lionel Messi"},{label:"Cristiano Ronaldo"},{label:"Pelé"},{label:"Diego Maradona"},{label:"Zinedine Zidane"}],
    itemPool:[{label:"Lionel Messi"},{label:"Cristiano Ronaldo"},{label:"Pelé"},{label:"Diego Maradona"},{label:"Zinedine Zidane"},{label:"Ronaldinho"},{label:"Ronaldo (Brazilian footballer)"},{label:"Johan Cruyff"},{label:"Franz Beckenbauer"},{label:"Michel Platini"},{label:"Thierry Henry"},{label:"Kylian Mbappé"},{label:"Erling Haaland"},{label:"Neymar"},{label:"Wayne Rooney"},{label:"David Beckham"},{label:"Andres Iniesta"},{label:"Xavi"},{label:"Luka Modrić"},{label:"Gianluigi Buffon"},{label:"Roberto Baggio"},{label:"George Best"},{label:"Alfredo Di Stéfano"},{label:"Ferenc Puskás"},{label:"Zlatan Ibrahimović"}] },
  { name:"Best Tennis Players", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Roger Federer"},{label:"Rafael Nadal"},{label:"Novak Djokovic"},{label:"Serena Williams"},{label:"Steffi Graf"}],
    itemPool:[{label:"Roger Federer"},{label:"Rafael Nadal"},{label:"Novak Djokovic"},{label:"Serena Williams"},{label:"Steffi Graf"},{label:"Pete Sampras"},{label:"Andre Agassi"},{label:"Venus Williams"},{label:"Billie Jean King"},{label:"Bjorn Borg"},{label:"John McEnroe"},{label:"Boris Becker"},{label:"Andy Murray"},{label:"Maria Sharapova"},{label:"Iga Świątek"},{label:"Carlos Alcaraz"},{label:"Coco Gauff"},{label:"Rod Laver"},{label:"Martina Navratilova"},{label:"Arthur Ashe"},{label:"Jimmy Connors"},{label:"Ashleigh Barty"},{label:"Naomi Osaka"},{label:"Monica Seles"},{label:"Justine Henin"}] },
  { name:"Best F1 Drivers", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Michael Schumacher"},{label:"Lewis Hamilton"},{label:"Ayrton Senna"},{label:"Alain Prost"},{label:"Max Verstappen"}],
    itemPool:[{label:"Michael Schumacher"},{label:"Lewis Hamilton"},{label:"Ayrton Senna"},{label:"Alain Prost"},{label:"Max Verstappen"},{label:"Niki Lauda"},{label:"Fernando Alonso"},{label:"Kimi Räikkönen"},{label:"Sebastian Vettel"},{label:"Mika Häkkinen"},{label:"Juan Manuel Fangio"},{label:"James Hunt"},{label:"Jackie Stewart"},{label:"Nigel Mansell"},{label:"Jenson Button"},{label:"Daniel Ricciardo"},{label:"Charles Leclerc"},{label:"Lando Norris"},{label:"Nelson Piquet"},{label:"Damon Hill"},{label:"Carlos Sainz Jr."},{label:"George Russell (racing driver)"},{label:"Rubens Barrichello"},{label:"David Coulthard"},{label:"Emerson Fittipaldi"}] },
  { name:"Best Golfers", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Tiger Woods"},{label:"Jack Nicklaus"},{label:"Arnold Palmer"},{label:"Rory McIlroy"},{label:"Phil Mickelson"}],
    itemPool:[{label:"Tiger Woods"},{label:"Jack Nicklaus"},{label:"Arnold Palmer"},{label:"Rory McIlroy"},{label:"Phil Mickelson"},{label:"Ben Hogan"},{label:"Gary Player"},{label:"Tom Watson (golfer)"},{label:"Seve Ballesteros"},{label:"Lee Trevino"},{label:"Sam Snead"},{label:"Bobby Jones (golfer)"},{label:"Jordan Spieth"},{label:"Justin Thomas (golfer)"},{label:"Brooks Koepka"},{label:"Dustin Johnson"},{label:"Jon Rahm"},{label:"Scottie Scheffler"},{label:"Annika Sörenstam"},{label:"Nancy Lopez"},{label:"Nelly Korda"},{label:"Collin Morikawa"},{label:"Bryson DeChambeau"},{label:"Ernie Els"},{label:"Nick Faldo"}] },
  { name:"Best MLB Legends", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Babe Ruth"},{label:"Hank Aaron"},{label:"Willie Mays"},{label:"Derek Jeter"},{label:"Shohei Ohtani"}],
    itemPool:[{label:"Babe Ruth"},{label:"Hank Aaron"},{label:"Willie Mays"},{label:"Derek Jeter"},{label:"Shohei Ohtani"},{label:"Ted Williams"},{label:"Lou Gehrig"},{label:"Jackie Robinson"},{label:"Roberto Clemente"},{label:"Mickey Mantle"},{label:"Ty Cobb"},{label:"Barry Bonds"},{label:"Ken Griffey Jr."},{label:"Sandy Koufax"},{label:"Pedro Martinez"},{label:"Mariano Rivera"},{label:"Mike Trout"},{label:"Albert Pujols"},{label:"Ichiro Suzuki"},{label:"Nolan Ryan"},{label:"Cal Ripken Jr."},{label:"Randy Johnson"},{label:"Roger Clemens"},{label:"Joe DiMaggio"},{label:"Hank Greenberg"}] },
  { name:"Best NHL Legends", mood: "sports", provider:"wiki", mediaType:"person", items:[{label:"Wayne Gretzky"},{label:"Mario Lemieux"},{label:"Sidney Crosby"},{label:"Alex Ovechkin"},{label:"Patrick Roy"}],
    itemPool:[{label:"Wayne Gretzky"},{label:"Mario Lemieux"},{label:"Sidney Crosby"},{label:"Alex Ovechkin"},{label:"Patrick Roy"},{label:"Bobby Orr"},{label:"Gordie Howe"},{label:"Mark Messier"},{label:"Martin Brodeur"},{label:"Jaromír Jágr"},{label:"Steve Yzerman"},{label:"Connor McDavid"},{label:"Joe Sakic"},{label:"Ray Bourque"},{label:"Guy Lafleur"},{label:"Niklas Lidström"},{label:"Maurice Richard"},{label:"Jean Béliveau"},{label:"Terry Sawchuk"},{label:"Mike Bossy"},{label:"Phil Esposito"},{label:"Brett Hull"},{label:"Henrik Lundqvist"},{label:"Pavel Datsyuk"},{label:"Dominik Hašek"}] },

  // ————— Places / Travel —————
  { name:"Best Cities to Visit", mood: "places", provider:"wiki", items:[{label:"Paris"},{label:"Tokyo"},{label:"New York City"},{label:"Rome"},{label:"London"}] },
  { name:"Best US National Parks", mood: "places", provider:"wiki", items:[{label:"Yellowstone"},{label:"Yosemite"},{label:"Grand Canyon"},{label:"Zion National Park"},{label:"Glacier National Park"}] },
  { name:"Best World Landmarks", mood: "places", provider:"wiki", items:[{label:"Eiffel Tower"},{label:"Great Wall of China"},{label:"Taj Mahal"},{label:"Machu Picchu"},{label:"Statue of Liberty"}] },
  { name:"Best Beaches", mood: "places", provider:"wiki", items:[{label:"Bora Bora"},{label:"Maldives"},{label:"Maui"},{label:"Santorini"},{label:"Phuket"}] },
  { name:"Best Ski Destinations", mood: "places", provider:"wiki", items:[{label:"Aspen, Colorado"},{label:"Whistler, British Columbia"},{label:"Zermatt"},{label:"Chamonix"},{label:"St. Moritz"}] },
  { name:"Best Theme Parks", mood: "places", provider:"wiki", items:[{label:"Disneyland"},{label:"Walt Disney World"},{label:"Universal Studios Japan"},{label:"Universal Orlando"},{label:"Europa-Park"}] },

  // ————— Books / Comics —————
  { name:"Best Fantasy Book Series", mood: "culture", provider:"wiki", items:[{label:"Harry Potter"},{label:"The Lord of the Rings"},{label:"A Song of Ice and Fire"},{label:"The Wheel of Time"},{label:"The Stormlight Archive"}] },
  { name:"Best Sci-Fi Authors", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Isaac Asimov"},{label:"Arthur C. Clarke"},{label:"Philip K. Dick"},{label:"Ursula K. Le Guin"},{label:"Frank Herbert"}] },
  { name:"Best Comic Book Heroes", mood: "people", provider:"wiki", items:[{label:"Batman"},{label:"Spider-Man"},{label:"Superman"},{label:"Wonder Woman"},{label:"Wolverine (character)"}] },
  { name:"Best Comic Book Villains", mood: "people", provider:"wiki", items:[{label:"Joker (character)"},{label:"Magneto (Marvel Comics)"},{label:"Loki (Marvel Comics)"},{label:"Thanos"},{label:"Green Goblin (Marvel Comics)"}] },
  { name:"Best 90s Sitcom Characters", mood: "tv", provider:"wiki", items:[{label:"Chandler Bing"},{label:"George Costanza"},{label:"Frasier Crane"},{label:"Will Smith (The Fresh Prince of Bel-Air)"},{label:"Elaine Benes"}] },
  { name:"Best 2000s TV Antiheroes", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Tony Soprano"},{label:"Walter White"},{label:"Don Draper"},{label:"Dexter Morgan"},{label:"Omar Little"}] },

  // ————— Tech / Gadgets —————
  { name:"Best Streaming Devices", mood: "tech", provider:"wiki", items:[{label:"Roku"},{label:"Apple TV"},{label:"Amazon Fire TV Stick"},{label:"Google Chromecast"},{label:"Nvidia Shield TV"}] },
  { name:"Best Smartphones of the 2010s", mood: "tech", provider:"wiki", items:[{label:"iPhone X"},{label:"Samsung Galaxy S10"},{label:"Google Pixel 3"},{label:"OnePlus 6T"},{label:"Huawei P30 Pro"}] },
  { name:"Best Laptops for Creators", mood: "tech", provider:"wiki", items:[{label:"MacBook Pro"},{label:"Dell XPS 15"},{label:"Razer Blade 15"},{label:"Microsoft Surface Laptop"},{label:"HP Spectre x360"}] },
  { name:"Best Headphones (Consumer)", mood: "tech", provider:"wiki", items:[{label:"Sony WH-1000XM5"},{label:"Bose QuietComfort 45"},{label:"AirPods Pro"},{label:"Sennheiser Momentum 4"},{label:"Beats Studio Pro"}] },
  { name:"Best Cameras", mood: "tech", provider:"wiki", items:[{label:"Canon EOS R5"},{label:"Sony A7 IV"},{label:"Nikon Z7 II"},{label:"Fujifilm X-T5"},{label:"Panasonic Lumix S5"}] },
  { name:"Best Car Brands", mood: "tech", provider:"wiki", items:[{label:"Toyota"},{label:"BMW"},{label:"Mercedes-Benz"},{label:"Tesla, Inc."},{label:"Honda"}] },
  { name:"Best Electric Cars", mood: "tech", provider:"wiki", items:[{label:"Tesla Model 3"},{label:"Ford Mustang Mach-E"},{label:"Hyundai Ioniq 5"},{label:"Porsche Taycan"},{label:"Nissan Leaf"}] },
  { name:"Best Classic Cars", mood: "tech", provider:"wiki", items:[{label:"Ford Mustang (1965)"},{label:"Chevrolet Camaro (1969)"},{label:"Porsche 911 (1973)"},{label:"Jaguar E-Type"},{label:"Volkswagen Beetle"}] },
  { name:"Best Streaming Services", mood: "tv", provider:"wiki", items:[{label:"Netflix"},{label:"Disney+"},{label:"Hulu"},{label:"Amazon Prime Video"},{label:"HBO Max"}], mediaType:"brand" },
  { name:"Best Productivity Apps", mood: "tech", provider:"wiki", items:[{label:"Notion (productivity software)"},{label:"Trello"},{label:"Asana (software)"},{label:"Todoist"},{label:"Evernote"}] },
  { name:"Best Web Browsers", mood: "tech", provider:"wiki", mediaType:"software", items:[{label:"Google Chrome"},{label:"Mozilla Firefox"},{label:"Microsoft Edge"},{label:"Safari (web browser)"},{label:"Brave (web browser)"}] },
  { name:"Best Programming Languages", mood: "tech", provider:"wiki", mediaType:"software", items:[{label:"Python (programming language)"},{label:"JavaScript"},{label:"Java (programming language)"},{label:"C Sharp (programming language)"},{label:"Go (programming language)"}] },
  { name:"Best Cloud Providers", mood: "tech", provider:"wiki", items:[{label:"Amazon Web Services"},{label:"Microsoft Azure"},{label:"Google Cloud Platform"},{label:"DigitalOcean"},{label:"Heroku"}] },
  { name:"Best Web Frameworks", mood: "tech", provider:"wiki", mediaType:"software", items:[{label:"React (software)"},{label:"Vue.js"},{label:"Angular (web framework)"},{label:"Svelte"},{label:"Next.js"}] },
  { name:"Best AI Tools (Consumer)", mood: "tech", provider:"wiki", items:[{label:"ChatGPT"},{label:"Midjourney"},{label:"Stable Diffusion"},{label:"Claude (language model)"},{label:"Perplexity (chatbot)"}] },
  { name:"Best Operating Systems", mood: "tech", provider:"wiki", items:[{label:"Windows 11"},{label:"macOS"},{label:"Ubuntu"},{label:"Android"},{label:"iOS"}] },
  { name:"Best Smartwatches", mood: "tech", provider:"wiki", items:[{label:"Apple Watch"},{label:"Samsung Galaxy Watch"},{label:"Garmin Forerunner"},{label:"Fitbit Versa"},{label:"Google Pixel Watch"}] },

  // ————— Lifestyle / Culture —————
  { name:"Best Fitness Activities", mood: "culture", provider:"wiki", mediaType:"activity", items:[{label:"Running"},{label:"Cycling (sport)"},{label:"Swimming (sport)"},{label:"Yoga"},{label:"Weightlifting"}] },
  { name:"Best Hikes in the World", mood: "places", provider:"wiki", items:[{label:"Inca Trail"},{label:"Appalachian Trail"},{label:"Tour du Mont Blanc"},{label:"Mount Kilimanjaro"},{label:"Tongariro Alpine Crossing"}] },
  { name:"Best Museums", mood: "places", provider:"wiki", items:[{label:"Louvre"},{label:"British Museum"},{label:"The Metropolitan Museum of Art"},{label:"Museo del Prado"},{label:"Uffizi Gallery"}] },
  { name:"Best Universities", mood: "culture", provider:"wiki", items:[{label:"Harvard University"},{label:"Stanford University"},{label:"MIT"},{label:"University of Oxford"},{label:"University of Cambridge"}] },
  { name:"Best 20th-Century Inventions", mood: "culture", provider:"wiki", items:[{label:"Internet"},{label:"Penicillin"},{label:"Airplane"},{label:"Television"},{label:"Nuclear power"}] },
  { name:"Best 21st-Century Inventions", mood: "culture", provider:"wiki", items:[{label:"Smartphone"},{label:"CRISPR"},{label:"3D printing"},{label:"Social media"},{label:"Electric car"}] },
  { name:"Best Startups of the 2010s", mood: "culture", provider:"wiki", items:[{label:"Uber", hints:{kind:"brand"}},{label:"Airbnb", hints:{kind:"brand"}},{label:"Slack (software)", hints:{kind:"brand"}},{label:"Stripe (company)", hints:{kind:"brand"}},{label:"Snapchat", hints:{kind:"brand"}}] },
  { name:"Best Social Networks", mood: "culture", provider:"wiki", items:[{label:"Facebook"},{label:"Instagram"},{label:"TikTok"},{label:"X (social network)"},{label:"Reddit"}] },
  { name:"Best Podcasts", mood: "culture", provider:"wiki", mediaType:"podcast", items:[{label:"The Joe Rogan Experience"},{label:"This American Life"},{label:"Radiolab"},{label:"Serial (podcast)"},{label:"The Daily (podcast)"}] },
  { name:"Best Late-Night Hosts", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Jimmy Fallon"},{label:"Jimmy Kimmel"},{label:"Stephen Colbert"},{label:"John Oliver"},{label:"Seth Meyers"}] },
  { name:"Best Stand-Up Comedians", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Dave Chappelle"},{label:"Jerry Seinfeld"},{label:"Kevin Hart"},{label:"Ali Wong"},{label:"John Mulaney"}] },
  { name:"Best YouTubers", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"MrBeast"},{label:"PewDiePie"},{label:"Markiplier"},{label:"Dude Perfect"},{label:"Emma Chamberlain"}] },
  { name:"Best Twitch Streamers", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Ninja (streamer)"},{label:"Pokimane"},{label:"Shroud (streamer)"},{label:"xQc"},{label:"Valkyrae"}] },
  { name:"Best Soccer Clubs", mood: "sports", provider:"wiki", items:[{label:"Real Madrid"},{label:"FC Barcelona"},{label:"Manchester United"},{label:"Bayern Munich"},{label:"Liverpool"}] },
  { name:"Best NFL Teams (All-Time)", mood: "sports", provider:"wiki", items:[{label:"1985 Chicago Bears season", hints:{kind:"team"}},{label:"2007 New England Patriots season", hints:{kind:"team"}},{label:"1972 Miami Dolphins season", hints:{kind:"team"}},{label:"1990s Dallas Cowboys", hints:{kind:"team"}},{label:"2013 Seattle Seahawks season", hints:{kind:"team"}}] },
  { name:"Best Olympic Sprinters", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Usain Bolt"},{label:"Carl Lewis"},{label:"Michael Johnson"},{label:"Yohan Blake"},{label:"Justin Gatlin"}] },
  { name:"Best Swimmers", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Michael Phelps"},{label:"Katie Ledecky"},{label:"Ian Thorpe"},{label:"Ryan Lochte"},{label:"Missy Franklin"}] },
  { name:"Best Chess Players", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Magnus Carlsen"},{label:"Garry Kasparov"},{label:"Bobby Fischer"},{label:"Anatoly Karpov"},{label:"Hikaru Nakamura"}] },
  { name:"Best Painters", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Leonardo da Vinci"},{label:"Vincent van Gogh"},{label:"Pablo Picasso"},{label:"Claude Monet"},{label:"Rembrandt"}] },
  { name:"Best Architects", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Frank Lloyd Wright"},{label:"Zaha Hadid"},{label:"Le Corbusier"},{label:"I. M. Pei"},{label:"Antoni Gaudí"}] },
  { name:"Best Photographers", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Ansel Adams"},{label:"Annie Leibovitz"},{label:"Henri Cartier-Bresson"},{label:"Steve McCurry"},{label:"Diane Arbus"}] },
  { name:"Best Fashion Designers", mood: "people", provider:"wiki", mediaType:"person", items:[{label:"Coco Chanel"},{label:"Giorgio Armani"},{label:"Gianni Versace"},{label:"Alexander McQueen"},{label:"Marc Jacobs"}] },
  { name:"Best Sneakers", mood: "culture", provider:"wiki", mediaType:"sneaker",
    items:[{label:"Air Jordan 1"},{label:"Nike Air Force 1"},{label:"Adidas Stan Smith"},{label:"Converse Chuck Taylor All Star"},{label:"Adidas Yeezy"}],
    itemPool:[{label:"Air Jordan 1"},{label:"Nike Air Force 1"},{label:"Adidas Stan Smith"},{label:"Converse Chuck Taylor All Star"},{label:"Adidas Yeezy"},{label:"Nike Air Max 1"},{label:"New Balance 574"},{label:"Nike Dunk"},{label:"Adidas Superstar (shoe)"},{label:"Vans Old Skool"},{label:"Puma Suede"},{label:"Reebok Classic"}] },
  { name:"Best Watch Brands", mood: "culture", provider:"wiki", mediaType:"fashion", items:[{label:"Rolex"},{label:"Omega (watchmaker)"},{label:"Patek Philippe SA"},{label:"TAG Heuer"},{label:"Audemars Piguet"}] },
  { name:"Best Beer Styles", mood: "food", provider:"wiki", items:[{label:"India pale ale"},{label:"Stout"},{label:"Lager"},{label:"Pilsner"},{label:"Wheat beer"}] },
  { name:"Best Cocktails", mood: "food", provider:"wiki", items:[{label:"Old fashioned (cocktail)"},{label:"Margarita"},{label:"Mojito"},{label:"Negroni"},{label:"Martini (cocktail)"}] },
  { name:"Best Wine Varieties", mood: "food", provider:"wiki", items:[{label:"Cabernet Sauvignon"},{label:"Pinot noir"},{label:"Chardonnay"},{label:"Sauvignon blanc"},{label:"Merlot"}] },
  { name:"Best Winter Destinations", mood: "places", provider:"wiki", items:[{label:"Lapland"},{label:"Quebec City"},{label:"Vienna"},{label:"Reykjavik"},{label:"Zurich"}] },
  { name:"Best City Skylines", mood: "places", provider:"wiki", items:[{label:"New York City"},{label:"Hong Kong"},{label:"Dubai"},{label:"Shanghai"},{label:"Singapore"}] },
  { name:"Best Stadiums", mood: "sports", provider:"wiki", items:[{label:"Camp Nou"},{label:"Wembley Stadium"},{label:"Madison Square Garden"},{label:"Yankee Stadium"},{label:"Maracanã"}] },
  { name:"Best Space Missions", mood: "tech", provider:"wiki", items:[{label:"Apollo 11"},{label:"Voyager 1"},{label:"Hubble Space Telescope"},{label:"Mars Curiosity Rover"},{label:"James Webb Space Telescope"}] },
  { name:"Best Code Editors", mood: "tech", provider:"wiki", items:[{label:"Visual Studio Code"},{label:"Sublime Text"},{label:"Vim (text editor)"},{label:"IntelliJ IDEA"},{label:"Atom (text editor)"}] },
  { name:"Best Productivity Methods", mood: "culture", provider:"wiki", items:[{label:"Pomodoro Technique"},{label:"Time Blocking"},{label:"Getting Things Done"},{label:"Eat the Frog"},{label:"2-Minute Rule"}] },
  { name:"Best Dog Breeds", mood: "animals", provider:"wiki", items:[{label:"Labrador Retriever"},{label:"German Shepherd"},{label:"Golden Retriever"},{label:"Poodle"},{label:"French Bulldog"}] },
  { name:"Best Cat Breeds", mood: "animals", provider:"wiki", items:[{label:"Persian cat"},{label:"Siamese cat"},{label:"Maine Coon"},{label:"British Shorthair"},{label:"Sphynx"}] },
  { name:"Best Wildlife Animals", mood: "animals", provider:"wiki", items:[{label:"Lion"},{label:"Elephant"},{label:"Tiger"},{label:"Giraffe"},{label:"Giant panda"}] },
  { name:"Best Mountains", mood: "places", provider:"wiki", items:[{label:"Mount Everest"},{label:"K2"},{label:"Denali"},{label:"Matterhorn"},{label:"Mount Kilimanjaro"}] },
  { name:"Best Rivers", mood: "places", provider:"wiki", items:[{label:"Nile"},{label:"Amazon River"},{label:"Yangtze"},{label:"Mississippi River"},{label:"Danube"}] },
  { name:"Best Islands", mood: "places", provider:"wiki", items:[{label:"Bali"},{label:"Santorini"},{label:"Iceland"},{label:"Maui"},{label:"Seychelles"}] },
  { name:"Best Languages to Learn", mood: "culture", provider:"wiki", items:[{label:"Spanish"},{label:"Mandarin Chinese"},{label:"French"},{label:"German"},{label:"Japanese"}] }
];

// Append to existing topics list
window.TOPICS = (window.TOPICS || []).concat(MORE_TOPICS);