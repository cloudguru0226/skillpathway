import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from 'helmet';

const app = express();

// Security middleware - only enable in production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow Vite scripts
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
} else {
  // Development - minimal security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP in development
    crossOriginEmbedderPolicy: false
  }));
}

// Trust proxy for AWS load balancer
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

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
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Production-ready server configuration
  const PORT = parseInt(process.env.PORT || '5000', 10);
  const HOST = '0.0.0.0'; // Always bind to all interfaces for container deployment
  
  server.listen(PORT, HOST, () => {
    log(`LMS serving on ${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    
    // Log important information for production
    if (process.env.NODE_ENV === 'production') {
      log('✅ Production mode enabled');
      log('✅ Health endpoint: /api/health');
      log('✅ Admin credentials: admin / admin123');
      log('✅ Security headers enabled');
      log('✅ Container ready for orchestration');
    }
  });
  
  // Graceful shutdown for container orchestration
  const shutdown = (signal: string) => {
    log(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
})();
