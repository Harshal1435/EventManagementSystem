import jwt from "jsonwebtoken";

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) return res.status(401).send("No token");

      const decoded = jwt.verify(token, "secret");
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).send("Forbidden");
      }

      next();
    } catch {
      res.status(401).send("Invalid token");
    }
  };
};

export default auth;