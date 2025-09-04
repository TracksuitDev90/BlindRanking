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

const MORE_TOPICS = [
  // ————— Food & Drink —————
  { name:"Best Pizza Toppings", provider:"wiki", items:[{label:"Pepperoni"},{label:"Mushrooms"},{label:"Sausage"},{label:"Extra cheese"},{label:"Onions"}] },
  { name:"Best Types of Pizza", provider:"wiki", items:[{label:"Margherita"},{label:"Pepperoni"},{label:"BBQ Chicken"},{label:"Meat Lovers"},{label:"Veggie"}] },
  { name:"Best Burger Styles", provider:"wiki", items:[{label:"Classic Cheeseburger"},{label:"Bacon Cheeseburger"},{label:"Mushroom Swiss"},{label:"BBQ Burger"},{label:"Jalapeño Burger"}] },
  { name:"Best Sandwiches", provider:"wiki", items:[{label:"BLT"},{label:"Club Sandwich"},{label:"Reuben"},{label:"Grilled Cheese"},{label:"Philly Cheesesteak"}] },
  { name:"Best Breakfast Cereals", provider:"wiki", items:[{label:"Cheerios"},{label:"Frosted Flakes"},{label:"Cinnamon Toast Crunch"},{label:"Lucky Charms"},{label:"Froot Loops"}] },
  { name:"Best Ice Cream Flavors", provider:"wiki", items:[{label:"Vanilla"},{label:"Chocolate"},{label:"Strawberry"},{label:"Cookies and Cream"},{label:"Mint Chocolate Chip"}] },
  { name:"Best Sodas", provider:"wiki", items:[{label:"Coca-Cola"},{label:"Pepsi"},{label:"Sprite"},{label:"Dr Pepper"},{label:"Mountain Dew"}] },
  { name:"Best Coffee Drinks", provider:"wiki", items:[{label:"Espresso"},{label:"Cappuccino"},{label:"Latte"},{label:"Cold Brew"},{label:"Americano"}] },
  { name:"Best Teas", provider:"wiki", items:[{label:"Green Tea"},{label:"Black Tea"},{label:"Earl Grey"},{label:"Oolong"},{label:"Chai"}] },
  { name:"Best Chocolate Candy", provider:"wiki", items:[{label:"Snickers"},{label:"Kit Kat"},{label:"Reese's Peanut Butter Cups"},{label:"Twix"},{label:"M&M's"}] },
  { name:"Best Potato Chip Flavors", provider:"wiki", items:[{label:"Classic Salted"},{label:"Sour Cream & Onion"},{label:"Barbecue"},{label:"Salt & Vinegar"},{label:"Cheddar & Sour Cream"}] },
  { name:"Best Hot Sauces", provider:"wiki", items:[{label:"Sriracha"},{label:"Tabasco"},{label:"Frank's RedHot"},{label:"Cholula"},{label:"Tapatío"}] },
  { name:"Best Fruits", provider:"wiki", items:[{label:"Mango"},{label:"Apple"},{label:"Banana"},{label:"Strawberries"},{label:"Pineapple"}] },
  { name:"Best Vegetables", provider:"wiki", items:[{label:"Broccoli"},{label:"Carrots"},{label:"Spinach"},{label:"Corn"},{label:"Tomatoes"}] },
  { name:"Best Sushi Rolls", provider:"wiki", items:[{label:"California Roll"},{label:"Spicy Tuna Roll"},{label:"Dragon Roll"},{label:"Rainbow Roll"},{label:"Philadelphia Roll"}] },
  { name:"Best Pasta Shapes", provider:"wiki", items:[{label:"Spaghetti"},{label:"Penne"},{label:"Fettuccine"},{label:"Rigatoni"},{label:"Farfalle"}] },
  { name:"Best Cheeses", provider:"wiki", items:[{label:"Cheddar"},{label:"Mozzarella"},{label:"Gouda"},{label:"Parmesan"},{label:"Brie"}] },
  { name:"Best Breads", provider:"wiki", items:[{label:"Sourdough"},{label:"Baguette"},{label:"Ciabatta"},{label:"Rye"},{label:"Brioche"}] },
  { name:"Best Soups", provider:"wiki", items:[{label:"Chicken Noodle"},{label:"Tomato"},{label:"Clam Chowder"},{label:"French Onion"},{label:"Minestrone"}] },
  { name:"Best Salads", provider:"wiki", items:[{label:"Caesar"},{label:"Greek Salad"},{label:"Cobb"},{label:"Caprese"},{label:"Nicoise"}] },
  { name:"Best BBQ Meats", provider:"wiki", items:[{label:"Brisket"},{label:"Pulled Pork"},{label:"Ribs"},{label:"Chicken Thighs"},{label:"Sausage"}] },
  { name:"Best Fast-Food Chains (US)", provider:"wiki", items:[{label:"McDonald's"},{label:"Burger King"},{label:"Wendy's"},{label:"Taco Bell"},{label:"Chick-fil-A"}] },
  { name:"Best Breakfast Items", provider:"wiki", items:[{label:"Pancakes"},{label:"Waffles"},{label:"French Toast"},{label:"Omelette"},{label:"Bagel with Cream Cheese"}] },
  { name:"Best Pizza Regional Styles", provider:"wiki", items:[{label:"New York Style"},{label:"Chicago Deep-Dish"},{label:"Neapolitan"},{label:"Detroit Style"},{label:"Sicilian"}] },
  { name:"Best Milkshakes", provider:"wiki", items:[{label:"Chocolate"},{label:"Vanilla"},{label:"Strawberry"},{label:"Oreo"},{label:"Salted Caramel"}] },
  { name:"Best Cookies", provider:"wiki", items:[{label:"Chocolate Chip"},{label:"Oatmeal Raisin"},{label:"Peanut Butter"},{label:"Snickerdoodle"},{label:"Shortbread"}] },
  { name:"Best Taco Fillings", provider:"wiki", items:[{label:"Carnitas"},{label:"Al Pastor"},{label:"Carne Asada"},{label:"Chicken Tinga"},{label:"Fish Taco"}] },
  { name:"Best Indian Dishes", provider:"wiki", items:[{label:"Butter Chicken"},{label:"Biryani"},{label:"Palak Paneer"},{label:"Masala Dosa"},{label:"Rogan Josh"}] },
  { name:"Best Chinese Dishes", provider:"wiki", items:[{label:"Kung Pao Chicken"},{label:"Sweet and Sour Pork"},{label:"Mapo Tofu"},{label:"Peking Duck"},{label:"Chow Mein"}] },
  { name:"Best Italian Dishes", provider:"wiki", items:[{label:"Lasagna"},{label:"Risotto"},{label:"Carbonara"},{label:"Osso Buco"},{label:"Gnocchi"}] },

  // ————— TV / Movies —————
  { name:"Top 90s Boy Bands", provider:"wiki", mediaType:"person", items:[{label:"Backstreet Boys"},{label:"NSYNC"},{label:"Boyz II Men"},{label:"98 Degrees"},{label:"New Kids on the Block"}] },
  { name:"Top Early 00s Boy Bands", provider:"wiki", mediaType:"person", items:[{label:"Westlife"},{label:"Blue"},{label:"O-Town"},{label:"Busted"},{label:"Jonas Brothers"}] },
  { name:"Best Cartoons of the 90s", provider:"tmdb", mediaType:"tv", items:[{label:"Rugrats"},{label:"Dexter's Laboratory"},{label:"The Powerpuff Girls"},{label:"Batman: The Animated Series"},{label:"Doug"}] },
  { name:"Best Cartoons of the 00s", provider:"tmdb", mediaType:"tv", items:[{label:"Avatar: The Last Airbender"},{label:"Teen Titans"},{label:"Kim Possible"},{label:"Ben 10"},{label:"SpongeBob SquarePants"}] },
  { name:"Best 90s Sitcoms", provider:"tmdb", mediaType:"tv", items:[{label:"Friends"},{label:"Seinfeld"},{label:"Frasier"},{label:"The Fresh Prince of Bel-Air"},{label:"Home Improvement"}] },
  { name:"Best 2000s Sitcoms", provider:"tmdb", mediaType:"tv", items:[{label:"The Office (US)"},{label:"How I Met Your Mother"},{label:"Arrested Development"},{label:"Scrubs"},{label:"30 Rock"}] },
  { name:"Best Fantasy TV Shows", provider:"tmdb", mediaType:"tv", items:[{label:"Game of Thrones"},{label:"The Witcher"},{label:"His Dark Materials"},{label:"Shadow and Bone"},{label:"Merlin"}] },
  { name:"Best Sci-Fi TV Shows", provider:"tmdb", mediaType:"tv", items:[{label:"Star Trek: The Next Generation"},{label:"The X-Files"},{label:"Battlestar Galactica"},{label:"Black Mirror"},{label:"The Expanse"}] },
  { name:"Best HBO Dramas", provider:"tmdb", mediaType:"tv", items:[{label:"The Sopranos"},{label:"The Wire"},{label:"Succession"},{label:"True Detective"},{label:"Boardwalk Empire"}] },
  { name:"Best Netflix Originals (TV)", provider:"tmdb", mediaType:"tv", items:[{label:"Stranger Things"},{label:"The Crown"},{label:"Narcos"},{label:"Ozark"},{label:"Mindhunter"}] },
  { name:"Best 90s Comedy Films", provider:"tmdb", mediaType:"movie", items:[{label:"Dumb and Dumber"},{label:"Home Alone"},{label:"Groundhog Day"},{label:"The Big Lebowski"},{label:"Mrs. Doubtfire"}] },
  { name:"Best 2000s Action Films", provider:"tmdb", mediaType:"movie", items:[{label:"The Dark Knight"},{label:"Gladiator"},{label:"The Bourne Identity"},{label:"Kill Bill: Vol. 1"},{label:"Casino Royale"}] },
  { name:"Best Pixar Movies", provider:"tmdb", mediaType:"movie", items:[{label:"Toy Story"},{label:"Finding Nemo"},{label:"The Incredibles"},{label:"Up"},{label:"Coco"}] },
  { name:"Best Disney Animated Classics", provider:"tmdb", mediaType:"movie", items:[{label:"The Lion King"},{label:"Aladdin"},{label:"Beauty and the Beast"},{label:"Mulan"},{label:"The Little Mermaid"}] },
  { name:"Best Superhero Movies", provider:"tmdb", mediaType:"movie", items:[{label:"Iron Man"},{label:"The Avengers"},{label:"Spider-Man: No Way Home"},{label:"The Dark Knight"},{label:"Black Panther"}] },
  { name:"Best Horror Films", provider:"tmdb", mediaType:"movie", items:[{label:"The Exorcist"},{label:"Halloween"},{label:"The Shining"},{label:"Get Out"},{label:"A Nightmare on Elm Street"}] },
  { name:"Best Romantic Comedies", provider:"tmdb", mediaType:"movie", items:[{label:"When Harry Met Sally..."},{label:"Notting Hill"},{label:"10 Things I Hate About You"},{label:"Crazy Rich Asians"},{label:"The Proposal"}] },
  { name:"Best Film Trilogies", provider:"tmdb", mediaType:"movie", items:[{label:"The Lord of the Rings"},{label:"The Godfather Trilogy"},{label:"The Dark Knight Trilogy"},{label:"Back to the Future"},{label:"The Matrix"}] },
  { name:"Best Film Directors", provider:"wiki", mediaType:"person", items:[{label:"Steven Spielberg"},{label:"Christopher Nolan"},{label:"Quentin Tarantino"},{label:"Martin Scorsese"},{label:"James Cameron"}] },
  { name:"Best Actresses (Modern)", provider:"wiki", mediaType:"person", items:[{label:"Meryl Streep"},{label:"Saoirse Ronan"},{label:"Viola Davis"},{label:"Scarlett Johansson"},{label:"Cate Blanchett"}] },
  { name:"Best Actors (Modern)", provider:"wiki", mediaType:"person", items:[{label:"Denzel Washington"},{label:"Leonardo DiCaprio"},{label:"Tom Hanks"},{label:"Keanu Reeves"},{label:"Christian Bale"}] },
  { name:"Best MCU Heroes", provider:"wiki", mediaType:"person", items:[{label:"Iron Man"},{label:"Captain America"},{label:"Thor"},{label:"Black Widow"},{label:"Doctor Strange"}] },
  { name:"Best Star Wars Characters", provider:"wiki", mediaType:"person", items:[{label:"Luke Skywalker"},{label:"Darth Vader"},{label:"Han Solo"},{label:"Princess Leia"},{label:"Yoda"}] },
  { name:"Best Anime of the 90s", provider:"tmdb", mediaType:"tv", items:[{label:"Neon Genesis Evangelion"},{label:"Cowboy Bebop"},{label:"Sailor Moon"},{label:"Dragon Ball Z"},{label:"Yu Yu Hakusho"}] },
  { name:"Best Anime of the 2000s", provider:"tmdb", mediaType:"tv", items:[{label:"Fullmetal Alchemist: Brotherhood"},{label:"Naruto"},{label:"Death Note"},{label:"One Piece"},{label:"Bleach"}] },

  // ————— Music —————
  { name:"Best Pop Divas", provider:"wiki", mediaType:"person", items:[{label:"Beyoncé"},{label:"Taylor Swift"},{label:"Ariana Grande"},{label:"Adele"},{label:"Lady Gaga"}] },
  { name:"Best Rock Bands", provider:"wiki", mediaType:"person", items:[{label:"The Beatles"},{label:"The Rolling Stones"},{label:"Led Zeppelin"},{label:"Queen"},{label:"Pink Floyd"}] },
  { name:"Best 90s Hip-Hop Artists", provider:"wiki", mediaType:"person", items:[{label:"Tupac Shakur"},{label:"The Notorious B.I.G."},{label:"Nas"},{label:"Snoop Dogg"},{label:"Dr. Dre"}] },
  { name:"Best EDM DJs", provider:"wiki", mediaType:"person", items:[{label:"Calvin Harris"},{label:"Avicii"},{label:"David Guetta"},{label:"Deadmau5"},{label:"Tiësto"}] },
  { name:"Best Country Artists", provider:"wiki", mediaType:"person", items:[{label:"Johnny Cash"},{label:"Dolly Parton"},{label:"Garth Brooks"},{label:"Shania Twain"},{label:"Chris Stapleton"}] },
  { name:"Best 2000s Pop-Punk Bands", provider:"wiki", mediaType:"person", items:[{label:"Blink-182"},{label:"Green Day"},{label:"Sum 41"},{label:"Good Charlotte"},{label:"Fall Out Boy"}] },
  { name:"Best K-pop Groups", provider:"wiki", mediaType:"person", items:[{label:"BTS"},{label:"BLACKPINK"},{label:"EXO"},{label:"TWICE"},{label:"Red Velvet"}] },
  { name:"Best 2000s R&B Artists", provider:"wiki", mediaType:"person", items:[{label:"Usher"},{label:"Alicia Keys"},{label:"Beyoncé"},{label:"Mary J. Blige"},{label:"Ne-Yo"}] },
  { name:"Best Rap Groups", provider:"wiki", mediaType:"person", items:[{label:"Wu-Tang Clan"},{label:"N.W.A"},{label:"OutKast"},{label:"A Tribe Called Quest"},{label:"Run-D.M.C."}] },
  { name:"Best Female Rappers", provider:"wiki", mediaType:"person", items:[{label:"Nicki Minaj"},{label:"Missy Elliott"},{label:"Cardi B"},{label:"Lauryn Hill"},{label:"Megan Thee Stallion"}] },

  // ————— Games & Hobbies —————
  { name:"Best Video Game Franchises", provider:"wiki", items:[{label:"The Legend of Zelda"},{label:"Super Mario"},{label:"Halo"},{label:"Final Fantasy"},{label:"Grand Theft Auto"}] },
  { name:"Best Open-World Games", provider:"wiki", items:[{label:"The Witcher 3: Wild Hunt"},{label:"Grand Theft Auto V"},{label:"Red Dead Redemption 2"},{label:"The Legend of Zelda: Breath of the Wild"},{label:"Assassin's Creed Odyssey"}] },
  { name:"Best PlayStation Exclusives", provider:"wiki", items:[{label:"The Last of Us"},{label:"God of War"},{label:"Uncharted 4"},{label:"Ghost of Tsushima"},{label:"Bloodborne"}] },
  { name:"Best Nintendo Switch Games", provider:"wiki", items:[{label:"Mario Kart 8 Deluxe"},{label:"Animal Crossing: New Horizons"},{label:"Super Smash Bros. Ultimate"},{label:"The Legend of Zelda: Tears of the Kingdom"},{label:"Splatoon 3"}] },
  { name:"Best Indie Games", provider:"wiki", items:[{label:"Hades"},{label:"Celeste"},{label:"Hollow Knight"},{label:"Stardew Valley"},{label:"Undertale"}] },
  { name:"Best Board Games", provider:"wiki", items:[{label:"Catan"},{label:"Ticket to Ride"},{label:"Carcassonne"},{label:"Pandemic"},{label:"Chess"}] },
  { name:"Best Card Games", provider:"wiki", items:[{label:"Poker"},{label:"Blackjack"},{label:"Uno"},{label:"Magic: The Gathering"},{label:"Hearthstone"}] },

  // ————— Sports —————
  { name:"Best NBA Legends", provider:"wiki", mediaType:"person", items:[{label:"Michael Jordan"},{label:"LeBron James"},{label:"Kobe Bryant"},{label:"Magic Johnson"},{label:"Larry Bird"}] },
  { name:"Best NFL Quarterbacks", provider:"wiki", mediaType:"person", items:[{label:"Tom Brady"},{label:"Peyton Manning"},{label:"Joe Montana"},{label:"Patrick Mahomes"},{label:"Aaron Rodgers"}] },
  { name:"Best Soccer Players", provider:"wiki", mediaType:"person", items:[{label:"Lionel Messi"},{label:"Cristiano Ronaldo"},{label:"Pelé"},{label:"Diego Maradona"},{label:"Zinedine Zidane"}] },
  { name:"Best Tennis Players", provider:"wiki", mediaType:"person", items:[{label:"Roger Federer"},{label:"Rafael Nadal"},{label:"Novak Djokovic"},{label:"Serena Williams"},{label:"Steffi Graf"}] },
  { name:"Best F1 Drivers", provider:"wiki", mediaType:"person", items:[{label:"Michael Schumacher"},{label:"Lewis Hamilton"},{label:"Ayrton Senna"},{label:"Alain Prost"},{label:"Max Verstappen"}] },
  { name:"Best Golfers", provider:"wiki", mediaType:"person", items:[{label:"Tiger Woods"},{label:"Jack Nicklaus"},{label:"Arnold Palmer"},{label:"Rory McIlroy"},{label:"Phil Mickelson"}] },
  { name:"Best MLB Legends", provider:"wiki", mediaType:"person", items:[{label:"Babe Ruth"},{label:"Hank Aaron"},{label:"Willie Mays"},{label:"Derek Jeter"},{label:"Shohei Ohtani"}] },
  { name:"Best NHL Legends", provider:"wiki", mediaType:"person", items:[{label:"Wayne Gretzky"},{label:"Mario Lemieux"},{label:"Sidney Crosby"},{label:"Alex Ovechkin"},{label:"Patrick Roy"}] },

  // ————— Places / Travel —————
  { name:"Best Cities to Visit", provider:"wiki", items:[{label:"Paris"},{label:"Tokyo"},{label:"New York City"},{label:"Rome"},{label:"London"}] },
  { name:"Best US National Parks", provider:"wiki", items:[{label:"Yellowstone"},{label:"Yosemite"},{label:"Grand Canyon"},{label:"Zion National Park"},{label:"Glacier National Park"}] },
  { name:"Best World Landmarks", provider:"wiki", items:[{label:"Eiffel Tower"},{label:"Great Wall of China"},{label:"Taj Mahal"},{label:"Machu Picchu"},{label:"Statue of Liberty"}] },
  { name:"Best Beaches", provider:"wiki", items:[{label:"Bora Bora"},{label:"Maldives"},{label:"Maui"},{label:"Santorini"},{label:"Phuket"}] },
  { name:"Best Ski Destinations", provider:"wiki", items:[{label:"Aspen"},{label:"Whistler"},{label:"Zermatt"},{label:"Chamonix"},{label:"St. Moritz"}] },
  { name:"Best Theme Parks", provider:"wiki", items:[{label:"Disneyland"},{label:"Walt Disney World"},{label:"Universal Studios Japan"},{label:"Universal Orlando"},{label:"Europa-Park"}] },

  // ————— Books / Comics —————
  { name:"Best Fantasy Book Series", provider:"wiki", items:[{label:"Harry Potter"},{label:"The Lord of the Rings"},{label:"A Song of Ice and Fire"},{label:"The Wheel of Time"},{label:"The Stormlight Archive"}] },
  { name:"Best Sci-Fi Authors", provider:"wiki", mediaType:"person", items:[{label:"Isaac Asimov"},{label:"Arthur C. Clarke"},{label:"Philip K. Dick"},{label:"Ursula K. Le Guin"},{label:"Frank Herbert"}] },
  { name:"Best Comic Book Heroes", provider:"wiki", mediaType:"person", items:[{label:"Batman"},{label:"Spider-Man"},{label:"Superman"},{label:"Wonder Woman"},{label:"Wolverine"}] },
  { name:"Best Comic Book Villains", provider:"wiki", mediaType:"person", items:[{label:"Joker"},{label:"Magneto"},{label:"Loki"},{label:"Thanos"},{label:"Green Goblin"}] },
  { name:"Best 90s Sitcom Characters", provider:"wiki", mediaType:"person", items:[{label:"Chandler Bing"},{label:"George Costanza"},{label:"Frasier Crane"},{label:"Will Smith (The Fresh Prince)"},{label:"Elaine Benes"}] },
  { name:"Best 2000s TV Antiheroes", provider:"wiki", mediaType:"person", items:[{label:"Tony Soprano"},{label:"Walter White"},{label:"Don Draper"},{label:"Dexter Morgan"},{label:"Omar Little"}] },

  // ————— Tech / Gadgets —————
  { name:"Best Streaming Devices", provider:"wiki", items:[{label:"Roku"},{label:"Apple TV"},{label:"Amazon Fire TV Stick"},{label:"Google Chromecast"},{label:"Nvidia Shield TV"}] },
  { name:"Best Smartphones of the 2010s", provider:"wiki", items:[{label:"iPhone X"},{label:"Samsung Galaxy S10"},{label:"Google Pixel 3"},{label:"OnePlus 6T"},{label:"Huawei P30 Pro"}] },
  { name:"Best Laptops for Creators", provider:"wiki", items:[{label:"MacBook Pro"},{label:"Dell XPS 15"},{label:"Razer Blade 15"},{label:"Microsoft Surface Laptop"},{label:"HP Spectre x360"}] },
  { name:"Best Headphones (Consumer)", provider:"wiki", items:[{label:"Sony WH-1000XM5"},{label:"Bose QuietComfort 45"},{label:"AirPods Pro"},{label:"Sennheiser Momentum 4"},{label:"Beats Studio Pro"}] },
  { name:"Best Cameras", provider:"wiki", items:[{label:"Canon EOS R5"},{label:"Sony A7 IV"},{label:"Nikon Z7 II"},{label:"Fujifilm X-T5"},{label:"Panasonic Lumix S5"}] },
  { name:"Best Car Brands", provider:"wiki", items:[{label:"Toyota"},{label:"BMW"},{label:"Mercedes-Benz"},{label:"Tesla"},{label:"Honda"}] },
  { name:"Best Electric Cars", provider:"wiki", items:[{label:"Tesla Model 3"},{label:"Ford Mustang Mach-E"},{label:"Hyundai Ioniq 5"},{label:"Porsche Taycan"},{label:"Nissan Leaf"}] },
  { name:"Best Classic Cars", provider:"wiki", items:[{label:"Ford Mustang (1965)"},{label:"Chevrolet Camaro (1969)"},{label:"Porsche 911 (1973)"},{label:"Jaguar E-Type"},{label:"Volkswagen Beetle"}] },
  { name:"Best Streaming Services", provider:"wiki", items:[{label:"Netflix"},{label:"Disney+"},{label:"Hulu"},{label:"Amazon Prime Video"},{label:"HBO Max"}] },
  { name:"Best Productivity Apps", provider:"wiki", items:[{label:"Notion"},{label:"Trello"},{label:"Asana"},{label:"Todoist"},{label:"Evernote"}] },
  { name:"Best Web Browsers", provider:"wiki", items:[{label:"Google Chrome"},{label:"Mozilla Firefox"},{label:"Microsoft Edge"},{label:"Safari"},{label:"Brave"}] },
  { name:"Best Programming Languages", provider:"wiki", items:[{label:"Python"},{label:"JavaScript"},{label:"Java"},{label:"C#"},{label:"Go"}] },
  { name:"Best Cloud Providers", provider:"wiki", items:[{label:"Amazon Web Services"},{label:"Microsoft Azure"},{label:"Google Cloud"},{label:"DigitalOcean"},{label:"Heroku"}] },
  { name:"Best Web Frameworks", provider:"wiki", items:[{label:"React"},{label:"Vue.js"},{label:"Angular"},{label:"Svelte"},{label:"Next.js"}] },
  { name:"Best AI Tools (Consumer)", provider:"wiki", items:[{label:"ChatGPT"},{label:"Midjourney"},{label:"Stable Diffusion"},{label:"Claude"},{label:"Perplexity"}] },
  { name:"Best Operating Systems", provider:"wiki", items:[{label:"Windows 11"},{label:"macOS"},{label:"Ubuntu"},{label:"Android"},{label:"iOS"}] },
  { name:"Best Smartwatches", provider:"wiki", items:[{label:"Apple Watch"},{label:"Samsung Galaxy Watch"},{label:"Garmin Forerunner"},{label:"Fitbit Versa"},{label:"Google Pixel Watch"}] },

  // ————— Lifestyle / Culture —————
  { name:"Best Fitness Activities", provider:"wiki", items:[{label:"Running"},{label:"Cycling"},{label:"Swimming"},{label:"Yoga"},{label:"Weightlifting"}] },
  { name:"Best Hikes in the World", provider:"wiki", items:[{label:"Inca Trail"},{label:"Appalachian Trail"},{label:"Tour du Mont Blanc"},{label:"Mount Kilimanjaro"},{label:"Tongariro Alpine Crossing"}] },
  { name:"Best Museums", provider:"wiki", items:[{label:"Louvre"},{label:"British Museum"},{label:"The Metropolitan Museum of Art"},{label:"Museo del Prado"},{label:"Uffizi Gallery"}] },
  { name:"Best Universities", provider:"wiki", items:[{label:"Harvard University"},{label:"Stanford University"},{label:"MIT"},{label:"University of Oxford"},{label:"University of Cambridge"}] },
  { name:"Best 20th-Century Inventions", provider:"wiki", items:[{label:"The Internet"},{label:"Penicillin"},{label:"Airplane"},{label:"Television"},{label:"Nuclear Power"}] },
  { name:"Best 21st-Century Inventions", provider:"wiki", items:[{label:"Smartphone"},{label:"CRISPR"},{label:"3D Printing"},{label:"Social Media"},{label:"Electric Cars"}] },
  { name:"Best Startups of the 2010s", provider:"wiki", items:[{label:"Uber"},{label:"Airbnb"},{label:"Slack"},{label:"Stripe"},{label:"Snapchat"}] },
  { name:"Best Social Networks", provider:"wiki", items:[{label:"Facebook"},{label:"Instagram"},{label:"TikTok"},{label:"Twitter (X)"},{label:"Reddit"}] },
  { name:"Best Podcasts", provider:"wiki", items:[{label:"The Joe Rogan Experience"},{label:"This American Life"},{label:"Radiolab"},{label:"Serial"},{label:"The Daily"}] },
  { name:"Best Late-Night Hosts", provider:"wiki", mediaType:"person", items:[{label:"Jimmy Fallon"},{label:"Jimmy Kimmel"},{label:"Stephen Colbert"},{label:"John Oliver"},{label:"Seth Meyers"}] },
  { name:"Best Stand-Up Comedians", provider:"wiki", mediaType:"person", items:[{label:"Dave Chappelle"},{label:"Jerry Seinfeld"},{label:"Kevin Hart"},{label:"Ali Wong"},{label:"John Mulaney"}] },
  { name:"Best YouTubers", provider:"wiki", mediaType:"person", items:[{label:"MrBeast"},{label:"PewDiePie"},{label:"Markiplier"},{label:"Dude Perfect"},{label:"Emma Chamberlain"}] },
  { name:"Best Twitch Streamers", provider:"wiki", mediaType:"person", items:[{label:"Ninja"},{label:"Pokimane"},{label:"Shroud"},{label:"xQc"},{label:"Valkyrae"}] },
  { name:"Best Soccer Clubs", provider:"wiki", items:[{label:"Real Madrid"},{label:"FC Barcelona"},{label:"Manchester United"},{label:"Bayern Munich"},{label:"Liverpool"}] },
  { name:"Best NFL Teams (All-Time)", provider:"wiki", items:[{label:"1985 Chicago Bears"},{label:"2007 New England Patriots"},{label:"1972 Miami Dolphins"},{label:"1990s Dallas Cowboys"},{label:"2013 Seattle Seahawks"}] },
  { name:"Best Olympic Sprinters", provider:"wiki", mediaType:"person", items:[{label:"Usain Bolt"},{label:"Carl Lewis"},{label:"Michael Johnson"},{label:"Yohan Blake"},{label:"Justin Gatlin"}] },
  { name:"Best Swimmers", provider:"wiki", mediaType:"person", items:[{label:"Michael Phelps"},{label:"Katie Ledecky"},{label:"Ian Thorpe"},{label:"Ryan Lochte"},{label:"Missy Franklin"}] },
  { name:"Best Chess Players", provider:"wiki", mediaType:"person", items:[{label:"Magnus Carlsen"},{label:"Garry Kasparov"},{label:"Bobby Fischer"},{label:"Anatoly Karpov"},{label:"Hikaru Nakamura"}] },
  { name:"Best Painters", provider:"wiki", mediaType:"person", items:[{label:"Leonardo da Vinci"},{label:"Vincent van Gogh"},{label:"Pablo Picasso"},{label:"Claude Monet"},{label:"Rembrandt"}] },
  { name:"Best Architects", provider:"wiki", mediaType:"person", items:[{label:"Frank Lloyd Wright"},{label:"Zaha Hadid"},{label:"Le Corbusier"},{label:"I. M. Pei"},{label:"Antoni Gaudí"}] },
  { name:"Best Photographers", provider:"wiki", mediaType:"person", items:[{label:"Ansel Adams"},{label:"Annie Leibovitz"},{label:"Henri Cartier-Bresson"},{label:"Steve McCurry"},{label:"Diane Arbus"}] },
  { name:"Best Fashion Designers", provider:"wiki", mediaType:"person", items:[{label:"Coco Chanel"},{label:"Giorgio Armani"},{label:"Gianni Versace"},{label:"Alexander McQueen"},{label:"Marc Jacobs"}] },
  { name:"Best Sneakers", provider:"wiki", items:[{label:"Air Jordan 1"},{label:"Nike Air Force 1"},{label:"Adidas Stan Smith"},{label:"Converse Chuck Taylor"},{label:"Yeezy Boost 350"}] },
  { name:"Best Watch Brands", provider:"wiki", items:[{label:"Rolex"},{label:"Omega"},{label:"Patek Philippe"},{label:"TAG Heuer"},{label:"Audemars Piguet"}] },
  { name:"Best Beer Styles", provider:"wiki", items:[{label:"IPA"},{label:"Stout"},{label:"Lager"},{label:"Pilsner"},{label:"Wheat Beer"}] },
  { name:"Best Cocktails", provider:"wiki", items:[{label:"Old Fashioned"},{label:"Margarita"},{label:"Mojito"},{label:"Negroni"},{label:"Martini"}] },
  { name:"Best Wine Varieties", provider:"wiki", items:[{label:"Cabernet Sauvignon"},{label:"Pinot Noir"},{label:"Chardonnay"},{label:"Sauvignon Blanc"},{label:"Merlot"}] },
  { name:"Best Winter Destinations", provider:"wiki", items:[{label:"Lapland"},{label:"Quebec City"},{label:"Vienna"},{label:"Reykjavik"},{label:"Zurich"}] },
  { name:"Best City Skylines", provider:"wiki", items:[{label:"New York City"},{label:"Hong Kong"},{label:"Dubai"},{label:"Shanghai"},{label:"Singapore"}] },
  { name:"Best Stadiums", provider:"wiki", items:[{label:"Camp Nou"},{label:"Wembley Stadium"},{label:"Madison Square Garden"},{label:"Yankee Stadium"},{label:"Maracanã"}] },
  { name:"Best Space Missions", provider:"wiki", items:[{label:"Apollo 11"},{label:"Voyager 1"},{label:"Hubble Space Telescope"},{label:"Mars Curiosity Rover"},{label:"James Webb Space Telescope"}] },
  { name:"Best Code Editors", provider:"wiki", items:[{label:"Visual Studio Code"},{label:"Sublime Text"},{label:"Vim"},{label:"IntelliJ IDEA"},{label:"Atom"}] },
  { name:"Best Productivity Methods", provider:"wiki", items:[{label:"Pomodoro Technique"},{label:"Time Blocking"},{label:"Getting Things Done"},{label:"Eat the Frog"},{label:"2-Minute Rule"}] },
  { name:"Best Dog Breeds", provider:"wiki", items:[{label:"Labrador Retriever"},{label:"German Shepherd"},{label:"Golden Retriever"},{label:"Poodle"},{label:"French Bulldog"}] },
  { name:"Best Cat Breeds", provider:"wiki", items:[{label:"Persian cat"},{label:"Siamese cat"},{label:"Maine Coon"},{label:"British Shorthair"},{label:"Sphynx"}] },
  { name:"Best Wildlife Animals", provider:"wiki", items:[{label:"Lion"},{label:"Elephant"},{label:"Tiger"},{label:"Giraffe"},{label:"Giant panda"}] },
  { name:"Best Mountains", provider:"wiki", items:[{label:"Mount Everest"},{label:"K2"},{label:"Denali"},{label:"Matterhorn"},{label:"Mount Kilimanjaro"}] },
  { name:"Best Rivers", provider:"wiki", items:[{label:"Nile"},{label:"Amazon River"},{label:"Yangtze"},{label:"Mississippi River"},{label:"Danube"}] },
  { name:"Best Islands", provider:"wiki", items:[{label:"Bali"},{label:"Santorini"},{label:"Iceland"},{label:"Maui"},{label:"Seychelles"}] },
  { name:"Best Languages to Learn", provider:"wiki", items:[{label:"Spanish"},{label:"Mandarin Chinese"},{label:"French"},{label:"German"},{label:"Japanese"}] }
];

// Append to existing topics list
window.BLIND_RANK_TOPICS = (window.BLIND_RANK_TOPICS || []).concat(MORE_TOPICS);