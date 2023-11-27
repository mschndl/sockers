import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { MAXIMUM_PLAYERS_PER_LOBBY, PORT } from '../../common/constants';
import { Lobby } from '../../common/types'; // FIXME: non e' bello per niente

const app = express();
const port = PORT;

app.get('/', (req, res) => {
  res.send('🚀');
});

const server = http.createServer(app);
const io = new Server(server);

const lobbies: Lobby[] = [
  { id: '0', players: {} },
  { id: '1', players: {} },
  { id: '4', players: {} },
  { id: '3', players: {} },
];

lobbies[2].players['0'] = { id: '0', isHost: true, username: 'pippo' };

io.on('connection', (socket: Socket) => {
  console.log(`user ${socket.id} connected`);

  socket.on('enteredLobbiesRoom', () => {
    socket.join('lobbies');
    const lobbiesData = lobbies.map((lobby) => ({
      ...lobby,
      players: lobby.players,
    }));
    socket.emit('lobbiesUpdate', lobbiesData);
  });

  socket.on('getLobbiesData', () => {
    const lobbiesData = lobbies.map((lobby) => ({
      ...lobby,
      players: lobby.players,
    }));
    socket.emit('lobbiesUpdate', lobbiesData);
  });

  socket.on('createRoom', () => {
    const roomId = uuidv4();
    const lobbyToAdd = {
      id: roomId,
      players: {
        [socket.id]: { id: socket.id, isHost: true, username: 'Host' },
      },
    };
    lobbies.push(lobbyToAdd);
    socket.emit('createRoomResponse', { success: true, roomId });
    socket.leave('lobbies');
    socket.join(roomId);
    const lobbiesData = lobbies;
    io.to('lobbies').emit('lobbiesUpdate', lobbiesData);
  });

  socket.on('joinLobby', (lobbyId) => {
    const selectedLobby = lobbies.find((lobby) => lobby.id === lobbyId);
    if (selectedLobby) {
      const isJoinable =
        Object.keys(selectedLobby.players).length < MAXIMUM_PLAYERS_PER_LOBBY;
      if (isJoinable) {
        socket.leave('lobbies');
        socket.join(lobbyId);
        selectedLobby.players[socket.id] = {
          id: socket.id,
          isHost: false,
          username: 'Joiner',
        };
        socket.emit('joinLobbyResponse', { success: true });
        io.to('lobbies').emit('lobbiesUpdate', lobbies);
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
      const lobbyData = lobby;
      socket.emit('lobbyUpdate', lobbyData);
    } else {
      console.error(`Lobby ${lobbyID} not found.`);
    }
  });

  socket.on('leftLobby', (lobbyId) => {
    const selectedLobby = lobbies.find((lobby) => lobby.id === lobbyId);
    if (selectedLobby) {
      delete selectedLobby.players[socket.id];
      socket.leave(lobbyId);
      io.to(lobbyId).emit('lobbyUpdate', selectedLobby);
      const lobbiesData = lobbies;
      io.to('lobbies').emit('lobbiesUpdate', lobbiesData);
      if (Object.keys(selectedLobby.players).length === 0) {
        const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);
        if (lobbyIndex !== -1) {
          lobbies.splice(lobbyIndex, 1);
        }
        const updatedLobbiesData = lobbies;
        io.to('lobbies').emit('lobbiesUpdate', updatedLobbiesData);
      }
    } else {
      console.error(`Lobby ${lobbyId} not found.`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
