import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Camera, X, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  className?: string;
}

export function CameraModal({ isOpen, onClose, onCapture, className }: CameraModalProps) {
  const { t } = useTranslation();
  const {
    videoRef,
    canvasRef,
    isCapturing,
    error,
    openCamera,
    closeCamera,
    capturePhoto,
    switchCamera
  } = useCamera();

  const handleOpen = async () => {
    await openCamera();
  };

  const handleClose = () => {
    closeCamera();
    onClose();
  };

  const handleCapture = async () => {
    const imageData = await capturePhoto();
    if (imageData) {
      onCapture(imageData);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <div className={cn("max-w-md mx-auto h-full bg-black flex flex-col", className)}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between text-white">
          <h3 className="text-lg font-semibold">{t('analysis.skinAnalysis')}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera Preview */}
        <div className="flex-1 relative">
          {!videoRef.current?.srcObject && !isCapturing && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="h-16 w-16 mb-4 opacity-50 mx-auto" />
                <p className="mb-4">{t('analysis.takePhoto')}</p>
                <Button onClick={handleOpen} className="bg-egyptian-gold hover:bg-egyptian-gold/90">
                  {t('analysis.takePhoto')}
                </Button>
              </div>
            </div>
          )}

          {isCapturing && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-16 w-16 mb-4 animate-spin mx-auto" />
                <p>{t('common.loading')}</p>
              </div>
            </div>
          )}

          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Canvas for photo capture (hidden) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Frame Overlay */}
          {videoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="camera-frame border-egyptian-gold" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  onClick={handleOpen}
                  className="bg-egyptian-gold hover:bg-egyptian-gold/90"
                >
                  {t('common.retry')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        {videoRef.current?.srcObject && !isCapturing && (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-6">
              {/* Switch Camera Button */}
              <Button
                variant="ghost"
                size="lg"
                onClick={switchCamera}
                className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>

              {/* Capture Button */}
              <Button
                onClick={handleCapture}
                className="w-20 h-20 bg-egyptian-gold hover:bg-egyptian-gold/90 rounded-full flex items-center justify-center text-white shadow-lg pulse-glow"
              >
                <Camera className="h-8 w-8" />
              </Button>

              {/* Placeholder for symmetry */}
              <div className="w-12 h-12" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
