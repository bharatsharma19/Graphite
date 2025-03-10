// Importing express
import express from "express";

// Importing middleware
import { middleware } from "../middlewares/index";

// Importing functions from auth controller
import { createRoom, getRoom } from "../controllers/room";

// Creating express router
const router = express.Router();

// Defining routes
router.get("/:slug", getRoom);
router.post("/create", middleware, createRoom);

// Exporting router
export default router;
