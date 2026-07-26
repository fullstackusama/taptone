import { taptones, WaveformType, SoundOptions } from '../src/index';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupPresetPads();
  setupMasterControls();
  setupSynthesizerLab();
  setupCopyButtons();
  setupThemeToggle();
  startSpectrumVisualizer();
});

/**
 * 1. Preset Pads Event Bindings
 * We use 'pointerdown' instead of 'click' because:
 * - pointerdown fires IMMEDIATELY on press (click waits for release)
 * - pointerdown IS a trusted user gesture that can resume AudioContext
 * - This makes audio feel instant and responsive
 */
function setupPresetPads(): void {
  const pads = document.querySelectorAll<HTMLButtonElement>('.sound-pad');
  pads.forEach((pad) => {
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const soundName = pad.dataset.sound;
      if (!soundName) return;

      switch (soundName) {
        case 'click': taptones.click(); break;
        case 'pop': taptones.pop(); break;
        case 'toggleOn': taptones.toggleOn(); break;
        case 'toggleOff': taptones.toggleOff(); break;
        case 'success': taptones.success(); break;
        case 'error': taptones.error(); break;
        case 'slide': taptones.slide(); break;
        case 'laser': taptones.laser(); break;
        case 'nudge': taptones.nudge(); break;
        case 'zip': taptones.zip(); break;
        case 'sparkle': taptones.sparkle(); break;
      }
    });
  });
}

/**
 * 2. Master Controls (Volume, Mute, Haptics)
 */
function setupMasterControls(): void {
  const volSlider = document.getElementById('master-vol') as HTMLInputElement;
  const volLabel = document.getElementById('master-vol-val')!;
  const toggleMute = document.getElementById('toggle-mute')!;
  const muteLabel = document.getElementById('mute-label')!;
  const toggleHaptics = document.getElementById('toggle-haptics')!;
  const hapticLabel = document.getElementById('haptic-label')!;

  volSlider.addEventListener('input', () => {
    const val = parseFloat(volSlider.value);
    taptones.configure({ masterVolume: val });
    volLabel.textContent = `${Math.round(val * 100)}%`;
  });

  let muted = false;
  toggleMute.addEventListener('click', () => {
    muted = !muted;
    taptones.configure({ muted });
    toggleMute.classList.toggle('active', !muted);
    muteLabel.textContent = muted ? 'Muted' : 'AUDIO ON';
  });

  let hapticsEnabled = true;
  toggleHaptics.addEventListener('click', () => {
    hapticsEnabled = !hapticsEnabled;
    taptones.configure({ hapticsEnabled });
    toggleHaptics.classList.toggle('active', hapticsEnabled);
    hapticLabel.textContent = hapticsEnabled ? 'HAPTICS ON' : 'HAPTICS OFF';
  });
}

/**
 * Theme Toggle Handler (Light / Dark)
 */
function setupThemeToggle(): void {
  const themeBtn = document.getElementById('toggle-theme')!;
  const themeLabel = document.getElementById('theme-label')!;

  // Read initial saved theme or default to light
  const savedTheme = localStorage.getItem('taptone_theme') || 'light';
  applyTheme(savedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('taptone_theme', nextTheme);
  });

  function applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    themeBtn.classList.toggle('active', theme === 'light');
    themeLabel.textContent = theme === 'light' ? 'DARK THEME' : 'LIGHT THEME';
  }
}

/**
 * 3. Custom Synthesizer Laboratory Sliders & Generator
 */
let currentWave: WaveformType = 'sine';

function setupSynthesizerLab(): void {
  const waveChips = document.querySelectorAll<HTMLButtonElement>('.wave-chip');
  const freqInput = document.getElementById('param-freq') as HTMLInputElement;
  const endFreqInput = document.getElementById('param-endfreq') as HTMLInputElement;
  const durationInput = document.getElementById('param-duration') as HTMLInputElement;
  const volumeInput = document.getElementById('param-volume') as HTMLInputElement;
  const hapticInput = document.getElementById('param-haptic') as HTMLInputElement;
  const jitterInput = document.getElementById('param-jitter') as HTMLInputElement;

  const valFreq = document.getElementById('val-freq')!;
  const valEndFreq = document.getElementById('val-endfreq')!;
  const valDuration = document.getElementById('val-duration')!;
  const valVolume = document.getElementById('val-volume')!;
  const valHaptic = document.getElementById('val-haptic')!;
  const valJitter = document.getElementById('val-jitter')!;
  const playBtn = document.getElementById('btn-play-custom')!;

  waveChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      waveChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentWave = (chip.dataset.wave as WaveformType) || 'sine';
      updateLabCode();
    });
  });

  const inputs = [freqInput, endFreqInput, durationInput, volumeInput, hapticInput, jitterInput];
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      valFreq.textContent = `${freqInput.value} Hz`;
      valEndFreq.textContent = `${endFreqInput.value} Hz`;
      valDuration.textContent = `${durationInput.value}s`;
      valVolume.textContent = volumeInput.value;
      valHaptic.textContent = `${hapticInput.value} ms`;
      valJitter.textContent = `${Math.round(parseFloat(jitterInput.value) * 100)}%`;
      updateLabCode();
    });
  });

  playBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const opts: SoundOptions = {
      frequency: parseFloat(freqInput.value),
      endFrequency: parseFloat(endFreqInput.value),
      duration: parseFloat(durationInput.value),
      type: currentWave,
      volume: parseFloat(volumeInput.value),
      haptic: parseInt(hapticInput.value, 10),
      jitter: parseFloat(jitterInput.value),
    };
    taptones.play(opts);
  });
}

function updateLabCode(): void {
  const freq = (document.getElementById('param-freq') as HTMLInputElement).value;
  const endFreq = (document.getElementById('param-endfreq') as HTMLInputElement).value;
  const duration = (document.getElementById('param-duration') as HTMLInputElement).value;
  const volume = (document.getElementById('param-volume') as HTMLInputElement).value;
  const haptic = (document.getElementById('param-haptic') as HTMLInputElement).value;
  const jitter = (document.getElementById('param-jitter') as HTMLInputElement).value;
  const codeEl = document.getElementById('code-snippet')!;

  codeEl.textContent = `import { taptones } from 'taptones';

taptones.play({
  frequency: ${freq},
  endFrequency: ${endFreq},
  duration: ${duration},
  type: '${currentWave}',
  volume: ${volume},
  haptic: ${haptic}${parseFloat(jitter) > 0 ? `,\n  jitter: ${jitter}` : ''}
});`;
}

/**
 * 4. Clipboard Copy Utilities
 */
function setupCopyButtons(): void {
  const copyInstallBtn = document.getElementById('copy-install-btn')!;
  const copyCodeBtn = document.getElementById('copy-code-btn')!;
  const copyExBtns = document.querySelectorAll<HTMLButtonElement>('.copy-ex-btn');

  copyInstallBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('npm install taptones');
    showToast('Copied "npm install taptones" to clipboard!');
  });

  copyCodeBtn.addEventListener('click', () => {
    const code = document.getElementById('code-snippet')!.textContent || '';
    navigator.clipboard.writeText(code);
    showToast('Copied sound code snippet!');
  });

  copyExBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;
      const codeEl = document.getElementById(targetId);
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent || '');
        showToast('Copied example code!');
      }
    });
  });
}

function showToast(msg: string): void {
  const toast = document.getElementById('toast')!;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

/**
 * 5. Realtime 60 FPS Audio Spectrum Visualizer
 */
function startSpectrumVisualizer(): void {
  const canvas = document.getElementById('spectrum-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function render(): void {
    requestAnimationFrame(render);

    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const analyser = taptones.getExistingAnalyser();
    if (!analyser) {
      drawIdleLine(ctx, canvas.width, canvas.height);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let hasData = false;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > 0) {
        hasData = true;
        break;
      }
    }

    if (!hasData) {
      drawIdleLine(ctx, canvas.width, canvas.height);
      return;
    }

    const barWidth = (canvas.width / bufferLength) * 1.8;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#06b6d4');
      gradient.addColorStop(1, '#38bdf8');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, canvas.height - barHeight, barWidth - 3, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      x += barWidth;
    }
  }

  render();
}

function drawIdleLine(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const time = Date.now() * 0.002;
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let x = 0; x < width; x += 5) {
    const y = height / 2 + Math.sin(x * 0.02 + time) * 3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}
