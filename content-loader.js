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
const n=await getJSON("content/news.json"),g=document.querySelector('#novosti .news');
if(g)g.innerHTML=(n.items||[]).map((x,i)=>`<article class="news-card" style="cursor:pointer" onclick="openNews(${i})">${x.image?`<div class="news-img"><img src="${esc(asset(x.image))}" alt="${esc(x.title)}" style="width:100%;height:100%;object-fit:cover"></div>`:`<div class="news-img">${esc(x.category||'NOVOST')}</div>`}<div class="news-body"><div class="news-date">${esc(x.date ? new Date(x.date).toLocaleDateString('hr-HR') : '')}</div><h3>${esc(x.title||'')}</h3><p>${esc(x.excerpt||x.description||x.text||'')}</p></div></article>`).join('');
const a=await getJSON("content/gallery.json"),gg=document.querySelector('#galerija .gallery');
if(gg)gg.innerHTML=(a.items||[]).map(x=>`<div class="gallery-box"><img src="${esc(asset(x.image))}" alt="${esc(x.title)}" title="Klikni za uvećanje" onclick="window.open(this.src,'_blank')" style="width:100%;height:100%;object-fit:cover;border-radius:9px;cursor:zoom-in"><span style="position:absolute;display:none">${esc(x.title)}</span></div>`).join('');
const d=await getJSON("content/documents.json"),dg=document.querySelector('#dokumenti .docs');if(dg)dg.innerHTML=(d.items||[]).map(x=>`<div class="doc"><h3>${esc(x.title)}</h3><p>${esc(x.description||'')}</p>${x.file?`<a class="btn" href="${esc(asset(x.file))}" target="_blank" rel="noopener">Preuzmi</a>`:''}</div>`).join('');
}catch(e){console.warn('UBIDR content loader:',e)}})();

async function openNews(i){
  try {
    const n = await getJSON("content/news.json");
    const x = n.items[i];
    if (!x) return;

    document.getElementById("news-modal")?.remove();

    const modal = document.createElement("div");
    modal.id = "news-modal";
    modal.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,.78);
      display:flex; align-items:center; justify-content:center;
      padding:16px; box-sizing:border-box;
    `;

    const photos = [x.image, ...(Array.isArray(x.images) ? x.images : [])]
      .filter(Boolean);

    modal.innerHTML = `
      <div style="background:#fff;color:#222;max-width:850px;width:100%;
        max-height:90vh;overflow:auto;border-radius:12px;padding:22px;
        box-sizing:border-box">
        <button id="news-close" style="float:right;background:#090A73;
          color:white;border:0;border-radius:6px;padding:10px 15px;
          cursor:pointer">✕ Zatvori</button>
        <div style="clear:both"></div>
        <p style="color:#80621c">
          ${esc(x.date ? new Date(x.date).toLocaleDateString('hr-HR') : '')}
        </p>
        <h2>${esc(x.title || '')}</h2>
        <div style="font-size:16px;line-height:1.8;white-space:pre-wrap">
          ${esc(x.body || x.description || x.text || x.excerpt || '')}
        </div>
        <div id="news-photos" style="margin-top:20px"></div>
      </div>`;

    document.body.appendChild(modal);

    const photosBox = modal.querySelector("#news-photos");
    if (photos.length) {
      let current = 0;

      function showPhoto() {
        photosBox.innerHTML = `
          <img src="${esc(asset(photos[current]))}"
            alt="${esc(x.title || '')}"
            style="display:block;width:100%;max-height:55vh;object-fit:contain">
          <div style="display:flex;justify-content:space-between;
            align-items:center;margin-top:10px;gap:12px">
            <button id="photo-prev" ${current===0?'disabled':''}>‹ Prethodna</button>
            <span>${current+1} / ${photos.length}</span>
            <button id="photo-next" ${current===photos.length-1?'disabled':''}>Sljedeća ›</button>
          </div>`;

        photosBox.querySelector("#photo-prev").onclick = () => {
          if (current > 0) { current--; showPhoto(); }
        };
        photosBox.querySelector("#photo-next").onclick = () => {
          if (current < photos.length - 1) { current++; showPhoto(); }
        };
      }

      showPhoto();
    }

    modal.querySelector("#news-close").onclick = () => modal.remove();
    modal.onclick = e => {
      if (e.target === modal) modal.remove();
    };
  } catch (e) {
    console.error(e);
    alert("Novost se ne može otvoriti.");
  }
}
