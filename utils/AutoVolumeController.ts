// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_CMK_CODE_SIG

/**
 * Manages and dynamically adjusts audio volume based on ambient noise levels.
 * It creates its own audio graph (Gain -> Compressor -> Destination) and provides
 * a `gain` node to be used as the connection point for audio sources.
 */
export class AutoVolumeController {
  public gain: GainNode;
  private ctx: AudioContext;
  private comp: DynamicsCompressorNode;
  
  // Gain will be mapped between these values.
  private minGain = 0.28; // The quietest the AI will speak
  private maxGain = 0.9;  // The loudest the AI will speak

  // State for the Exponential Moving Average (EMA) of the ambient noise level.
  private ema = -60; // Start with a quiet assumption (-60 dBFS)
  private alpha = 0.12; // Smoothing factor for the EMA

  constructor(audioContext: AudioContext) {
    this.ctx = audioContext;
    this.gain = this.ctx.createGain();
    this.comp = this.ctx.createDynamicsCompressor();

    // Configure the compressor to prevent harsh audio peaks and normalize volume.
    // These are standard settings for voice processing.
    this.comp.threshold.value = -12;
    this.comp.knee.value = 30;
    this.comp.ratio.value = 12;
    this.comp.attack.value = 0.003;
    this.comp.release.value = 0.25;

    // Connect the internal audio graph: Our gain node -> compressor -> final output
    this.gain.connect(this.comp);
    this.comp.connect(this.ctx.destination);
    
    // Set a sensible initial gain.
    this.gain.gain.value = (this.minGain + this.maxGain) / 2;
  }

  /**
   * Updates the controller with a new ambient noise reading.
   * @param rms The Root Mean Square of the ambient audio signal (a value between 0 and 1).
   */
  update(rms: number) {
    // Convert RMS (a linear 0-1 value) to dBFS (a logarithmic scale).
    // Add a small floor value to avoid Math.log10(0) which is -Infinity.
    const db = 20 * Math.log10(rms || 0.00001);
    
    // Update the Exponential Moving Average of the dB level to smooth out fluctuations.
    this.ema = this.alpha * db + (1 - this.alpha) * this.ema;

    // We'll treat an ambient noise range of -60 dBFS (very quiet) to -20 dBFS (noisy cafe)
    // as the primary range to control volume over.
    const targetDbRange = 40; // i.e., -20 - (-60)
    
    // Normalize the current EMA value to a 0-1 scale within our target range.
    // We clamp the value between 0 and 1 to handle noise outside the expected range.
    const normalizedLevel = Math.min(Math.max((this.ema + 60) / targetDbRange, 0), 1);
    
    // Map the normalized level to our desired output gain range.
    const newGain = this.minGain + normalizedLevel * (this.maxGain - this.minGain);

    // To prevent audio "pops" or abrupt changes, we only apply the new gain if it's
    // a noticeable change, and we ramp to it smoothly over 0.3 seconds.
    if (Math.abs(newGain - this.gain.gain.value) > 0.02) {
      this.gain.gain.linearRampToValueAtTime(newGain, this.ctx.currentTime + 0.3);
    }
  }
}