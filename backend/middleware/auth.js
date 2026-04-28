import jwt from "jsonwebtoken";

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization;

      if (!header) {
        return res.status(401).json({ msg: "No token" });
      }

      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Access denied" });
      }

      next();
    } catch (err) {
      res.status(401).json({ msg: "Invalid token" });
    }
  };
};

export default auth;
