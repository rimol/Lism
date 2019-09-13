import { Player, Reversi, flipState } from './reversi.js';
import { BoardCanvas } from './render.js';
import { Engine } from './engine.js';
import { OpeningBook } from './book.js';

function reverseString(str) {
    return str.split("").reverse().join("");
}

!function () {
    let currentReversi = new Reversi();
    let winNum = 0;
    let humanColor = Player.black;
    currentReversi.isOver = true;

    function newGame() {
        currentReversi = new Reversi();
        humanColor = Player.black;
        BoardCanvas.render(currentReversi);
    }

    function displayNumStone() {
        let p_human = document.getElementById("text-num-human-stone");
        let p_computer = document.getElementById("text-num-computer-stone");
        p_human.innerHTML = `あなた ${currentReversi.getStoneCount(humanColor)}石`;
        p_computer.innerHTML = `コンピュータ ${currentReversi.getStoneCount(flipState(humanColor))}石`;
    }

    async function onCOMTurn() {
        let move = OpeningBook.has(currentReversi) ? OpeningBook.chooseRandom(currentReversi) : await Engine.chooseBestMove(currentReversi);

        if (!currentReversi.isLegalMove(move.x, move.y, currentReversi.player)) {
            throw "Engineが不正な手を打ちました";
        }

        currentReversi.move(move.x, move.y);
        BoardCanvas.render(currentReversi);
    }

    BoardCanvas.onRenderingFinished(() => {
        displayNumStone();
        if (!currentReversi.isOver && currentReversi.player === flipState(humanColor)) onCOMTurn();
    });

    BoardCanvas.onTryingToPlaceStoneAt((x, y) => {
        if (!currentReversi.isOver && currentReversi.player === humanColor && currentReversi.isLegalMove(x, y, currentReversi.player)) {
            currentReversi.move(x, y);
            BoardCanvas.render(currentReversi);
        }
    });

    Engine.onReady(newGame);
}();