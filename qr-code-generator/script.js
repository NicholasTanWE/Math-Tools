document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('qr-form');
  const urlInput = document.getElementById('url-input');
  const errorMessage = document.getElementById('url-error');
  const result = document.getElementById('qr-result');
  const qrCode = document.getElementById('qr-code');
  const qrCaption = document.getElementById('qr-caption');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = urlInput.value.trim();
    const valueWithProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;

    let url;
    try {
      url = new URL(valueWithProtocol);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) {
        throw new Error('Invalid website address');
      }
    } catch {
      errorMessage.textContent = 'Enter a valid website address, such as example.com.';
      errorMessage.hidden = false;
      urlInput.setAttribute('aria-invalid', 'true');
      result.hidden = true;
      urlInput.focus();
      return;
    }

    if (typeof QRCode === 'undefined') {
      errorMessage.textContent = 'The QR code generator could not load. Check your internet connection and try again.';
      errorMessage.hidden = false;
      result.hidden = true;
      return;
    }

    errorMessage.hidden = true;
    urlInput.removeAttribute('aria-invalid');
    qrCode.replaceChildren();
    result.hidden = false;
    qrCaption.textContent = url.href;

    new QRCode(qrCode, {
      text: url.href,
      width: 256,
      height: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  });
});
