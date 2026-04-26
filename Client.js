// ==UserScript==
// @name         MyClient Base (EaglerForge 1.12)
// @version      1.0.0
// @description  A modular client framework for EaglerForge 1.12 (JS)
// ==/UserScript==

/* ============================================================
   CLIENT CORE
   ============================================================ */

const Client = {
    name: "MyClient",
    version: "1.0",
    modules: [],
    keybinds: {},

    log(msg) {
        ModAPI.displayToChat({ msg: `§b[${this.name}] §f${msg}` });
    },

    registerModule(module) {
        this.modules.push(module);
        this.log(`Loaded module: §a${module.name}`);
    },

    registerKey(key, callback) {
        this.keybinds[key] = callback;
    }
};

/* ============================================================
   MODULE CLASS
   ============================================================ */

class Module {
    constructor(name, key, description) {
        this.name = name;
        this.key = key;
        this.description = description;
        this.enabled = false;

        Client.registerKey(key, () => this.toggle());
        Client.registerModule(this);
    }

    toggle() {
        this.enabled = !this.enabled;
        Client.log(`${this.name} ${this.enabled ? "§aEnabled" : "§cDisabled"}`);
        if (this.enabled && this.onEnable) this.onEnable();
        if (!this.enabled && this.onDisable) this.onDisable();
    }

    onUpdate() {}
    onRender() {}
}

/* ============================================================
   MODULES
   ============================================================ */

/* ---------- FULLBRIGHT ---------- */
new Module("Fullbright", "F", "Brightens the world") .onEnable = function () {
    const mc = ModAPI.getMinecraft();
    this.oldGamma = mc.gameSettings.gammaSetting;
    mc.gameSettings.gammaSetting = 1000;
};

Module.prototype.onDisable = function () {
    if (this.name === "Fullbright") {
        const mc = ModAPI.getMinecraft();
        mc.gameSettings.gammaSetting = this.oldGamma || 1.0;
    }
};

/* ---------- FPS DISPLAY ---------- */
new Module("FPS Display", "G", "Shows FPS on screen").onRender = function () {
    if (!this.enabled) return;
    const fps = ModAPI.getFPS();
    ModAPI.drawStringOnScreen({
        text: `FPS: ${fps}`,
        x: 4,
        y: 4,
        color: 0xFFFFFF,
        shadow: true
    });
};

/* ---------- KEYSTROKES ---------- */
new Module("Keystrokes", "K", "Shows WASD keys").onRender = function () {
    if (!this.enabled) return;

    const keys = ["W", "A", "S", "D"];
    let y = 20;

    keys.forEach(k => {
        const pressed = ModAPI.isKeyDown(k);
        ModAPI.drawStringOnScreen({
            text: `${k}: ${pressed ? "§a■" : "§c■"}`,
            x: 4,
            y: y,
            color: 0xFFFFFF,
            shadow: true
        });
        y += 10;
    });
};

/* ============================================================
   EVENT HOOKS
   ============================================================ */

ModAPI.addEventListener("key", (e) => {
    if (e.repeat) return;
    const key = e.key.toUpperCase();
    if (Client.keybinds[key]) {
        Client.keybinds[key]();
    }
});

ModAPI.addEventListener("update", () => {
    Client.modules.forEach(m => m.enabled && m.onUpdate());
});

ModAPI.addEventListener("renderOverlay", () => {
    Client.modules.forEach(m => m.enabled && m.onRender());
});

/* ============================================================
   Loading mgs
   ============================================================ */

ModAPI.addEventListener("load", () => {
    Client.log(`§aLoaded ${Client.name} v${Client.version}`);
});
