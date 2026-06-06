export class IntervalOneSec {
  private static nextId = 1

  private static callbacks = new Map<number, () => void>()

  private static timerId: number | undefined

  public static reg(callback: () => void): number {
    const id = this.nextId
    this.nextId += 1
    this.callbacks.set(id, callback)
    this.startTimerIfNeeded()
    return id
  }

  public static unreg(id: number): void {
    this.callbacks.delete(id)
    if (this.callbacks.size === 0) {
      this.stopTimer()
    }
  }

  private static startTimerIfNeeded(): void {
    if (this.timerId !== undefined) {
      return
    }
    this.timerId = window.setInterval(() => {
      const list = Array.from(this.callbacks.values())
      for (const callback of list) {
        callback()
      }
    }, 1000)
  }

  private static stopTimer(): void {
    if (this.timerId === undefined) {
      return
    }
    window.clearInterval(this.timerId)
    this.timerId = undefined
  }
}
