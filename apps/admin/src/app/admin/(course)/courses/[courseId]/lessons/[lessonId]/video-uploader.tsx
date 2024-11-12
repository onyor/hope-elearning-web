import { useEffect, useState } from "react";

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  initialUrl?: string; // Mevcut video URL'si
  onClear: () => void; // Videoyu kaldırma işlevi
}

const VideoUploader = ({
  onUpload,
  initialUrl,
  onClear,
}: VideoUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialUrl || null
  );

  useEffect(() => {
    // initialUrl değiştiğinde previewUrl'yi güncelle
    if (initialUrl) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onUpload(file); // Video dosyasını üst bileşene gönder
    }
  };

  const handleClear = () => {
    setPreviewUrl(null); // Önizlemeyi sıfırla
    onClear(); // Üst bileşendeki lexical ve html alanlarını temizle
  };

  return (
    <div>
      {!previewUrl ? (
        <input type="file" accept="video/*" onChange={handleFileChange} />
      ) : (
        <div className="relative">
          <video controls src={previewUrl} className="w-full h-auto mt-4" />
          <button
            onClick={handleClear}
            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
