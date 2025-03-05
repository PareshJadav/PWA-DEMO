import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-storage.component.html',
  styleUrl: './file-storage.component.css'
})
export class FileStorageComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  fileContent: string = '';
  errorMessage: string = '';
  currentFileName: string = '';
  selectedFiles: File[] = [];
  imagePreviewUrl: string | null = null;
  isStorageAccessible: boolean = false;

  constructor() {
    this.checkStorageAccess();
  }

  private async checkStorageAccess() {
    try {
      // Check if we can access storage
      await navigator.storage.estimate();
      this.isStorageAccessible = true;
    } catch (error) {
      this.isStorageAccessible = false;
      this.errorMessage = 'Storage access is not available in your browser';
    }
  }

  // Common file handling method for both new and existing files
  async handleFile(isNewFile: boolean = false) {
    if (!this.isStorageAccessible) {
      this.errorMessage = 'Storage access is not available';
      return;
    }

    try {
      if (isNewFile) {
        // Create new text file
        this.clearSelection();
        this.currentFileName = 'new-file.txt';
        this.fileContent = '';
        this.selectedFiles = [new File([''], this.currentFileName, { type: 'text/plain' })];
        
        // Focus the textarea
        setTimeout(() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            textarea.focus();
          }
        }, 0);
      } else {
        // Trigger file input for existing file
        this.fileInput.nativeElement.click();
      }
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error handling file operation';
      console.error('File operation error:', error);
    }
  }

  // Handle file selection from input
  async handleFileSelect(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      if (!input.files?.length) return;

      const file = input.files[0];
      this.currentFileName = file.name;
      this.selectedFiles = [file];

      if (file.type.startsWith('image/')) {
        // Handle image files
        this.imagePreviewUrl = URL.createObjectURL(file);
        this.fileContent = '';
      } else if (this.isTextFile(file)) {
        // Handle text files
        this.fileContent = await file.text();
        this.imagePreviewUrl = null;
      } else {
        throw new Error('Please select an image or text file (txt, json)');
      }
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Error reading file';
      console.error('File reading error:', error);
      this.clearSelection();
    }
  }

  private isTextFile(file: File): boolean {
    return file.type === 'text/plain' || 
           file.type === 'application/json' || 
           file.name.endsWith('.txt') || 
           file.name.endsWith('.json');
  }

  clearSelection() {
    if (this.imagePreviewUrl) {
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

  async saveFile() {
    if (!this.isStorageAccessible) {
      this.errorMessage = 'Storage access is not available';
      return;
    }

    try {
      if (!this.fileContent && !this.imagePreviewUrl) {
        throw new Error('No content to save');
      }

      let blob: Blob;
      if (this.imagePreviewUrl) {
        // For images, use the original file
        blob = this.selectedFiles[0];
      } else {
        // For text files, use the current content
        blob = new Blob([this.fileContent], { type: 'text/plain' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.currentFileName || 'download';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Error saving file';
      console.error('Save error:', error);
    }
  }

  getFileSize(): string {
    if (!this.selectedFiles.length) return '';
    
    try {
      const bytes = this.selectedFiles[0].size;
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (error) {
      console.error('Error calculating file size:', error);
      return 'Size unknown';
    }
  }

  shouldShowTextEditor(): boolean {
    return !!this.fileContent || !this.imagePreviewUrl;
  }
}
