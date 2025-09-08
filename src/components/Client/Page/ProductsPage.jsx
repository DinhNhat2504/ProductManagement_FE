import ProductFilter from "../MainContent/ProductFilter";

export default function ProductsPage() {
  return (
    <>
        <div className="w-full mx-auto ">

      <ProductFilter cateId={""} isCategory={true} />
    </div>
        </>
  );
}
