import fs from 'node:fs';

// Original score and synthesized instruments. No samples, soundfonts, or imported stems.
const output = process.argv[2];
if (!output) throw Error('Provide an output .f32le path for stereo 48 kHz PCM.');
const rate = 48000;
const bar = 3.6;
const length = Math.round(16 * bar * rate);
const left = new Float32Array(length);
const right = new Float32Array(length);
const tau = 2 * Math.PI;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

// D minor with a Dorian lift in the second half. Each row is bass, chord and melody.
const score = [
  [38,[53,57,64],[[0,69],[1.8,67],[2.7,65]]],
  [34,[53,57,62],[[0.35,65],[1.2,62]]],
  [41,[53,60,64],[[0,64],[1.3,65],[2.4,69]]],
  [36,[52,55,62],[[0.25,67],[1.75,64]]],
  [38,[53,57,64],[[0.1,69],[1.2,76],[2.7,74]]],
  [34,[50,53,57],[[0,72],[1.7,69],[2.6,65]]],
  [43,[53,58,62],[[0.45,67],[1.55,69]]],
  [45,[55,58,62],[[0.1,64],[1.7,62]]],
  [38,[53,57,64],[[0,74],[1.7,72],[2.55,69]]],
  [43,[52,59,62],[[0.2,71],[1.7,69]]],
  [41,[53,57,64],[[0.45,69],[1.35,67],[2.7,65]]],
  [36,[52,55,62],[[0,64],[1.6,67]]],
  [34,[53,57,62],[[0.2,65],[2,69]]],
  [43,[52,59,62],[[0.35,67],[1.35,64],[2.65,62]]],
  [45,[52,55,62],[[0,64],[1.7,62]]],
  [38,[53,57,64],[[0.15,62]]],
];

function note(kind, midi, start, duration, gain, pan) {
  const leftGain = gain * Math.sqrt((1 - pan) / 2);
  const rightGain = gain * Math.sqrt((1 + pan) / 2);
  const first = Math.round(start * rate);
  const count = Math.round(duration * rate);
  const frequency = hz(midi);
  let phase = 0;
  for (let i = 0; i < count; i++) {
    const t = i / rate;
    const remaining = duration - t;
    let value;
    if (kind === 'cello' || kind === 'air') {
      const soft = kind === 'air';
      const vibrato = 1 + (soft ? 0.0014 : 0.003) * Math.sin(tau * 4.8 * t) * Math.min(t,1);
      phase += tau * frequency * vibrato / rate;
      const arc = Math.min(1, t / (soft ? 1.1 : 0.42), remaining / 0.72);
      value = arc * arc * (0.92 + 0.08 * Math.sin(tau * 0.56 * t))
        * (Math.sin(phase) * 0.76 + Math.sin(2 * phase) * (soft ? 0.10 : 0.22)
          + Math.sin(3 * phase) * 0.08 + Math.sin(4 * phase) * (soft ? 0 : 0.045));
    } else {
      const piano = kind === 'piano';
      const p = tau * frequency * t;
      const attack = Math.min(1, t / (piano ? 0.009 : 0.016), remaining / 0.19);
      value = attack * (0.70 * Math.exp(-t * (piano ? 1.35 : 2.4)) * Math.sin(p)
        + 0.20 * Math.exp(-t * 4.2) * Math.sin(p * 2.003)
        + 0.10 * Math.exp(-t * 9.0) * Math.sin(p * 3.008)
        + (piano ? 0.057 : 0.035) * Math.exp(-t * 16) * Math.sin(p * 5.026));
      value += attack * (piano ? 0.22 : 0.11) * Math.exp(-t * 2.7) * Math.sin(p * 0.9992);
    }
    const index = (first + i) % length;
    left[index] += value * leftGain;
    right[index] += value * rightGain;
  }
}

for (const [i,[bass,chord,melody]] of score.entries()) {
  const start = i * bar;
  const lift = i >= 8 && i < 14 ? 1.13 : 1;
  note('cello',bass,start,4.08,0.17,-0.14);
  note('air',chord[0]+12,start+0.1,4.0,0.036*lift,0.41);
  note('air',chord[2],start+0.52,3.65,0.054*lift,-0.39);
  note('piano',bass+12,start+0.02,3.1,0.083,-0.23);
  for (const [j,midi] of chord.entries()) {
    note('harp',midi,start+0.48+j*0.60,2.45,(0.072-j*0.007)*lift,0.27+j*0.10);
  }
  for (const [j,[time,midi]] of melody.entries()) {
    note('piano',midi,start+time,3.2,(0.19-j*0.013)*lift,-0.07+j*0.05);
  }
}

// Circular reflections preserve the previous bar's decay across the loop seam.
const reflections = [[0.047,0.13],[0.083,0.10],[0.137,0.085],[0.191,0.07],
  [0.271,0.055],[0.367,0.043],[0.487,0.034],[0.649,0.024],[0.883,0.016],[1.079,0.011]];
const mix = Buffer.alloc(length * 8);
let peak = 0;
let square = 0;
for (let i = 0; i < length; i++) {
  let l = left[i];
  let r = right[i];
  for (const [delay,gain] of reflections) {
    const j = (i + length - Math.round(delay * rate)) % length;
    l += right[j] * gain;
    r += left[j] * gain;
  }
  l *= 1.30;
  r *= 1.30;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
  square += l*l + r*r;
  mix.writeFloatLE(l, i * 8);
  mix.writeFloatLE(r, i * 8 + 4);
}
if (peak >= 1) throw Error('PCM exceeds headroom');
fs.writeFileSync(output,mix);
console.log(JSON.stringify({duration: length/rate, peakDbfs:20*Math.log10(peak),
  rmsDbfs:10*Math.log10(square/(2*length)),
  seamStep:[0,4].map(offset=> Math.abs(mix.readFloatLE(offset)-mix.readFloatLE((length-1)*8+offset)))},null,2));
