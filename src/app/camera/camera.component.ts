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
        [class.mirrored]="isMirrored">
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

    #videoElement.mirrored {
      transform: scaleX(-1);
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
