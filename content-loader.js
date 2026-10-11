async function getJSON(path) {
  const response = await fetch("./" + path + "?v=" + Date.now(), { cache: "no-store" });
  if (!response.ok) throw new Error(path + " " + response.status);
  return response.json();
}

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.textContent = value;
}

function setHTML(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.innerHTML = value;
}

function setVisible(id, visible) {
  const element = document.getElementById(id);
  if (element) element.style.display = visible === false ? "none" : "";
}

function asset(path = "") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
  return path;
}

function formatHrDate(value) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${Number(match[3])}. ${Number(match[2])}. ${match[1]}.`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? esc(value) : date.toLocaleDateString("hr-HR");
}

function closeContentModal() {
  document.getElementById("news-modal")?.remove();
  document.getElementById("gallery-modal")?.remove();
  document.getElementById("photo-viewer")?.remove();
}

document.addEventListener("DOMContentLoaded", async () => {
  // Postavke se učitavaju odvojeno da greška u jednoj datoteci
  // ne spriječi prikaz novosti, galerije i dokumenata.
  let settings = {};
  try {
    settings = await getJSON("content/settings.json");
    document.title = settings.seo_title || document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && settings.seo_description) {
      metaDescription.setAttribute("content", settings.seo_description);
    }

    if (settings.colors) {
      Object.entries(settings.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty("--" + key, value);
      });
    }

    const logo = document.querySelector(".logo");
    if (logo && settings.logo) logo.src = asset(settings.logo);

    setText(".top-in span:first-child", `${settings.site_name || ""} • ${settings.branch_name || ""}`);
    setText(".top-in span:last-child", settings.tagline || "");
    setText(".brand-title", settings.site_name);
    setText(".brand-sub", settings.legal_name);

    const hero = document.querySelector(".hero img");
    if (hero && settings.hero_image) hero.src = asset(settings.hero_image);
    setText(".hero-box small", settings.hero_label);
    setText(".hero h1", settings.hero_title);
    setText(".hero p", settings.hero_text);

    setText("#onama .eyebrow", settings.about_eyebrow);
    setText("#onama h2", settings.about_title);
    setText("#onama .lead", settings.about_text);

    const quickCards = document.querySelector("#onama .quick");
    if (quickCards) {
      quickCards.innerHTML = (settings.about_cards || []).map(item => `
        <div class="quick-card">
          <h3>${esc(item.title || "")}</h3>
          <p>${esc(item.text || "")}</p>
        </div>
      `).join("");
    }

    setText("#ciljevi .eyebrow", settings.goals_eyebrow);
    setText("#ciljevi h2", settings.goals_title);
    const features = document.querySelector("#ciljevi .features");
    if (features) {
      features.innerHTML = (settings.goals || []).map(item => `
        <div class="feature">
          <div class="icon">${esc(item.icon || "")}</div>
          <h3>${esc(item.title || "")}</h3>
          <p>${esc(item.text || "")}</p>
        </div>
      `).join("");
    }

    setText("#novosti .eyebrow", settings.news_eyebrow);
    setText("#novosti h2", settings.news_title);
    setText("#dokumenti .eyebrow", settings.documents_eyebrow);
    setText("#dokumenti h2", settings.documents_title);
    setText("#galerija .eyebrow", settings.gallery_eyebrow);
    setText("#galerija h2", settings.gallery_title);
    setText("#galerija .lead", settings.gallery_intro);

    setText("#predsjednistvo .eyebrow", settings.board_eyebrow);
    setText("#predsjednistvo h2", settings.board_title);
    const board = document.querySelector("#predsjednistvo .board");
    if (board) {
      board.innerHTML = (Array.isArray(settings.board) ? settings.board : []).map(item => `
        <div class="person">
          <strong>${esc(item.role || "")}</strong>
          <span>${esc(item.name || "")}</span>
        </div>
      `).join("");
    }

    setText("#kontakt .eyebrow", settings.contact_eyebrow);
    setText("#kontakt h2", settings.contact_title);
    const contactParagraphs = document.querySelectorAll("#kontakt .contact-box p");
    if (contactParagraphs[1]) contactParagraphs[1].innerHTML = `<b>${esc(settings.address || "")}</b>`;
    if (contactParagraphs[2]) contactParagraphs[2].innerHTML = `<b>E-mail:</b> ${esc(settings.email || "")}`;

    const mailButton = document.querySelector("#kontakt .contact-box .btn");
    if (mailButton) mailButton.href = settings.email ? "mailto:" + settings.email : "#";

    const socialBox = document.querySelectorAll("#kontakt .contact-box")[1];
    if (socialBox) {
      const socialParagraph = socialBox.querySelector("p");
      if (socialParagraph && settings.contact_intro) socialParagraph.textContent = settings.contact_intro;
      const buttons = socialBox.querySelectorAll(".btn");
      if (buttons[0]) buttons[0].href = settings.facebook || "#";
      if (buttons[1]) buttons[1].href = settings.instagram || "#";
    }

    const navMap = {
      home: "#pocetna", about: "#onama", goals: "#ciljevi", news: "#novosti",
      documents: "#dokumenti", gallery: "#galerija", board: "#predsjednistvo",
      contact: "#kontakt"
    };
    document.querySelectorAll(".menu a").forEach(anchor => {
      const href = anchor.getAttribute("href");
      const key = Object.keys(navMap).find(name => navMap[name] === href);
      if (key && settings.nav?.[key]) anchor.textContent = settings.nav[key];
    });

    Object.entries(settings.visible || {}).forEach(([key, value]) => {
      const ids = {
        about: "onama", goals: "ciljevi", news: "novosti", documents: "dokumenti",
        gallery: "galerija", board: "predsjednistvo", contact: "kontakt"
      };
      setVisible(ids[key] || key, value);
    });
  } catch (error) {
    console.warn("UBIDR postavke:", error);
  }

  // NOVOSTI
  try {
    const newsData = await getJSON("content/news.json");
    const newsContainer = document.querySelector("#novosti .news");
    const newsItems = Array.isArray(newsData.items) ? newsData.items.slice() : [];

    // Najnovije objave idu prve.
    newsItems.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime() || 0;
      const dateB = new Date(b.date || 0).getTime() || 0;
      return dateB - dateA;
    });

    // Spremamo isti redoslijed koji se koristi i pri otvaranju objave.
    window.ubidrNewsItems = newsItems;

    if (newsContainer) {
      if (!newsItems.length) {
        newsContainer.innerHTML = "<p>Trenutačno nema objavljenih novosti.</p>";
      } else {
        newsContainer.innerHTML = newsItems.map((item, index) => `
          <article class="news-card" role="button" tabindex="0"
            aria-label="Pročitaj novost: ${esc(item.title || "")}"
            style="cursor:pointer"
            onclick="openNews(${index})"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openNews(${index});}">
            ${item.image
              ? `<div class="news-img" style="padding:0;overflow:hidden"><img src="${esc(asset(item.image))}" alt="${esc(item.title || "Novost")}" loading="lazy" style="width:100%;height:160px;object-fit:cover"></div>`
              : `<div class="news-img">${esc(item.category || "NOVOST")}</div>`
            }
            <div class="news-body">
              <div class="news-date">${formatHrDate(item.date)}</div>
              <h3>${esc(item.title || "Novost")}</h3>
              <p>${esc(item.excerpt || item.description || item.text || "")}</p>
              <span class="btn" style="margin-top:14px">Pročitaj više</span>
            </div>
          </article>
        `).join("");
      }
    }
  } catch (error) {
    console.error("UBIDR novosti:", error);
    const newsContainer = document.querySelector("#novosti .news");
    if (newsContainer) newsContainer.innerHTML = "<p>Novosti se trenutačno ne mogu učitati.</p>";
  }

  // GALERIJA: svaki zapis u gallery.json predstavlja jedan album.
  try {
    const galleryData = await getJSON("content/gallery.json");
    const galleryContainer = document.querySelector("#galerija .gallery");
    const albums = Array.isArray(galleryData.items) ? galleryData.items : [];
    window.ubidrGalleryItems = albums;

    if (galleryContainer) {
      galleryContainer.innerHTML = albums.map((album, index) => {
        const photos = [
          ...(Array.isArray(album.images) ? album.images : []),
          ...(album.image ? [album.image] : []),
          ...(album.cover ? [album.cover] : [])
        ].filter((photo, photoIndex, all) => photo && all.indexOf(photo) === photoIndex);
        const cover = album.image || album.cover || photos[0] || "";
        return `
          <article class="gallery-box" role="button" tabindex="0"
            aria-label="Otvori album ${esc(album.title || "Album")}"
            onclick="openGalleryAlbum(${index})"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openGalleryAlbum(${index});}"
            style="cursor:pointer;overflow:hidden;display:block;aspect-ratio:auto">
            ${cover ? `<img src="${esc(asset(cover))}" alt="${esc(album.title || "Album")}" loading="lazy" style="width:100%;height:180px;object-fit:cover;border-radius:9px">` : ""}
            <div style="padding:10px">
              <strong>${esc(album.title || "Album")}</strong>
              <div>${photos.length} ${photos.length === 1 ? "fotografija" : "fotografija"}</div>
            </div>
          </article>
        `;
      }).join("");
    }
  } catch (error) {
    console.error("UBIDR galerija:", error);
  }

  // DOKUMENTI
  try {
    const documentsData = await getJSON("content/documents.json");
    const documentsContainer = document.querySelector("#dokumenti .docs");
    if (documentsContainer) {
      documentsContainer.innerHTML = (documentsData.items || []).map(item => `
        <div class="doc">
          <h3>${esc(item.title || "")}</h3>
          <p>${esc(item.description || "")}</p>
          ${item.file ? `<a class="btn" href="${esc(asset(item.file))}" target="_blank" rel="noopener">Preuzmi</a>` : ""}
        </div>
      `).join("");
    }
  } catch (error) {
    console.error("UBIDR dokumenti:", error);
  }
});

function showPhotoViewer(title, photos, startIndex = 0) {
  if (!Array.isArray(photos) || !photos.length) return;
  let current = Math.max(0, Math.min(startIndex, photos.length - 1));
  document.getElementById("photo-viewer")?.remove();

  const viewer = document.createElement("div");
  viewer.id = "photo-viewer";
  viewer.style.cssText = "position:fixed;inset:0;z-index:100002;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
  viewer.innerHTML = `
    <button type="button" id="viewer-close" aria-label="Zatvori" style="position:absolute;right:18px;top:14px;background:#fff;color:#111;border:0;border-radius:6px;padding:10px 14px;cursor:pointer">✕ Zatvori</button>
    <button type="button" id="viewer-prev" aria-label="Prethodna fotografija" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:30px;padding:10px;background:#fff;color:#111;border:0;border-radius:8px;cursor:pointer">‹</button>
    <figure style="margin:45px 48px 20px;max-width:90vw;max-height:85vh;text-align:center">
      <img id="viewer-img" alt="" style="display:block;max-width:100%;max-height:75vh;object-fit:contain;margin:auto">
      <figcaption id="viewer-caption" style="color:white;margin-top:10px"></figcaption>
    </figure>
    <button type="button" id="viewer-next" aria-label="Sljedeća fotografija" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:30px;padding:10px;background:#fff;color:#111;border:0;border-radius:8px;cursor:pointer">›</button>`;
  document.body.appendChild(viewer);

  function render() {
    viewer.querySelector("#viewer-img").src = asset(photos[current]);
    viewer.querySelector("#viewer-img").alt = title || "Fotografija";
    viewer.querySelector("#viewer-caption").textContent = `${title || "Fotografija"} — ${current + 1} / ${photos.length}`;
    viewer.querySelector("#viewer-prev").disabled = current === 0;
    viewer.querySelector("#viewer-next").disabled = current === photos.length - 1;
    viewer.querySelector("#viewer-prev").style.opacity = current === 0 ? ".35" : "1";
    viewer.querySelector("#viewer-next").style.opacity = current === photos.length - 1 ? ".35" : "1";
  }

  viewer.querySelector("#viewer-prev").onclick = () => {
    if (current > 0) { current--; render(); }
  };
  viewer.querySelector("#viewer-next").onclick = () => {
    if (current < photos.length - 1) { current++; render(); }
  };
  viewer.querySelector("#viewer-close").onclick = () => viewer.remove();
  viewer.onclick = event => { if (event.target === viewer) viewer.remove(); };

  const onKey = event => {
    if (!document.getElementById("photo-viewer")) {
      document.removeEventListener("keydown", onKey);
      return;
    }
    if (event.key === "Escape") viewer.remove();
    if (event.key === "ArrowLeft" && current > 0) { current--; render(); }
    if (event.key === "ArrowRight" && current < photos.length - 1) { current++; render(); }
  };
  document.addEventListener("keydown", onKey);
  render();
}

async function openNews(index) {
  try {
    let items = window.ubidrNewsItems;
    if (!Array.isArray(items)) {
      const data = await getJSON("content/news.json");
      items = Array.isArray(data.items) ? data.items : [];
    }
    const item = items[index];
    if (!item) return;

    document.getElementById("news-modal")?.remove();
    document.getElementById("photo-viewer")?.remove();

    const photos = [item.image, ...(Array.isArray(item.images) ? item.images : [])]
      .filter((photo, photoIndex, all) => photo && all.indexOf(photo) === photoIndex);

    const modal = document.createElement("div");
    modal.id = "news-modal";
    modal.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
    modal.innerHTML = `
      <article style="background:#fff;color:#222;max-width:850px;width:100%;max-height:90vh;overflow:auto;border-radius:12px;padding:22px;box-sizing:border-box">
        <button type="button" id="news-close" style="float:right;background:#090A73;color:white;border:0;border-radius:6px;padding:10px 15px;cursor:pointer">✕ Zatvori</button>
        <div style="clear:both"></div>
        ${photos[0] ? `<img src="${esc(asset(photos[0]))}" alt="${esc(item.title || "Novost")}" style="width:100%;max-height:400px;object-fit:contain;border-radius:8px">` : ""}
        <p style="color:#80621c">${formatHrDate(item.date)}</p>
        ${item.category ? `<p>${esc(item.category)}</p>` : ""}
        <h2>${esc(item.title || "")}</h2>
        <div style="font-size:16px;line-height:1.8;white-space:pre-wrap">${esc(item.body || item.content || item.description || item.text || item.excerpt || "")}</div>
        ${photos.length > 1 ? `<div id="news-photos" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:20px">${photos.slice(1).map((photo, photoIndex) => `<button type="button" data-photo-index="${photoIndex + 1}" style="border:0;padding:0;background:transparent;cursor:zoom-in"><img src="${esc(asset(photo))}" alt="${esc(item.title || "Fotografija")} ${photoIndex + 2}" loading="lazy" style="width:100%;height:120px;object-fit:cover;border-radius:7px;display:block"></button>`).join("")}</div>` : ""}
      </article>`;
    document.body.appendChild(modal);

    modal.querySelector("#news-close").onclick = () => modal.remove();
    modal.onclick = event => { if (event.target === modal) modal.remove(); };
    modal.querySelectorAll("[data-photo-index]").forEach(button => {
      button.onclick = () => showPhotoViewer(item.title, photos, Number(button.dataset.photoIndex));
    });
    if (photos.length) {
      const mainImage = modal.querySelector("article > img");
      if (mainImage) {
        mainImage.style.cursor = "zoom-in";
        mainImage.onclick = () => showPhotoViewer(item.title, photos, 0);
      }
    }
  } catch (error) {
    console.error("UBIDR otvaranje novosti:", error);
    alert("Novost se ne može otvoriti.");
  }
}

async function openGalleryAlbum(index) {
  try {
    let albums = window.ubidrGalleryItems;
    if (!Array.isArray(albums)) {
      const data = await getJSON("content/gallery.json");
      albums = Array.isArray(data.items) ? data.items : [];
    }
    const album = albums[index];
    if (!album) return;

    document.getElementById("gallery-modal")?.remove();
    document.getElementById("photo-viewer")?.remove();

    const photos = [
      ...(Array.isArray(album.images) ? album.images : []),
      ...(album.image ? [album.image] : []),
      ...(album.cover ? [album.cover] : [])
    ].filter((photo, photoIndex, all) => photo && all.indexOf(photo) === photoIndex);

    const modal = document.createElement("div");
    modal.id = "gallery-modal";
    modal.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box";
    modal.innerHTML = `
      <section style="background:#fff;color:#222;max-width:1000px;width:100%;max-height:90vh;overflow:auto;border-radius:12px;padding:20px;box-sizing:border-box">
        <button type="button" id="gallery-close" style="float:right;background:#090A73;color:white;border:0;border-radius:6px;padding:10px 15px;cursor:pointer">✕ Zatvori album</button>
        <div style="clear:both"></div>
        <h2 style="margin-top:8px">${esc(album.title || "Galerija")}</h2>
        <p>${photos.length} fotografija</p>
        <div id="gallery-album-photos" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px"></div>
      </section>`;
    document.body.appendChild(modal);

    const photoGrid = modal.querySelector("#gallery-album-photos");
    photoGrid.innerHTML = photos.map((photo, photoIndex) => `
      <button type="button" data-photo-index="${photoIndex}" style="border:0;padding:0;background:transparent;cursor:zoom-in">
        <img src="${esc(asset(photo))}" alt="${esc(album.title || "Galerija")} ${photoIndex + 1}" loading="lazy" style="width:100%;height:135px;object-fit:cover;border-radius:7px;display:block">
      </button>
    `).join("");

    photoGrid.querySelectorAll("[data-photo-index]").forEach(button => {
      button.onclick = () => showPhotoViewer(album.title, photos, Number(button.dataset.photoIndex));
    });
    modal.querySelector("#gallery-close").onclick = () => modal.remove();
    modal.onclick = event => { if (event.target === modal) modal.remove(); };
  } catch (error) {
    console.error("UBIDR otvaranje albuma:", error);
    alert("Album se ne može otvoriti.");
  }
}
