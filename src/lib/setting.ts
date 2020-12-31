import { SupportCodecs } from '@/lib/const';
import { ApiDispSeiku, ApiFormations } from '@/lib/kcs';

export class GameSetting {
  public muted: boolean = false;
  public zoom_factor: number = 1.0;
  public topmost: boolean = false;

  public capture_min_width: number = 1280;
  public capture_max_width: number = 1280;
  public capture_min_height: number = 720;
  public capture_max_height: number = 720;
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

  // assist <-> mainframe 
  public medals: number = 0;
  public fual: number = NaN;
  public bull: number = NaN;
  public steel: number = NaN;
  public buxite: number = NaN;
  public fast_build: number = NaN;
  public fast_repair: number = NaN;
  public build_kit: number = NaN;
  public remodel_kit: number = NaN;
  public ship_count: number = NaN;
  public slotitem_count: number = NaN;
  public max_ship_count: number = NaN;
  public max_slotitem_count: number = NaN;

  public inMap: boolean = false;
  public maparea_id: number = NaN;
  public mapinfo_no: number = NaN;
  public mapname: string = '';
  public mapcell_labels: string[] = [];
  public disp_seiku: ApiDispSeiku | null = null;
  public formations: ApiFormations | null = null;

  
}

export class AppState {
  public main_window_handle: number = 0;
  public game_only_width: number = 0;
  public game_only_height: number = 0;
}
