(function () {
  try {
    var scriptTag = document.currentScript;
    if (!scriptTag) {
      var scripts = document.getElementsByTagName('script');
      scriptTag = scripts[scripts.length - 1];
    }

    if (!scriptTag) return;

    var workspace = scriptTag.getAttribute('data-workspace') || 'default';
    var height = scriptTag.getAttribute('data-height') || '700';
    var width = scriptTag.getAttribute('data-width') || '100%';
    var border = scriptTag.getAttribute('data-border') || '0';

    var baseUrl = '';
    try {
      baseUrl = new URL(scriptTag.src).origin;
    } catch (e) {
      baseUrl = 'https://app.salesfusion.io';
    }

    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/?workspace=' + encodeURIComponent(workspace) + '&embed=true';
    iframe.width = width;
    iframe.height = height;
    iframe.style.border = border;
    iframe.style.borderRadius = '12px';
    iframe.style.overflow = 'hidden';
    iframe.setAttribute('allow', 'clipboard-write; microphone; camera');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('title', 'Sales Room');

    scriptTag.parentNode.insertBefore(iframe, scriptTag.nextSibling);
  } catch (error) {
     
    console.error('SalesFusion embed failed:', error);
  }
})();

