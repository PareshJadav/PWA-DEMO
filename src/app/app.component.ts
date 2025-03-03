import { Component, OnInit, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { CameraAccessComponent } from './component/camera-access/camera-access.component';
import { LocationComponent } from './component/location/location.component';
import { AudioRecorderComponent } from './component/audio-recorder/audio-recorder.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CameraAccessComponent, LocationComponent, AudioRecorderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private deferredPrompt: any;
  showInstallButton = false;

  constructor(
    private swUpdate: SwUpdate,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePwa();
      this.requestNotificationPermission();
      this.sendPushNotification();
    }
  }

  private initializePwa() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
    // Other initialization code...
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: any) {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    // Stash the event so it can be triggered later
    this.deferredPrompt = event;
    // Show the install button
    this.showInstallButton = true;
  }
  @HostListener('window:appinstalled', ['$event'])
  onAppInstalled(event: any) {
    this.showInstallButton = false;
  }

  requestNotificationPermission() {
      Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
              console.log('Notification permission granted.');
          } else {
              console.error('Notification permission denied.');
          }
      });
  }
  sendPushNotification() {
      const payload = {
          title: 'Hello!',
          body: 'This is a push notification.',
          icon: 'path/to/icon.png', // Optional icon
      };
  
      // Check if the service worker is registered
      if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification(payload.title, {
                  body: payload.body,
                  icon: payload.icon,
              });
          }).catch((error) => {
              console.error('Error showing notification:', error);
          });
      } else {
          console.error('Service Worker not registered.');
      }
  }
}