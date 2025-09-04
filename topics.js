// topics.js
// 100 categories, 5 items each. Movies/TV use TMDB (needs TMDB key). Others use Wikipedia PageImages.
// You can override any item's image with: { label: "X", imageUrl: "https://..." }

window.BLIND_RANK_TOPICS = [
  // ---- Movies (TMDB) ----
  { name: "Comfort Movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Spirited Away"}, {label:"Pride & Prejudice (2005 film)"}, {label:"The Princess Bride"},
    {label:"Amélie"}, {label:"Back to the Future"}
  ]},
  { name: "Sci-Fi Movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Blade Runner"}, {label:"Interstellar"}, {label:"The Matrix"}, {label:"Arrival"}, {label:"Dune (2021 film)"}
  ]},
  { name: "Horror Movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Shining"}, {label:"Get Out"}, {label:"Hereditary"}, {label:"A Quiet Place"}, {label:"It Follows"}
  ]},
  { name: "90s Blockbusters", provider: "tmdb", mediaType: "movie", items: [
    {label:"Jurassic Park"}, {label:"Titanic"}, {label:"Independence Day"}, {label:"The Lion King (1994 film)"}, {label:"The Matrix"}
  ]},
  { name: "Animated Classics", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Lion King (1994 film)"}, {label:"Beauty and the Beast (1991 film)"}, {label:"Aladdin (1992 Disney film)"},
    {label:"Toy Story"}, {label:"Princess Mononoke"}
  ]},
  { name: "Pixar Movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"Toy Story"}, {label:"Up"}, {label:"Inside Out"}, {label:"Coco"}, {label:"Ratatouille"}
  ]},
  { name: "DreamWorks Animation", provider: "tmdb", mediaType: "movie", items: [
    {label:"Shrek"}, {label:"How to Train Your Dragon"}, {label:"Kung Fu Panda"}, {label:"Madagascar"}, {label:"Megamind"}
  ]},
  { name: "Superhero Movies", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Dark Knight"}, {label:"Avengers: Endgame"}, {label:"Spider-Man: Into the Spider-Verse"},
    {label:"Iron Man (2008 film)"}, {label:"Black Panther (film)"}
  ]},
  { name: "Rom-Com Favorites", provider: "tmdb", mediaType: "movie", items: [
    {label:"When Harry Met Sally..."}, {label:"Notting Hill (film)"}, {label:"10 Things I Hate About You"},
    {label:"Crazy Rich Asians (film)"}, {label:"Love Actually"}
  ]},
  { name: "Best Picture Winners", provider: "tmdb", mediaType: "movie", items: [
    {label:"The Godfather"}, {label:"The Silence of the Lambs (1991 film)"}, {label:"No Country for Old Men (film)"},
    {label:"The Departed"}, {label:"Parasite (film)"}
  ]},

  // ---- TV (TMDB) ----
  { name: "Popular TV Dramas", provider: "tmdb", mediaType: "tv", items: [
    {label:"Breaking Bad"}, {label:"Game of Thrones"}, {label:"The Crown (TV series)"},
    {label:"Stranger Things"}, {label:"The Last of Us (TV series)"}
  ]},
  { name: "Sitcoms", provider: "tmdb", mediaType: "tv", items: [
    {label:"Friends"}, {label:"The Office (American TV series)"}, {label:"Parks and Recreation"},
    {label:"Seinfeld"}, {label:"Brooklyn Nine-Nine"}
  ]},
  { name: "Prestige TV", provider: "tmdb", mediaType: "tv", items: [
    {label:"The Sopranos"}, {label:"Mad Men"}, {label:"The Wire"}, {label:"The Leftovers (TV series)"}, {label:"Succession"}
  ]},
  { name: "Crime Series", provider: "tmdb", mediaType: "tv", items: [
    {label:"True Detective"}, {label:"Narcos"}, {label:"Mindhunter"}, {label:"Broadchurch"}, {label:"Fargo (TV series)"}
  ]},
  { name: "Fantasy TV", provider: "tmdb", mediaType: "tv", items: [
    {label:"The Witcher (TV series)"}, {label:"House of the Dragon"}, {label:"His Dark Materials (TV series)"},
    {label:"Shadow and Bone"}, {label:"The Sandman (TV series)"}
  ]},
  { name: "Animated TV", provider: "tmdb", mediaType: "tv", items: [
    {label:"Rick and Morty"}, {label:"BoJack Horseman"}, {label:"Adventure Time"}, {label:"Avatar: The Last Airbender"}, {label:"The Simpsons"}
  ]},
  { name: "K-Drama Hits", provider: "tmdb", mediaType: "tv", items: [
    {label:"Crash Landing on You"}, {label:"Squid Game"}, {label:"Guardian: The Lonely and Great God"},
    {label:"Itaewon Class"}, {label:"Vincenzo (TV series)"}
  ]},
  { name: "British TV", provider: "tmdb", mediaType: "tv", items: [
    {label:"Sherlock (TV series)"}, {label:"Downton Abbey"}, {label:"Black Mirror"}, {label:"Peaky Blinders"}, {label:"Doctor Who"}
  ]},
  { name: "Reality Competitions", provider: "tmdb", mediaType: "tv", items: [
    {label:"Survivor (American TV series)"}, {label:"The Voice (franchise)"}, {label:"Top Chef"},
    {label:"The Great British Bake Off"}, {label:"RuPaul's Drag Race"}
  ]},
  { name: "Anime Series", provider: "tmdb", mediaType: "tv", items: [
    {label:"Naruto"}, {label:"One Piece"}, {label:"Attack on Titan"}, {label:"Demon Slayer: Kimetsu no Yaiba"}, {label:"Fullmetal Alchemist: Brotherhood"}
  ]},

  // ---- Music & People (Wikipedia) ----
  { name: "Pop Artists", provider: "wiki", items: [
    {label:"Taylor Swift"}, {label:"Billie Eilish"}, {label:"The Weeknd"}, {label:"Dua Lipa"}, {label:"Harry Styles"}
  ]},
  { name: "Rock Legends", provider: "wiki", items: [
    {label:"The Beatles"}, {label:"The Rolling Stones"}, {label:"Led Zeppelin"}, {label:"Queen (band)"}, {label:"Pink Floyd"}
  ]},
  { name: "Indie Bands", provider: "wiki", items: [
    {label:"The National (band)"}, {label:"Arctic Monkeys"}, {label:"Tame Impala"}, {label:"The 1975"}, {label:"Vampire Weekend"}
  ]},
  { name: "Hip-Hop Artists", provider: "wiki", items: [
    {label:"Kendrick Lamar"}, {label:"Drake (musician)"}, {label:"J. Cole"}, {label:"Nicki Minaj"}, {label:"Travis Scott"}
  ]},
  { name: "Country Artists", provider: "wiki", items: [
    {label:"Luke Combs"}, {label:"Carrie Underwood"}, {label:"Chris Stapleton"}, {label:"Kacey Musgraves"}, {label:"Morgan Wallen"}
  ]},
  { name: "EDM DJs", provider: "wiki", items: [
    {label:"Calvin Harris"}, {label:"Avicii"}, {label:"Skrillex"}, {label:"Deadmau5"}, {label:"Marshmello"}
  ]},
  { name: "Jazz Legends", provider: "wiki", items: [
    {label:"Miles Davis"}, {label:"John Coltrane"}, {label:"Ella Fitzgerald"}, {label:"Louis Armstrong"}, {label:"Duke Ellington"}
  ]},
  { name: "Classical Composers", provider: "wiki", items: [
    {label:"Wolfgang Amadeus Mozart"}, {label:"Ludwig van Beethoven"}, {label:"Johann Sebastian Bach"}, {label:"Pyotr Ilyich Tchaikovsky"}, {label:"Frédéric Chopin"}
  ]},
  { name: "Boy Bands", provider: "wiki", items: [
    {label:"BTS"}, {label:"Backstreet Boys"}, {label:"NSYNC"}, {label:"One Direction"}, {label:"Jonas Brothers"}
  ]},
  { name: "Girl Groups", provider: "wiki", items: [
    {label:"BLACKPINK"}, {label:"Spice Girls"}, {label:"Destiny's Child"}, {label:"Little Mix"}, {label:"Fifth Harmony"}
  ]},

  // ---- Food & Drink (Wikipedia) ----
  { name: "Foods", provider: "wiki", items: [
    {label:"Pizza"}, {label:"Sushi"}, {label:"Hamburger"}, {label:"Taco"}, {label:"Ramen"}
  ]},
  { name: "Italian Dishes", provider: "wiki", items: [
    {label:"Lasagna"}, {label:"Risotto"}, {label:"Carbonara"}, {label:"Pizza Margherita"}, {label:"Tiramisu"}
  ]},
  { name: "Japanese Dishes", provider: "wiki", items: [
    {label:"Ramen"}, {label:"Tempura"}, {label:"Okonomiyaki"}, {label:"Tonkatsu"}, {label:"Sushi"}
  ]},
  { name: "Mexican Dishes", provider: "wiki", items: [
    {label:"Tacos al pastor"}, {label:"Enchilada"}, {label:"Chile relleno"}, {label:"Mole sauce"}, {label:"Quesadilla"}
  ]},
  { name: "Indian Dishes", provider: "wiki", items: [
    {label:"Butter chicken"}, {label:"Biryani"}, {label:"Masala dosa"}, {label:"Palak paneer"}, {label:"Rogan josh"}
  ]},
  { name: "Breakfast Foods", provider: "wiki", items: [
    {label:"Pancake"}, {label:"French toast"}, {label:"Omelette"}, {label:"Bagel"}, {label:"Waffle"}
  ]},
  { name: "Desserts", provider: "wiki", items: [
    {label:"Cheesecake"}, {label:"Brownie"}, {label:"Doughnut"}, {label:"Apple pie"}, {label:"Ice cream"}
  ]},
  { name: "Cheeses", provider: "wiki", items: [
    {label:"Cheddar cheese"}, {label:"Mozzarella"}, {label:"Brie"}, {label:"Gouda cheese"}, {label:"Parmigiano Reggiano"}
  ]},
  { name: "Street Foods", provider: "wiki", items: [
    {label:"Falafel"}, {label:"Bánh mì"}, {label:"Arepa"}, {label:"Poutine"}, {label:"Samosa"}
  ]},
  { name: "Beverages", provider: "wiki", items: [
    {label:"Coffee"}, {label:"Tea"}, {label:"Lemonade"}, {label:"Hot chocolate"}, {label:"Smoothie"}
  ]},

  // ---- Animals & Nature (Wikipedia) ----
  { name: "Big Cats", provider: "wiki", items: [
    {label:"Lion"}, {label:"Tiger"}, {label:"Leopard"}, {label:"Cheetah"}, {label:"Jaguar"}
  ]},
  { name: "Dog Breeds", provider: "wiki", items: [
    {label:"Labrador Retriever"}, {label:"German Shepherd"}, {label:"Bulldog"}, {label:"Poodle"}, {label:"Beagle"}
  ]},
  { name: "Cat Breeds", provider: "wiki", items: [
    {label:"Persian cat"}, {label:"Siamese cat"}, {label:"Maine Coon"}, {label:"Bengal cat"}, {label:"Sphynx cat"}
  ]},
  { name: "Birds", provider: "wiki", items: [
    {label:"Parrot"}, {label:"Owl"}, {label:"Penguin"}, {label:"Flamingo"}, {label:"Eagle"}
  ]},
  { name: "Sea Creatures", provider: "wiki", items: [
    {label:"Dolphin"}, {label:"Shark"}, {label:"Octopus"}, {label:"Sea turtle"}, {label:"Whale"}
  ]},
  { name: "Dinosaurs", provider: "wiki", items: [
    {label:"Tyrannosaurus"}, {label:"Triceratops"}, {label:"Stegosaurus"}, {label:"Velociraptor"}, {label:"Brachiosaurus"}
  ]},
  { name: "Insects", provider: "wiki", items: [
    {label:"Butterfly"}, {label:"Dragonfly"}, {label:"Ladybird"}, {label:"Honey bee"}, {label:"Ant"}
  ]},
  { name: "Bears", provider: "wiki", items: [
    {label:"Polar bear"}, {label:"Grizzly bear"}, {label:"Giant panda"}, {label:"American black bear"}, {label:"Brown bear"}
  ]},
  { name: "Primates", provider: "wiki", items: [
    {label:"Chimpanzee"}, {label:"Gorilla"}, {label:"Orangutan"}, {label:"Gibbon"}, {label:"Baboon"}
  ]},
  { name: "Horse Breeds", provider: "wiki", items: [
    {label:"Arabian horse"}, {label:"Thoroughbred"}, {label:"Clydesdale horse"}, {label:"Mustang"}, {label:"Friesian horse"}
  ]},

  // ---- Places & Travel (Wikipedia) ----
  { name: "European Cities", provider: "wiki", items: [
    {label:"Paris"}, {label:"London"}, {label:"Rome"}, {label:"Berlin"}, {label:"Barcelona"}
  ]},
  { name: "US National Parks", provider: "wiki", items: [
    {label:"Yellowstone National Park"}, {label:"Yosemite National Park"}, {label:"Grand Canyon National Park"},
    {label:"Zion National Park"}, {label:"Acadia National Park"}
  ]},
  { name: "World Landmarks", provider: "wiki", items: [
    {label:"Eiffel Tower"}, {label:"Great Wall of China"}, {label:"Taj Mahal"}, {label:"Machu Picchu"}, {label:"Statue of Liberty"}
  ]},
  { name: "Beaches", provider: "wiki", items: [
    {label:"Bondi Beach"}, {label:"Waikiki Beach"}, {label:"Copacabana, Rio de Janeiro"}, {label:"Whitehaven Beach"}, {label:"Navagio"}
  ]},
  { name: "Mountains", provider: "wiki", items: [
    {label:"Mount Everest"}, {label:"K2"}, {label:"Matterhorn"}, {label:"Mount Fuji"}, {label:"Kilimanjaro"}
  ]},
  { name: "Islands", provider: "wiki", items: [
    {label:"Santorini"}, {label:"Bali"}, {label:"Maui"}, {label:"Iceland"}, {label:"Seychelles"}
  ]},
  { name: "US Cities", provider: "wiki", items: [
    {label:"New York City"}, {label:"Los Angeles"}, {label:"Chicago"}, {label:"Miami"}, {label:"Seattle"}
  ]},
  { name: "Asian Cities", provider: "wiki", items: [
    {label:"Tokyo"}, {label:"Seoul"}, {label:"Singapore"}, {label:"Bangkok"}, {label:"Hong Kong"}
  ]},
  { name: "Castles", provider: "wiki", items: [
    {label:"Neuschwanstein Castle"}, {label:"Edinburgh Castle"}, {label:"Himeji Castle"}, {label:"Windsor Castle"}, {label:"Bran Castle"}
  ]},
  { name: "Museums", provider: "wiki", items: [
    {label:"Louvre"}, {label:"British Museum"}, {label:"Metropolitan Museum of Art"}, {label:"Prado Museum"}, {label:"Hermitage Museum"}
  ]},

  // ---- Sports (Wikipedia) ----
  { name: "NBA Teams", provider: "wiki", items: [
    {label:"Los Angeles Lakers"}, {label:"Boston Celtics"}, {label:"Golden State Warriors"}, {label:"Chicago Bulls"}, {label:"Miami Heat"}
  ]},
  { name: "NFL Teams", provider: "wiki", items: [
    {label:"New England Patriots"}, {label:"Dallas Cowboys"}, {label:"Green Bay Packers"}, {label:"Pittsburgh Steelers"}, {label:"San Francisco 49ers"}
  ]},
  { name: "Soccer Clubs", provider: "wiki", items: [
    {label:"Real Madrid CF"}, {label:"FC Barcelona"}, {label:"Manchester United F.C."}, {label:"FC Bayern Munich"}, {label:"Paris Saint-Germain F.C."}
  ]},
  { name: "Tennis Players", provider: "wiki", items: [
    {label:"Roger Federer"}, {label:"Rafael Nadal"}, {label:"Novak Djokovic"}, {label:"Serena Williams"}, {label:"Naomi Osaka"}
  ]},
  { name: "Olympians", provider: "wiki", items: [
    {label:"Michael Phelps"}, {label:"Usain Bolt"}, {label:"Simone Biles"}, {label:"Katie Ledecky"}, {label:"Carl Lewis"}
  ]},
  { name: "Formula 1 Drivers", provider: "wiki", items: [
    {label:"Lewis Hamilton"}, {label:"Max Verstappen"}, {label:"Sebastian Vettel"}, {label:"Ayrton Senna"}, {label:"Michael Schumacher"}
  ]},
  { name: "MLB Teams", provider: "wiki", items: [
    {label:"New York Yankees"}, {label:"Los Angeles Dodgers"}, {label:"Boston Red Sox"}, {label:"Chicago Cubs"}, {label:"San Francisco Giants"}
  ]},
  { name: "NHL Teams", provider: "wiki", items: [
    {label:"Montreal Canadiens"}, {label:"Toronto Maple Leafs"}, {label:"Detroit Red Wings"}, {label:"Chicago Blackhawks"}, {label:"New York Rangers"}
  ]},
  { name: "Golfers", provider: "wiki", items: [
    {label:"Tiger Woods"}, {label:"Jack Nicklaus"}, {label:"Rory McIlroy"}, {label:"Phil Mickelson"}, {label:"Arnold Palmer"}
  ]},
  { name: "Track Sprinters", provider: "wiki", items: [
    {label:"Usain Bolt"}, {label:"Carl Lewis"}, {label:"Florence Griffith-Joyner"}, {label:"Shelly-Ann Fraser-Pryce"}, {label:"Yohan Blake"}
  ]},

  // ---- Tech & Brands (Wikipedia) ----
  { name: "Tech Companies", provider: "wiki", items: [
    {label:"Google"}, {label:"Apple Inc."}, {label:"Microsoft"}, {label:"Amazon (company)"}, {label:"Meta Platforms"}
  ]},
  { name: "Smartphone Brands", provider: "wiki", items: [
    {label:"Samsung"}, {label:"Apple Inc."}, {label:"Google Pixel"}, {label:"OnePlus"}, {label:"Xiaomi"}
  ]},
  { name: "Camera Brands", provider: "wiki", items: [
    {label:"Canon Inc."}, {label:"Nikon Corporation"}, {label:"Sony"}, {label:"Fujifilm"}, {label:"Leica Camera"}
  ]},
  { name: "Car Brands", provider: "wiki", items: [
    {label:"Toyota"}, {label:"Ford Motor Company"}, {label:"BMW"}, {label:"Mercedes-Benz"}, {label:"Honda"}
  ]},
  { name: "Electric Cars", provider: "wiki", items: [
    {label:"Tesla Model 3"}, {label:"Nissan Leaf"}, {label:"Chevrolet Bolt"}, {label:"Hyundai Ioniq 5"}, {label:"Volkswagen ID.4"}
  ]},
  { name: "Game Consoles", provider: "wiki", items: [
    {label:"Nintendo Switch"}, {label:"PlayStation 5"}, {label:"Xbox Series X and Series S"}, {label:"Steam Deck"}, {label:"Nintendo 3DS"}
  ]},
  { name: "Programming Languages", provider: "wiki", items: [
    {label:"JavaScript"}, {label:"Python (programming language)"}, {label:"Java (programming language)"},
    {label:"C Sharp (programming language)"}, {label:"Go (programming language)"}
  ]},
  { name: "JS Frameworks", provider: "wiki", items: [
    {label:"React (software)"}, {label:"Vue.js"}, {label:"Angular (web framework)"}, {label:"Svelte"}, {label:"Next.js"}
  ]},
  { name: "Databases", provider: "wiki", items: [
    {label:"PostgreSQL"}, {label:"MySQL"}, {label:"SQLite"}, {label:"MongoDB"}, {label:"Redis"}
  ]},
  { name: "Cloud Providers", provider: "wiki", items: [
    {label:"Amazon Web Services"}, {label:"Microsoft Azure"}, {label:"Google Cloud Platform"}, {label:"IBM Cloud"}, {label:"Oracle Cloud"}
  ]},

  // ---- Games, Books, Comics (Wikipedia) ----
  { name: "Board Games", provider: "wiki", items: [
    {label:"Chess"}, {label:"Monopoly (game)"}, {label:"Catan"}, {label:"Scrabble"}, {label:"Ticket to Ride (board game)"}
  ]},
  { name: "Card Games", provider: "wiki", items: [
    {label:"Poker"}, {label:"Blackjack"}, {label:"Bridge (card game)"}, {label:"Uno (card game)"}, {label:"Hearts (card game)"}
  ]},
  { name: "Party Games", provider: "wiki", items: [
    {label:"Charades"}, {label:"Pictionary"}, {label:"Taboo (game)"}, {label:"Codenames (board game)"}, {label:"Telestrations"}
  ]},
  { name: "Video Game Franchises", provider: "wiki", items: [
    {label:"The Legend of Zelda"}, {label:"Super Mario"}, {label:"Pokémon"}, {label:"Grand Theft Auto"}, {label:"Call of Duty"}
  ]},
  { name: "Open-World Games", provider: "wiki", items: [
    {label:"The Witcher 3: Wild Hunt"}, {label:"Red Dead Redemption 2"}, {label:"The Elder Scrolls V: Skyrim"},
    {label:"Assassin's Creed Odyssey"}, {label:"Grand Theft Auto V"}
  ]},
  { name: "Nintendo Characters", provider: "wiki", items: [
    {label:"Mario"}, {label:"Luigi"}, {label:"Princess Peach"}, {label:"Bowser"}, {label:"Yoshi"}
  ]},
  { name: "Pokémon Starters", provider: "wiki", items: [
    {label:"Bulbasaur"}, {label:"Charmander"}, {label:"Squirtle"}, {label:"Chikorita"}, {label:"Cyndaquil"}
  ]},
  { name: "Zelda Games", provider: "wiki", items: [
    {label:"The Legend of Zelda: Ocarina of Time"}, {label:"The Legend of Zelda: Majora's Mask"},
    {label:"The Legend of Zelda: The Wind Waker"}, {label:"The Legend of Zelda: Breath of the Wild"},
    {label:"The Legend of Zelda: Tears of the Kingdom"}
  ]},
  { name: "Comic Book Villains", provider: "wiki", items: [
    {label:"Joker (character)"}, {label:"Thanos"}, {label:"Loki"}, {label:"Magneto"}, {label:"Green Goblin"}
  ]},
  { name: "Superheroes", provider: "wiki", items: [
    {label:"Spider-Man"}, {label:"Batman"}, {label:"Superman"}, {label:"Wonder Woman"}, {label:"Iron Man"}
  ]},

  // ---- Lifestyle & Misc (Wikipedia) ----
  { name: "Fashion Brands", provider: "wiki", items: [
    {label:"Gucci"}, {label:"Prada"}, {label:"Louis Vuitton"}, {label:"Balenciaga"}, {label:"Off-White"}
  ]},
  { name: "Luxury Watches", provider: "wiki", items: [
    {label:"Rolex"}, {label:"Omega SA"}, {label:"Patek Philippe"}, {label:"Audemars Piguet"}, {label:"TAG Heuer"}
  ]},
  { name: "Coffee Drinks", provider: "wiki", items: [
    {label:"Espresso"}, {label:"Latte"}, {label:"Cappuccino"}, {label:"Americano"}, {label:"Mocha"}
  ]},
  { name: "Tea Varieties", provider: "wiki", items: [
    {label:"Green tea"}, {label:"Black tea"}, {label:"Oolong"}, {label:"Chamomile"}, {label:"Earl Grey"}
  ]},
  { name: "Ice Cream Flavors", provider: "wiki", items: [
    {label:"Vanilla ice cream"}, {label:"Chocolate ice cream"}, {label:"Strawberry ice cream"}, {label:"Mint chocolate chip"}, {label:"Cookies and cream"}
  ]},
  { name: "Hobbies", provider: "wiki", items: [
    {label:"Reading"}, {label:"Gardening"}, {label:"Painting"}, {label:"Cycling"}, {label:"Cooking"}
  ]},
  { name: "School Subjects", provider: "wiki", items: [
    {label:"Mathematics"}, {label:"Science"}, {label:"History"}, {label:"Literature"}, {label:"Art"}
  ]},
  { name: "Space Missions", provider: "wiki", items: [
    {label:"Apollo 11"}, {label:"Voyager 1"}, {label:"Hubble Space Telescope"}, {label:"Curiosity (rover)"}, {label:"James Webb Space Telescope"}
  ]},
  { name: "Constellations", provider: "wiki", items: [
    {label:"Orion (constellation)"}, {label:"Ursa Major"}, {label:"Cassiopeia (constellation)"}, {label:"Scorpius"}, {label:"Leo (constellation)"}
  ]},
  { name: "Planets", provider: "wiki", items: [
    {label:"Mercury (planet)"}, {label:"Venus"}, {label:"Earth"}, {label:"Mars"}, {label:"Jupiter"}
  ]}
];