export type Pokemon = {
  name: string;
  url: string;
};
// ひとつ一つの要素の型

export type PokemonResponse = {
  results: Pokemon[];
};
// 返ってくるデータの型
export type PokemonDetail = {
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
};
// typesの配列は[{ type: { name: "grass" } },{ type: { name: "poison" } }]のような形。
