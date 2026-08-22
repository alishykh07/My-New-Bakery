import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { connectDatabase } from './config/db.js';

// Server secrets live only in server/.env.
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const port = process.env.PORT || 5000;
connectDatabase()
  .then(() => app.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  });
