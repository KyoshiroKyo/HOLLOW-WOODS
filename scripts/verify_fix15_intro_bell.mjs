import assert from 'node:assert/strict';
import { build } from 'esbuild';

const output = await build({
  entryPoints: ['src/audio/AudioManager.ts'], write: false, bundle: true, format: 'esm', platform: 'node'
});
const { AudioManager } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
const manager = Object.create(AudioManager.prototype);
const sources = [];
const curves = [];
const noop = () => {};
const param = () => ({
  value: 0, setValueAtTime: noop, setTargetAtTime: noop, cancelScheduledValues: noop,
  linearRampToValueAtTime: (value,time) => curves.push({value,time})
});
Object.assign(manager, {
  ctx: {
    currentTime: 1,
    createGain: () => ({ gain: param(), connect: noop, disconnect: noop }),
    createBufferSource: () => {
      const source = {
        playbackRate: param(), connect: noop, disconnect: noop, start: noop,
        stops: [], stop(time) { this.stops.push(time); }
      };
      sources.push(source);
      return source;
    }
  },
  resumeAudio: noop, masterGain: {}, isMuted: true, sfxVolume: 1,
  audioBuffers: new Map([['bronze_bell', {}]]), activeSFXChannels: new Map(),
  lastSfxTimes: new Map()
});
manager.playIntroBell();
assert.equal(sources.length, 0);
manager.isMuted = false;
manager.playIntroBell();
manager.playIntroBell();
assert.equal(sources.length, 1);
assert.equal(sources[0].stops[0], 3.6);
assert.ok(Math.abs(curves[0].value - 0.9 * 10 ** (-4 / 20)) < 1e-6);
assert.equal(curves.at(-1).value, 0);
manager.stopIntroBell();
assert.equal(manager.activeSFXChannels.get('intro_bell').length, 0);
await new Promise(resolve => setTimeout(resolve, 55));
assert.equal(sources[0].stops.length, 2);
console.log('AUDIO-01A-R1 playback envelope, mute, single channel, shutdown PASS');
