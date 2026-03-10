import kaplay from "kaplay";

export default function initGame() {
    const canvas = document.getElementById("game-canvas");
    if (!canvas) return;

    const COLORS = {
        background: [26, 26, 46],
        walls: [0, 255, 204],
        outline: [255, 255, 255],
    };

    // Nastavení stylu canvasu
    canvas.style.imageRendering = "pixelated"; 
    canvas.style.imageRendering = "crisp-edges";
    canvas.style.touchAction = "none";
    canvas.style.display = "block";
    canvas.style.margin = "auto";
    
    const k = kaplay({
        global: false,
        canvas: canvas,
        width: 400,
        height: 550,
        background: COLORS.background, 
        pixelDensity: window.devicePixelRatio || 2, 
        texFilter: "linear",
    });

    // Načítání spritů
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

    const wallWidth = 8;

    // DEFINICE SCÉNY
    k.scene("main", () => {
        k.setGravity(1000);
        let isGameOver = false;
        const LOSE_LINE = 40; 
        let currentFruit = null;

        // Podlaha a stěny
        const addWall = (x, y, w, h) => {
            k.add([
                k.pos(x, y), 
                k.rect(w, h),
                k.area(),
                k.outline(2, k.rgb(COLORS.walls)),
                k.color(30, 30, 60),
                k.body({ isStatic: true }),
                "border"
            ]);
        };

        addWall(0, k.height() - wallWidth, k.width(), wallWidth); // Podlaha
        addWall(0, 0, wallWidth, k.height()); // Levá
        addWall(k.width() - wallWidth, 0, wallWidth, k.height()); // Pravá

        k.add([
            k.rect(k.width(), 2),
            k.pos(0, LOSE_LINE),
            k.color(255, 0, 0),
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
                    isMerging: false,
                    timeAboveLine: 0 
                }
            ]);

            if (data.sprite) {
                fruit.use(k.sprite(data.sprite));
                fruit.use(k.scale(targetScale));
            }

            fruit.use(k.area({ shape: new k.Circle(k.vec2(0), data.radius / targetScale) }));
            fruit.use(k.body({ 
                isStatic: !isDropped, 
                friction: 0.5, 
                restitution: 0.2, 
                drag: 0.1
            }));

            if (isDropped) {
                fruit.use(k.outline(1, k.rgb(255, 255, 255)));
            }

            return fruit;
        }

        function gameOver() {
            if (isGameOver) return;
            isGameOver = true;
            
            k.get("fruit").forEach((f) => { f.paused = true; });

            k.add([
                k.rect(k.width(), k.height()),
                k.color(0, 0, 0),
                k.opacity(0.6),
                k.fixed(),
            ]);

            k.add([
                k.text("GAME OVER", { size: 42 }),
                k.pos(k.center().x, k.center().y - 30),
                k.anchor("center"),
                k.color(255, 255, 255),
            ]);

            k.add([
                k.text("Click to Restart", { size: 24 }),
                k.pos(k.center().x, k.center().y + 30),
                k.anchor("center"),
                k.color(0, 255, 204),
            ]);

            window.dispatchEvent(new CustomEvent("gameOver"));

            k.onMousePress(() => {
                k.go("main");
            });
        }

        const prepareNext = () => {
            if (isGameOver) return;
            const randomLevel = k.choose([0, 1, 2]);
            currentFruit = spawnFruitAt(k.mousePos().x || k.width()/2, 70, randomLevel, false);
        };

        k.wait(0.2, prepareNext);

        k.onUpdate(() => {
            if (isGameOver) return;

            if (currentFruit && !currentFruit.isDropped) {
                currentFruit.pos.x = k.clamp(k.mousePos().x, wallWidth + 30, k.width() - wallWidth - 30);
                currentFruit.pos.y = 70;
            }
        });

        k.onUpdate("fruit", (f) => {
            if (isGameOver) return;

            if (f.isDropped && f.pos.y < LOSE_LINE) {
                f.timeAboveLine += k.dt(); 
                if (f.timeAboveLine > 2) {
                    gameOver();
                }
            } else {
                f.timeAboveLine = 0;
            }
        });

        k.onMousePress(() => {
            if (isGameOver) return;
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
    });

    k.go("main");
}