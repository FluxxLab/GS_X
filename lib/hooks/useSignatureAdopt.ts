"use client";

import { useCallback, useRef, useState } from 'react';

/**
 * DocuSign-style signature adoption: the signer either TYPES their full name
 * (rendered in a script face) or UPLOADS an image of their signature. Both
 * paths produce a PNG data-URL, the same payload the old draw-pad sent, so
 * the accept endpoint and the letter generator are untouched.
 */
export function useSignatureAdopt() {
  const [mode, setMode] = useState<'type' | 'upload'>('type');
  const [typedName, setTypedName] = useState('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  /** The on-screen preview span; the canvas copies its computed font so the
   *  stored image matches what the signer saw (next/font renames families). */
  const previewRef = useRef<HTMLSpanElement>(null);

  const hasSigned = mode === 'type' ? typedName.trim().length >= 2 : !!uploadedDataUrl;

  const onUploadFile = useCallback((file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Please upload a PNG or JPEG image of your signature.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('The image must be 2MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Normalise to a bounded PNG so the stored record stays small and
        // renders predictably in the letter's acceptance block.
        const scale = Math.min(1, 600 / img.width, 200 / img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUploadedDataUrl(canvas.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const clearUpload = useCallback(() => setUploadedDataUrl(null), []);

  /** PNG data-URL of the adopted signature (typed name rendered to canvas,
   *  or the normalised upload). */
  const getSignatureDataUrl = useCallback((): string | null => {
    if (mode === 'upload') return uploadedDataUrl;
    const name = typedName.trim();
    if (name.length < 2) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const family = previewRef.current
      ? getComputedStyle(previewRef.current).fontFamily
      : 'cursive';
    ctx.fillStyle = '#081340';
    // Shrink until the name fits the canvas width.
    let size = 64;
    do {
      ctx.font = `${size}px ${family}`;
      size -= 4;
    } while (ctx.measureText(name).width > 560 && size > 20);
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 20, 80);
    return canvas.toDataURL('image/png');
  }, [mode, typedName, uploadedDataUrl]);

  return {
    mode,
    setMode,
    typedName,
    setTypedName,
    uploadedDataUrl,
    uploadError,
    onUploadFile,
    clearUpload,
    hasSigned,
    previewRef,
    getSignatureDataUrl,
  };
}

export type SignatureAdopt = ReturnType<typeof useSignatureAdopt>;
