export default function UUID() {
    this.id = this.createUUID();
}
UUID.prototype.valueOf = () => this.id;
UUID.prototype.toString = () => this.id;
UUID.prototype.createUUID = () => {
    const dg = new Date(1582, 10, 15, 0, 0, 0, 0);
    const dc = new Date();
    const t = dc.getTime() - dg.getTime();
    const tl = UUID.getIntegerBits(t, 0, 31);
    const tm = UUID.getIntegerBits(t, 32, 47);
    const thv = `${UUID.getIntegerBits(t, 48, 59)}1`; // version 1, security version is 2
    const csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
    const csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
    const n =
        UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
        UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
        UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
        UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
        UUID.getIntegerBits(UUID.rand(8191), 0, 15); // this last number is two octets long
    return tl + tm + thv + csar + csl + n;
};

UUID.getIntegerBits = (val, start, end) => {
    const base16 = UUID.returnBase(val, 16);
    const quadArray = [];
    let quadString = '';
    let i = 0;
    for (i = 0; i < base16.length; i++) {
        quadArray.push(base16.substring(i, i + 1));
    }
    for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
        if (!quadArray[i] || quadArray[i] === '') quadString += '0';
        else quadString += quadArray[i];
    }
    return quadString;
};

UUID.returnBase = (number, base) => number.toString(base).toUpperCase();

UUID.rand = (max) => Math.floor(Math.random() * (max + 1));
