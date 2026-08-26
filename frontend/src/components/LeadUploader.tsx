import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Check, AlertCircle, X } from 'lucide-react';
import { extractEmailsFromFile } from '../utils/emailUtils';

interface LeadUploaderProps {
  onLeadsExtracted: (emails: string[], file?: File) => void;
  detectedCount: number;
}

export const LeadUploader: React.FC<LeadUploaderProps> = ({ onLeadsExtracted, detectedCount }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please upload a valid .csv or .txt file');
      return;
    }

    setError(null);
    setFileName(file.name);
    setParsing(true);

    try {
      const emails = await extractEmailsFromFile(file);
      onLeadsExtracted(emails, file);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    onLeadsExtracted([], undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-800">
          Upload Lead File (.csv or .txt)
        </label>
        {detectedCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 shadow-sm">
            <Check className="mr-1 h-3 w-3 text-amber-700" />
            {detectedCount} Unique Recipients Detected
          </span>
        )}
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition select-none ${
          dragActive
            ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
            : fileName
            ? 'border-stone-300 bg-stone-50/80'
            : 'border-stone-300/80 bg-stone-50/40 hover:bg-stone-50 hover:border-amber-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {parsing ? (
          <div className="flex flex-col items-center py-2 space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" />
            <p className="text-xs font-bold text-stone-700">Parsing lead file...</p>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3 text-left">
              <div className="clay-icon-pill h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 truncate max-w-[200px]">{fileName}</p>
                <p className="text-[10px] text-amber-800 font-bold">
                  {detectedCount} valid recipient emails parsed
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1 py-1">
            <div className="clay-icon-pill h-10 w-10 rounded-2xl flex items-center justify-center mb-1">
              <UploadCloud className="h-5 w-5 text-stone-700" />
            </div>
            <p className="text-xs font-bold text-stone-800">
              Drag & drop your lead list here, or <span className="text-amber-800 underline">browse</span>
            </p>
            <p className="text-[10px] text-stone-400">Supports standard CSV or raw TXT format</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
