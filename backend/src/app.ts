import path from 'path';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
const envPath = path.resolve(__dirname, '../..', '.env');
dotenv.config({ path: envPath });
const port = process.env.EXPO_PUBLIC_PORT || 3000;

app.get('/', (req, res) => {
  res.send('🚀');
});

app.listen(port, () => {
  console.log(`Express server is listening at http://localhost:${port} 🚀`);
});
