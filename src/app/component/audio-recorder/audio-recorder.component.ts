import { Component } from '@angular/core';

@Component({
  selector: 'app-audio-recorder',
  standalone: true,
  imports: [],
  templateUrl: './audio-recorder.component.html',
  styleUrl: './audio-recorder.component.css'
})
export class AudioRecorderComponent {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  audioUrl: string | null = null;
  isRecording = false;
  isPlaying = false;

  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      this.audioUrl = URL.createObjectURL(audioBlob);
      this.audioChunks = [];
      this.isRecording = false; // Reset recording state when stopped
      // Enable play button after stopping recording
    };
    this.mediaRecorder.start();
    this.isRecording = true;
    this.isPlaying = false; // Disable playing while recording
  }

  stopRecording() {
    this.mediaRecorder?.stop();
    this.isRecording = false;
  }

  async playAudio() {
    if (this.audioUrl) {
      this.isPlaying = true;
      const audio = new Audio(this.audioUrl);
      audio.onended = () => {
        this.isPlaying = false; // Reset playing state when audio ends
      };
      await audio.play();
      this.isRecording = false; // Disable recording while playing
    }
  }
}
