import kaplay from "kaplay";

export default function initGame() {
    const canvas = document.getElementById("game-canvas");
    if (!canvas) return;

    const COLORS = {
        background: [26, 26, 46],
        walls: [0, 255, 204],
        outline: [255, 255, 255],
    };

    canvas.style.imageRendering = "pixelated"; 
    canvas.style.imageRendering = "crisp-edges";

    const k = kaplay({
        global: false,
        canvas: canvas,
        width: 400,
        height: 700,
        background: COLORS.background, 
        pixelDensity: window.devicePixelRatio || 2, 
        texFilter: "linear",
    });

    k.setGravity(1000);

    k.loadSprite("losos", "/losos.png");
    k.loadSprite("logo", "/logo.png");
    k.loadSprite("studenkova", "/studenkova.png");
    k.loadSprite("meitnerova", "/meitnerova.png");
    k.loadSprite("vana", "/vana.png");
    k.loadSprite("adamek", "/adamek.png");
    k.loadSprite("prochazka", "/prochazka.png");
    k.loadSprite("masopust", "/masopust.png");
    k.loadSprite("mandik", "/mandik.png");

    const FRUITS = [
        { radius: 18, score: 2, sprite: "losos"},
        { radius: 25, score: 4 , sprite: "logo"},
        { radius: 32, score: 6, sprite: "studenkova" },
        { radius: 40, score: 10 , sprite: "meitnerova"},
        { radius: 50, score: 15 , sprite: "vana"},
        { radius: 62, score: 20, sprite: "losos"},
        { radius: 75, score: 28 , sprite: "adamek"},
        { radius: 90, score: 36 , sprite: "prochazka"},
        { radius: 105, score: 45 , sprite: "masopust"},
        { radius: 125, score: 100 , sprite: "mandik"},
    ];

    const wallWidth = 16;
    const wallProps = (isStatic) => [
        k.area(),
        k.outline(2, k.rgb(COLORS.walls)), // Neonový obrys stěn
        k.body({ isStatic: isStatic, friction: 0.5, restitution: 0.1 }),
        k.rect(k.width(), wallWidth),
        k.color(k.rgb(30, 30, 60)), // Tmavě modrá výplň stěn
    ];

    // Podlaha
    k.add([
        k.pos(0, k.height() - wallWidth), 
        k.rect(k.width(), wallWidth),
        k.area(),
        k.outline(2, k.rgb(COLORS.walls)),
        k.color(30, 30, 60),
        k.body({ isStatic: true }),
        "border"
    ]);

    // Levá stěna
    k.add([
        k.pos(0, 0), 
        k.rect(wallWidth, k.height()),
        k.area(),
        k.outline(2, k.rgb(COLORS.walls)),
        k.color(30, 30, 60),
        k.body({ isStatic: true }),
        "border"
    ]);

    // Pravá stěna
    k.add([
        k.pos(k.width() - wallWidth, 0), 
        k.rect(wallWidth, k.height()),
        k.area(),
        k.outline(2, k.rgb(COLORS.walls)),
        k.color(30, 30, 60),
        k.body({ isStatic: true }),
        "border"
    ]);

    // Horní limitní čára (vizuální pomůcka, kde prohráváš)
    k.add([
        k.rect(k.width(), 2),
        k.pos(0, 120),
        k.color(k.rgb(255, 0, 0)),
        k.opacity(0.3),
    ]);

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
        }

        // Fyzikální kruhová oblast
        fruit.use(k.area({ shape: new k.Circle(k.vec2(0), data.radius / targetScale) }));

        fruit.use(k.body({ 
            isStatic: !isDropped, 
            friction: 0.5, 
            restitution: 0.2, 
            drag: 0.1
        }));

        // Neonový efekt při spojení
        if (isDropped) {
            fruit.use(k.outline(1, k.rgb(255, 255, 255)));
        }

        return fruit;
    }

    let currentFruit = null;
    const prepareNext = () => {
        const randomLevel = k.choose([0, 1, 2]);
        currentFruit = spawnFruitAt(k.mousePos().x || k.width()/2, 70, randomLevel, false);
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
        
        // Odeslání skóre do Reactu
        window.dispatchEvent(new CustomEvent("addScore", { detail: FRUITS[nextLevel].score }));
    });
}