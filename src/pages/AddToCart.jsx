import React, { useState, useEffect } from "react";
import axios from "axios";
import Footers from "../components/Footer";

const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [salesTax, setSalesTax] = useState(0.1); // Assume 10% sales tax
  const [freeShipping, setFreeShipping] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0); // Store coupon discount

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
      console.error("Error updating quantity:", error.response?.data || error.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem("userToken");
      await axios.delete("http://localhost:1122/api/user/cart/deletecart", {
        headers: { authorization: `Bearer ${token}` },
        params: { cartId: itemId },
      });

      setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Error removing item:", error.response?.data || error.message);
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
    const shipping = freeShipping ? 0 : 10; // Flat shipping fee if not free
    return subtotal + tax + shipping - couponDiscount; // Subtract coupon discount
  };

  const applyCoupon = () => {
    // For demonstration, reduce $100 if any coupon code is entered
    if (couponCode) {
      setCouponDiscount(100);
      alert("Coupon applied! $100 discount added.");
    } else {
      setCouponDiscount(0);
      alert("No coupon code entered.");
    }
  };

  useEffect(() => {
    const subtotal = calculateSubtotal();
    setFreeShipping(subtotal > 100); // Free shipping for orders over $100
  }, [cartItems]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border border-gray-300 p-2">Item</th>
                <th className="border border-gray-300 p-2">Title</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Price</th>
                <th className="border border-gray-300 p-2">Subtotal</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-2 border border-gray-300">
                    <img
                      src={item.cartItem?.images?.[0] || "/placeholder.jpg"}
                      className="w-16 h-16 object-cover"
                      alt="Product"
                    />
                  </td>
                  <td className="p-2 border border-gray-300">
                    {item.cartItem?.title || "No Title"}
                  </td>
                  <td className="p-2 border border-gray-300">
                    <div className="flex items-center">
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
                      <span className="px-4">{item.quantity}</span>
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
                  <td className="p-2 border border-gray-300">
                    ${item.cartItem?.price?.toFixed(2) || "0.00"}
                  </td>
                  <td className="p-2 border border-gray-300">
                    ${(item.cartItem?.price * item.quantity).toFixed(2)}
                  </td>
                  <td className="p-2 border border-gray-300">
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 p-4 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Sales Tax:</span>
              <span>${(calculateSubtotal() * salesTax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Coupon Code:</span>
              <button
                className="text-blue-500 hover:underline"
                onClick={applyCoupon} // Apply the coupon on click
              >
                Apply Coupon
              </button>
            </div>
            <div className="flex justify-between items-center mt-4 font-bold text-lg">
              <span>Grand Total:</span>
              <span>${calculateGrandTotal().toFixed(2)}</span>
            </div>
            {freeShipping && (
              <div className="mt-2 text-green-500 text-sm">
                Congrats, you're eligible for <span className="font-bold">Free Shipping</span>.
              </div>
            )}
            <button
              className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
              onClick={() => alert("Proceed to checkout!")}
            >
              Check out
            </button>
          </div>
        </div>
      )}
      <Footers />
    </div>
  );
};

export default AddToCart;
