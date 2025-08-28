require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);
let db, usersCollection, transactionsCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("campusPilotDB");
    usersCollection = db.collection("users");
    transactionsCollection = db.collection("transactions");

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
connectDB();

/* ===========================
   USERS ROUTES
=========================== */
const usersRouter = express.Router();

// Create user
usersRouter.post("/", async (req, res) => {
  try {
    const user = req.body;
    const existingUser = await usersCollection.findOne({ uid: user.uid });
    if (existingUser) return res.json({ message: "User already exists", user: existingUser });

    const result = await usersCollection.insertOne(user);
    res.json({ message: "User created ✅", userId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all users
usersRouter.get("/", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get user by MongoDB _id
usersRouter.get("/:id", async (req, res) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get user by Firebase UID
usersRouter.get("/uid/:uid", async (req, res) => {
  try {
    const user = await usersCollection.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   TRANSACTIONS ROUTES
=========================== */
const transactionsRouter = express.Router();

// Add a transaction
transactionsRouter.post("/", async (req, res) => {
  try {
    const { uid, type, category, amount, note, date } = req.body;
    if (!uid) return res.status(400).json({ error: "User UID required" });

    const newTransaction = {
      uid,
      type, // "income" | "expense"
      category,
      amount: Number(amount),
      note,
      date: date || new Date().toISOString(),
    };

    const result = await transactionsCollection.insertOne(newTransaction);
    res.json({ success: true, transaction: { _id: result.insertedId, ...newTransaction } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions for a user
transactionsRouter.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const transactions = await transactionsCollection
      .find({ uid })
      .sort({ date: -1 })
      .toArray();
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   ROUTE MOUNTING
=========================== */
app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);

/* ===========================
   SERVER START
=========================== */
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
