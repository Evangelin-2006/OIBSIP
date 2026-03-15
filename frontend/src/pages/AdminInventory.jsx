import { useEffect, useState } from "react";
import api from "../api";

export default function AdminInventory() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/init");
      console.log("Initialized inventory:", res.data);
      setInventory(res.data.inventory);
      setError(null);
    } catch (err) {
      console.error("Error initializing:", err);
      setError("Failed to initialize inventory");
    } finally {
      setLoading(false);
    }
  };

  const resetInventory = async () => {
    if (!window.confirm("This will delete all current inventory and reset to defaults. Continue?")) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/admin/reset-inventory");
      console.log("Reset inventory:", res.data);
      setInventory(res.data.inventory);
      setError(null);
      alert("Inventory reset successfully!");
    } catch (err) {
      console.error("Error resetting:", err);
      setError("Failed to reset inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/inventory");
      console.log("Full Inventory Response:", res.data);
      console.log("Inventory Object:", res.data.inventory);
      
      // Handle both response formats
      const inventoryData = res.data.inventory || res.data;
      console.log("Final Inventory Data:", inventoryData);
      console.log("Bases:", inventoryData?.bases);
      console.log("Sauces:", inventoryData?.sauces);
      
      setInventory(inventoryData);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(err.response?.data?.message || "Failed to fetch inventory");
      setInventory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const updateStock = async (category, name, newStock) => {
    try {
      await api.put("/inventory", {
        category,
        name,
        quantity: Number(newStock)
      });
      fetchInventory();
    } catch (err) {
      alert("Failed to update stock: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  if (loading) return <div style={styles.container}><h2>Loading inventory...</h2></div>;
  
  if (error && !inventory) return (
    <div style={styles.container}>
      <h2 style={{ color: "red" }}>⚠️ Error: {error}</h2>
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button style={styles.initBtn} onClick={initializeInventory}>
          Initialize Inventory
        </button>
        <button style={{ ...styles.initBtn, backgroundColor: "#f44336" }} onClick={resetInventory}>
          🔄 Reset Inventory
        </button>
      </div>
    </div>
  );
  
  if (!inventory) return (
    <div style={styles.container}>
      <h2>No inventory data available</h2>
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button style={styles.initBtn} onClick={initializeInventory}>
          🔄 Initialize Inventory
        </button>
        <button style={{ ...styles.initBtn, backgroundColor: "#f44336" }} onClick={resetInventory}>
          🔄 Reset Inventory
        </button>
      </div>
    </div>
  );

  // Check if items are empty and show reset option
  const allCategoriesEmpty = !inventory.bases?.length && 
                            !inventory.sauces?.length && 
                            !inventory.cheeses?.length && 
                            !inventory.veggies?.length && 
                            !inventory.meats?.length;

  const categories = [
    { key: "bases", label: " Pizza Bases" },
    { key: "sauces", label: " Sauces" },
    { key: "cheeses", label: " Cheeses" },
    { key: "veggies", label: " Vegetables" },
    { key: "meats", label: " Meats" }
  ];

  const THRESHOLD = 20;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1> Inventory Management</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={styles.refreshBtn} onClick={fetchInventory}>
            🔄 Refresh
          </button>
          {allCategoriesEmpty && (
            <button style={{ ...styles.refreshBtn, backgroundColor: "#f44336" }} onClick={resetInventory}>
              ⚠️ Reset Items
            </button>
          )}
        </div>
      </div>

      {allCategoriesEmpty && (
        <div style={{ 
          backgroundColor: "#fff3cd", 
          padding: "15px", 
          borderRadius: "5px", 
          marginBottom: "20px",
          border: "1px solid #ffc107"
        }}>
          <p><strong>⚠️ No inventory items found!</strong> Click "⚠️ Reset Items" to populate with defaults.</p>
        </div>
      )}

      
      <div style={styles.inventoryGrid}>
        {categories.map(cat => {
          const items = inventory[cat.key];
          console.log(`Category ${cat.key}:`, items);
          
          return (
            <div key={cat.key} style={styles.card}>
              <h2 style={styles.categoryTitle}>{cat.label}</h2>
              
              {items && items.length > 0 ? (
                items.map((item) => {
                  const isLowStock = item.stock < THRESHOLD;
                  return (
                    <div key={item._id || item.name} style={styles.itemRow}>
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={{
                          ...styles.stockBadge,
                          backgroundColor: isLowStock ? "#ff6b6b" : "#51cf66"
                        }}>
                          {item.stock} units
                        </span>
                        {isLowStock && <span style={styles.alert}>⚠️ Low Stock</span>}
                      </div>
                      
                      <div style={styles.inputGroup}>
                        <input
                          type="number"
                          min="0"
                          defaultValue={item.stock}
                          onBlur={(e) =>
                            updateStock(cat.key, item.name, e.target.value)
                          }
                          style={styles.input}
                        />
                        <button 
                          style={styles.updateBtn}
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            updateStock(cat.key, item.name, input.value);
                          }}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>No items in this category</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  },
  refreshBtn: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  },
  initBtn: {
    padding: "12px 24px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    marginTop: "20px"
  },
  inventoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  categoryTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    borderBottom: "2px solid #4CAF50",
    paddingBottom: "10px"
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    marginBottom: "10px",
    backgroundColor: "white",
    borderRadius: "5px",
    borderLeft: "4px solid #4CAF50"
  },
  itemInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1
  },
  itemName: {
    fontWeight: "bold",
    minWidth: "100px"
  },
  stockBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold"
  },
  alert: {
    color: "#ff6b6b",
    fontSize: "12px",
    fontWeight: "bold"
  },
  inputGroup: {
    display: "flex",
    gap: "8px"
  },
  input: {
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    width: "80px",
    fontSize: "14px"
  },
  updateBtn: {
    padding: "8px 12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
