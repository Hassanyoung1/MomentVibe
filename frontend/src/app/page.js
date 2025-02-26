"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const QrCodeDisplay = ({ eventId }) => {
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await axios.get(`/api/events/${eventId}/qr`);
        setQrCodeData(response.data.qrImage);
      } catch (error) {
        console.error('Error fetching QR code:', error);
      }
    };

    fetchQrCode();
  }, [eventId]);

  if (!qrCodeData) {
    return <p>Loading QR code...</p>;
  }

  return (
    <div>
      <img src={qrCodeData} alt="Event QR Code" />
    </div>
  );
};

export default QrCodeDisplay;