import { appState } from '@global/appstate'
import { gameSetting } from '@renderer/store/gamesetting'
import { gameState } from '@renderer/store/gamestate'

const userMediaOptions = (sourceId: string): MediaStreamConstraints => {
  const width = gameSetting.assistInGame
    ? gameSetting.capture_assist_width
    : gameSetting.capture_min_width
  const height = gameSetting.assistInGame
    ? gameSetting.capture_assist_height
    : gameSetting.capture_min_height
  return {
    preferCurrentTab: true,
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        minWidth: width,
        maxWidth: width,
        minHeight: height,
        maxHeight: height
      }
    }
  } as MediaStreamConstraints
}

const RecoringPerMSec = 2000

class Recorder {
  private recorder: MediaRecorder
  private isEnd: boolean = false

  constructor(stream: MediaStream) {
    const options: MediaRecorderOptions = {
      mimeType: gameSetting.capture_codec
    }
    this.recorder = new MediaRecorder(stream, options)
    this.recorder.ondataavailable = (event) => this.onDataavailable(event)
    this.recorder.onstart = (event) => this.onStart(event)
    this.recorder.onstop = (event) => this.onStop(event)
    this.recorder.onerror = (event) => this.onError(event)
    console.log('recorder ready', stream)
  }

  private async onDataavailable(event: BlobEvent) {
    console.log('recorder dataavailable', event, this.recorder.state)
    const buffer = await event.data.arrayBuffer()
    window.api.storeRec(Buffer.from(buffer), this.isEnd)
  }

  private onStart(event: Event): void {
    gameState.record_ready = 'initialized'
    console.log('recorder onstart', event, this.recorder.state)
    gameState.recording_state = this.recorder.state
  }

  private onStop(event: Event): void {
    console.log('recorder onstop', event, this.recorder.state)
    gameState.recording_state = this.recorder.state
  }

  private onError(event: Event): void {
    console.log('recorder error', event, this.recorder.state)
  }

  public start() {
    console.log('recorder start stream active', this.recorder.stream.active, this.recorder.state)
    if (this.recorder.state !== 'recording') {
      // data save per msec.
      this.isEnd = false
      this.recorder.start(RecoringPerMSec)
    }
  }

  public stop(): void {
    console.log('recorder stop')
    if (this.recorder.state === 'recording') {
      this.isEnd = true
      this.recorder.stop()
    }
  }
}

class RecorderStuffRenderer {
  private recorder: Recorder | undefined

  constructor() {
  }

  private setSource(sourceId: string): void {
    console.log('recorder renderer stuff set source id', sourceId)
    try {
      gameState.record_ready = 'in_initialize'
      navigator.mediaDevices
        .getUserMedia(userMediaOptions(sourceId))
        .then((stream: MediaStream) => {
          console.log('get user media ready', sourceId, stream)
          this.recorder = new Recorder(stream)
          this.recorder.start()
        })
        .catch((err) => {
          console.log('set source in get user media', err)
          gameState.record_ready = 'not_initialized'
        })
    } catch (err) {
      console.log('set source', err)
      gameState.record_ready = 'not_initialized'
    }
  }

  public start(): void {
    if (gameState.record_ready === 'initialized') {
      if (gameState.recording_state !== 'recording') {
        this.recorder!.start()
      }
    } else {
      this.setSource(appState.media_source_id)
    }
  }

  public stop(): void {
    if (gameState.recording_state === 'recording') {
      this.recorder?.stop()
    }
  }
}

export const recorderStuffRenderer = new RecorderStuffRenderer()
