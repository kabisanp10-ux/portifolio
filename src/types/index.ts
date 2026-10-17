/**
 * Type definitions for Kabisan P's 3D WebGL Portfolio
 */

export interface ThreeEngineConfig {
  canvasId: string;
  particleCount?: number;
  outerRadius?: number;
  innerRadius?: number;
}

export interface MousePhysicsState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionRecord extends ContactFormData {
  id: string;
  timestamp: string;
}

export interface TiltCardOptions {
  maxTiltDegrees?: number;
  perspective?: number;
  scale?: number;
}
