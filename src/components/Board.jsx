import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import Tile from "./Tile";
import Cell from "./Cell";
import { Board } from "../helper/index";
import useEvent from '../hooks/useEvent';
import GameOverlay from './GameOverlay';
import megalovania from "../assets/megalovania.mp3";
import { soundoff, soundon } from "../assets/icons";

const BoardView = () => {
    const [board, setBoard] = useState(new Board());
    const [tileAnimations, setTileAnimations] = useState({});

    const handleKeyDown = (event) => {
        if (board.hasWon()) {
            return;
        }
        if (event.keyCode >= 37 && event.keyCode <= 40) {
            let direction = event.keyCode - 37;
            let boardClone = Object.assign(Object.create(Object.getPrototypeOf(board)), board);
            let newBoard = boardClone.move(direction);
            setBoard(newBoard);
        }
    }

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

    // Music
    const audioRef = useRef(new Audio(megalovania));
    audioRef.current.volume = 0.4;
    audioRef.current.loop = true;

    const [isPlayingMusic, setIsPlayingMusic] = useState(true);

    useEffect(() => {
        if (isPlayingMusic) {
            audioRef.current.play();
        }

        return () => {
            audioRef.current.pause();
        };
    }, [isPlayingMusic]);

    return (
        <div>
            <div className='text-white text-center mt-2 font-bold text-2xl max-[500px]:text-xl max-[500px]:py-2'>Merge the same number to reach 2048!</div>
            <div className='details-box'>
                <div className='resetButton' onClick={resetGame}>New Game</div>
                <div className='score-box'>
                    <div className='score-header'>SCORE</div>
                    <div>{board.score}</div>
                </div>
            </div>
            <div className='board'>
                {cells}
                {tiles}
                <GameOverlay onRestart={resetGame} board={board} />
            </div>
            <div className='text-center text-white text-xs text-nowrap mx-2'>Motion Graphics by Romain Cousin
                <a href="https://www.behance.net/romaincousin" target='_blank' className='hover:underline ml-1'>https://www.behance.net/romaincousin</a>
            </div>
            <a href="https://maldikurniawan.github.io/random_app/" className='hover:text-[#d3386a] text-white text-center flex justify-center mx-2' target='_blank'>Follow me here!</a>
            <div className='absolute bottom-4 left-2'>
                <img
                    src={!isPlayingMusic ? soundoff : soundon}
                    alt='jukebox'
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className='w-10 h-10 cursor-pointer object-contain'
                />
            </div>
        </div>
    );
};

export default BoardView;
