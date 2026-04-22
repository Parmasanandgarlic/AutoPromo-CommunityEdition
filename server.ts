import { bootstrap } from "./src/compiler/index.js";

// Launch the encapsulated compiler & API router
bootstrap().catch(err => {
  console.error("Failed to start AutoPROMO compiler:", err);
  process.exit(1);
});
