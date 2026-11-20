// STicks: the first script of every extension page. Finds the page that runs
// STicks (a parent frame, or the opener) and asks it for this page's chrome.*.
;(function () {
  var KEY = '__STICKS__'
  var host = null
  var frame = window
  for (var depth = 0; depth < 10 && !host; depth++) {
    try {
      if (frame !== window && frame[KEY]) host = frame[KEY]
    } catch (error) {
      break
    }
    if (frame.parent === frame) break
    frame = frame.parent
  }
  if (!host) {
    try {
      if (window.opener && window.opener[KEY]) host = window.opener[KEY]
    } catch (error) {
      host = null
    }
  }
  if (host && typeof host.attachPage === 'function') host.attachPage(window)
  else console.warn('[sticks] this extension page has no STicks host to attach to')
})()
