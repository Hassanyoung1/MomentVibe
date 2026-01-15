import React from 'react';

interface QRCodeDisplayProps {
    qrImage: string;
    qrUploadUrl: string;
    title?: string;
    description?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
    qrImage,
    qrUploadUrl,
    title = "Guest Upload QR Code",
    description = "Scan this code to upload photos and videos to the event"
}) => {
    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <img src={qrImage} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="mt-4 text-sm text-slate-400">{description}</p>

            <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Direct Link:</p>
                <a
                    href={qrUploadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                    {qrUploadUrl}
                </a>
            </div>
        </div>
    );
};
