import React, { useState, useEffect } from "react";
import axios from "axios";
import Footers from "../components/Footer";

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          "http://localhost:1122/api/user/cart/getallcart",
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );
        setCartItems(response.data || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.put(
        `http://localhost:1122/api/user/cart/update/${itemId}`,
        { quantity: newQuantity },
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.delete(
        `http://localhost:1122/api/user/cart/delete/${itemId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.cartItem?.price || 0) * item.quantity,
    0
  );

  if (loading) return <p>Loading cart items...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold mb-6">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center border border-gray-300 rounded-lg p-4 mb-4"
              >
                <img
                  src={item.cartItem?.images?.[0] || "default-image.jpg"}
                  alt={item.cartItem?.title || "Product"}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold">
                    {item.cartItem?.title || "No Title"}
                  </h3>
                  <p className="text-gray-600">
                    Price: ${item.cartItem?.price?.toFixed(2) || "N/A"}
                  </p>
                  <div className="flex items-center mt-2">
                    <button
                      className="px-2 py-1 border border-gray-400 rounded-md"
                      onClick={() => handleQuantityChange(item._id, Math.max(item.quantity - 1, 1))}
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      className="px-2 py-1 border border-gray-400 rounded-md"
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="ml-4 text-red-500 hover:underline"
                  onClick={() => handleRemoveItem(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="flex justify-between text-lg font-medium">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium mt-2">
              <span>Sales Tax (10%):</span>
              <span>${(subtotal * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total:</span>
              <span>${(subtotal * 1.1).toFixed(2)}</span>
            </div>
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Checkout
            </button>
            <div className="mt-6">
              <h4 className="font-semibold text-lg">Delivery Information:</h4>
              <p className="text-sm text-gray-700 mt-2">
                Standard Delivery is 2-4 working days. For faster delivery, upgrade to Next Day Delivery during checkout.
              </p>
            </div>
          </div>
        </div>
      )}
      <Footers />
    </div>
  );
};

export default AddToCart;
