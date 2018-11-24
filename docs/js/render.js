// 盤面描画

let BoardCanvas = (function () {
    let onRenderingFinished = function () { };
    let onCanvasClicked = function() {};

    const canvas = document.getElementById("canvas-gameboard");
    const context = canvas.getContext("2d");

    const board_size = canvas.clientWidth;
    const grid_size = Math.floor(board_size / 8);

    const stone_image = new Image();
    const image_size = 80;
    stone_image.src = "img/stones_80.png";

    const recursion = 7;

    canvas.addEventListener("mouseup", e => {
        let rect = canvas.getBoundingClientRect();
        onCanvasClicked(Math.floor((e.x - rect.left) / grid_size), Math.floor((e.y - rect.top) / grid_size));
    });

    // phaseが0になるまで再帰する
    function render(reversi, phase) {
        // リセット
        context.scale(2, 2);
        context.clearRect(0, 0, board_size, board_size);

        // 全体の色
        context.fillStyle = "#a52250";
        context.fillRect(0, 0, board_size, board_size);

        // グリッド
        context.fillStyle = "#000000";
        for (let x = 0; x <= board_size; x += board_size / 8) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, board_size);
            context.stroke();
        }

        for (let y = 0; y <= board_size; y += board_size / 8) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(board_size, y);
            context.stroke();
        }

        // Xあたりの黒い点々
        context.beginPath();
        context.arc(2 * grid_size, 2 * grid_size, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.beginPath();
        context.arc(6 * grid_size, 2 * grid_size, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.beginPath();
        context.arc(2 * grid_size, 6 * grid_size, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.beginPath();
        context.arc(6 * grid_size, 6 * grid_size, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.scale(0.5, 0.5);

        // ひっくり返された石はひっくり返るアニメーションをさせる。
        // その他の石はアニメーションなしで描画

        let black_bb = reversi.bitboard_of(Player.black);
        let white_bb = reversi.bitboard_of(Player.white);

        let last_flip = reversi.last_flip();
        let flip_bb = last_flip.flip_bb;

        black_bb.foreach((x, y) => {
            let sq = x + y * 8;

            if (phase && flip_bb.test(sq)) {
                context.drawImage(stone_image,
                    image_size * (recursion - phase + 1), image_size,
                    image_size, image_size,
                    x * image_size, y * image_size,
                    image_size, image_size);
            }
            // 静止しした石
            else {
                context.drawImage(stone_image,
                    0, 0,
                    image_size, image_size,
                    x * image_size, y * image_size,
                    image_size, image_size);
            }
        });

        white_bb.foreach((x, y) => {
            let sq = x + y * 8;

            if (phase && flip_bb.test(sq)) {
                context.drawImage(stone_image,
                    image_size * (recursion - phase + 1), 0,
                    image_size, image_size,
                    x * image_size, y * image_size,
                    image_size, image_size);
            }
            // 静止しした石
            else {
                context.drawImage(stone_image,
                    0, image_size,
                    image_size, image_size,
                    x * image_size, y * image_size,
                    image_size, image_size);
            }
        });

        if (phase > 0) {
            setTimeout(() => render(reversi, phase - 1), 15);
        }
        // アニメーションが終わった
        else {
            // 最後においた石にマーク
            let sq = last_flip.sq;
            let x = sq % 8;
            let y = sq / 8 | 0;

            context.scale(2, 2);
            context.fillStyle = "#ff0037";
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;
            context.beginPath();
            context.arc(x * grid_size + grid_size / 2, y * grid_size + grid_size / 2, 3, 0, 2 * Math.PI, true);
            context.fill();
            context.scale(0.5, 0.5);

            // callback
            onRenderingFinished();
        }
    }

    return {
        render(reversi) {
            if (!(reversi instanceof Reversi)) return;

            render(reversi, recursion);
        },

        onCanvasClicked(func) {
            if (typeof func !== "function") return;

            onCanvasClicked = func;
        },

        onRenderingFinished(func) {
            if (typeof func !== "function") return;

            onRenderingFinished = func;
        }
    };
})();