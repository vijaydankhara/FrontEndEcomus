import React, { useState, useEffect } from "react";
import axios from "axios";
import Footers from "../components/Footer";

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [salesTax, setSalesTax] = useState(0.1); // 10% sales tax
  const [freeShipping, setFreeShipping] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("User token is missing");
          return;
        }

        const response = await axios.get(
          "http://localhost:1122/api/user/cart/getallcart",
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        setCartItems(response.data || []);
      } catch (error) {
        console.error(
          "Error fetching cart:",
          error.response?.data || error.message
        );
      }
    };

    fetchCartItems();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem("userToken");
      await axios.put(
        "http://localhost:1122/api/user/cart/updatecart",
        { quantity: newQuantity },
        {
          headers: { authorization: `Bearer ${token}` },
          params: { cartId: itemId },
        }
      );

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error(
        "Error updating quantity:",
        error.response?.data || error.message
      );
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem("userToken");
      await axios.delete("http://localhost:1122/api/user/cart/deletecart", {
        headers: { authorization: `Bearer ${token}` },
        params: { cartId: itemId },
      });

      setCartItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      );
    } catch (error) {
      console.error(
        "Error removing item:",
        error.response?.data || error.message
      );
    }
  };

  const calculateSubtotal = () =>
    cartItems.reduce(
      (total, item) => total + (item.cartItem?.price || 0) * item.quantity,
      0
    );

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * salesTax;
    const shipping = freeShipping ? 0 : 10; // Flat shipping fee
    return subtotal + tax + shipping - couponDiscount;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-200 text-center">
                  <th className="p-3 border border-gray-300">Item</th>
                  <th className="p-3 border border-gray-300">Title</th>
                  <th className="p-3 border border-gray-300">Quantity</th>
                  <th className="p-3 border border-gray-300">Price</th>
                  <th className="p-3 border border-gray-300">Total</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`border-t text-center ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3 border border-gray-300">
                      <img
                        src={item.cartItem?.images?.[0] || "/placeholder.jpg"}
                        className="w-16 h-16 object-cover mx-auto"
                        alt="Product"
                      />
                    </td>
                    <td className="p-3 border border-gray-300 text-center">
                      <div>
                        <p>{item.cartItem?.title || "No Title"}</p>
                      </div>
                    </td>
                    <td className="p-3 border border-gray-300">
                      <div className="flex items-center justify-center">
                        <button
                          className="px-2 py-1 bg-gray-300 rounded-l"
                          onClick={() =>
                            handleQuantityChange(
                              item._id,
                              Math.max(item.quantity - 1, 1)
                            )
                          }
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          className="px-2 py-1 bg-gray-300 rounded-r"
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-3 border border-gray-300 text-center">
                      ${item.cartItem?.price?.toFixed(2) || "0.00"}
                    </td>
                    <td className="p-3 border border-gray-300 text-center font-semibold text-green-700">
                      ${(item.cartItem?.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="p-3 border border-gray-300">
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-md">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax:</span>
                <span>${(calculateSubtotal() * salesTax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{freeShipping ? "Free" : "$10.00"}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Grand Total:</span>
                <span>${calculateGrandTotal().toFixed(2)}</span>
              </div>
              <button className="w-full bg-black text-white py-2 mt-4 rounded">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
      <Footers />
    </div>
  );
};

export default AddToCart;
