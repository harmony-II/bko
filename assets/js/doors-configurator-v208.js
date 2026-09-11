(() => {
  const data = window.BKO_RANGE_DATA || {};
  const PRICE = 49;
  const sizes = ["110 x 596 mm", "140 x 296 mm", "140 x 396 mm", "140 x 446 mm", "140 x 496 mm", "140 x 596 mm", "175 x 296 mm", "175 x 396 mm", "175 x 446 mm", "175 x 496 mm", "175 x 596 mm", "215 x 296 mm", "215 x 396 mm", "215 x 446 mm", "215 x 496 mm", "215 x 596 mm", "283 x 296 mm", "283 x 396 mm", "283 x 446 mm", "283 x 496 mm", "283 x 596 mm", "355 x 296 mm", "355 x 396 mm", "355 x 446 mm", "355 x 496 mm", "355 x 596 mm", "450 x 296 mm", "450 x 396 mm", "450 x 446 mm", "450 x 496 mm", "450 x 596 mm", "570 x 296 mm", "570 x 396 mm", "570 x 446 mm", "570 x 496 mm", "570 x 596 mm", "715 x 296 mm", "715 x 396 mm", "715 x 446 mm", "715 x 496 mm", "715 x 596 mm", "895 x 296 mm", "895 x 396 mm", "895 x 446 mm", "895 x 496 mm", "895 x 596 mm", "1245 x 296 mm", "1245 x 396 mm", "1245 x 446 mm", "1245 x 496 mm", "1245 x 596 mm", "1965 x 296 mm", "1965 x 396 mm", "1965 x 446 mm", "1965 x 496 mm", "1965 x 596 mm"];

  const rangeSel = document.getElementById('doorConfigRangeV208');
  const colourSel = document.getElementById('doorConfigColourV208');
  const typeSel = document.getElementById('doorConfigTypeV208');
  const sizeSel = document.getElementById('doorConfigSizeV208');
  const qtyInput = document.getElementById('doorConfigQtyV208');
  const preview = document.getElementById('doorConfigPreviewV208');
  const price = document.getElementById('doorConfigPriceV208');
  const selectedLabel = document.getElementById('doorConfigSelectedRangeV208');
  const addButton = document.getElementById('doorConfigAddV208');
  const section = document.getElementById('doorConfiguratorV208');

  if (!rangeSel || !colourSel || !typeSel || !sizeSel || !preview) return;

  const ranges = Object.values(data)
    .filter(r => r && r.slug && r.name)
    .sort((a,b) => a.name.localeCompare(b.name));

  const esc = s => String(s ?? '');

  ranges.forEach(r => {
    const o = document.createElement('option');
    o.value = r.slug;
    o.textContent = r.name;
    rangeSel.appendChild(o);
  });

  sizes.forEach(s => {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = s;
    sizeSel.appendChild(o);
  });

  function currentRange() {
    return data[rangeSel.value] || ranges[0];
  }

  function populateRange(keepColour=false) {
    const r = currentRange();
    if (!r) return;
    selectedLabel.textContent = r.name;

    const priorColour = keepColour ? colourSel.value : '';
    colourSel.innerHTML = '';
    const colours = r.exStockColours || r.colours || [];
    colours.forEach(c => {
      const o = document.createElement('option');
      o.value = c.name;
      o.textContent = c.name;
      colourSel.appendChild(o);
    });
    if (priorColour && colours.some(c => c.name === priorColour)) colourSel.value = priorColour;

    typeSel.innerHTML = '';
    const types = r.alternativeDoorStyles?.length
      ? r.alternativeDoorStyles
      : [{key:'standard',label:'Standard door'}];
    types.forEach(t => {
      const o = document.createElement('option');
      o.value = t.key || 'standard';
      o.textContent = t.label || 'Standard door';
      typeSel.appendChild(o);
    });

    syncPreview();
    syncUrl();
  }

  function syncPreview() {
    const r = currentRange();
    if (!r) return;
    const colours = r.exStockColours || r.colours || [];
    const c = colours.find(x => x.name === colourSel.value) || colours[0];
    const src = c?.door || r.defaultDoor || '';
    preview.src = src;
    preview.alt = `${r.name} ${colourSel.value || ''} kitchen door`;
    syncPrice();
  }

  function syncPrice() {
    const qty = Math.max(1, parseInt(qtyInput.value || '1',10));
    price.textContent = `£${(PRICE * qty).toFixed(2)}`;
  }

  function syncUrl() {
    const u = new URL(location.href);
    u.searchParams.set('range', rangeSel.value);
    history.replaceState(null, '', u);
  }

  rangeSel.addEventListener('change', () => populateRange(false));
  colourSel.addEventListener('change', syncPreview);
  typeSel.addEventListener('change', syncPrice);
  sizeSel.addEventListener('change', syncPrice);
  qtyInput.addEventListener('input', syncPrice);

  document.querySelectorAll('.doors-range-card').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      const href = card.getAttribute('href') || '';
      const m = href.match(/range-([a-z0-9-]+)\.html/i);
      if (!m || !data[m[1]]) return;
      rangeSel.value = m[1];
      populateRange(false);
      section.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  addButton?.addEventListener('click', () => {
    const r = currentRange();
    const qty = Math.max(1, parseInt(qtyInput.value || '1',10));
    const payload = {
      type:'door',
      code:`DOOR-${r?.slug||'custom'}-${sizeSel.value}`,
      name:`${r?.name||''} ${colourSel.value} ${typeSel.value} door`,
      price:PRICE,
      qty,
      kind:'door',
      range:r?.slug,
      rangeName:r?.name,
      colour:colourSel.value,
      doorType:typeSel.value,
      size:sizeSel.value,
      quantity:qty,
      unitPrice:PRICE
    };
    const basket = JSON.parse(localStorage.getItem('bkoBasket') || '[]');
    basket.push(payload);
    localStorage.setItem('bkoBasket', JSON.stringify(basket));
    addButton.textContent = 'Added to basket';
    setTimeout(() => addButton.textContent = 'Add door to basket', 1200);
  });

  const requested = new URLSearchParams(location.search).get('range');
  const initial = requested && data[requested] ? requested : (ranges[0]?.slug || '');
  rangeSel.value = initial;
  populateRange(false);

  if (requested && data[requested]) {
    setTimeout(() => section.scrollIntoView({block:'start'}), 30);
  }
})();
