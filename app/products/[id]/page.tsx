import { products } from "../data";

type Props = {
  params: {
    id: string;
  };
};
// Nextが渡してくるparamsの方をここで定義

export default function ProductDetailPage({ params }: Props) {
  const { id } = params; //idを取り出している
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <div>商品が見つかりません</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>価格: {product.price}円</p>
    </div>
  );
}
