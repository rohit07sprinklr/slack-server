import jwt from "jsonwebtoken";
import { secretKey } from "../utils/constants.js";

export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      //   console.log(user);
      req.body.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
