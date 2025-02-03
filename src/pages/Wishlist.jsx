import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ImSpinner3 } from "react-icons/im"; // For loading spinner

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("User token not found");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          "http://localhost:1122/api/user/wishlish/getallwishlish",
          { headers }
        );

        if (Array.isArray(response.data)) {
          setWishlist(response.data);
        } else {
          console.error("Invalid response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleAddToCart = async (productId, selectedColor, selectedSize) => {
    if (!selectedColor || !selectedSize) {
      toast.error("Please Select Color And Size.");
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("userToken");
      const headers = { authorization: `Bearer ${token}` };

      const response = await axios.post(
        "http://localhost:1122/api/user/cart/addtocart",
        {
          cartItem: productId,
          color: selectedColor,
          size: selectedSize,
        },
        {
          headers,
        }
      );

      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error(
        "Error adding product to cart:",
        error.response ? error.response.data : error.message
      );
      toast.error("Please try again!!!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const headers = { authorization: `Bearer ${token}` };

      const response = await axios.delete(
        `http://localhost:1122/api/user/wishlish/deletewishlish/${productId}`,
        { headers }
      );
      setWishlist(wishlist.filter((item) => item._id !== productId));
      toast.success("Product removed from wishlist.");
    } catch (error) {
      console.error(
        "Error removing product from wishlist:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to remove product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Wishlist</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <ImSpinner3 className="animate-spin text-4xl" />
        </div>
      ) : wishlist.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto min-w-max border-collapse shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Image</th>
                <th className="border px-3 py-2 text-left">Product Name</th>
                <th className="border px-3 py-2 text-left">Unit Price</th>
                <th className="border px-3 py-2 text-left">Sizes/Colors</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">
                    <img
                      src={item.cartItem?.images?.[0] || "/placeholder.jpg"}
                      alt={item.cartItem?.title || "Product image"}
                      className="w-16 h-16 object-cover mx-auto"
                    />
                  </td>
                  <td className="border px-3 py-2">{item.cartItem?.title}</td>
                  <td className="border px-3 py-2">
                    <s className="text-gray-500">
                      {item.cartItem?.originalPrice}
                    </s>{" "}
                    <span className="text-green-600 font-bold">
                      ${item.cartItem?.price}
                    </span>
                  </td>

                  <td className="border px-3 py-2 text-center">
                    <div className="space-x-2">
                      <select
                        className="px-2 py-1 border rounded"
                        onChange={(e) => setSelectedColor(e.target.value)}
                        value={selectedColor}
                      >
                        <option value="">Color</option>
                        {item.cartItem?.colors?.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                      <select
                        className="px-2 py-1 border rounded"
                        onChange={(e) => setSelectedSize(e.target.value)}
                        value={selectedSize}
                      >
                        <option value="">Size</option>
                        {item.cartItem?.sizes?.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <div className="space-x-2">
                      <button
                        className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                        onClick={() =>
                          handleAddToCart(
                            item.cartItem?._id,
                            selectedColor,
                            selectedSize
                          )
                        }
                      >
                        Add to Cart
                      </button>

                      <button
                        className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        onClick={() => handleRemoveFromWishlist(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No items in your wishlist.</p>
      )}
    </div>
  );
};

export default Wishlist;
