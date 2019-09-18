export let SquareState = {
    empty: 0,
    black: 1,
    white: 2,
};

export let Player = {
    black: 1,
    white: 2,
}

// 黒白を反転する
export function flipState(sqstate) {
    return sqstate ^= 3;
}

/* 行番号がy, 列番号がx
  A B C D E F G H
1 0 1 2 3 4 5 6 7
2 8...
3
4
5
6
7
8            ...63
 */
export function boardIndex(x, y) {
    return y * 8 + x;
}

// 返ってきた配列の長さが0ならillegalMove
export function getFlip(board, x, y, color) {
    if (board[boardIndex(x, y)] !== SquareState.empty) return [];

    // (x, y) が (i, j)方向の向きで一番端ならtrueを返す
    function endOfLine(x, y, i, j) {
        // 一つ進めて盤の外に出ればtrue.
        return !(0 <= (x + i) && (x + i) < 8)
            || !(0 <= (y + j) && (y + j) < 8);
    }

    let flip = [];
    for (let i = -1; i <= 1; ++i) {
        for (let j = -1; j <= 1; ++j) {
            if (i === 0 && j === 0) continue;

            let cand = [];
            let tx = x + i;
            let ty = y + j;
            while (!endOfLine(tx, ty, i, j)) {
                if (board[boardIndex(tx, ty)] !== flipState(color)) {
                    break;
                }

                cand.push(boardIndex(tx, ty));
                tx += i; ty += j;
            }

            if (board[boardIndex(tx, ty)] === color) {
                flip = flip.concat(cand);
            }
        }
    }
    return flip;
}

export class Reversi {
    constructor() {
        this.player = SquareState.black;
        this.isOver = false;

        // 普通に配列でもちます
        this.board = Array(64);
        // 定義してね
        this.board.fill(SquareState.empty);
        this.board[boardIndex(3, 4)] = this.board[boardIndex(4, 3)] = SquareState.black;
        this.board[boardIndex(3, 3)] = this.board[boardIndex(4, 4)] = SquareState.white;

        // 「最初に石を打った位置、そのあとにひっくり返った石の位置をもつ配列」の配列
        // 最初が-1ならパス
        this.undoStack = [];
        this.redoStack = [];
    }

    loadRecord(recordStr) {
        if (typeof recordStr !== "string")
            return false;

        if (recordStr.length === 0 || recordStr.length % 2 === 1)
            return false;

        for (let i = 0; i < recordStr.length; i += 2) {
            let x = "abcdefghABCDEFGH".indexOf(recordStr[i]);
            let y = "12345678".indexOf(recordStr[i + 1]);

            if (x === -1 || y === -1)
                return false;

            x %= 8;
            if (!this.isLegalMove(x, y, this.player))
                return false;

            this.move(x, y);
        }
        return true;
    }

    // ひっくり返るアニメーションにつかうよ
    getLastFlip() {
        let l = this.undoStack.length;
        return l > 0 ? this.undoStack[l - 1] : [];
    }

    getSquareState(x, y) {
        return this.board[boardIndex(x, y)];
    }

    getStoneCount(color) {
        let cnt = 0;
        for (let i = 0; i < this.board.length; ++i) {
            if (this.board[i] === color)++cnt;
        }
        return cnt;
    }

    isLegalMove(x, y, color) {
        return getFlip(this.board, x, y, color).length > 0;
    }

    // sqにcolorの石を置き、flipの位置にある石をひっくり返し、手番を変更する
    _doFlip(color, sq, flip) {
        this.board[sq] = color;
        flip.forEach(sqf => {
            this.board[sqf] = flipState(this.board[sqf]);
        });
        this.player = flipState(this.player);
    }

    noLegalMoveExists(color) {
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                if (this.getSquareState(x, y) !== SquareState.empty) continue;

                if (this.isLegalMove(x, y, color)) return false;
            }
        }

        return true;
    }

    passOrFinishGameIfNeeded() {
        if (this.noLegalMoveExists(this.player)) {
            if (this.noLegalMoveExists(flipState(this.player))) {
                this.isOver = true;
            }
            else {
                this.player = flipState(this.player);
                this.undoStack.push([-1]);
            }
        }
    }

    move(x, y) {
        let flip = getFlip(this.board, x, y, this.player);
        if (flip.length === 0) return;

        this._doFlip(this.player, boardIndex(x, y), flip);

        flip.unshift(boardIndex(x, y));
        this.undoStack.push(flip);

        // 別の世界線はclear
        this.redoStack.length = 0;
        this.passOrFinishGameIfNeeded();
    }

    undo() {
        let flip = this.undoStack.pop();
        if (typeof flip === "undefined") return;

        let sq = flip.shift();
        if (sq != -1)
            this._doFlip(SquareState.empty, sq, flip);
        else
            this.player = flipState(this.player);

        flip.unshift(sq);
        this.redoStack.push(flip);
    }

    redo() {
        let flip = this.redoStack.pop();
        if (typeof flip === "undefined") return;

        let sq = flip.shift();
        if (sq != -1)
            this._doFlip(this.player, sq, flip);
        else
            this.player = flipState(this.player);

        flip.unshift(sq);
        this.undoStack.push(flip);
    }

    copy() {
        let v = new Reversi();
        v.player = this.player;
        v.isOver = this.isOver;
        v.board = this.board.slice();
        v.undoStack = this.undoStack.slice();
        v.redoStack = this.redoStack.slice();
        return v;
    }

    terminatedBoard() {
        return this.noLegalMoveExists(Player.black) && this.noLegalMoveExists(Player.white);
    }

    getRecord() {
        let t = this.undoStack.reduce((prev, cur, _, __) => prev + "abcdefgh"[cur[0] & 7] + ((cur[0] >>> 3) + 1), "");
        return this.redoStack.reduceRight((prev, cur, _, __) => prev + "abcdefgh"[cur[0] & 7] + ((cur[0] >>> 3) + 1), t);
    }
}
