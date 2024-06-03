const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { body } = require("express-validator");
const ValidationMiddleware = require("../middlewares/ValidationMiddleware");
const SessionMiddleware = require("../middlewares/SessionMiddleware");

const Router = require("express").Router;

const router = new Router();

router.get("/refresh", SessionMiddleware, UserController.refresh);
router.get("/getavatar", UserController.getAvatar);
router.get("/getsessions", AuthMiddleware, UserController.getSessions);
router.get("/terminate", AuthMiddleware, UserController.terminateSession);

router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.post("/uploadavatar", AuthMiddleware, UserController.uploadAvatar);
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
  body("password").isLength({ min: 2, max: 64 }),
  body("username").notEmpty().isAlpha().isLength({ max: 32, min: 2 }),
  body("gender").isIn(["male", "female"]),
  ValidationMiddleware,
  UserController.registration
);

router.put("/deleteaccount", AuthMiddleware, UserController.deleteAccount);
router.put(
  "/changeusername",
  AuthMiddleware,
  body("username").notEmpty().isAlpha().isLength({ max: 32, min: 2 }),
  ValidationMiddleware,
  UserController.changeUsername
);
router.put(
  "/changepassword",
  AuthMiddleware,
  body("newPassword").isLength({ min: 2, max: 32 }),
  ValidationMiddleware,
  UserController.changePassword
);
router.put(
  "/changeemail",
  AuthMiddleware,
  body("email").isEmail(),
  ValidationMiddleware,
  UserController.changeEmail
);

module.exports = router;
