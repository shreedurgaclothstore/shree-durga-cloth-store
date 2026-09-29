import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, CheckCircle2, AlertTriangle, XCircle, Sparkles, User, RefreshCw, Upload, Image } from 'lucide-react';
import { MerchantApi, ScanResult } from '../services/merchantApi';

export const ScannerTab: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Initialize camera scanner with multiple fallbacks
  const startCamera = async () => {
    try {
      setScanResult(null);
      setClaimSuccess(false);

      // Stop any existing scanner first
      await stopCamera();

      // Show the scanner viewport
      setIsScanning(true);

      // Allow DOM to render #qr-reader
      await new Promise((resolve) => setTimeout(resolve, 80));

      const readerElem = document.getElementById('qr-reader');
      if (!readerElem) {
        throw new Error('Scanner container element is not ready.');
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      const qrConfig = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const onScanSuccess = (decodedText: string) => {
        stopCamera();
        verifyToken(decodedText);
      };

      // 1. Try camera enumeration first (best compatibility across Android, iOS, Windows, Mac)
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const backCam = devices.find((d) =>
            /back|rear|environment|primary/i.test(d.label)
          );
          const cameraId = backCam ? backCam.id : devices[0].id;
          await html5QrCode.start(cameraId, qrConfig, onScanSuccess, () => {});
          return;
        }
      } catch (camErr) {
        console.warn('Camera enumeration error, trying facingMode fallback:', camErr);
      }

      // 2. Fallback to facingMode: environment
      try {
        await html5QrCode.start({ facingMode: 'environment' }, qrConfig, onScanSuccess, () => {});
        return;
      } catch (envErr) {
        console.warn('FacingMode environment failed, trying user camera:', envErr);
      }

      // 3. Fallback to facingMode: user or any default camera
      await html5QrCode.start({ facingMode: 'user' }, qrConfig, onScanSuccess, () => {});

    } catch (err: any) {
      console.error('Camera failed to start:', err);
      await stopCamera();

      const errMsg = err?.message || String(err);
      if (/permission|denied|NotAllowedError/i.test(errMsg)) {
        alert('Camera permission was denied. Please allow Camera permission in your browser or phone app settings.');
      } else if (/NotFound|DevicesNotFoundError/i.test(errMsg)) {
        alert('No camera detected on this device. Please enter the token manually or upload a QR image.');
      } else {
        alert(`Camera error: ${errMsg}\n\nYou can also enter the 6-digit code or upload the QR photo.`);
      }
    }
  };

  // Handle QR code scanning from an uploaded image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setScanResult(null);
      setClaimSuccess(false);

      const fileScanner = new Html5Qrcode('qr-file-helper');
      const decodedText = await fileScanner.scanFile(file, true);
      fileScanner.clear();
      verifyToken(decodedText);
    } catch (err: any) {
      alert('Could not detect a valid QR code in this image. Please ensure the QR code is clearly visible, or enter the 6-digit code manually.');
    } finally {
      setLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const verifyToken = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setScanResult(null);
    setClaimSuccess(false);

    try {
      const res = await MerchantApi.scanToken(query.trim());
      setScanResult(res);
    } catch (e: any) {
      setScanResult({
        success: false,
        valid: false,
        error: e.message || 'Verification request failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (tokenId: string) => {
    setClaiming(true);
    try {
      const res = await MerchantApi.claimToken(tokenId);
      if (res.success) {
        setClaimSuccess(true);
        if (scanResult && scanResult.token) {
          scanResult.token.status = 'CLAIMED';
        }
      } else {
        alert(res.error || 'Failed to claim token');
      }
    } catch (e: any) {
      alert(e.message || 'Error claiming token');
    } finally {
      setClaiming(false);
    }
  };

  const resetAll = () => {
    stopCamera();
    setScanResult(null);
    setClaimSuccess(false);
    setManualCode('');
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      
      {/* Hidden helper element for file scanning */}
      <div id="qr-file-helper" className="hidden"></div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Action Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200">
        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-1">
          <Camera className="w-5 h-5 text-emerald-600" />
          <span>Counter Token Scanner</span>
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Scan customer's phone QR code or type 6-digit token code to verify & apply cashback.
        </p>

        {/* Camera Scanner Viewport — ALWAYS kept in DOM to prevent React mount race condition */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-slate-950 aspect-square max-w-xs mx-auto mb-4 border-2 border-emerald-500 transition-all ${
            isScanning ? 'block' : 'hidden'
          }`}
        >
          <div id="qr-reader" className="w-full h-full"></div>
          <button
            onClick={stopCamera}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            Cancel Camera
          </button>
        </div>

        {/* Action Buttons (Camera & Upload Photo) */}
        {!isScanning && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <button
              onClick={startCamera}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>Open Camera Scanner</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs sm:text-sm rounded-2xl border border-gray-200 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload QR Photo</span>
            </button>
          </div>
        )}

        {/* Manual Code Input Option */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Or enter Token Code (e.g. TK-948210)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && verifyToken(manualCode)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => verifyToken(manualCode)}
              disabled={loading || !manualCode.trim()}
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all shrink-0"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Display */}
      {scanResult && (
        <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 animate-in fade-in zoom-in-95">
          
          {/* Header Status */}
          {scanResult.valid ? (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">VALID 24H RESERVATION</h4>
                <p className="text-[11px] text-emerald-700">Token is active and held in stock.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">INVALID OR EXPIRED TOKEN</h4>
                <p className="text-[11px] text-rose-700">{scanResult.error}</p>
              </div>
            </div>
          )}

          {/* Garment Details & Customer Info */}
          {scanResult.token && (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <img
                  src={scanResult.token.productImage}
                  alt={scanResult.token.productTitle}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Size: {scanResult.token.productSize}
                  </span>
                  <h4 className="font-extrabold text-sm text-gray-900 truncate">
                    {scanResult.token.productTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Customer: <b>{scanResult.token.userName}</b> ({scanResult.token.userPhone || scanResult.token.userEmail})</span>
                  </div>
                </div>
              </div>

              {/* Billing Breakdown */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Product MRP:</span>
                  <span className="line-through font-semibold">₹{scanResult.token.originalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>Clearance Offer Price:</span>
                  <span className="font-bold">₹{scanResult.token.discountedPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Store Cashback Deducted:
                  </span>
                  <span>- ₹{scanResult.token.cashbackAmount}</span>
                </div>
                <div className="border-t border-emerald-200 pt-2 flex justify-between items-baseline font-black text-base text-gray-900">
                  <span>COLLECT CASH FROM CUSTOMER:</span>
                  <span className="text-emerald-700 text-lg">₹{scanResult.token.finalPayableAmount}</span>
                </div>
              </div>

              {/* Action: Mark as Claimed */}
              {scanResult.valid && !claimSuccess ? (
                <button
                  onClick={() => handleClaim(scanResult.token!.id)}
                  disabled={claiming}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{claiming ? 'Confirming Sale...' : 'CONFIRM SALE & REDEEM TOKEN'}</span>
                </button>
              ) : claimSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-center">
                  <h5 className="font-extrabold text-emerald-900 text-sm flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    SALE COMPLETED & RECORDED!
                  </h5>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Token is redeemed. ₹{scanResult.token.cashbackAmount} cashback accounted.
                  </p>
                  <button
                    onClick={resetAll}
                    className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
                  >
                    Scan Next Customer
                  </button>
                </div>
              ) : null}

            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Scanner
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
