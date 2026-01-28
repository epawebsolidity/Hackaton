import app from "./app";
import db from "./models";

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await db.sequelize.sync({ force: false });
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to sync database:", err);
  }
}

startServer();
