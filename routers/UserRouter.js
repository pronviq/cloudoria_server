const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { body } = require("express-validator");
const ValidationMiddleware = require("../middlewares/ValidationMiddleware");
const SessionMiddleware = require("../middlewares/SessionMiddleware");

const Router = require("express").Router;

const router = new Router();

router.get("/refresh", SessionMiddleware, UserController.refresh);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.post(
  "/updatetheme",
  body("theme").isIn(["light", "dark"]),
  AuthMiddleware,
  ValidationMiddleware,
  UserController.updateTheme
);
router.post(
  "/registration",
  body("email").isEmail(),
  body("password").isLength({ min: 2, max: 32 }),
  body("username").notEmpty().isAlpha().isLength({ max: 32, min: 2 }),
  body("gender").isIn(["male", "female"]),
  ValidationMiddleware,
  UserController.registration
);

module.exports = router;
