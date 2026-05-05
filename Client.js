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

// do this to add a module: 
//new Module("MyFeature", "keybind", "Does something").onUpdate = function () {
    //if (!this.enabled) return;
    // your code
//};
