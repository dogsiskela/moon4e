export default function calcPosFromLatLonRad(lat, lon, radius) {

    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);

    let x = -((radius + 0.5) * Math.sin(phi) * Math.cos(theta));
    let z = ((radius + 0.5) * Math.sin(phi) * Math.sin(theta));
    let y = ((radius + 0.5) * Math.cos(phi));

    return [x, y, z];
}