import kaplay from "kaplay";

export default function initGame() {
    const canvas = document.getElementById("game-canvas");
    if (!canvas) return;

    const COLORS = {
        void: [4, 17, 36],       // #041124
        deep: [10, 57, 118],     // #0A3976
        primary: [38, 116, 188],  // #2674BC
        accent: [85, 152, 211],   // #5598D3
        highlight: [190, 218, 243] // #BEDAF3
    };

    canvas.style.imageRendering = "pixelated";
    canvas.style.touchAction = "none";
    canvas.style.display = "block";
    canvas.style.margin = "auto";

    const k = kaplay({
        global: false,
        canvas: canvas,
        width: 400,
        height: 600, 
        background: COLORS.void,
        pixelDensity: window.devicePixelRatio || 2,
        texFilter: "linear",
    });

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
        { radius: 18, score: 2, sprite: "losos" },
        { radius: 25, score: 4, sprite: "logo" },
        { radius: 32, score: 6, sprite: "studenkova" },
        { radius: 40, score: 10, sprite: "meitnerova" },
        { radius: 50, score: 15, sprite: "vana" },
        { radius: 62, score: 20, sprite: "losos" },
        { radius: 75, score: 28, sprite: "adamek" },
        { radius: 90, score: 36, sprite: "prochazka" },
        { radius: 105, score: 45, sprite: "masopust" },
        { radius: 125, score: 100, sprite: "mandik" },
    ];

    const wallWidth = 8;
    let pointerX = k.width() / 2;
    let activePointerUpHandler = null;

    const updatePointerFromEvent = (e) => {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        pointerX = ((clientX - rect.left) / rect.width) * k.width();
    };

    canvas.addEventListener("pointerdown", updatePointerFromEvent);
    canvas.addEventListener("pointermove", updatePointerFromEvent);
    canvas.addEventListener("pointerup", (e) => {
        updatePointerFromEvent(e);
        if (activePointerUpHandler) activePointerUpHandler();
    });

    k.scene("main", () => {
        k.setGravity(1000);

        let isGameOver = false;
        let dropLocked = false;
        let nextFruitLevel = k.choose([0, 1, 2]); 
        let currentFruit = null;

        const LOSE_LINE = 100;
        const PREVIEW_Y = LOSE_LINE - 50;

        const nextPreviewContainer = k.add([
            k.pos(k.width() - 50, 55),
            k.fixed()
        ]);

        nextPreviewContainer.add([
            k.circle(30),
            k.color(COLORS.deep),
            k.outline(2, k.rgb(COLORS.primary)),
            k.anchor("center"),
            k.opacity(0.7)
        ]);

        nextPreviewContainer.add([
            k.text("NEXT", { size: 15, font: "sans-serif" }),
            k.pos(0, -38),
            k.anchor("center"),
            k.color(COLORS.highlight),
            k.z(10)
        ]);

        let nextVisual = null;
        function updateNextVisual(level) {
            if (nextVisual) k.destroy(nextVisual);
            const data = FRUITS[level];
            const scale = 45 / 267;

            nextVisual = nextPreviewContainer.add([
                k.sprite(data.sprite),
                k.scale(scale),
                k.anchor("center"),
            ]);
        }

        const guideLine = k.add([
            k.rect(2, k.height()),
            k.pos(0, 0),
            k.color(COLORS.primary),
            k.opacity(0.2),
            k.anchor("top")
        ]);

        const clampSpawnX = (x, radius) => k.clamp(x, wallWidth + radius, k.width() - wallWidth - radius);

        const addWall = (x, y, w, h) => {
            k.add([
                k.pos(x, y),
                k.rect(w, h),
                k.area(),
                k.color(COLORS.void),
                k.outline(2, k.rgb(COLORS.primary)),
                k.body({ isStatic: true }),
                "border"
            ]);
        };

        addWall(0, k.height() - wallWidth, k.width(), wallWidth); 
        addWall(0, 0, wallWidth, k.height()); 
        addWall(k.width() - wallWidth, 0, wallWidth, k.height()); 

        k.add([
            k.rect(k.width(), 2),
            k.pos(0, LOSE_LINE),
            k.color(255, 50, 50),
            k.opacity(0.4),
        ]);

        function spawnFruitAt(x, y, level, isDropped = false) {
            const data = FRUITS[level];
            const imageWidth = 267;
            const targetScale = (data.radius * 2) / imageWidth;

            const fruit = k.add([
                k.pos(x, y),
                k.anchor("center"),
                "fruit",
                {
                    level,
                    isDropped,
                    isMerging: false,
                    timeAboveLine: 0,
                }
            ]);

            fruit.use(k.sprite(data.sprite));
            fruit.use(k.scale(targetScale));
            fruit.use(k.area({ shape: new k.Circle(k.vec2(0), data.radius / targetScale) }));
            
            fruit.use(k.body({
                isStatic: !isDropped,
                friction: 0.5,
                restitution: 0.1,
            }));

            if (isDropped) {
                fruit.use(k.outline(2, k.rgb(COLORS.highlight)));
            }

            return fruit;
        }

        const prepareNext = () => {
            if (isGameOver) return;
            const levelToSpawn = nextFruitLevel;
            nextFruitLevel = k.choose([0, 1, 2]);
            updateNextVisual(nextFruitLevel);

            const radius = FRUITS[levelToSpawn].radius;
            currentFruit = spawnFruitAt(clampSpawnX(pointerX, radius), PREVIEW_Y, levelToSpawn, false);
            dropLocked = false;
        };

        activePointerUpHandler = () => {
            if (isGameOver || dropLocked || !currentFruit) return;
            dropLocked = true;

            const { x, y } = currentFruit.pos;
            const level = currentFruit.level;

            k.destroy(currentFruit);
            currentFruit = null;

            spawnFruitAt(x, y, level, true);
            k.wait(0.6, prepareNext);
        };

        k.onUpdate(() => {
            if (isGameOver) return;

            if (currentFruit) {
                const radius = FRUITS[currentFruit.level].radius;
                const targetX = clampSpawnX(pointerX, radius);
                currentFruit.pos.x = targetX;
                guideLine.pos.x = targetX;
            }
        });

        k.onUpdate("fruit", (f) => {
            if (isGameOver || !f.isDropped) return;
            if (f.pos.y - FRUITS[f.level].radius < LOSE_LINE) {
                f.timeAboveLine += k.dt();
                if (f.timeAboveLine > 4) gameOver();
            } else {
                f.timeAboveLine = 0;
            }
        });
            k.onCollide("fruit", "fruit", (a, b) => {
            if (a.level !== b.level || a.isMerging || b.isMerging) return;
            if (a.level >= FRUITS.length - 1) return;

            a.isMerging = true;
            b.isMerging = true;

            const nextLevel = a.level + 1;
            const pos = a.pos.lerp(b.pos, 0.5);

            const PARTICLE_COUNT = 15; 
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const size = k.rand(6, 12); 
                const speed = k.rand(80, 250); 

                k.add([
                    k.pos(pos),
                    k.rect(size, size), 
                    k.color(k.choose([k.rgb(COLORS.highlight), k.rgb(COLORS.accent)])),
                    k.outline(2, k.rgb(COLORS.primary)),
                    k.opacity(1),
                    k.anchor("center"),
                    k.rotate(k.rand(0, 360)),
                    k.move(k.rand(0, 360), speed),
                    k.offscreen({ destroy: true }),
                    "particle",
                    {
                        rotSpeed: k.rand(-200, 200),
                        update() {
                            this.opacity -= k.dt() * 1.5; 
                            this.angle += this.rotSpeed * k.dt(); 
                            this.scale = k.vec2(this.opacity);
                            if (this.opacity <= 0) k.destroy(this);
                        }
                    }
                ]);
            }

            k.add([
                k.circle(FRUITS[a.level].radius * 2),
                k.pos(pos),
                k.anchor("center"),
                k.color(COLORS.highlight),
                k.opacity(0.4),
                k.scale(0.5),
                "shockwave",
                {
                    update() {
                        this.scale = this.scale.add(k.vec2(k.dt() * 4));
                        this.opacity -= k.dt() * 2;
                        if (this.opacity <= 0) k.destroy(this);
                    }
                }
            ]);

            if (a.level > 5) {
                k.shake(4);
            }

            k.destroy(a);
            k.destroy(b);

            spawnFruitAt(pos.x, pos.y, nextLevel, true);
            window.dispatchEvent(new CustomEvent("addScore", { detail: FRUITS[nextLevel].score }));
        });

        function gameOver() {
            if (isGameOver) return;
            isGameOver = true;
            window.dispatchEvent(new CustomEvent("gameOver"));
        }

        updateNextVisual(nextFruitLevel);
        k.wait(0.2, prepareNext);
    });

    k.go("main");
}