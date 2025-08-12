import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Import seed functions
  const { createAdminUserIfNotExists } = await import('./admin-seed');
  const { seedDemoData } = await import('./seed-demo-data');
  const { seedComprehensiveData } = await import('./seed-comprehensive-data');
  
  const server = await registerRoutes(app);
  
  // Register enhanced routes for content management
  const { default: enhancedRoutes } = await import('./routes-enhanced');
  app.use('/api', enhancedRoutes);
  
  // Register content section management routes
  const { registerContentSectionRoutes } = await import('./routes/content-sections');
  registerContentSectionRoutes(app);
  
  // Register roadmap materials routes
  const { registerRoadmapMaterialRoutes } = await import('./routes/roadmap-materials');
  registerRoadmapMaterialRoutes(app);
  
  // Create admin user for demonstration
  await createAdminUserIfNotExists();
  console.log('Admin user setup completed. Use username: admin, password: admin123');
  
  // Seed comprehensive data including roadmaps, courses, and labs
  try {
    await seedComprehensiveData();
  } catch (error) {
    console.error('Error seeding comprehensive data:', error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
