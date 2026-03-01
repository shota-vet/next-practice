"use client";

import { useState, useEffect } from "react";
import PokemonList from "./components/PokemonList/PokemonList";

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
  //   状態で変化するものは何か→変化する状態をstateで管理。errorをstate管理するのはエラーが出たときに画面に表示することを可能にするため
  const [detailLoading, setDetailLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  async function load() {
    setLoading(true);
    try {
      setError(null); // ← あると便利（前のエラーを消す）
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`,
      );
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
    setDetailLoading(true);
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
    setDetailLoading(false);
  }

  useEffect(() => {
    load();
  }, [offset]);
  // offsetが変わるたび自動で。

  return (
    <main style={{ padding: 20 }}>
      <h1>Pokemon List</h1>
      <button onClick={load} disabled={loading}>
        {/* loadingがtrueの時はbuttonを押せないようにしているdisabledは真偽型の属性。 */}
        Reload 10 pokemon
      </button>
      <br />
      <button onClick={() => setOffset((prev) => Math.max(0, prev - 10))}>
        Prev
      </button>
      <br /> {/*  Math.max(a,b)は大きい方を返すという意味 */}
      <button onClick={() => setOffset((prev) => prev + 10)}>Next</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {/* このerrorはuseStateのerror、つまりstringかnull*/}
      <PokemonList
        pokemon={pokemon}
        detailLoading={detailLoading}
        onSelect={loadDetail}
      />
      <hr />
      {detailLoading && <p>Loading detail...</p>}
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
