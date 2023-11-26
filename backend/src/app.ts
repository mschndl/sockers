import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { MAXIMUM_PLAYERS_PER_LOBBY, PORT } from '../../common/constants';
import { v4 as uuidv4 } from 'uuid';
const app = express();
const port = PORT;

app.get('/', (req, res) => {
  res.send('🚀');
});

const server = http.createServer(app);
const io = new Server(server);

const lobbies = [
  { id: '0', players: new Map() },
  { id: '1', players: new Map() },
  { id: '4', players: new Map() },
  { id: '3', players: new Map() },
];

lobbies[2].players.set('0', { id: '0', username: 'pippo' });

io.on('connection', (socket: Socket) => {
  console.log(`user ${socket.id} connected`);

  socket.on('enteredLobbiesRoom', () => {
    socket.join('lobbies');
    const lobbiesData = lobbies.map((lobby) => ({
      ...lobby,
      players: Object.fromEntries(lobby.players),
    }));
    socket.emit('lobbiesUpdate', lobbiesData);
  });

  socket.on('getLobbiesData', () => {
    const lobbiesData = lobbies.map((lobby) => ({
      ...lobby,
      players: Object.fromEntries(lobby.players),
    }));
    socket.emit('lobbiesUpdate', lobbiesData);
  });

  socket.on('createRoom', () => {
    // Your logic to create a room
    const roomId = uuidv4(); //... (generate a unique room ID)
    // Notify the client about the result
    const lobbyToAdd = { id: roomId, players: new Map() };
    lobbyToAdd.players.set(socket.id, {
      id: socket.id,
      username: 'Host',
    });
    lobbies.push(lobbyToAdd);
    socket.emit('createRoomResponse', { success: true, roomId });
    socket.leave('lobbies');
    socket.join(roomId);
    const lobbiesData = lobbies.map((lobby) => ({
      ...lobby,
      players: Object.fromEntries(lobby.players),
    }));
    io.to('lobbies').emit('lobbiesUpdate', lobbiesData);
  });

  socket.on('joinLobby', ({ lobbyId }) => {
    const selectedLobby = lobbies.find((lobby) => lobby.id === lobbyId);
    if (selectedLobby) {
      const isJoinable = selectedLobby.players.size < MAXIMUM_PLAYERS_PER_LOBBY;
      if (isJoinable) {
        socket.leave('lobbies');
        socket.join(lobbyId);
        selectedLobby.players.set(socket.id, {
          id: socket.id,
          username: 'Joiner',
        });
        socket.emit('joinLobbyResponse', { success: true });
      } else {
        socket.emit('joinLobbyResponse', {
          success: false,
          error: 'The lobby is not joinable for some reason.',
        });
      }
    } else {
      socket.emit('joinLobbyResponse', {
        success: false,
        error: 'Lobby not found.',
      });
    }
  });

  socket.on('getLobbyData', (lobbyID) => {
    const lobby = lobbies.find((lobby) => lobby.id === lobbyID);
    if (lobby) {
      const lobbyData = {
        ...lobby,
        players: Object.fromEntries(lobby.players),
      };
      socket.emit('lobbyUpdate', lobbyData);
    } else {
      // Handle the case where the lobby is not found
      console.error(`Lobby ${lobbyID} not found.`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
