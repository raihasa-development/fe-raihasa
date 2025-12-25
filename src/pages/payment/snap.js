let snapScriptLoaded = false;

export const loadSnapScript = (clientKey) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (snapScriptLoaded && window.snap) {
      resolve(window.snap);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.getElementById('midtrans-snap');
    if (existingScript) {
      existingScript.onload = () => {
        snapScriptLoaded = true;
        resolve(window.snap);
      };
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'midtrans-snap';
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Use sandbox for testing
    // For production, use: https://app.midtrans.com/snap/snap.js
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    script.onload = () => {
      snapScriptLoaded = true;
      if (window.snap) {
        resolve(window.snap);
      } else {
        reject(new Error('Snap.js loaded but window.snap is not available'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Snap.js'));
    };

    document.body.appendChild(script);
  });
};

export const openSnap = (token, callbacks) => {
  if (!window.snap) {
    console.error('Snap.js is not loaded');
    return;
  }

  window.snap.pay(token, {
    onSuccess: (result) => {
      console.log('Payment success:', result);
      if (callbacks.onSuccess) callbacks.onSuccess(result);
    },
    onPending: (result) => {
      console.log('Payment pending:', result);
      if (callbacks.onPending) callbacks.onPending(result);
    },
    onError: (result) => {
      console.error('Payment error:', result);
      if (callbacks.onError) callbacks.onError(result);
    },
    onClose: () => {
      console.log('Payment modal closed');
      if (callbacks.onClose) callbacks.onClose();
    },
  });
};
