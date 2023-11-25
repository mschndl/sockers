import { SOCKET_ENDPOINT } from 'common/constants';
import { io } from 'socket.io-client';

const socket = io(SOCKET_ENDPOINT, {
  transports: ['websocket'],
  autoConnect: false,
});

export default socket;
