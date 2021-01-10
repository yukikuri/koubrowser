import { SupportCodecs } from '@/lib/const';

export class GameSetting {
  public zoom_factor: number = 1.0;
  public topmost: boolean = false;

  public capture_min_width: number = 1280;
  public capture_max_width: number = 1280;
  public capture_min_height: number = 720;
  public capture_max_height: number = 720;
  public capture_assist_width: number = 1800;
  public capture_assist_height: number = 960;

  public capture_codec: SupportCodecs = 'video/webm;codecs=vp9,opus';

  private assist_in_game: boolean = true;
  public assist_ok: boolean = true;

  public get isAssistInGame(): boolean {
    return this.assist_ok && this.assist_in_game;
  }

  public get assistInGame(): boolean {
    return this.assist_in_game;
  }

  public setAssistInGame(inGame: boolean): void {
    this.assist_in_game = inGame;
  }  
}

export class AppState {
  public main_window_handle: number = 0;
  public game_only_width: number = 0;
  public game_only_height: number = 0;
}

export class RendererState {
  public muted: boolean = false;
}
