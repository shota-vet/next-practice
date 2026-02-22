"use client";

import { useState } from "react";

type Pokemon = {
  name: string;
  url: string;
};
// ひとつ一つの要素の型

type PokemonResponse = {
  results: Pokemon[];
};
// 返ってくるデータの型
type PokemonDetail = {
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
};
// typesの配列は[{ type: { name: "grass" } },{ type: { name: "poison" } }]のような形。

export default function Page() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PokemonDetail | null>(null);
  //   const [selected, setSelected]=useState(null);だと型推論でsetStateもnullになるので、このstateで使う型をジェネリクスで書く必要がある

  //   状態で変化するものは何か→変化する状態をstateで管理。

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      //   Errorクラスの中のmessageプロパティに`HTTP ${res.status}`という文字列が入る。
      //   okはresponseオブジェクトのプロパティ名でboolean型
      //   ?limit=10はクエリパラメータ?key=valueの形で使う。
      const data: PokemonResponse = await res.json();
      // ここで返ってきているのはcount: number;　next: string | null; results: Pokemon[];などのオブジェクト。
      // その中のresultsがPokemon[]なのでPokemonResponseという型を定義している。（余分なプロパティがあってその中の一つの型を指定している。逆にプロパティがその型に対して足りないのはNG）
      setPokemon(data.results); //ここで初めて画面が変わる。
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown Error");
    } //instanceof は JSの型チェックの仕組み。今回のerrorが Errorクラスから作られたオブジェクトかどうかを調べてる。errorをUIで表示させるためのuseState
    // ここでの e はErrorクラスのインスタンス
    setLoading(false);
    // 最後二つのレンダリングは同じタイミングで走るのでまとめて一回のレンダリングで済む。これがReactのバッチ処理。
    // tryで囲むのは一連の非同期処理をまとめて囲む
  }

  async function loadDetail(url: string) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: PokemonDetail = await res.json();
      console.log(data);
      setSelected(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown Error");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Pokemon List</h1>
      <button onClick={load} disabled={loading}>
        {/* loadingがtrueの時はbuttonを押せないようにしているdisabledは真偽型の属性。 */}
        Load 10 pokemon
      </button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}　
      {/* このerrorはuseStateのerror、つまりstringかnull*/}
      <p>Count:{pokemon.length}</p>
      <ul>
        {pokemon.map((p) => (
          <li
            key={p.name}
            style={{ cursor: "pointer" }}
            onClick={() => loadDetail(p.url)}
          >
            {p.name}
          </li>
        ))}
      </ul>
      <hr />
      <h2>Detail</h2>
      {selected ? (
        <div>
          <p>Name:{selected.name}</p> <p>Height:{selected.height}</p>
          <p>Weight:{selected.weight}</p>
          <p>Types:{selected.types.map((t) => t.type.name).join(",")}</p>
          {/* Joinで配列["grass", "poison"]→"grass,poison"（文字列）という作業 */}
          {/* 三項演算子を使った条件レンダリング */}
        </div>
      ) : (
        <p>Click a pokemon</p>
      )}
    </main>
  );
}
// try の中でエラーが投げられるのは次の2パターン：
// 自分で throw したとき
// 実行中に例外が発生したとき（ランタイムエラー／Promiseのreject）
// if (!res.ok) が拾うもの　HTTPステータスが200〜299以外　つまり200〜299 → true　それ以外 → false
// catchが拾うもの　ネットワークエラー（接続失敗など）　自分で throw したもの　res.json() が失敗したとき
// res.status は　サーバーが返してきた「HTTPステータスコード」ステータス	意味
// 200	成功
// 201	作成成功
// 400	リクエストが不正
// 401	認証エラー
// 403	権限なし
// 404	見つからない　URLが間違っているときとか
// 500	サーバー内部エラー　サーバーが落ちている
// fetchは「通信が成功したかどうか」しか見ていないので、サーバーに到達できた → 成功
// サーバーが404を返した → 通信成功（内容は失敗）なので、!res.okで通信は成功しているけどHTTPエラーの場合をここでかく
