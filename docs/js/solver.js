// このコードはほぼ人力生成されています。

function tzcnt(d){d=~d&d-1;d-=d>>>1&1431655765;d=(d&858993459)+(d>>>2&858993459);return 16843009*(d+(d>>>4)&252645135)>>>24}function parity(d){d^=d>>>16;d^=d>>>8;d^=d>>>4;d^=d>>>2;return(d^d>>>1)&1}function popcount64(d,g){d-=d>>>1&1431655765;g-=g>>>1&1431655765;d=(d&858993459)+((d&3435973836)>>>2)+((g&858993459)+((g&3435973836)>>>2));return 16843009*((d&252645135)+((d&4042322160)>>>4))>>>24}
function mobility(d,g,n,m,k){let p=~(d|n),h=~(g|m),f=n&2122219134,e=m&2122219134;let a=d<<1;let l=g<<1;a=f+a&p&~a;l=e+l&h&~l;let b=g;b|=b>>>1&e;e&=e>>>1;b|=b>>>2&e;l|=((b|b>>>4&e&e>>>2)^g)>>>1&h;let c=d;c|=c>>>1&f;f&=f>>>1;c|=c>>>2&f;a|=((c|c>>>4&f&f>>>2)^d)>>>1&p;f=n&16777215;e=m&4294967040;b=g<<8&e;b|=b<<8&e;b|=b<<8&e;c=(d<<8|(b|g)>>>24)&f;c|=c<<8&f;a|=((c|c<<8&f)<<8|b>>>24)&p;l|=b<<8&h;c=d>>>8&f;c|=c>>>8&f;c|=c>>>8&f;b=(g>>>8|(c|d)<<24)&e;b|=b>>>8&e;a|=c>>>8&p;l|=((b|b>>>8&e)>>>8|c<<24)&h;f=n&
8289918;e=m&2122219008;b=g<<9&e;b|=b<<9&e;b|=b<<9&e;c=(d<<9|(b|g)>>>23)&f;c|=c<<9&f;a|=((c|c<<9&f)<<9|b>>>23)&p;l|=b<<9&h;c=d>>>9&f;c|=c>>>9&f;c|=c>>>9&f;b=(g>>>9|(c|d)<<23)&e;b|=b>>>9&e;a|=c>>>9&p;l|=((b|b>>>9&e)>>>9|c<<23)&h;b=g<<7&e;b|=b<<7&e;b|=b<<7&e;c=(d<<7|(b|g)>>>25)&f;c|=c<<7&f;a|=((c|c<<7&f)<<7|b>>>25)&p;l|=b<<7&h;c=d>>>7&f;c|=c>>>7&f;c|=c>>>7&f;b=(g>>>7|(c|d)<<25)&e;b|=b>>>7&e;k.mob1=a|c>>>7&p;k.mob0=l|((b|b>>>7&e)>>>7|c<<25)&h}
function flip1(d,g,n,m,k,p){let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(h|~e)+1&e&d;let l=a-((a|-a)>>>31)&e;e=134480384*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=16843008*k;a=(n|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=2113664*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;a=k>>>9&h;a|=a>>>9&h;a|=a>>>9&h;let b=(a|k)<<23&f;b|=b>>>9&f;b|=b>>>9&f;let c=a>>>9&d|(b>>>9|a<<23)&g;c=(c|-c)>>31;l|=a&c;e=0|b&c;a=k>>>8&n;a|=a>>>8&n;a|=a>>>8&n;b=(a|k)<<24&m;b|=b>>>8&m;b|=b>>>8&m;c=a>>>8&d|(b>>>8|a<<24)&g;c=(c|-c)>>31;
l|=a&c;e|=b&c;a=k>>>7&h;a|=a>>>7&h;a|=a>>>7&h;b=(a|k)<<25&f;b|=b>>>7&f;b|=b>>>7&f;c=a>>>7&d|(b>>>7|a<<25)&g;c=(c|-c)>>31;l|=a&c;a=k|k>>>1&h;h&=h>>>1;a|=a>>>2&h;a=(a|a>>>4&h&h>>>2)>>>1;p.f1=l|a&-(a&d)<<1;p.f0=e|b&c}
function flip0(d,g,n,m,k,p){let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(f|~e)+1&e&g;let l=a-((a|-a)>>>31)&e;a=k<<9&f;a|=a<<9&f;a|=a<<9&f;let b=(a|k)>>>23&h;b|=b<<9&h;b|=b<<9&h;let c=(b<<9|a>>>23)&d|a<<9&g;c=(c|-c)>>31;e=0|b&c;l|=a&c;a=k<<8&m;a|=a<<8&m;a|=a<<8&m;b=(a|k)>>>24&n;b|=b<<8&n;b|=b<<8&n;c=(b<<8|a>>>24)&d|a<<8&g;c=(c|-c)>>31;e|=b&c;l|=a&c;a=k<<7&f;a|=a<<7&f;a|=a<<7&f;b=(a|k)>>>25&h;b|=b<<7&h;b|=b<<7&h;c=(b<<7|a>>>25)&d|a<<7&g;c=(c|-c)>>31;l|=a&c;a=k>>>9&f;a|=a>>>9&f;l|=a&-(a>>>9&
g);a=k>>>8&m;a|=a>>>8&m;l|=a&-(a>>>8&g);a=k>>>7&f;a|=a>>>7&f;l|=a&-(a>>>7&g);a=k|k>>>1&f;f&=f>>>1;a|=a>>>2&f;a=(a|a>>>4&f&f>>>2)>>>1;p.f1=e|b&c;p.f0=l|a&-(a&g)<<1};

// 置換表のサイズ
// これより大きくすると逆に遅くなる
const MAX_TABLE_SIZE = 0x80000;

function table_index(p1, p0, o1, o0) {
    return ((p1 * 2 + p0 * 3 + o1 * 5 + o0 * 7) >>> 7) & 0x7ffff;
}

let ReversiSolver = function () {
    let leaf = 0;
    let nodes = 0;

    // const temp = {};

    // αβ探索
    const search_final = function (p1, p0, o1, o0, min, max, passed) {
        let player_score = popcount64(p1, p0);
        let opponent_score = popcount64(o1, o0);

        if (player_score + opponent_score === 63) {
            let m1 = ~(p1 | o1);
            let m0 = ~(p0 | o0);

            ++nodes; // このノード

            if (m0) {
                // flip0(p1, p0, o1, o0, m0, temp);

                let f1 = 0;
                let f0 = 0;
                {
                    let d = p1;
                    let g = p0;
                    let n = o1;
                    let m = o0;
                    let k = m0;
                    
                    let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(f|~e)+1&e&g;let l=a-((a|-a)>>>31)&e;a=k<<9&f;a|=a<<9&f;a|=a<<9&f;let b=(a|k)>>>23&h;b|=b<<9&h;b|=b<<9&h;let c=(b<<9|a>>>23)&d|a<<9&g;c=(c|-c)>>31;e=0|b&c;l|=a&c;a=k<<8&m;a|=a<<8&m;a|=a<<8&m;b=(a|k)>>>24&n;b|=b<<8&n;b|=b<<8&n;c=(b<<8|a>>>24)&d|a<<8&g;c=(c|-c)>>31;e|=b&c;l|=a&c;a=k<<7&f;a|=a<<7&f;a|=a<<7&f;b=(a|k)>>>25&h;b|=b<<7&h;b|=b<<7&h;c=(b<<7|a>>>25)&d|a<<7&g;c=(c|-c)>>31;l|=a&c;a=k>>>9&f;a|=a>>>9&f;l|=a&-(a>>>9&
                    g);a=k>>>8&m;a|=a>>>8&m;l|=a&-(a>>>8&g);a=k>>>7&f;a|=a>>>7&f;l|=a&-(a>>>7&g);a=k|k>>>1&f;f&=f>>>1;a|=a>>>2&f;a=(a|a>>>4&f&f>>>2)>>>1;
                    
                    f1=e|b&c;
                    f0=l|a&-(a&g)<<1};

                // おける
                if (f1 | f0) {
                    ++leaf; // 次のノードは葉

                    let flip_count = popcount64(f1, f0);
                    return player_score - opponent_score + 1 + flip_count * 2;
                }
                // おけない
                else {
                    // パス
                    // flip0(o1, o0, p1, p0, m0, temp);
                    {
                        let d = o1;
                        let g = o0;
                        let n = p1;
                        let m = p0;
                        let k = m0;
                        
                        let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(f|~e)+1&e&g;let l=a-((a|-a)>>>31)&e;a=k<<9&f;a|=a<<9&f;a|=a<<9&f;let b=(a|k)>>>23&h;b|=b<<9&h;b|=b<<9&h;let c=(b<<9|a>>>23)&d|a<<9&g;c=(c|-c)>>31;e=0|b&c;l|=a&c;a=k<<8&m;a|=a<<8&m;a|=a<<8&m;b=(a|k)>>>24&n;b|=b<<8&n;b|=b<<8&n;c=(b<<8|a>>>24)&d|a<<8&g;c=(c|-c)>>31;e|=b&c;l|=a&c;a=k<<7&f;a|=a<<7&f;a|=a<<7&f;b=(a|k)>>>25&h;b|=b<<7&h;b|=b<<7&h;c=(b<<7|a>>>25)&d|a<<7&g;c=(c|-c)>>31;l|=a&c;a=k>>>9&f;a|=a>>>9&f;l|=a&-(a>>>9&
                        g);a=k>>>8&m;a|=a>>>8&m;l|=a&-(a>>>8&g);a=k>>>7&f;a|=a>>>7&f;l|=a&-(a>>>7&g);a=k|k>>>1&f;f&=f>>>1;a|=a>>>2&f;a=(a|a>>>4&f&f>>>2)>>>1;
                        
                        f1=e|b&c;
                        f0=l|a&-(a&g)<<1};

                    let flip_count = popcount64(f1, f0);
                    return flip_count ? (++leaf, (player_score - opponent_score - 1 - flip_count * 2)) : (player_score - opponent_score);
                }
            }
            else {
                // flip1(p1, p0, o1, o0, m1, temp);
                let f1 = 0;
                let f0 = 0;
                {
                    
                    let d = p1;
                    let g = p0;
                    let n = o1;
                    let m = o0;
                    let k = m1;
                    
                    let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(h|~e)+1&e&d;let l=a-((a|-a)>>>31)&e;e=134480384*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=16843008*k;a=(n|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=2113664*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;a=k>>>9&h;a|=a>>>9&h;a|=a>>>9&h;let b=(a|k)<<23&f;b|=b>>>9&f;b|=b>>>9&f;let c=a>>>9&d|(b>>>9|a<<23)&g;c=(c|-c)>>31;l|=a&c;e=0|b&c;a=k>>>8&n;a|=a>>>8&n;a|=a>>>8&n;b=(a|k)<<24&m;b|=b>>>8&m;b|=b>>>8&m;c=a>>>8&d|(b>>>8|a<<24)&g;c=(c|-c)>>31;
                    l|=a&c;e|=b&c;a=k>>>7&h;a|=a>>>7&h;a|=a>>>7&h;b=(a|k)<<25&f;b|=b>>>7&f;b|=b>>>7&f;c=a>>>7&d|(b>>>7|a<<25)&g;c=(c|-c)>>31;l|=a&c;a=k|k>>>1&h;h&=h>>>1;a|=a>>>2&h;a=(a|a>>>4&h&h>>>2)>>>1;
                    
                    f1=l|a&-(a&d)<<1;
                    f0=e|b&c}

                // おける
                if (f1 | f0) {
                    ++leaf; // 次のノードは葉

                    let flip_count = popcount64(f1, f0);
                    return player_score - opponent_score + 1 + flip_count * 2;
                }
                // おけない
                else {
                    // パス
                    // flip1(o1, o0, p1, p0, m1, temp);
                    {
                        let d = o1;
                        let g = o0;
                        let n = p1;
                        let m = p0;
                        let k = m1;
                        
                        let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(h|~e)+1&e&d;let l=a-((a|-a)>>>31)&e;e=134480384*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=16843008*k;a=(n|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=2113664*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;a=k>>>9&h;a|=a>>>9&h;a|=a>>>9&h;let b=(a|k)<<23&f;b|=b>>>9&f;b|=b>>>9&f;let c=a>>>9&d|(b>>>9|a<<23)&g;c=(c|-c)>>31;l|=a&c;e=0|b&c;a=k>>>8&n;a|=a>>>8&n;a|=a>>>8&n;b=(a|k)<<24&m;b|=b>>>8&m;b|=b>>>8&m;c=a>>>8&d|(b>>>8|a<<24)&g;c=(c|-c)>>31;
                        l|=a&c;e|=b&c;a=k>>>7&h;a|=a>>>7&h;a|=a>>>7&h;b=(a|k)<<25&f;b|=b>>>7&f;b|=b>>>7&f;c=a>>>7&d|(b>>>7|a<<25)&g;c=(c|-c)>>31;l|=a&c;a=k|k>>>1&h;h&=h>>>1;a|=a>>>2&h;a=(a|a>>>4&h&h>>>2)>>>1;
                        
                        f1=l|a&-(a&d)<<1;
                        f0=e|b&c}

                    let flip_count = popcount64(f1, f0);
                    return flip_count ? (++leaf, (player_score - opponent_score - 1 - flip_count * 2)) : (player_score - opponent_score);
                }
            }
        }

        // 偶数理論にもとづいて探索

        let blank0 = ~(p0 | o0);

        let blank_left = blank0 & 0xf0f0f0f0;
        let blank_right = blank0 & 0x0f0f0f0f;

        let target0 = blank_left & -parity(blank_left) | blank_right & -parity(blank_right);
        blank0 ^= target0;

        let blank1 = ~(p1 | o1);

        blank_left = blank1 & 0xf0f0f0f0;
        blank_right = blank1 & 0x0f0f0f0f;

        let target1 = blank_left & -parity(blank_left) | blank_right & -parity(blank_right);
        blank1 ^= target1;

        let pass = true;

        for (let bit = target0 & -target0; bit; target0 ^= bit, bit = target0 & -target0) {
            // flip0(p1, p0, o1, o0, b, temp);

            let f0 = 0;
            let f1 = 0;
            {
                let d = p1;
                let g = p0;
                let n = o1;
                let m = o0;
                let k = bit;
                
                let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(f|~e)+1&e&g;let l=a-((a|-a)>>>31)&e;a=k<<9&f;a|=a<<9&f;a|=a<<9&f;let b=(a|k)>>>23&h;b|=b<<9&h;b|=b<<9&h;let c=(b<<9|a>>>23)&d|a<<9&g;c=(c|-c)>>31;e=0|b&c;l|=a&c;a=k<<8&m;a|=a<<8&m;a|=a<<8&m;b=(a|k)>>>24&n;b|=b<<8&n;b|=b<<8&n;c=(b<<8|a>>>24)&d|a<<8&g;c=(c|-c)>>31;e|=b&c;l|=a&c;a=k<<7&f;a|=a<<7&f;a|=a<<7&f;b=(a|k)>>>25&h;b|=b<<7&h;b|=b<<7&h;c=(b<<7|a>>>25)&d|a<<7&g;c=(c|-c)>>31;l|=a&c;a=k>>>9&f;a|=a>>>9&f;l|=a&-(a>>>9&
                g);a=k>>>8&m;a|=a>>>8&m;l|=a&-(a>>>8&g);a=k>>>7&f;a|=a>>>7&f;l|=a&-(a>>>7&g);a=k|k>>>1&f;f&=f>>>1;a|=a>>>2&f;a=(a|a>>>4&f&f>>>2)>>>1;
                
                f1=e|b&c;
                f0=l|a&-(a&g)<<1};

            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1, p0 ^ f0 | bit, -max, -min, false);

                if (score >= max) return ++nodes, score;

                min = min < score ? score : min;
            }
        }

        for (let bit = target1 & -target1; bit; target1 ^= bit, bit = target1 & -target1) {
            // flip1(p1, p0, o1, o0, bit, temp);

            let f0 = 0;
            let f1 = 0;

            {
                let d = p1;
                let g = p0;
                let n = o1;
                let m = o0;
                let k = bit;
                
                let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(h|~e)+1&e&d;let l=a-((a|-a)>>>31)&e;e=134480384*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=16843008*k;a=(n|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=2113664*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;a=k>>>9&h;a|=a>>>9&h;a|=a>>>9&h;let b=(a|k)<<23&f;b|=b>>>9&f;b|=b>>>9&f;let c=a>>>9&d|(b>>>9|a<<23)&g;c=(c|-c)>>31;l|=a&c;e=0|b&c;a=k>>>8&n;a|=a>>>8&n;a|=a>>>8&n;b=(a|k)<<24&m;b|=b>>>8&m;b|=b>>>8&m;c=a>>>8&d|(b>>>8|a<<24)&g;c=(c|-c)>>31;
                l|=a&c;e|=b&c;a=k>>>7&h;a|=a>>>7&h;a|=a>>>7&h;b=(a|k)<<25&f;b|=b>>>7&f;b|=b>>>7&f;c=a>>>7&d|(b>>>7|a<<25)&g;c=(c|-c)>>31;l|=a&c;a=k|k>>>1&h;h&=h>>>1;a|=a>>>2&h;a=(a|a>>>4&h&h>>>2)>>>1;
                
                f1=l|a&-(a&d)<<1;
                f0=e|b&c}


            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1 | bit, p0 ^ f0, -max, -min, false);

                if (score >= max) return ++nodes, score;

                min = min < score ? score : min;
            }
        }

        for (let bit = blank0 & -blank0; bit; blank0 ^= bit, bit = blank0 & -blank0) {
            //flip0(p1, p0, o1, o0, bit, temp);

            let f0 = 0;
            let f1 = 0;
            {
                let d = p1;
                let g = p0;
                let n = o1;
                let m = o0;
                let k = bit;
                
                let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(f|~e)+1&e&g;let l=a-((a|-a)>>>31)&e;a=k<<9&f;a|=a<<9&f;a|=a<<9&f;let b=(a|k)>>>23&h;b|=b<<9&h;b|=b<<9&h;let c=(b<<9|a>>>23)&d|a<<9&g;c=(c|-c)>>31;e=0|b&c;l|=a&c;a=k<<8&m;a|=a<<8&m;a|=a<<8&m;b=(a|k)>>>24&n;b|=b<<8&n;b|=b<<8&n;c=(b<<8|a>>>24)&d|a<<8&g;c=(c|-c)>>31;e|=b&c;l|=a&c;a=k<<7&f;a|=a<<7&f;a|=a<<7&f;b=(a|k)>>>25&h;b|=b<<7&h;b|=b<<7&h;c=(b<<7|a>>>25)&d|a<<7&g;c=(c|-c)>>31;l|=a&c;a=k>>>9&f;a|=a>>>9&f;l|=a&-(a>>>9&
                g);a=k>>>8&m;a|=a>>>8&m;l|=a&-(a>>>8&g);a=k>>>7&f;a|=a>>>7&f;l|=a&-(a>>>7&g);a=k|k>>>1&f;f&=f>>>1;a|=a>>>2&f;a=(a|a>>>4&f&f>>>2)>>>1;
                
                f1=e|b&c;
                f0=l|a&-(a&g)<<1};

            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1, p0 ^ f0 | bit, -max, -min, false);

                if (score >= max) return ++nodes, score;

                min = min < score ? score : min;
            }
        }

        for (let bit = blank1 & -blank1; bit; blank1 ^= bit, bit = blank1 & -blank1) {
            // flip1(p1, p0, o1, o0, bit, temp);

            let f0 = 0;
            let f1 = 0;

            {
                let d = p1;
                let g = p0;
                let n = o1;
                let m = o0;
                let k = bit;
                
                let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(h|~e)+1&e&d;let l=a-((a|-a)>>>31)&e;e=134480384*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=16843008*k;a=(n|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=2113664*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;a=k>>>9&h;a|=a>>>9&h;a|=a>>>9&h;let b=(a|k)<<23&f;b|=b>>>9&f;b|=b>>>9&f;let c=a>>>9&d|(b>>>9|a<<23)&g;c=(c|-c)>>31;l|=a&c;e=0|b&c;a=k>>>8&n;a|=a>>>8&n;a|=a>>>8&n;b=(a|k)<<24&m;b|=b>>>8&m;b|=b>>>8&m;c=a>>>8&d|(b>>>8|a<<24)&g;c=(c|-c)>>31;
                l|=a&c;e|=b&c;a=k>>>7&h;a|=a>>>7&h;a|=a>>>7&h;b=(a|k)<<25&f;b|=b>>>7&f;b|=b>>>7&f;c=a>>>7&d|(b>>>7|a<<25)&g;c=(c|-c)>>31;l|=a&c;a=k|k>>>1&h;h&=h>>>1;a|=a>>>2&h;a=(a|a>>>4&h&h>>>2)>>>1;
                
                f1=l|a&-(a&d)<<1;
                f0=e|b&c}

            // おける
            if (f0 | f1) {
                pass = false;
                let score = -search_final(o1 ^ f1, o0 ^ f0, p1 ^ f1 | bit, p0 ^ f0, -max, -min, false);

                if (score >= max) return ++nodes, score;

                min = min < score ? score : min;
            }
        }

        if (pass) {
            // 2回連続パスならこのノードは葉
            return passed ? (++leaf, player_score - opponent_score)
                : -search_final(o1, o0, p1, p0, -max, -min, true);
        }

        return ++nodes, min;
    };

    // 置換表
    const transposition_table = [];
    transposition_table.length = MAX_TABLE_SIZE;

    // negascout + fastest-first heuristic + 置換表
    const search = function (p1, p0, o1, o0, alpha, beta, passed) {
        let player_score = popcount64(p1, p0);
        let opponent_score = popcount64(o1, o0);

        // 葉に近い枝
        if (player_score + opponent_score >= 58) {
            return search_final(p1, p0, o1, o0, alpha, beta, passed);
        }

        // mobility(p1, p0, o1, o0, temp);
        let mob1 = 0;
        let mob0 = 0;
        {
            let d = p1;
            let g = p0;
            let n = o1;
            let m = o0;
            
            let p=~(d|n),h=~(g|m),f=n&2122219134,e=m&2122219134;let a=d<<1;let l=g<<1;a=f+a&p&~a;l=e+l&h&~l;let b=g;b|=b>>>1&e;e&=e>>>1;b|=b>>>2&e;l|=((b|b>>>4&e&e>>>2)^g)>>>1&h;let c=d;c|=c>>>1&f;f&=f>>>1;c|=c>>>2&f;a|=((c|c>>>4&f&f>>>2)^d)>>>1&p;f=n&16777215;e=m&4294967040;b=g<<8&e;b|=b<<8&e;b|=b<<8&e;c=(d<<8|(b|g)>>>24)&f;c|=c<<8&f;a|=((c|c<<8&f)<<8|b>>>24)&p;l|=b<<8&h;c=d>>>8&f;c|=c>>>8&f;c|=c>>>8&f;b=(g>>>8|(c|d)<<24)&e;b|=b>>>8&e;a|=c>>>8&p;l|=((b|b>>>8&e)>>>8|c<<24)&h;f=n&
            8289918;e=m&2122219008;b=g<<9&e;b|=b<<9&e;b|=b<<9&e;c=(d<<9|(b|g)>>>23)&f;c|=c<<9&f;a|=((c|c<<9&f)<<9|b>>>23)&p;l|=b<<9&h;c=d>>>9&f;c|=c>>>9&f;c|=c>>>9&f;b=(g>>>9|(c|d)<<23)&e;b|=b>>>9&e;a|=c>>>9&p;l|=((b|b>>>9&e)>>>9|c<<23)&h;b=g<<7&e;b|=b<<7&e;b|=b<<7&e;c=(d<<7|(b|g)>>>25)&f;c|=c<<7&f;a|=((c|c<<7&f)<<7|b>>>25)&p;l|=b<<7&h;c=d>>>7&f;c|=c>>>7&f;c|=c>>>7&f;b=(g>>>7|(c|d)<<25)&e;b|=b>>>7&e;
            
            mob1=a|c>>>7&p;
            mob0=l|((b|b>>>7&e)>>>7|c<<25)&h}

        // パスの処理
        if ((mob1 | mob0) === 0) {
            return passed ? (++leaf, player_score - opponent_score)
                : -search(o1, o0, p1, p0, -beta, -alpha, true);
        }

        let upper_bound = 64;
        let lower_bound = -64;
        let index = table_index(p1, p0, o1, o0);
        let value = transposition_table[index];

        if (value && value.p1 === p1 && value.p0 === p0 && value.o1 === o1 && value.o0 === o0) {
            upper_bound = value.upper_bound;
            lower_bound = value.lower_bound;

            if (lower_bound >= beta) return lower_bound;
            else if (upper_bound <= alpha) return upper_bound;
            else if (upper_bound === lower_bound) return upper_bound;

            alpha = lower_bound > alpha ? lower_bound : alpha;
            beta = upper_bound < beta ? upper_bound : beta;
        }
        else {
            value = {
                p1: p1,
                p0: p0,
                o1: o1,
                o0: o0,
                lower_bound: lower_bound,
                upper_bound: upper_bound
            };
        }

        ++nodes;

        // ソート
        let ordered_moves = [];

        // 0-31
        for (let bit = mob0 & -mob0; mob0; mob0 ^= bit, bit = mob0 & -mob0) {
            let move_data = {};

            // flip0(p1, p0, o1, o0, bit, temp);
            // let f0 = temp.f0;
            // let f1 = temp.f1;

            let f0 = 0;
            let f1 = 0;
            {
                let d = p1;
                let g = p0;
                let n = o1;
                let m = o0;
                let k = bit;
                
                let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(f|~e)+1&e&g;let l=a-((a|-a)>>>31)&e;a=k<<9&f;a|=a<<9&f;a|=a<<9&f;let b=(a|k)>>>23&h;b|=b<<9&h;b|=b<<9&h;let c=(b<<9|a>>>23)&d|a<<9&g;c=(c|-c)>>31;e=0|b&c;l|=a&c;a=k<<8&m;a|=a<<8&m;a|=a<<8&m;b=(a|k)>>>24&n;b|=b<<8&n;b|=b<<8&n;c=(b<<8|a>>>24)&d|a<<8&g;c=(c|-c)>>31;e|=b&c;l|=a&c;a=k<<7&f;a|=a<<7&f;a|=a<<7&f;b=(a|k)>>>25&h;b|=b<<7&h;b|=b<<7&h;c=(b<<7|a>>>25)&d|a<<7&g;c=(c|-c)>>31;l|=a&c;a=k>>>9&f;a|=a>>>9&f;l|=a&-(a>>>9&
                g);a=k>>>8&m;a|=a>>>8&m;l|=a&-(a>>>8&g);a=k>>>7&f;a|=a>>>7&f;l|=a&-(a>>>7&g);a=k|k>>>1&f;f&=f>>>1;a|=a>>>2&f;a=(a|a>>>4&f&f>>>2)>>>1;
                
                f1=e|b&c;
                f0=l|a&-(a&g)<<1};

            move_data.p0 = p0 ^ f0 | bit;
            move_data.p1 = p1 ^ f1;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            // mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            let m0 = 0;
            let m1 = 0;
            {
                let d = move_data.o1;
                let g = move_data.o0;
                let n = move_data.p1;
                let m = move_data.p0;
                
                let p=~(d|n),h=~(g|m),f=n&2122219134,e=m&2122219134;let a=d<<1;let l=g<<1;a=f+a&p&~a;l=e+l&h&~l;let b=g;b|=b>>>1&e;e&=e>>>1;b|=b>>>2&e;l|=((b|b>>>4&e&e>>>2)^g)>>>1&h;let c=d;c|=c>>>1&f;f&=f>>>1;c|=c>>>2&f;a|=((c|c>>>4&f&f>>>2)^d)>>>1&p;f=n&16777215;e=m&4294967040;b=g<<8&e;b|=b<<8&e;b|=b<<8&e;c=(d<<8|(b|g)>>>24)&f;c|=c<<8&f;a|=((c|c<<8&f)<<8|b>>>24)&p;l|=b<<8&h;c=d>>>8&f;c|=c>>>8&f;c|=c>>>8&f;b=(g>>>8|(c|d)<<24)&e;b|=b>>>8&e;a|=c>>>8&p;l|=((b|b>>>8&e)>>>8|c<<24)&h;f=n&
                8289918;e=m&2122219008;b=g<<9&e;b|=b<<9&e;b|=b<<9&e;c=(d<<9|(b|g)>>>23)&f;c|=c<<9&f;a|=((c|c<<9&f)<<9|b>>>23)&p;l|=b<<9&h;c=d>>>9&f;c|=c>>>9&f;c|=c>>>9&f;b=(g>>>9|(c|d)<<23)&e;b|=b>>>9&e;a|=c>>>9&p;l|=((b|b>>>9&e)>>>9|c<<23)&h;b=g<<7&e;b|=b<<7&e;b|=b<<7&e;c=(d<<7|(b|g)>>>25)&f;c|=c<<7&f;a|=((c|c<<7&f)<<7|b>>>25)&p;l|=b<<7&h;c=d>>>7&f;c|=c>>>7&f;c|=c>>>7&f;b=(g>>>7|(c|d)<<25)&e;b|=b>>>7&e;
                
                m1=a|c>>>7&p;
                m0=l|((b|b>>>7&e)>>>7|c<<25)&h}

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }

        // 32-64
        for (let bit = mob1 & -mob1; mob1; mob1 ^= bit, bit = mob1 & -mob1) {
            let move_data = {};

            // flip1(p1, p0, o1, o0, b, temp);
            // let f0 = temp.f0;
            // let f1 = temp.f1;
            let f0 = 0;
            let f1 = 0;

            {
                let d = p1;
                let g = p0;
                let n = o1;
                let m = o0;
                let k = bit;
                
                let h=n&2122219134,f=m&2122219134;let e=254*k;let a=(h|~e)+1&e&d;let l=a-((a|-a)>>>31)&e;e=134480384*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=16843008*k;a=(n|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;e=2113664*k;a=(h|~e)+1&e&d;l|=a-((a|-a)>>>31)&e;a=k>>>9&h;a|=a>>>9&h;a|=a>>>9&h;let b=(a|k)<<23&f;b|=b>>>9&f;b|=b>>>9&f;let c=a>>>9&d|(b>>>9|a<<23)&g;c=(c|-c)>>31;l|=a&c;e=0|b&c;a=k>>>8&n;a|=a>>>8&n;a|=a>>>8&n;b=(a|k)<<24&m;b|=b>>>8&m;b|=b>>>8&m;c=a>>>8&d|(b>>>8|a<<24)&g;c=(c|-c)>>31;
                l|=a&c;e|=b&c;a=k>>>7&h;a|=a>>>7&h;a|=a>>>7&h;b=(a|k)<<25&f;b|=b>>>7&f;b|=b>>>7&f;c=a>>>7&d|(b>>>7|a<<25)&g;c=(c|-c)>>31;l|=a&c;a=k|k>>>1&h;h&=h>>>1;a|=a>>>2&h;a=(a|a>>>4&h&h>>>2)>>>1;
                
                f1=l|a&-(a&d)<<1;
                f0=e|b&c}

            move_data.p0 = p0 ^ f0;
            move_data.p1 = p1 ^ f1 | bit;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            // mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            // let m0 = temp.mob0;
            // let m1 = temp.mob1;
            let m0 = 0;
            let m1 = 0;
            {
                let d = move_data.o1;
                let g = move_data.o0;
                let n = move_data.p1;
                let m = move_data.p0;
                
                let p=~(d|n),h=~(g|m),f=n&2122219134,e=m&2122219134;let a=d<<1;let l=g<<1;a=f+a&p&~a;l=e+l&h&~l;let b=g;b|=b>>>1&e;e&=e>>>1;b|=b>>>2&e;l|=((b|b>>>4&e&e>>>2)^g)>>>1&h;let c=d;c|=c>>>1&f;f&=f>>>1;c|=c>>>2&f;a|=((c|c>>>4&f&f>>>2)^d)>>>1&p;f=n&16777215;e=m&4294967040;b=g<<8&e;b|=b<<8&e;b|=b<<8&e;c=(d<<8|(b|g)>>>24)&f;c|=c<<8&f;a|=((c|c<<8&f)<<8|b>>>24)&p;l|=b<<8&h;c=d>>>8&f;c|=c>>>8&f;c|=c>>>8&f;b=(g>>>8|(c|d)<<24)&e;b|=b>>>8&e;a|=c>>>8&p;l|=((b|b>>>8&e)>>>8|c<<24)&h;f=n&
                8289918;e=m&2122219008;b=g<<9&e;b|=b<<9&e;b|=b<<9&e;c=(d<<9|(b|g)>>>23)&f;c|=c<<9&f;a|=((c|c<<9&f)<<9|b>>>23)&p;l|=b<<9&h;c=d>>>9&f;c|=c>>>9&f;c|=c>>>9&f;b=(g>>>9|(c|d)<<23)&e;b|=b>>>9&e;a|=c>>>9&p;l|=((b|b>>>9&e)>>>9|c<<23)&h;b=g<<7&e;b|=b<<7&e;b|=b<<7&e;c=(d<<7|(b|g)>>>25)&f;c|=c<<7&f;a|=((c|c<<7&f)<<7|b>>>25)&p;l|=b<<7&h;c=d>>>7&f;c|=c>>>7&f;c|=c>>>7&f;b=(g>>>7|(c|d)<<25)&e;b|=b>>>7&e;
                
                m1=a|c>>>7&p;
                m0=l|((b|b>>>7&e)>>>7|c<<25)&h}

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }

        // negascout
        let best_move = ordered_moves[0];
        let best_score = -search(best_move.o1, best_move.o0, best_move.p1, best_move.p0, -beta, -alpha, false);

        if (best_score >= beta) {
            value.lower_bound = best_score > lower_bound ? best_score : lower_bound;
            value.upper_bound = upper_bound;

            transposition_table[index] = value;

            return best_score;
        }

        // 常に a >= best_score
        for (let i = 1, a = best_score > alpha ? best_score : alpha; i < ordered_moves.length; ++i) {
            let move = ordered_moves[i];

            let score = -search(move.o1, move.o0, move.p1, move.p0, -a - 1, -a, false);

            if (score >= beta) {
                // この局面のミニマックス値はscore以上upper_bound以下
                value.lower_bound = score > lower_bound ? score : lower_bound;
                value.upper_bound = upper_bound;

                transposition_table[index] = value;

                return score;
            }
            else if (score > a) {
                // 再探索
                a = best_score = -search(move.o1, move.o0, move.p1, move.p0, -beta, -score, false);

                if (best_score >= beta) {
                    value.lower_bound = best_score > lower_bound ? best_score : lower_bound;
                    value.upper_bound = upper_bound;

                    transposition_table[index] = value;

                    return best_score;
                }
            }
            // score <= a
            // best_scoreがalpha値未満の時に必要
            else {
                best_score = score > best_score ? score : best_score;
            }
        }

        // alpha < best_score == ミニマックス値 < beta
        if (best_score > alpha) {
            value.lower_bound = best_score;
            value.upper_bound = best_score;

        }
        // best_score <= alpha
        else {
            value.lower_bound = lower_bound;
            value.upper_bound = best_score < upper_bound ? best_score : upper_bound;
        }

        transposition_table[index] = value;

        return best_score;
    };

    this.solve = function (p1, p0, o1, o0) {
        let start = Date.now();

        let temp = {};
        mobility(p1, p0, o1, o0, temp);

        let mob0 = temp.mob0;
        let mob1 = temp.mob1;

        // 手のソート
        let ordered_moves = [];

        // 0-31
        for (let b = mob0 & -mob0; mob0; mob0 ^= b, b = mob0 & -mob0) {
            let move_data = { sq_bit: b, offset: 0 };

            flip0(p1, p0, o1, o0, b, temp);
            let f0 = temp.f0;
            let f1 = temp.f1;

            move_data.p0 = p0 ^ f0 | b;
            move_data.p1 = p1 ^ f1;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            let m0 = temp.mob0;
            let m1 = temp.mob1;

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }

        // 32-64
        for (let b = mob1 & -mob1; mob1; mob1 ^= b, b = mob1 & -mob1) {
            let move_data = { sq_bit: b, offset: 32 };

            flip1(p1, p0, o1, o0, b, temp);
            let f0 = temp.f0;
            let f1 = temp.f1;

            move_data.p0 = p0 ^ f0;
            move_data.p1 = p1 ^ f1 | b;
            move_data.o0 = o0 ^ f0;
            move_data.o1 = o1 ^ f1;

            mobility(move_data.o1, move_data.o0, move_data.p1, move_data.p0, temp);
            let m0 = temp.mob0;
            let m1 = temp.mob1;

            let weighted_mobility = popcount64(m1, m0) + (m1 >>> 24 & 1) + (m1 >>> 31) + (m0 >>> 7 & 1) + (m0 & 1);
            move_data.weighted_mobility = weighted_mobility;

            let move_count = ordered_moves.length;
            for (let i = 0; i < move_count; ++i) {
                // 少ない順に並べる
                if (weighted_mobility < ordered_moves[i].weighted_mobility) {
                    ordered_moves.splice(i, 0, move_data);
                    break;
                }
            }

            if (ordered_moves.length == move_count) {
                ordered_moves.push(move_data);
            }
        }


        let move_count = ordered_moves.length;
        let best_move = ordered_moves[0];
        let best_score = -search(best_move.o1, best_move.o0, best_move.p1, best_move.p0, -64, 64, false);

        for (let i = 1; i < move_count; ++i) {
            let move = ordered_moves[i];

            // null-window search
            let score = -search(move.o1, move.o0, move.p1, move.p0, -best_score - 1, -best_score, false);

            if (score > best_score) {
                // 再探索
                best_score = -search(move.o1, move.o0, move.p1, move.p0, -64, -score, false);
                best_move = move;
            }
        }

        let end = Date.now();
        let move_sq = tzcnt(best_move.sq_bit) + best_move.offset;

        return {
            "result": best_score,
            "nodes": nodes + leaf,
            "elapsed": end - start,
            "x": move_sq % 8,
            "y": move_sq / 8 | 0
        };
    }
}

self.addEventListener("message", function (position) {
    let board = position.data;

    let solver = new ReversiSolver();
    let result = solver.solve(board["p1"], board["p0"], board["o1"], board["o0"]);

    result["exact"] = true;

    self.postMessage(result);
});