let Utils = {
    tzcnt(x) {
        x--;
        x -= x >>> 1 & 0x55555555;
        x = (x & 0x33333333) + (x >>> 2 & 0x33333333);
        x = x + (x >>> 4) & 0x0F0F0F0F;
        return x * 0x01010101 >>> 24;
    },
    popCount64(x, y) {
        let xc = x - (x >>> 1 & 0x55555555);
        xc = (xc & 0x33333333) + ((xc & 0xcccccccc) >>> 2);
        let yc = y - (y >>> 1 & 0x55555555);
        xc += (yc & 0x33333333) + ((yc & 0xcccccccc) >>> 2);
        xc = (xc & 0x0f0f0f0f) + ((xc & 0xf0f0f0f0) >>> 4);
        return xc * 0x01010101 >>> 24;
    },
    flipVertical(x) {
        return (x << 24) | ((x << 8) & 0x00ff0000) | ((x >>> 8) & 0x0000ff00) | (x >>> 24);
    }
};