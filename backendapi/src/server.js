import express from "express";
import cors from "cors";
import categoryRoutes from "./routes/category.js";
import menuRoutes from "./routes/menu.js";
import tableRoutes from "./routes/table.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend API is running"
    });
});

app.use("/api/categories", categoryRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/tables", tableRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});