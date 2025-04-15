import { MongoClient, ServerApiVersion } from "mongodb";
import { products } from "./products.js";

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function init() {
  try {
    await client.connect();

    const db = client.db("sleepoutside");
    // console.log(db.databaseName);
    // initialize the Products collection
    await seedProducts(db);
  } catch (e) {
    console.error(e);
  }
}

const lowerCaseKeys = function (obj) {
  // if it is an object, but NOT an array, then we need to iterate through all of its keys
  if (typeof obj === "object" && !Array.isArray(obj)) {
    for (let key in obj) {
      // take the first letter (key[0]) of the key and make it lowercase
      // then add that to the rest of the key after REMOVING the first letter (key.slice(1))
      let newKey = key[0].toLowerCase() + key.slice(1);
      // if the value of this key is an object, then we need to call this function again
      if (typeof obj[key] === "object") {
        obj[newKey] = lowerCaseKeys(obj[key]);
        delete obj[key];
      } else {
        obj[newKey] = obj[key];
        delete obj[key];
      }
    }
  } else if (Array.isArray(obj)) {
    // if it is an array, then we need to iterate through each item in the array
    // and for each object value call the function again.
    for (let i = 0; i < obj.length; i++) {
      let item = obj[i];
      if (typeof item === "object") {
        obj[i] = lowerCaseKeys(item);
      }
    }
  }
  return obj;
};

// Create a function called seedProducts and pass in the db object as an argument. Add the code to drop and add a new collection called products in that function.
const seedProducts = async (db) => {
  console.log("hello");
  const newProducts = products.map((product) => {
    product.Reviews.ReviewsUrl = `/products/${product.Id}/reviews/`;
    product = lowerCaseKeys(product);
    return product;
  });

  try {
    // drop the collection to clear out the old records
    await db.collection("products").drop();
    console.log("Collection 'products' dropped successfully");

    // create a new collection
    await db.createCollection("products");
    console.log("Collection 'products' created successfully");

    // insert all products
    const result = await db.collection("products").insertMany(newProducts);

    console.log(
      `${result.insertedCount} new listing(s) created with the following id(s):`
    );
    console.log(result.insertedIds);
  } catch (error) {
    console.error(error.message);
  }
};

init();
