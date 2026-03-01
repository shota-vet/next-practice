// Dynamic Route（動的ルーティング）の練習

import { products } from "./data";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div>
      <h1>商品一覧</h1>
      {products.map((product) => (
        <div key={product.id}>
          <Link href={`/products/${product.id}`}>{product.name} </Link>
        </div>
      ))}
    </div>
  );
}
