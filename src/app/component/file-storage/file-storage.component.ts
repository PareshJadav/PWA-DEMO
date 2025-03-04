import { Component, PLATFORM_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

// Add type definitions for the File System Access API
interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

// Extend Window interface to include File System Access API methods
declare global {
  interface Window {
    showSaveFilePicker(options?: {
      types?: { description: string; accept: Record<string, string[]> }[];
    }): Promise<FileSystemFileHandle>;
    showOpenFilePicker(options?: {
      multiple?: boolean;
      types?: { description: string; accept: Record<string, string[]> }[];
    }): Promise<FileSystemFileHandle[]>;
  }
}

@Component({
  selector: 'app-file-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-storage.component.html',
  styleUrl: './file-storage.component.css'
})
export class FileStorageComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  currentFileHandle: any = null;
  fileContent: string = '';
  errorMessage: string = '';
  currentFileName: string = '';
  selectedFiles: File[] = [];
  isIOS: boolean = false;
  imagePreviewUrl: string | null = null;
  isBrowser: boolean = false;
  canCreateNewFile: boolean = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      this.canCreateNewFile = !this.isIOS;
    }
  }

  // Universal file input handler for all devices
  async handleTraditionalFileSelect(event: Event) {
    if (!this.isBrowser) return;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    try {
      const file = input.files[0];
      this.currentFileName = file.name;
      this.selectedFiles = [file];

      // Handle different file types
      if (file.type.startsWith('image/')) {
        // Handle image files
        this.imagePreviewUrl = URL.createObjectURL(file);
        this.fileContent = ''; // Clear text content when showing image
        this.errorMessage = '';
      } else if (file.type === 'text/plain' || file.type === 'application/json' || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
        // Handle text files
        const text = await file.text();
        this.fileContent = text;
        this.imagePreviewUrl = null;
        this.errorMessage = '';
      } else {
        throw new Error('Unsupported file type. Please select an image or text file.');
      }
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Error reading file';
      console.error('File reading error:', err);
      this.clearSelection();
    }
  }

  clearSelection() {
    if (this.isBrowser && this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
    this.selectedFiles = [];
    this.currentFileName = '';
    this.fileContent = '';
    this.imagePreviewUrl = null;
    this.errorMessage = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Download file for all devices
  downloadFile() {
    if (!this.isBrowser) return;
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'No file selected';
      return;
    }

    try {
      let file: File | Blob;
      if (this.fileContent && !this.imagePreviewUrl) {
        // For text files, use the potentially edited content
        file = new Blob([this.fileContent], { type: 'text/plain' });
      } else {
        // For images and other files, use the original file
        file = this.selectedFiles[0];
      }

      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.currentFileName || 'download';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error downloading file';
      console.error('Download error:', error);
    }
  }

  // Method to trigger file input click
  triggerFileInput() {
    if (this.isBrowser && this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  // Check if the selected file is an image
  isImageFile(): boolean {
    return this.selectedFiles.length > 0 && this.selectedFiles[0].type.startsWith('image/');
  }

  // Method to get file size in readable format
  getFileSize(): string {
    if (this.selectedFiles.length === 0) return '';
    const bytes = this.selectedFiles[0].size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Save changes to text file
  async saveFile() {
    if (!this.isBrowser) return;
    if (!this.fileContent) {
      this.errorMessage = 'No content to save';
      return;
    }

    try {
      const blob = new Blob([this.fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.currentFileName || 'new-file.txt';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error saving file';
      console.error('Save error:', error);
    }
  }

  // Create new text file
  createFile() {
    if (!this.canCreateNewFile) {
      this.errorMessage = 'Creating new files is not supported on this device';
      return;
    }
    
    this.clearSelection();
    this.currentFileName = 'new-file.txt';
    this.fileContent = '';
    this.errorMessage = '';
    
    // Ensure the text area is editable
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  }

  isFileSystemAccessSupported(): boolean {
    return this.isBrowser && !this.isIOS && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
  }
}
