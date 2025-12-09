# Kano Frozen 2 BLE Protocol

This document details the Bluetooth Low Energy (BLE) protocol used by the Kano Frozen 2 Coding Kit (Motion Sensor).

**Status:** Fully Reverse Engineered.

## Connection Details

- **Device Name Prefix:** `Kano-` (e.g., `Kano-Frozen-Sensor`)
- **Advertisement:** The device advertises its services and can be discovered by name or Service UUIDs.

## Services & Characteristics

### 1. IO & Power Service

**UUID:** `11a70300-f691-4b93-a6f4-0968f5b648f8`

Handles output (LEDs) and power management.

| Feature | UUID | Props | Description |
| :--- | :--- | :--- | :--- |
| **LEDs** | `...0301...` | Write | Control the 9 RGB LEDs (19-byte payload). |
| **Keep Alive** | `...0302...` | Write | Write `0x01` periodically to prevent auto-sleep. |
| **Battery** | `...0303...` | Read/Notify | Returns 1 byte (`0x00`-`0x64`) representing 0-100% battery. |
| **Brightness** | `...0304...` | Write | Global hardware current limit (0-255). |

*(Base UUID for Characteristics matches the Service, replacing the `0300` block).*

### 2. Sensor Service

**UUID:** `11a70200-f691-4b93-a6f4-0968f5b648f8`

Handles input from the IR proximity sensors.

| Feature | UUID | Props | Description |
| :--- | :--- | :--- | :--- |
| **Sensor Data** | `...0201...` | Notify | Stream of raw proximity values (4 bytes). |

---

## Data Payloads

### 1. LED Control (`0301`)

To update the LEDs, write **19 bytes** to the characteristic. The color format is **RGB565** (16-bit color), Big Endian.

- **Byte 0:** `0x01` (Command Header)
- **Bytes 1-18:** 9 x **RGB565** values (2 bytes per LED).

#### LED Mapping

Indices correspond to the order in the byte array (after the header).

| Index | PCB Label | Physical Position | Direction |
| :--- | :--- | :--- | :--- |
| 0 | RGB1 | Top Right | North |
| 1 | RGB2 | Right Top | East |
| 2 | RGB3 | Right Bottom | East |
| 3 | RGB4 | Bottom Right | South |
| 4 | RGB5 | Bottom Left | South |
| 5 | RGB6 | Left Bottom | West |
| 6 | RGB7 | Left Top | West |
| 7 | RGB8 | Top Left | North |
| 8 | RGB9 | Center | Center |

#### RGB565 Algorithm

You must compress standard 24-bit RGB (8-8-8) to 16-bit RGB (5-6-5).

```python
# Python Example
r5 = (r >> 3) & 0x1F  # Take top 5 bits
g6 = (g >> 2) & 0x3F  # Take top 6 bits
b5 = (b >> 3) & 0x1F  # Take top 5 bits

packed = (r5 << 11) | (g6 << 5) | b5
byte_high = (packed >> 8) & 0xFF
byte_low = packed & 0xFF
```

### 2. Sensor Data (`0201`)

The device notifies **4 bytes** representing the 4 IR proximity sensors.

- **Format:** `[North, East, South, West]`
- **Value Range:** `0x00` to `0xFF`
    - `0x00` (0): Very Close / Saturated
    - `0xFF` (255): Far / Out of Range

*Note: Effective range is approximately 0-15cm. Values > 220 are typically noise.*

### 3. Keep Alive (`0302`)

The device will auto-sleep after a short period of inactivity.

- **Action:** Write `0x01` to this characteristic every ~30 seconds to keep the session active.

### 4. Brightness (`0304`)

Controls the global current limit for the LED driver.

- **Payload:** 1 Byte.
- **Value:** `0x00` (Off) to `0xFF` (Max Brightness).

*Tip: Linking this to proximity data creates a "breathing" effect.*