"use client";

import { useState, useEffect } from "react";
import PokemonList from "./components/PokemonList/PokemonList";
import { M_PLUS_1 } from "next/font/google";

type Pokemon = {
  name: string;
  url: string;
};
// ひとつ一つの要素の型

type PokemonResponse = {
  count: number;
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


const PAGE_WINDOW = 5;

export default function Page() {
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  //   const [selected, setSelected]=useState(null);だと型推論でsetStateもnullになるので、このstateで使う型をジェネリクスで書く必要がある
  //   状態で変化するものは何か→変化する状態をstateで管理。errorをstate管理するのはエラーが出たときに画面に表示することを可能にするため

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pokemonPerPage, setPokemonPerPage] = useState(10);
  const offset = (page - 1) * pokemonPerPage;
  const totalPages = Math.ceil(totalCount / pokemonPerPage); //切り上げ
  const HALF_WINDOW = Math.floor(PAGE_WINDOW / 2); //切り捨て

  let startPage = page - HALF_WINDOW;
  let endPage = page + HALF_WINDOW;
  if (startPage < 1) {
    startPage = 1;
    endPage = PAGE_WINDOW;
  }
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = totalPages - PAGE_WINDOW + 1;
  }

  const visiblePages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }


  const load = async () => {
    setLoading(true);
    setError(null); // ← あると便利（前のエラーを消す）
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${pokemonPerPage}&offset=${offset}`,
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      //   Errorクラスの中のmessageプロパティに`HTTP ${res.status}`という文字列が入る。
      //   HTTP通信自体がうまくいっている場合、catchにはいらない。Fetcherror≠HTTPerror
      //   okはresponseオブジェクトのプロパティ名でboolean型
      //   ?limit=10はクエリパラメータ?key=valueの形で使う。
      const data: PokemonResponse = await res.json();
      // ここで返ってきているのはcount: number;　next: string | null; results: Pokemon[];などのオブジェクト。
      // その中のresultsがPokemon[]なのでPokemonResponseという型を定義している。（余分なプロパティがあってその中の一つの型を指定している。逆にプロパティがその型に対して足りないのはNG）
      setPokemonList(data.results); //ここで初めて画面が変わる。
      setTotalCount(data.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown Error");
    } //instanceof は JSの型チェックの仕組み。今回のerrorが Errorクラスから作られたオブジェクトかどうかを調べてる。errorをUIで表示させるためのuseState
    // ここでの e はErrorクラスのインスタンス
    setLoading(false);
    // 最後二つのレンダリングは同じタイミングで走るのでまとめて一回のレンダリングで済む。これがReactのバッチ処理。
    // tryで囲むのは一連の非同期処理をまとめて囲む
  }

  const loadDetail = async (url: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: PokemonDetail = await res.json();
      setSelectedPokemon(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown Error");
    }
    setDetailLoading(false);
  }

  useEffect(() => {
    load();
  }, [page]);
  // pageが変わるたび自動で。

  return (
    <main style={{ padding: 20 }}>
      <h1>Pokemon List</h1>
      <br />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {/* このerrorはuseStateのerror、つまりstringかnull*/}

      <PokemonList
        pokemon={pokemonList}
        detailLoading={detailLoading}
        onSelect={loadDetail}
      />
       <button onClick={() => setPage((prev) => prev - 1)} disabled={page === 1}>
        Prev
      </button>
      {startPage > 1 && (
        <>
          <button onClick={() => setPage(1)} style={{ margin: "0 4px" }}>
            1
          </button>

          {startPage > 2 && <span style={{ margin: "0 4px" }}>...</span>}
        </>
      )}

      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => setPage(p)}
          style={{
            margin: "0 4px",
          }}
        >
          {p}
        </button>
      ))}

          {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span style={{ margin: "0 4px" }}>...</span>}
          <button
            onClick={() => setPage(totalPages)}
            style={{ margin: "0 4px" }}
          >
            {totalPages}
          </button>
        </>
      )}
      <button onClick={() => setPage((prev) => prev + 1)}>
        Next
      </button>
      <hr />
      <label>
  表示件数:
  <select
    value={pokemonPerPage}
    onChange={(e) => {
      setPokemonPerPage(Number(e.target.value));
      setPage(1);
    }}
  >
    {[10, 30, 50].map((n) => (
      <option key={n} value={n}>
        {n}
      </option>
    ))}
  </select>
</label>
      {detailLoading && <p>Loading detail...</p>}
      <h2>Detail</h2>
      {selectedPokemon ? (
        <div>
          <p>Name:{selectedPokemon.name}</p> <p>Height:{selectedPokemon.height}</p>
          <p>Weight:{selectedPokemon.weight}</p>
          <p>Types:{selectedPokemon.types.map((t) => t.type.name).join(",")}</p>
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
