"use server";

import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

// Detect whether the app is being used on a mobile device
export const isMobileDevice = () => {
    const { get } = headers();
    const ua = get('user-agent');
    const device = new UAParser(ua || '').getDevice();
    return device.type === 'mobile';
};
