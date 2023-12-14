import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { MAXIMUM_PLAYERS_PER_LOBBY, PORT } from '../../common/constants';
import { Lobby, LobbyPlayer } from '../../common/types'; // FIXME: non e' bello per niente

const app = express();
const port = PORT;

app.get('/', (req, res) => {
  res.send('🚀');
});

const server = http.createServer(app);
const io = new Server(server);

const lobbies: Lobby[] = [
  { id: '0', name: 'Lobby 1', players: {} },
  { id: '1', name: 'Lobby 2', players: {} },
  { id: '4', name: 'Lobby 3', players: {} },
  { id: '3', name: 'Lobby 4', players: {} },
];

lobbies[2].players['0'] = {
  id: '0',
  isHost: true,
  ready: false,
  username: 'Pippo',
};

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

  socket.on('createRoom', (username) => {
    const roomId = uuidv4();
    const lobbyToAdd = {
      id: roomId,
      name: roomId,
      players: {
        [socket.id]: {
          id: socket.id,
          isHost: true,
          ready: false,
          username,
        },
      },
    };
    lobbies.push(lobbyToAdd);
    socket.emit('createRoomResponse', { success: true, roomId });
    socket.emit('becomeHost');
    socket.leave('lobbies');
    socket.join(roomId);
    io.to('lobbies').emit('lobbiesUpdate', lobbies);
  });

  socket.on('joinLobby', (lobbyId, username) => {
    const selectedLobby = lobbies.find((lobby) => lobby.id === lobbyId);
    if (selectedLobby) {
      const isJoinable =
        Object.keys(selectedLobby.players).length < MAXIMUM_PLAYERS_PER_LOBBY;
      if (isJoinable) {
        socket.leave('lobbies');
        socket.join(lobbyId);
        selectedLobby.players[socket.id] = {
          id: socket.id,
          isHost: Object.keys(selectedLobby.players).length === 0,
          ready: false,
          username,
        };
        socket.emit('joinLobbyResponse', { success: true });
        io.to('lobbies').emit('lobbiesUpdate', lobbies);
        io.to(lobbyId).emit('lobbyUpdate', selectedLobby);
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
      socket.emit('lobbyUpdate', lobby);
    } else {
      console.error(`Lobby ${lobbyID} not found.`);
    }
  });

  socket.on('leftLobby', (lobbyId) => {
    const selectedLobby = lobbies.find((lobby) => lobby.id === lobbyId);
    let wasHost;
    if (selectedLobby) {
      wasHost = selectedLobby?.players[socket.id].isHost;
      delete selectedLobby.players[socket.id];
      socket.leave(lobbyId);
      io.to(lobbyId).emit('lobbyUpdate', selectedLobby);
      if (Object.keys(selectedLobby.players).length === 0) {
        const lobbyIndex = lobbies.findIndex((lobby) => lobby.id === lobbyId);
        if (lobbyIndex !== -1) {
          lobbies.splice(lobbyIndex, 1);
        }
      } else {
        if (wasHost) {
          const playersArray: LobbyPlayer[] = Object.values(
            selectedLobby.players
          );
          const randomPlayer: LobbyPlayer =
            playersArray[Math.floor(Math.random() * playersArray.length)];
          randomPlayer.isHost = true;
        }
        io.to(lobbyId).emit('lobbyUpdate', selectedLobby);
      }
      io.to('lobbies').emit('lobbiesUpdate', lobbies);
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
