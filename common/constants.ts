import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const IP = process.env.EXPO_PUBLIC_IP || '192.168.178.21';
const PORT = process.env.EXPO_PUBLIC_PORT || 3000;

export const SOCKET_ENDPOINT = `http://${IP}:${PORT}`;
