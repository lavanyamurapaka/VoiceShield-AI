// Generate realistic synthetic WAV audio buffers for test presets
export function createSyntheticAudioBuffer(type: 'human' | 'synthetic' | 'clone', audioContext: AudioContext): AudioBuffer {
  const sampleRate = 16000;
  const duration = 2.5; // 2.5 seconds
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Synthesize different physical acoustic properties
  if (type === 'human') {
    // Human: natural varying fundamental frequency ~120Hz with jitter, natural harmonics, formants, breathing
    let currentF0 = 125;
    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Natural micro-jitter + sentence intonation rise and fall
      currentF0 = 125 + 15 * Math.sin(2 * Math.PI * 1.2 * t) + (Math.random() - 0.5) * 4;
      phase += (2 * Math.PI * currentF0) / sampleRate;

      // Harmonics with natural decaying envelope
      const harmonic1 = Math.sin(phase);
      const harmonic2 = 0.5 * Math.sin(phase * 2);
      const harmonic3 = 0.25 * Math.sin(phase * 3);
      const harmonic4 = 0.12 * Math.sin(phase * 4);

      // Natural speech envelope (syllables)
      const envelope = Math.sin(Math.PI * (t / duration)) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 3.5 * t));
      const breathNoise = (Math.random() - 0.5) * 0.03;

      data[i] = (harmonic1 + harmonic2 + harmonic3 + harmonic4 + breathNoise) * envelope * 0.4;
    }
  } else if (type === 'synthetic') {
    // Synthetic: rigid constant pitch ~180Hz, unnaturally flat high harmonics, vocoder buzz
    const rigidF0 = 175;
    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      phase += (2 * Math.PI * rigidF0) / sampleRate;

      // Excessive high-frequency harmonics (buzz) characteristic of vocoders
      let val = 0;
      for (let h = 1; h <= 12; h++) {
        val += (1.0 / Math.sqrt(h)) * Math.sin(phase * h);
      }

      // Flat robotic envelope
      const envelope = 0.7;
      // High frequency carrier noise
      const vocoderNoise = (Math.random() - 0.5) * 0.15;

      data[i] = (val * 0.15 + vocoderNoise) * envelope * 0.35;
    }
  } else {
    // Clone / Diffusion concatenation: periodic phase jumps, splicing discontinuities
    let f0 = 140;
    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Splicing discontinuities every 0.4 seconds
      if (i % (sampleRate * 0.4) < 10) {
        phase += Math.PI * 0.8; // Phase jump artifact
      }
      phase += (2 * Math.PI * f0) / sampleRate;

      const val = Math.sin(phase) + 0.6 * Math.sin(phase * 2) + 0.4 * Math.sin(phase * 3);
      const diffusionArtifact = Math.sin(2 * Math.PI * 3800 * t) * 0.08;

      data[i] = (val * 0.3 + diffusionArtifact) * 0.45;
    }
  }

  return buffer;
}
