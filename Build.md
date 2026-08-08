# NeuroOccupy — Complete Build Plan

**Project:** Smart Occupancy-Based Power Management System with Context-Aware Bayesian Inference
**Team Lead:** Jeeva Priyan R
**Hardware Owner:** Jai Ganesh
**Target:** Working demo with mock-room, live dashboard, Bayesian inference on ESP32

---

## 0. PROJECT SUMMARY (READ FIRST)

NeuroOccupy is an ESP32-based system that decides whether a room is occupied or vacant by fusing three sensors (PIR motion, MQ135 CO₂, INMP441 sound) using a **Bayesian probability model**, cross-referenced against a **class timetable** stored on the device. When confidence of occupancy drops below 0.5, it cuts power to a demo bulb via a relay. All sensor data, confidence scores, and relay state are streamed live to a Node-RED dashboard over MQTT.

**Finalized hardware (from your actual invoice — nothing else required):**

| # | Item | Qty | Use |
|---|---|---|---|
| 1 | ESP32 WROOM DevKit V1 (30 pin) | 1 | Main controller |
| 2 | INMP441 MEMS I2S Microphone | 1 | Sound-based occupancy |
| 3 | PIR Motion Sensor | 1 | Motion-based occupancy |
| 4 | MQ135 Gas Sensor | 1 | CO₂-based occupancy |
| 5 | Relay 1-Channel 5V | 1 | Power cutoff to bulb |
| 6 | Breadboard 400pt | 2 | Wiring platform |
| 7 | Micro USB cable | 1 | Power + programming |
| 8 | M-M jumper wires (10pc) | 2 packs | Sensor wiring |
| 9 | M-F jumper wires (10pc) | 2 packs | Sensor-to-breadboard wiring |

**Bought separately (local shop, not in invoice):**
- B22 bulb holder with wire (~₹20)
- 5W LED bulb (~₹40)
- 3-socket extension board (~₹100)

**Explicitly REMOVED from original design (do not build these):**
- ❌ MC-38 door magnetic sensor — removed for simplicity
- ❌ SCT-013 current clamp sensor — removed for simplicity
- ❌ HiLink power module — not needed, ESP32 runs off USB for demo
- ❌ DIN rail contactor — real-deployment-only component, not part of demo

**Software stack:**
- Arduino IDE (ESP32 firmware, C++)
- Python 3 (training data collection + Bayesian probability table generation)
- Node-RED (dashboard, running locally on laptop)
- Mosquitto MQTT broker (running locally on laptop)

---

## MODULE 0 — Environment Setup

### Prerequisite
- Laptop with Windows/Mac/Linux
- Internet connection for downloading tools
- All hardware from the table above physically in hand

### Tasks

**0.1 — Install Arduino IDE**
1. Download Arduino IDE 2.x from arduino.cc
2. Open IDE → File → Preferences → Additional Board Manager URLs → paste:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Tools → Board → Boards Manager → search "esp32" → install "esp32 by Espressif Systems"
4. Tools → Board → select "ESP32 Dev Module"

**0.2 — Install required Arduino libraries**
Go to Sketch → Include Library → Manage Libraries, install:
- `PubSubClient` (by Nick O'Leary) — for MQTT
- `ArduinoJson` (by Benoit Blanchon) — for JSON formatting
- No external library needed for I2S — ESP32 core has built-in `driver/i2s.h`

**0.3 — Install Mosquitto MQTT broker on laptop**
- Windows/Mac: download from mosquitto.org, install with default settings
- Verify install by running in terminal:
  ```
  mosquitto -v
  ```
  You should see it start listening on port 1883.

**0.4 — Install Node-RED**
```bash
npm install -g --unsafe-perm node-red
```
Run it:
```bash
node-red
```
Open browser at `http://localhost:1880`

**0.5 — Install Node-RED MQTT + dashboard nodes**
Inside Node-RED: Menu (top right) → Manage Palette → Install tab → search and install:
- `node-red-dashboard`

**0.6 — Install Python 3 + libraries**
```bash
pip install pandas numpy
```

### Checkpoint before moving on
- [ ] Arduino IDE opens, ESP32 board selected, can compile blank sketch with no errors
- [ ] Mosquitto running in terminal, shows "listening on port 1883"
- [ ] Node-RED opens in browser at localhost:1880
- [ ] `python3 -c "import pandas; import numpy; print('ok')"` prints `ok`

---

## MODULE 1 — Hardware Assembly

### Prerequisite
Module 0 complete. All components on a clean table with good lighting.

### 1.1 — Pin Mapping Reference (use this for all wiring)

| Sensor | Sensor Pin | ESP32 Pin |
|---|---|---|
| PIR | VCC | 5V (VIN) |
| PIR | GND | GND |
| PIR | OUT | GPIO 27 |
| MQ135 | VCC | 5V (VIN) |
| MQ135 | GND | GND |
| MQ135 | AOUT | GPIO 34 (ADC1_CH6) |
| INMP441 | VDD | 3.3V |
| INMP441 | GND | GND |
| INMP441 | SD | GPIO 32 |
| INMP441 | SCK | GPIO 33 |
| INMP441 | WS | GPIO 25 |
| INMP441 | L/R | GND (sets left channel) |
| Relay | VCC | 5V (VIN) |
| Relay | GND | GND |
| Relay | IN | GPIO 26 |

### 1.2 — Assembly steps

1. Place both breadboards side by side, connect their power rails together with M-M jumpers (red-to-red, black-to-black)
2. Mount ESP32 on breadboard 1, straddling the center gap
3. Connect ESP32 5V pin (VIN) → breadboard red rail; ESP32 GND → breadboard black rail
4. Mount PIR sensor on breadboard 2. Wire VCC→red rail, GND→black rail, OUT→GPIO27 (use M-F wire since PIR has female header pins usually, or M-M if it has pin headers)
5. Mount MQ135 module on breadboard 2. Wire VCC→red rail, GND→black rail, AOUT→GPIO34
6. Mount INMP441 module on breadboard 2. Wire VDD→3.3V rail (NOT 5V — this sensor is 3.3V only), GND→black rail, SD→GPIO32, SCK→GPIO33, WS→GPIO25, L/R→black rail (GND)
7. Mount relay module on breadboard 1. Wire VCC→red rail, GND→black rail, IN→GPIO26
8. On the relay's OUTPUT side (the screw terminals, NOT the signal pins): wire COM to one wire of your extension cord's live line (cut the extension cord's live wire and insert relay here), and NO to the other end
9. Connect bulb holder into the extension cord socket, screw in the 5W bulb

### 1.3 — CRITICAL SAFETY NOTE
The relay's screw-terminal side carries 230V AC. Never touch these terminals while the extension cord is plugged into the wall. Always unplug from wall before making any changes to the relay's high-voltage side. Keep the low-voltage signal side (VCC/GND/IN) completely separate from the high-voltage side visually — do not let wires cross accidentally.

### Checkpoint before moving on
- [ ] All sensors physically mounted and wired per the pin table
- [ ] Power rails on both breadboards carry correct voltage confirmed with multimeter (5V rail = 5V, 3.3V connections = 3.3V)
- [ ] Relay's high voltage terminals are physically isolated from the breadboard's low voltage side
- [ ] Extension cord's live wire is cut and correctly inserted through relay COM/NO terminals
- [ ] Nothing is plugged into the wall yet — do this only in Module 2 testing

---

## MODULE 2 — Individual Sensor Testing

### Prerequisite
Module 1 complete. ESP32 connected to laptop via USB cable.

### 2.1 — Test PIR Sensor

Create new Arduino sketch, upload this:

```cpp
#define PIR_PIN 27

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  Serial.println("PIR sensor test starting...");
  delay(2000); // PIR needs warm-up time
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  Serial.print("Motion: ");
  Serial.println(motion == HIGH ? "DETECTED" : "none");
  delay(500);
}
```

**Test procedure:** Open Serial Monitor (115200 baud). Wave your hand in front of the PIR. You should see "DETECTED" appear. Stay still — should return to "none" after the PIR's configured delay (adjust the small potentiometer on the PIR module if it's too slow/fast — turn clockwise to increase delay).

### 2.2 — Test MQ135 Sensor

```cpp
#define MQ135_PIN 34

void setup() {
  Serial.begin(115200);
  Serial.println("MQ135 test starting... let it warm up for 2 minutes");
}

void loop() {
  int raw = analogRead(MQ135_PIN);
  Serial.print("MQ135 raw ADC: ");
  Serial.println(raw);
  delay(1000);
}
```

**Test procedure:** Let the sensor run for at least 2 minutes to stabilize (ideally 24-48 hrs burn-in before real use, but 2 minutes is enough for a quick test). Breathe directly onto the sensor — the raw ADC value should rise. Note the baseline value (room air) and the "breath" value — you'll need these for calibration in Module 3.

### 2.3 — Test INMP441 Microphone (I2S)

```cpp
#include <driver/i2s.h>

#define I2S_WS 25
#define I2S_SD 32
#define I2S_SCK 33
#define I2S_PORT I2S_NUM_0

void setup() {
  Serial.begin(115200);

  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = 64
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };

  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);
  Serial.println("I2S mic ready");
}

void loop() {
  int32_t samples[64];
  size_t bytes_read;
  i2s_read(I2S_PORT, samples, sizeof(samples), &bytes_read, portMAX_DELAY);

  int samples_read = bytes_read / sizeof(int32_t);
  long sumSquare = 0;
  for (int i = 0; i < samples_read; i++) {
    int32_t sample = samples[i] >> 14; // shift down from 32-bit to usable range
    sumSquare += (long)sample * sample;
  }
  float rms = sqrt((float)sumSquare / samples_read);

  Serial.print("Sound RMS: ");
  Serial.println(rms);
  delay(300);
}
```

**Test procedure:** Open Serial Monitor. Stay silent — note the baseline RMS. Talk or clap near the mic — RMS should rise noticeably.

### 2.4 — Test Relay

```cpp
#define RELAY_PIN 26

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  Serial.println("Relay ON — bulb should light up");
  digitalWrite(RELAY_PIN, HIGH);
  delay(3000);

  Serial.println("Relay OFF — bulb should turn off");
  digitalWrite(RELAY_PIN, LOW);
  delay(3000);
}
```

**Test procedure:** Plug extension cord into wall ONLY NOW. Upload this sketch. Watch the bulb turn on and off every 3 seconds. Unplug from wall immediately after confirming this works.

⚠️ Note: Some relay modules are "active LOW" — if your bulb behavior is inverted (ON when code says LOW), just flip the logic in later modules.

### Checkpoint before moving on
- [ ] PIR correctly shows DETECTED on motion, none when still
- [ ] MQ135 raw values rise noticeably when you breathe on it — note baseline and peak values
- [ ] INMP441 RMS values rise when you make sound — note baseline and peak values
- [ ] Relay reliably switches bulb ON/OFF
- [ ] All four tested with separate sketches — do NOT combine yet

---

## MODULE 3 — Data Collection for Bayesian Calibration

### Prerequisite
Module 2 complete, all sensors individually verified working.

### Why this module exists
The Bayesian model needs conditional probability tables — e.g., "what's the chance CO₂ is high GIVEN the room is occupied." You get these numbers by logging real sensor data with manually labeled ground truth (occupied/vacant), then computing statistics from it. This is a one-time calibration step.

### 3.1 — Combined logging sketch

```cpp
#include <driver/i2s.h>

#define PIR_PIN 27
#define MQ135_PIN 34
#define I2S_WS 25
#define I2S_SD 32
#define I2S_SCK 33
#define I2S_PORT I2S_NUM_0

void setupI2S() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = 64
  };
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);
}

float readSoundRMS() {
  int32_t samples[64];
  size_t bytes_read;
  i2s_read(I2S_PORT, samples, sizeof(samples), &bytes_read, portMAX_DELAY);
  int samples_read = bytes_read / sizeof(int32_t);
  long sumSquare = 0;
  for (int i = 0; i < samples_read; i++) {
    int32_t sample = samples[i] >> 14;
    sumSquare += (long)sample * sample;
  }
  return sqrt((float)sumSquare / samples_read);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  setupI2S();
  delay(2000);
  // CSV header — copy this from Serial Monitor into a .csv file
  Serial.println("timestamp,pir,mq135,sound_rms");
}

void loop() {
  int pir = digitalRead(PIR_PIN);
  int mq135 = analogRead(MQ135_PIN);
  float sound = readSoundRMS();

  Serial.print(millis());
  Serial.print(",");
  Serial.print(pir);
  Serial.print(",");
  Serial.print(mq135);
  Serial.print(",");
  Serial.println(sound);

  delay(2000); // log every 2 seconds
}
```

### 3.2 — Collection procedure

1. Upload the sketch above, open Serial Monitor
2. Enable "Autoscroll" and use Arduino IDE's Serial Monitor "Save" or copy-paste output into a text file periodically — OR better, use a simple Python serial logger (see below) that also lets you tag labels live

**Recommended: use this Python script instead of manual copy-paste**

```python
# collect_data.py
import serial
import csv
import time

PORT = "COM5"  # change to your ESP32's port (check Arduino IDE > Tools > Port)
BAUD = 115200

ser = serial.Serial(PORT, BAUD, timeout=2)
time.sleep(2)

with open("training_data.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["timestamp", "pir", "mq135", "sound_rms", "label"])

    print("Logging started. Type 'o' + Enter when room becomes OCCUPIED,")
    print("type 'v' + Enter when room becomes VACANT. Ctrl+C to stop.")

    current_label = "vacant"

    import threading
    def label_listener():
        global current_label
        while True:
            cmd = input()
            if cmd.strip().lower() == "o":
                current_label = "occupied"
                print(">>> Label switched to OCCUPIED")
            elif cmd.strip().lower() == "v":
                current_label = "vacant"
                print(">>> Label switched to VACANT")

    t = threading.Thread(target=label_listener, daemon=True)
    t.start()

    while True:
        line = ser.readline().decode("utf-8", errors="ignore").strip()
        if line and "," in line and not line.startswith("timestamp"):
            parts = line.split(",")
            if len(parts) == 4:
                writer.writerow(parts + [current_label])
                f.flush()
                print(line, "->", current_label)
```

**Run it:**
```bash
pip install pyserial
python3 collect_data.py
```

### 3.3 — Collection plan (do this over 1-2 sessions, ~2-3 hours total is enough for a demo-scale model)

Run these scenarios in your mock cardboard room, typing `o` or `v` in the terminal as you switch:

| Scenario | Duration | Label |
|---|---|---|
| Empty box, closed | 10 min | v |
| Person moving inside | 10 min | o |
| Person sitting still, silent | 10 min | o |
| Person sitting still, breathing/talking | 10 min | o |
| Empty box again | 10 min | v |
| Person entering/leaving repeatedly | 10 min | mixed (type o/v as it happens) |

Aim for at least 200-300 logged rows total (at 2 sec intervals, 10 minutes = ~300 rows, so this plan easily gives you 1000+ rows).

### Checkpoint before moving on
- [ ] `training_data.csv` exists with columns: timestamp, pir, mq135, sound_rms, label
- [ ] File has at least 500 rows
- [ ] Both "occupied" and "vacant" labels are present in reasonable proportion (not 95% one label)
- [ ] Spot-check the CSV — occupied rows generally show higher mq135/sound than vacant rows

---

## MODULE 4 — Compute Bayesian Probability Tables (Python, offline)

### Prerequisite
Module 3 complete, `training_data.csv` ready.

### 4.1 — Bucketing and probability computation script

```python
# compute_bayes_table.py
import pandas as pd
import numpy as np

df = pd.read_csv("training_data.csv")

# --- Step 1: bucket continuous sensors into low/med/high ---
def bucket(series, low_thresh, high_thresh):
    return series.apply(lambda x: 0 if x < low_thresh else (1 if x < high_thresh else 2))

# Print raw stats first to help you choose thresholds
print("MQ135 stats:\n", df['mq135'].describe())
print("\nSound RMS stats:\n", df['sound_rms'].describe())

# --- EDIT THESE THRESHOLDS based on the printed stats above ---
MQ135_LOW = df['mq135'].quantile(0.33)
MQ135_HIGH = df['mq135'].quantile(0.66)
SOUND_LOW = df['sound_rms'].quantile(0.33)
SOUND_HIGH = df['sound_rms'].quantile(0.66)

df['mq135_bucket'] = bucket(df['mq135'], MQ135_LOW, MQ135_HIGH)
df['sound_bucket'] = bucket(df['sound_rms'], SOUND_LOW, SOUND_HIGH)

# --- Step 2: compute P(sensor_state | label) for each sensor ---
def cond_prob_table(df, col, n_buckets, label_col='label'):
    table = {}
    for label in ['occupied', 'vacant']:
        subset = df[df[label_col] == label]
        total = len(subset)
        probs = []
        for b in range(n_buckets):
            count = len(subset[subset[col] == b])
            # Laplace smoothing to avoid zero probabilities
            prob = (count + 1) / (total + n_buckets)
            probs.append(round(prob, 4))
        table[label] = probs
    return table

pir_table = cond_prob_table(df, 'pir', 2)          # PIR: 0 or 1
mq135_table = cond_prob_table(df, 'mq135_bucket', 3)  # low/med/high
sound_table = cond_prob_table(df, 'sound_bucket', 3)  # low/med/high

print("\n--- COPY THESE INTO YOUR ESP32 FIRMWARE ---\n")
print(f"float P_PIR_OCC[2]   = {{{pir_table['occupied'][0]}, {pir_table['occupied'][1]}}};")
print(f"float P_PIR_VAC[2]   = {{{pir_table['vacant'][0]}, {pir_table['vacant'][1]}}};")
print(f"float P_CO2_OCC[3]   = {{{mq135_table['occupied'][0]}, {mq135_table['occupied'][1]}, {mq135_table['occupied'][2]}}};")
print(f"float P_CO2_VAC[3]   = {{{mq135_table['vacant'][0]}, {mq135_table['vacant'][1]}, {mq135_table['vacant'][2]}}};")
print(f"float P_SOUND_OCC[3] = {{{sound_table['occupied'][0]}, {sound_table['occupied'][1]}, {sound_table['occupied'][2]}}};")
print(f"float P_SOUND_VAC[3] = {{{sound_table['vacant'][0]}, {sound_table['vacant'][1]}, {sound_table['vacant'][2]}}};")

print(f"\n// Bucket thresholds — use these in ESP32 firmware to bucket live readings")
print(f"#define MQ135_LOW_THRESH {int(MQ135_LOW)}")
print(f"#define MQ135_HIGH_THRESH {int(MQ135_HIGH)}")
print(f"#define SOUND_LOW_THRESH {SOUND_LOW:.2f}")
print(f"#define SOUND_HIGH_THRESH {SOUND_HIGH:.2f}")
```

**Run it:**
```bash
python3 compute_bayes_table.py
```

This prints ready-to-paste C++ arrays and threshold `#define`s. Save this output — you'll paste it directly into the Module 5 firmware.

### Checkpoint before moving on
- [ ] Script runs without error and prints 6 probability arrays
- [ ] None of the printed probabilities are exactly 0.0000 (Laplace smoothing should prevent this)
- [ ] Threshold values printed look sensible (high threshold > low threshold, both within the range seen in your raw stats)
- [ ] You have saved this printed output in a text file for the next module

---

## MODULE 5 — Bayesian Inference Firmware (Core Intelligence)

### Prerequisite
Module 4 complete, probability tables and thresholds saved.

### 5.1 — Full inference sketch

Paste your Module 4 output values into the marked section below.

```cpp
#include <driver/i2s.h>

// ===== PIN DEFINITIONS =====
#define PIR_PIN 27
#define MQ135_PIN 34
#define RELAY_PIN 26
#define I2S_WS 25
#define I2S_SD 32
#define I2S_SCK 33
#define I2S_PORT I2S_NUM_0

// ===== PASTE YOUR MODULE 4 OUTPUT HERE =====
float P_PIR_OCC[2]   = {0.45, 0.55};   // REPLACE with your actual values
float P_PIR_VAC[2]   = {0.95, 0.05};   // REPLACE
float P_CO2_OCC[3]   = {0.10, 0.25, 0.65}; // REPLACE
float P_CO2_VAC[3]   = {0.70, 0.20, 0.10}; // REPLACE
float P_SOUND_OCC[3] = {0.15, 0.25, 0.60}; // REPLACE
float P_SOUND_VAC[3] = {0.75, 0.15, 0.10}; // REPLACE

#define MQ135_LOW_THRESH 800    // REPLACE with your value
#define MQ135_HIGH_THRESH 1400  // REPLACE with your value
#define SOUND_LOW_THRESH 50.0   // REPLACE with your value
#define SOUND_HIGH_THRESH 200.0 // REPLACE with your value
// ===== END PASTE SECTION =====

void setupI2S() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = 64
  };
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);
}

float readSoundRMS() {
  int32_t samples[64];
  size_t bytes_read;
  i2s_read(I2S_PORT, samples, sizeof(samples), &bytes_read, portMAX_DELAY);
  int samples_read = bytes_read / sizeof(int32_t);
  long sumSquare = 0;
  for (int i = 0; i < samples_read; i++) {
    int32_t sample = samples[i] >> 14;
    sumSquare += (long)sample * sample;
  }
  return sqrt((float)sumSquare / samples_read);
}

int bucketValue(float val, float lowT, float highT) {
  if (val < lowT) return 0;
  if (val < highT) return 1;
  return 2;
}

// Returns confidence score 0.0 - 1.0 that room is OCCUPIED
float bayesianInference(int pir, int co2_bucket, int sound_bucket, float prior_occ) {
  float prior_vac = 1.0 - prior_occ;

  float likelihood_occ = P_PIR_OCC[pir] * P_CO2_OCC[co2_bucket] * P_SOUND_OCC[sound_bucket];
  float likelihood_vac = P_PIR_VAC[pir] * P_CO2_VAC[co2_bucket] * P_SOUND_VAC[sound_bucket];

  float numerator_occ = likelihood_occ * prior_occ;
  float numerator_vac = likelihood_vac * prior_vac;
  float total = numerator_occ + numerator_vac;

  if (total == 0) return 0.5; // fallback if something is degenerate
  return numerator_occ / total;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  setupI2S();
  delay(2000);
  Serial.println("NeuroOccupy inference engine started");
}

void loop() {
  int pir = digitalRead(PIR_PIN);
  int mq135_raw = analogRead(MQ135_PIN);
  float sound_rms = readSoundRMS();

  int co2_bucket = bucketValue(mq135_raw, MQ135_LOW_THRESH, MQ135_HIGH_THRESH);
  int sound_bucket = bucketValue(sound_rms, SOUND_LOW_THRESH, SOUND_HIGH_THRESH);

  // ===== STATIC PRIOR FOR NOW — Module 6 will replace this with timetable logic =====
  float prior_occ = 0.5; // neutral prior until timetable module is added

  float confidence = bayesianInference(pir, co2_bucket, sound_bucket, prior_occ);

  bool roomOccupied = confidence > 0.5;
  digitalWrite(RELAY_PIN, roomOccupied ? HIGH : LOW);

  Serial.print("PIR:"); Serial.print(pir);
  Serial.print(" CO2raw:"); Serial.print(mq135_raw);
  Serial.print(" CO2bucket:"); Serial.print(co2_bucket);
  Serial.print(" SoundRMS:"); Serial.print(sound_rms);
  Serial.print(" SoundBucket:"); Serial.print(sound_bucket);
  Serial.print(" Confidence:"); Serial.print(confidence, 3);
  Serial.print(" Relay:"); Serial.println(roomOccupied ? "ON" : "OFF");

  delay(2000);
}
```

### 5.2 — Test procedure

1. Upload this sketch
2. Plug extension cord into wall
3. Open Serial Monitor
4. Simulate vacant: leave the mock room empty and silent — watch confidence drop, relay should go OFF, bulb turns off
5. Simulate occupied with motion: wave hand near PIR — confidence should rise, relay ON, bulb turns on
6. Simulate stationary occupied: sit still and breathe near sensors without moving — confidence should still rise mainly due to CO2/sound, relay ON — **this is the key differentiator to demonstrate**

### Checkpoint before moving on
- [ ] Bulb turns OFF within ~10-20 seconds of the mock room being truly empty
- [ ] Bulb turns/stays ON when there's motion
- [ ] Bulb stays ON even with a stationary "occupant" breathing/making small sounds (this proves the multi-sensor fusion works — if this fails, revisit your Module 4 thresholds/buckets)
- [ ] Confidence values printed in Serial Monitor make logical sense (high when clearly occupied, low when clearly vacant)

---

## MODULE 6 — Timetable Context Integration

### Prerequisite
Module 5 complete and working.

### 6.1 — Create the timetable file

Create a file named `timetable.csv` with this format (24-hour time, day of week 0=Sunday):

```
day,start_hour,start_min,end_hour,end_min
1,9,0,10,0
1,10,0,11,0
1,14,0,15,0
2,9,0,10,0
2,11,0,12,0
```
(This is a sample — customize with your actual demo day's "scheduled slot" for testing. For the demo, just add ONE entry that covers the exact time you'll be presenting.)

### 6.2 — Upload timetable.csv to ESP32 SPIFFS

1. In Arduino IDE, install the "ESP32 Sketch Data Upload" tool:
   - Download from: https://github.com/me-no-dev/arduino-esp32fs-plugin (follow their README for your Arduino IDE version)
2. Create a folder named `data` inside your sketch folder
3. Place `timetable.csv` inside that `data` folder
4. Tools menu → "ESP32 Sketch Data Upload" → this flashes the CSV to SPIFFS

### 6.3 — Updated firmware with timetable + SPIFFS

Add this to the top of your Module 5 sketch (includes) and replace the static prior section:

```cpp
#include <SPIFFS.h>
#include <time.h>

// ===== Add this function =====
bool isScheduledNow() {
  if (!SPIFFS.exists("/timetable.csv")) {
    Serial.println("No timetable file found, using default prior");
    return false;
  }

  File file = SPIFFS.open("/timetable.csv", "r");
  if (!file) return false;

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to get time");
    file.close();
    return false;
  }

  int currentDay = timeinfo.tm_wday; // 0=Sunday
  int currentMin = timeinfo.tm_hour * 60 + timeinfo.tm_min;

  bool found = false;
  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() == 0 || line.startsWith("day")) continue;

    int vals[5];
    int idx = 0;
    int start = 0;
    for (int i = 0; i <= line.length(); i++) {
      if (i == line.length() || line[i] == ',') {
        vals[idx++] = line.substring(start, i).toInt();
        start = i + 1;
      }
    }
    // vals: day, start_hour, start_min, end_hour, end_min
    if (vals[0] == currentDay) {
      int startMin = vals[1] * 60 + vals[2];
      int endMin = vals[3] * 60 + vals[4];
      if (currentMin >= startMin && currentMin <= endMin) {
        found = true;
        break;
      }
    }
  }
  file.close();
  return found;
}

// ===== Add this to setup(), after Serial.begin() =====
void setupSPIFFSAndTime() {
  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS mount failed");
  }
  // NTP time sync — requires WiFi connected (added in Module 7)
  configTime(19800, 0, "pool.ntp.org"); // 19800 = IST offset in seconds (UTC+5:30)
}
```

**In your `loop()`, replace the static prior line:**
```cpp
// OLD: float prior_occ = 0.5;
// NEW:
float prior_occ = isScheduledNow() ? 0.80 : 0.20;
```

**Call `setupSPIFFSAndTime()` inside `setup()`** — but note this requires WiFi to be connected first for NTP time sync, so this will be fully wired up in Module 7. For now, test the SPIFFS file reading logic independently by hardcoding a fake time if needed.

### Checkpoint before moving on
- [ ] `timetable.csv` successfully uploaded to SPIFFS (verify with a simple SPIFFS file-read test sketch printing file contents to Serial)
- [ ] `isScheduledNow()` compiles without error
- [ ] (Full live testing of this happens in Module 7 once WiFi + NTP time is active)

---

## MODULE 7 — WiFi + MQTT + NTP Time

### Prerequisite
Module 6 complete. Mosquitto broker running on your laptop (Module 0.3). Laptop and ESP32 on the same WiFi network (use your phone's hotspot for the demo — more reliable than college WiFi).

### 7.1 — Find your laptop's IP address

```bash
# Windows
ipconfig
# Mac/Linux
ifconfig
```
Note the IPv4 address (e.g., `192.168.1.5`) — this is your MQTT broker address.

### 7.2 — Full integrated firmware (combines Modules 5, 6, 7)

```cpp
#include <driver/i2s.h>
#include <SPIFFS.h>
#include <time.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== WIFI + MQTT CONFIG =====
const char* WIFI_SSID = "YOUR_HOTSPOT_NAME";
const char* WIFI_PASS = "YOUR_HOTSPOT_PASSWORD";
const char* MQTT_BROKER = "192.168.1.5"; // REPLACE with your laptop's IP
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "neuroccupy/room1";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ===== PIN DEFINITIONS =====
#define PIR_PIN 27
#define MQ135_PIN 34
#define RELAY_PIN 26
#define I2S_WS 25
#define I2S_SD 32
#define I2S_SCK 33
#define I2S_PORT I2S_NUM_0

// ===== PASTE YOUR MODULE 4 OUTPUT HERE (same as Module 5) =====
float P_PIR_OCC[2]   = {0.45, 0.55};
float P_PIR_VAC[2]   = {0.95, 0.05};
float P_CO2_OCC[3]   = {0.10, 0.25, 0.65};
float P_CO2_VAC[3]   = {0.70, 0.20, 0.10};
float P_SOUND_OCC[3] = {0.15, 0.25, 0.60};
float P_SOUND_VAC[3] = {0.75, 0.15, 0.10};
#define MQ135_LOW_THRESH 800
#define MQ135_HIGH_THRESH 1400
#define SOUND_LOW_THRESH 50.0
#define SOUND_HIGH_THRESH 200.0
// ===== END PASTE SECTION =====

// WES tracking
unsigned long relayOffSeconds = 0;
unsigned long totalSeconds = 0;

void setupWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
}

void setupMQTT() {
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");
    if (mqttClient.connect("ESP32_NeuroOccupy")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc="); Serial.print(mqttClient.state());
      delay(2000);
    }
  }
}

void setupI2S() {
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = 64
  };
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);
}

float readSoundRMS() {
  int32_t samples[64];
  size_t bytes_read;
  i2s_read(I2S_PORT, samples, sizeof(samples), &bytes_read, portMAX_DELAY);
  int samples_read = bytes_read / sizeof(int32_t);
  long sumSquare = 0;
  for (int i = 0; i < samples_read; i++) {
    int32_t sample = samples[i] >> 14;
    sumSquare += (long)sample * sample;
  }
  return sqrt((float)sumSquare / samples_read);
}

int bucketValue(float val, float lowT, float highT) {
  if (val < lowT) return 0;
  if (val < highT) return 1;
  return 2;
}

float bayesianInference(int pir, int co2_bucket, int sound_bucket, float prior_occ) {
  float prior_vac = 1.0 - prior_occ;
  float likelihood_occ = P_PIR_OCC[pir] * P_CO2_OCC[co2_bucket] * P_SOUND_OCC[sound_bucket];
  float likelihood_vac = P_PIR_VAC[pir] * P_CO2_VAC[co2_bucket] * P_SOUND_VAC[sound_bucket];
  float numerator_occ = likelihood_occ * prior_occ;
  float numerator_vac = likelihood_vac * prior_vac;
  float total = numerator_occ + numerator_vac;
  if (total == 0) return 0.5;
  return numerator_occ / total;
}

bool isScheduledNow() {
  if (!SPIFFS.exists("/timetable.csv")) return false;
  File file = SPIFFS.open("/timetable.csv", "r");
  if (!file) return false;

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) { file.close(); return false; }

  int currentDay = timeinfo.tm_wday;
  int currentMin = timeinfo.tm_hour * 60 + timeinfo.tm_min;
  bool found = false;

  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() == 0 || line.startsWith("day")) continue;
    int vals[5]; int idx = 0; int start = 0;
    for (int i = 0; i <= line.length(); i++) {
      if (i == line.length() || line[i] == ',') {
        vals[idx++] = line.substring(start, i).toInt();
        start = i + 1;
      }
    }
    if (vals[0] == currentDay) {
      int startMin = vals[1]*60 + vals[2];
      int endMin = vals[3]*60 + vals[4];
      if (currentMin >= startMin && currentMin <= endMin) { found = true; break; }
    }
  }
  file.close();
  return found;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  setupI2S();
  if (!SPIFFS.begin(true)) Serial.println("SPIFFS mount failed");

  setupWiFi();
  configTime(19800, 0, "pool.ntp.org");
  setupMQTT();
  delay(2000);
  Serial.println("NeuroOccupy full system started");
}

void loop() {
  if (!mqttClient.connected()) reconnectMQTT();
  mqttClient.loop();

  int pir = digitalRead(PIR_PIN);
  int mq135_raw = analogRead(MQ135_PIN);
  float sound_rms = readSoundRMS();

  int co2_bucket = bucketValue(mq135_raw, MQ135_LOW_THRESH, MQ135_HIGH_THRESH);
  int sound_bucket = bucketValue(sound_rms, SOUND_LOW_THRESH, SOUND_HIGH_THRESH);

  bool scheduled = isScheduledNow();
  float prior_occ = scheduled ? 0.80 : 0.20;

  float confidence = bayesianInference(pir, co2_bucket, sound_bucket, prior_occ);
  bool roomOccupied = confidence > 0.5;
  digitalWrite(RELAY_PIN, roomOccupied ? HIGH : LOW);

  // WES tracking
  totalSeconds += 2;
  if (!roomOccupied) relayOffSeconds += 2;
  float wes = (totalSeconds > 0) ? (100.0 * relayOffSeconds / totalSeconds) : 0;

  // Anomaly: scheduled occupied but sensors say vacant
  bool anomaly = scheduled && !roomOccupied;

  // Publish JSON to MQTT
  StaticJsonDocument<300> doc;
  doc["pir"] = pir;
  doc["mq135_raw"] = mq135_raw;
  doc["sound_rms"] = sound_rms;
  doc["confidence"] = confidence;
  doc["relay"] = roomOccupied ? "ON" : "OFF";
  doc["scheduled"] = scheduled;
  doc["wes"] = wes;
  doc["anomaly"] = anomaly;

  char buffer[300];
  serializeJson(doc, buffer);
  mqttClient.publish(MQTT_TOPIC, buffer);

  Serial.println(buffer);
  delay(2000);
}
```

### 7.3 — Test procedure

1. Update `WIFI_SSID`, `WIFI_PASS`, `MQTT_BROKER` with your actual values
2. Upload the sketch
3. Open Serial Monitor — confirm "WiFi connected" and MQTT "connected" messages appear
4. On your laptop terminal, subscribe to the topic to verify data is flowing:
   ```bash
   mosquitto_sub -h localhost -t neuroccupy/room1
   ```
5. You should see JSON messages appearing every 2 seconds

### Checkpoint before moving on
- [ ] ESP32 connects to WiFi successfully (visible in Serial Monitor)
- [ ] ESP32 connects to MQTT broker successfully
- [ ] `mosquitto_sub` on laptop shows live JSON data streaming every 2 seconds
- [ ] JSON contains all fields: pir, mq135_raw, sound_rms, confidence, relay, scheduled, wes, anomaly
- [ ] Relay/bulb behavior still correct as tested in Module 5

---

## MODULE 8 — Node-RED Dashboard

### Prerequisite
Module 7 complete, MQTT data flowing correctly.

### 8.1 — Build the flow

Open Node-RED at `localhost:1880`. Build this flow by dragging nodes from the left palette:

**Node chain:**
```
[MQTT In] → [JSON parse] → [Function: split fields] → [Dashboard Gauges/Text/Chart]
```

**8.1.1 — MQTT In node**
- Double-click to configure
- Server: `localhost:1883`
- Topic: `neuroccupy/room1`
- Output: a parsed JSON object (Node-RED does this automatically)

**8.1.2 — Function node — "Extract Fields"**
Add a Function node with this code:
```javascript
msg.payload_confidence = msg.payload.confidence;
msg.payload_relay = msg.payload.relay;
msg.payload_wes = msg.payload.wes;
msg.payload_scheduled = msg.payload.scheduled;
msg.payload_anomaly = msg.payload.anomaly;
msg.payload_pir = msg.payload.pir;
msg.payload_mq135 = msg.payload.mq135_raw;
msg.payload_sound = msg.payload.sound_rms;
return msg;
```

**8.1.3 — Dashboard nodes to add (from node-red-dashboard palette):**

- **Gauge** node → bind to `msg.payload.confidence`, range 0-1, label "Occupancy Confidence"
- **Text** node → bind to `msg.payload.relay`, label "Relay State"
- **Text** node → bind to `msg.payload.scheduled`, label "Class Scheduled"
- **Chart** node → bind to `msg.payload.confidence`, type "line", label "Confidence Over Time"
- **Text** node → bind to `msg.payload.wes`, label "Wastage Efficiency Score (%)"
- **Text** node → bind to `msg.payload.anomaly`, label "Anomaly Alert" (style this red when true using a Switch node that routes to a different colored text node)

**8.1.4 — Anomaly alert styling (optional but impressive for demo)**

Add a Switch node after the Function node:
- If `msg.payload.anomaly == true` → route to a red-colored Text/Notification dashboard node saying "⚠ Room should be occupied per schedule!"
- Else → route to nothing / a green "Normal" indicator

### 8.2 — Deploy and arrange dashboard

1. Click "Deploy" (top right)
2. Open dashboard at `localhost:1880/ui`
3. Drag/resize widgets in the Dashboard layout tab (accessible from the sidebar) to arrange them nicely — put the gauge front and center, chart below it, text indicators to the side

### Checkpoint before moving on
- [ ] Dashboard loads at `localhost:1880/ui` without errors
- [ ] Confidence gauge updates live as sensors change
- [ ] Relay state text updates correctly matching physical bulb state
- [ ] Chart shows a live line graph building up over time
- [ ] WES percentage updates and increases when relay is OFF for longer
- [ ] Anomaly indicator changes color/text when you force a schedule-mismatch scenario (see Module 9)

---

## MODULE 9 — Mock Room Build (Physical Demo Setup)

### Prerequisite
All previous modules complete and individually tested.

### 9.1 — Build the mock room enclosure

1. Take a medium cardboard box (shoebox size or larger)
2. Cut one flap to act as a "door" that can open and close freely
3. Mount inside the box (use tape or hot glue):
   - PIR sensor facing into the box interior
   - MQ135 sensor mounted mid-height
   - INMP441 mic mounted mid-height, away from any fan/motor noise sources
4. Route all sensor wires out through a small hole in the back of the box to the breadboard/ESP32 sitting outside the box on the table
5. Place the bulb (in its holder) either inside the box (visible through a cutout window) or right next to the box for visibility

### 9.2 — Table layout for demo

```
[Laptop showing Node-RED dashboard]  [Mock cardboard room with sensors]  [ESP32 + breadboard + relay, visible]
                                                                          [Bulb lit up, plugged via relay]
```

### Checkpoint before moving on
- [ ] Box is sturdy enough to not collapse during handling
- [ ] All sensors visible and clearly mounted (judges should be able to see them, not just a sealed black box)
- [ ] Wires are neat, not a tangled mess — use small cable ties or tape
- [ ] Bulb is clearly visible and its ON/OFF state is obviously noticeable from a few feet away

---

## MODULE 10 — Full Integration Test

### Prerequisite
All modules 1-9 complete.

### 10.1 — End-to-end test script (run this exact sequence before your actual demo)

| Step | Action | Expected Result |
|---|---|---|
| 1 | Power everything on, wait 30 sec | ESP32 connects to WiFi + MQTT, dashboard shows live data |
| 2 | Leave box empty, closed | Confidence drops below 0.5 within ~20 sec, bulb OFF |
| 3 | Open flap, insert hand and wave (simulate motion) | Confidence rises above 0.5 quickly, bulb ON |
| 4 | Keep hand inside, stop moving, breathe near MQ135 | Confidence should stay above 0.5 due to CO2/sound even with PIR at 0 |
| 5 | Remove hand, close flap, wait | Confidence drops, bulb OFF again |
| 6 | Edit `timetable.csv` to include current time as "scheduled", re-upload SPIFFS | Prior shifts to 0.80 |
| 7 | Keep box empty during "scheduled" time | Confidence stays higher than before even though empty; if it still drops below 0.5, dashboard should show anomaly = true |
| 8 | Check dashboard | Anomaly alert fires, WES score updates, chart shows full history of the test |

### 10.2 — Debug checklist if something fails

| Symptom | Likely cause | Fix |
|---|---|---|
| ESP32 won't connect WiFi | Wrong SSID/password, or 5GHz network (ESP32 only supports 2.4GHz) | Use phone hotspot on 2.4GHz band |
| MQTT not connecting | Wrong broker IP, firewall blocking port 1883 | Re-check `ipconfig`/`ifconfig`, temporarily disable firewall |
| Confidence always near 0.5 | Probability tables too uniform, insufficient training data variety | Redo Module 3 collection with clearer occupied/vacant separation |
| Bulb doesn't respond to relay | Relay wiring reversed or active-LOW module | Swap HIGH/LOW logic in code |
| MQ135 readings unstable/erratic | Insufficient burn-in time | Let it run powered for 30+ min before demo |
| INMP441 gives all zeros | I2S pins wired wrong, or L/R pin not grounded | Recheck wiring against Module 1.1 table |

### Checkpoint before moving on
- [ ] All 8 steps in the integration test table pass
- [ ] No crashes, freezes, or WiFi drops during a continuous 15-minute run
- [ ] Dashboard remains responsive throughout

---

## MODULE 11 — Demo Rehearsal & Final Wrap-Up

### Prerequisite
Module 10 fully passed.

### 11.1 — Demo script (rehearse this exact flow 2-3 times before the real presentation)

1. **Intro (30 sec):** "This is NeuroOccupy — it decides room occupancy using 3 sensors fused through a Bayesian model, cross-referenced with the class timetable, all running on this ESP32."

2. **Show the dashboard (30 sec):** Point to confidence gauge, relay state, WES score, chart.

3. **Scenario 1 — stationary person problem (1 min):** Sit still near the box, breathe on it. Show confidence stays high despite PIR=0. "A basic PIR-only system would have cut power here — ours doesn't."

4. **Scenario 2 — true vacancy (1 min):** Step away, close flap. Show confidence drop and bulb turn off within seconds.

5. **Scenario 3 — schedule override (1 min):** Show the timetable CSV on your laptop screen. Explain that during a "scheduled" slot, the system holds power on and flags an anomaly if the room appears empty.

6. **Wrap (30 sec):** State the real-world deployment story — DIN contactor at MCB, ₹2500/room, 3-month payback.

### 11.2 — Pre-demo checklist (do this the morning of your presentation)

- [ ] MQ135 has been powered on and running for at least 30 minutes before demo starts
- [ ] Phone hotspot fully charged and has data/is in range
- [ ] Laptop fully charged, Mosquitto and Node-RED both running and tested
- [ ] `timetable.csv` updated with the correct date/time slot for your actual demo slot
- [ ] All wiring double-checked, nothing loose
- [ ] Backup: have a screen recording of a successful full run saved on your laptop in case live demo has WiFi issues at the venue

### 11.3 — Final deliverables checklist

- [ ] Working hardware prototype (mock room + ESP32 + sensors + relay + bulb)
- [ ] Firmware source code (final integrated Module 7 sketch)
- [ ] `training_data.csv` and `compute_bayes_table.py` (proof of Bayesian model derivation)
- [ ] `timetable.csv`
- [ ] Node-RED flow exported as JSON (Menu → Export → Clipboard/File) — keep as backup and for report appendix
- [ ] PPT with all sections (Introduction, Problem Statement, Literature Survey, Hardware, Block Diagram, Planning — already prepared in this chat)
- [ ] Screen recording of one full successful demo run as backup

---

## APPENDIX A — Complete Bill of Materials (Final)

| Item | Source | Cost |
|---|---|---|
| ESP32 WROOM DevKit V1 | Arduino Shop invoice | ₹450 |
| INMP441 MEMS Mic | Arduino Shop invoice | ₹275 |
| PIR Motion Sensor | Arduino Shop invoice | ₹120 |
| MQ135 Gas Sensor | Arduino Shop invoice | ₹150 |
| Relay 1-Channel 5V | Arduino Shop invoice | ₹65 |
| Breadboard 400pt x2 | Arduino Shop invoice | ₹130 |
| Micro USB cable | Arduino Shop invoice | ₹75 |
| M-M wires x2 packs | Arduino Shop invoice | ₹40 |
| M-F wires x2 packs | Arduino Shop invoice | ₹40 |
| B22 bulb holder | Local shop | ₹20 |
| 5W LED bulb | Local shop | ₹40 |
| Extension board | Local shop | ₹100 |
| Cardboard box | DIY / free | ₹0 |
| **Total** | | **~₹1,505** |

---

## APPENDIX B — Module Dependency Chain (Quick Reference)

```
Module 0 (Environment) 
   ↓
Module 1 (Hardware Assembly)
   ↓
Module 2 (Individual Sensor Tests)
   ↓
Module 3 (Data Collection) → Module 4 (Bayesian Table Computation, offline in Python)
   ↓                              ↓
Module 5 (Inference Firmware) ←───┘
   ↓
Module 6 (Timetable Integration)
   ↓
Module 7 (WiFi + MQTT — full integrated firmware)
   ↓
Module 8 (Node-RED Dashboard)
   ↓
Module 9 (Mock Room Physical Build)
   ↓
Module 10 (Integration Testing)
   ↓
Module 11 (Demo Rehearsal + Wrap-up)
```

Do not skip ahead — each module's checkpoint must pass before starting the next. Most failures in the final demo trace back to skipping a checkpoint earlier in the chain.
