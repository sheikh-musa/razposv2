// src/hooks/useStripeTerminal.ts
import { useState, useEffect } from 'react';
import { loadStripeTerminal } from '@stripe/terminal-js';

export const useStripeTerminal = () => {
    
    const [terminal, setTerminal] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isReaderConnected, setIsReaderConnected] = useState(false);

    useEffect(() => {
        const initTerminal = async () => {
            const StripeTerminal = await loadStripeTerminal();
            // @ts-expect-error: terminal
            const t = StripeTerminal.create({
                onFetchConnectionToken: async () => {
                    const res = await fetch('/api/payment/connection-token', { method: 'POST' });
                    const data = await res.json();
                    return data.secret;
                },
                onUnexpectedReaderDisconnect: () => setIsReaderConnected(false),
            });
            setTerminal(t);
        };
        initTerminal();
    }, []);

    const connectToReader = async () => {
        console.log('connectToReader');
        if (!terminal) return;
        // Discover readers on your local network (simulated for dev, real for prod)
        const config = { simulated: true }; 
        const discoverResult = await terminal.discoverReaders(config);
        
        if (discoverResult.discoveredReaders.length > 0) {
            const reader = discoverResult.discoveredReaders[0];
            await terminal.connectReader(reader);
            setIsReaderConnected(true);
        }
        else {
            setIsReaderConnected(false);
            console.log('No readers found')
        }
    };

    const processPayment = async (amount: number) => {
        if (!terminal || !isReaderConnected) throw new Error("Reader not connected");

        // 1. Create Payment Intent (Server side)
        const res = await fetch('/api/payment/create-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Math.round(amount * 100) }),
        });
        const { client_secret } = await res.json();

        // 2. Collect Payment Method
        const result = await terminal.collectPaymentMethod(client_secret);

        if (result.error) throw result.error;

        // 3. Process the payment
        const processResult = await terminal.processPayment(result.paymentIntent);
        if (processResult.error) throw processResult.error;

        return processResult.paymentIntent;
    };

    return { isReaderConnected, connectToReader, processPayment };
};