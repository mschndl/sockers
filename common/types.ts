export interface Lobby {
  id: string;
  players: { [pid: string]: Player };
}

export interface Player {
  id: string;
  username: string;
}

export interface JoinLobbyResponse {
  success: boolean;
  error: string;
}

export interface CreateLobbyResponse extends JoinLobbyResponse {
  roomId: string;
}
