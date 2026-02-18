import React, { useState, useEffect, useRef } from 'react';

function DriverMode() {
    const [busId, setBusId] = useState('MOBILE-' + Math.floor(Math.random() * 100));
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('Idle');
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const watchIdRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const [nextStop, setNextStop] = useState(null);
    const [eta, setEta] = useState(null);

    const [safetyScore, setSafetyScore] = useState(100);
    const [violation, setViolation] = useState(null);
    const lastPosRef = useRef(null); // To calculate manual speed if GPS speed is null

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => {
            clearInterval(timer);
            stopTracking();
        };
    }, []);

    const wakeLockRef = useRef(null);

    // Function to request Wake Lock
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                setStatus('GPS Active • Screen Kept On');
            }
        } catch (err) {
            console.error('Wake Lock error:', err);
        }
    };

    const startTracking = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);
        setStatus('Initializing GPS...');
        setError(null);

        // Request Screen Wake Lock
        await requestWakeLock();

        const options = {
            enableHighAccuracy: true,
            timeout: 30000, // Increased to 30s to fix "Timeout expired" on mobile
            maximumAge: 2000 // Allow cached positions up to 2s
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePosition,
            handleError,
            options
        );
    };

    const stopTracking = async () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        // Release Wake Lock
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
            } catch (err) {
                console.error('Wake Lock release error:', err);
            }
        }

        setIsTracking(false);
        setStatus('Stopped');
    };

    const handlePosition = async (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        const timestamp = Math.floor(Date.now() / 1000);

        // MANUAL SPEED CALCULATION FALLBACK
        // Many mobile browsers return speed=null or speed=0 unless moving fast.
        // We calculate speed manually if GPS speed is unavailable but location changed.
        let manualSpeed = 0;
        if (lastPosRef.current) {
            const { lat: lat1, lng: lng1, time: time1 } = lastPosRef.current;
            const timeDiff = (Date.now() - time1) / 1000; // seconds

            if (timeDiff > 0) {
                // Haversine Distance
                const R = 6371e3; // metres
                const φ1 = lat1 * Math.PI / 180;
                const φ2 = latitude * Math.PI / 180;
                const Δφ = (latitude - lat1) * Math.PI / 180;
                const Δλ = (longitude - lng1) * Math.PI / 180;
                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c; // in metres

                manualSpeed = (d / timeDiff) * 3.6; // convert m/s to km/h
            }
        }

        // Use GPS speed if available, else usage manual speed
        // Filter out extreme jumps (teleportation) > 120 km/h manually
        if (manualSpeed > 150) manualSpeed = 0;

        let currentSpeed = (speed !== null && speed !== undefined)
            ? Math.round(speed * 3.6)
            : Math.round(manualSpeed);

        // Update last pos
        lastPosRef.current = { lat: latitude, lng: longitude, time: Date.now() };

        // Ensure we don't send NaN
        if (isNaN(currentSpeed)) currentSpeed = 0;

        setLocation({
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
            speed: currentSpeed,
            timestamp: new Date().toLocaleTimeString()
        });

        // Throttle updates to every 1 second (Crucial for acceleration calculation)
        const now = Date.now();
        if (now - lastUpdateRef.current < 1000) return;
        lastUpdateRef.current = now;

        setStatus('Sending update...');

        const payload = {
            bus_id: busId,
            lat: latitude,
            lng: longitude,
            speed: currentSpeed,
            route_id: 'R12', // Default to R12 for testing, or make this selectable
            timestamp: timestamp,
            timestamp_ms: Date.now() // High precision for G-force calculation
        };

        try {
            const response = await fetch(`${API_URL}/api/gps/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                setStatus('✅ update sent!');
                if (data.nextStop) setNextStop(data.nextStop);
                if (data.eta) setEta(data.eta);
                if (data.safety_score !== undefined) setSafetyScore(data.safety_score);

                if (data.violations && data.violations.length > 0) {
                    setViolation(data.violations[0]);
                    // Clear violation after 3 seconds
                    setTimeout(() => setViolation(null), 3000);
                }
            } else {
                const errData = await response.json();
                console.error('API Error:', errData);
                setStatus(`❌ Server error: ${response.status}`);
            }
        } catch (err) {
            console.error('Network Error:', err);
            setStatus('❌ Network error');
        }
    };

    const handleError = (err) => {
        console.warn('GPS Error:', err);
        let msg = err.message;
        if (err.code === 1) {
            msg = "Permission denied. Please enable Location in Phone Settings > Site Settings > Allow Location.";
        } else if (err.code === 2) {
            msg = "Location unavailable. Ensure GPS is ON and you have a clear sky view.";
        } else if (err.code === 3) {
            msg = "GPS Timeout. Signal is weak. Please move outdoors.";
        }
        setError(`GPS Error: ${msg}`);
        setIsTracking(false);
        setStatus('GPS Error');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">🚌 Admin Mode</h1>
                <div className="text-center mb-4">
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-mono font-semibold text-gray-700">
                        🕒 {currentTime}
                    </span>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bus ID</label>
                    <input
                        type="text"
                        value={busId}
                        onChange={(e) => setBusId(e.target.value)}
                        disabled={isTracking}
                        className="w-full border rounded px-3 py-2 font-mono text-center text-lg"
                    />
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {violation && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 text-center font-bold animate-bounce">
                        ⚠️ {violation} Detected!
                    </div>
                )}

                <div className="text-center mb-6">
                    <div className={`text-sm font-semibold mb-2 ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                        Status: {status}
                    </div>

                    {!isTracking ? (
                        <button
                            onClick={startTracking}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors"
                        >
                            Start GPS Tracking
                        </button>
                    ) : (
                        <button
                            onClick={stopTracking}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors animate-pulse"
                        >
                            Stop Tracking
                        </button>
                    )}
                </div>

                {location && (
                    <div className="bg-gray-50 rounded p-4 font-mono text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Latitude:</span>
                            <span className="font-bold">{location.lat}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Longitude:</span>
                            <span className="font-bold">{location.lng}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-500">Speed:</span>
                            <span className="font-bold text-xl">{Math.round(location.speed)} km/h</span>
                        </div>

                        {(nextStop || eta) && (
                            <div className="flex justify-between items-center pt-2 bg-blue-50 p-2 rounded mt-2">
                                <span className="text-gray-600 font-medium">Next Route:</span>
                                <div className="text-right">
                                    <div className="font-bold text-blue-900">{nextStop || 'Calculating...'}</div>
                                    <div className="text-sm text-blue-700 font-semibold">{eta}</div>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 pt-2 border-t flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Safety Score:</span>
                            <span className={`font-bold text-lg ${safetyScore > 80 ? 'text-green-600' : safetyScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {safetyScore}/100
                            </span>
                        </div>

                        <div className="text-xs text-gray-400 text-center mt-2">
                            Last Update: {location.timestamp}
                        </div>
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-500 text-center">
                    <p>⚠️ Requires Location Permission</p>
                    <p>This device will appear as a bus on the main map.</p>
                </div>
            </div>
        </div>
    );
}

export default DriverMode;
