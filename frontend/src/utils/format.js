/**
 * O dataset guarda os nomes de categoria em caixa alta ("BEST PICTURE"),
 * o que destoa do restante da interface. A classe `capitalize` do CSS não
 * resolve nesse caso, porque ela não rebaixa as letras já maiúsculas.
 *
 * @example formatCategoryName("BEST PICTURE") // "Best Picture"
 */
export function formatCategoryName(name) {
  if (!name) return "";
  return name.toLowerCase().replace(/\p{L}[\p{L}'’]*/gu, (word) => word[0].toUpperCase() + word.slice(1));
}

/** Junta nomes em uma lista legível: "A", "A e B", "A, B e C". */
export function joinNames(names) {
  if (!names?.length) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}
