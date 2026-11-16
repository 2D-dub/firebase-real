const TITULOS_PELICULAS = {
  '2baf70d1-42bb-4437-b551-e5fed5a87abe': 'Castillo en el cielo',
  '12cfb892-aac0-4c5b-94af-521852e46d6a': 'La tumba de las luciérnagas',
  '58611129-2dbc-4a81-a72f-77ddfc1b1b49': 'Mi vecino Totoro',
  'ea660b10-85c4-4ae3-8a5f-41cea3648e3e': 'El servicio de entregas de Kiki',
  '4e236f34-b981-41c3-8c65-f8c9000b94e7': 'Solo ayer',
  'ebbb6b7c-945c-41ee-a792-de0e43191bd8': 'Porco Rosso',
  '1b67aa9a-2e4a-45af-ac98-64d6ad15b16c': 'Pom Poko',
  'ff24da26-a969-4f0e-ba1e-a122ead6c6e3': 'Susurro del corazón',
  '0440483e-ca0e-4120-8c50-4c8cd9b965d6': 'La princesa Mononoke',
  '45204234-adfd-45cb-a505-a8e7a676b114': 'Mis vecinos los Yamadas',
  'dc2e6bd1-8156-4886-adff-b39e6043af0c': 'El viaje de Chihiro',
  '90b72513-afd4-4570-84de-a56c312fdf81': 'El regreso del gato',
  'cd3d059c-09f4-4ff3-8d63-bc765a5184fa': 'El castillo ambulante de Howl',
  '112c1e67-726f-40b1-ac17-6974127bb9b9': 'Cuentos de Terramar',
  '758bf02e-3122-46e0-884e-67cf83df1786': 'Ponyo',
  '2de9426b-914a-4a06-a3a0-5e6d9d3886f6': 'Arrietty',
  '45db04e4-304a-4933-9823-33f389e8d74d': 'Desde la colina de las amapolas',
  '67405111-37a5-438f-81cc-4666af60c800': 'El viento se levanta',
  '578ae244-7750-4d9f-867b-f3cd3d6fecf4': 'El cuento de la princesa Kaguya',
  '5fdfb320-2a02-49a7-94ff-5ca418cae602': 'Cuando Marnie estuvo allí',
  'd868e6ec-c44a-405b-8fa6-f7f0f8cfb500': 'La tortuga roja',
  '790e0028-a31c-4626-a694-86b7a8cada40': 'La tijereta y la bruja',
};

let pokemonPromise;
let peliculasPromise;

async function cargarDatos(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`El servicio respondió con estado ${respuesta.status}.`);
  }
  return respuesta.json();
}

async function cargarLista(url) {
  const datos = await cargarDatos(url);
  if (!Array.isArray(datos)) {
    throw new Error('El servicio devolvió datos con un formato inesperado.');
  }
  return datos;
}

export function obtenerPokemones() {
  if (!pokemonPromise) {
    pokemonPromise = cargarDatos('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then((datos) => {
        if (!Array.isArray(datos.results)) {
          throw new Error('El servicio de Pokémon devolvió datos con un formato inesperado.');
        }
        return datos.results.map((pokemon) => {
          const id = pokemon.url.split('/').filter(Boolean).pop();
          return {
            id,
            nombre: pokemon.name,
            imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          };
        });
      })
      .catch((error) => {
        pokemonPromise = null;
        throw error;
      });
  }
  return pokemonPromise;
}

export function obtenerPeliculas() {
  if (!peliculasPromise) {
    peliculasPromise = cargarLista('https://ghibliapi.vercel.app/films')
      .then((datos) =>
        datos.map((pelicula) => ({
          id: pelicula.id,
          nombre: TITULOS_PELICULAS[pelicula.id] || pelicula.title,
          imagen: pelicula.image,
          director: pelicula.director,
          anio: pelicula.release_date,
          calificacion: pelicula.rt_score,
        }))
      )
      .catch((error) => {
        peliculasPromise = null;
        throw error;
      });
  }
  return peliculasPromise;
}

export function normalizarPalabra(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function contarLetras(texto) {
  return normalizarPalabra(texto).replace(/[^A-Z]/g, '').length;
}
