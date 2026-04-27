// ==UserScript==
// @name         MyClient Fixed (EaglerForge 1.12)
// @version      1.1
// @description  Working client base with Fullbright + Keystrokes + FPS
// ==/UserScript==

const Client = {
    modules: [],
    keybinds: {},

    log(msg) {
        ModAPI.displayToChat({ msg: "§b[MyClient] §f" + msg });
    },

    registerModule(m) {
        this.modules.push(m);
        this.log("Loaded module: §a" + m.name);
    },

    registerKey(key, callback) {
        this.keybinds[key] = callback;
    }
};

class Module {
    constructor(name, key) {
        this.name = name;
        this.key = key;
        this.enabled = false;

        Client.registerKey(key, () => this.toggle());
        Client.registerModule(this);
    }

    toggle() {
        this.enabled = !this.enabled;
        Client.log(`${this.name} ${this.enabled ? "§aON" : "§cOFF"}`);
        if (this.enabled && this.onEnable) this.onEnable();
        if (!this.enabled && this.onDisable) this.onDisable();
    }

    onUpdate() {}
    onRender() {}
}

/* ============================================================
   FULLBRIGHT (FIXED)
   ============================================================ */

const Fullbright = new Module("Fullbright", "F");

Fullbright.onEnable = function () {
    const mc = ModAPI.getMinecraft();
    this.oldGamma = mc.gameSettings.gammaSetting;
    mc.gameSettings.gammaSetting = 1000;
};

Fullbright.onDisable = function () {
    const mc = ModAPI.getMinecraft();
    mc.gameSettings.gammaSetting = this.oldGamma || 1.0;
};

// Force gamma every tick (fixes 1.12 overwrite bug)
Fullbright.onUpdate = function () {
    if (!this.enabled) return;
    const mc = ModAPI.getMinecraft();
    mc.gameSettings.gammaSetting = 1000;
};

/* ============================================================
   FPS DISPLAY
   ============================================================ */

const FPS = new Module("FPS Display", "G");

FPS.onRender = function () {
    if (!this.enabled) return;
    const fps = ModAPI.getFPS();
    ModAPI.drawStringOnScreen({
        text: `FPS: ${fps}`,
        x: 4,
        y: 4,
        color: 0xffffff,
        shadow: true
    });
};

/* ============================================================
   KEYSTROKES (FIXED)
   ============================================================ */

const Keystrokes = new Module("Keystrokes", "K");

Keystrokes.onRender = function () {
    if (!this.enabled) return;

    const keys = [
        { key: "W", x: 20, y: 20 },
        { key: "A", x: 5,  y: 35 },
        { key: "S", x: 20, y: 35 },
        { key: "D", x: 35, y: 35 }
    ];

    keys.forEach(k => {
        const down = ModAPI.isKeyDown(k.key);
        ModAPI.drawStringOnScreen({
            text: `${k.key}: ${down ? "§a■" : "§c■"}`,
            x: k.x,
            y: k.y,
            color: 0xffffff,
            shadow: true
        });
    });
};

/* ============================================================
   EVENT HOOKS (CORRECT FOR 1.12)
   ============================================================ */

ModAPI.addEventListener("key", (e) => {
    if (e.repeat) return;
    const key = e.key.toUpperCase();
    if (
