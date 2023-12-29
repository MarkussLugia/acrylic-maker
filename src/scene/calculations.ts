export function calcEase(rawDelta: number):number {
    let pos = 1;
    let delta = rawDelta;
    if (rawDelta < 0) {
        pos = -1;
        delta = -rawDelta;
    }
    return generateFinalDelta(delta) * pos
}
function generateFinalDelta(positiveDelta: number):number {
    let plusRound = 0
    if (positiveDelta > (Math.PI * 2 + 2)) plusRound = Math.PI * 2
    if (positiveDelta > 2) return 0.2 + plusRound;
    if (positiveDelta > 0.1) return positiveDelta / 10 + plusRound;
    if (positiveDelta > 0.05) return 0.01 + plusRound;
    if (positiveDelta > 0.02) return 0.004 + plusRound;
    if (positiveDelta > 0.004) return 0.002 + plusRound;
    else return positiveDelta

}
export function calcAlignDegs(deg: number):number {
    let r = deg < 0 ? -deg : deg;
    r = r % Math.PI;
    let n = Math.PI - r;
    let d = r < n ? r : n;
    return d;
}
export function calcOpacity(distance: number):number[] {
    let parameterClose = - distance + 0.1;
    let parameterFar = - distance + 0.4;
    let result = [1, 0];
    if (parameterClose < 0) result[0] = 1;
    else {
        if (parameterClose / 0.1 > 0.8) {
            result[0] = 0;
        }
        else {
            let mappedParam = 0.99 - Math.sin((parameterClose / (0.1 * 0.8)) * Math.PI / 2);
            result[0] = mappedParam < 0 ? 0 : mappedParam;
        }
    }
    if (parameterFar < 0) result[1] = 0;
    else {
        let mappedParam = 1 - Math.cos((parameterFar / 0.4) * Math.PI / 2);
        result[1] = mappedParam < 0 ? 0 : mappedParam;
    }
    return result;
}