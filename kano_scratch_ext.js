// Kano Star Wars - Improved Scratch Extension
// Load this in TurboWarp Browser (turbowarp.org) with "Run without Sandbox" enabled

class KanoStarWars {
    constructor() {
        this.device = null;
        this.server = null;
        this.charLeds = null;
        this.charBrightness = null;
        this.charSensor = null;
        this.isConnected = false;

        this.ledBuffer = new Array(9).fill([0, 0, 0]);
        this.listeners = {};
        this.defaultMode = false;

        // Constants
        this.SERVICE_UUID_IO = "11a70300-f691-4b93-a6f4-0968f5b648f8";
        this.CHAR_LEDS = "11a70301-f691-4b93-a6f4-0968f5b648f8";
        this.CHAR_BRIGHTNESS = "11a70304-f691-4b93-a6f4-0968f5b648f8";
        this.SERVICE_UUID_SENSOR = "11a70200-f691-4b93-a6f4-0968f5b648f8";
        this.CHAR_SENSOR = "11a70201-f691-4b93-a6f4-0968f5b648f8";

        // Gesture State
        this.lastHZone = null;
        this.lastHTime = 0;
        this.lastVZone = null;
        this.lastVTime = 0;
        this.SWIPE_TIMEOUT = 1000;
        this.ACT_THRESH = 30;

        // Store latest sensor data
        this.latestSensor = { raw: [255, 255, 255, 255], brightness: [0, 0, 0, 0], maxBrightness: 0 };
        this.lastGesture = "";
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    async connect() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: "Kano" }],
                optionalServices: [this.SERVICE_UUID_IO, this.SERVICE_UUID_SENSOR]
            });

            this.device.addEventListener('gattserverdisconnected', this.onDisconnect.bind(this));
            this.server = await this.device.gatt.connect();

            await new Promise(resolve => setTimeout(resolve, 500));

            if (!this.server.connected) {
                throw new Error("GATT Server is disconnected.");
            }

            const serviceIO = await this.server.getPrimaryService(this.SERVICE_UUID_IO);
            this.charLeds = await serviceIO.getCharacteristic(this.CHAR_LEDS);
            this.charBrightness = await serviceIO.getCharacteristic(this.CHAR_BRIGHTNESS);

            const serviceSensor = await this.server.getPrimaryService(this.SERVICE_UUID_SENSOR);
            this.charSensor = await serviceSensor.getCharacteristic(this.CHAR_SENSOR);

            await this.charSensor.startNotifications();
            this.charSensor.addEventListener('characteristicvaluechanged', this.handleSensorData.bind(this));

            await this.setBrightness(255);

            this.isConnected = true;
            this.emit('connect', this.device.name);

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async disconnect() {
        if (this.device && this.device.gatt.connected) {
            await this.device.gatt.disconnect();
        }
    }

    onDisconnect() {
        this.isConnected = false;
        this.charLeds = null;
        this.charBrightness = null;
        this.charSensor = null;
        this.emit('disconnect');
    }

    handleSensorData(event) {
        const val = new Uint8Array(event.target.value.buffer);
        const b = [0, 0, 0, 0];
        let maxB = 0;
        let activeZone = null;

        for (let i = 0; i < 4; i++) {
            if (val[i] < 220) {
                b[i] = 255 - val[i];
                if (b[i] < 0) b[i] = 0;
            }
            if (b[i] > maxB) {
                maxB = b[i];
                if (maxB > this.ACT_THRESH) activeZone = i;
            }
        }

        this.latestSensor = { raw: val, brightness: b, maxBrightness: maxB };
        this.emit('sensor', this.latestSensor);
        this.detectGesture(activeZone);

        // Default mode: lights respond to hand proximity
        if (this.defaultMode) {
            this.updateDefaultMode();
        }
    }

    updateDefaultMode() {
        const [n, e, s, w] = this.latestSensor.brightness;
        const max = this.latestSensor.maxBrightness;

        // N=Red, E=Green, S=Blue, W=Yellow, Center=White
        this.setLed(7, n, 0, 0); this.setLed(0, n, 0, 0);  // North
        this.setLed(1, 0, e, 0); this.setLed(2, 0, e, 0);  // East
        this.setLed(3, 0, 0, s); this.setLed(4, 0, 0, s);  // South
        this.setLed(5, w, w, 0); this.setLed(6, w, w, 0);  // West
        this.setLed(8, max, max, max);                      // Center

        this.sendLeds();
    }

    detectGesture(currentZone) {
        if (currentZone === null) return;

        const now = Date.now();
        let direction = null;
        const Z_NORTH = 0, Z_EAST = 1, Z_SOUTH = 2, Z_WEST = 3;

        if (currentZone === Z_EAST || currentZone === Z_WEST) {
            if (this.lastHZone !== null && this.lastHZone !== currentZone) {
                if ((now - this.lastHTime) < this.SWIPE_TIMEOUT) {
                    direction = (currentZone === Z_WEST) ? "LEFT" : "RIGHT";
                    this.lastHZone = null;
                }
            }
            if (!direction) { this.lastHZone = currentZone; this.lastHTime = now; }
        }

        if (currentZone === Z_NORTH || currentZone === Z_SOUTH) {
            if (this.lastVZone !== null && this.lastVZone !== currentZone) {
                if ((now - this.lastVTime) < this.SWIPE_TIMEOUT) {
                    direction = (currentZone === Z_NORTH) ? "UP" : "DOWN";
                    this.lastVZone = null;
                }
            }
            if (!direction) { this.lastVZone = currentZone; this.lastVTime = now; }
        }

        if (direction) {
            this.lastGesture = direction;
            this.emit('gesture', direction);
        }
    }

    async setBrightness(level) {
        if (!this.charBrightness || !this.isConnected) return;
        try {
            await this.charBrightness.writeValue(new Uint8Array([level]));
        } catch (e) {
            console.error("Brightness Error:", e);
        }
    }

    setLed(index, r, g, b) {
        if (index >= 0 && index < 9) {
            this.ledBuffer[index] = [r, g, b];
        }
    }

    setAllLeds(r, g, b) {
        this.ledBuffer.fill([r, g, b]);
    }

    clearLeds() {
        this.setAllLeds(0, 0, 0);
    }

    getLed(index) {
        return this.ledBuffer[index];
    }

    async sendLeds() {
        if (!this.charLeds || !this.isConnected) return;

        const payload = new Uint8Array(19);
        payload[0] = 0x01;

        let idx = 1;
        for (let i = 0; i < 9; i++) {
            const [r, g, b] = this.ledBuffer[i];
            const r5 = (r >> 3) & 0x1F;
            const g6 = (g >> 2) & 0x3F;
            const b5 = (b >> 3) & 0x1F;
            const packed = (r5 << 11) | (g6 << 5) | b5;

            payload[idx++] = (packed >> 8) & 0xFF;
            payload[idx++] = packed & 0xFF;
        }

        try {
            await this.charLeds.writeValue(payload);
        } catch (e) {
            // Ignore dropped packets
        }
    }

    // Convert 0-255 raw sensor value to 0-100 proximity percentage
    rawToProximity(rawValue) {
        // rawValue: 255 = far, 0 = close
        // Return: 0 = closest, 100 = farthest
        return Math.round((rawValue / 255) * 100);
    }
}

// ===== SCRATCH EXTENSION =====
class KanoStarWarsExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.kano = new KanoStarWars();
        this.connectionStatus = "Not connected";

        // Setup event listeners
        this.kano.on('connect', (name) => {
            this.connectionStatus = "Connected to " + name;
        });

        this.kano.on('disconnect', () => {
            this.connectionStatus = "Disconnected";
        });

        // Color presets
        this.colors = {
            'Red': [255, 0, 0],
            'Green': [0, 255, 0],
            'Blue': [0, 0, 255],
            'Yellow': [255, 255, 0],
            'Orange': [255, 165, 0],
            'Purple': [128, 0, 128],
            'Pink': [255, 192, 203],
            'White': [255, 255, 255],
            'Cyan': [0, 255, 255],
            'Off': [0, 0, 0]
        };
    }

    getInfo() {
        return {
            id: 'kanostarwars',
            name: 'Kano Star Wars',
            color1: '#0066ff',
            color2: '#0033ff',
            color3: '#0000ff',
            // data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='45' y='70' width='10' height='30' fill='#606060'/><rect x='48' y='0' width='4' height='70' fill='#00d5ff'/><rect x='46' y='0' width='2' height='70' fill='#4ae1ff'/><rect x='52' y='0' width='2' height='70' fill='#4ae1ff'/></svg>
            blockIconURI: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB4PSc0NScgeT0nNzAnIHdpZHRoPScxMCcgaGVpZ2h0PSczMCcgZmlsbD0nIzYwNjA2MCcvPjxyZWN0IHg9JzQ4JyB5PScwJyB3aWR0aD0nNCcgaGVpZ2h0PSc3MCcgZmlsbD0nIzAwZDVmZicvPjxyZWN0IHg9JzQ2JyB5PScwJyB3aWR0aD0nMicgaGVpZ2h0PSc3MCcgZmlsbD0nIzRhZTFmZicvPjxyZWN0IHg9JzUyJyB5PScwJyB3aWR0aD0nMicgaGVpZ2h0PSc3MCcgZmlsbD0nIzRhZTFmZicvPjwvc3ZnPg==',
            blocks: [
                {
                    opcode: 'connect',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '⚡ connect to Force Sensor'
                },
                {
                    opcode: 'isConnected',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: 'connected?'
                },
                {
                    opcode: 'getConnectionStatus',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'connection status'
                },
                {
                    opcode: 'disconnect',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'disconnect'
                },
                '---',
                {
                    opcode: 'setLEDColor',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '💡 set light [LED] to [COLOR]',
                    arguments: {
                        LED: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        COLOR: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'colors'
                        }
                    }
                },
                {
                    opcode: 'setAllLEDsColor',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '💡 set all lights to [COLOR]',
                    arguments: {
                        COLOR: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'colors'
                        }
                    }
                },
                {
                    opcode: 'setLEDRGB',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '💡 set light [LED] to R [R] G [G] B [B]',
                    arguments: {
                        LED: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        R: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        G: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        B: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setAllLEDsRGB',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '💡 set all lights to R [R] G [G] B [B]',
                    arguments: {
                        R: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        G: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        B: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'clearLEDs',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '💡 turn off all lights'
                },
                '---',
                {
                    opcode: 'getProximityPercent',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'distance [DIRECTION] (0=close 100=far)',
                    arguments: {
                        DIRECTION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'directions'
                        }
                    }
                },
                {
                    opcode: 'getProximityRaw',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'force strength [DIRECTION] (0-255)',
                    arguments: {
                        DIRECTION: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'directions'
                        }
                    }
                },
                {
                    opcode: 'getAllProximity',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'all distances (N E S W)'
                },
                '---',
                {
                    opcode: 'whenGesture',
                    blockType: Scratch.BlockType.HAT,
                    text: '👋 when gesture [GESTURE]',
                    arguments: {
                        GESTURE: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'gestures'
                        }
                    }
                },
                {
                    opcode: 'getLastGesture',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'last gesture'
                },
                '---',
                {
                    opcode: 'enableDefaultMode',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '🌟 enable default mode (hand tracking)'
                },
                {
                    opcode: 'disableDefaultMode',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '🌟 disable default mode'
                }
            ],
            menus: {
                directions: {
                    acceptReporters: true,
                    items: ['North', 'East', 'South', 'West']
                },
                gestures: {
                    acceptReporters: true,
                    items: ['UP', 'DOWN', 'LEFT', 'RIGHT']
                },
                colors: {
                    acceptReporters: false,
                    items: Object.keys(this.colors)
                }
            }
        };
    }

    async connect() {
        try {
            this.connectionStatus = "Connecting...";
            await this.kano.connect();
        } catch (error) {
            this.connectionStatus = "Connection failed: " + error.message;
            console.error("Connection failed:", error);
        }
    }

    isConnected() {
        return this.kano.isConnected;
    }

    getConnectionStatus() {
        return this.connectionStatus;
    }

    async disconnect() {
        await this.kano.disconnect();
    }

    // LED blocks with auto-update
    async setLEDColor(args) {
        const led = Math.floor(args.LED);
        const [r, g, b] = this.colors[args.COLOR] || [0, 0, 0];
        this.kano.setLed(led, r, g, b);
        await this.kano.sendLeds();
    }

    async setAllLEDsColor(args) {
        const [r, g, b] = this.colors[args.COLOR] || [0, 0, 0];
        this.kano.setAllLeds(r, g, b);
        await this.kano.sendLeds();
    }

    async setLEDRGB(args) {
        const led = Math.floor(args.LED);
        const r = Math.max(0, Math.min(255, Math.floor(args.R)));
        const g = Math.max(0, Math.min(255, Math.floor(args.G)));
        const b = Math.max(0, Math.min(255, Math.floor(args.B)));
        this.kano.setLed(led, r, g, b);
        await this.kano.sendLeds();
    }

    async setAllLEDsRGB(args) {
        const r = Math.max(0, Math.min(255, Math.floor(args.R)));
        const g = Math.max(0, Math.min(255, Math.floor(args.G)));
        const b = Math.max(0, Math.min(255, Math.floor(args.B)));
        this.kano.setAllLeds(r, g, b);
        await this.kano.sendLeds();
    }

    async clearLEDs() {
        this.kano.clearLeds();
        await this.kano.sendLeds();
    }

    // Proximity blocks
    getProximityPercent(args) {
        const dirMap = {
            'North': 0,
            'East': 1,
            'South': 2,
            'West': 3
        };
        const index = dirMap[args.DIRECTION];
        const rawValue = this.kano.latestSensor.raw[index];
        return this.kano.rawToProximity(rawValue);
    }

    getProximityRaw(args) {
        const dirMap = {
            'North': 0,
            'East': 1,
            'South': 2,
            'West': 3
        };
        const index = dirMap[args.DIRECTION];
        return this.kano.latestSensor.brightness[index] || 0;
    }

    getAllProximity() {
        const values = this.kano.latestSensor.raw.map(v => this.kano.rawToProximity(v));
        return `N:${values[0]} E:${values[1]} S:${values[2]} W:${values[3]}`;
    }

    // Gesture blocks
    whenGesture(args) {
        return this.kano.lastGesture === args.GESTURE;
    }

    getLastGesture() {
        return this.kano.lastGesture || "";
    }

    // Default mode
    enableDefaultMode() {
        this.kano.defaultMode = true;
    }

    disableDefaultMode() {
        this.kano.defaultMode = false;
        this.kano.clearLeds();
        this.kano.sendLeds();
    }
}

Scratch.extensions.register(new KanoStarWarsExtension());
