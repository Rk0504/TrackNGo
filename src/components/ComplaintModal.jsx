import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ComplaintModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState('form'); // form, camera, review, success
    const [formData, setFormData] = useState({ busNumber: '', description: '' });
    const [category, setCategory] = useState(''); // New Category State
    const [mediaType, setMediaType] = useState(null); // 'photo' or 'video'
    const [mediaBlob, setMediaBlob] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle, submitting, success, error
    const [complaintId, setComplaintId] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const lastLocationRef = useRef(null);
    const watchIdRef = useRef(null);

    // Cleanup stream on close
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Ensure video stream attaches AFTER the video element renders
    useEffect(() => {
        if (step === 'camera' && videoRef.current && streamRef.current) {
            console.log("Attaching stream to video element");
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(e => console.error("Play error:", e));
        }
    }, [step]);

    if (!isOpen) return null;

    // --- HELPER FUNCTIONS (Defined in dependency order) ---

    const stopRecording = () => {
        if (!isRecording) return;

        // Ensure at least 1 second of recording
        setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
        }, 1000);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        // Stop location tracking
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        // Ensure recording stops if active
        stopRecording();
    };

    const fetchAddress = async (lat, lng, currentLoc) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            if (data && data.address) {
                const area = data.address.suburb || data.address.neighbourhood || data.address.road || data.address.city || 'Unknown Area';
                const city = data.address.city || data.address.town || data.address.village || '';
                const fullAddress = city ? `${area}, ${city}` : area;

                setLocation(prev => prev ? ({ ...prev, address: fullAddress }) : { ...currentLoc, address: fullAddress });
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
        }
    };

    const getLocation = (cb) => {
        // OPTIMIZATION: Use pre-fetched location if available
        if (lastLocationRef.current) {
            const loc = { ...lastLocationRef.current, timestamp: new Date().toISOString() };
            setLocation(loc);
            fetchAddress(loc.latitude, loc.longitude, loc);
            if (cb) cb(loc);
            return;
        }

        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: new Date().toISOString()
                };
                setLocation(loc);
                fetchAddress(loc.latitude, loc.longitude, loc);
                if (cb) cb(loc);
            },
            (err) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, timestamp: new Date().toISOString() };
                        setLocation(loc);
                        fetchAddress(loc.latitude, loc.longitude, loc);
                        if (cb) cb(loc);
                    },
                    () => setErrorMsg('Location access denied. Location is required.'),
                    { enableHighAccuracy: false }
                );
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            setMediaBlob(blob);
            setMediaPreview(url);
            setMediaType('photo');
            setStep('review');
            stopCamera();
            getLocation(); // Final location check
        }, 'image/jpeg');
    };

    const startRecording = () => {
        setMediaType('video');
        setIsRecording(true);
        chunksRef.current = [];

        getLocation(); // Check location

        const recorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const type = chunksRef.current[0]?.type || 'video/webm';
            const blob = new Blob(chunksRef.current, { type });
            const url = URL.createObjectURL(blob);
            setMediaBlob(blob);
            setMediaPreview(url);
            setStep('review');
            stopCamera();
        };

        recorder.start();
    };

    const startCamera = async () => {
        if (!category) {
            setErrorMsg('Choose category first'); // User requested specific text
            return;
        }

        setStep('initializing');
        setErrorMsg(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: true
            });
            streamRef.current = stream;

            setStep('camera');
            setErrorMsg(null);

            // START PRE-FETCHING LOCATION
            if (navigator.geolocation) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        lastLocationRef.current = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            timestamp: new Date().toISOString()
                        };
                    },
                    (err) => console.warn("Background location fetch warning:", err),
                    { enableHighAccuracy: true, maximumAge: 10000 }
                );
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Camera access denied. Please check permissions.');
        }
    };

    const handleRetake = () => {
        setMediaBlob(null);
        setMediaPreview(null);
        setLocation(null);
        startCamera();
    };

    const handleSubmit = async () => {
        if (!mediaBlob || !location) {
            setErrorMsg('Please capture photo/video evidence first.');
            return;
        }

        setSubmissionStatus('submitting');

        const data = new FormData();
        data.append('bus_number', formData.busNumber);
        const descriptionWithCategory = `[${category}] ${formData.description}`;
        data.append('description', descriptionWithCategory);
        data.append('category', category); // Send separately too just in case backend updates later
        data.append('latitude', location.latitude);
        data.append('longitude', location.longitude);
        data.append('address', location.address || ''); // Ensure address is sent
        data.append('captured_at', location.timestamp);
        data.append('media_type', mediaType);

        // Add User ID if logged in
        if (user && user.id) {
            data.append('user_id', user.id);
        }

        const ext = mediaType === 'photo' ? 'jpg' : 'webm';
        data.append('media_file', mediaBlob, `evidence.${ext}`);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        try {
            const res = await fetch(`${apiUrl}/api/complaints`, {
                method: 'POST',
                body: data,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Submission failed');

            setComplaintId(result.complaint_id);
            setSubmissionStatus('success');
            setStep('success');
        } catch (err) {
            setSubmissionStatus('error');
            setErrorMsg(err.message);
        }
    };

    const resetForm = () => {
        setStep('form');
        setFormData({ busNumber: '', description: '' });
        setCategory(''); // Reset Category
        setMediaBlob(null);
        setMediaPreview(null);
        setLocation(null);
        setSubmissionStatus('idle');
        setErrorMsg(null);
        onClose();
    };

    // --- RENDERS ---

    if (step === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
                    <div className="text-green-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Complaint Submitted!</h2>
                    <p className="text-gray-600 mb-4">Your Reference ID: <span className="font-mono font-bold text-black">{complaintId}</span></p>
                    <button onClick={resetForm} className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium">Close</button>
                </div>
            </div>
        );
    }

    if (step === 'camera') {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        webkit-playsinline="true"
                        muted
                        onLoadedMetadata={() => {
                            videoRef.current.play().catch(e => console.error("Play error:", e));
                        }}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                        style={{ transform: 'scaleX(1)' }}
                    ></video>

                    <button onClick={() => { stopCamera(); setStep('form'); }} className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 p-2 rounded-full z-10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 bg-opacity-75 text-white px-3 py-1 rounded-full animate-pulse z-10">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                            <span className="text-xs font-bold">REC</span>
                        </div>
                    )}
                </div>

                <div className="bg-gray-900 p-6 flex justify-around items-center">
                    {!isRecording ? (
                        <>
                            <button onClick={capturePhoto} className="flex flex-col items-center space-y-1">
                                <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                                    <div className="w-14 h-14 bg-white rounded-full"></div>
                                </div>
                                <span className="text-white text-xs">Photo</span>
                            </button>
                            <button onClick={startRecording} className="flex flex-col items-center space-y-1">
                                <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center">
                                    <div className="w-14 h-14 bg-red-500 rounded-full"></div>
                                </div>
                                <span className="text-white text-xs">Video</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={stopRecording} className="flex flex-col items-center space-y-1">
                            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                                <div className="w-8 h-8 bg-red-600 rounded-sm"></div>
                            </div>
                            <span className="text-white text-xs">Stop Recording</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (step === 'review') {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                <div className="flex-1 relative bg-black flex items-center justify-center max-h-[70vh]">
                    {mediaType === 'photo' ? (
                        <img src={mediaPreview} alt="Evidence" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <video
                            key={mediaPreview}
                            src={mediaPreview}
                            controls
                            playsInline
                            autoPlay
                            muted
                            className="w-full h-full object-contain bg-black"
                        />
                    )}

                    {location ? (
                        <div className="absolute bottom-4 left-4 text-white text-xs p-3 space-y-1 z-10 w-[90%] pointer-events-none" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                            <div className="font-bold text-yellow-400 text-sm">
                                {new Date(location.timestamp).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="font-mono">{new Date(location.timestamp).toLocaleTimeString()}</div>

                            {location.address && (
                                <div className="font-semibold text-blue-200 truncate" title={location.address}>
                                    📍 {location.address}
                                </div>
                            )}

                            <div className="text-gray-300 font-mono text-[10px]">
                                LAT: {location.latitude.toFixed(6)} | LNG: {location.longitude.toFixed(6)}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute bottom-4 left-4 bg-yellow-500 text-white text-xs p-2 rounded flex items-center animate-pulse z-10">
                            <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Fetching Location...
                        </div>
                    )}
                </div>
                <div className="flex-1 bg-white p-4 flex flex-col">
                    <h3 className="font-bold text-lg mb-2">Review Evidence</h3>

                    <div className="flex-1 overflow-y-auto mb-4">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Bus Number</label>
                                <div className="text-sm font-semibold">{formData.busNumber || 'Not provided'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Description</label>
                                <div className="text-sm text-gray-700">{formData.description || 'No description'}</div>
                            </div>
                        </div>
                    </div>

                    {errorMsg && <div className="text-red-600 text-sm mb-2">{errorMsg}</div>}

                    <div className="flex space-x-3">
                        <button onClick={handleRetake} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Retake</button>
                        <button
                            onClick={handleSubmit}
                            disabled={submissionStatus === 'submitting'}
                            className="flex-1 py-3 bg-red-600 rounded-lg font-medium text-white hover:bg-red-700 flex justify-center items-center"
                        >
                            {submissionStatus === 'submitting' ? (
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : 'Submit Complaint'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Raise Complaint</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {errorMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category <span className="text-red-500">*</span></label>
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    if (e.target.value) setErrorMsg(null);
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
                            >
                                <option value="">Select Category</option>
                                <option value="Rash driving">Rash driving</option>
                                <option value="Over crowding">Over crowding</option>
                                <option value="Inappropriate behaviour">Inappropriate behaviour</option>
                                <option value="Stop Skipping">Stop Skipping</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                            <input
                                type="text"
                                placeholder="e.g., TN-THJ-45"
                                value={formData.busNumber}
                                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 text-xs">(Optional)</span></label>
                            <textarea
                                placeholder="Describe the issue..."
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                            ></textarea>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">Evidence Required</h4>
                            <p className="text-xs text-blue-600 mb-3">You must capture a photo or video live. Location will be tagged automatically.</p>

                            {user ? (
                                <button
                                    onClick={startCamera}
                                    className="w-full flex items-center justify-center space-x-2 bg-white border border-blue-200 text-blue-700 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>Open Camera</span>
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-red-600 font-medium">You must be logged in to raise a complaint.</p>
                                    <button
                                        onClick={() => { onClose(); navigate('/login'); }}
                                        className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700"
                                    >
                                        Log In / Register
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintModal;
