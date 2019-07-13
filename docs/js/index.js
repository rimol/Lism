import { Player } from './reversi.js';
import { Reversi } from './reversi.js';
import { BoardCanvas } from './render.js';
import { flipState } from './reversi.js';


function reverseString(str) {
    return str.split("").reverse().join("");
}

!function () {
    let currentReversi = new Reversi();
    let winNum = 0;
    let humanColor = Player.black;

    function newGame() {
        currentReversi = new Reversi();
        BoardCanvas.render(currentReversi);
        humanColor = Player.black;
    }

    function onCOMTurn() {
        for (let i = 0; i < 64; ++i) {
            if (currentReversi.isLegalMove(i >>> 3, i % 8, currentReversi.player)) {
                currentReversi.move(i % 8, i >>> 3);
                BoardCanvas.render(currentReversi);

                // if (currentReversi.player === flipState(humanColor)) onCOMTurn();

                break;
            }
        }
        // let move = await Engine.chooseBestMove(reversi);

        // if (!currentReversi.isLegalMove(move.x, move.y)) {
        //     throw "Engineが不正な手を打ちました";
        // }

        // currentReversi.move(move.x, move.y);
        // BoardCanvas.render(currentReversi);

        // if (currentReversi.player === flipState(humanColor)) onCOMTurn();
    }

    BoardCanvas.onTryingToPlaceStoneAt((x, y) => {
        if (currentReversi.player === humanColor && currentReversi.isLegalMove(x, y, currentReversi.player)) {
            currentReversi.move(x, y);
            BoardCanvas.render(currentReversi);

            if (currentReversi.player === flipState(humanColor)) onCOMTurn();
        }
    });

    newGame();
}();