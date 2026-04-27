import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDataBase from "./Config/Database.js";
import Product from "./models/ProductModel.js";

dotenv.config();

const BASE_URL = process.env.BASE_URL;

const categoryImages = {
  Kohinoor: [
    `${BASE_URL}/uploads/koh-01.webp`,
    `${BASE_URL}/uploads/koh-02.webp`,
    `${BASE_URL}/uploads/koh-03.webp`,
    `${BASE_URL}/uploads/koh-04.webp`,
    `${BASE_URL}/uploads/kohtwo-01.webp`,
    `${BASE_URL}/uploads/kohtwo-02.webp`,
    `${BASE_URL}/uploads/kohtwo-03.webp`,
    `${BASE_URL}/uploads/kohtwo-04.webp`,
  ],
  Dastaan: [
    `${BASE_URL}/uploads/DA-1.webp`,
    `${BASE_URL}/uploads/DA-02.webp`,
    `${BASE_URL}/uploads/DA-03.webp`,
    `${BASE_URL}/uploads/DA-04.webp`,
    `${BASE_URL}/uploads/DAtwo-1.webp`,
    `${BASE_URL}/uploads/DAtwo-02.webp`,
    `${BASE_URL}/uploads/DAtwo-03.webp`,
    `${BASE_URL}/uploads/Datwo-04.jpg`,
  ],
  FlossieExecutive: [
    `${BASE_URL}/uploads/DAtwo-03.webp`,
    `${BASE_URL}/uploads/DA-03.webp`,
  ],
  Safeera: [`${BASE_URL}/uploads/DA-03.webp`, `${BASE_URL}/uploads/DA-02.webp`],
  Velvet: [
    `${BASE_URL}/uploads/kohtwo-04.webp`,
    `${BASE_URL}/uploads/koh-03.webp`,
  ],
};

const customerFavImages = [
  `${BASE_URL}/uploads/comfav-01.webp`,
  `${BASE_URL}/uploads/comfav-02.webp`,
  `${BASE_URL}/uploads/comfav-03.webp`,
  `${BASE_URL}/uploads/comfav-04.webp`,
  `${BASE_URL}/uploads/comfavtwo-01.webp`,
  `${BASE_URL}/uploads/comfavtwo-02.webp`,
  `${BASE_URL}/uploads/comfavtwo-03.webp`,
  `${BASE_URL}/uploads/comfavtwo-04.webp`,
];

const categories = [
  { name: "Kohinoor", prefix: "KOH", count: 20 },
  { name: "FlossieExecutive", prefix: "FE", count: 20 },
  { name: "Safeera", prefix: "SAF", count: 20 },
  { name: "Velvet", prefix: "VEL", count: 20 },
  { name: "Dastaan", prefix: "DAS", count: 20 },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Black", "White", "Maroon", "Navy", "Emerald", "Gold", "Beige"];

const getImages = (categoryName, isFav) => {
  if (isFav && customerFavImages.length > 0) {
    const shuffled = [...customerFavImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }

  const imgs = categoryImages[categoryName];
  if (imgs && imgs.length > 0) {
    const shuffled = [...imgs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }

  return [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60",
  ];
};

const seedProducts = async () => {
  try {
    await connectDataBase();

    console.log("  Cleaning existing products...");
    await Product.deleteMany({});
    console.log(" Database cleaned.");

    const products = [];

    for (const cat of categories) {
      console.log(`  Generating ${cat.count} ${cat.name} products...`);

      for (let i = 1; i <= cat.count; i++) {
        const isFav = Math.random() > 0.7;
        const isNew = Math.random() > 0.8;
        const price = Math.floor(Math.random() * (25000 - 8000) + 8000);
        const hasSale = Math.random() > 0.5;
        const salePrice = hasSale ? Math.floor(price * 0.85) : null;

        products.push({
          name: `${cat.name} Luxury Collection ${i}`,
          code: `${cat.prefix}-${String(i).padStart(3, "0")}`,
          category: cat.name,
          description:
            "Premium quality fabric with intricate embroidery and elegant design. Perfect for formal occasions and celebrations.",
          price,
          salePrice,
          images: getImages(cat.name, isFav),
          sizes: sizes.slice(0, Math.floor(Math.random() * 4) + 2),
          colors: colors.slice(0, Math.floor(Math.random() * 3) + 1),
          stock: Math.floor(Math.random() * 50) + 5,
          isCustomerFavorite: isFav,
          isNewArrival: isNew,
        });
      }
    }

    await Product.insertMany(products);
    console.log(`\n Seeding complete! ${products.length} products added.`);
    categories.forEach((c) => console.log(`   ${c.name}: ${c.count} products`));
    process.exit(0);
  } catch (error) {
    console.error(" Seed error:", error);
    process.exit(1);
  }
};

seedProducts();
