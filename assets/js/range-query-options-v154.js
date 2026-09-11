
(() => {
  const params = new URLSearchParams(location.search);
  const colour = params.get('colour');
  if (!colour) return;

  const attempt = () => {
    const options = [...document.querySelectorAll('[data-colour-name], .colour-option')];
    const target = options.find(el => {
      const name = el.dataset.colourName || el.textContent.trim();
      return name.toLowerCase() === colour.toLowerCase();
    });
    if (target) target.click();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(attempt, 50));
  } else {
    setTimeout(attempt, 50);
  }
})();
