import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="camera-container" [class.full-width]="isFullWidth">
      <video
        #videoElement
        id="videoElement"
        autoplay
        muted
        playsinline
        [style.display]="isStreaming ? 'block' : 'none'"
        [class.mirrored]="isMirrored"
        [style.transform]="getVideoTransform()">
      </video>
      <div
        *ngIf="!isStreaming"
        class="placeholder"
        [style.height.px]="videoHeight">
        <div class="placeholder-content">
          <div class="camera-icon">📹</div>
          <p>Click "Start Camera" to begin</p>
        </div>
      </div>
    </div>

    <div class="controls">
      <button
        class="btn"
        [disabled]="isStreaming"
        (click)="startCamera()"
        [class]="isStreaming ? 'disabled' : ''">
        {{ isStreaming ? 'Camera Active' : 'Start Camera' }}
      </button>

      <button
        class="btn danger"
        [disabled]="!isStreaming"
        (click)="stopCamera()"
        [class]="!isStreaming ? 'disabled' : ''">
        Stop Camera
      </button>
    </div>

    <div class="controls secondary" *ngIf="isStreaming">
      <button
        class="btn secondary"
        (click)="toggleFullWidth()">
        {{ isFullWidth ? 'Compact View' : 'Full Width' }}
      </button>

      <button
        class="btn secondary"
        (click)="toggleMirror()">
        {{ isMirrored ? 'Normal View' : 'Mirror Mode' }}
      </button>

      <button
        class="btn secondary"
        (click)="toggleFullscreen()">
        {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
      </button>
    </div>

    <div class="controls zoom-controls" *ngIf="isStreaming">
      <div class="zoom-buttons">
        <button
          class="btn zoom-btn"
          (click)="zoomOut()"
          [disabled]="zoomLevel <= minZoom">
          🔍−
        </button>

        <span class="zoom-level">{{ (zoomLevel * 100).toFixed(0) }}%</span>

        <button
          class="btn zoom-btn"
          (click)="zoomIn()"
          [disabled]="zoomLevel >= maxZoom">
          🔍+
        </button>
      </div>

      <div class="zoom-slider-container">
        <input
          type="range"
          class="zoom-slider"
          [min]="minZoom"
          [max]="maxZoom"
          [step]="0.1"
          [value]="zoomLevel"
          (input)="onZoomSliderChange($event)">
      </div>

      <button
        class="btn reset-zoom"
        (click)="resetZoom()">
        Reset Zoom
      </button>
    </div>

    <div *ngIf="statusMessage" class="status" [ngClass]="statusType">
      {{ statusMessage }}
    </div>

    <div *ngIf="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  `,
  styles: [`
    .placeholder {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }

    .placeholder-content {
      text-align: center;
      color: #666;
    }

    .camera-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .placeholder-content p {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .disabled {
      opacity: 0.6;
      cursor: not-allowed !important;
    }

    .controls.secondary {
      margin-top: 1rem;
    }

    .btn.secondary {
      background: linear-gradient(45deg, #4ecdc4, #44a08d);
      box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
    }

    .btn.secondary:hover {
      box-shadow: 0 6px 20px rgba(78, 205, 196, 0.6);
    }

    .camera-container.full-width {
      width: 100%;
      max-width: none;
      border-radius: 15px;
    }

    .camera-container.full-width #videoElement {
      width: 100%;
      height: auto;
      max-height: 70vh;
      object-fit: contain;
    }

    .camera-container:not(.full-width) {
      max-width: 600px;
      margin: 0 auto;
    }

    .camera-container:not(.full-width) #videoElement {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: contain;
    }

    .zoom-controls {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .zoom-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .zoom-btn {
      background: linear-gradient(45deg, #667eea, #764ba2);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      padding: 0;
    }

    .zoom-btn:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      transform: translateY(-2px);
    }

    .zoom-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .zoom-level {
      font-weight: bold;
      font-size: 1.1rem;
      color: #333;
      min-width: 60px;
      text-align: center;
    }

    .zoom-slider-container {
      margin-bottom: 1rem;
    }

    .zoom-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(to right, #667eea, #764ba2);
      outline: none;
      -webkit-appearance: none;
    }

    .zoom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .zoom-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .reset-zoom {
      background: linear-gradient(45deg, #ff6b6b, #ee5a24);
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
      width: 100%;
    }

    .reset-zoom:hover {
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
    }
  `]
})
export class CameraComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  isStreaming = false;
  statusMessage = '';
  statusType = '';
  errorMessage = '';
  videoHeight = 300;
  isFullWidth = true;
  isFullscreen = false;
  isMirrored = false;
  zoomLevel = 1;
  minZoom = 0.5;
  maxZoom = 3;

  private stream: MediaStream | null = null;

  ngOnInit() {
    this.updateVideoHeight();
    window.addEventListener('resize', () => this.updateVideoHeight());
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
  }

  ngOnDestroy() {
    this.stopCamera();
    window.removeEventListener('resize', () => this.updateVideoHeight());
    document.removeEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.removeEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.removeEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
    document.removeEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
  }

  async startCamera() {
    try {
      this.clearMessages();
      this.showStatus('Requesting camera access...', 'info');

      // Request camera access with constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Set the video source
      this.videoElement.nativeElement.srcObject = this.stream;

      // Wait for video to load
      await new Promise((resolve) => {
        this.videoElement.nativeElement.onloadedmetadata = () => {
          this.videoElement.nativeElement.play();
          resolve(void 0);
        };
      });

      this.isStreaming = true;
      this.showStatus('Camera is now active! 🎥', 'success');

    } catch (error: any) {
      console.error('Error accessing camera:', error);
      this.handleCameraError(error);
    }
  }

  stopCamera() {
    if (this.stream) {
      // Stop all tracks
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    // Clear video source
    if (this.videoElement) {
      this.videoElement.nativeElement.srcObject = null;
    }

    this.isStreaming = false;
    this.clearMessages();
    this.showStatus('Camera stopped', 'info');
  }

  private handleCameraError(error: any) {
    let errorMsg = 'An error occurred while accessing the camera.';

    if (error.name === 'NotAllowedError') {
      errorMsg = 'Camera access was denied. Please allow camera permissions and try again.';
    } else if (error.name === 'NotFoundError') {
      errorMsg = 'No camera found. Please connect a camera and try again.';
    } else if (error.name === 'NotReadableError') {
      errorMsg = 'Camera is being used by another application. Please close other camera apps and try again.';
    } else if (error.name === 'OverconstrainedError') {
      errorMsg = 'Camera constraints could not be satisfied. Trying with default settings...';
      // Try again with basic constraints
      this.tryBasicConstraints();
      return;
    } else if (error.name === 'SecurityError') {
      errorMsg = 'Camera access blocked due to security restrictions. Please use HTTPS.';
    }

    this.errorMessage = errorMsg;
    this.statusMessage = '';
  }

  private async tryBasicConstraints() {
    try {
      this.showStatus('Trying with basic camera settings...', 'info');
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
      await new Promise((resolve) => {
        this.videoElement.nativeElement.onloadedmetadata = () => {
          this.videoElement.nativeElement.play();
          resolve(void 0);
        };
      });
      this.isStreaming = true;
      this.showStatus('Camera is now active! 🎥', 'success');
    } catch (basicError) {
      this.handleCameraError(basicError);
    }
  }

  private showStatus(message: string, type: string) {
    this.statusMessage = message;
    this.statusType = type;
    this.errorMessage = '';
  }

  private clearMessages() {
    this.statusMessage = '';
    this.statusType = '';
    this.errorMessage = '';
  }

  private updateVideoHeight() {
    // Set a reasonable default height for the placeholder
    this.videoHeight = Math.min(window.innerHeight * 0.4, 400);
  }

  toggleFullWidth() {
    this.isFullWidth = !this.isFullWidth;

    if (this.isFullWidth) {
      this.showStatus('Full width mode activated', 'info');
    } else {
      this.showStatus('Compact view mode activated', 'info');
    }
  }

  toggleMirror() {
    this.isMirrored = !this.isMirrored;

    if (this.isMirrored) {
      this.showStatus('Mirror mode activated', 'info');
    } else {
      this.showStatus('Normal view mode activated', 'info');
    }
  }

  getVideoTransform(): string {
    let transform = `scale(${this.zoomLevel})`;
    if (this.isMirrored) {
      transform += ' scaleX(-1)';
    }
    return transform;
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel = Math.min(this.zoomLevel + 0.2, this.maxZoom);
      this.showStatus(`Zoom: ${(this.zoomLevel * 100).toFixed(0)}%`, 'info');
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel = Math.max(this.zoomLevel - 0.2, this.minZoom);
      this.showStatus(`Zoom: ${(this.zoomLevel * 100).toFixed(0)}%`, 'info');
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.showStatus('Zoom reset to 100%', 'info');
  }

  onZoomSliderChange(event: any) {
    this.zoomLevel = parseFloat(event.target.value);
    this.showStatus(`Zoom: ${(this.zoomLevel * 100).toFixed(0)}%`, 'info');
  }

  async toggleFullscreen() {
    try {
      if (!this.isFullscreen) {
        // Enter fullscreen
        if (this.videoElement.nativeElement.requestFullscreen) {
          await this.videoElement.nativeElement.requestFullscreen();
        } else if ((this.videoElement.nativeElement as any).webkitRequestFullscreen) {
          await (this.videoElement.nativeElement as any).webkitRequestFullscreen();
        } else if ((this.videoElement.nativeElement as any).msRequestFullscreen) {
          await (this.videoElement.nativeElement as any).msRequestFullscreen();
        }
        this.showStatus('Fullscreen mode activated', 'info');
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        this.showStatus('Exited fullscreen mode', 'info');
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      this.showStatus('Fullscreen not supported or blocked', 'error');
    }
  }

  private handleFullscreenChange() {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    this.isFullscreen = isCurrentlyFullscreen;
  }
}
