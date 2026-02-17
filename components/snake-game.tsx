"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Position {
  x: number
  y: number
}

interface SnakeGameProps {
  gamepadIndex?: number
  onScoreChange: (score: number) => void
  active: boolean
}

const BOARD_SIZE = 20
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION: Position = { x: 0, y: -1 }

function isSamePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

function isOppositeDirection(current: Position, next: Position): boolean {
  return current.x + next.x === 0 && current.y + next.y === 0
}

function getRandomFood(snake: Position[]): Position {
  let candidate: Position = { x: 0, y: 0 }
  let valid = false

  while (!valid) {
    candidate = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    }
    valid = !snake.some((segment) => isSamePosition(segment, candidate))
  }

  return candidate
}

export function SnakeGame({ gamepadIndex, onScoreChange, active }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const setDirectionSafe = useCallback((next: Position) => {
    setDirection((prev) => (isOppositeDirection(prev, next) ? prev : next))
  }, [])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setGameOver(false)
    setScore(0)
    setGameStarted(true)
    onScoreChange(0)
    setFood(getRandomFood(INITIAL_SNAKE))
  }, [onScoreChange])

  const checkGamepadInput = useCallback(() => {
    if (typeof gamepadIndex === "undefined") return

    const gamepad = navigator.getGamepads()[gamepadIndex]
    if (!gamepad) return

    if (gamepad.buttons[12]?.pressed) {
      setDirectionSafe({ x: 0, y: -1 })
    } else if (gamepad.buttons[13]?.pressed) {
      setDirectionSafe({ x: 0, y: 1 })
    } else if (gamepad.buttons[14]?.pressed) {
      setDirectionSafe({ x: -1, y: 0 })
    } else if (gamepad.buttons[15]?.pressed) {
      setDirectionSafe({ x: 1, y: 0 })
    }

    const leftX = gamepad.axes[0] ?? 0
    const leftY = gamepad.axes[1] ?? 0

    if (Math.abs(leftX) > 0.55 || Math.abs(leftY) > 0.55) {
      if (Math.abs(leftX) > Math.abs(leftY)) {
        setDirectionSafe(leftX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 })
      } else {
        setDirectionSafe(leftY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 })
      }
    }

    if (gamepad.buttons[0]?.pressed && (gameOver || !gameStarted)) {
      resetGame()
    }
  }, [gamepadIndex, gameOver, gameStarted, resetGame, setDirectionSafe])

  useEffect(() => {
    if (!active) return

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault()
          setDirectionSafe({ x: 0, y: -1 })
          break
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault()
          setDirectionSafe({ x: 0, y: 1 })
          break
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault()
          setDirectionSafe({ x: -1, y: 0 })
          break
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault()
          setDirectionSafe({ x: 1, y: 0 })
          break
        case " ":
        case "Enter":
          if (gameOver || !gameStarted) {
            event.preventDefault()
            resetGame()
          }
          break
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active, gameOver, gameStarted, resetGame, setDirectionSafe])

  useEffect(() => {
    if (!active) return

    const gamepadInterval = window.setInterval(checkGamepadInput, 90)
    return () => window.clearInterval(gamepadInterval)
  }, [active, checkGamepadInput])

  useEffect(() => {
    if (!active || !gameStarted || gameOver) return

    const gameInterval = window.setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0]
        const newHead = { x: head.x + direction.x, y: head.y + direction.y }

        if (newHead.x < 0 || newHead.x >= BOARD_SIZE || newHead.y < 0 || newHead.y >= BOARD_SIZE) {
          setGameOver(true)
          return currentSnake
        }

        if (currentSnake.some((segment) => isSamePosition(segment, newHead))) {
          setGameOver(true)
          return currentSnake
        }

        const grew = isSamePosition(newHead, food)
        const nextSnake = [newHead, ...currentSnake]

        if (!grew) {
          nextSnake.pop()
        } else {
          const newScore = score + 10
          setScore(newScore)
          onScoreChange(newScore)
          setFood(getRandomFood(nextSnake))
        }

        return nextSnake
      })
    }, 140)

    return () => window.clearInterval(gameInterval)
  }, [active, gameStarted, gameOver, direction, food, onScoreChange, score])

  const cells = useMemo(() => Array.from({ length: BOARD_SIZE * BOARD_SIZE }), [])

  if (!active) return null

  return (
    <Card className="mx-auto w-full max-w-md border-white/10 bg-slate-950/70 text-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          Snake Arena
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-200">
            Score: {score}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!gameStarted || gameOver ? (
            <div className="space-y-2 text-center">
              {gameOver && <p className="font-semibold text-red-300">Game Over!</p>}
              <p className="text-sm text-slate-300">
                {gamepadIndex !== undefined
                  ? "Pressione A no controle ou Enter para comecar"
                  : "Conecte um controle ou use teclado (setas/WASD)"}
              </p>
              <Button onClick={resetGame} size="sm" className="bg-emerald-600 hover:bg-emerald-500">
                {gameOver ? "Jogar Novamente" : "Comecar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="mx-auto grid rounded-xl border border-cyan-300/20 bg-slate-900 p-1 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  width: "320px",
                  height: "320px",
                }}
              >
                {cells.map((_, index) => {
                  const x = index % BOARD_SIZE
                  const y = Math.floor(index / BOARD_SIZE)
                  const isHead = snake[0]?.x === x && snake[0]?.y === y
                  const isBody = snake.slice(1).some((segment) => segment.x === x && segment.y === y)
                  const isFoodCell = food.x === x && food.y === y

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`rounded-[2px] ${
                        isHead
                          ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]"
                          : isBody
                            ? "bg-emerald-500/90"
                            : isFoodCell
                              ? "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"
                              : "bg-slate-800/60"
                      }`}
                    />
                  )
                })}
              </div>
              <div className="text-center text-xs text-slate-400">
                <p>Controle: D-pad / analogico esquerdo / teclas direcionais</p>
                <p>Comandos: A ou Enter para reiniciar quando terminar</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
