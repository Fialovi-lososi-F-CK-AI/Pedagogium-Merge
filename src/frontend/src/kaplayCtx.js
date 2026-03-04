import kaplay from "kaplay";

export default function  initKaplay(){
    return kaplay({
        width: 1920,
        height: 1080,
        letterbox: true,
        global: false,
        debug: false,
        debugKey: "m",
        canvas: document.getElementById("game"),
        pixelDensity: devicePixelRatio
    })
}