import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const UpiSettings = ({ token }) => {
    const [hotelName, setHotelName] = useState('Royal Heritage Hotel');
    const [upiId, setUpiId] = useState('hotelname@upi');
    const [upiDisplayName, setUpiDisplayName] = useState('Royal Heritage Hotel & Dining');
    const [sampleAmount, setSampleAmount] = useState('499.00');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch existing UPI configuration
    const fetchConfig = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await axios.get(backendUrl + '/api/order/admin/upi-config', {
                headers: { token }
            });
            if (response.data.success && response.data.config) {
                const { hotelName, upiId, upiDisplayName } = response.data.config;
                setHotelName(hotelName || '');
                setUpiId(upiId || '');
                setUpiDisplayName(upiDisplayName || '');
            }
        } catch (error) {
            console.error("Error fetching UPI config:", error);
            toast.error(error.response?.data?.message || "Failed to load UPI settings");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [token]);

    const handleSave = async (e) => {
        e.preventDefault();

        const cleanUpi = upiId.trim();
        if (!cleanUpi.includes('@') || cleanUpi.length < 5) {
            toast.error("Please enter a valid UPI ID (e.g. hotel@okaxis or myhotel@oksbi)");
            return;
        }

        setIsSaving(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/order/admin/upi-config',
                {
                    hotelName: hotelName.trim(),
                    upiId: cleanUpi,
                    upiDisplayName: (upiDisplayName || hotelName).trim()
                },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success("UPI Configuration saved successfully! Customers will now see this UPI ID at checkout.");
            } else {
                toast.error(response.data.message || "Failed to save configuration");
            }
        } catch (error) {
            console.error("Error updating UPI config:", error);
            toast.error(error.response?.data?.message || "Failed to save UPI settings");
        } finally {
            setIsSaving(false);
        }
    };

    // Live preview deep link
    const previewDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiDisplayName || hotelName)}&am=${Number(sampleAmount || 0).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Food Order Payment')}`;

    return (
        <div className='w-full max-w-4xl space-y-6'>
            <div>
                <h2 className='text-2xl font-extrabold text-[#2C3E50]'>Hotel UPI Configuration</h2>
                <p className='text-sm text-gray-500 mt-1'>
                    Configure your hotel's official UPI ID and display name. The checkout QR code and deep links are generated dynamically from these settings.
                </p>
            </div>

            {isLoading ? (
                <div className='bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm'>
                    <div className='animate-spin h-7 w-7 border-2 border-[#A37D40] border-t-transparent rounded-full mx-auto mb-2'></div>
                    <p className='text-gray-500 text-sm'>Loading current configuration...</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                    {/* Settings Form */}
                    <form onSubmit={handleSave} className='md:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4'>
                        <h3 className='text-base font-bold text-gray-800 border-b border-gray-100 pb-3'>
                            Merchant Account Details
                        </h3>

                        <div>
                            <label className='block text-xs font-bold text-gray-700 mb-1'>
                                Hotel / Restaurant Name <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type='text'
                                required
                                value={hotelName}
                                onChange={(e) => setHotelName(e.target.value)}
                                placeholder='e.g. Royal Heritage Hotel'
                                className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                            />
                            <p className='text-[11px] text-gray-400 mt-1'>Legal name or brand name displayed to customers.</p>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-700 mb-1'>
                                Hotel UPI ID (VPA) <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type='text'
                                required
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value.trim())}
                                placeholder='e.g. royalhotel@oksbi or myhotel@okaxis'
                                className='w-full px-4 py-2.5 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                            />
                            <p className='text-[11px] text-gray-400 mt-1'>
                                Transactions will be received on this UPI ID. Ensure it is verified with your hotel bank.
                            </p>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-gray-700 mb-1'>
                                UPI Payee Display Name <span className='text-gray-400 font-normal'>(Shown in customer's UPI app)</span>
                            </label>
                            <input
                                type='text'
                                value={upiDisplayName}
                                onChange={(e) => setUpiDisplayName(e.target.value)}
                                placeholder='e.g. Royal Heritage Hotel & Restaurant'
                                className='w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A37D40]'
                            />
                            <p className='text-[11px] text-gray-400 mt-1'>
                                Name that shows up in Google Pay, PhonePe, or Paytm when customer scans the QR.
                            </p>
                        </div>

                        <div className='pt-3'>
                            <button
                                type='submit'
                                disabled={isSaving}
                                className='w-full py-3 px-5 text-sm font-bold text-white bg-[#A37D40] hover:bg-[#856535] rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2'
                            >
                                {isSaving ? (
                                    <>
                                        <span className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></span>
                                        <span>Saving Settings...</span>
                                    </>
                                ) : (
                                    <span>💾 Save UPI Configuration</span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Live Preview Card */}
                    <div className='md:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center'>
                        <h3 className='text-sm font-bold uppercase tracking-wider text-gray-500 mb-3'>
                            Live QR Code Preview
                        </h3>

                        {/* QR Box */}
                        <div className='p-3 bg-white border-2 border-dashed border-[#A37D40]/50 rounded-2xl shadow-sm mb-3'>
                            <QRCodeSVG
                                value={previewDeepLink}
                                size={160}
                                level="M"
                                includeMargin={true}
                            />
                        </div>

                        <p className='text-xs font-bold text-gray-800'>{upiDisplayName || hotelName}</p>
                        <p className='text-xs font-mono text-gray-500 mt-0.5'>{upiId}</p>

                        <div className='my-3 w-full bg-[#FAF7F5] p-2 rounded-lg border border-gray-200 text-xs'>
                            <label className='block text-gray-500 text-[10px] uppercase font-bold mb-1'>Test Amount Simulation</label>
                            <div className='flex items-center justify-center gap-1 font-bold text-[#A37D40]'>
                                <span>₹</span>
                                <input
                                    type='number'
                                    value={sampleAmount}
                                    onChange={(e) => setSampleAmount(e.target.value)}
                                    className='w-20 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-center text-xs'
                                />
                            </div>
                        </div>

                        <div className='w-full text-left bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-[11px] text-gray-600 space-y-1 font-mono break-all'>
                            <span className='font-bold text-gray-700 block'>Generated Deep Link:</span>
                            <span className='text-[10px] text-gray-500 leading-tight block'>{previewDeepLink}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpiSettings;
