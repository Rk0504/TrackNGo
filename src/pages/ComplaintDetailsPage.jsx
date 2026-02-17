import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ComplaintDetailsPage() {
    const { complaintId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchComplaintDetails();
    }, [complaintId, user, navigate]);

    const fetchComplaintDetails = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/api/complaints/${complaintId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch complaint details');
            }

            setComplaint(data.complaint);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading complaint details...</p>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="mt-4 text-xl font-bold text-gray-900">Complaint Not Found</h2>
                    <p className="mt-2 text-gray-600">{error || 'The complaint you are looking for does not exist.'}</p>
                    <Link
                        to="/my-complaints"
                        className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                    >
                        Back to My Complaints
                    </Link>
                </div>
            </div>
        );
    }

    const mediaUrl = complaint.media_path
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/uploads/${complaint.media_path}`
        : null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/my-complaints"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4"
                    >
                        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to My Complaints
                    </Link>
                </div>

                {/* Complaint Details Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Reference ID</p>
                            <h1 className="text-3xl font-bold">{complaint.complaint_id}</h1>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-6">
                        {/* Timeline */}
                        <div className="border-l-4 border-primary-200 pl-4">
                            <p className="text-sm text-gray-500">Submitted on</p>
                            <p className="text-lg font-semibold text-gray-900">{formatDate(complaint.created_at)}</p>
                        </div>

                        {/* Bus Number */}
                        {complaint.bus_number && complaint.bus_number !== 'Unknown' && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Bus Number</h3>
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-lg font-semibold text-gray-900">{complaint.bus_number}</span>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {complaint.description && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                                <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-md">
                                    {complaint.description}
                                </p>
                            </div>
                        )}

                        {/* Location */}
                        {complaint.address && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                                <div className="flex items-start gap-2 bg-gray-50 p-4 rounded-md">
                                    <svg className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-gray-900">{complaint.address}</p>
                                        {complaint.latitude && complaint.longitude && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Coordinates: {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {mediaUrl && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Evidence</h3>
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    {complaint.media_type === 'image' ? (
                                        <img
                                            src={mediaUrl}
                                            alt="Complaint evidence"
                                            className="w-full h-auto object-contain max-h-96"
                                        />
                                    ) : complaint.media_type === 'video' ? (
                                        <video
                                            controls
                                            className="w-full h-auto max-h-96"
                                            playsInline
                                            preload="metadata"
                                        >
                                            <source src={mediaUrl} type="video/mp4" />
                                            <source src={mediaUrl} type="video/webm" />
                                            Your browser does not support video playback.
                                        </video>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            <p>Media file available</p>
                                            <a
                                                href={mediaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                                            >
                                                Download File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            If you have any questions about this complaint, please contact support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComplaintDetailsPage;
