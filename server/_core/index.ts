import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { stripe, handleWebhookEvent } from "../stripe";
import { ENV } from "./env";
import multer from "multer";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Stripe webhook route - MUST be before express.json() for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      
      if (!sig) {
        console.error("[Stripe Webhook] No signature header");
        return res.status(400).send("No signature header");
      }

      try {
        if (!stripe) {
          console.error("[Stripe Webhook] Stripe not initialized");
          return res.status(500).send("Stripe not initialized");
        }
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          ENV.stripeWebhookSecret
        );
        
        console.log(`[Stripe Webhook] Received event: ${event.type}`);
        
        const result = await handleWebhookEvent(event);
        res.json(result);
      } catch (err) {
        console.error("[Stripe Webhook] Error:", err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // File upload endpoint
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    },
  });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const ext = req.file.originalname.split(".").pop() || "jpg";
      const fileName = `${nanoid()}.${ext}`;
      
      // Save to client/public/products for local serving
      const fs = await import('fs/promises');
      const path = await import('path');
      const publicDir = path.join(process.cwd(), 'client', 'public', 'products');
      
      // Ensure directory exists
      await fs.mkdir(publicDir, { recursive: true });
      
      // Write file
      const filePath = path.join(publicDir, fileName);
      await fs.writeFile(filePath, req.file.buffer);

      // Return URL that serves from public folder
      const publicUrl = `/products/${fileName}`;
      res.json({ url: publicUrl, key: fileName });
    } catch (error) {
      console.error("[Upload] Error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });
  
  // Image proxy endpoint - serves images from storage with proper authentication
  app.get("/api/image/:key(*)", async (req, res) => {
    try {
      const key = req.params.key;
      if (!key) {
        return res.status(400).json({ error: "Missing image key" });
      }

      const { ENV } = await import('./env');
      const baseUrl = ENV.forgeApiUrl.replace(/\/+$/, '') + '/';
      
      // Use the Forge API download endpoint directly
      const downloadUrl = new URL('v1/storage/download', baseUrl);
      downloadUrl.searchParams.set('path', key);
      
      const imageResponse = await fetch(downloadUrl.toString(), {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      
      if (!imageResponse.ok) {
        console.error(`[Image Proxy] Failed to fetch image: ${imageResponse.status}`);
        return res.status(imageResponse.status).json({ error: "Failed to fetch image" });
      }

      // Set content type and caching headers
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      
      // Stream the image
      const buffer = await imageResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("[Image Proxy] Error:", error);
      res.status(500).json({ error: "Failed to get image" });
    }
  });

  // REST API endpoint for products
  app.get("/api/products", async (req, res) => {
    try {
      const { getAvailableProducts } = await import("../db");
      const products = await getAvailableProducts({ limit: 100 });
      res.json(products);
    } catch (error) {
      console.error("[Products API] Error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // REST API endpoint for single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { getProductById } = await import("../db");
      const product = await getProductById(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("[Product API] Error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
