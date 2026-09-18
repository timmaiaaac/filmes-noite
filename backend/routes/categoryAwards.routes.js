import express from "express";
import { getWinsByCategory } from "../controllers/categoryAwards.controller.js";

const router = express.Router();

router.get("/category-awards", getWinsByCategory);

export default router;