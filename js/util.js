let Utils = {
    bitPosition(x) {
        let t = (x & 0xffff0000) && 16;
        x = x >>> 16 || x;
        t += (x & 0x0000ff00) && 8;
        x = x >>> 8 || x;
        t += (x & 0x000000f0) && 4;
        x = x >>> 4 || x;
        t += (x & 0b1100) && 2;
        x = x >>> 2 || x;
        return t + ((x & 0b0010) && 1);
    },
    popCount64(x, y) {
        let xc = (x & 0x55555555) + ((x & 0xaaaaaaaa) >>> 1);
        xc = (xc & 0x33333333) + ((xc & 0xcccccccc) >>> 2);
        let yc = (y & 0x55555555) + ((y & 0xaaaaaaaa) >>> 1);
        xc += (yc & 0x33333333) + ((yc & 0xcccccccc) >>> 2);
        xc = (xc & 0x0f0f0f0f) + ((xc & 0xf0f0f0f0) >>> 4);
        xc = (xc & 0x00ff00ff) + ((xc & 0xff00ff00) >>> 8);
        return (xc & 0x0000ffff) + ((xc & 0xffff0000) >>> 16);
    },
    flipVertical(x) {
        return (x << 24) | ((x << 8) & 0x00ff0000) | ((x >>> 8) & 0x0000ff00) | (x >>> 24);
    }
};