const z = require("zod");




   //validaciones con zod
const movieSchema = z.object({
    title: z.string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
    }),
    year: z.number().int().min(1900).max(2030),
    director: z.string(),
    duration: z.number().int().min(0).positive(),
    poster: z.string().url({
        message: "Poster must be a valid URL",
    }),
    genre: z.array(z.enum(["Action", "Adventure", "Drama", "Sci-Fi", "Thriller", "Comedy", "Romance", "Fantasy", "Animation", "Crime", "Biography"]), 
    {
        required_error: "Genre is required",
        invalid_type_error: "Genre must be an array of strings",
    }
),
    rate: z.number().min(0).max(10).default(5.5),
})

function validateMovie(movie) {
    return movieSchema.safeParse(movie);
}

function validatePartialMovie (movie) {
    return movieSchema.partial().safeParse(movie);
}

module.exports = {
    validateMovie,
    validatePartialMovie
}
