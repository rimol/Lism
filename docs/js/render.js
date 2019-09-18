// 盤面描画
import { SquareState, Reversi, flipState, boardIndex, Player } from './reversi.js';
import { Engine } from './engine.js';
import { _Howl as Howl } from '../lib/howler.min.js';

export let BoardCanvas = (function () {
    let onRenderingFinished = function () { };
    let onTryingToPlaceStoneAt = function () { };

    const canvas = document.getElementById("canvas-gameboard");
    const context = canvas.getContext("2d");

    // みためのサイズ、内部的にはこれの2倍の大きさがある.
    const CanvasSize = canvas.clientWidth;
    const GridSize = 40;
    const IndexGridSize = 17;

    const RowHeader = '12345678';
    const ColumnHeader = 'ABCDEFGH';

    const StoneImage = new Image();
    const StoneImageSize = 80;
    StoneImage.src = "res/stones_80.png";

    let FlipSound = new Howl({ src: ["res/flip_sound.mp3"] });

    canvas.addEventListener("mouseup", e => {
        let rect = canvas.getBoundingClientRect();
        let x = Math.floor((e.x - rect.left - IndexGridSize) / GridSize);
        let y = Math.floor((e.y - rect.top - IndexGridSize) / GridSize);
        onTryingToPlaceStoneAt(x, y);
    });

    // 0-indexedで数えてx本目、y本目のグリッド線の交点を塗る
    function renderPoint(x, y) {
        context.beginPath();
        context.arc(IndexGridSize + x * GridSize, IndexGridSize + y * GridSize, 3, 0, 2 * Math.PI, true);
        context.fill();
    }

    function renderBoardExceptStone() {
        // 2倍の大きさで描く
        context.scale(2, 2);
        context.fillStyle = "#000000";
        context.clearRect(0, 0, CanvasSize, CanvasSize);

        context.font = "13px 'Hiragino Sans', 'Meiryo', sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";

        // 座標
        for (let i = 0; i < 8; ++i) {
            context.fillText(ColumnHeader[i], IndexGridSize + (i + 0.5) * GridSize, IndexGridSize / 2);
            context.fillText(RowHeader[i], IndexGridSize / 2, IndexGridSize + (i + 0.5) * GridSize);
        }

        // グリッド線
        for (let i = 0; i < 9; ++i) {
            context.beginPath();
            context.moveTo(IndexGridSize + i * GridSize, IndexGridSize);
            context.lineTo(IndexGridSize + i * GridSize, CanvasSize);
            context.stroke();

            context.beginPath();
            context.moveTo(IndexGridSize, IndexGridSize + i * GridSize);
            context.lineTo(CanvasSize, IndexGridSize + i * GridSize);
            context.stroke();
        }

        // 点
        renderPoint(2, 2);
        renderPoint(6, 2);
        renderPoint(2, 6);
        renderPoint(6, 6);

        context.scale(0.5, 0.5);
    }

    function renderStone(x, y, color, phase) {
        context.drawImage(StoneImage,
            phase * StoneImageSize,
            (color - 1) * StoneImageSize,
            StoneImageSize,
            StoneImageSize,
            // 実際の大きさは2倍なので...(scaleが等倍に戻っている)
            (IndexGridSize + GridSize * x) * 2,
            (IndexGridSize + GridSize * y) * 2,
            StoneImageSize,
            StoneImageSize
        );
    }

    function renderMark(x, y) {
        context.scale(2, 2);
        context.fillStyle = "#ff0037";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(
            IndexGridSize + (x + 0.5) * GridSize,
            IndexGridSize + (y + 0.5) * GridSize,
            3, 0, 2 * Math.PI, true);
        context.fill();
        context.scale(0.5, 0.5);
    }

    async function render(reversi, isRenderingEvalValuesEnabled, depth, phase) {
        renderBoardExceptStone();

        let flipped = reversi.getLastFlip();
        let moveSQ = flipped.length ? flipped[0] : -1;
        let moveX = moveSQ % 8;
        let moveY = moveSQ / 8 | 0;

        let recursion = 0;

        flipped.forEach(sq => {
            let x = sq % 8;
            let y = sq / 8 | 0;

            // moveSQからdistマス離れたマスは phase = 2dist - 1 のときアニメーションを開始する
            // start <= phase < start + 7の間アニメーションをする
            // recursionの回数は2 * max(dist) - 1 + 7となる
            let dist = Math.max(Math.abs(x - moveX), Math.abs(y - moveY));
            let start = 2 * dist - 1;

            // せっかくなのでここで求めておく
            recursion = Math.max(recursion, start + 7);

            if (sq === moveSQ || phase >= start + 7) {
                renderStone(x, y, reversi.getSquareState(x, y), 0);
            }
            else if (phase < start) {
                renderStone(x, y, flipState(reversi.getSquareState(x, y)), 0);
            }
            else {
                renderStone(x, y, flipState(reversi.getSquareState(x, y)), phase - start + 1);
            }
        });

        if (phase >= 8 && phase % 2 === 0) {
            FlipSound.play();
        }

        // flipped以外をここで描画
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                let sqstate = reversi.getSquareState(x, y);
                if (sqstate === SquareState.empty || flipped.indexOf(boardIndex(x, y)) !== -1) continue;

                renderStone(x, y, sqstate, 0);
            }
        }

        if (phase < recursion) {
            setTimeout(() => render(reversi, isRenderingEvalValuesEnabled, depth, phase + 1), 23);
        }
        else {
            if (moveSQ !== -1) renderMark(moveX, moveY);

            // ユーザが、評価値の計算が終わる前に石をおいたとき、rejectされるのでそれ用のコードを書いておく。
            try {
                if (isRenderingEvalValuesEnabled) await renderEvalValues(reversi, depth);
                onRenderingFinished();
            } catch (error) {
                if (error != "terminated") throw error;
            }
        }
    }

    async function renderEvalValues(_reversi, { searchDepth, exactDepth }) {
        let reversi = _reversi.copy();
        let useSolver = (64 - reversi.getStoneCount(Player.black) - reversi.getStoneCount(Player.white)) <= exactDepth;
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                if (!reversi.isLegalMove(x, y, reversi.player)) continue;
                let currentColor = reversi.player;
                reversi.move(x, y);
                let nextColor = reversi.player;
                let score = useSolver
                    ? await Engine.computeBestScore(reversi)
                    : await Engine.computeEvalValue(reversi, searchDepth - 1);
                if (currentColor != nextColor) score *= -1;
                reversi.undo();

                context.scale(2, 2);
                context.fillStyle = (score > 0 ? "#009900" : score < 0 ? "#cc0000" : "#000000");
                context.font = "13px 'Hiragino Sans', 'Meiryo', sans-serif";
                context.textAlign = "center";
                context.textBaseline = "middle";
                let valueStr = (score > 0 ? "+" : score < 0 ? "-" : "") + ((Math.abs(score) * 10 | 0) / 10);
                context.fillText(valueStr, IndexGridSize + (x + 0.5) * GridSize, IndexGridSize + (y + 0.5) * GridSize);
                context.scale(0.5, 0.5);
            }
        }
    }

    renderBoardExceptStone();

    return {
        render(reversi, isRenderingEvalValuesEnabled, depth) {
            if (!(reversi instanceof Reversi)) return;
            render(reversi, isRenderingEvalValuesEnabled, depth, 1);
        },

        renderNoAnimation(reversi, isRenderingEvalValuesEnabled, depth) {
            if (!(reversi instanceof Reversi)) return;
            render(reversi, isRenderingEvalValuesEnabled, depth, 21);
        },

        onTryingToPlaceStoneAt(func) {
            if (typeof func !== "function") return;
            onTryingToPlaceStoneAt = func;
        },

        onRenderingFinished(func) {
            if (typeof func !== "function") return;
            onRenderingFinished = func;
        }
    };
})();