export default function Category() {
  return (
    <>
      <a
        key={category.categoryId}
        href={`/category/${category.categoryId}`}
        className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
      >
        {category.name}
      </a>
    </>
  );
}
