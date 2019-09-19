import { Player, Reversi } from './reversi.js';
import { BoardCanvas } from './render.js';
import { Engine } from './engine.js';
import { OpeningBook } from './book.js';

!function () {
    let currentReversi = new Reversi();
    let isRenderingEvalValuesEnabled = true;

    let PlayerType = {
        human: 0, computer: 1
    };

    let players = [];
    players[Player.black] = {
        type: PlayerType.human,
        searchDepth: 4,
        exactDepth: 4
    };

    players[Player.white] = {
        type: PlayerType.computer,
        searchDepth: 4,
        exactDepth: 4
    };

    function renderCurrent() {
        BoardCanvas.render(currentReversi, isRenderingEvalValuesEnabled && players[currentReversi.player].type === PlayerType.human, players[Player.black]);
    }

    function renderCurrentNoAnimation() {
        BoardCanvas.renderNoAnimation(currentReversi, isRenderingEvalValuesEnabled && players[currentReversi.player].type === PlayerType.human, players[Player.black]);
    }

    window.changeGameMode = function (v) {
        players[Player.black].type = v >>> 1 & 1;
        players[Player.white].type = v & 1;

        if (Engine.isReady && !currentReversi.isOver() && players[currentReversi.player].type == PlayerType.computer)
            onCOMTurn();
    };

    window.changeComputerLevel = function (v) {
        let levels = [
            { searchDepth: 1, exactDepth: 1 }, // 意味なし
            { searchDepth: 1, exactDepth: 1 },
            { searchDepth: 2, exactDepth: 2 },
            { searchDepth: 3, exactDepth: 3 },
            { searchDepth: 4, exactDepth: 4 },
            { searchDepth: 4, exactDepth: 12 },
            { searchDepth: 6, exactDepth: 6 },
            { searchDepth: 6, exactDepth: 14 },
            { searchDepth: 8, exactDepth: 16 },
            { searchDepth: 10, exactDepth: 20 },
            { searchDepth: 12, exactDepth: 22 },
        ];
        players[Player.black].searchDepth = players[Player.white].searchDepth = levels[v].searchDepth;
        players[Player.black].exactDepth = players[Player.white].exactDepth = levels[v].exactDepth;

        if (Engine.isReady) renderCurrentNoAnimation();
    };

    window.setWhetherEvalValuesDisplayedOrNot = function (v) {
        isRenderingEvalValuesEnabled = v;

        if (Engine.isReady) renderCurrentNoAnimation();
    };

    window.undo = function () {
        if (!Engine.isReady) return;

        do {
            currentReversi.undo();
        } while (players[currentReversi.player].type != PlayerType.human && currentReversi.undoStack.length > 0);
        renderCurrentNoAnimation();
    };

    window.redo = function () {
        if (!Engine.isReady) return;

        do {
            currentReversi.redo();
        } while (players[currentReversi.player].type != PlayerType.human && currentReversi.redoStack.length > 0);
        renderCurrentNoAnimation();
    };

    window.newGame = function newGame() {
        if (!Engine.isReady) return;

        currentReversi = new Reversi();
        renderCurrentNoAnimation();
        document.getElementById("result-text").innerHTML = ``;
    };

    window.loadRecord = function () {
        if (!Engine.isReady) return;

        let newReversi = new Reversi();

        if (newReversi.loadRecord(document.getElementById("record-text").value)) {
            currentReversi = newReversi;
            renderCurrentNoAnimation();
            document.getElementById("result-text").innerHTML = ``;
        }
        else {
            this.alert('棋譜がおかしいです (´・ω・｀)');
        }
    }

    function displayNumStone() {
        document.getElementById("black-num-stone").innerHTML = currentReversi.getStoneCount(Player.black);
        document.getElementById("white-num-stone").innerHTML = currentReversi.getStoneCount(Player.white);

        if (currentReversi.isOver()) {
            let diff = currentReversi.getStoneCount(Player.black) - currentReversi.getStoneCount(Player.white);

            if (diff > 0) {
                document.getElementById("result-text").innerHTML = `黒の${diff}石勝ちです！`;
            }
            else if (diff < 0) {
                document.getElementById("result-text").innerHTML = `白の${-diff}石勝ちです！`;
            }
            else {
                document.getElementById("result-text").innerHTML = '引き分けです！';
            }
        }

        document.getElementById("record-text").value = currentReversi.getRecord();
    }

    async function onCOMTurn() {
        try {
            let move = OpeningBook.has(currentReversi)
                ? OpeningBook.chooseRandom(currentReversi)
                : await Engine.chooseBestMove(currentReversi, players[currentReversi.player].searchDepth, players[currentReversi.player].exactDepth);

            if (!currentReversi.isLegalMove(move.x, move.y, currentReversi.player)) {
                throw "Engineが不正な手を打ちました";
            }

            currentReversi.move(move.x, move.y);
            renderCurrent();
        } catch (e) {
            if (e != "terminated") throw e;
        }
    }

    BoardCanvas.onRenderingFinished(() => {
        displayNumStone();
        if (!currentReversi.isOver() && players[currentReversi.player].type == PlayerType.computer) onCOMTurn();
    });

    BoardCanvas.onTryingToPlaceStoneAt((x, y) => {
        if (Engine.isReady && !currentReversi.isOver() && players[currentReversi.player].type == PlayerType.human && currentReversi.isLegalMove(x, y, currentReversi.player)) {
            currentReversi.move(x, y);
            renderCurrent();
        }
    });

    Engine.onReady(newGame);
}();