const { body } = require("express-validator");
const FileController = require("../controllers/FileController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const ValidationMiddleware = require("../middlewares/ValidationMiddleware");
const Router = require("express").Router;
const router = new Router();

router.get("/getfiles", AuthMiddleware, FileController.getFiles);
router.get("/getfavorites", AuthMiddleware, FileController.getFavorites);
router.get("/gettrash", AuthMiddleware, FileController.getTrash);
router.get("/getpreview/:file_id", FileController.getPreview);
router.get("/searchfiles", AuthMiddleware, FileController.searchFiles);

router.post(
  "/createdir",
  AuthMiddleware,
  body("name").isLength({ max: 128, min: 1 }),
  ValidationMiddleware,
  FileController.createDir
);
router.post("/uploadfile", AuthMiddleware, FileController.uploadFile);
router.post("/check", FileController.check);

router.delete("/deletefile", AuthMiddleware, FileController.deleteFile);

router.put("/changevalue", AuthMiddleware, FileController.changeValue);

module.exports = router;
