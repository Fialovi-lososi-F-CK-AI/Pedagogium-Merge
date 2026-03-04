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

    k.loadSprite("studenkova", "/studenkova.png");
    k.loadSprite("prochazka", "/prochazka.png");

    const FRUITS = [
        { radius: 18, color: [255, 0, 0], score: 2 },
        { radius: 25, color: [255, 100, 100], score: 4 },
        { radius: 32, color: [150, 0, 255], score: 6, sprite: "studenkova" },
        { radius: 40, color: [255, 255, 0], score: 10 },
        { radius: 50, color: [255, 150, 0], score: 15 },
        { radius: 62, color: [255, 0, 50], score: 20 },
        { radius: 75, color: [255, 255, 150], score: 28 },
        { radius: 90, color: [255, 50, 200], score: 36, sprite: "prochazka" },
        { radius: 105, color: [255, 200, 0], score: 45 },
        { radius: 125, color: [0, 255, 0], score: 60 },
    ];

    const wallWidth = 20;
    const wallProps = (isStatic) => [
        k.area(),
        k.body({ isStatic: isStatic, friction: 0.5, restitution: 0.1 }),
    ];

    k.add([k.rect(k.width(), wallWidth), k.pos(0, k.height() - wallWidth), ...wallProps(true), "border"]);
    k.add([k.rect(wallWidth, k.height()), k.pos(0, 0), ...wallProps(true), "border"]);
    k.add([k.rect(wallWidth, k.height()), k.pos(k.width() - wallWidth, 0), ...wallProps(true), "border"]);

    let aimX = k.width() / 2;
    const clampX = (x) => k.clamp(x, wallWidth + 30, k.width() - wallWidth - 30);

    function spawnFruitAt(x, y, level, isDropped = false) {
        const data = FRUITS[level];

        const fruit = k.add([
            k.pos(x, y),
            k.area({ shape: new k.Circle(k.vec2(0), data.radius) }),
            k.body({
                isStatic: !isDropped,
                friction: 0.3,
                restitution: 0.1,
            }),
            k.anchor("center"),
            "fruit",
            { level: level, isDropped: isDropped, isMerging: false },
        ]);

        if (data.sprite) {
            fruit.use(k.sprite(data.sprite));

            const checkSize = fruit.onUpdate(() => {
                if (fruit.width > 0) {
                    fruit.scale = k.vec2((data.radius * 2) / fruit.width);
                    checkSize.cancel();
                }
            });
        } else {
            fruit.use(k.circle(data.radius));
            fruit.use(k.color(data.color));
            fruit.use(k.outline(2, [0, 0, 0]));
        }

        return fruit;
    }

    let currentFruit = null;

    const prepareNext = () => {
        currentFruit = spawnFruitAt(aimX, 70, 0, false);
    };

    k.wait(0.2, prepareNext);

    k.onUpdate(() => {
        const mx = k.mousePos().x;
        if (Number.isFinite(mx)) {
            aimX = clampX(mx);
        }

        if (currentFruit && !currentFruit.isDropped) {
            currentFruit.pos.x = aimX;
            currentFruit.pos.y = 70;
        }
    });

    k.onMousePress(() => {
        if (currentFruit && !currentFruit.isDropped) {
            currentFruit.isDropped = true;

            if (currentFruit.body) currentFruit.body.isStatic = false;
            currentFruit.isStatic = false;

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