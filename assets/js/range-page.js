const DOOR_SIZE_OPTIONS_V172=["110 x 596 mm", "140 x 296 mm", "140 x 396 mm", "140 x 446 mm", "140 x 496 mm", "140 x 596 mm", "175 x 296 mm", "175 x 396 mm", "175 x 446 mm", "175 x 496 mm", "175 x 596 mm", "215 x 296 mm", "215 x 396 mm", "215 x 446 mm", "215 x 496 mm", "215 x 596 mm", "283 x 296 mm", "283 x 396 mm", "283 x 446 mm", "283 x 496 mm", "283 x 596 mm", "355 x 296 mm", "355 x 396 mm", "355 x 446 mm", "355 x 496 mm", "355 x 596 mm", "450 x 296 mm", "450 x 396 mm", "450 x 446 mm", "450 x 496 mm", "450 x 596 mm", "570 x 296 mm", "570 x 396 mm", "570 x 446 mm", "570 x 496 mm", "570 x 596 mm", "715 x 296 mm", "715 x 396 mm", "715 x 446 mm", "715 x 496 mm", "715 x 596 mm", "895 x 296 mm", "895 x 396 mm", "895 x 446 mm", "895 x 496 mm", "895 x 596 mm", "1245 x 296 mm", "1245 x 396 mm", "1245 x 446 mm", "1245 x 496 mm", "1245 x 596 mm", "1965 x 296 mm", "1965 x 396 mm", "1965 x 446 mm", "1965 x 496 mm", "1965 x 596 mm"];
const DOOR_PLACEHOLDER_PRICE_V172=49.00;

(function(){
const rangeSlug=(document.body.dataset.rangeSlug||'').toLowerCase();
const d=(window.BKO_RANGE_DATA||{})[rangeSlug],m=document.getElementById('rangePageMount');
if(!d||!m)return;
const e=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[x]));
const isGalleryDoorCutoutV214=x=>{
  const src=String(x?.src||'').toLowerCase();
  const kind=String(x?.kind||x?.type||'').toLowerCase();
  return kind.includes('door')||kind.includes('cutout')||
    /(?:^|[\/_-])(door|cutout|cut-out)(?:[\/_.-]|$)/i.test(src)||
    /normalised-door-cutouts|alternative-door-styles/i.test(src);
};
const gallerySources=new Set();
const rawGal=(d.gallery&&d.gallery.length?d.gallery:[{src:d.hero,colour:''}])
  .filter(x=>x.src)
  .filter(x=>{
    const source=String(x.src).split(/[?#]/)[0].toLowerCase()
      .replace(/-uform(?=\.[^.]+$)/,'');
    if(gallerySources.has(source))return false;
    gallerySources.add(source);
    return true;
  });
const gal=rawGal.filter(x=>!isGalleryDoorCutoutV214(x));
if(!gal.length && d.hero) gal.push({src:d.hero,colour:''});
const first=gal[0]?.src||d.hero||'', firstColour=d.colours?.[0]?.name||'';
const heroColours=(d.exStockColours||d.colours||[]).map(c=>typeof c==='string'?c:c.name).filter(Boolean);
const gc=gal.map((x,i)=>`<button class="range-media-card ${i===0?'is-active':''}" type="button" data-range-media-card data-src="${e(x.src)}" ${x.colour?`data-colour="${e(x.colour)}"`:''}><span class="range-media-image"><img src="${e(x.src)}" alt="${e(d.name)} kitchen${x.colour?' in '+e(x.colour):''}" loading="lazy"></span></button>`).join('');
const exStock=d.exStockColours||d.colours||[];
const paintToOrder=d.paintToOrderColours||[];
const cc=exStock.map(c=>`<div class="colour-option" data-colour-name="${e(c.name)}" data-order-type="ex-stock" ${c.door?`data-door-src="${e(c.door)}"`:''} ${c.hex?`data-door-colour="${e(c.hex)}"`:''} ${c.kitchen?`data-kitchen-src="${e(c.kitchen)}"`:''}><div class="colour-chip" style="background:${c.hex||'#ddd'};${c.swatch?`background-image:url('${c.swatch}');`:''}background-size:cover;background-position:center"></div>${e(c.name)}</div>`).join('');
const sr=(d.specs||[]).map(r=>`<div class="door-spec-row"><span>${e(r[0])}</span><strong>${e(r[1])}</strong></div>`).join('');
m.innerHTML=`<main>
<section class="range-lifestyle-hero"><div class="range-lifestyle-stage"><img data-gallery-main src="${e(first)}" alt="${e(d.name)} kitchen"><div class="container range-hero-content"><div class="range-hero-top"><div class="breadcrumbs"><a href="index.html">Home</a> / <a href="ranges.html">Collections</a> / ${e(d.name)}</div></div><div class="range-hero-bottom"><div class="range-hero-title-block range-hero-title-only"><h1>${e(d.name)}</h1><div class="range-hero-colour-names" data-range-hero-colour-names>${e(heroColours[0]||'')}</div></div></div></div></div></section>
<section class="range-media-gallery"><div class="container"><div class="range-media-head"><div></div><div class="range-media-controls"><button class="range-media-arrow" type="button" data-range-media-prev aria-label="Previous image">←</button><button class="range-media-arrow" type="button" data-range-media-next aria-label="Next image">→</button></div></div><div class="range-media-track" data-range-media-track tabindex="0">${gc}</div></div></section>
<section class="range-intro-strip"><div class="container range-intro-grid"><div class="range-intro-copy"><div class="eyebrow">Kitchen collection</div><h2>${e(d.name)}</h2><p>${d.slug==="chatsworth" ? "Inspired by the simple beauty of classic Shaker design, Chatsworth offers a unique twist by cleverly combining a slim frame with a smooth painted finish to create something truly impeccable. For an ultra-contemporary look, Chatsworth is also available as a true handleless Shaker." : d.slug==="jersey" ? "The quintessentially traditional design of the Jersey door, with its raised centre panel exudes charm and sophistication. Choose from an extensive selection of both standard and made to order accessories to devise a kitchen that is totally unique and special." : d.slug==="matlock" ? "Effortlessly chic, the Matlock shaker range with feature v-grooves makes an impressive statement with its classic detailing and comprehensive accessory selection. Classic in both form and function, Matlock will sit right at home in any sized space to bring you a kitchen that works hard but looks fabulous." : d.slug==="papplewick" ? "Featuring a narrow frame shaker design with subtle bead detail, Papplewick offers remarkable versatility for those seeking stylish living spaces. Choose from a selection of colours that complement its authentic Oak effect foil finish and enjoy the look of a painted timber door at an affordable price." : d.slug==="sherwood-gloss" ? "Make the ultimate contemporary style statement with the chic, handleless design of Sherwood Gloss. Featuring an exceptional mirror-like finish, choose from a selection of on-trend colours to create a stylish space which can extend to other areas beyond the kitchen." : d.slug==="sherwood-matte" ? "A resounding favourite for those seeking a contemporary sanctuary, Sherwood Matte painted offers a silky, durable finish. Coupled with Sherwood’s cutting-edge design and extensive colour options, you have a design that meets your practical needs as well as your aesthetic demands." : d.slug==="wensley" ? "Characterised by the internal moulding surrounding its centre panel, woodgrain finish and extensive choice of accessories, Wensley gives you a variety of options when designing a space to your exact requirements." : d.slug==="knightsbridge" ? "With its v-groove shaker design, woodgrain effect foil finish, and selection of on-trend colours, Knightsbridge offers a stylish and durable solution for kitchens and bedrooms. Designed to meet the demands of everyday living, it combines timeless appeal with long-lasting performance." : d.slug==="oakham-gloss" ? "Visually stunning, Oakham Gloss provides a mirror-like finish that will complement any space it occupies. Available in six trendy shades, this range provides the perfect blank canvas to which you can inject your own personality and style." : d.slug==="oakham-soft-matte" ? "The adaptability of Oakham’s slab design allows for a wealth of possibilities to create the ultimate modern space. The soft-matte foil finish, available in seven popular colours, makes Oakham Soft-Matte the ideal choice for those wanting to achieve a stylish yet practical space." : d.slug==="norwood" ? "With its timeless narrow shaker design, Norwood adds refined character to any home, whether your style is modern or classic. Crafted with a premium matte foil in an authentic woodgrain texture, Norwood blends enduring style with everyday durability." : d.slug==="abbotsbury" ? "The stunning simplicity of the Abbotsbury Shaker door is accentuated by its narrow frame. Its authentic painted woodgrain finish and wealth of accessories makes Abbotsbury an ideal choice for both contemporary and traditional settings." : d.slug==="delamere" ? "Delamere trims the shaker frame down to a narrow, crisp profile and finishes it in smooth painted timber, so it sits comfortably in smaller kitchens without losing the shaker look you're after." : `Explore the ${e(d.name)} collection and available finishes.`}</p></div></div></section>
<section class="section range-door-colour-section"><div class="container range-door-colour-layout"><div class="range-door-left-column">
  <div class="range-door-large">
    <img src="${e(d.defaultDoor)}" alt="${e(d.name)} kitchen door">
  </div>
</div><div class="range-door-copy range-product-panel"><div class="eyebrow">${e(d.collectionLabel)}</div><h2>${e(d.doorTitle)}</h2><p class="range-description">${e(d.description)}</p><div class="range-selected-finish-clean"><span>Selected finish</span><strong data-selected-door-colour>${e(firstColour)}</strong></div>

<div class="range-colour-group ex-stock-group">
  <div class="range-colour-group-head"><div><div class="eyebrow">Quick delivery</div><h3>Ex-stock colours</h3></div><p>${e(d.exStockLeadTime||'Available for next working day delivery')}</p></div>
  <div class="colour-grid">${cc}</div>
</div>
</div></div><div class="container">${d.alternativeDoorStyles?.length?`
<div class="abbotsbury-door-style-strip">
  <div class="abbotsbury-door-style-strip-head">
    <div>
      <div class="eyebrow">Door options</div>
      <h3>Alternative door styles</h3>
    </div>
    <p>Additional door styles available within the ${e(d.name)} collection.</p>
  </div>

  <div class="abbotsbury-door-style-list">
    ${d.alternativeDoorStyles.map(s=>`
      <div class="abbotsbury-door-style-item">
        <div class="abbotsbury-door-style-image">
          <img src="${e(d.alternativeDoorBaseImages?.[s.key]||'')}" alt="${e(s.label)}">
        </div>
        <span>${e(s.label)}</span>
      </div>`).join('')}
  </div>
</div>`:''}

<section class="door-specification"><div class="door-spec-header"><div><div class="eyebrow">Technical details</div><h2>Door specification</h2></div></div>${sr?`<div class="door-spec-table">${sr}</div>`:`<div class="door-spec-placeholder" aria-hidden="true"></div>`}</section>
<div class="range-action-row-clean range-action-row-after-spec">
  <a class="btn red" href="doors.html?range=${encodeURIComponent(d.slug)}">Shop this collection</a>
  <a class="btn" href="catalogue.html?range=${encodeURIComponent(d.slug)}">Shop cabinets</a>
</div>
</div></section>
<section class="section range-shop-section"><div class="container"><div class="section-head"><div><h2>Shop cabinets for this collection</h2><p>Choose the cabinet type you need and continue building your kitchen.</p></div></div><div class="icon-categories">${[['base','Base units'],['drawer','Drawer units'],['wall','Wall units'],['corner','Corner units'],['tall','Tall units'],['housing','Housings']].map(([c,l])=>`<a class="category-tile" href="catalogue.html?range=${encodeURIComponent(d.slug)}&category=${c}"><img src="assets/images/units/${c}.svg" alt="${l}"><b>${l}</b></a>`).join('')}</div></div></section>
</main>`;

const preview=m.querySelector('.range-door-large img');
const opts=[...m.querySelectorAll('.colour-option')];
const hero=m.querySelector('[data-gallery-main]');
const heroColourNames=m.querySelector('[data-range-hero-colour-names]');
let cards=[...m.querySelectorAll('[data-range-media-card]')];
const isDoorGalleryCard=(card)=>{
  const src=(card.dataset.src||card.querySelector('img')?.getAttribute('src')||'').toLowerCase();
  const kind=(card.dataset.kind||card.dataset.type||'').toLowerCase();
  const alt=(card.querySelector('img')?.getAttribute('alt')||'').toLowerCase();
  return kind.includes('door')||kind.includes('cutout')||
    /(?:^|[\/_-])(door|cutout|cut-out)(?:[\/_\-.]|$)/i.test(src)||
    /door cut.?out|door sample|door image/i.test(alt);
};
cards.filter(isDoorGalleryCard).forEach(card=>card.remove());
cards=cards.filter(card=>!isDoorGalleryCard(card));
const track=m.querySelector('[data-range-media-track]');
const prevBtn=m.querySelector('[data-range-media-prev]');
const nextBtn=m.querySelector('[data-range-media-next]');
let activeIndex=0;
let heroToken=0;
let doorTintToken=0;
let colourSyncLocked=false;

hero.style.transition='opacity 160ms ease';

function setHeroImage(src,alt){
  if(!src||!hero)return;
  const token=++heroToken;
  const preload=new Image();
  preload.src=src;

  const swap=()=>{
    if(token!==heroToken)return;
    hero.style.opacity='0.68';
    window.setTimeout(()=>{

      if(token!==heroToken)return;
      hero.src=src;
      if(alt)hero.alt=alt;
      requestAnimationFrame(()=>{ hero.style.opacity='1'; });
    },70);
  };

  if(preload.complete){
    swap();
  }else if(preload.decode){
    preload.decode().then(swap).catch(swap);
  }else{
    preload.onload=swap;
    preload.onerror=swap;
  }
}

function tintKnightsbridgeDoor(colour){
  // Disabled: every finish now uses its own prepared door image.
  return;
}

function centreCard(card,instant=false){
  if(!card||!track)return;
  const target=Math.max(
    0,
    card.offsetLeft - (track.clientWidth-card.offsetWidth)/2
  );
  track.scrollTo({
    left:target,
    behavior:instant?'auto':'smooth'
  });
}

function markCard(index){
  cards.forEach((card,i)=>{
    const selected=i===index;
    card.classList.toggle('is-active',selected);
    card.setAttribute('aria-current',selected?'true':'false');
  });
}

function setSelectedColour(colour,updateKitchen=false){
  if(!colour)return;
  const option=opts.find(o=>
    (o.dataset.colourName||'').toLowerCase()===colour.toLowerCase()
  );
  if(!option)return;

  opts.forEach(o=>o.classList.remove('selected','is-selected'));
  option.classList.add('selected','is-selected');

  const selectedLabel=m.querySelector('[data-selected-door-colour]');
  if(selectedLabel)selectedLabel.textContent=option.dataset.colourName;

  if(option.dataset.doorSrc&&preview){
    preview.dataset.baseSrc=option.dataset.doorSrc;
    preview.src=option.dataset.doorSrc;
    preview.alt=`${d.name} ${option.dataset.colourName} door`;
    preview.style.backgroundColor='transparent';
    preview.style.mixBlendMode='normal';
    preview.style.filter='none';
  }

  if(updateKitchen&&option.dataset.kitchenSrc){
    setHeroImage(
      option.dataset.kitchenSrc,
      `${d.name} kitchen in ${option.dataset.colourName}`
    );
  }
}

function showGallery(index,{syncColour=true,instantScroll=false}={}){
  if(!cards.length)return;

  index=(index+cards.length)%cards.length;
  activeIndex=index;

  const card=cards[index];
  const src=card.dataset.src||card.querySelector('img')?.src||'';
  const colour=card.dataset.colour||'';

  markCard(index);
  centreCard(card,instantScroll);

  if(src){
    setHeroImage(
      src,
      colour ? `${d.name} kitchen in ${colour}` : `${d.name} kitchen`
    );
  }

  if(heroColourNames)heroColourNames.textContent=colour||heroColours[0]||'';

  // If this gallery image represents a selectable finish, arrows also update
  // the matching door cut-out and selected colour. Do not replace the gallery
  // image with another image during this sync.
  if(syncColour&&colour){
    colourSyncLocked=true;
    setSelectedColour(colour,false);
    colourSyncLocked=false;
  }
}


function applyDoorFinish(option,colour){
  if(!preview||!option)return;
  const src=option.dataset.doorSrc||d.defaultDoor||'';
  if(src){
    preview.dataset.baseSrc=src;
    preview.src=src;
    preview.alt=`${d.name} ${colour} door`;
  }
  preview.style.backgroundColor='transparent';
  preview.style.mixBlendMode='normal';
  preview.style.filter='none';
}

function updateAlternativeDoors(colour){
  // Alternative Abbotsbury door styles intentionally remain in their original finish.
  return;
}

function chooseColour(option){
  if(!option)return;
  const colour=option.dataset.colourName||'';
  const orderType=option.dataset.orderType==='paint-to-order'?'paint-to-order':'ex-stock';

  opts.forEach(o=>o.classList.remove('selected','is-selected'));
  option.classList.add('selected','is-selected');

  const selectedLabel=m.querySelector('[data-selected-door-colour]');
  if(selectedLabel)selectedLabel.textContent=colour;
  updateAlternativeDoors(colour);
  const orderTypeLabel=m.querySelector('[data-selected-order-type]');
  const leadTimeLabel=m.querySelector('[data-selected-lead-time]');
  if(orderTypeLabel) orderTypeLabel.textContent=orderType==='paint-to-order'?'Paint to Order':'Ex-stock';
  if(leadTimeLabel) leadTimeLabel.textContent=orderType==='paint-to-order'
    ? (d.paintToOrderLeadTime||'Approx. 15 working days')
    : (d.exStockLeadTime||'Available for next working day delivery');

  applyDoorFinish(option,colour);

  const galleryIndex=cards.findIndex(c=>
    (c.dataset.colour||'').toLowerCase()===colour.toLowerCase()
  );

  if(galleryIndex>=0){
    // Colour selection goes to the exact corresponding gallery slide.
    showGallery(galleryIndex,{syncColour:false});
  }else if(option.dataset.kitchenSrc){
    // Fallback for ranges that have a colour kitchen image but no explicit
    // gallery card for it yet.
    setHeroImage(option.dataset.kitchenSrc,`${d.name} kitchen in ${colour}`);
    if(label){
      label.textContent=colour;
      label.style.display='';
    }
  }
}

cards.forEach((card,index)=>{
  card.type='button';
  card.addEventListener('click',()=>showGallery(index,{syncColour:true}));
});

prevBtn?.addEventListener('click',event=>{
  event.preventDefault();
  event.stopPropagation();
  showGallery(activeIndex-1,{syncColour:true});
});

nextBtn?.addEventListener('click',event=>{
  event.preventDefault();
  event.stopPropagation();
  showGallery(activeIndex+1,{syncColour:true});
});

// Global range-gallery keyboard navigation.
// Left/right work immediately after the range page loads; the user does not
// need to click or focus the gallery first.
document.addEventListener('keydown',event=>{
  if(event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

  const target=event.target;
  const tag=(target?.tagName||'').toLowerCase();
  const isTyping=
    tag==='input' ||
    tag==='textarea' ||
    tag==='select' ||
    target?.isContentEditable;

  if(isTyping) return;

  if(event.key==='ArrowLeft'){
    event.preventDefault();
    showGallery(activeIndex-1,{syncColour:true});
  }else if(event.key==='ArrowRight'){
    event.preventDefault();
    showGallery(activeIndex+1,{syncColour:true});
  }
});

// Arrow keys work when the thumbnail strip itself is focused.
track?.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'){
    event.preventDefault();
    showGallery(activeIndex-1,{syncColour:true});
  }
  if(event.key==='ArrowRight'){
    event.preventDefault();
    showGallery(activeIndex+1,{syncColour:true});
  }
});

opts.forEach(option=>{
  option.setAttribute('role','button');
  option.tabIndex=0;
  option.addEventListener('click',()=>chooseColour(option));
  option.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();
      chooseColour(option);
    }
  });
});

if(firstColour) updateAlternativeDoors(firstColour);

// Initial entry behaviour:
const requested=new URLSearchParams(location.search).get('colour');

if(requested){
  // Arriving from a Collections colour click:
  // load the matching kitchen image, matching door cut-out and selected finish.
  const option=opts.find(o=>
    (o.dataset.colourName||'').toLowerCase()===requested.toLowerCase()
  );

  if(option){
    window.setTimeout(()=>chooseColour(option),30);
  }else if(cards.length){
    // Invalid/missing colour mapping falls safely back to gallery image 1.
    showGallery(0,{syncColour:false,instantScroll:true});
  }
}else{
  // Normal entry into a range:
  // gallery image 1 is now the first colour-linked kitchen image,
  // so initialise the matching image, selected colour and door together.
  if(cards.length){
    showGallery(0,{syncColour:true,instantScroll:true});
  }else if(opts[0]){
    chooseColour(opts[0]);
  }
}
})();
