import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDataBase from "./Config/Database.js";
import Product from "./models/ProductModel.js";

dotenv.config();

const dummyImages = [
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1549419163-957134887b2b?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1518002171953-a080ee802e12?w=800&auto=format&fit=crop&q=60"
];

const categories = [
  { name: "Kohinoor", prefix: "KOH", count: 8 },
  { name: "FlossieExecutive", prefix: "FE", count: 6 },
  { name: "Safeera", prefix: "S", count: 6 },
  { name: "Velvet", prefix: "VEL", count: 8 },
];

const seedProducts = async () => {
  try {
    await connectDataBase();
    
    console.log("Cleaning existing products...");
    await Product.deleteMany({}); 
    console.log("Database cleaned.");

    const products = [];    
    const colors = ["#000000", "#ffffff", "#8B4513", "#1a365d", "#701a75", "#0f172a"];

    for (const cat of categories) {
      console.log(`Generating ${cat.name} products...`);
      for (let i = 1; i <= cat.count; i++) {
        const code = cat.name === "Velvet" 
          ? `${cat.prefix}-${String(i).padStart(2, "0")}`
          : `${cat.prefix}-${i}`;
        
        const isFav = Math.random() > 0.7; // 30% chance
        const isNew = Math.random() > 0.8; // 20% chance
        const price = Math.floor(Math.random() * (25000 - 8000) + 8000); // 8k to 25k
        const salePrice = Math.random() > 0.5 ? Math.floor(price * 0.85) : undefined; // 50% chance of sale
        
        products.push({
          name: `${cat.name} Luxury Collection ${i}`,
          code,
          category: cat.name,
          description: "Premium quality fabric with intricate embroidery and elegant design. Perfect for formal occasions and celebrations.",
          price,
          salePrice,
          images: [dummyImages[Math.floor(Math.random() * dummyImages.length)]],
          sizes: ["XS", "S", "M", "L", "XL"],
          colors: [colors[Math.floor(Math.random() * colors.length)], colors[Math.floor(Math.random() * colors.length)]],
          stock: Math.floor(Math.random() * 50) + 5,
          isCustomerFavorite: isFav,
          isNewArrival: isNew,
          isActive: true
        });
      }
    }

    await Product.insertMany(products);
    console.log("Seeding complete! Added " + products.length + " products.");
    process.exit();
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
