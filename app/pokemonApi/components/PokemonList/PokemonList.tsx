"use client";
import styles from "./PokemonList.module.css";

type Pokemon = {
  name: string;
  url: string;
};
// ひとつ一つの要素の型

type Props = {
  pokemon: Pokemon[];
  detailLoading: boolean;
  onSelect: (url: string) => void;
};
// コンポーネントのJSXの部分をまず考えて、そこで今回親から何をpropsで引き継ぐ必要があるかを考え、必要なものの型を定義する。pokemonはPokemon[]、detailLoadingはboolean、onSelectは引数にurl(string)を取って返り値がvoidの関数ということ。そしてそれぞれ定義したらJSXを完成させる。

export default function PokemonList(props: Props) {
  return (
    <>
      <p>Count:{props.pokemon.length}</p>
      <ul>
        {props.pokemon.map((p) => (
          <li key={p.name}>
            <button
              className={styles.button}
              disabled={props.detailLoading}
              onClick={() => props.onSelect(p.url)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
      <hr />
    </>
  );
}

// 分割代入で書くとしたら
// export default function PokemonList(
//   { pokemon, detailLoading, onSelect }: Props
// ) {
//   return (
//     <>
//       <p>Count:{pokemon.length}</p>
//       <ul>
//         {pokemon.map((p) => (
//           <li key={p.name}>
//             <button
//               disabled={detailLoading}
//               onClick={() => onSelect(p.url)}
//             >
//               {p.name}
//             </button>
//           </li>
//         ))}
//       </ul>
//       <hr />
//     </>
//   );
// }
// function PokemonList(props: Props) {
//   const pokemon = props.pokemon;
//   const detailLoading = props.detailLoading;
//   const onSelect = props.onSelect;　をやっているのと同じ
// コンポーネントとして代入しないといけないpropsを書いているのが分割代入

// つまり { pokemon } は

// 引数オブジェクトの中から pokemon というプロパティだけを抜き出して
// 変数 pokemon として使えるようにしている

{
  /* <p>Count:{pokemon.length}</p>
      <ul>
        {pokemon.map((p) => (
          <li
            key={p.name}
            style={{ cursor: detailLoading ? "not-allowed" : "pointer" }}
            onClick={() => loadDetail(p.url)}
          >
            {p.name}
          </li>
        ))}
      </ul> */
}
//   この部分をコンポーネント化したい→必要な情報はpropsで親から子に渡す→何を渡さないといけないか考える→pokemonを渡さないといけない→子はpokemonを受け取らないといけない→Typeでpokemonを定義する→pokemonは親で型がPokemonがPokemon[]だからこっちでも同じ→Pokemon[]に必要なPokemonの型もここにかかないといけないので書く、nameやurlも使うので必要だよなと考える。
