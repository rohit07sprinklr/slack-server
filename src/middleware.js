import jwt from "jsonwebtoken";
import { secretKey } from "../utils/constants.js";
import "core-js";

export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  try {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        throw Error;
      }
      req.body.user = user;
      next();
    });
  } catch {
    res.status(401).send(JSON.stringify({ Error: "Invalid Token" }));
  }
};
