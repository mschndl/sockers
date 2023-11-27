export interface Lobby {
  id: string;
  name: string;
  players: { [pid: string]: LobbyPlayer };
}

export interface Player {
  id: string;
  isHost: boolean;
  username: string;
}

export interface LobbyPlayer extends Player {
  ready: boolean;
}

export interface JoinLobbyResponse {
  success: boolean;
  error: string;
}

export interface CreateLobbyResponse extends JoinLobbyResponse {
  roomId: string;
}
