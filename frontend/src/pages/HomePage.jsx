import React, { useEffect } from 'react'
import {useProductStore} from '../store/UseProductStore'
import { PlusCircle,RefreshCwIcon } from 'lucide-react';


function HomePage() {
  const {products,loading,error,fetchProducts} = useProductStore();
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  console.log(products);
  return (
   <main className="max-w-6xl mx-auto px-4 py-8 ">
    <div className="flex justify-between items-center mb-8">
      <button className=" btn btn-primary">
        <PlusCircle className="size-5 mr-2"/>
        Add Product
      </button>
      <button className="btn btn-ghost btn-circle" onClick={fetchProducts}>
        <RefreshCwIcon className="size-5"/>
      </button>
    </div>

    {error && (
      <div className="alert alert-error mb-4">
        <span>{error}</span>
      </div>
    
    )}
    {loading ? (
      <div className="flex justify-center items-center">
        <div className="loading loading-spinner"/>
      </div>
    ):(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
    ) )}
    </div>
    )}

   </main>
  )
}

export default HomePage
