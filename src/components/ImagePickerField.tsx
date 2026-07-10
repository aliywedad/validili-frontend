import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faImages, faXmark } from '@fortawesome/free-solid-svg-icons';

interface ImagePickerFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

export default function ImagePickerField({ label, file, onChange }: ImagePickerFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null);
    e.target.value = '';
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {label}
        {file && <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5 text-emerald-600" />}
      </p>

      {previewUrl ? (
        <div className="relative mb-3 inline-block">
          <img src={previewUrl} alt={label} className="h-24 w-36 rounded-md border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Retirer la photo"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="mb-3 flex h-24 w-36 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-300">
          <FontAwesomeIcon icon={faImages} className="h-8 w-8" />
        </div>
      )}

      <div className="flex gap-2">
        {/*
          Camera capture (capture="environment") temporarily disabled: on some phones,
          backgrounding the tab to open the native camera app causes the browser to
          reload the page and lose all in-progress form data. Re-enable once this is
          fixed properly (e.g. by switching to an in-page getUserMedia capture flow).

          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleFile}
            />
          </label>
        */}
        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <FontAwesomeIcon icon={faImages} className="h-4 w-4" />
          <span>Galerie</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}
