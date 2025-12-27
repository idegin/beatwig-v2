import FilmDetails from "@/app/film/components/film-details"

interface FilmDetailsPageProps {
  params: Promise<{
    type: string
    id: string
    slug: string
  }>
}

const movieData = {
  id: 155,
  title: "The Dark Knight",
  tagline: "Why So Serious?",
  overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  backdrop_path: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
  release_date: "2008-07-18",
  vote_average: 9.0,
  runtime: 152,
  certification: "PG-13",
  genres: ["Action", "Crime", "Drama", "Thriller"],
  status: "Released",
  original_language: "en",
  budget: 185000000,
  revenue: 1004558444,
  video_key: "EXeTwQWrcwY",
  production_companies: [
    { id: 429, name: "DC Comics", logo_path: "/2Tc1P3Ac8M479naPp1kYT3izLS5.png" },
    { id: 923, name: "Legendary Pictures", logo_path: "/8M99Dkt23MjQMTTWukq4m5XsEuo.png" },
    { id: 9996, name: "Syncopy", logo_path: "/3tvBqYsBhxWeHlu62SIJ1el93O7.png" },
    { id: 174, name: "Warner Bros. Pictures", logo_path: "/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png" },
  ],
  production_countries: [
    { iso_3166_1: "US", name: "United States of America" },
    { iso_3166_1: "GB", name: "United Kingdom" },
  ],
  spoken_languages: [
    { english_name: "English", iso_639_1: "en" },
    { english_name: "Mandarin", iso_639_1: "zh" },
  ],
  cast: [
    { id: 3894, name: "Christian Bale", character: "Bruce Wayne / Batman", profile_path: "/qCpZn2e3dimwbryLnqxZuI88PTi.jpg", order: 0 },
    { id: 1810, name: "Heath Ledger", character: "Joker", profile_path: "/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg", order: 1 },
    { id: 64, name: "Gary Oldman", character: "James Gordon", profile_path: "/2v9FVVBUrrkW2m3QOcYkuhq9A6o.jpg", order: 2 },
    { id: 5294, name: "Aaron Eckhart", character: "Harvey Dent / Two-Face", profile_path: "/dyFaWwwMqBr88e71j2wm9WoNKzU.jpg", order: 3 },
    { id: 5293, name: "Maggie Gyllenhaal", character: "Rachel Dawes", profile_path: "/6fBT6LD77j7rkXw4q3WNGPVVXFb.jpg", order: 4 },
    { id: 2524, name: "Michael Caine", character: "Alfred Pennyworth", profile_path: "/bVZRMlpjTAO2pJK6v90uI1GbVVr.jpg", order: 5 },
    { id: 380, name: "Morgan Freeman", character: "Lucius Fox", profile_path: "/jPsLqiYGSofU4s6BjrxnefMfabb.jpg", order: 6 },
    { id: 5469, name: "Eric Roberts", character: "Sal Maroni", profile_path: "/fYJvOYvmVxaQcQhPMwZ3KAuKPyS.jpg", order: 7 },
    { id: 5470, name: "Chin Han", character: "Lau", profile_path: "/b1QqVfE4qnlJu3dQYILVpGQbLkx.jpg", order: 8 },
    { id: 5471, name: "Nestor Carbonell", character: "Mayor Garcia", profile_path: "/2HMxsgJF3IlaMRNXWkcfKyRqXpK.jpg", order: 9 },
  ],
  crew: [
    { id: 525, name: "Christopher Nolan", job: "Director", department: "Directing", profile_path: "/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg" },
    { id: 525, name: "Christopher Nolan", job: "Writer", department: "Writing", profile_path: "/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg" },
    { id: 525, name: "Christopher Nolan", job: "Producer", department: "Production", profile_path: "/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg" },
    { id: 1543, name: "Hans Zimmer", job: "Original Music Composer", department: "Sound", profile_path: "/tpQnDeHY15szIXvpnhlprufz4d.jpg" },
    { id: 292, name: "James Newton Howard", job: "Original Music Composer", department: "Sound", profile_path: "/A2dHoFHZPGwWTPa9v9h92bFnRK3.jpg" },
    { id: 5281, name: "Jonathan Nolan", job: "Writer", department: "Writing", profile_path: "/4aNDsEeEPDhT3OhdEUBs7BmBD9n.jpg" },
  ],
  videos: [
    { id: "1", key: "EXeTwQWrcwY", name: "Official Trailer", site: "YouTube", type: "Trailer", official: true, published_at: "2008-05-10T00:00:00.000Z" },
    { id: "2", key: "kmJLuwP3MbY", name: "Teaser Trailer", site: "YouTube", type: "Teaser", official: true, published_at: "2007-12-15T00:00:00.000Z" },
    { id: "3", key: "TQfATDZY5Y4", name: "Behind The Scenes", site: "YouTube", type: "Behind the Scenes", official: true, published_at: "2008-12-09T00:00:00.000Z" },
  ],
  backdrops: [
    { file_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", aspect_ratio: 1.778, width: 3840, height: 2160 },
    { file_path: "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg", aspect_ratio: 1.778, width: 1920, height: 1080 },
    { file_path: "/f7G6i2dpKxv7q7Q4v2g2e2n4q4.jpg", aspect_ratio: 1.778, width: 1920, height: 1080 },
    { file_path: "/sD6B8Js2U6D8vh6q2g7z7l8b8n8.jpg", aspect_ratio: 1.778, width: 1920, height: 1080 },
  ],
  posters: [
    { file_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", aspect_ratio: 0.667, width: 500, height: 750 },
    { file_path: "/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg", aspect_ratio: 0.667, width: 500, height: 750 },
    { file_path: "/dSIa9HEGNHuEKr0Iu5i4Y3n3j3v.jpg", aspect_ratio: 0.667, width: 500, height: 750 },
  ],
  reviews: [
    {
      id: "1",
      author: "MovieBuff42",
      author_details: { name: "John Smith", username: "MovieBuff42", avatar_path: null, rating: 10 },
      content: "Heath Ledger's Joker is a masterpiece of acting. This is not just a superhero movie - it's a crime thriller that happens to feature Batman. The Dark Knight transcends the genre and delivers a complex, thrilling, and emotionally resonant experience. Nolan's direction is impeccable, and the script is filled with memorable dialogue and thought-provoking themes about chaos, order, and morality.",
      created_at: "2008-07-20T12:00:00.000Z",
      updated_at: "2008-07-20T12:00:00.000Z",
      url: "",
    },
    {
      id: "2",
      author: "CinemaLover",
      author_details: { name: "Sarah Johnson", username: "CinemaLover", avatar_path: "/yzlS1wpYmXe4TZ3U4IcY0H5C8W8.jpg", rating: 9 },
      content: "Christopher Nolan has crafted the definitive Batman film. The performances are outstanding across the board, with Heath Ledger delivering an Oscar-worthy performance as the Joker. The action sequences are breathtaking, and the story keeps you on the edge of your seat from start to finish. A modern classic that will be remembered for decades.",
      created_at: "2008-07-25T15:30:00.000Z",
      updated_at: "2008-07-25T15:30:00.000Z",
      url: "",
    },
    {
      id: "3",
      author: "FilmCritic99",
      author_details: { name: "Michael Brown", username: "FilmCritic99", avatar_path: null, rating: 8 },
      content: "While not perfect, The Dark Knight is an exceptional achievement in comic book filmmaking. Hans Zimmer and James Newton Howard's score is haunting and memorable. The film's exploration of surveillance, vigilantism, and heroism in a post-9/11 world gives it a depth rarely seen in the genre.",
      created_at: "2008-08-01T09:15:00.000Z",
      updated_at: "2008-08-01T09:15:00.000Z",
      url: "",
    },
  ],
  keywords: [
    { id: 849, name: "dc comics" },
    { id: 853, name: "crime fighter" },
    { id: 9715, name: "superhero" },
    { id: 9717, name: "based on comic" },
    { id: 155030, name: "chaos" },
    { id: 163455, name: "tragic villain" },
    { id: 179431, name: "criminal mastermind" },
    { id: 195861, name: "bank robbery" },
    { id: 207317, name: "gotham city" },
    { id: 229266, name: "dark hero" },
  ],
  similar: [
    { id: 49026, title: "The Dark Knight Rises", poster_path: "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg", backdrop_path: "/f6ljQGv7WnJuwBPty017oPWfqjx.jpg", vote_average: 7.8, release_date: "2012-07-20", overview: "Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent's crimes to protect the late attorney's reputation and is subsequently hunted by the Gotham City Police Department.", genre_ids: [28, 80, 18, 53], media_type: "movie" as const },
    { id: 272, title: "Batman Begins", poster_path: "/4MpN4kIEqUjW8OPtOQJXlTdHiJV.jpg", backdrop_path: "/aVY2lOh5qsb4ZUNJjxhNUYfNCyh.jpg", vote_average: 7.7, release_date: "2005-06-15", overview: "Driven by tragedy, billionaire Bruce Wayne dedicates his life to uncovering and defeating the corruption that plagues his home, Gotham City.", genre_ids: [28, 80, 18], media_type: "movie" as const },
    { id: 157336, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg", vote_average: 8.4, release_date: "2014-11-05", overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.", genre_ids: [12, 18, 878], media_type: "movie" as const },
    { id: 27205, title: "Inception", poster_path: "/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", vote_average: 8.4, release_date: "2010-07-16", overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.", genre_ids: [28, 878, 12], media_type: "movie" as const },
    { id: 76341, title: "Mad Max: Fury Road", poster_path: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", backdrop_path: "/phszHPFVhPHhMZgo0fWTKBDQsJA.jpg", vote_average: 7.6, release_date: "2015-05-15", overview: "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken.", genre_ids: [28, 12, 878], media_type: "movie" as const },
    { id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", backdrop_path: "/x2RS3uTcsJJ9IfjNPcgDmukoEcQ.jpg", vote_average: 8.4, release_date: "2001-12-18", overview: "Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator.", genre_ids: [12, 14, 28], media_type: "movie" as const },
  ],
}

const tvData = {
  id: 66732,
  title: "Stranger Things",
  tagline: "It only gets stranger...",
  overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
  poster_path: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  backdrop_path: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  release_date: "2016-07-15",
  vote_average: 8.7,
  runtime: 50,
  certification: "TV-14",
  genres: ["Drama", "Mystery", "Sci-Fi & Fantasy"],
  status: "Returning Series",
  original_language: "en",
  video_key: "b9EkMc79ZSU",
  number_of_seasons: 4,
  number_of_episodes: 34,
  production_companies: [
    { id: 2552, name: "21 Laps Entertainment", logo_path: "/v9l9bQxSz0s8PobnPgNmv8F3B9P.png" },
    { id: 132277, name: "Monkey Massacre", logo_path: null },
  ],
  production_countries: [
    { iso_3166_1: "US", name: "United States of America" },
  ],
  spoken_languages: [
    { english_name: "English", iso_639_1: "en" },
  ],
  seasons: [
    { id: 77680, name: "Season 1", overview: "Strange things are afoot in Hawkins, Indiana, where a young boy's sudden disappearance unearths a young girl with otherworldly powers.", season_number: 1, episode_count: 8, poster_path: "/rbnuP7hlynALhZ2E6X0fKvFjVPV.jpg", air_date: "2016-07-15" },
    { id: 84182, name: "Season 2", overview: "It's been nearly a year since Will's strange disappearance. But life's hardly back to normal in Hawkins.", season_number: 2, episode_count: 9, poster_path: "/lXS60geme1LlEob5Wgvj3KilClA.jpg", air_date: "2017-10-27" },
    { id: 115216, name: "Season 3", overview: "It's 1985 in Hawkins, Indiana, and summer's heating up. School's out, there's a brand new mall in town, and the Hawkins crew are on the cusp of adulthood.", season_number: 3, episode_count: 8, poster_path: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg", air_date: "2019-07-04" },
    { id: 157065, name: "Season 4", overview: "Darkness returns to Hawkins. New and alarming supernatural threats emerge, and a chilling mystery unravels.", season_number: 4, episode_count: 9, poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", air_date: "2022-05-27" },
  ],
  episodes: {
    4: [
      { id: 2479871, name: "Chapter One: The Hellfire Club", overview: "A young man is found dead. A secret group meets. Elsewhere, romance blossoms, old friends drift apart, and a new terror surfaces.", episode_number: 1, season_number: 4, still_path: "/AdyJH8kKdS6IvZAiCJeKRYY6sxI.jpg", air_date: "2022-05-27", runtime: 78, vote_average: 8.4, watchProgress: 100 },
      { id: 2479872, name: "Chapter Two: Vecna's Curse", overview: "Nancy and Robin have a new lead. Max is shaken by a haunting vision. Eleven reaches out to Mike — and gets troubling news.", episode_number: 2, season_number: 4, still_path: "/5O6ePRfUNPbtQlN3NHzU8Q4bJZa.jpg", air_date: "2022-05-27", runtime: 76, vote_average: 8.3, watchProgress: 100 },
      { id: 2479873, name: "Chapter Three: The Monster and the Superhero", overview: "Murray and Joyce race to reach Hopper. Dustin dissects a clue. Max opens up. Eleven faces a bully. Papa restores what was lost.", episode_number: 3, season_number: 4, still_path: "/5xG4DxMRSBkNOjCNj4ZPW0W6bxZ.jpg", air_date: "2022-05-27", runtime: 65, vote_average: 8.1, watchProgress: 65 },
      { id: 2479874, name: "Chapter Four: Dear Billy", overview: "Max is in grave danger... and running out of time. Robin works to decipher a code. Meanwhile, Hopper makes a bold move.", episode_number: 4, season_number: 4, still_path: "/89fQMJl66P6yzq8aNjmN4T8Xu7f.jpg", air_date: "2022-05-27", runtime: 78, vote_average: 9.1, watchProgress: 0 },
      { id: 2479875, name: "Chapter Five: The Nina Project", overview: "Owens takes Eleven to Nevada in hopes of restoring her powers. Joyce and Murray descend on Russia. The Hawkins kids clash with the law.", episode_number: 5, season_number: 4, still_path: "/5fVq9P2I25nxf7Ks6R2oZJvgxVr.jpg", air_date: "2022-05-27", runtime: 74, vote_average: 8.0, watchProgress: 0 },
      { id: 2479876, name: "Chapter Six: The Dive", overview: "The Hawkins gang uncovers a startling secret in Lovers Lake. Meanwhile, Hopper makes a daring move.", episode_number: 6, season_number: 4, still_path: "/8aQoUGx6k7gH2D8lWJG8p6WMiEj.jpg", air_date: "2022-05-27", runtime: 73, vote_average: 8.2, watchProgress: 0 },
      { id: 2479877, name: "Chapter Seven: The Massacre at Hawkins Lab", overview: "As Hopper braces for a fight, Dustin and Eddie deal with new dangers. A horrifying discovery spurs Nancy to action.", episode_number: 7, season_number: 4, still_path: "/kHNEYqQvCqYEGShZPJhEGdSfrnA.jpg", air_date: "2022-05-27", runtime: 98, vote_average: 8.8, watchProgress: 0 },
      { id: 3562898, name: "Chapter Eight: Papa", overview: "Eleven forges an unlikely alliance. Murray takes a trip. Max and Lucas work to reach a crucial revelation.", episode_number: 8, season_number: 4, still_path: "/5TbAjxbJA1u8K0SqEjcXBkQTpfi.jpg", air_date: "2022-07-01", runtime: 85, vote_average: 8.4, watchProgress: 0 },
      { id: 3562899, name: "Chapter Nine: The Piggyback", overview: "With selfless hearts and a killer soundtrack, the beloved Hawkins heroes prepare for the fight of their lives.", episode_number: 9, season_number: 4, still_path: "/qMGiYxJNv5D4hH3i9Z6O7CPmHNv.jpg", air_date: "2022-07-01", runtime: 150, vote_average: 8.6, watchProgress: 0 },
    ],
  },
  cast: [
    { id: 1001657, name: "Millie Bobby Brown", character: "Eleven / Jane Hopper", profile_path: "/gXkQJNxWw1zBQhIWNAp0wl7wqXe.jpg", order: 0 },
    { id: 1457081, name: "Finn Wolfhard", character: "Mike Wheeler", profile_path: "/5yiDAqXk8MReBbJr0L1I1OYdT6G.jpg", order: 1 },
    { id: 17419, name: "Winona Ryder", character: "Joyce Byers", profile_path: "/5QRoD2MkRy0VEDLfdJg2TDhPkWE.jpg", order: 2 },
    { id: 15152, name: "David Harbour", character: "Jim Hopper", profile_path: "/nvxFHHfDAQAZAsRsmfBMU8V1HzH.jpg", order: 3 },
    { id: 1392137, name: "Gaten Matarazzo", character: "Dustin Henderson", profile_path: "/qgfqAtPzFbPe8wjTHxKh7bHNxLT.jpg", order: 4 },
    { id: 1456131, name: "Caleb McLaughlin", character: "Lucas Sinclair", profile_path: "/r5j3mfAXyWUkEtXb7CJPiXQPWsD.jpg", order: 5 },
    { id: 1383254, name: "Natalia Dyer", character: "Nancy Wheeler", profile_path: "/wlxH58SkWspAKqHZmN05YdMxz5M.jpg", order: 6 },
    { id: 1477669, name: "Charlie Heaton", character: "Jonathan Byers", profile_path: "/5RDRPSb4u7vPRxPhfbMHJqUQDdN.jpg", order: 7 },
    { id: 1649152, name: "Joe Keery", character: "Steve Harrington", profile_path: "/6yBd8CQ5P37f3zFTfErAI0qyNKu.jpg", order: 8 },
    { id: 2096931, name: "Maya Hawke", character: "Robin Buckley", profile_path: "/qfGSCX8LWGR5q8cXdJDzqPgQbcR.jpg", order: 9 },
  ],
  crew: [
    { id: 118581, name: "Matt Duffer", job: "Creator", department: "Writing", profile_path: "/kXO5CnSxC0znMAICGxnPeuGP73U.jpg" },
    { id: 1211127, name: "Ross Duffer", job: "Creator", department: "Writing", profile_path: "/kPjjJJ2rp7REaJJGnGbYvhzPnAU.jpg" },
    { id: 57434, name: "Shawn Levy", job: "Executive Producer", department: "Production", profile_path: "/j1CXZgmfvFeD7S3PYtsEk8PFu1y.jpg" },
  ],
  videos: [
    { id: "1", key: "b9EkMc79ZSU", name: "Season 4 Official Trailer", site: "YouTube", type: "Trailer", official: true, published_at: "2022-04-12T00:00:00.000Z" },
    { id: "2", key: "mndl8sFJto8", name: "Season 4 Volume 2 Trailer", site: "YouTube", type: "Trailer", official: true, published_at: "2022-06-22T00:00:00.000Z" },
    { id: "3", key: "yQEondeGvKo", name: "Season 4 Teaser", site: "YouTube", type: "Teaser", official: true, published_at: "2021-08-06T00:00:00.000Z" },
  ],
  backdrops: [
    { file_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", aspect_ratio: 1.778, width: 1920, height: 1080 },
    { file_path: "/9t0tJXcOdLwwzMBnpxO4VYJ4aMW.jpg", aspect_ratio: 1.778, width: 1920, height: 1080 },
    { file_path: "/d8YiNsR4rqQ6v7gN7gJLyU6a5d3.jpg", aspect_ratio: 1.778, width: 1920, height: 1080 },
  ],
  posters: [
    { file_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", aspect_ratio: 0.667, width: 500, height: 750 },
    { file_path: "/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg", aspect_ratio: 0.667, width: 500, height: 750 },
  ],
  reviews: [
    {
      id: "1",
      author: "SeriesAddict",
      author_details: { name: "Emma Wilson", username: "SeriesAddict", avatar_path: null, rating: 9 },
      content: "Stranger Things Season 4 is a masterpiece of television. The Duffer Brothers have outdone themselves with this ambitious and thrilling season. The horror elements are genuinely terrifying, the emotional beats hit hard, and the performances - especially from Sadie Sink - are phenomenal. Running Up That Hill will never sound the same again!",
      created_at: "2022-06-01T10:00:00.000Z",
      updated_at: "2022-06-01T10:00:00.000Z",
      url: "",
    },
    {
      id: "2",
      author: "TVEnthusiast",
      author_details: { name: "David Kim", username: "TVEnthusiast", avatar_path: null, rating: 10 },
      content: "This show continues to amaze me. Every season they manage to raise the stakes while keeping the heart and humor that made us fall in love with these characters. Season 4 is the darkest yet, but also the most emotionally resonant. Vecna is a terrifying villain, and the finale had me on the edge of my seat.",
      created_at: "2022-07-05T14:20:00.000Z",
      updated_at: "2022-07-05T14:20:00.000Z",
      url: "",
    },
  ],
  keywords: [
    { id: 316332, name: "supernatural" },
    { id: 195147, name: "small town" },
    { id: 12541, name: "disappearance" },
    { id: 163398, name: "parallel world" },
    { id: 4758, name: "friendship" },
    { id: 233099, name: "1980s" },
    { id: 9882, name: "telekinesis" },
    { id: 818, name: "monster" },
    { id: 1299, name: "secret experiment" },
    { id: 179912, name: "coming of age" },
  ],
  similar: [
    { id: 1402, name: "The Walking Dead", poster_path: "/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg", backdrop_path: "/wvdWb5kTQipdMDqCclC6Y3zr4j3.jpg", vote_average: 8.1, first_air_date: "2010-10-31", overview: "Sheriff's deputy Rick Grimes awakens from a coma to find a post-apocalyptic world dominated by flesh-eating zombies.", genre_ids: [10759, 18, 10765], media_type: "tv" as const },
    { id: 60059, name: "Better Call Saul", poster_path: "/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg", backdrop_path: "/hPea3Qy5Gd6z4kJLUruBbwAH8Rm.jpg", vote_average: 8.7, first_air_date: "2015-02-08", overview: "Six years before Saul Goodman meets Walter White. We meet him when he's known as Jimmy McGill.", genre_ids: [80, 18], media_type: "tv" as const },
    { id: 94997, name: "House of the Dragon", poster_path: "/z2yahl2uefxDCl0nogcRBstwruJ.jpg", backdrop_path: "/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg", vote_average: 8.4, first_air_date: "2022-08-21", overview: "The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke.", genre_ids: [10765, 18, 10759], media_type: "tv" as const },
    { id: 76479, name: "The Boys", poster_path: "/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg", backdrop_path: "/7cqKGQMnNabzOpi7qaIgZvQ7NGV.jpg", vote_average: 8.5, first_air_date: "2019-07-26", overview: "A group of vigilantes known as 'The Boys' set out to take down corrupt superheroes.", genre_ids: [10765, 10759], media_type: "tv" as const },
    { id: 1399, name: "Game of Thrones", poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg", vote_average: 8.4, first_air_date: "2011-04-17", overview: "Seven noble families fight for control of the mythical land of Westeros.", genre_ids: [10765, 18, 10759], media_type: "tv" as const },
  ],
}

export default async function FilmDetailsPage({ params }: FilmDetailsPageProps) {
  const { type } = await params
  const isTV = type === "tv"
  const data = isTV ? tvData : movieData
  const mediaType = isTV ? "tv" : "movie"

  return (
    <FilmDetails
      data={data}
      mediaType={mediaType}
    />
  )
}