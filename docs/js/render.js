// 盤面描画
import { SquareState } from './reversi.js';
import { Reversi } from './reversi.js';
import { flipState } from './reversi.js';
import { boardIndex } from './reversi.js';


export let BoardCanvas = (function () {
    let onRenderingFinished = function () { };
    let onTryingToPlaceStoneAt = function () { };

    const canvas = document.getElementById("canvas-gameboard");
    const context = canvas.getContext("2d");

    // みためのサイズ、内部的にはこれの2倍の大きさがある.
    const CanvasSize = canvas.clientWidth;
    const GridSize = 40;
    const IndexGridSize = 30;

    const RowHeader = '12345678';
    const ColumnHeader = 'ABCDEFGH';

    const StoneImage = new Image();
    const StoneImageSize = 80;
    StoneImage.src = "img/stones_80.png";

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
        //     context.fillStyle = "#ff0037";
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

    // 1<=phase<=7の時フリップアニメーションをする
    // phase=8になったらアニメーション停止、最後に置いた石をマーキング
    function render(reversi, phase) {
        renderBoardExceptStone();

        let flipped = phase < 8 ? reversi.getLastFlip() : [];
        let moveSQ = reversi.getLastFlip()[0];

        flipped.forEach(sq => {
            let x = sq % 8;
            let y = sq / 8 | 0;
            renderStone(x, y, flipState(reversi.getSquareState(x, y)), phase);
        });

        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                let sqstate = reversi.getSquareState(x, y);
                if (sqstate === SquareState.empty || flipped.indexOf(boardIndex(x, y)) !== -1) continue;

                renderStone(x, y, sqstate, 0);
            }
        }

        if (phase < 8) {
            setTimeout(() => render(reversi, phase + 1), 15);
        }
        else {
            let x = moveSQ % 8;
            let y = moveSQ / 8 | 0;
            renderMark(x, y);
            onRenderingFinished();
        }
    }

    return {
        render(reversi) {
            if (!(reversi instanceof Reversi)) return;
            render(reversi, 1);
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