import { Reversi } from './reversi.js';

export let OpeningBook = (function () {
    // こうするとvscodeが型を認識してくれる
    // この初期値自体に意味はない
    const database = new Map([["", [{ x: 0, y: 0 }]]]);

    function rotateRight90(posStr) {
        let rotated = Array(64).fill("");
        for (let i = 0; i < 64; ++i) {
            let x = i & 7;
            let y = i >>> 3;
            rotated[(7 - y) + x * 8] = posStr[i];
        }
        return rotated.join("");
    }

    function rotate180(posStr) {
        let rotated = Array(64).fill("");
        for (let i = 0; i < 64; ++i) {
            rotated[i ^ 63] = posStr[i];
        }
        return rotated.join("");
    }

    function rotateRight270(posStr) {
        let rotated = Array(64).fill("");
        for (let i = 0; i < 64; ++i) {
            let x = i & 7;
            let y = i >>> 3;
            rotated[y + (7 - x) * 8] = posStr[i];
        }
        return rotated.join("");
    }

    function rotateMoveRight90(move) {
        return { x: 7 - move.y, y: move.x };
    }

    function rotateMove180(move) {
        return { x: 7 - move.x, y: 7 - move.y };
    }

    function rotateMoveRight270(move) {
        return { x: move.y, y: 7 - move.x };
    }

    function registerToBook(posStr, move) {
        if (database.has(posStr)) {
            database.get(posStr).push(move);
        }
        else {
            database.set(posStr, [move]);
        }
    }

    function flipHorizontal(posStr) {
        let flipped = Array(64).fill("");
        for (let i = 0; i < 64; ++i) {
            flipped[i ^ 7] = posStr[i];
        }
        return flipped.join("");
    }

    function flipMoveHorizontal(move) {
        return { x: 7 - move.x, y: move.y };
    }

    const rotateAndFlip = [
        { rotate: x => x, restoreMove: x => x },
        { rotate: rotateRight90, restoreMove: rotateMoveRight270 },
        { rotate: rotate180, restoreMove: rotateMove180 },
        { rotate: rotateRight270, restoreMove: rotateMoveRight90 },
        { rotate: flipHorizontal, restoreMove: flipMoveHorizontal },
        { rotate: x => flipHorizontal(rotateRight90(x)), restoreMove: x => rotateMoveRight270(flipMoveHorizontal(x)) },
        { rotate: x => flipHorizontal(rotate180(x)), restoreMove: x => rotateMove180(flipMoveHorizontal(x)) },
        { rotate: x => flipHorizontal(rotateRight270(x)), restoreMove: x => rotateMoveRight90(flipMoveHorizontal(x)) },
    ];

    function has(posStr) {
        return rotateAndFlip.some(r => database.has(r.rotate(posStr)));
    }

    function integerRand() {
        return Math.random() * 114547 | 0;
    }

    function chooseRandom(posStr) {
        for (let i = 0; i < rotateAndFlip.length; ++i) {
            if (database.has(rotateAndFlip[i].rotate(posStr))) {
                let moves = database.get(rotateAndFlip[i].rotate(posStr)).map(x => rotateAndFlip[i].restoreMove(x));
                return moves[integerRand() % moves.length];
            }
        }
    }

    function toPosString(reversi) {
        let posStr = "";
        for (let i = 0; i < 64; ++i) {
            posStr += ".XO"[reversi.board[i]];
        }
        return posStr;
    }

    /*
        定石集: https://bassy84.net/othello-top-index.html
     */

    // 使い方がゴミすぎるｗ
    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XO..." +
        "........" +
        "........" +
        "........"
        , { x: 3, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XO..." +
        "........" +
        "........" +
        "........"
        , { x: 2, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XO..." +
        "........" +
        "........" +
        "........"
        , { x: 5, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XO..." +
        "........" +
        "........" +
        "........"
        , { x: 4, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XXX.." +
        "........" +
        "........" +
        "........"
        , { x: 3, y: 5 });

    // 虎系
    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "..X....." +
        "...XX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 6, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "..X....." +
        "...XX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 5, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "..X....." +
        "...XX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 3, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "...OX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "...OX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "...OX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 1, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 1, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 5, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "...OOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 4, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "...OOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 4, y: 5 });

    // Stephenson
    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "...OOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 5, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "...OXX.." +
        "...O.X.." +
        "........" +
        "........"
        , { x: 1, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "...OXX.." +
        "...O.X.." +
        "........" +
        "........"
        , { x: 6, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "...OXX.." +
        "...O.X.." +
        "........" +
        "........"
        , { x: 5, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "..XO.O.." +
        "..XXOO.." +
        "...OXX.." +
        "...O.X.." +
        "........" +
        "........"
        , { x: 4, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "..XO.O.." +
        "..XXOO.." +
        "...OXX.." +
        "...O.X.." +
        "........" +
        "........"
        , { x: 4, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "..XO.O.." +
        "..XXOO.." +
        "...XXX.." +
        "...OXX.." +
        "........" +
        "........"
        , { x: 4, y: 6 });

    registerToBook(
        "........" +
        "........" +
        "..XO.O.." +
        "..XXOO.." +
        "...XOX.." +
        "...OOX.." +
        "....O..." +
        "........"
        , { x: 3, y: 6 });

    registerToBook(
        "........" +
        "........" +
        "..XO.O.." +
        "..XXOO.." +
        "...XOX.." +
        "...OOX.." +
        "....O..." +
        "........"
        , { x: 5, y: 6 });

    registerToBook(
        "........" +
        "........" +
        "..XO.O.." +
        "..XXOO.." +
        "...XOX.." +
        "...OOX.." +
        "....O..." +
        "........"
        , { x: 2, y: 5 });

    // Stephenson 終了
    // 虎基本定石

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "...OOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 1, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 1, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "..XO...." +
        "..XXXO.." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 1, y: 2 });

    registerToBook(
        "........" +
        "........" +
        ".OOO...." +
        "..XXXO.." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 1 });

    registerToBook(
        "........" +
        "..X....." +
        ".OXX...." +
        "..XXXO.." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 4, y: 2 });

    registerToBook(
        "........" +
        "..X....." +
        ".OXX...." +
        "..XXXO.." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 1, y: 3 });

    registerToBook(
        "........" +
        "..X....." +
        ".OXX...." +
        "..XXXO.." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 4, y: 5 });

    // 虎基本定石 終了
    // 虎系終了

    // うさぎ
    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...OXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "..XXXX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 5, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "..XXOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 3, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "..XXOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 3, y: 6 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "..XXOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 4, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "....X..." +
        "...XOO.." +
        "..XXOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 3, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "....X..." +
        "...XOO.." +
        "..XXOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 5, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "....X..." +
        "...XOO.." +
        "..XXOX.." +
        "...O...." +
        "........" +
        "........"
        , { x: 2, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "....X..." +
        "...XOO.." +
        "..XOOX.." +
        "..OO...." +
        "........" +
        "........"
        , { x: 4, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "....X..." +
        "...XOO.." +
        "..XOOX.." +
        "..OO...." +
        "........" +
        "........"
        , { x: 5, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "....X..." +
        "...XOO.." +
        "..XOOX.." +
        "..OO...." +
        "........" +
        "........"
        , { x: 3, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOOX.." +
        "..OO...." +
        "........" +
        "........"
        , { x: 6, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOOX.." +
        "..OO...." +
        "........" +
        "........"
        , { x: 5, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOOX.." +
        "..OO...." +
        "........" +
        "........"
        , { x: 5, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOOO.." +
        "..OO.O.." +
        "........" +
        "........"
        , { x: 4, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOXO.." +
        "..OOXO.." +
        "........" +
        "........"
        , { x: 3, y: 6 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOXO.." +
        "..OOOO.." +
        "...O...." +
        "........"
        , { x: 6, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOXO.." +
        "..OOOO.." +
        "...O...." +
        "........"
        , { x: 6, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "...XX..." +
        "...XXO.." +
        "..XOXO.." +
        "..OOOO.." +
        "...O...." +
        "........"
        , { x: 4, y: 6 });

    // うさぎここまで

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XXX.." +
        "........" +
        "........" +
        "........"
        , { x: 5, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XOX.." +
        ".....O.." +
        "........" +
        "........"
        , { x: 4, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XXX.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 3, y: 5 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XXX.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 5, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 2, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 3, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 4, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 5, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 6, y: 2 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 6, y: 3 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 6, y: 4 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 6, y: 5 });

    // 明らかに悪手なやつだけど面白いので入れる
    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OOO.." +
        "...XXO.." +
        "....XO.." +
        "........" +
        "........"
        , { x: 6, y: 6 });

    registerToBook(
        "........" +
        "........" +
        "........" +
        "...OX..." +
        "...XXX.." +
        "........" +
        "........" +
        "........"
        , { x: 5, y: 3 });

    return {
        has(reversi) {
            if (reversi instanceof Reversi) {
                return has(toPosString(reversi));
            }
        },
        chooseRandom(reversi) {
            if (reversi instanceof Reversi) {
                return chooseRandom(toPosString(reversi));
            }
        }
    };
})();