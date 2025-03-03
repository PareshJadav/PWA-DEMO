import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {

  constructor(private swUpdate: SwUpdate) {
    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        if (confirm('New version available. Load New Version?')) {
          window.location.reload();
        }
      }
    });
  }
  checkForUpdates() {
    this.swUpdate.checkForUpdate();
  }
} 
