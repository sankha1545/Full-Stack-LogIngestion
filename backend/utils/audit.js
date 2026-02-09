const prisma = require("./prisma");

exports.logAuthEvent = async (req, email, event) => {
  try {
    await prisma.authAuditLog.create({
      data: {
        email,
        event,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
  } catch (err) {
    console.error("Auth audit log failed:", err.message);
  }
};
