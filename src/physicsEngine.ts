import { defaultStageHeight, defaultStageWidth, gravity, msRootFrame } from './consts'
import { playAnimationSpriteAt } from './StageAnimationSprites'
import {
  BodyData,
  Box,
  FramePriority,
  PlayerInput,
  PlayerInputMessage,
  PlayerInputMessageKey,
  PlayerInputQueue,
  Size,
} from './types'

import { frameInterval } from './appUtils'
import sounds, { hitSounds } from './sounds'
import { ceil, log, max, min, parse, random, stringify, values } from './utils'

// framePriority 0  t t
// framePriority 1  tf tf
// framePriority 2  tfff tfff
// framePriority 3  tfffffff tfffffff
// framePriority 4  tfffffffffffffff tfffffffffffffff
const validFramePriority = (framePriority: number, frame: number) => frame % frameInterval(framePriority) === 0

const frameCeil = (frame: number, framePriority: number) =>
  ceil(frame / frameInterval(framePriority)) * frameInterval(framePriority)

type PhysicsEngineFields = {
  boundary: Size
  initialBodies: BodyData[]
  bodies: BodyData[]
  msInitial: number
  playerInputQueue: PlayerInputQueue
  lastPlayerInputQueue: PlayerInputQueue
  lastFrame: number
  movingById: { [id: string]: boolean }
  fallingById: { [id: string]: boolean }
  onPlatformById: { [id: string]: boolean }
  rollbackLock: boolean
}

// frame priority slows down by a factor of 2
//
// millisecond intervals: 8, 16, 32, 64, 128, 256, 512, 1024
//
// 8    8    8    8    8    8    8    8
// 16        16        16        16
// 32                  32
// 64
//
// xy is the position
// speed, constant change in xy
// acceleration, constant change in speed
//
// a force changes the speed
// N-forces changes the acceleration
//
class PhysicsEngine {
  public _: PhysicsEngineFields

  constructor(_: Partial<PhysicsEngineFields>) {
    this._ = {
      boundary: { w: defaultStageWidth, h: defaultStageHeight },
      initialBodies: [],
      bodies: [],
      msInitial: Date.now(),
      playerInputQueue: [],
      lastPlayerInputQueue: [],
      lastFrame: -1,
      movingById: {},
      fallingById: {},
      onPlatformById: {},
      rollbackLock: false,
      ..._,
    }
    this._.initialBodies = _.initialBodies ?? this.snapshotBodies(this._.bodies)
    ;(window as any).rollback = this.rollback
    ;(window as any).getFrame = this.getFrame
    ;(window as any).playerInputQueue = this._.playerInputQueue
  }

  snapshotBodies = (bodies: BodyData[]): BodyData[] => parse(stringify(bodies))

  setBodies = (bodies: BodyData[]) => {
    this._.bodies = bodies
    this._.initialBodies = this.snapshotBodies(this._.bodies)
  }

  getBodies = () => this._.bodies

  deleteBodies = (destroyIds: string[]) => {
    this._.bodies = this._.bodies.filter(({ id }) => !destroyIds.includes(id))
  }

  checkRollback = () => {
    this._.playerInputQueue
  }

  rollback = () => {
    this._.rollbackLock = true
    const start = Date.now()

    this._.bodies = this.snapshotBodies(this._.initialBodies)
    this._.lastFrame = -1
    this._.movingById = {}
    this._.fallingById = {}
    this._.onPlatformById = {}

    this.fastForwardToFrame(this.getFrame())
    const time = Date.now() - start
    log(`rollback took ${time / 1000} seconds`)

    this._.rollbackLock = false
  }

  getFrame = (ms = Date.now()): number => {
    const msDiff = ms - this._.msInitial
    return ~~(msDiff / msRootFrame)
  }

  fireLocalInput = (playerId: string, input: PlayerInput) => {
    const frame = this.getFrame()
    const message = { playerId, frame, input }
    this._.playerInputQueue.push(message)
  }

  // in case the hashes of our queue and the latest input from outside our client don't match up
  upsertPlayerInputQueue = (incomingQueue: PlayerInputQueue) => {
    const playerInputQueue: PlayerInputQueue = parse(stringify(this._.playerInputQueue))

    const distinct: { [key in PlayerInputMessageKey]: PlayerInputMessage } = {}

    for (let i = 0; i < max(playerInputQueue.length, incomingQueue.length); i++) {
      const existingMessage = playerInputQueue[i]
      const incomingMessage = incomingQueue[i]

      if (existingMessage) {
        const key = `${existingMessage.frame}|${existingMessage.playerId}|${existingMessage.input}` as const
        distinct[key] = existingMessage
      }

      if (incomingMessage) {
        const key = `${incomingMessage.frame}|${incomingMessage.playerId}|${incomingMessage.input}` as const
        distinct[key] = incomingMessage
      }
    }

    return values(distinct)
  }

  private getPlayer = (playerId: string) => {
    return this._.bodies.find(({ id }) => id === playerId)
  }

  private processInputMessage = ({ playerId, frame, input }: PlayerInputMessage) => {
    const player = this.getPlayer(playerId)
    if (!player) return

    if (input === 'U') player.force.y = -5
    if (input === 'D') player.force.y = 5
    if (input === '-U' && player.force.y <= -1) player.force.y = 0
    if (input === '-D' && player.force.y >= 1) player.force.y = 0

    if (input === 'L') player.force.x = -999
    if (input === 'R') player.force.x = 999
    if (input === '-L' && player.force.x <= -1) player.force.x = 0
    if (input === '-R' && player.force.x >= 1) player.force.x = 0
  }

  private detectCollision = (a: Box, b: Box) => {
    // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#axis-aligned_bounding_box
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.h + a.y > b.y
  }

  private processFrame = (frame: number, framePriority: FramePriority): boolean => {
    let updated = false
    let destroyIds: string[] | undefined = undefined

    const boundaryBox: Box = { x: 0, y: 0, ...this._.boundary }

    for (const body of this._.bodies) {
      if (body.framePriority !== framePriority) continue
      if (body.static) continue

      let { id, x, y, w, h, force } = body

      for (const message of this._.playerInputQueue) {
        if (message.playerId !== id) continue

        const normalizedMessageFrame = frameCeil(message.frame, framePriority)
        if (normalizedMessageFrame !== frame) continue

        this.processInputMessage(message)
      }
      this._.lastPlayerInputQueue = this._.playerInputQueue

      const outOfBounds = !this.detectCollision(body, boundaryBox)
      if (outOfBounds) {
        if (!this._.rollbackLock) sounds.death.then(s => s.play())

        let rotateDeg = 0
        if (body.y >= boundaryBox.y + boundaryBox.h) rotateDeg = 0
        if (body.x >= boundaryBox.x + boundaryBox.w) rotateDeg = 90
        if (body.y < 0) rotateDeg = 180
        if (body.x < 0) rotateDeg = 270
        if (!this._.rollbackLock) playAnimationSpriteAt('knockout', body.x, body.y, { rotateDeg })

        if (!destroyIds) destroyIds = []
        destroyIds.push(id)
        updated = true

        continue
      }

      x += max(-1, min(1, force.x))
      y += max(-1, min(1, force.y || gravity))
      force.x = force.x < 0 ? force.x + 1 : force.x > 0 ? force.x - 1 : 0
      force.y = force.y < 0 ? force.y + 1 : force.y > 0 ? force.y - 1 : 0
      x = max(boundaryBox.x - 1, min(boundaryBox.w, x))
      y = max(boundaryBox.y - 1, min(boundaryBox.h, y))

      const tryMoving = x !== body.x || y !== body.y
      if (!tryMoving) continue

      const dir = x > body.x ? 1 : x < body.x ? -1 : body.dir
      const falling = y > body.y
      const turning = dir !== body.dir

      // if we attempt to move half the distance with AABB, we won't pass through w=0 or h=0 platforms
      const hesitantX = body.x + (x - body.x) / 2
      const hesitantY = body.y + (y - body.y) / 2

      const hesitantXYBodyBox = { x: hesitantX, y: hesitantY, w, h }
      const xyCollisionBodies = this._.bodies.filter(
        other => id !== other.id && this.detectCollision(hesitantXYBodyBox, other),
      )
      const xyOk = !xyCollisionBodies.length

      const hesitantXBodyBox = { x: hesitantX, y: body.y, w, h }
      const xCollisionBodies = this._.bodies.filter(
        other => id !== other.id && this.detectCollision(hesitantXBodyBox, other),
      )
      const xOk = !xCollisionBodies.length
      const xForcibleBodies = xCollisionBodies.filter(b => !b.static)
      const xDamaged = xForcibleBodies.length > 0

      const hesitantYBodyBox = { x: body.x, y: hesitantY, w, h }
      const yCollisionBodies = this._.bodies.filter(
        other => id !== other.id && this.detectCollision(hesitantYBodyBox, other),
      )
      const yOk = !yCollisionBodies.length
      const yForcibleBodies = yCollisionBodies.filter(b => !b.static)
      const yDamaged = yForcibleBodies.length > 0
      const onPlatform = yCollisionBodies.some(b => b.static)

      const dirUpdated = dir !== body.dir
      const xUpdated = x !== body.x
      const yUpdated = y !== body.y

      const moving = x !== body.x && xOk

      const startedLanding = id in this._.onPlatformById && !this._.onPlatformById[id] && onPlatform
      this._.onPlatformById[id] = onPlatform
      const startedMoving = id in this._.movingById && !this._.movingById[id] && moving
      this._.movingById[id] = moving
      const startedJumping = id in this._.fallingById && this._.fallingById[id] && !falling
      this._.fallingById[id] = falling
      const startedDashing = onPlatform && (startedMoving || turning)

      if (startedLanding) {
        if (!this._.rollbackLock) sounds.land.then(s => s.play())
        if (!this._.rollbackLock) playAnimationSpriteAt('land', body.x, body.y)
      }
      if (startedDashing) {
        if (!this._.rollbackLock) sounds.dash.then(s => s.play())
        if (!this._.rollbackLock) playAnimationSpriteAt('dash', hesitantX, body.y, { dir })
      }
      if (startedJumping) if (!this._.rollbackLock) sounds.jump.then(s => s.play())

      const hitSound = hitSounds[~~(random() * hitSounds.length)]!

      if (xDamaged) {
        for (const xForcibleBody of xForcibleBodies) {
          if (!this._.rollbackLock) sounds[hitSound].then(s => s.play())
          if (!this._.rollbackLock) playAnimationSpriteAt('hit', x, body.y)

          const knockback = 2 + max(1, ~~(xForcibleBody.damage / 15))
          xForcibleBody.force = { x: 0, y: -knockback }
          xForcibleBody.damage = min(999, xForcibleBody.damage + 5)
        }
      } else if (yDamaged) {
        for (const yForcibleBody of yForcibleBodies) {
          if (!this._.rollbackLock) sounds[hitSound].then(s => s.play())
          if (!this._.rollbackLock) playAnimationSpriteAt('hit', x, y)

          const knockback = 2 + max(1, ~~(yForcibleBody.damage / 15))
          yForcibleBody.force = { x: knockback * dir, y: 0 }
          yForcibleBody.damage = min(999, yForcibleBody.damage + 5)
        }
        if (falling) body.force.y = -5
      }

      if (xyOk && (xUpdated || yUpdated || dirUpdated)) {
        body.dir = dir
        body.x = x
        body.y = y
        updated = true
      } else if (xOk && (xUpdated || dirUpdated)) {
        body.dir = dir
        body.x = x
        updated = true
      } else if (yOk && (yUpdated || dirUpdated)) {
        body.y = y
        updated = true
      }

      // acceleration sets speed
      // speed sets xy

      // at most, bodies attempt to move 1 tile by force
      //
      // lower number frame priorities result in higher resolution tile movement by factors of 2
      // giving the effect that bodies can move multiple tiles at a time (without actually teleporting)

      // if g=9.81, it'd be our body's acceleration
      //
      // ironically, for most tile engines that I make and simulate gravity in,
      // it's actually used as velocity (not acceleration), so things fall at a constant speed
      // as opposed to a constant acceleration
      //
      // u + a*t = v
      // old_speed + acceleration x time = new_speed
      // time is always a constant of 1 frame in our process-physics loop
      //
      // t0: x=0 y=0 speed={x:0 y:1}
      // t1: x=0 y=1
      // t2: x=0 y=2
      // t3: x=0 y=3
      //
      //  t0: x=0 y=0 framePriority=7 speed={x:0 y:0} acceleration={x:0 y:1}
      //  t1: x=0 y=0 framePriority=7 speed={x:0 y:1}
      //  t2: x=0 y=1 framePriority=6 speed={x:0 y:2}
      //                                              (t2.5:  x=0 y=2 framePriority=6 speed={x:0 y:2})
      //  t3: x=0 y=3 framePriority=5 speed={x:0 y:4}
      //                                              (t3.25: x=0 y=4 framePriority=5 speed={x:0 y:4})
      //                                              (t3.5:  x=0 y=5 framePriority=5 speed={x:0 y:4})
      //                                              (t3.75: x=0 y=6 framePriority=5 speed={x:0 y:4})
      //  t4: x=0 y=7 framePriority=4 speed={x:0 y:8}
    }

    if (destroyIds?.length) this.deleteBodies(destroyIds)

    return updated
  }

  private processFrameWindow = (frames: [number, number]): boolean => {
    let updated = false

    const [start, end] = frames
    const framesAhead = end - start

    for (let f = 0; f < framesAhead; f++) {
      for (let framePriority = 0; framePriority < 8; framePriority++) {
        const frame = start + f

        if (!validFramePriority(framePriority, frame)) continue

        const newUpdates = this.processFrame(frame, framePriority as FramePriority)
        updated ||= newUpdates
      }
    }

    return updated
  }

  fastForwardToFrame = (frame: number) => {
    const updated = this.processFrameWindow([this._.lastFrame, frame])
    this._.lastFrame = frame
    return updated
  }

  fastForward = (ms = Date.now()) => {
    if (this._.rollbackLock) return false
    return this.fastForwardToFrame(this.getFrame(ms))
  }
}

export default PhysicsEngine
