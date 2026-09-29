import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, CheckCircle2, AlertTriangle, XCircle, Sparkles, User, RefreshCw } from 'lucide-react';
import { MerchantApi, ScanResult } from '../services/merchantApi';

export const ScannerTab: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize camera scanner
  const startCamera = async () => {
    try {
      setScanResult(null);
      setClaimSuccess(false);
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Success callback
          stopCamera();
          verifyToken(decodedText);
        },
        () => {
          // Frame error (ignore frame misses)
        }
      );
    } catch (err) {
      console.error('Camera failed to start:', err);
      setIsScanning(false);
      alert('Camera access failed. Please grant camera permission or use manual code entry.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

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
    setScanResult(null);
    setClaimSuccess(false);
    setManualCode('');
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      
      {/* Top Action Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200">
        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-1">
          <Camera className="w-5 h-5 text-emerald-600" />
          <span>Counter Token Scanner</span>
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Scan customer's phone QR code or type 6-digit token code to verify & apply cashback.
        </p>

        {/* Camera Scanner Viewport */}
        {isScanning ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-xs mx-auto mb-4 border-2 border-emerald-500">
            <div id="qr-reader" className="w-full h-full"></div>
            <button
              onClick={stopCamera}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg"
            >
              Cancel Camera
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mb-4">
            <button
              onClick={startCamera}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>Open Camera Scanner</span>
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
