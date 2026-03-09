import kaplay from "kaplay";

export default function initGame() {
    if (window.__kaplayInitialized) return;
    window.__kaplayInitialized = true;
    
    const canvas = document.getElementById("game-canvas");
    if (!canvas) return;

    canvas.style.imageRendering = "pixelated"; 
    canvas.style.imageRendering = "crisp-edges";

    const k = kaplay({
        global: false,
        canvas: canvas,
        width: 500,
        height: 700,
        background: [255, 248, 220],
        pixelDensity: window.devicePixelRatio || 2, 
        texFilter: "linear",
    });

    k.setGravity(1500);

    k.loadSprite("losos", "/losos.png");
    k.loadSprite("logo", "/logo.png");
    k.loadSprite("studenkova", "/studenkova.png");
    k.loadSprite("meitnerova", "/meitnerova.png");
    k.loadSprite("vana", "/vana.png");
    // chybi papula
    k.loadSprite("adamek", "/adamek.png");
    k.loadSprite("prochazka", "/prochazka.png");
    k.loadSprite("masopust", "/masopust.png");
    k.loadSprite("mandik", "/mandik.png");


    const FRUITS = [
        { radius: 18, color: [255, 0, 0], score: 2, sprite: "losos"},
        { radius: 25, color: [255, 100, 100], score: 4 , sprite: "logo"},
        { radius: 32, color: [150, 0, 255], score: 6, sprite: "studenkova" },
        { radius: 40, color: [255, 255, 0], score: 10 , sprite: "meitnerova"},
        { radius: 50, color: [255, 150, 0], score: 15 , sprite: "vana"},
        { radius: 62, color: [255, 0, 50], score: 20},      // 6. Papula
        { radius: 75, color: [255, 255, 150], score: 28 , sprite: "adamek"},
        { radius: 90, color: [255, 50, 200], score: 36 , sprite: "prochazka"},
        { radius: 105, color: [255, 200, 0], score: 45 , sprite: "masopust"},
        { radius: 125, color: [0, 255, 0], score: 60 , sprite: "mandik"},
    ];

    const wallWidth = 20;
    const wallProps = (isStatic) => [
        k.area(),
        k.body({ isStatic: isStatic, friction: 0.5, restitution: 0.1 }),
    ];

    k.add([k.rect(k.width(), wallWidth), k.pos(0, k.height() - wallWidth), ...wallProps(true), "border"]);
    k.add([k.rect(wallWidth, k.height()), k.pos(0, 0), ...wallProps(true), "border"]);
    k.add([k.rect(wallWidth, k.height()), k.pos(k.width() - wallWidth, 0), ...wallProps(true), "border"]);

    function spawnFruitAt(x, y, level, isDropped = false) {
    const data = FRUITS[level];
    const imageWidth = 267; 
    const targetScale = (data.radius * 2) / imageWidth;

    const fruit = k.add([
        k.pos(x, y),
        k.anchor("center"),
        k.rotate(0), 
        "fruit",
        { 
            level: level, 
            isDropped: isDropped, 
            isMerging: false 
        }
    ]);

    if (data.sprite) {
        fruit.use(k.sprite(data.sprite));
        fruit.use(k.scale(targetScale));
    } else {
        fruit.use(k.circle(data.radius));
        fruit.use(k.color(data.color));
    }


    fruit.use(k.area({ shape: new k.Circle(k.vec2(0), data.radius / targetScale) }));

    fruit.use(k.body({ 
        isStatic: !isDropped, 
        friction: 0.5, 
        restitution: 0.2, 
        drag: 0.1
    }));

    return fruit;
}

    const getSpawnX = () => {
        const mx = k.mousePos ? k.mousePos().x : k.width() / 2;
        return k.clamp(mx, wallWidth + 30, k.width() - wallWidth - 30);
    };

    let currentFruit = null;
        const prepareNext = () => {
        const randomLevel = k.choose([0, 1, 2]);
        currentFruit = spawnFruitAt(getSpawnX(), 70, randomLevel, false);
    };

    k.wait(0.2, prepareNext);

    k.onUpdate(() => {
        if (currentFruit && !currentFruit.isDropped) {
            currentFruit.pos.x = k.clamp(k.mousePos().x, wallWidth + 30, k.width() - wallWidth - 30);
            currentFruit.pos.y = 70;
        }
    });

    k.onMousePress(() => {
    if (currentFruit && !currentFruit.isDropped) {
        const x = currentFruit.pos.x;
        const y = currentFruit.pos.y;
        const level = currentFruit.level;

        k.destroy(currentFruit);
        currentFruit = null;

        spawnFruitAt(x, y, level, true);
        
        k.wait(0.8, prepareNext);
    }
});

    k.onCollide("fruit", "fruit", (a, b) => {
        if (a.level !== b.level || a.isMerging || b.isMerging) return;
        if (a.level >= FRUITS.length - 1) return;

        a.isMerging = b.isMerging = true;
        const nextLevel = a.level + 1;
        const pos = a.pos.lerp(b.pos, 0.5);

        k.destroy(a);
        k.destroy(b);

        spawnFruitAt(pos.x, pos.y, nextLevel, true);
        window.dispatchEvent(new CustomEvent("addScore", { detail: FRUITS[nextLevel].score }));
    });
}