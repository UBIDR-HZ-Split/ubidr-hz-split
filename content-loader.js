async function getJSON(p){const r=await fetch("./"+p+"?v="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error(p+" "+r.status);return r.json()}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function link(s=""){return esc(s)}
function setText(sel,v){const e=document.querySelector(sel);if(e&&v!==undefined)e.textContent=v}
function setHTML(sel,v){const e=document.querySelector(sel);if(e&&v!==undefined)e.innerHTML=v}
function setVisible(id,v){const e=document.getElementById(id);if(e)e.style.display=v===false?'none':''}
function asset(p=""){if(!p)return "";if(/^https?:\/\//i.test(p)||p.startsWith("/"))return p;return p}
document.addEventListener("DOMContentLoaded",async()=>{try{
const s=await getJSON("content/settings.json");
document.title=s.seo_title||document.title;
const md=document.querySelector('meta[name="description"]');if(md&&s.seo_description)md.setAttribute('content',s.seo_description);
const root=document.documentElement;if(s.colors){Object.entries(s.colors).forEach(([k,v])=>root.style.setProperty('--'+k,v));}
const logo=document.querySelector('.logo');if(logo&&s.logo)logo.src=asset(s.logo);
setText('.top-in span:first-child',`${s.site_name||''} • ${s.branch_name||''}`);setText('.top-in span:last-child',s.tagline||'');
setText('.brand-title',s.site_name);setText('.brand-sub',s.legal_name);
const hero=document.querySelector('.hero img');if(hero&&s.hero_image)hero.src=asset(s.hero_image);
setText('.hero-box small',s.hero_label);setText('.hero h1',s.hero_title);setText('.hero p',s.hero_text);
setText('#onama .eyebrow',s.about_eyebrow);setText('#onama h2',s.about_title);setText('#onama .lead',s.about_text);
const qc=document.querySelector('#onama .quick');if(qc)qc.innerHTML=(s.about_cards||[]).map(x=>`<div class="quick-card"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('');
setText('#ciljevi .eyebrow',s.goals_eyebrow);setText('#ciljevi h2',s.goals_title);const fg=document.querySelector('#ciljevi .features');if(fg)fg.innerHTML=(s.goals||[]).map(x=>`<div class="feature"><div class="icon">${esc(x.icon)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('');
setText('#novosti .eyebrow',s.news_eyebrow);setText('#novosti h2',s.news_title);
setText('#dokumenti .eyebrow',s.documents_eyebrow);setText('#dokumenti h2',s.documents_title);
setText('#galerija .eyebrow',s.gallery_eyebrow);setText('#galerija h2',s.gallery_title);setText('#galerija .lead',s.gallery_intro);
setText('#predsjednistvo .eyebrow',s.board_eyebrow);setText('#predsjednistvo h2',s.board_title);const board=document.querySelector("#predsjednistvo .board");if(board){board.innerHTML=(Array.isArray(s.board)?s.board:[]).map(x=>`<div class="person"><strong>${esc(x.role||"")}</strong><span>${esc(x.name||"")}</span></div>`).join("");}
setText('#kontakt .eyebrow',s.contact_eyebrow);setText('#kontakt h2',s.contact_title);setText('#kontakt .contact-box p:nth-of-type(2)',s.address||'');const ps=document.querySelectorAll('#kontakt .contact-box p');if(ps.length){let info=ps[1];if(info){info.innerHTML=`<b>${esc(s.address||'')}</b>`;}}
const emailP=document.querySelector('#kontakt .contact-box p:nth-of-type(3)');if(emailP)emailP.innerHTML=`<b>E-mail:</b> ${esc(s.email||'')}`;
const mailBtn=document.querySelector('#kontakt .contact-box .btn');if(mailBtn){mailBtn.href=s.email?'mailto:'+s.email:'#';}
const social=document.querySelectorAll('#kontakt .contact-box')[1];if(social){setText('#kontakt .contact-box:nth-child(2) p',s.contact_intro);const bs=social.querySelectorAll('.btn');if(bs[0])bs[0].href=s.facebook||'#';if(bs[1])bs[1].href=s.instagram||'#';}
const ft=document.querySelector('footer .footer');if(ft){setText('footer .footer > div:first-child p',s.footer_text);setHTML('footer .footer > div:last-child p:first-of-type',`${esc((s.address||'').replace(/\\n/g,' ').replace(/\\\\n/g,' '))}${s.email?'<br>'+esc(s.email):''}`);const fb=ft.querySelector('a[href*="facebook"]');const ig=ft.querySelector('a[href*="instagram"]');if(fb)fb.href=s.facebook||'#';if(ig)ig.href=s.instagram||'#';}
const navMap={home:'#pocetna',about:'#onama',goals:'#ciljevi',news:'#novosti',documents:'#dokumenti',gallery:'#galerija',board:'#predsjednistvo',contact:'#kontakt'};document.querySelectorAll('.menu a').forEach(a=>{const href=a.getAttribute('href');const k=Object.keys(navMap).find(k=>navMap[k]===href);if(k&&s.nav?.[k])a.textContent=s.nav[k];});
Object.entries(s.visible||{}).forEach(([k,v])=>setVisible(k==='about'?'onama':k==='goals'?'ciljevi':k==='news'?'novosti':k==='documents'?'dokumenti':k==='gallery'?'galerija':k==='board'?'predsjednistvo':k==='contact'?'kontakt':k,v));
const a = await getJSON("content/gallery.json");
const gg = document.querySelector("#galerija .gallery");

if (gg) {
  gg.innerHTML = (a.items || []).map((x, i) => {
    const photos = [
      ...(Array.isArray(x.images) ? x.images : []),
      ...(x.image ? [x.image] : []),
      ...(x.cover ? [x.cover] : [])
    ].filter((p, j, arr) => p && arr.indexOf(p) === j);

    const cover = x.image || x.cover || photos[0] || "";
    const count = photos.length;

    return `
      <article class="gallery-box"
        role="button"
        tabindex="0"
        aria-label="Otvori album ${esc(x.title || "Album")}"
        onclick="openGalleryAlbum(${i})"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGalleryAlbum(${i})}"
        style="cursor:pointer;overflow:hidden">
        ${cover ? `
          <img src="${esc(asset(cover))}"
            alt="${esc(x.title || "Album")}"
            loading="lazy"
            style="width:100%;height:180px;object-fit:cover;border-radius:9px">
        ` : ""}
        <div style="padding:10px">
          <strong>${esc(x.title || "Album")}</strong>
          <div>${count} ${count === 1 ? "fotografija" : "fotografija"}</div>
        </div>
      </article>`;
  }).join("");
}
const d=await getJSON("content/documents.json"),dg=document.querySelector('#dokumenti .docs');if(dg)dg.innerHTML=(d.items||[]).map(x=>`<div class="doc"><h3>${esc(x.title)}</h3><p>${esc(x.description||'')}</p>${x.file?`<a class="btn" href="${esc(asset(x.file))}" target="_blank" rel="noopener">Preuzmi</a>`:''}</div>`).join('');
}catch(e){console.warn('UBIDR content loader:',e)}})();

function formatHrDate(value){
  if(!value) return "";
  // Za ISO datum koristimo lokalni datum kako se ne bi pomaknuo dan zbog vremenske zone.
  const m=String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(m) return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}.`;
  const d=new Date(value);
  return Number.isNaN(d.getTime()) ? esc(value) : d.toLocaleDateString("hr-HR");
}

function closeContentModal(){
  document.getElementById("news-modal")?.remove();
  document.getElementById("gallery-modal")?.remove();
}

function showPhotoViewer({modalId,title,photos,startIndex=0}){
  if(!Array.isArray(photos)||!photos.length) return;
  let current=Math.max(0,Math.min(startIndex,photos.length-1));
  let viewer=document.getElementById("photo-viewer");
  if(viewer) viewer.remove();
  viewer=document.createElement("div");
  viewer.id="photo-viewer";
  viewer.style.cssText="position:fixed;inset:0;z-index:100002;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
  viewer.innerHTML=`
    <button type="button" id="viewer-close" aria-label="Zatvori" style="position:absolute;right:18px;top:14px;background:#fff;color:#111;border:0;border-radius:6px;padding:10px 14px;cursor:pointer">✕ Zatvori</button>
    <button type="button" id="viewer-prev" aria-label="Prethodna fotografija" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:30px;padding:10px;background:#fff;color:#111;border:0;border-radius:8px;cursor:pointer">‹</button>
    <figure style="margin:45px 48px 20px;max-width:90vw;max-height:85vh;text-align:center">
      <img id="viewer-img" alt="" style="display:block;max-width:100%;max-height:75vh;object-fit:contain;margin:auto">
      <figcaption id="viewer-caption" style="color:white;margin-top:10px"></figcaption>
    </figure>
    <button type="button" id="viewer-next" aria-label="Sljedeća fotografija" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:30px;padding:10px;background:#fff;color:#111;border:0;border-radius:8px;cursor:pointer">›</button>`;
  document.body.appendChild(viewer);
  function render(){
    const img=viewer.querySelector("#viewer-img");
    img.src=asset(photos[current]);
    img.alt=title||"Fotografija";
    viewer.querySelector("#viewer-caption").textContent=`${title||"Fotografija"} — ${current+1} / ${photos.length}`;
    viewer.querySelector("#viewer-prev").disabled=current===0;
    viewer.querySelector("#viewer-next").disabled=current===photos.length-1;
    viewer.querySelector("#viewer-prev").style.opacity=current===0?".35":"1";
    viewer.querySelector("#viewer-next").style.opacity=current===photos.length-1?".35":"1";
  }
  viewer.querySelector("#viewer-prev").onclick=()=>{if(current>0){current--;render();}};
  viewer.querySelector("#viewer-next").onclick=()=>{if(current<photos.length-1){current++;render();}};
  viewer.querySelector("#viewer-close").onclick=()=>viewer.remove();
  viewer.onclick=e=>{if(e.target===viewer)viewer.remove();};
  const onKey=e=>{
    if(!document.getElementById("photo-viewer")){document.removeEventListener("keydown",onKey);return;}
    if(e.key==="Escape") viewer.remove();
    if(e.key==="ArrowLeft"&&current>0){current--;render();}
    if(e.key==="ArrowRight"&&current<photos.length-1){current++;render();}
  };
  document.addEventListener("keydown",onKey);
  render();
}

async function openNews(i){
  try{
    const n=await getJSON("content/news.json");
    const x=(n.items||[])[i];
    if(!x)return;
    document.getElementById("news-modal")?.remove();
    document.getElementById("photo-viewer")?.remove();
    const photos=[x.image,...(Array.isArray(x.images)?x.images:[])].filter(Boolean)
      .filter((p,index,arr)=>arr.indexOf(p)===index);
    const modal=document.createElement("div");
    modal.id="news-modal";
    modal.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
    modal.innerHTML=`
      <article style="background:#fff;color:#222;max-width:850px;width:100%;max-height:90vh;overflow:auto;border-radius:12px;padding:22px;box-sizing:border-box">
        <button type="button" id="news-close" style="float:right;background:#090A73;color:white;border:0;border-radius:6px;padding:10px 15px;cursor:pointer">✕ Zatvori</button>
        <div style="clear:both"></div>
        <p style="color:#80621c">${formatHrDate(x.date)}</p>
        <h2>${esc(x.title||"")}</h2>
        <div style="font-size:16px;line-height:1.8;white-space:pre-wrap">${esc(x.body||x.content||x.description||x.text||x.excerpt||"")}</div>
        <div id="news-photos" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:20px"></div>
      </article>`;
    document.body.appendChild(modal);
    const photosBox=modal.querySelector("#news-photos");
    photosBox.innerHTML=photos.map((p,j)=>`<button type="button" data-photo-index="${j}" style="border:0;padding:0;background:transparent;cursor:zoom-in"><img src="${esc(asset(p))}" alt="${esc(x.title||"Fotografija")} ${j+1}" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:7px;display:block"></button>`).join("");
    photosBox.querySelectorAll("[data-photo-index]").forEach(btn=>btn.onclick=()=>showPhotoViewer({title:x.title,photos,startIndex:Number(btn.dataset.photoIndex)}));
    modal.querySelector("#news-close").onclick=()=>modal.remove();
    modal.onclick=e=>{if(e.target===modal)modal.remove();};
  }catch(e){console.error(e);alert("Novost se ne može otvoriti.");}
}

async function openGalleryAlbum(i){
  try{
    const a=await getJSON("content/gallery.json");
    const x=(a.items||[])[i];
    if(!x)return;
    document.getElementById("gallery-modal")?.remove();
    document.getElementById("photo-viewer")?.remove();
    // Novi format: images[]. Stariji format: samo image.
    const photos=(Array.isArray(x.images)&&x.images.length?x.images:[x.image||x.cover]).filter(Boolean);
    const modal=document.createElement("div");
    modal.id="gallery-modal";
    modal.style.cssText="position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
    modal.innerHTML=`
      <section style="background:#fff;color:#222;max-width:1000px;width:100%;max-height:90vh;overflow:auto;border-radius:12px;padding:20px;box-sizing:border-box">
        <button type="button" id="gallery-close" style="float:right;background:#090A73;color:white;border:0;border-radius:6px;padding:10px 15px;cursor:pointer">✕ Zatvori album</button>
        <div style="clear:both"></div>
        <h2 style="margin-top:8px">${esc(x.title||"Galerija")}</h2>
        <p>${photos.length} fotografija</p>
        <div id="gallery-album-photos" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px"></div>
      </section>`;
    document.body.appendChild(modal);
    const box=modal.querySelector("#gallery-album-photos");
    box.innerHTML=photos.map((p,j)=>`<button type="button" data-photo-index="${j}" style="border:0;padding:0;background:transparent;cursor:zoom-in"><img src="${esc(asset(p))}" alt="${esc(x.title||"Galerija")} ${j+1}" loading="lazy" style="width:100%;height:135px;object-fit:cover;border-radius:7px;display:block"></button>`).join("");
    box.querySelectorAll("[data-photo-index]").forEach(btn=>btn.onclick=()=>showPhotoViewer({title:x.title,photos,startIndex:Number(btn.dataset.photoIndex)}));
    modal.querySelector("#gallery-close").onclick=()=>modal.remove();
    modal.onclick=e=>{if(e.target===modal)modal.remove();};
  }catch(e){console.error(e);alert("Album se ne može otvoriti.");}
}
