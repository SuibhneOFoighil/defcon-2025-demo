import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';

export interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedFileTypes?: string; // e.g., "image/jpeg,image/png,.pdf"
  maxFileSize?: number; // in bytes
  multiple?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
  dropzoneClassName?: string;
  fileListClassName?: string;
  hideFileList?: boolean; // Hide the built-in file list display
}

// Helper function to format file size
const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  if (bytes === Infinity) return 'Unlimited'; // Handle Infinity case
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function FileUpload({
  onFilesChange,
  acceptedFileTypes = "*",
  maxFileSize = Infinity,
  multiple = false,
  label = "Drag 'n' drop files here, or click to select files",
  disabled = false,
  className,
  dropzoneClassName,
  fileListClassName,
  hideFileList = false,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File): boolean => {
    if (file.size > maxFileSize) {
     setError(`File "${file.name}" exceeds the maximum size of ${formatFileSize(maxFileSize)}.`);
      return false;
    }

    if (acceptedFileTypes !== "*") {
      const acceptedTypesArray = acceptedFileTypes.split(',').map(type => type.trim());
      const fileTypeMatches = acceptedTypesArray.some(type => {
        // Check for MIME type (e.g., image/jpeg, image/*)
        if (type.includes('/')) {
          const regex = new RegExp(`^${type.replace('*', '.*')}$`);
          return regex.test(file.type);
        }
        // Check for extension (e.g., .pdf, .png)
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      });

      if (!fileTypeMatches) {
        setError(`File "${file.name}" type is not accepted. Accepted types: ${acceptedFileTypes}`);
        return false;
      }
    }
    return true;
  };

  const addNewFiles = (newFiles: File[]) => {
    setError(null);
    const validFiles = newFiles.filter(handleFileValidation);
    if (newFiles.length !== validFiles.length && validFiles.length === 0) {
        // All files were invalid and no files were previously selected
        return;
    }

    let updatedFiles;
    if (multiple) {
      updatedFiles = [...selectedFiles, ...validFiles];
    } else {
      updatedFiles = validFiles.length > 0 ? [validFiles[0]] : [];
    }
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        e.dataTransfer.dropEffect = 'copy';
        setIsDraggingOver(true); // Ensure it stays true while dragging over
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      addNewFiles(files);
      e.dataTransfer.clearData();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addNewFiles(Array.from(e.target.files));
      // Reset input value to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    if(updatedFiles.length === 0) setError(null); // Clear error if no files left
  };

  const triggerInputClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div
        className={cn(
          "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer",
          "border-[hsl(var(--border))] bg-[hsl(var(--input-bg))] hover:border-[hsl(var(--primary))]",
          isDraggingOver && "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10",
          disabled && "cursor-not-allowed opacity-50 bg-[hsl(var(--muted))] hover:border-[hsl(var(--border))]",
          dropzoneClassName
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        aria-disabled={disabled}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerInputClick(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFileTypes}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <UploadCloud className={cn("w-10 h-10 mb-3", isDraggingOver ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]", disabled && "text-[hsl(var(--muted-foreground))]")} />
        <p className={cn("text-sm", isDraggingOver ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]", disabled && "text-[hsl(var(--muted-foreground))]")}>{label}</p>
        {acceptedFileTypes !== "*" && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Accepted types: {acceptedFileTypes}
            </p>
        )}
        {maxFileSize !== Infinity && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Max file size: {formatFileSize(maxFileSize)}
            </p>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-[hsl(var(--destructive))]" role="alert">
          {error}
        </p>
      )}

      {selectedFiles.length > 0 && !hideFileList && (
        <div className={cn("mt-4 space-y-2", fileListClassName)}>
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">Selected File{selectedFiles.length > 1 ? 's' : ''}:</h3>
          <ul className="space-y-1">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                    <FileIcon className="w-4 h-4 flex-shrink-0 text-[hsl(var(--muted-foreground))]" />
                    <span className="truncate text-[hsl(var(--foreground))]" title={file.name}>{file.name}</span>
                    <span className="flex-shrink-0 text-[hsl(var(--muted-foreground))] text-xs">
                        ({formatFileSize(file.size)})
                    </span>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 rounded-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 