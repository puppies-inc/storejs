const SPECIES = [
  { id: 'puppy', label: 'Puppy', emoji: '🐶', photo: (id) => `https://placedog.net/640/480?id=${id}` },
  { id: 'kitten', label: 'Kitten', emoji: '🐱', photo: (id) => `https://placekitten.com/640/480?image=${id}` },
  { id: 'bunny', label: 'Bunny', emoji: '🐰', photo: (id) => `https://loremflickr.com/640/480/rabbit?lock=${id}` },
  { id: 'bird', label: 'Bird', emoji: '🐦', photo: (id) => `https://loremflickr.com/640/480/bird?lock=${id}` },
  { id: 'hamster', label: 'Hamster', emoji: '🐹', photo: (id) => `https://loremflickr.com/640/480/hamster?lock=${id}` }
];

const DEFAULT_SPECIES = SPECIES[0];

function findSpecies(id) {
  return SPECIES.find((species) => species.id === id) || null;
}

function resolveSpecies(id) {
  return findSpecies(id) || DEFAULT_SPECIES;
}

function photoUrl(animal) {
  return resolveSpecies(animal.species).photo(animal.id);
}

module.exports = { SPECIES, DEFAULT_SPECIES, findSpecies, resolveSpecies, photoUrl };
