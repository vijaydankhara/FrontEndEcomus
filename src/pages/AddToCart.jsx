import React, { useState, useEffect } from "react";
import axios from "axios";
import Footers from "../components/Footer";

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]); 
  const [loading, setLoading] = useState(true);   

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("userToken"); // Get token
        const response = await axios.get("http://localhost:1122/api/user/cart/getallcart", {
          headers: { authorization: `Bearer ${token}` }
        });
        const data = response.data;
        setCartItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartItems([]); 
      } finally {
        setLoading(false); 
      }
    };

    fetchCartItems();
  }, []);

  if (loading) {
    return <p>Loading cart items...</p>;  // Show loading message
  }

  return (
    <div>
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              {item.cartItem && item.cartItem.images && item.cartItem.images.length > 0 ? (
                <img src={item.cartItem.images[0]} alt={item.cartItem.title} width="100" />
              ) : (
                <p>No image available</p>
              )}
              <h3>{item.cartItem?.title || "No Title"}</h3>
              <p>Price: ${item.cartItem?.price ?? "N/A"}</p>
              <p>Quantity: {item.quantity ?? 1}</p>
            </div>
          ))}
        </div>
      )}
      <Footers />
    </div>
  );
};

export default AddToCart;
