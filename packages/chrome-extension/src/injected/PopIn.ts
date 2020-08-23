export default class PopIn {
  constructor(url: string) {
    const iframe = window.document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      border: 0;
      z-index: 100000000;
      height: 360px;
      width: 300px;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      border-radius: 2px;
      background: #ededed;
    `;

    const listener = (event: any) => {
      if (event.source == iframe.contentWindow && event.data.close) {
        window.removeEventListener('message', listener);
        document.body.removeChild(iframe);
      }

      if (event.source == iframe.contentWindow && event.data.resize) {
        iframe.style.height = `${event.data.height}px`;
      }
    }

    window.addEventListener('message', listener);
    window.document.body.appendChild(iframe);
  }
}
