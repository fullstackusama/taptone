# 🔊 TapTones

> Ultra-lightweight, zero-dependency synthesized Web Audio & Web Haptics micro-library for web UI feedback with **0KB downloaded audio assets**.

[![npm version](https://img.shields.io/npm/v/taptones.svg?color=6366f1&style=flat-square)](https://www.npmjs.com/package/taptones)
[![bundle size](https://img.shields.io/bundlephobia/minzip/taptones?color=10b981&label=gzipped&style=flat-square)](https://bundlephobia.com/package/taptones)
[![license](https://img.shields.io/npm/l/taptones.svg?color=06b6d4&style=flat-square)](LICENSE)

Live Demo: [https://taptones.vercel.app](https://taptones.vercel.app)

---

## ⚡ Why TapTones?

Traditional UI sound libraries force you to host and download heavy `.mp3` or `.wav` files over the network. They add network latency, fail when offline, and bloat your web application.

**TapTones** generates crisp, physical sound effects and mobile haptics in real-time using the browser's native **Web Audio API** and **Vibration API**.

- 🚀 **0KB Audio Downloads**: Zero external audio files required.
- 📳 **Built-in Web Haptics**: Paired tactile vibration feedback for mobile devices.
- ⚡ **Ultra Fast**: Zero latency ($<1\text{ ms}$) sound synthesis directly on the GPU/CPU.
- 🪶 **Micro Footprint**: Under **2.4 KB** gzipped!
- ⚛️ **React & Vanilla JS**: Works everywhere (React, Vue, Svelte, Next.js, or plain JS).

---

## 📦 Installation

```bash
npm install taptones
# or
pnpm add taptones
# or
yarn add taptones
```

---

## 🚀 Quick Start

### 1. Vanilla JS / TypeScript

```typescript
import { taptones } from 'taptones';

// Play built-in tuned presets
taptones.click();     // Crisp button click
taptones.pop();       // Soft bubble pop
taptones.toggleOn();  // Switch ON pitch step
taptones.success();   // Dual-tone success chime
taptones.error();     // Warning low buzz
taptones.sparkle();   // Ascending shimmer
```

### 2. React / Next.js App Router (`useTapTones`)

> [!TIP]
> TapTones is 100% SSR-safe. In Next.js App Router (Next.js 13/14/15/16), simply use `'use client'` on components importing UI hooks.

```tsx
'use client';

import React from 'react';
import { useTapTones } from 'taptones/react';

export function ActionButton() {
  const { click, success } = useTapTones();

  const handleClick = () => {
    click();
    // Perform action...
    success();
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### 3. Vue 3 / Svelte / Remix / Nuxt

```typescript
import { taptones } from 'taptones';

// Works seamlessly in all modern frontend frameworks
function onToggle() {
  taptones.toggleOn();
}
```

---

## 🎛️ Sound Presets Matrix

| Method | Waveform | Sound Description | Use Case |
| :--- | :--- | :--- | :--- |
| `taptones.click()` | Triangle | Crisp mechanical switch | Primary buttons, links |
| `taptones.pop()` | Sine | Soft bubble pop | Dropdowns, tooltips, modals |
| `taptones.toggleOn()` | Sine | Upward pitch step | Dark mode switch, toggles ON |
| `taptones.toggleOff()` | Sine | Downward pitch step | Switch OFF |
| `taptones.success()` | Dual Sine | Upbeat two-note chime | Form submit, task complete |
| `taptones.error()` | Sawtooth | Low warning buzz | Validation errors, warnings |
| `taptones.slide()` | Sine | Futuristic pitch sweep | Sliders, tabs |
| `taptones.laser()` | Sawtooth | Arcade zap | Game actions, delete button |
| `taptones.nudge()` | Triangle | Tactile low thump | Drag & drop snap |
| `taptones.zip()` | Triangle | Fast micro zip | Segmented control switch |
| `taptones.sparkle()` | Arpeggio | Ascending shimmer | Achievements, likes, rewards |

---

## 🧪 Custom Synthesizer API

You can design custom micro sound FX dynamically:

```typescript
import { taptones } from 'taptones';

taptones.play({
  frequency: 800,      // Start pitch in Hz
  endFrequency: 300,   // End pitch for pitch slides
  duration: 0.05,      // Sound duration in seconds
  type: 'sine',        // 'sine' | 'triangle' | 'square' | 'sawtooth' | 'noise'
  volume: 0.25,        // Volume level (0.0 to 1.0)
  haptic: 10,          // Vibration duration in ms or pattern array
  jitter: 0.05         // 5% pitch variation for organic humanized clicks
});
```

---

## ⚙️ Global Options & Mute

```typescript
// Mute all audio globally (e.g. user setting preference)
taptones.configure({ muted: true });

// Toggle haptics globally
taptones.configure({ hapticsEnabled: false });

// Set master volume multiplier (0.0 to 1.0)
taptones.configure({ masterVolume: 0.5 });
```

---

## 📄 License

MIT © [fullstackusama](https://github.com/fullstackusama)
