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

1. Go to the `web/` directory.
2. Serve the files (must be HTTPS or localhost):

```bash
npx http-server .
```

3. Open `index.html` in your browser.

See **[Web Documentation](web/README.md)** for API usage.

## Technical Protocol

Want to port this to Arduino, ESP32, or Rust?
Check out **[PROTOCOL.md](docs/PROTOCOL.md)** for a complete reverse-engineering of the BLE services, UUIDs, and data packets.

## Hardware Notes

- **Sensors**: 4x IR Proximity Sensors (North, East, South, West).
- **LEDs**: 9x RGB LEDs (RGB565 format).
- **Connection**: Bluetooth Low Energy (BLE).

## License

MIT