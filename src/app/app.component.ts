import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraComponent } from './camera/camera.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CameraComponent],
  template: `
    <div class="container">
      <h1>📹 Camera Preview</h1>
      <app-camera></app-camera>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'camera-preview';
}
