import type { ArtifactId } from "@/artifacts/inspection";
import { artifactVoices } from "./artifactAudio";
import type { ArchiveAudioScene, AudioDiagnostics, ObserverAudioProfile } from "./audioTypes";

const silent = .0001;

export class ArchiveAudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambienceBus: GainNode | null = null;
  private artifactBus: GainNode | null = null;
  private interactionBus: GainNode | null = null;
  private transitionBus: GainNode | null = null;
  private ambienceFilter: BiquadFilterNode | null = null;
  private artifactFilter: BiquadFilterNode | null = null;
  private artifactPan: StereoPannerNode | null = null;
  private artifactOscillator: OscillatorNode | null = null;
  private ambienceSources: AudioScheduledSourceNode[] = [];
  private sparseTimer: number | null = null;
  private transientSources = 0;
  private active = false;
  private profile: ObserverAudioProfile | null = null;
  private scene: ArchiveAudioScene | null = null;
  private lastStage = "";
  private lastRoute: ObserverAudioProfile["n07Route"] = null;
  private freezeLatched = false;

  async activate(profile: ObserverAudioProfile) {
    this.profile = profile;
    if (!this.context) this.createGraph();
    if (!this.context || !this.master) return;
    this.active = true;
    await this.context.resume();
    this.ramp(this.master.gain, .68, .7);
    if (this.scene) this.applyScene(this.scene, profile, true);
    if (profile.returningVisitor) this.tone(this.profileFrequency(profile), 1.35, .016, -.12, .12, "transition");
    this.scheduleSparseResonance();
  }

  mute() {
    this.active = false;
    this.clearSparseTimer();
    if (!this.context || !this.master) return;
    this.ramp(this.master.gain, silent, .06);
    const context = this.context;
    window.setTimeout(() => { if (!this.active && context.state === "running") void context.suspend(); }, 90);
  }

  updateScene(scene: ArchiveAudioScene, profile: ObserverAudioProfile) {
    this.scene = scene;
    this.profile = profile;
    if (!this.active || !this.context) return;
    this.applyScene(scene, profile, false);
  }

  cueInteraction(kind: "archive" | "inspect" | "record" | "scanner" | "subject" | "reset") {
    if (!this.active || !this.context) return;
    const cues = {
      archive: [178, .34, .018, -.2], inspect: [242, .42, .018, .18], record: [410, .18, .012, -.08],
      scanner: [126, .3, .014, 0], subject: [224, .8, .016, .1], reset: [92, .28, .012, 0],
    } as const;
    const [frequency, duration, gain, pan] = cues[kind];
    if (kind === "scanner" && this.scene?.artifact === "005") return;
    this.tone(frequency, duration, gain, pan, 0, "interaction");
  }

  cueControl(artifact: ArtifactId, value: number) {
    if (!this.active || !this.context) return;
    const confidence = this.profile?.observerConfidence ?? 0;
    const intervention = this.profile?.archetype === "interventionist" ? 1.18 : 1;
    if (artifact === "001") {
      this.setArtifactVoice(artifact, value);
      this.tone(112 + value * 46, .22, (.008 + value * .009) * intervention, -.24 + value * .18, 0, "interaction");
    } else if (artifact === "002") {
      this.tone(360 + value * 120, .34, .01, -.22, .16, "interaction", true);
    } else if (artifact === "003") {
      const future = value > .66;
      this.tone(future ? 622 : value < .34 ? 438 : 516, .11, .01, future ? .18 : -.12, future ? .004 : .07, "interaction");
      if (!future) this.tone(516, .1, .006, .12, .17, "interaction");
    } else if (artifact === "004") {
      const coherence = Math.min(1, value * .65 + confidence * .35);
      this.tone(188 + coherence * 92, .14, .009 + coherence * .005, -.25 + coherence * .5, 0, "interaction");
    } else if (artifact === "006") {
      this.tone(292 + value * 168, .72, .011, -.12 + value * .24, 0, "artifact");
    }
  }

  diagnostics(): AudioDiagnostics {
    return { contextState: this.context?.state ?? "uninitialized", persistentSources: this.ambienceSources.length + (this.artifactOscillator ? 1 : 0), transientSources: this.transientSources };
  }

  private createGraph() {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass({ latencyHint: "interactive" });
    const master = context.createGain();
    master.gain.value = silent;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -18; limiter.knee.value = 12; limiter.ratio.value = 4; limiter.attack.value = .012; limiter.release.value = .32;
    master.connect(limiter).connect(context.destination);
    this.context = context; this.master = master;
    this.ambienceBus = this.bus(.09); this.artifactBus = this.bus(.1); this.interactionBus = this.bus(.72); this.transitionBus = this.bus(.58);

    const ambienceFilter = context.createBiquadFilter();
    ambienceFilter.type = "lowpass"; ambienceFilter.frequency.value = 720; ambienceFilter.Q.value = .32;
    ambienceFilter.connect(this.ambienceBus);
    this.ambienceFilter = ambienceFilter;
    const low = context.createOscillator(); const lowGain = context.createGain();
    low.type = "sine"; low.frequency.value = 46; lowGain.gain.value = .055; low.connect(lowGain).connect(ambienceFilter); low.start();
    const body = context.createOscillator(); const bodyGain = context.createGain();
    body.type = "sine"; body.frequency.value = 118; bodyGain.gain.value = .018; body.connect(bodyGain).connect(ambienceFilter); body.start();
    const noise = context.createBufferSource(); const noiseGain = context.createGain();
    noise.buffer = this.noiseBuffer(context, 9); noise.loop = true; noiseGain.gain.value = .022; noise.connect(noiseGain).connect(ambienceFilter); noise.start();
    this.ambienceSources = [low, body, noise];

    const artifactFilter = context.createBiquadFilter(); artifactFilter.type = "lowpass"; artifactFilter.frequency.value = 900;
    const panner = context.createStereoPanner(); const oscillator = context.createOscillator(); const voiceGain = context.createGain();
    oscillator.type = "sine"; oscillator.frequency.value = 74; voiceGain.gain.value = silent;
    oscillator.connect(voiceGain).connect(artifactFilter).connect(panner).connect(this.artifactBus); oscillator.start();
    this.artifactFilter = artifactFilter; this.artifactPan = panner; this.artifactOscillator = oscillator;
    (oscillator as OscillatorNode & { voiceGain?: GainNode }).voiceGain = voiceGain;
  }

  private bus(value: number) {
    const bus = this.context!.createGain(); bus.gain.value = value; bus.connect(this.master!); return bus;
  }

  private applyScene(scene: ArchiveAudioScene, profile: ObserverAudioProfile, immediate: boolean) {
    if (!this.context || !this.ambienceBus || !this.artifactBus || !this.ambienceFilter) return;
    const duration = immediate ? .08 : .85;
    const isVoid = scene.artifact === "005" || scene.stage.includes("geometric-isolation");
    const memoryArrival = scene.stage.includes("memory-recovery") || scene.artifact === "006";
    const witness = profile.archetype === "witness";
    const ambience = scene.archiveOpen ? .045 : isVoid ? .003 : memoryArrival ? .052 : witness ? .072 : .09;
    this.ramp(this.ambienceBus.gain, ambience, duration);
    this.ramp(this.artifactBus.gain, isVoid ? .008 : scene.artifact ? (scene.inspecting ? .14 : .095) : .025, duration);
    this.ramp(this.ambienceFilter.frequency, isVoid ? 115 : scene.artifact === "004" ? 1150 : memoryArrival ? 1560 : 720, duration);
    if (scene.artifact) this.setArtifactVoice(scene.artifact, scene.control);

    if (this.lastStage && this.lastStage !== scene.stage) {
      if (scene.stage.includes("geometric-isolation")) this.tone(186, .34, .007, .1, .02, "transition");
      if (scene.stage.includes("memory-recovery")) { this.tone(392, 1.15, .018, .05, .08, "transition"); this.tone(this.affinityFrequency(profile), .7, .006, -.18, .22, "artifact"); }
      if (scene.stage.includes("bio-isolation")) { this.tone(248, .28, .008, -.2, .04, "transition"); if (profile.archetype === "chronologist") this.tone(516, .12, .006, .16, 0, "transition"); }
      if (scene.stage.includes("object-four-arrival") && profile.archetype === "synaptic") { this.tone(211, .13, .006, -.24, 0, "artifact"); this.tone(278, .13, .006, .24, .11, "artifact"); }
    }
    if (profile.n07Route && profile.n07Route !== this.lastRoute) {
      this.tone(267, .46, .006, -.35, .09, "transition");
      this.tone(401, .3, .004, .35, .22, "transition");
    }
    if (scene.freeze && !this.freezeLatched) {
      this.ramp(this.ambienceBus.gain, silent, .035); this.ramp(this.artifactBus.gain, silent, .035);
      this.tone(profile.archetype === "mnemonist" ? 344 : 231, .55, .006, 0, 0, "transition");
    }
    if (!scene.freeze && this.freezeLatched) this.ramp(this.ambienceBus.gain, ambience, .7);
    this.freezeLatched = scene.freeze; this.lastStage = scene.stage; this.lastRoute = profile.n07Route;
  }

  private setArtifactVoice(id: ArtifactId, control: number) {
    if (!this.context || !this.artifactOscillator || !this.artifactFilter || !this.artifactPan) return;
    const voice = artifactVoices[id]; const now = this.context.currentTime;
    const adaptive = this.profile?.archetype === "synaptic" && id === "004" ? 1.12 : this.profile?.archetype === "mnemonist" && id === "006" ? 1.08 : 1;
    this.artifactOscillator.frequency.setTargetAtTime(voice.frequency * (id === "001" ? .92 + control * .14 : adaptive), now, .16);
    this.artifactFilter.frequency.setTargetAtTime(id === "005" ? 125 : voice.filter + control * 220, now, .22);
    this.artifactPan.pan.setTargetAtTime(this.scene?.mobile ? 0 : voice.pan, now, .25);
    const voiceGain = (this.artifactOscillator as OscillatorNode & { voiceGain?: GainNode }).voiceGain;
    voiceGain?.gain.setTargetAtTime(voice.gain * (this.scene?.inspecting ? 1.18 : 1), now, .22);
  }

  private tone(frequency: number, duration: number, gain: number, pan: number, delay: number, bus: "artifact" | "interaction" | "transition", reverse = false) {
    if (!this.active || !this.context) return;
    const context = this.context; const target = bus === "artifact" ? this.artifactBus : bus === "transition" ? this.transitionBus : this.interactionBus;
    if (!target || this.transientSources >= (this.scene?.mobile ? 3 : 6)) return;
    const oscillator = context.createOscillator(); const envelope = context.createGain(); const panner = context.createStereoPanner();
    const start = context.currentTime + delay; const end = start + duration;
    oscillator.type = "sine"; oscillator.frequency.value = frequency; panner.pan.value = this.scene?.mobile ? 0 : pan;
    envelope.gain.setValueAtTime(silent, start);
    if (reverse) { envelope.gain.exponentialRampToValueAtTime(gain, end - .025); envelope.gain.exponentialRampToValueAtTime(silent, end); }
    else { envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(.035, duration * .25)); envelope.gain.exponentialRampToValueAtTime(silent, end); }
    oscillator.connect(envelope).connect(panner).connect(target); this.transientSources += 1; oscillator.start(start); oscillator.stop(end + .02);
    oscillator.addEventListener("ended", () => { oscillator.disconnect(); envelope.disconnect(); panner.disconnect(); this.transientSources = Math.max(0, this.transientSources - 1); }, { once: true });
  }

  private scheduleSparseResonance() {
    this.clearSparseTimer();
    const schedule = () => {
      if (!this.active) return;
      const delay = 9000 + Math.random() * 8000;
      this.sparseTimer = window.setTimeout(() => {
        if (this.active && this.scene?.artifact !== "005" && !this.scene?.freeze) this.tone(151 + Math.random() * 54, 1.6, .004, Math.random() * .8 - .4, 0, "transition");
        schedule();
      }, delay);
    };
    schedule();
  }

  private clearSparseTimer() { if (this.sparseTimer !== null) window.clearTimeout(this.sparseTimer); this.sparseTimer = null; }
  private ramp(parameter: AudioParam, value: number, duration: number) { if (!this.context) return; parameter.cancelScheduledValues(this.context.currentTime); parameter.setTargetAtTime(value, this.context.currentTime, Math.max(.01, duration / 4)); }
  private profileFrequency(profile: ObserverAudioProfile) { return profile.archetype === "chronologist" ? 267 : profile.archetype === "cartographer" ? 183 : profile.archetype === "synaptic" ? 229 : profile.archetype === "mnemonist" ? 344 : 206; }
  private affinityFrequency(profile: ObserverAudioProfile) { return profile.affinity === "gravity" ? 112 : profile.affinity === "temporal" ? 516 : profile.affinity === "adaptive" ? 229 : profile.affinity === "spatial" ? 151 : profile.affinity === "mnemonic" ? 344 : 286; }
  private noiseBuffer(context: AudioContext, seconds: number) { const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate); const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1; const blend = Math.min(2048, Math.floor(data.length / 8)); for (let i = 0; i < blend; i += 1) { const mix = i / blend; const value = data[i] * mix + data[data.length - blend + i] * (1 - mix); data[i] = value; data[data.length - blend + i] = value; } return buffer; }
}

declare global { interface Window { webkitAudioContext?: typeof AudioContext } }
