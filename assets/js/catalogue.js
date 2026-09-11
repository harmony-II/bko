let allProducts=[];
const imageMap={base:'base',drawer:'drawer',corner:'corner',wall:'wall',tall:'tall',housing:'housing',dresser:'dresser'};
const CABINET_ACCESSORY_PRICES={
  cutlery:{300:25.24,400:26.36,500:29.66,600:31.58,800:51.11,900:55.26,1000:63.83}
};
const CABINET_ACCESSORY_DETAILS={
  cutlery:{fit:'Sits inside a compatible drawer and keeps utensils separated.',sizing:'Sized to the cabinet width; tray layout may reduce usable drawer width slightly.'}
};

const CARCASE_OPTIONS=[
  {id:'cashmere',name:'Cashmere',hex:'#c7bdb0',imageId:'light-grey',swatch:'cashmere-egger-u702-st9.jpg'},
  {id:'davenport-oak',name:'Davenport Oak',hex:'#b99568',imageId:'oak',swatch:'davenport-oak-egger-h3368-st19.jpg'},
  {id:'dust-grey',name:'Dust Grey',hex:'#aaa9a4',imageId:'angora-grey',swatch:'dust-grey-egger-u732-st9.jpg'},
  {id:'graphite',name:'Graphite',hex:'#4b4d50',imageId:'graphite',swatch:'graphite-egger-u961-st9.jpg'},
  {id:'grey-bardolino-oak',name:'Grey Bardolino Oak',hex:'#8c8276',imageId:'oak',swatch:'grey-bardolino-oak-egger-h1146-st10.jpg'},
  {id:'light-grey',name:'Light Grey',hex:'#c8c8c4',imageId:'light-grey',swatch:'light-grey-egger-u708-st9.jpg'},
  {id:'lincoln-walnut',name:'Lincoln Walnut',hex:'#695044',imageId:'oak',swatch:'lincoln-walnut-egger-h1714-st19.jpg'},
  {id:'white',name:'White',hex:'#f5f5f2',imageId:'white',swatch:'white-egger-w980-st2.jpg'}
];


const CARCASE_IMAGE_ROOT='assets/images/carcase/';
const CARCASE_SWATCH_ROOT=`${CARCASE_IMAGE_ROOT}Lamtek Carcase Colours/`;
const CARCASE_IMAGE_FILES={
  singleBase:'single-base',
  doubleBase:'double-base',
  drawerBase:'drawer-base',
  underOven:'under-oven',
  splayBase:'splay-base',
  curvedBase:'curved-base-end-560-deep',
  cornerBase:'900-x-900-base',
  cornerCurve:'900-x-900-int-curve',
  cornerDiagonal:'900-x-900-diag',
  singleWall:'single-wall',
  doubleWall:'double-wall',
  splayWall:'splay-wall',
  curvedWall:'curved-wall-end-300-deep',
  hoodWall:'extractor',
  cornerWall:'600-x-600-wall',
  cornerWallDiagonal:'600-x-600-diag',
  tall:'tall-open-end',
  wideTall:'1000-pantry-unit',
  internalTall:'internal-packs',
  splayTall:'splay-larder',
  dresser:'dresser',
  housing:'tall-open-end',
  boilerRails:'boiler-housing-rails',
  boilerTopBottom:'boiler-housing-top-btm'
};

function carcaseImageKey(product){
  const n=(product.name||'').toUpperCase();
  const code=(product.code||'').toUpperCase();
  const w=Number(product.width)||600;

  if(product.category==='base'){
    if(n.includes('BUILT UNDER OVEN')||code==='BU60') return 'underOven';
    if(n.includes('SPLAY')) return 'splayBase';
    if(n.includes('CURVED')) return 'curvedBase';
    return w>600?'doubleBase':'singleBase';
  }

  if(product.category==='drawer') return 'drawerBase';

  if(product.category==='corner'){
    if(n.includes('DIAGONAL CORNER WALL')) return 'cornerWallDiagonal';
    if(n.includes('L CORNER WALL')) return 'cornerWall';
    if(n.includes('CURVED BASE END')) return 'curvedBase';
    if(n.includes('L-SHAPE BASE')) return 'cornerBase';
    return 'cornerBase';
  }

  if(product.category==='wall'){
    if(n.includes('HOOD WALL')) return 'hoodWall';
    if(n.includes('SPLAY')) return 'splayWall';
    if(n.includes('CURVED')) return 'curvedWall';
    return w>600?'doubleWall':'singleWall';
  }

  if(product.category==='dresser') return 'dresser';

  if(product.category==='tall'){
    if(n.includes('INTERNAL SPACE TOWER')) return 'internalTall';
    if(n.includes('SPLAY')) return 'splayTall';
    return w>=900?'wideTall':'tall';
  }

  if(product.category==='housing'){
    if(n.includes('BOILER')&&n.includes('RAIL')) return 'boilerRails';
    if(n.includes('BOILER')) return 'boilerTopBottom';
    return 'housing';
  }

  return 'singleBase';
}

function carcaseImageFor(product){
  const key=carcaseImageKey(product);
  const base=CARCASE_IMAGE_FILES[key]||CARCASE_IMAGE_FILES.singleBase;
  return `${CARCASE_IMAGE_ROOT}${base}.webp`;
}

let kitchenProfile={range:null,colour:null,carcase:null};
let activeCabinet=null;
let activeHinge='';
let pendingRange='';
let pendingColour='';

function getProfile(){
  try{return JSON.parse(localStorage.getItem('bkoKitchenProfile')||'null')||{range:null,colour:null,carcase:null}}
  catch{return {range:null,colour:null,carcase:null}}
}
function saveProfile(){localStorage.setItem('bkoKitchenProfile',JSON.stringify(kitchenProfile));}
function rangeBySlug(slug){const ranges=Array.isArray(window.BKO_RANGES)?window.BKO_RANGES:[];return ranges.find(r=>r.slug===slug);}
function profileComplete(){return Boolean(kitchenProfile.range&&kitchenProfile.colour&&kitchenProfile.carcase);}
function round5(v){return Math.max(0,Math.round(Number(v||0)/5)*5);}
function frontWidth(product,count=1){
  const w=Number(product.width)||600;
  return count>1?Math.max(0,Math.floor((w-6)/count)):Math.max(0,w-3);
}
function sizeText(h,w){return h&&w?`${Math.round(h)} × ${Math.round(w)} mm`:'';}

function initCabinetConfigurator(){
  kitchenProfile=getProfile();
  const params=new URLSearchParams(location.search);
  if(params.get('range')&&rangeBySlug(params.get('range'))){
    if(kitchenProfile.range!==params.get('range')) kitchenProfile.colour=null;
    kitchenProfile.range=params.get('range');
  }
  renderConfigurator();
}

function renderConfigurator(){
  const ranges=Array.isArray(window.BKO_RANGES)?window.BKO_RANGES:[];
  const selectedRange=rangeBySlug(kitchenProfile.range);
  const carcaseGrid=document.getElementById('configCarcaseGrid');

  if(carcaseGrid){
    carcaseGrid.innerHTML=CARCASE_OPTIONS.map(c=>`<button type="button" class="config-carcase-card carcase-visual-choice ${kitchenProfile.carcase===c.id?'selected':''}" data-carcase-choice="${c.id}">
      <span class="carcase-choice-image"><img src="${CARCASE_SWATCH_ROOT}${c.swatch}" alt="${c.name} carcase colour sample"></span>
      <span class="config-carcase-choice-meta"><span>${c.name}</span></span>
    </button>`).join('');
    carcaseGrid.querySelectorAll('[data-carcase-choice]').forEach(btn=>btn.addEventListener('click',()=>{
      kitchenProfile.carcase=btn.dataset.carcaseChoice; saveProfile(); renderConfigurator(); openKitchenProfileModal();
    }));
  }

  const carcase=CARCASE_OPTIONS.find(x=>x.id===kitchenProfile.carcase);
  const carcaseLabel=document.getElementById('selectedCarcaseLabel');
  if(carcaseLabel)carcaseLabel.textContent=carcase?.name||'Choose a finish';

  document.querySelector('[data-config-step="carcase"]')?.classList.toggle('complete',!!kitchenProfile.carcase);

  const ready=document.getElementById('configReady');
  const lock=document.getElementById('catalogueLock');
  const layout=document.getElementById('catalogueLayout');
  if(ready){ready.hidden=!profileComplete(); if(profileComplete())document.getElementById('configReadyText').textContent=`${selectedRange.name} · ${kitchenProfile.colour} · ${carcase.name}`;}
  lock?.classList.toggle('is-hidden',profileComplete());
  layout?.classList.toggle('is-locked',!profileComplete());
  document.querySelector('.cabinet-price-note')?.classList.toggle('is-muted',!profileComplete());
  if(profileComplete()) renderProducts();

}

function ensureKitchenProfileModal(){
  if(document.getElementById('kitchenProfileModal'))return;
  document.body.insertAdjacentHTML('beforeend',`<div class="cabinet-modal" id="kitchenProfileModal" aria-hidden="true">
    <div class="cabinet-modal-backdrop" data-close-profile-modal></div>
    <div class="cabinet-modal-dialog kitchen-profile-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="kitchenProfileModalTitle">
      <button class="cabinet-modal-close" type="button" aria-label="Close" data-close-profile-modal>×</button>
      <div id="kitchenProfileModalContent"></div>
    </div>
  </div>`);
  document.querySelectorAll('[data-close-profile-modal]').forEach(el=>el.addEventListener('click',closeKitchenProfileModal));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeKitchenProfileModal();});
}

function closeKitchenProfileModal(){
  const modal=document.getElementById('kitchenProfileModal'); if(!modal)return;
  modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open');
}

function renderKitchenProfileModal(){
  const ranges=Array.isArray(window.BKO_RANGES)?window.BKO_RANGES:[];
  const range=rangeBySlug(pendingRange)||ranges[0];
  if(!range)return;
  pendingRange=range.slug;
  if(!range.colours.includes(pendingColour)) pendingColour=range.colours[0]||'';
  const carcase=CARCASE_OPTIONS.find(option=>option.id===kitchenProfile.carcase);
  document.getElementById('kitchenProfileModalContent').innerHTML=`<div class="kitchen-profile-modal-grid">
    <section class="cabinet-modal-media">
      <div class="cabinet-modal-image"><img src="${CARCASE_IMAGE_ROOT}${CARCASE_IMAGE_FILES.singleBase}.webp" alt="${carcase?.name||'Selected'} carcase"></div>
      <div class="cabinet-modal-product-code">Your selected carcase</div>
      <h2 id="kitchenProfileModalTitle">${carcase?.name||'Carcase'} finish</h2>
      <p class="cabinet-modal-advice">Now choose the kitchen range and door colour that will be supplied with every cabinet.</p>
    </section>
    <section class="cabinet-modal-options">
      <div class="modal-eyebrow">Configure your kitchen</div>
      <div class="cabinet-option-summary"><span class="option-colour" style="background:${carcase?.hex||'#eee'}"></span><div><small>Carcase finish</small><strong>${carcase?.name||''}</strong><span>Applied to every cabinet</span></div><span class="option-check">✓</span></div>
      <div class="cabinet-option-field"><label for="profileRange">Kitchen range</label><select id="profileRange">${ranges.map(option=>`<option value="${option.slug}" ${option.slug===pendingRange?'selected':''}>${option.name}</option>`).join('')}</select></div>
      <div class="cabinet-option-field"><label for="profileColour">Door colour</label><select id="profileColour">${range.colours.map(colour=>`<option value="${colour}" ${colour===pendingColour?'selected':''}>${colour}</option>`).join('')}</select></div>
      <button class="btn primary cabinet-configure-buy" id="saveKitchenProfile" type="button">View configured cabinets</button>
    </section>
  </div>`;
  document.getElementById('profileRange').addEventListener('change',event=>{pendingRange=event.target.value; pendingColour=''; renderKitchenProfileModal();});
  document.getElementById('profileColour').addEventListener('change',event=>{pendingColour=event.target.value;});
  document.getElementById('saveKitchenProfile').addEventListener('click',()=>{
    kitchenProfile.range=pendingRange; kitchenProfile.colour=pendingColour; saveProfile(); closeKitchenProfileModal(); renderConfigurator();
  });
}

function openKitchenProfileModal(){
  ensureKitchenProfileModal();
  const currentRange=rangeBySlug(kitchenProfile.range);
  const ranges=Array.isArray(window.BKO_RANGES)?window.BKO_RANGES:[];
  pendingRange=currentRange?.slug||ranges[0]?.slug||'';
  pendingColour=currentRange?.colours.includes(kitchenProfile.colour)?kitchenProfile.colour:'';
  renderKitchenProfileModal();
  const modal=document.getElementById('kitchenProfileModal');
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}

function explicitHousingFronts(product){
  const name=(product.name||'').toUpperCase();
  const w=frontWidth(product,1);
  const fronts=[];
  const top=name.match(/(\d+)\s+DOOR\s+TOP/);
  const bottom=name.match(/(\d+)\s+DOOR\s+BTM/);
  const drawers=name.match(/(\d+)\s*X\s*(\d+)\s*DRW\s*BTM/);
  if(top) fronts.push({type:'door',label:'Top housing door',qty:1,height:Number(top[1]),width:w,size:sizeText(Number(top[1]),w)});
  if(bottom) fronts.push({type:'door',label:'Bottom housing door',qty:1,height:Number(bottom[1]),width:w,size:sizeText(Number(bottom[1]),w)});
  if(drawers){
    const qty=Number(drawers[1]); const h=Number(drawers[2]);
    fronts.push({type:'drawer-front',label:'Housing drawer front',qty,height:h,width:w,size:sizeText(h,w)});
  }
  return fronts;
}

function frontDescriptor(product){
  const name=(product.name||'').toUpperCase();
  const code=(product.code||'').toUpperCase();
  const width=Number(product.width)||600;
  const height=Number(product.height)||720;
  const tall=product.category==='tall'||product.category==='housing';
  let fronts=[];
  let hingedDoors=0;

  const addDoor=(qty,label='Door',h=Math.max(0,height-5),w=frontWidth(product,qty))=>{
    if(qty<=0)return;
    fronts.push({type:'door',label,qty,height:h,width:w,size:sizeText(h,w)});
    hingedDoors+=qty;
  };
  const addDrawer=(qty,label='Drawer front',heights=null)=>{
    if(qty<=0)return;
    const w=frontWidth(product,1);
    if(Array.isArray(heights)){
      heights.forEach((h,idx)=>fronts.push({type:'drawer-front',label:`${label} ${idx+1}`,qty:1,height:h,width:w,size:sizeText(h,w)}));
    }else{
      fronts.push({type:'drawer-front',label,qty,height:heights||null,width:w,size:heights?sizeText(heights,w):`${w} mm wide`});
    }
  };

  if(product.category==='housing'){
    const explicit=explicitHousingFronts(product);
    if(explicit.length){
      fronts.push(...explicit);
      hingedDoors=explicit.filter(x=>x.type==='door').reduce((s,x)=>s+x.qty,0);
    }else if(name.includes('FRIDGE FREEZER HOUSING')) addDoor(2,'Fridge/freezer door',round5((height-10)/2),frontWidth(product,1));
  }else{
    const drawerMatch=name.match(/(\d+)\s+DRAWERS?/);
    if(drawerMatch&&!name.includes('DRAWERLINE')){
      const n=Number(drawerMatch[1]);
      let hs=[];
      if(n===2) hs=[283,427];
      else if(n===3) hs=[140,283,283];
      else if(n===4&&name.includes('EQUAL')) hs=[175,175,175,175];
      else if(n===4) hs=[140,140,140,280];
      else if(n===5) hs=[140,140,140,140,140];
      addDrawer(n,'Drawer front',hs);
    } else if(name.includes('DRAWERLINE')){
      addDrawer(1,'Drawerline front',[140]);
      if(product.category==='corner') addDoor(1,'Corner door',570,Math.max(147,Math.min(597,width-303)));
      else addDoor(width>600?2:1,'Door',570,frontWidth(product,width>600?2:1));
    } else if(code==='BU60'||name.includes('BUILT UNDER OVEN')){
      // Appliance opening; no furniture front.
    } else if(name.includes('L-SHAPE')||name.includes('L CORNER')){
      addDoor(2,'Corner door',height-5,297);
    } else if(product.category==='corner'){
      // Corner cabinet openings are not the full carcase width. Use a standard opening front
      // and flag it as subject to handing/technical confirmation.
      addDoor(1,'Corner door',height-5,Math.min(597,Math.max(297,width-503)));
      fronts[fronts.length-1].technicalNote='Final corner front width depends on cabinet handing.';
    } else if(product.category==='tall'){
      const count=width>600?4:2;
      const perSide=width>600?2:1;
      const fw=frontWidth(product,perSide);
      const usable=height-10;
      let topH,bottomH;
      if(name.includes('50/50')){topH=round5(usable/2);bottomH=round5(usable-topH);}
      else {topH=round5(usable*0.7);bottomH=round5(usable-topH);}
      if(width>600){
        fronts.push({type:'door',label:'Upper tall door',qty:2,height:topH,width:fw,size:sizeText(topH,fw)});
        fronts.push({type:'door',label:'Lower tall door',qty:2,height:bottomH,width:fw,size:sizeText(bottomH,fw)});
        hingedDoors=4;
      }else{
        fronts.push({type:'door',label:'Upper tall door',qty:1,height:topH,width:fw,size:sizeText(topH,fw)});
        fronts.push({type:'door',label:'Lower tall door',qty:1,height:bottomH,width:fw,size:sizeText(bottomH,fw)});
        hingedDoors=2;
      }
    } else if(product.category==='dresser'){
      addDoor(width>600?2:1,'Dresser door',height-5,frontWidth(product,width>600?2:1));
    } else {
      addDoor(width>600?2:1,'Door',height-5,frontWidth(product,width>600?2:1));
    }
  }

  const hingePerDoor=tall?3:2;
  const hinges=hingedDoors*hingePerDoor;
  const accessories=[];
  if(hinges) accessories.push({type:'hinges',label:'Soft-close hinges',qty:hinges,size:'Standard concealed hinge'});
  const drawerQty=fronts.filter(x=>x.type==='drawer-front').reduce((s,x)=>s+x.qty,0);
  if(drawerQty) accessories.push({type:'drawer-system',label:'Drawer system / runners',qty:drawerQty,size:'Sized to cabinet width'});
  if(name.includes('INCLUDING SHELVING')) accessories.push({type:'shelving',label:'Internal shelving set',qty:1,size:'Sized to cabinet'});
  if(name.includes('INTERNAL SPACE TOWER')) accessories.push({type:'internal-storage',label:'Internal storage tower set',qty:1,size:'Sized to cabinet'});
  return {fronts,hinges,hingedDoors,accessories};
}

function configuredPackage(product,hingePosition='',selectedAccessory=null){
  const range=rangeBySlug(kitchenProfile.range);
  const carcase=CARCASE_OPTIONS.find(x=>x.id===kitchenProfile.carcase);
  const parts=frontDescriptor(product);
  if(selectedAccessory)parts.accessories.push({type:selectedAccessory.type,code:selectedAccessory.code,label:selectedAccessory.label,price:selectedAccessory.price,qty:1,size:`Sized for ${product.width} mm cabinet`});
  return {
    type:'configured-cabinet',
    ...product,
    name:productDisplayName(product),
    price:Number(product.price)+(Number(selectedAccessory?.price)||0),
    configuration:{
      range:kitchenProfile.range,
      rangeName:range?.name||'',
      doorColour:kitchenProfile.colour,
      carcase:kitchenProfile.carcase,
      carcaseName:carcase?.name||'',
      hingePosition:hingePosition||'',
      assembly:'Rigid built',
      fronts:parts.fronts,
      accessories:parts.accessories,
      hinges:parts.hinges
    }
  };
}

function cabinetAccessoryOptions(product){
  if(!['base','drawer'].includes(product.category))return [];
  const width=Number(product.width);
  const options=[];
  [['cutlery','Cutlery tray']].forEach(([type,label])=>{
    const price=CABINET_ACCESSORY_PRICES[type][width];
    if(price)options.push({type,code:`${type}-${width}`,label:`${width}mm ${label}`,price,...CABINET_ACCESSORY_DETAILS[type],sizing:`${width} mm cabinet width · ${CABINET_ACCESSORY_DETAILS[type].sizing}`});
  });
  return options;
}

function productDisplayName(product){
  return String(product.name||'').toLowerCase().replace(/\b\w/g,letter=>letter.toUpperCase()).replace(/\bPan\b/g,'Deep').replace(/\bShallow\b/g,'Standard').replace(/\bBtm\b/g,'Bottom');
}

function productDescription(product){
  const width=Number(product.width)||0;
  const descriptions={
    base:`A ${width} mm wide base cabinet for everyday kitchen storage.`,
    drawer:`A ${width} mm wide base cabinet with built-in drawers for easy access to kitchen essentials.`,
    corner:'A corner cabinet designed to make the most of awkward kitchen space.',
    wall:`A ${width} mm wide wall cabinet for keeping everyday items close at hand.`,
    tall:'A full-height cabinet for storing food, appliances or larger kitchen items.',
    housing:'A tall cabinet designed to house a kitchen appliance.',
    dresser:'A wide dresser cabinet for extra storage and display space.'
  };
  return descriptions[product.category]||'A practical kitchen cabinet made to fit your chosen kitchen layout.';
}

function componentSummary(product){
  const parts=frontDescriptor(product);
  const rows=[...parts.fronts,...parts.accessories];
  if(!rows.length)return '<span class="component-pill">No furniture front required</span>';
  return rows.slice(0,4).map(x=>`<span class="component-pill"><b>${x.qty}×</b> ${x.label}${x.size?` · ${x.size}`:''}</span>`).join('');
}

function modalComponentRows(product,selectedAccessory=null){
  const range=rangeBySlug(kitchenProfile.range);
  const parts=frontDescriptor(product);
  const rows=[{
    label:'Rigid carcase',size:`${product.height} × ${product.width} × ${product.depth} mm`,qty:1,pricing:BKO.money(product.price),kind:'carcase'
  }];
  parts.fronts.forEach(front=>rows.push({
    label:`${range?.name||''} ${front.type==='drawer-front'?'drawer front':'door'} · ${kitchenProfile.colour}`,
    size:front.size||'Configured to suit',qty:front.qty,pricing:'Door price pending',kind:'front',note:front.technicalNote||''
  }));
  parts.accessories.forEach(part=>rows.push({label:part.label,size:part.size||'Configured to suit',qty:part.qty,pricing:'Configured',kind:'accessory'}));
  if(selectedAccessory)rows.push({label:selectedAccessory.label,size:selectedAccessory.sizing,qty:1,pricing:BKO.money(selectedAccessory.price),kind:'accessory',note:selectedAccessory.description});
  return rows;
}

function hingeChoiceFor(product){
  const parts=frontDescriptor(product);
  const hinged=parts.hingedDoors;
  if(!hinged) return {required:false,label:'Not required',options:[]};
  if(hinged===1) return {required:true,label:'Choose hinge position',options:['Left hinged','Right hinged']};
  if(product.category==='corner') return {required:true,label:'Choose corner handing',options:['Left hand','Right hand']};
  if(product.category==='tall'&&Number(product.width)<=600) return {required:true,label:'Choose hinge position',options:['Left hinged','Right hinged']};
  return {required:false,label:'Paired doors / fixed handing',options:[]};
}

function ensureCabinetModal(){
  if(document.getElementById('cabinetModal'))return;
  document.body.insertAdjacentHTML('beforeend',`<div class="cabinet-modal" id="cabinetModal" aria-hidden="true">
    <div class="cabinet-modal-backdrop" data-close-cabinet-modal></div>
    <div class="cabinet-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="cabinetModalTitle">
      <button class="cabinet-modal-close" type="button" aria-label="Close" data-close-cabinet-modal>×</button>
      <div id="cabinetModalContent"></div>
    </div>
  </div>`);
  document.querySelectorAll('[data-close-cabinet-modal]').forEach(el=>el.addEventListener('click',closeCabinetModal));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeCabinetModal();});
}

function closeCabinetModal(){
  const modal=document.getElementById('cabinetModal'); if(!modal)return;
  modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open');
}

function openCabinetModal(product){
  ensureCabinetModal();
  activeCabinet=product; activeHinge='';
  const modal=document.getElementById('cabinetModal');
  const content=document.getElementById('cabinetModalContent');
  const range=rangeBySlug(kitchenProfile.range);
  const carcase=CARCASE_OPTIONS.find(x=>x.id===kitchenProfile.carcase);
  const hinge=hingeChoiceFor(product);
  const accessoryOptions=cabinetAccessoryOptions(product);
  let selectedAccessory=null;
  const rows=modalComponentRows(product);
  const componentsHtml=rows.map(row=>`<tr>
      <td><strong>${row.label}</strong>${row.note?`<small>${row.note}</small>`:''}</td>
      <td>${row.size}</td><td>${row.qty}</td><td class="component-pricing ${row.kind==='carcase'?'is-price':''}">${row.pricing}</td>
    </tr>`).join('');

  content.innerHTML=`<div class="cabinet-modal-grid">
    <section class="cabinet-modal-media">
      <div class="cabinet-modal-image"><img src="${carcaseImageFor(product)}" alt="Illustration of ${productDisplayName(product)}"></div>
      <div class="cabinet-modal-product-code">${product.code}</div>
      <h2 id="cabinetModalTitle">${productDisplayName(product)}</h2>
      <p class="cabinet-modal-advice">${productDescription(product)}</p>
      <div class="cabinet-modal-dimensions"><strong>Dimensions</strong><span>Height: ${product.height} mm</span><span>Width: ${product.width} mm</span><span>Depth: ${product.depth} mm</span></div>
      <p class="cabinet-modal-advice">This cabinet will be factory configured to your selected kitchen specification. Final technical sizes should be checked before production.</p>
    </section>
    <section class="cabinet-modal-options">
      <div class="modal-eyebrow">Configure your cabinet</div>
      <div class="cabinet-option-summary"><span class="option-colour" style="background:${colourHex[kitchenProfile.colour]||'#ddd'}"></span><div><small>Door style &amp; colour</small><strong>${range?.name||''}</strong><span>${kitchenProfile.colour}</span></div><span class="option-check">✓</span></div>
      <div class="cabinet-option-summary"><span class="option-colour" style="background:${carcase?.hex||'#eee'}"></span><div><small>Carcase colour</small><strong>${carcase?.name||''}</strong><span>Applied to this cabinet</span></div><span class="option-check">✓</span></div>
      <div class="cabinet-option-field ${hinge.required?'':'is-static'}">
        <label for="modalHingeSelect">Hinge position</label>
        ${hinge.required?`<select id="modalHingeSelect"><option value="">${hinge.label}</option>${hinge.options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select>`:`<div class="static-option">${hinge.label}</div>`}
      </div>
      ${accessoryOptions.length?`<div class="cabinet-option-field"><label for="modalAccessorySelect">Cutlery tray</label><select id="modalAccessorySelect"><option value="">No cutlery tray</option>${accessoryOptions.map(option=>`<option value="${option.code}">${option.label} · ${BKO.money(option.price)}</option>`).join('')}</select><div class="cabinet-accessory-detail" id="modalAccessoryDetail">Choose a cutlery tray to add it to this cabinet. Options are matched to the cabinet width.</div></div>`:''}
      <div class="cabinet-option-field is-static"><label>Assembly</label><div class="static-option">Rigid built · factory assembled</div></div>
      <button type="button" class="show-components-toggle" id="showComponentsToggle" aria-expanded="false">Show components <span>＋</span></button>
      <div class="cabinet-components-panel" id="cabinetComponentsPanel" hidden>
        <div class="components-table-wrap"><table class="components-table"><thead><tr><th>Included component</th><th>Size</th><th>Qty</th><th>Pricing</th></tr></thead><tbody id="cabinetComponentsBody">${componentsHtml}</tbody></table></div>
        <p class="components-note">Front sizes are generated from the cabinet specification. Corner and specialist units should be technically confirmed before manufacture.</p>
      </div>
      <div class="cabinet-modal-total"><span>Cabinet price</span><strong id="cabinetModalTotal">${BKO.money(product.price)}</strong><small>inc VAT · door/front pricing shown separately when connected</small></div>
      <button class="btn primary cabinet-configure-buy" id="modalAddCabinet" type="button">Add configured cabinet</button>
    </section>
  </div>`;

  const select=document.getElementById('modalHingeSelect');
  if(select) select.addEventListener('change',()=>{activeHinge=select.value;select.classList.toggle('has-value',!!select.value);});
  const accessorySelect=document.getElementById('modalAccessorySelect');
  const accessoryDetail=document.getElementById('modalAccessoryDetail');
  const updateAccessory=()=>{
    selectedAccessory=accessoryOptions.find(option=>option.code===accessorySelect?.value)||null;
    const accessoryRows=modalComponentRows(product,selectedAccessory).map(row=>`<tr><td><strong>${row.label}</strong>${row.note?`<small>${row.note}</small>`:''}</td><td>${row.size}</td><td>${row.qty}</td><td class="component-pricing ${row.kind==='carcase'?'is-price':''}">${row.pricing}</td></tr>`).join('');
    const body=document.getElementById('cabinetComponentsBody'); if(body)body.innerHTML=accessoryRows;
    const total=document.getElementById('cabinetModalTotal'); if(total)total.textContent=BKO.money(Number(product.price)+(Number(selectedAccessory?.price)||0));
    if(accessoryDetail)accessoryDetail.innerHTML=selectedAccessory?`<strong>${selectedAccessory.label}</strong><span>${selectedAccessory.fit}</span><small>${selectedAccessory.sizing}</small>`:'Choose a cutlery tray to add it to this cabinet. Options are matched to the cabinet width.';
  };
  accessorySelect?.addEventListener('change',updateAccessory);
  const toggle=document.getElementById('showComponentsToggle');
  const panel=document.getElementById('cabinetComponentsPanel');
  toggle.addEventListener('click',()=>{
    const open=panel.hidden; panel.hidden=!open; toggle.setAttribute('aria-expanded',String(open));
    toggle.innerHTML=`${open?'Hide':'Show'} components <span>${open?'−':'＋'}</span>`;
  });
  document.getElementById('modalAddCabinet').addEventListener('click',()=>{
    if(hinge.required&&!activeHinge){
      select?.classList.add('needs-attention'); select?.focus(); return;
    }
    BKO.addToBasket(configuredPackage(product,activeHinge,selectedAccessory));
    const btn=document.getElementById('modalAddCabinet'); btn.textContent='Added to basket ✓';
    setTimeout(()=>closeCabinetModal(),700);
  });

  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
}

async function loadCatalogue(){
 const res=await fetch('assets/data/cabinet-products.json'); allProducts=await res.json(); if(profileComplete())renderProducts();
}
function renderProducts(){
 const grid=document.querySelector('#productGrid'); const count=document.querySelector('#resultCount');
 if(!profileComplete()){if(grid)grid.innerHTML='';if(count)count.textContent='Complete your kitchen specification above';return;}
 const q=(document.querySelector('#search')?.value||'').toLowerCase();
 const cat=document.querySelector('#category')?.value||'all';
 const width=document.querySelector('#width')?.value||'all';
 const sort=document.querySelector('#sort')?.value||'code';
 let rows=allProducts.filter(p=>(cat==='all'||p.category===cat)&&(width==='all'||String(p.width)===width)&&(!q||`${p.code} ${p.name}`.toLowerCase().includes(q)));
 rows.sort((a,b)=>sort==='price-low'?a.price-b.price:sort==='price-high'?b.price-a.price:sort==='width'?a.width-b.width:String(a.code).localeCompare(String(b.code)));
 if(count)count.textContent=`${rows.length} configured cabinets`;
 const range=rangeBySlug(kitchenProfile.range); const carcase=CARCASE_OPTIONS.find(x=>x.id===kitchenProfile.carcase);
 grid.innerHTML=rows.map((p,i)=>`<article class="product-card configured-product-card" data-configure-card="${i}" tabindex="0" role="button" aria-label="Configure ${productDisplayName(p)}">
   <div class="image"><img src="${carcaseImageFor(p)}" alt="Illustration of ${productDisplayName(p)}"></div>
   <div class="body">
    <div class="code">${p.code}</div><h3>${productDisplayName(p)}</h3>
     <div class="dimensions">H ${p.height} × W ${p.width} × D ${p.depth} mm</div>
     <div class="configured-with"><span>${range.name}</span><span>${kitchenProfile.colour}</span><span>${carcase.name} carcase</span></div>
     <div class="auto-components"><small>Automatically configured with</small><div>${componentSummary(p)}</div></div>
     <div class="price">${BKO.money(p.price)}<small>inc VAT · cabinet price</small></div>
     <button class="btn primary" data-configure="${i}" type="button">Configure cabinet</button>
   </div></article>`).join('');
 const openAt=index=>openCabinetModal(rows[Number(index)]);
 grid.querySelectorAll('[data-configure]').forEach(b=>b.addEventListener('click',event=>{event.stopPropagation();openAt(b.dataset.configure);}));
 grid.querySelectorAll('[data-configure-card]').forEach(card=>{
   card.addEventListener('click',()=>openAt(card.dataset.configureCard));
   card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openAt(card.dataset.configureCard);}});
 });
}

document.addEventListener('DOMContentLoaded',()=>{
 ['search','category','width','sort'].forEach(id=>document.getElementById(id)?.addEventListener(id==='search'?'input':'change',renderProducts));
 initCabinetConfigurator(); loadCatalogue(); ensureCabinetModal();
 const params=new URLSearchParams(location.search);if(params.get('category')){const s=document.getElementById('category');if(s)s.value=params.get('category');}
});
