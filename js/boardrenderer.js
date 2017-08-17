{
    const Stone = {
        black: 1,
        white: ~1,
    };

    const CANVAS_NAME = "canvas-gameboard";
    const STONE_IMAGE_SIZE = 80;

    let canvas = document.getElementById(CANVAS_NAME);
    let context = canvas.getContext("2d");

    let boardSize = canvas.clientWidth;
    let gridSize = Math.floor(boardSize / 8);

    let stoneImage = new Image();
    stoneImage.src = "img/stones.png";

    let callbacksOnRenderingFinished = [];

    let setCallbackOnGridClicked = function(callback) {
        canvas.addEventListener("mouseup", function (e) {
            let rect = canvas.getBoundingClientRect();
            callback(Math.floor((e.x - rect.left) / gridSize), Math.floor((e.y - rect.top) / gridSize));
        });
    };

    let setCallbackOnRenderingFinished = function(callback) {
        if (typeof callback == "function") {
            callbacksOnRenderingFinished.push(callback);
        }
    };

    let render = function(board, diff, count) {
        context.scale(2, 2);
        context.clearRect(0, 0, boardSize, boardSize);
        context.fillStyle = "#008000";
        context.fillRect(0, 0, boardSize, boardSize);

        context.shadowColor = "#000000";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 9;

        context.fillStyle = "#000000";
        for (let x = 0; x <= boardSize; x += boardSize / 8) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, boardSize);
            context.stroke();
        }
        for (let y = 0; y <= boardSize; y += boardSize / 8) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(boardSize, y);
            context.stroke();
        }

        context.beginPath();
        context.arc(2 * gridSize, 2 * gridSize, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.beginPath();
        context.arc(6 * gridSize, 2 * gridSize, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.beginPath();
        context.arc(2 * gridSize, 6 * gridSize, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.beginPath();
        context.arc(6 * gridSize, 6 * gridSize, 3, 0, 2 * Math.PI, true);
        context.fill();

        context.scale(0.5, 0.5);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                switch (board.get(i, j)) {
                    case GridState.black:
                        if (count > 0 && diff.get(i, j) != GridState.empty) {
                            context.drawImage(stoneImage, STONE_IMAGE_SIZE * (7 - count + 1), STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, i * STONE_IMAGE_SIZE, j * STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE);
                        }
                        else {
                            context.drawImage(stoneImage, 0, 0, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, i * STONE_IMAGE_SIZE, j * STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE);
                        }
                        break;
                    case GridState.white:
                        if (count > 0 && diff.get(i, j) != GridState.empty) {
                            context.drawImage(stoneImage, STONE_IMAGE_SIZE * (7 - count + 1), 0, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, i * STONE_IMAGE_SIZE, j * STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE);
                        }
                        else {
                            context.drawImage(stoneImage, 0, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, i * STONE_IMAGE_SIZE, j * STONE_IMAGE_SIZE, STONE_IMAGE_SIZE, STONE_IMAGE_SIZE);
                        }
                        break;
                }
            }
        }

        if (count >= 0) setTimeout(() => render(board, diff, count - 1), 15);
        else {
            for (let i = 0; i < callbacksOnRenderingFinished.length; i++) {
                callbacksOnRenderingFinished[i]();
            }
        }
    };

    let currentBoard, lastH, lastV;
    let update = function(board, h, v) {
        if (currentBoard && board.equals(currentBoard)) return;
        let diff = board.calcDifference(currentBoard || board);
        currentBoard = board;
        lastH = h, lastV = v;
        render(board, diff, 7);
    };

    setCallbackOnRenderingFinished(function() {
        context.scale(2, 2);
        context.fillStyle = "#ff0037";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(lastH * gridSize + gridSize / 2, lastV * gridSize + gridSize / 2, 3, 0, 2 * Math.PI, true);
        context.fill();
        context.scale(0.5, 0.5);
    });

    this.BoardRenderer = {
        update: update,
        setCallbackOnGridClicked: setCallbackOnGridClicked,
        setCallbackOnRenderingFinished: setCallbackOnRenderingFinished
    };
}