import authRoutes from "./auth.js";
import oauthRoutes from "./oauth.js";
import contactRoutes from "./contact.js";
import geoRoutes from "./geo.js";
import logRoutes from "./logs.js";
import cliRoutes from "./cli.js";
import profileRoutes from "./profile.js";

export default function registerRoutes(app) {
  // Auth & OAuth
  app.use("/api/auth", authRoutes);
  app.use("/api/oauth", oauthRoutes);

  // Public / semi-public
  app.use("/api/contact", contactRoutes);
  app.use("/api/geo", geoRoutes);

  // Logs & CLI ingestion
  app.use("/api/logs", logRoutes);
  app.use("/api/cli", cliRoutes);

  // ✅ User profile (protected)
  app.use("/api/profile", profileRoutes);
}
