import React, { useEffect, useState } from "react";
import axios from "axios";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Wishlist</h2>
      {loading ? (
        <p>Loading...</p>
      ) : wishlist.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Image</th>
              <th className="border px-4 py-2">Product Name</th>
              <th className="border px-4 py-2">Unit Price</th>
              <th className="border px-4 py-2">Stock Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.map((item) => (
              <tr key={item._id}>
                <td className="border px-4 py-2">
                  <img
                    src={item.cartItem?.images?.[0] || "/placeholder.jpg"}
                    alt={"Not Found"}
                    className="w-16 h-16 object-cover mx-auto"
                  />
                </td>
                <td className="border px-4 py-2">{item.cartItem?.title}</td>
                <td className="border px-4 py-2">
                  <s className="text-gray-500">{item.cartItem?.originalPrice}</s>{" "}
                  <span className="text-green-600 font-bold">
                    ${item.cartItem?.price}
                  </span>
                </td>
                <td className="border px-4 py-2">In Stock</td>
                <td className="border px-4 py-2 text-center space-x-2">
                  <button className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                    Add to Cart
                  </button>
                  <button className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items in your wishlist.</p>
      )}
    </div>
  );
};

export default Wishlist;
