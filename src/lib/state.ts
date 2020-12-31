export class GameState {
  public record_ready: 'inactive' | 'inprogress' | 'ready' = 'inactive';
  public recording_state: RecordingState = 'inactive';
  constructor() {

  }
}
