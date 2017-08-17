function bitPos(n) {
    let i = 0;
    for (; n != 1; n = n >>> 1) i++;
    return i;
}