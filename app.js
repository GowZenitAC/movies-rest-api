const express = require("express");
const movies = require("./movies.json");
const crypto = require("node:crypto");
const cors = require("cors");
const {
  validateMovie,
  validatePartialMovie,
} = require("./schemas/movie.schema.js");
const app = express();
app.use(express.json());
const ACCEPTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:5500",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.disable("x-powered-by"); // para desactivar la cabecera X-Powered-By

// app.get('/', (req, res) => {
//     res.json({ message: 'hello world' });
// });

//Todos los recursos que sean movies se identifican con /movies
// app.get("/movies", (req, res) => {
//   // const origin = req.header("Origin");
//   // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//   //   res.header("Access-Control-Allow-Origin", origin);
//   // }
  

//   const { genre } = req.query;
//   if (genre) {
//     // const moviesFiltered = movies.filter((movie) => movie.genre.includes(genre));
//     const moviesFiltered = movies.filter((movie) =>
//       movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
//     );
//     return res.json(moviesFiltered);
//   }
//   res.json(movies);
// }); 

app.get("/movies", (req, res) => { //mo
  const { limit = 10, page = 1, genre } = req.query;
  let moviesFiltered = movies;
  if (genre) {
    moviesFiltered = moviesFiltered.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }
  const offset = (page - 1) * limit;
  const paginatedMovies = moviesFiltered.slice(offset, offset + limit);
  const meta = {
    total: moviesFiltered.length,
    page: Number(page),
    perPage: Number(limit),
    totalPages: Math.ceil(moviesFiltered.length / limit),
  };
  res.json({ meta, data: paginatedMovies });
});

app.get("/movies/:id", (req, res) => {
  //parametros de la url | path to regexp
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);
  res.status(404).json({ message: "movie not found" });
});

//Crear una movie

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  //validaciones pero es
  //   if (!title || !year || !director || !duration || !poster || !genre) {
  //     return res.status(400).json({ message: "Missing data" });
  //   }
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };
  movies.push(newMovie); //esto no es REST porque estamos guardando la informacion en memoria
  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  if (movieIndex < -1) {
    return res.status(404).json({ message: "movie not found" });
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  if (movieIndex < -1) {
    return res.status(404).json({ message: "movie not found" });
  }
  movies.splice(movieIndex, 1);
  return res.json({ message: "movie deleted" });
});

// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('Origin');
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//   }
//   res.sendStatus(200)
// })

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
