const path = require('path');

function spaFallback(staticDir) {
  return (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  };
}

module.exports = { spaFallback };
