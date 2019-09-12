#include "pattern.h"
#include <algorithm>
#include <cassert>
#include <vector>

int ToBase3[1 << MaxDigit];

void initToBase3() {
    for (int i = 0; i < (1 << MaxDigit); ++i) {
        int d = 1;
        for (int j = 0; j < MaxDigit; ++j) {
            if (i >> j & 1)
                ToBase3[i] += d;
            d *= 3;
        }
    }
}

Pattern &Pattern::operator=(const Pattern &pattern) {
    _numGroup = pattern._numGroup;
    _numPattern = pattern._numPattern;

    _mask = new Bitboard[_numGroup];
    _numIndex = new int[_numGroup];
    _numPackedIndex = new int[_numGroup];
    _group = new int[_numPattern];
    _rotationType = new RotationType[_numPattern];
    _packedIndex = new int *[_numGroup];

    for (int i = 0; i < _numGroup; ++i) {
        _numIndex[i] = pattern._numIndex[i];
        _numPackedIndex[i] = pattern._numPackedIndex[i];
    }

    for (int i = 0; i < _numGroup; ++i) {
        _mask[i] = pattern._mask[i];
        _packedIndex[i] = new int[_numIndex[i]];

        for (int j = 0; j < _numIndex[i]; ++j) {
            _packedIndex[i][j] = pattern._packedIndex[i][j];
        }
    }

    for (int i = 0; i < _numPattern; ++i) {
        _group[i] = pattern._group[i];
        _rotationType[i] = pattern._rotationType[i];
    }

    return *this;
}

Pattern::Pattern() : _mask(nullptr), _numIndex(nullptr), _numPackedIndex(nullptr), _group(nullptr), _rotationType(nullptr), _packedIndex(nullptr) {}

Pattern::Pattern(const Pattern &pattern) {
    *this = pattern;
}

Pattern::Pattern(const std::string &patternDefStr) : _numPattern() {
    _numGroup = (patternDefStr.size() - 1) / 72;

    _mask = new Bitboard[numGroup()];
    _numIndex = new int[numGroup()];
    _numPackedIndex = new int[numGroup()];

    std::fill(_mask, _mask + numGroup(), 0ULL);

    enum Symmetry {
        R90F,
        R180F,
        F,
        R90,
        R180,
        Asymmetry
    };
    std::vector<Symmetry> symmetryType(numGroup());
    {
        int x = 1;
        for (int i = 0; i < 8; ++i) {
            for (int j = 0; j < numGroup(); ++j) {
                Bitboard bits = 0ULL;
                for (int k = 0; k < 8; ++k) {
                    if (patternDefStr[x + k] == '#') {
                        bits |= 1ULL << (7 - k);
                    }
                }
                x += 9;
                _mask[j] |= bits << ((7 - i) * 8);
            }
        }

        // 各特徴について90,180,270回転したマスクを生成して何種類あるか調べていく
        // 左右反転も考える
        for (int i = 0; i < numGroup(); ++i) {
            assert(popcount(_mask[i]) <= MaxDigit);
            _numIndex[i] = pow3(popcount(_mask[i]));
            Bitboard mask0 = _mask[i];
            Bitboard mask90 = rotateRightBy90(mask0);
            Bitboard mask180 = rotateBy180(mask0);
            Bitboard mask270 = rotateRightBy90(mask180);
            Bitboard flipped = flipVertical(mask0);

            int memberNum = 0;
            // 90度回転が一致すれば、ほかの回転度のものも全部一致させることができる
            if (mask0 == mask90) {
                symmetryType[i] = R90;
                _numPattern += (memberNum = 2);
            }
            // 90度回転が一致しないときは, 270度回転も一致しない。（一致するとすればそのまま回転させ続けて90度に一致させることができることになって矛盾）
            else if (mask0 == mask180) {
                symmetryType[i] = R180;
                _numPattern += (memberNum = 4);
            } else {
                symmetryType[i] = Asymmetry;
                _numPattern += (memberNum = 8);
            }

            if (flipped == mask0 || flipped == mask90 || flipped == mask180 || flipped == mask270) {
                symmetryType[i] = (Symmetry)(symmetryType[i] - 3);
                _numPattern -= memberNum / 2;
            }
        }
    }
    // numGroup, numPattern, mask初期化完了

    _group = new int[numPattern()];
    _rotationType = new RotationType[numPattern()];

    {
        int x = 0;
        for (int i = 0; i < numGroup(); ++i) {
            switch (symmetryType[i]) {
            case R90F:
                _group[x] = i;
                _rotationType[x] = Rot0;

                x += 1;
                break;

            case R180F:
                _group[x] = _group[x + 1] = i;
                _rotationType[x] = Rot0;
                _rotationType[x + 1] = Rot90;

                x += 2;
                break;

            case F:
                _group[x] = _group[x + 1] = _group[x + 2] = _group[x + 3] = i;
                _rotationType[x] = Rot0;
                _rotationType[x + 1] = Rot90;
                _rotationType[x + 2] = Rot180;
                _rotationType[x + 3] = Rot270;

                x += 4;
                break;

            case R90:
                _group[x] = _group[x + 1] = i;
                _rotationType[x] = Rot0;
                _rotationType[x + 1] = Rot0F;

                x += 2;
                break;

            case R180:
                _group[x] = _group[x + 1] = _group[x + 2] = _group[x + 3] = i;
                _rotationType[x] = Rot0;
                _rotationType[x + 1] = Rot90;
                _rotationType[x + 2] = Rot0F;
                _rotationType[x + 3] = Rot90F;

                x += 4;
                break;

            case Asymmetry:
                for (int j = 0; j < 8; ++j)
                    _group[x + j] = i;

                _rotationType[x] = Rot0;
                _rotationType[x + 1] = Rot90;
                _rotationType[x + 2] = Rot180;
                _rotationType[x + 3] = Rot270;
                _rotationType[x + 4] = Rot0F;
                _rotationType[x + 5] = Rot90F;
                _rotationType[x + 6] = Rot180F;
                _rotationType[x + 7] = Rot270F;

                x += 8;
                break;
            }
        }
    }
    // _group, _rotationType 初期化完了

    _packedIndex = new int *[numGroup()];
    for (int i = 0; i < numGroup(); ++i) {
        _packedIndex[i] = new int[_numIndex[i]];
    }

    {
        int flipSQ[2][64];

        for (int i = 0; i < 64; ++i) {
            int x = i % 8;
            int y = i / 8;
            flipSQ[0][i] = x + (7 - y) * 8;       // vertical
            flipSQ[1][i] = (7 - y) + (7 - x) * 8; // diagonal
        }

        // 特徴自体の対称性
        for (int i = 0; i < numGroup(); ++i) {
            Bitboard v = flipVertical(_mask[i]);
            Bitboard d = flipDiagonalA8H1(_mask[i]);
            if (_mask[i] == v || _mask[i] == d) {
                int flipType = _mask[i] == v ? 0 : 1;
                _numPackedIndex[i] = 0;
                for (int j = 0; j < _numIndex[i]; ++j) {
                    int k = j;
                    Bitboard m = _mask[i];
                    std::vector<std::pair<int, int>> digits;
                    while (m != 0ULL) {
                        digits.push_back({flipSQ[flipType][tzcnt(m)], k % 3});
                        k /= 3;
                        m &= m - 1ULL;
                    }
                    std::sort(digits.begin(), digits.end(), std::greater<std::pair<int, int>>());
                    int l = 0;
                    for (int i = 0; i < digits.size(); ++i) {
                        l *= 3;
                        l += digits[i].second;
                    }

                    if (j <= l) {
                        _packedIndex[i][j] = _packedIndex[i][l] = _numPackedIndex[i]++;
                    }
                }
            } else {
                _numPackedIndex[i] = _numIndex[i];
                for (int j = 0; j < _numIndex[i]; ++j) {
                    _packedIndex[i][j] = j;
                }
            }
        }
    }
}

Pattern::~Pattern() {
    delete[] _group;
    delete[] _rotationType;
    delete[] _mask;
    delete[] _numIndex;
    delete[] _numPackedIndex;

    for (int i = 0; i < numGroup(); ++i) {
        delete[] _packedIndex[i];
    }
    delete[] _packedIndex;
}

const std::string LogistelloPatterns = R"(
.......# ......#. .....#.. ....#... .....### #....... ........ ........ ........ ........ ........
......## ......#. .....#.. ....#... .....### .#...... #....... ........ ........ ........ ........
.......# ......#. .....#.. ....#... .....### ..#..... .#...... #....... ........ ........ ........
.......# ......#. .....#.. ....#... ........ ...#.... ..#..... .#...... #....... ........ ........
.......# ......#. .....#.. ....#... ........ ....#... ...#.... ..#..... .#...... #....... ........
.......# ......#. .....#.. ....#... ........ .....#.. ....#... ...#.... ..#..... .#...... ........
......## ......#. .....#.. ....#... ........ ......#. .....#.. ....#... ...#.... ..#..... ...#####
.......# ......#. .....#.. ....#... ........ .......# ......#. .....#.. ....#... ...#.... ...#####
)";

// 1個のパターンでみるマスを8つ以下に制限したやつ.
const std::string OriginalPatterns1 = R"(
.......# ......#. .....#.. ....#... .....### #....... ........ ........ ........ ........ ........
.......# ......#. .....#.. ....#... .....### .#...... #....... ........ ........ ........ ........
.......# ......#. .....#.. ....#... ......## ..#..... .#...... #....... ........ ........ .....##.
.......# ......#. .....#.. ....#... ........ ...#.... ..#..... .#...... #....... ........ .....##.
.......# ......#. .....#.. ....#... ........ ....#... ...#.... ..#..... .#...... #....... .....##.
.......# ......#. .....#.. ....#... ........ .....#.. ....#... ...#.... ..#..... .#...... .....##.
.......# ......#. .....#.. ....#... ........ ......#. .....#.. ....#... ...#.... ..#..... ........
.......# ......#. .....#.. ....#... ........ .......# ......#. .....#.. ....#... ...#.... ........
)";

// const std::map<std::string, Pattern> Patterns = {
//     {"logistello", Pattern(LogistelloPatterns)},
//     {"original1", Pattern(OriginalPatterns1)},
// };