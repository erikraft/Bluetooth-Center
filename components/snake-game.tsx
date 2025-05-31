"use client"

import { useState, useEffect, useCallback } from "react"
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

export function SnakeGame({ gamepadIndex, onScoreChange, active }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Position>({ x: 0, y: -1 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const BOARD_SIZE = 20

  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    }
  }, [])

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection({ x: 0, y: -1 })
    setGameOver(false)
    setScore(0)
    setGameStarted(true)
    onScoreChange(0)
  }, [generateFood, onScoreChange])

  const checkGamepadInput = useCallback(() => {
    if (typeof gamepadIndex === "undefined") return

    const gamepads = navigator.getGamepads()
    const gamepad = gamepads[gamepadIndex]

    if (!gamepad) return

    // D-pad controls (buttons 12-15)
    if (gamepad.buttons[12]?.pressed) {
      // D-pad Up
      setDirection((prev) => (prev.y === 0 ? { x: 0, y: -1 } : prev))
    } else if (gamepad.buttons[13]?.pressed) {
      // D-pad Down
      setDirection((prev) => (prev.y === 0 ? { x: 0, y: 1 } : prev))
    } else if (gamepad.buttons[14]?.pressed) {
      // D-pad Left
      setDirection((prev) => (prev.x === 0 ? { x: -1, y: 0 } : prev))
    } else if (gamepad.buttons[15]?.pressed) {
      // D-pad Right
      setDirection((prev) => (prev.x === 0 ? { x: 1, y: 0 } : prev))
    }

    // Left analog stick
    const leftX = gamepad.axes[0]
    const leftY = gamepad.axes[1]

    if (Math.abs(leftX) > 0.5 || Math.abs(leftY) > 0.5) {
      if (Math.abs(leftX) > Math.abs(leftY)) {
        // Horizontal movement
        if (leftX > 0.5) {
          setDirection((prev) => (prev.x === 0 ? { x: 1, y: 0 } : prev))
        } else if (leftX < -0.5) {
          setDirection((prev) => (prev.x === 0 ? { x: -1, y: 0 } : prev))
        }
      } else {
        // Vertical movement
        if (leftY > 0.5) {
          setDirection((prev) => (prev.y === 0 ? { x: 0, y: 1 } : prev))
        } else if (leftY < -0.5) {
          setDirection((prev) => (prev.y === 0 ? { x: 0, y: -1 } : prev))
        }
      }
    }

    // A button to start/restart
    if (gamepad.buttons[0]?.pressed && (gameOver || !gameStarted)) {
      resetGame()
    }
  }, [gamepadIndex, gameOver, gameStarted, resetGame])

  useEffect(() => {
    if (!active) return

    const gamepadInterval = setInterval(checkGamepadInput, 100)
    return () => clearInterval(gamepadInterval)
  }, [active, checkGamepadInput])

  useEffect(() => {
    if (!active || !gameStarted || gameOver) return

    const gameInterval = setInterval(() => {
      setSnake((currentSnake) => {
        const newSnake = [...currentSnake]
        const head = { ...newSnake[0] }

        head.x += direction.x
        head.y += direction.y

        // Check wall collision
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          setGameOver(true)
          return currentSnake
        }

        // Check self collision
        if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true)
          return currentSnake
        }

        newSnake.unshift(head)

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood())
          setScore((prev) => {
            const newScore = prev + 10
            onScoreChange(newScore)
            return newScore
          })
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, 200)

    return () => clearInterval(gameInterval)
  }, [active, gameStarted, gameOver, direction, food, generateFood, onScoreChange])

  if (!active) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          🐍 Snake Game
          <span className="text-sm font-normal">Score: {score}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!gameStarted || gameOver ? (
            <div className="text-center space-y-2">
              {gameOver && <p className="text-red-600 font-semibold">Game Over!</p>}
              <p className="text-sm text-gray-600">
                {gamepadIndex !== undefined ? "Pressione A no controle para começar" : "Conecte um controle para jogar"}
              </p>
              <Button onClick={resetGame} size="sm">
                {gameOver ? "Jogar Novamente" : "Começar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className="grid bg-gray-100 border-2 border-gray-300 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  width: "300px",
                  height: "300px",
                }}
              >
                {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
                  const x = index % BOARD_SIZE
                  const y = Math.floor(index / BOARD_SIZE)
                  const isSnake = snake.some((segment) => segment.x === x && segment.y === y)
                  const isFood = food.x === x && food.y === y
                  const isHead = snake[0]?.x === x && snake[0]?.y === y

                  return (
                    <div
                      key={index}
                      className={`border border-gray-200 ${
                        isHead ? "bg-green-600" : isSnake ? "bg-green-400" : isFood ? "bg-red-500" : "bg-white"
                      }`}
                    >
                      {isFood && <span className="text-xs">🍎</span>}
                    </div>
                  )
                })}
              </div>
              <div className="text-center text-xs text-gray-600">
                <p>Use D-pad ou analógico esquerdo para mover</p>
                <p>Colete as maçãs e evite as paredes!</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
