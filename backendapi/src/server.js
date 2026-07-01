import express from "express";
import cors from "cors";
import categoryRoutes from "./routes/category.js";
import menuRoutes from "./routes/menu.js";
import tableRoutes from "./routes/table.js";
import ordersRoutes from "./routes/orders.js";
import orderItemRoutes from "./routes/order-item.js";

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
app.use("/api/orders", ordersRoutes);
app.use("/api", orderItemRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});