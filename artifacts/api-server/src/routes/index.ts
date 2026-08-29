import { Router, type IRouter } from "express";
import healthRouter from "./health";
import materialsRouter from "./materials";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(materialsRouter);
router.use(storageRouter);

export default router;
