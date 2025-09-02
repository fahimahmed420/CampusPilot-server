require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const { verifyFirebaseToken } = require("./verifyToken");


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);
let db, usersCollection, transactionsCollection, classesCollection, scoresCollection, tasksCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("campusPilotDB");
    usersCollection = db.collection("users");
    transactionsCollection = db.collection("transactions");
    classesCollection = db.collection("classes");
    tasksCollection = db.collection("tasks");
    scoresCollection = db.collection("scores");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
connectDB();

/* ===========================
   USERS ROUTES
=========================== */
const usersRouter = express.Router();

// Create user (only if doesn’t exist)
usersRouter.post("/", async (req, res) => {
  try {
    const user = req.body;
    if (!user.uid) return res.status(400).json({ error: "UID required" });

    const existingUser = await usersCollection.findOne({ uid: user.uid });
    if (existingUser)
      return res.json({ message: "User already exists", user: existingUser });

    const result = await usersCollection.insertOne(user);
    res.json({ message: "User created ✅", userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
usersRouter.get("/", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by MongoDB _id
usersRouter.get("/id/:id", async (req, res) => {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
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
    res.json({
      success: true,
      transaction: { _id: result.insertedId, ...newTransaction },
    });
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
});

/* ===========================
   CLASSES ROUTES
=========================== */
const classesRouter = express.Router();

// Add class
classesRouter.post("/", async (req, res) => {
  try {
    const newClass = req.body;
    const result = await classesCollection.insertOne(newClass);
    res.json({ success: true, class: { _id: result.insertedId, ...newClass } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get classes by user UID
classesRouter.get("/", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "UID is required" });
    const userClasses = await classesCollection.find({ uid }).toArray();
    res.json(userClasses.map(cls => ({
      ...cls,
      id: cls._id.toString()
    })));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


/* ===========================
   SCORES ROUTES
=========================== */
const scoresRouter = express.Router();

// Save score
scoresRouter.post("/", async (req, res) => {
  try {
    const { uid, subject, difficulty, score, total, timeSpent } = req.body;
    if (!uid || !subject || total === undefined) {
      return res.status(400).json({ error: "UID, subject, and total are required" });
    }

    const newScore = {
      uid,
      subject,
      difficulty,
      score: Number(score),
      total: Number(total),
      timeSpent: Number(timeSpent || 0),
      date: new Date().toISOString(),
    };

    await scoresCollection.insertOne(newScore);

    // Fetch all scores for user
    const scores = await scoresCollection.find({ uid }).sort({ date: -1 }).toArray();
    const avgScore =
      scores.length > 0
        ? scores.reduce((acc, s) => acc + s.score, 0) / scores.length
        : 0;

    res.json({ success: true, records: scores, average: avgScore });
  } catch (err) {
    console.error("❌ Error saving score:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// Get all scores by user
scoresRouter.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const scores = await scoresCollection.find({ uid }).sort({ date: -1 }).toArray();

    // calculate average score
    const avgScore =
      scores.length > 0
        ? scores.reduce((acc, s) => acc + s.score, 0) / scores.length
        : 0;

    res.json({ scores, avgScore });
  } catch (err) {
    console.error("❌ Error fetching scores:", err.message);
    res.status(500).json({ error: err.message });
  }
});


/* ===========================
   TASKS ROUTES
=========================== */
const tasksRouter = express.Router();

// GET all tasks
tasksRouter.get("/", async (req, res) => {
  try {
    const tasks = await tasksCollection.find().toArray();
    res.json(tasks.map(task => ({ ...task, id: task._id.toString() })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST a new task
tasksRouter.post("/", async (req, res) => {
  try {
    const newTask = req.body;
    const result = await tasksCollection.insertOne(newTask);
    res.json({ ...newTask, id: result.insertedId.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update a task (status, etc.)
tasksRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a task
tasksRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await tasksCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



/* ===========================
   ROUTE MOUNTING
=========================== */
app.use("/api/users", verifyFirebaseToken, usersRouter);
app.use("/api/transactions", verifyFirebaseToken, transactionsRouter);
app.use("/api/classes", verifyFirebaseToken, classesRouter);
app.use("/api/scores", verifyFirebaseToken, scoresRouter);
app.use("/api/tasks", verifyFirebaseToken, tasksRouter);


/* ===========================
   SERVER START
=========================== */
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
