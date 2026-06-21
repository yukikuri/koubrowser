export class GameState {
  public record_ready: 'not_initialized' | 'in_initialize' | 'initialized' = 'not_initialized'
  public recording_state: RecordingState = 'inactive'
  public muted: boolean = false
}

export class AppState {
  public media_source_id: string = ''
  public game_only_width: number = 0
  public game_only_height: number = 0
}
