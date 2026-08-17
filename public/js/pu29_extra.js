// pu29_extra.js - adds click handler for Шаг остряка header
document.addEventListener('DOMContentLoaded', function() {
  // Find the header cell containing 'Шаг остряка'
  const ths = document.querySelectorAll('th .v-text');
  ths.forEach(function(vtext) {
    if (vtext.textContent.trim() === 'Шаг остряка') {
      const th = vtext.closest('th');
      if (th) {
        th.classList.add('hotspot-th');
        th.style.cursor = 'pointer';
        th.onclick = function() {
          window.showPU29VisualAid('Шаг остряка', '...', '152-158');
        };
      }
    }
  });
});
