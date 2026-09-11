
const BKO = {
  money: v => new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(Number(v)||0),
  getBasket(){ try{return JSON.parse(localStorage.getItem('bkoBasket')||'[]')}catch{return[]} },
  setBasket(items){ localStorage.setItem('bkoBasket',JSON.stringify(items)); this.updateBasketCount(); },
  updateBasketCount(){
    const count=this.getBasket().reduce((sum,item)=>sum+(Number(item.qty)||1),0);
    document.querySelectorAll('[data-basket-count]').forEach(el=>el.textContent=count);
  },
  basketKey(product){
    const config=product?.configuration||{};
    return [
      product?.type||'',
      product?.code||'',
      product?.name||'',
      config.range||'',
      config.doorColour||'',
      config.carcase||'',
      config.hingePosition||'',
      config.assembly||''
    ].join('|');
  },
  addToBasket(product){
    const basket=this.getBasket();
    const key=this.basketKey(product);
    const hit=basket.find(x=>(x.key||this.basketKey(x))===key);
    if(hit){
      hit.key=key;
      hit.qty=(Number(hit.qty)||1)+1;
    }else{
      basket.push({...product,key,qty:1});
    }
    this.setBasket(basket);
  },
  setBasketQty(index,qty){
    const basket=this.getBasket();
    if(index<0||index>=basket.length) return;
    const next=Math.max(0,Math.floor(Number(qty)||0));
    if(next<=0) basket.splice(index,1);
    else basket[index].qty=next;
    this.setBasket(basket);
  },
  changeBasketQty(index,delta){
    const basket=this.getBasket();
    if(index<0||index>=basket.length) return;
    const current=Math.max(1,Number(basket[index].qty)||1);
    this.setBasketQty(index,current+Number(delta||0));
  },
  removeBasketItem(index){
    const basket=this.getBasket();
    if(index<0||index>=basket.length) return;
    basket.splice(index,1);
    this.setBasket(basket);
  },
  saveUser(email){ localStorage.setItem('bkoUser',JSON.stringify({email,loggedIn:true})); },
  user(){ try{return JSON.parse(localStorage.getItem('bkoUser')||'null')}catch{return null} },

  initAnnouncementBar(){
    const bar=document.querySelector('.top-strip');
    if(!bar) return;

    const messages=[
      'Cabinets delivered in as little as 2 weeks',
      'Nationwide delivery available',
      'Premium rigid-built kitchen cabinets',
      'Browse, design and order online'
    ];

    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index=0;
    let timer=null;

    bar.innerHTML=`<div class="announcement-viewport" aria-live="polite"><div class="announcement-track"><div class="announcement-message is-current">${messages[0]}</div></div></div>`;
    const track=bar.querySelector('.announcement-track');

    const schedule=()=>{
      window.clearTimeout(timer);
      timer=window.setTimeout(nextMessage,3200);
    };

    function nextMessage(){
      const current=track.querySelector('.announcement-message.is-current');
      index=(index+1)%messages.length;

      if(reduceMotion){
        current.textContent=messages[index];
        schedule();
        return;
      }

      const next=document.createElement('div');
      next.className='announcement-message is-next';
      next.textContent=messages[index];
      track.appendChild(next);

      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        current.classList.add('slide-out');
        next.classList.add('slide-in');
      }));

      window.setTimeout(()=>{
        current.remove();
        next.className='announcement-message is-current';
        schedule();
      },620);
    }

    schedule();
  },
  initNavigation(){
    const toggle=document.querySelector('.menu-toggle');
    const nav=document.getElementById('siteNav');
    if(toggle&&nav){
      toggle.addEventListener('click',()=>{
        const open=nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded',String(open));
      });
      nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
        if(window.innerWidth<=860){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}
      }));
    }
  },
  initSiteSearch(){
    const header=document.querySelector('.site-header');
    if(!header||document.querySelector('.site-search')) return;

    const pages=[
      ['index.html','Home','kitchens rigid kitchens online delivery'],
      ['ranges.html','Kitchen collections','collections ranges kitchen styles colours'],
      ['catalogue.html','Kitchen units','cabinets units cupboards kitchen storage fittings drawers trays hinges'],
      ['doors.html','Kitchen doors','doors colours finishes'],
      ['handles.html','Handles','handles knobs pulls'],
      ['worktops.html','Worktops','worktops countertops'],
      ['sinks-taps.html','Sinks and taps','sinks taps kitchen'],
      ['appliances.html','Appliances','ovens appliances kitchen'],
      ['builder.html','Design your kitchen','builder design kitchen'],
      ['planner.html','Kitchen planner','planner layout kitchen'],
      ['delivery.html','Delivery','delivery lead times nationwide'],
      ['help.html','Help centre','help faqs support'],
      ['contact.html','Contact','contact support'],
      ['trade.html','Trade accounts','trade business accounts'],
      ['login.html','Login','login account'],
      ['register.html','Create an account','register account'],
      ['account.html','My account','account saved kitchens'],
      ['basket.html','Basket','basket order'],
      ['dashboard.html','Dashboard','dashboard kitchens'],
      ['range-abbotsbury.html','Abbotsbury','slim shaker porcelain taupe graphite'],
      ['range-chatsworth.html','Chatsworth','shaker handleless kitchen'],
      ['range-delamere.html','Delamere','shaker kitchen'],
      ['range-jersey.html','Jersey','traditional raised panel kitchen'],
      ['range-knightsbridge.html','Knightsbridge','classic contemporary kitchen'],
      ['range-matlock.html','Matlock','v-groove shaker kitchen'],
      ['range-norwood.html','Norwood','foil shaker kitchen'],
      ['range-oakham-gloss.html','Oakham Gloss','gloss kitchen'],
      ['range-oakham-soft-matte.html','Oakham Soft Matte','matte kitchen'],
      ['range-papplewick.html','Papplewick','beaded shaker kitchen'],
      ['range-sherwood-gloss.html','Sherwood Gloss','handleless gloss kitchen'],
      ['range-sherwood-matte.html','Sherwood Matte','painted matte kitchen'],
      ['range-wensley.html','Wensley','kitchen range']
    ].map(([url,title,keywords])=>({url,title,keywords,content:`${title} ${keywords}`}));

    const wrap=document.createElement('div');
    const dock=document.createElement('div');
    dock.className='site-search-dock';
    wrap.className='site-search';
    wrap.innerHTML='<label class="sr-only" for="siteSearchInput">Search the website</label><input id="siteSearchInput" type="search" placeholder="Search" autocomplete="off" aria-expanded="false" aria-controls="siteSearchResults"><div class="site-search-results" id="siteSearchResults" role="listbox"></div>';
    dock.append(wrap);
    header.after(dock);

    const input=wrap.querySelector('input');
    const results=wrap.querySelector('.site-search-results');
    const normalize=value=>String(value||'').toLowerCase().replace(/\s+/g,' ').trim();
    const searchPages=pages.map(page=>({...page,content:normalize(page.content)}));
    let indexReady=false;
    let indexPromise=null;

    const loadPageContent=()=>{
      if(indexPromise) return indexPromise;
      indexPromise=Promise.all([
        ...pages.map(async page=>{
          try{
            const response=await fetch(page.url,{cache:'force-cache'});
            if(!response.ok) return;
            const html=await response.text();
            const doc=new DOMParser().parseFromString(html,'text/html');
            const main=doc.querySelector('main')||doc.body;
            const text=normalize(`${doc.title} ${doc.querySelector('meta[name="description"]')?.content||''} ${main.textContent||''}`);
            const target=searchPages.find(item=>item.url===page.url);
            if(target) target.content=text;
          }catch{}
        }),
        fetch('assets/js/range-data.js',{cache:'force-cache'}).then(response=>response.text()).then(text=>{
          const data=JSON.parse(text.replace(/^window\.BKO_RANGE_DATA\s*=\s*/,'').replace(/;\s*$/,''));
          Object.values(data).forEach(range=>{
            const target=searchPages.find(page=>page.url===`range-${range.slug}.html`);
            if(target){
              target.image=range.hero||'';
              const colours=(range.colours||[]).map(colour=>colour.name).join(' ');
              const images=[range.hero,...(range.gallery||[]).map(image=>image.src)].filter(Boolean);
              const imageNames=[...new Set(images)].map(src=>src.split('/').pop().replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ')).join(' ');
              target.content=normalize(`${target.content} ${range.name} ${range.description||''} ${colours} ${imageNames}`);
              [...new Set(images)].forEach(src=>{
                const imageName=src.split('/').pop().replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ');
                searchPages.push({
                  url:target.url,
                  title:`${range.name} image · ${imageName}`,
                  content:normalize(`${range.name} ${imageName} ${src}`),
                  image:src
                });
              });
            }
          });
        }).catch(()=>{}),
        fetch('assets/data/cabinet-products.json',{cache:'force-cache'}).then(response=>response.json()).then(products=>{
          products.forEach(product=>{
            const title=`${product.code} · ${product.name}`;
            searchPages.push({
              url:`catalogue.html?search=${encodeURIComponent(product.code)}`,
              title,
              content:normalize(`${title} ${product.category||''} ${product.width||''} ${product.height||''} ${product.depth||''}`),
              image:product.category?`assets/images/units/${product.category}.svg`:''
            });
          });
        }).catch(()=>{})
      ]).then(()=>{indexReady=true;});
      return indexPromise;
    };

    const close=()=>{
      results.innerHTML='';
      results.classList.remove('is-visible');
      input.setAttribute('aria-expanded','false');
    };
    const render=()=>{
      const query=normalize(input.value);
      if(!query){close();return;}
      const terms=query.split(' ');
      const matches=searchPages.filter(page=>terms.every(term=>page.content.includes(term))).slice(0,8);
      results.innerHTML=matches.length
        ? matches.map(page=>`<a class="site-search-result" role="option" href="${page.url}">${page.image?`<img src="${page.image}" alt="">`:'<span class="site-search-result-placeholder" aria-hidden="true"></span>'}<span>${page.title}</span></a>`).join('')
        : '<span class="site-search-empty">No matching pages</span>';
      results.classList.add('is-visible');
      input.setAttribute('aria-expanded','true');
    };

    input.addEventListener('focus',()=>{if(input.value)render(); loadPageContent();});
    input.addEventListener('input',()=>{render(); if(!indexReady)loadPageContent().then(render);});
    input.addEventListener('keydown',event=>{if(event.key==='Escape'){close();input.blur();}});
    document.addEventListener('click',event=>{if(!wrap.contains(event.target))close();});
  },
  initDoorColourPreview(){
    const preview=document.querySelector('.range-door-large img');
    const options=[...document.querySelectorAll('.colour-option')];
    if(!preview||!options.length) return;

    const originalSrc=preview.getAttribute('src');
    const originalAlt=preview.getAttribute('alt')||'Kitchen door';
    let renderToken=0;

    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

    const rgbStringToRgb=rgb=>{
      const m=(rgb||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if(!m) return null;
      return {r:Number(m[1]),g:Number(m[2]),b:Number(m[3])};
    };

    const luminance=(r,g,b)=>0.2126*r+0.7152*g+0.0722*b;

    const renderColour=(target,name)=>{
      if(!target) return;
      const token=++renderToken;
      const img=new Image();

      img.onload=()=>{
        if(token!==renderToken) return;

        const canvas=document.createElement('canvas');
        canvas.width=img.naturalWidth;
        canvas.height=img.naturalHeight;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(img,0,0);

        const image=ctx.getImageData(0,0,canvas.width,canvas.height);
        const px=image.data;
        const targetLum=luminance(target.r,target.g,target.b);
        const effectiveTarget={
          r: targetLum>225 ? Math.max(0,target.r-9) : target.r,
          g: targetLum>225 ? Math.max(0,target.g-9) : target.g,
          b: targetLum>225 ? Math.max(0,target.b-9) : target.b
        };

        /*
          The supplied door renders have been flattened to neutral studio
          lighting. We therefore only borrow the small local differences in
          luminance that describe panel edges, bevels and material grain.
          Broad photographic shadows are deliberately not reproduced.
        */
        const neutralBase=190;
        const detailStrength=targetLum>220 ? 0.42 : targetLum>175 ? 0.52 : 0.62;

        for(let i=0;i<px.length;i+=4){
          const r=px[i],g=px[i+1],b=px[i+2],a=px[i+3];
          if(a===0) continue;

          const lum=luminance(r,g,b);
          const chroma=Math.max(r,g,b)-Math.min(r,g,b);

          // Keep the studio canvas pure white.
          if(lum>249 && chroma<8){
            px[i]=255; px[i+1]=255; px[i+2]=255;
            continue;
          }

          const detail=clamp((lum-neutralBase)*detailStrength,-34,24);

          let nr=effectiveTarget.r+detail;
          let ng=effectiveTarget.g+detail;
          let nb=effectiveTarget.b+detail;

          // Pale finishes need a tiny amount of separation from the white page.
          if(targetLum>225){
            nr=Math.min(nr,242);
            ng=Math.min(ng,242);
            nb=Math.min(nb,242);
          }

          // Sanded should read as unfinished timber rather than a beige paint colour.
          if(name.toLowerCase()==='sanded'){
            const p=i/4, x=p%canvas.width, y=Math.floor(p/canvas.width);
            const grain=(Math.sin(x*0.22+Math.sin(y*0.025)*2.4)+Math.sin(x*0.071+y*0.012))*3.2;
            nr+=grain; ng+=grain*0.78; nb+=grain*0.45;
          }

          // Primed should read as a neutral undercoat with a very fine mottled surface.
          if(name.toLowerCase()==='primed'){
            const p=i/4, x=p%canvas.width, y=Math.floor(p/canvas.width);
            const primer=((x*17+y*29)%23-11)*0.20;
            nr+=primer; ng+=primer; nb+=primer*0.92;
          }

          px[i]=clamp(Math.round(nr),0,255);
          px[i+1]=clamp(Math.round(ng),0,255);
          px[i+2]=clamp(Math.round(nb),0,255);
        }

        ctx.putImageData(image,0,0);
        preview.src=canvas.toDataURL('image/png');
        preview.alt=originalAlt+' in '+name;
      };

      img.src=originalSrc;
    };

    const heroStage=document.querySelector('.range-lifestyle-stage');
    const heroMain=document.querySelector('[data-gallery-main]');
    let heroTransitionToken=0;

    const showRealKitchen=(src,name)=>{
      if(!src||!heroStage||!heroMain) return;
      const token=++heroTransitionToken;
      const ready=new Image();
      ready.decoding='async';
      ready.src=src;

      const swap=()=>{
        if(token!==heroTransitionToken) return;
        const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(reduceMotion){
          heroMain.src=src;
          heroMain.alt=(heroMain.alt||'Kitchen')+' in '+name;
          return;
        }

        heroStage.querySelectorAll('.gallery-next-layer').forEach(el=>el.remove());
        const next=document.createElement('img');
        next.className='gallery-next-layer';
        next.src=src;
        next.alt='';
        next.setAttribute('aria-hidden','true');
        const content=heroStage.querySelector('.range-hero-content');
        if(content) heroStage.insertBefore(next,content); else heroStage.appendChild(next);

        requestAnimationFrame(()=>requestAnimationFrame(()=>next.classList.add('is-visible')));
        window.setTimeout(()=>{
          if(token!==heroTransitionToken) return;
          heroMain.src=src;
          heroMain.alt=(document.body.dataset.rangeName||'Kitchen')+' kitchen in '+name;
          next.remove();
        },375);
      };

      if(ready.decode){
        ready.decode().then(swap).catch(swap);
      }else{
        ready.onload=swap;
      }
    };

    let firstChoice=null;

    options.forEach((option,index)=>{
      const chip=option.querySelector('.colour-chip');
      const name=(option.textContent||'').trim();
      if(!chip) return;

      // Make unfinished/undercoat finishes visually unmistakable.
      const finishKey=name.toLowerCase();
      if(finishKey==='sanded') chip.classList.add('finish-sanded');
      if(finishKey==='primed') chip.classList.add('finish-primed');

      option.setAttribute('role','button');
      option.setAttribute('tabindex','0');
      option.setAttribute('aria-label','Preview '+name);
      option.setAttribute('aria-pressed','false');

      const choose=()=>{
        if(document.body.dataset.rangeSlug) return;
        options.forEach(item=>{
          item.classList.remove('selected');
          item.setAttribute('aria-pressed','false');
        });
        option.classList.add('selected');
        option.setAttribute('aria-pressed','true');

        const realDoor=option.dataset.doorSrc;
        const realKitchen=option.dataset.kitchenSrc;

        if(realDoor){
          ++renderToken;
          preview.src=realDoor;
          preview.alt=originalAlt+' in '+name;
        }else{
          const target=rgbStringToRgb(getComputedStyle(chip).backgroundColor);
          renderColour(target,name);
        }
        if(realKitchen){ showRealKitchen(realKitchen,name); }

        const label=document.querySelector('[data-selected-door-colour]');
        if(label) label.textContent=name;
      };

      option.addEventListener('click',choose);
      option.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          choose();
        }
      });

      if(index===0) firstChoice=choose;
    });

    if(firstChoice) firstChoice();

    // Deep-link support from Collections colour swatches.
    const params=new URLSearchParams(window.location.search);
    const requestedColour=params.get('colour');
    if(requestedColour){
      const match=options.find(option=>option.textContent.trim().toLowerCase()===requestedColour.trim().toLowerCase());
      if(match){
        window.setTimeout(()=>{
          match.click();
        },60);
      }
    }
  },

  initRangeGalleries(){
    document.querySelectorAll('[data-range-gallery]').forEach(gallery=>{
      const stage=gallery.querySelector('.range-lifestyle-stage');
      const main=gallery.querySelector('[data-gallery-main]');
      const thumbs=[...gallery.querySelectorAll('[data-gallery-src]')];
      if(!stage||!main||!thumbs.length) return;

      let currentIndex=Math.max(0,thumbs.findIndex(btn=>btn.classList.contains('active')));
      let timer=null;
      let transitionToken=0;
      const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const AUTO_DELAY=4200;
      const CROSSFADE_MS=340;

      const preloadPromises=thumbs.map(btn=>{
        const img=new Image();
        img.decoding='async';
        img.src=btn.dataset.gallerySrc;
        return img.decode ? img.decode().catch(()=>{}) : Promise.resolve();
      });

      const setActiveThumb=index=>{
        thumbs.forEach((thumb,i)=>{
          const active=i===index;
          thumb.classList.toggle('active',active);
          thumb.setAttribute('aria-current',active?'true':'false');
        });
      };

      const schedule=()=>{
        window.clearTimeout(timer);
        if(thumbs.length<2||reduceMotion||document.hidden) return;
        timer=window.setTimeout(()=>showImage((currentIndex+1)%thumbs.length),AUTO_DELAY);
      };

      const commitImage=(index,src,alt)=>{
        currentIndex=index;
        main.src=src;
        if(alt) main.alt=alt;
        setActiveThumb(index);
      };

      const showImage=async index=>{
        if(index===currentIndex){schedule();return;}
        window.clearTimeout(timer);
        const token=++transitionToken;
        const btn=thumbs[index];
        const src=btn.dataset.gallerySrc;
        const thumbImg=btn.querySelector('img');
        const alt=thumbImg?.alt||main.alt;

        const ready=new Image();
        ready.decoding='async';
        ready.src=src;
        try{if(ready.decode) await ready.decode();}catch(e){}
        if(token!==transitionToken) return;

        if(reduceMotion){commitImage(index,src,alt);schedule();return;}

        stage.querySelectorAll('.gallery-next-layer').forEach(el=>el.remove());
        const next=document.createElement('img');
        next.className='gallery-next-layer';
        next.src=src;
        next.alt='';
        next.setAttribute('aria-hidden','true');
        const content=stage.querySelector('.range-hero-content');
        if(content) stage.insertBefore(next,content); else stage.appendChild(next);

        requestAnimationFrame(()=>requestAnimationFrame(()=>next.classList.add('is-visible')));
        setActiveThumb(index);

        window.setTimeout(()=>{
          if(token!==transitionToken) return;
          commitImage(index,src,alt);
          next.remove();
          schedule();
        },CROSSFADE_MS+35);
      };

      thumbs.forEach((btn,index)=>btn.addEventListener('click',()=>showImage(index)));
      gallery.addEventListener('mouseenter',()=>window.clearTimeout(timer));
      gallery.addEventListener('mouseleave',schedule);
      gallery.addEventListener('focusin',()=>window.clearTimeout(timer));
      gallery.addEventListener('focusout',event=>{if(!gallery.contains(event.relatedTarget)) schedule();});
      document.addEventListener('visibilitychange',()=>{if(document.hidden) window.clearTimeout(timer); else schedule();});

      setActiveThumb(currentIndex);
      Promise.allSettled(preloadPromises).finally(schedule);
    });
  },
  initHeroWatermark(){
    document.querySelectorAll('.page-hero, .catalogue-page-hero, .doors-page-hero').forEach(hero=>{
      const h1=hero.querySelector('h1');
      const text=(h1?.textContent||'').trim();
      if(text) hero.setAttribute('data-watermark',text);
    });
  },
  init(){
    this.updateBasketCount();
    const user=this.user();
    document.querySelectorAll('[data-login-label]').forEach(el=>{
      el.textContent=user?'My account':'Login';
      el.setAttribute('href',user?'account.html':'login.html');
    });
    this.initAnnouncementBar();
    this.initNavigation();
    this.initDoorColourPreview();
    this.initRangeGalleries();
    this.initHeroWatermark();
  }
};
document.addEventListener('DOMContentLoaded',()=>BKO.init());
