import React, { useState, useEffect } from "react";
import axios from "axios";
import Footers from "../components/Footer";

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);  // For product details if not populated
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch cart items with product details (if populated)
  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem("userToken"); // Get token from localStorage
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      try {
        const response = await axios.get("http://localhost:1122/api/user/cart/getallcart", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        console.log("Cart API Response:", response.data);
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching cart items", error);
        setCartItems([]);
      }
    };

    fetchCartItems();
  }, []);

  // Optional: Fetch product details in case they are not populated in the cart API
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("userToken");  // Ensure the user is authenticated

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      try {
        const response = await axios.get("http://localhost:1122/api/admin/product/getAllProduct", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        console.log("Products API Response:", response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching product data", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2 className="text-lg lg:text-xl font-bold mb-4">Cart Items</h2>
      {cartItems.length > 0 ? (
        cartItems.map((item) => {
          // Get the product details from the cart item
          const product = item.productItem || {}; 

          return (
            <div key={item._id} className="cart-item flex items-center mb-4 p-4 border-b border-gray-300">
              {/* Display Product Image if available */}
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.title || "Product"} 
                  className="w-16 h-16 object-cover mr-4"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">No Image</div>
              )}

              <div className="flex-1">
                {/* Display Product Title if available */}
                <p className="font-semibold text-lg">{product.title || "Untitled Product"}</p>
                {/* Display Product Price if available */}
                <p className="text-sm text-gray-700">${product.price || "0.00"}</p>
                {/* Display Product Quantity */}
                <p className="text-sm">Quantity: {item.quantity}</p>
              </div>
            </div>
          );
        })
      ) : (
        <p>Your cart is empty.</p>
      )}
      <Footers />
    </div>
  );
};

export default AddToCart;
