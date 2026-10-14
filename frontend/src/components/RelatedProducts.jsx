import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'

const RelatedProducts = ({category, subCategory}) => {

    const {products} = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.slice();
            // Filter by category
            productsCopy = productsCopy.filter((item) => category === item.category);
            // Further filter by subCategory
            productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);
            // Set the related products, limiting to 5
            setRelated(productsCopy.slice(0, 5));
        }
    }, [products, category, subCategory]); // Added category and subCategory as dependencies

    // Don't render the component if there are no related products
    if (related.length === 0) {
        return null;
    }

  return (
    // Use the Deep Charcoal text color
    <div className='my-24 text-[#2C3E50]'>
        <div className='py-2 text-3xl text-center'>
            {/* Title component will inherit the premium styles */}
            <Title text1={'YOU MIGHT'} text2={'ALSO LIKE'} />
        </div>
        <div className='grid grid-cols-2 gap-4 mt-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8'>
            {related.map((item, index) => (
                <ProductItem
                    key={index}
                    id={item._id}
                    name={item.name}
                    image={item.image}
                    price={item.price}
                />
            ))}
        </div>
    </div>
  )
}

export default RelatedProducts
