// Importing express
import express from "express";

// Importing functions from auth controller
import { getChats } from "../controllers/chat";

// Creating express router
const router = express.Router();

// Defining routes
router.get("/chats/:roomId", getChats);

// Exporting router
export default router;
