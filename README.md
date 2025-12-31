# Kano Frozen 2 BLE Library ❄️

Unlock the magic of the Kano Frozen 2 Motion Sensor Kit.

This repository contains open-source libraries (Python & Web) to fully control the Kano Frozen 2 Motion Sensor via Bluetooth Low Energy (BLE). It goes beyond basic LED control, implementing a custom **Gesture Engine** and **Proximity Force Field**.

## Features

- **Full LED Control**: Address all 9 LEDs individually (mapped correctly to physical locations).
- **Proximity Sensor Data**: Read raw IR data from North, East, South, and West sensors.
- **Gesture Engine**: Detects Swipes (Up, Down, Left, Right) with axis-locking logic to handle natural hand movements.
- **Force Field**: A built-in visualization that lights up LEDs based on the direction and distance of your hand.
- **Hardware Control**: Manage global brightness and keep-alive signals.

## Getting Started

### 🐍 Python

Control the device from your Desktop (Windows/Mac/Linux) or Raspberry Pi.

```bash
cd python
pip install -r requirements.txt
python kano_frozen2.py
```

See **[Python Documentation](python/README.md)** for library usage.

### 🌐 Web (JavaScript)

Control the device directly from Chrome, Edge, or Bluefy (iOS) without installing anything.

**[🚀 Try the Live Demo](https://cardonator.github.io/kano2_frozen/web/index.html)**
*(Note: The app runs completely locally in your browser via Web Bluetooth. No data is sent to the server, me, or GitHub.)*

Or run it yourself:

1. Go to the `web/` directory.
2. Serve the files (must be HTTPS or localhost):

```bash
npx http-server .
```

3. Open `index.html` in your browser.

See **[Web Documentation](web/README.md)** for API usage.

### ![](https://turbowarp.org/static/assets/e04d8c93cf14ec09031b47d619c04f74.svg) TurboWarp Blocks (JavaScript)

Control the device from **[TurboWarp Editor](https://turbowarp.org/editor)**.
Download or copy and paste the **[kano_scratch_ext.js](kano_scratch_ext.js)** for block extensions.

Steps for adding extension:

**1.** Create a new Project.
**2.** **Add Extension** (Bottom left Corner).
**3.** Select **Custom Extension** (15th Extension, last one before the seperator).
**4.** Select Files then select the downloaded **[kano_scratch_ext.js](kano_scratch_ext.js)** (or select Text if copy and pasting) and **Load**.
   _(Note: Select **Run without sandbox**, otherwise Bluetooth won't connect!)._
**5.** Turn on your device and run the **🔌connect to Kano Device** block to connect.
**6.** Have Fun!

**Future Updates:**
- Add in LED Reset
- Create Blocks and Add in Sprites that replicate this Tutorial**[TurboWarp Editor](https://www.youtube.com/watch?v=jrqmM5F7QjU)**

*(Note: The code is Star Wars themed but it is the same hardware as the Frozen 2 kit and works the same.)*

## Technical Protocol

Want to port this to Arduino, ESP32, or Rust?
Check out **[PROTOCOL.md](docs/PROTOCOL.md)** for a complete reverse-engineering of the BLE services, UUIDs, and data packets.

## Hardware Notes

- **Sensors**: 4x IR Proximity Sensors (North, East, South, West).
- **LEDs**: 9x RGB LEDs (RGB565 format).
- **Connection**: Bluetooth Low Energy (BLE).

## License


MIT
