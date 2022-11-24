import { keys } from './utils'

class MemoryStorage {
  protected memory: { [key: string]: any } = {}
  protected listeners: { [key: string]: Set<(value: any) => void> } = {}

  addEventListener = <T = any>(key: string, listener: (value: T) => void) => {
    if (!(key in this.listeners)) {
      this.listeners[key] = new Set()
    }
    this.listeners[key]!.add(listener)
  }

  removeEventListener = <T = any>(key: string, listener: (value: T) => void) => {
    this.listeners[key]?.delete(listener)

    if (this.listeners[key]?.size === 0) {
      delete this.listeners[key]
    }
  }

  protected clearEventListeners = (key: string) => {
    this.listeners[key]?.clear()
    delete this.listeners[key]
  }

  getItem = <T = any>(key: string): T | undefined => {
    return this.memory[key]
  }

  protected setItemWithoutEvent = <T = any>(key: string, value: T) => {
    this.memory[key] = value
  }

  protected fireEvent = <T = any>(key: string, value: T) => {
    this.listeners[key]?.forEach(listener => listener(value))
  }

  setItem = <T = any>(key: string, value: T) => {
    this.setItemWithoutEvent(key, value)
    this.fireEvent(key, value)
  }

  removeItem = (key: string) => {
    delete this.memory[key]
    this.clearEventListeners(key)
  }

  clear = () => {
    this.listeners = {}
    this.memory = {}
  }

  get length() {
    return keys(this.memory)
  }
}

export default MemoryStorage
