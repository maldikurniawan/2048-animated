import React, { useEffect, useRef, useState } from 'react';
import { animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import Tile from "./Tile";
import Cell from "./Cell";
import { Board } from "../helper/index";
import useEvent from '../hooks/useEvent';
import GameOverlay from './GameOverlay';
import deathbyglamour from "../assets/deathbyglamour.mp3";
import { TbMusic, TbMusicOff } from 'react-icons/tb';

const BoardView = () => {
    const [board, setBoard] = useState(new Board());
    const [tileAnimations, setTileAnimations] = useState({});
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const [showMusicModal, setShowMusicModal] = useState(true);
    const [highScore2048, setHighScore2048] = useState(() => {
        return parseInt(localStorage.getItem('highScore2048')) || 0; // Get high score from localStorage
    });

    const handleKeyDown = (event) => {
        if (board.hasWon()) {
            return;
        }
        if (event.keyCode >= 37 && event.keyCode <= 40) {
            let direction = event.keyCode - 37;
            let boardClone = Object.assign(Object.create(Object.getPrototypeOf(board)), board);
            let newBoard = boardClone.move(direction);
            updateScore(newBoard.score); // Update the score
            setBoard(newBoard);
        }
    };

    useEvent("keydown", handleKeyDown);

    const bind = useGesture({
        onDrag: ({ args: [tile], down, movement: [mx, my] }) => {
            const absX = Math.abs(mx);
            const absY = Math.abs(my);
            let direction = null;
            if (absX > absY) {
                direction = mx > 0 ? 2 : 0; // Right or Left
            } else {
                direction = my > 0 ? 3 : 1; // Down or Up
            }
            if (!down) {
                let boardClone = Object.assign(Object.create(Object.getPrototypeOf(board)), board);
                let newBoard = boardClone.move(direction);
                updateScore(newBoard.score); // Update the score
                setBoard(newBoard);
                setTileAnimations({});
            } else {
                setTileAnimations((prev) => ({
                    ...prev,
                    [tile.id]: { x: down ? mx : 0, y: down ? my : 0 },
                }));
            }
        }
    });

    const cells = board.cells.map((row, rowIndex) => (
        <div key={rowIndex}>
            {row.map((col, colIndex) => (
                <Cell key={rowIndex * board.size + colIndex} />
            ))}
        </div>
    ));

    const tiles = board.tiles
        .filter((tile) => tile.value !== 0)
        .map((tile, index) => {
            const animationProps = tileAnimations[tile.id] || { x: 0, y: 0 };
            return (
                <animated.div
                    {...bind(tile)}
                    key={index}
                    style={{ transform: animationProps }}
                >
                    <Tile tile={tile} />
                </animated.div>
            );
        });

    const resetGame = () => {
        setBoard(new Board());
    };

    const updateScore = (currentScore) => {
        if (currentScore > highScore2048) {
            setHighScore2048(currentScore); // Update high score
            localStorage.setItem('highScore2048', currentScore); // Save to localStorage
        }
    };

    // Music
    const audioRef = useRef(new Audio(deathbyglamour));

    // Ensure audio plays when the component is mounted
    useEffect(() => {
        audioRef.current.volume = 0.8;
        audioRef.current.loop = true;
        if (isPlayingMusic) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }

        return () => {
            audioRef.current.pause();
        };
    }, [isPlayingMusic]);

    return (
        <div>
            {showMusicModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-6 shadow-lg text-center rounded-lg">
                        <h2 className="text-2xl text-black font-bold mb-4">Play Background Music?</h2>
                        <p className="mb-4 text-black">Would you like to turn on the background music for this game?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                                onClick={() => {
                                    setIsPlayingMusic(true);
                                    setShowMusicModal(false);
                                }}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-gray-800"
                                onClick={() => setShowMusicModal(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className='max-[465px]:hidden'>
                <div className='details-box'>
                    <div className='resetButton' onClick={resetGame}>New Game</div>
                    <div className='score-box'>
                        <div className='score-header'>SCORE</div>
                        <div>{board.score}</div>
                    </div>
                </div>
            </div>
            <div className="min-[465px]:hidden mb-28">
                <div
                    className="fixed top-5 left-2.5 bg-[#3d2963] hover:bg-[#d3386a] text-white/50 py-2 px-4 rounded-lg cursor-pointer"
                    onClick={resetGame}
                >
                    New Game
                </div>
                <div className="fixed top-5 right-2.5 bg-[#3d2963] text-white/50 py-2 px-6 whitespace-nowrap rounded-lg w-[175px]">
                    <div className="text-sm uppercase text-center">High Score: {highScore2048}</div>
                </div>
                <div className="fixed top-16 right-2.5 bg-[#3d2963] text-white/50 py-2 px-6 rounded-lg w-[175px]">
                    <div className="text-sm text-center">Your Score: {board.score}</div>
                </div>
            </div>
            <div className='board'>
                {cells}
                {tiles}
                <GameOverlay onRestart={resetGame} board={board} />
            </div>
            <div className="fixed bottom-[20px] left-[20px]">
                <div className="text-left text-white text-sm">
                    Motion Graphics by
                    <a
                        href="https://www.behance.net/romaincousin"
                        target="_blank"
                        className="hover:underline ml-1"
                        rel="noopener noreferrer"
                    >
                        Romain Cousin
                    </a>
                </div>
                <a
                    href="https://maldikurniawan.netlify.app/"
                    className="text-white font-bold hover:text-[#d3386a] tracking-widest"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Follow Me Here!
                </a>
            </div>
            <button
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                className='opacity-100 z-40'
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}>
                {!isPlayingMusic ?
                    <TbMusicOff className='w-10 h-10 p-2 bg-blue-600 rounded-full' />
                    :
                    <TbMusic className='w-10 h-10 p-2 bg-blue-600 rounded-full' />
                }
            </button>
        </div>
    );
};

export default BoardView;
