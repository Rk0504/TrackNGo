import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MyComplaintsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchComplaints();
    }, [user, navigate]);

    const fetchComplaints = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/api/complaints/user/${user.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch complaints');
            }

            setComplaints(data.complaints);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
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
                    <p className="mt-4 text-gray-600">Loading your complaints...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
                            <p className="text-gray-600 mt-1">
                                Welcome back, <span className="font-semibold">{user?.name}</span>
                            </p>
                        </div>
                        <Link
                            to="/"
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {/* Complaints List */}
                {complaints.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No complaints yet</h3>
                        <p className="mt-2 text-gray-600">You haven't submitted any complaints.</p>
                        <Link
                            to="/"
                            className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                        >
                            Submit First Complaint
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <p className="text-sm text-gray-600">
                                Total Complaints: <span className="font-semibold text-gray-900">{complaints.length}</span>
                            </p>
                        </div>

                        {complaints.map((complaint) => (
                            <Link
                                key={complaint.id}
                                to={`/complaint/${complaint.complaint_id}`}
                                className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition duration-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <h3 className="text-lg font-semibold text-primary-600 hover:text-primary-700">
                                                {complaint.complaint_id}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{formatDate(complaint.created_at)}</span>
                                            </div>

                                            {complaint.bus_number && complaint.bus_number !== 'Unknown' && (
                                                <div className="flex items-center gap-2">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Bus: <strong>{complaint.bus_number}</strong></span>
                                                </div>
                                            )}
                                        </div>

                                        {complaint.description && (
                                            <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                                                {complaint.description}
                                            </p>
                                        )}

                                        {complaint.address && (
                                            <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                                                <svg className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="line-clamp-1">{complaint.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyComplaintsPage;
