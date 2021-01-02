import { desktopCapturer, DesktopCapturerSource } from 'electron';
import { gameSetting } from '@/renderer/store/gamesetting';
import { gameState } from '@/renderer/store/gamestate';
import { appState } from '@/global/appstate';
import EventEmitter from 'events'

const sourceOptions = () => {
  return {
    types: ['window'],
    thumbnailSize: { width: 0, height: 0, }
  };
}

const userMediaOptions = (source: DesktopCapturerSource): MediaStreamConstraints => {
  const width = gameSetting.assistInGame ? gameSetting.capture_assist_width : gameSetting.capture_min_width;
  const height = gameSetting.assistInGame ? gameSetting.capture_assist_height : gameSetting.capture_min_height;
  return {
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
        minWidth: width,
        maxWidth: width,
        minHeight: height,
        maxHeight: height,
      }
    }
  } as MediaStreamConstraints;
}

type Recorded = (buf: Buffer) => void;
class Recorder {
  private recorder: MediaRecorder;
  private chunks: Blob[] = [];
  private recorded: Recorded;

  constructor(stream: MediaStream, recorded: Recorded) {
    this.recorded = recorded;
    const options: MediaRecorderOptions = {
      mimeType: gameSetting.capture_codec
    };
    this.recorder = new MediaRecorder(stream, options);
    this.recorder.ondataavailable = (event) => this.onDataavailable(event);
    this.recorder.onstart = (event) => this.onStart(event);
    this.recorder.onstop = (event) => this.onStop(event);
    this.recorder.onerror = (event) => this.onError(event);
    console.log('recorder ready', stream);
  }

  private onDataavailable(event: BlobEvent): void {
    console.log('dataavailable', event, this.recorder.state, 'now len:', this.chunks.length);
    this.chunks.push(event.data);
  }

  private onStart(event: Event): void {
    console.log('start', event, this.recorder.state);
    gameState.recording_state = this.recorder.state;
  }

  private onStop(event: Event): void {
    console.log('stop', event, this.recorder.state, 'length:', this.chunks.length);
    gameState.recording_state = this.recorder.state;

    const chunks = this.chunks.concat();
    this.chunks = [];

    const fileReader = new FileReader()
    fileReader.addEventListener('load', (ev: ProgressEvent<FileReader>) => {
      console.log('loaded file reader');
      const buffer = Buffer.from((ev.target as FileReader).result as ArrayBuffer);
      this.recorded(buffer);
    });
    fileReader.readAsArrayBuffer(new Blob(chunks));
  }

  private onError(event: MediaRecorderErrorEvent): void {
    console.log('error', event, this.recorder.state);
  }

  public start() {
    console.log('recorder start stream active', this.recorder.stream.active);
    if (this.recorder.state !== 'recording') {
      // data save per msec.
      this.recorder.start(60000);
    }
  }

  public stop(): void {
    console.log('recorder stop');
    if (this.recorder.state === 'recording') {
      this.recorder.stop();
    }
  }
}

class RecorderStuff extends EventEmitter {
  private recorder: Recorder | undefined;
  private prepare_count: number = 0;

  constructor() {
    super();
  }

  public prepare(): void {
    console.log('recorder prepare', gameState.record_ready);
    if (gameState.record_ready === 'inprogress') {
      console.log('record stuff inprogress');
      return;
    }
    this.prepare_count = 0;
    gameState.record_ready = 'inprogress';
    this.prepare_stuff();
  }

  private prepare_stuff(): void {
    console.log('recorder prepare stuff', gameState.record_ready, 'count:', this.prepare_count);
    
    const handleErr = (stuff: RecorderStuff) => {
      gameState.record_ready = 'inprogress';
      if (stuff.prepare_count < 10) {
        setTimeout(() => {
          stuff.prepare_stuff();
        }, 500);
      } else {
        gameState.record_ready = 'inactive';
      }
    };

    desktopCapturer.getSources(sourceOptions()).then(async (sources: DesktopCapturerSource[]) => {
      //sources.forEach(s => console.log(s));
      const name = `window:${appState.main_window_handle}`;
      const source = sources.find(s => s.id.startsWith(name));
      console.log(name, source);
      if (!source) {
        gameState.record_ready = 'inactive';
        return;
      }
      navigator.mediaDevices.getUserMedia(userMediaOptions(source)).then((stream: MediaStream) => {
        gameState.record_ready = 'ready';
        this.recorder = new Recorder(stream, (buffer: Buffer) => {
          this.emit('recorded', buffer);
        });
      }).catch((err) => {
        this.prepare_count++;
        console.log('get user media error', this.prepare_count, err);
        handleErr(this);
      });
    }).catch((err) => {
      console.log('get source', err);
      handleErr(this);
    });
  }

  public start(): void {
    if (gameState.record_ready === 'ready' && gameState.recording_state !== 'recording') {
      this.recorder?.start();
    }
  }

  public stop(): void {
    if (gameState.recording_state === 'recording') {
      this.recorder?.stop();
    }
  }
}

export const recorderStuff = new RecorderStuff();
