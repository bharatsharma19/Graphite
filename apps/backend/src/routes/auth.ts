// Importing express
import express from "express";

// Importing functions from auth controller
import { register, login } from "../controllers/auth";

// Creating express router
const router = express.Router();

// Register & Login Routes
router.post("/register", register);
router.post("/login", login);

// Exporting router
export default router;
