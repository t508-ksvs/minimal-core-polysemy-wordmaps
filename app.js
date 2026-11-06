(function () {
  "use strict";

  const data = window.POLYSEMY_DATA;
  const app = document.getElementById("app");
  const dialog = document.getElementById("image-dialog");
  const dialogImage = document.getElementById("dialog-image");
  const dialogTitle = document.getElementById("dialog-title");
  const zoomReadout = document.getElementById("zoom-readout");
  const speechStatus = document.getElementById("speech-status");
  const zoomLevels = [1, 1.5, 2, 3];
  let zoomIndex = 0;
  let searchText = "";

  if (!data || !Array.isArray(data.words) || !Array.isArray(data.comparisons)) {
    app.textContent = "單字資料暫時無法載入。";
    return;
  }

  const words = [...data.words].sort((a, b) => a.word.localeCompare(b.word, "en"));
  const comparisons = data.comparisons;
  document.getElementById("catalog-count").textContent = `${words.length} 字 · ${words.length + comparisons.length} 圖`;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function volumeIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  }

  function soundButton(text, visibleLabel, className = "sound-button", ariaLabel = "") {
    const label = ariaLabel || `播放 ${text} 發音`;
    return `<button type="button" class="${className}" data-speak="${escapeHtml(text)}" aria-label="${escapeHtml(label)}">${volumeIcon()}<span>${escapeHtml(visibleLabel)}</span></button>`;
  }

  function filteredWords() {
    return words.filter((item) =>
      item.word.toLocaleLowerCase("en").includes(searchText) ||
      (item.concept || "").toLocaleLowerCase().includes(searchText)
    );
  }

  function renderGroups() {
    const filtered = filteredWords();
    const count = document.getElementById("result-count");
    if (count) count.textContent = `找到 ${filtered.length} 個單字`;
    if (!filtered.length) return '<p class="empty-state">沒有找到符合的單字，試試其他關鍵字。</p>';

    const groups = new Map();
    for (const item of filtered) {
      const letter = item.word[0].toUpperCase();
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(item);
    }
    return [...groups.entries()].map(([letter, items]) => `
      <section class="letter-section" id="letter-${escapeHtml(letter)}" aria-labelledby="heading-${escapeHtml(letter)}">
        <h3 class="letter-header" id="heading-${escapeHtml(letter)}"><span>${escapeHtml(letter)}</span><button type="button" class="top-button" data-top>回到頂端 ↑</button></h3>
        <div class="word-grid">
          ${items.map((item) => `
            <article class="word-card">
              <div class="card-top">
                <div><h3>${escapeHtml(item.word)}</h3>${item.concept ? `<p>${escapeHtml(item.concept)}</p>` : ""}</div>
                ${soundButton(item.pronunciation[0].text, "發音", "sound-button", `播放 ${item.word} 發音`)}
              </div>
              <a class="card-link" href="#word/${encodeURIComponent(item.slug)}" aria-label="查看 ${escapeHtml(item.word)} 字圖">查看字圖 <span aria-hidden="true">→</span></a>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("");
  }

  function renderHome() {
    const letters = [...new Set(words.map((item) => item.word[0].toUpperCase()))];
    app.innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <div>
          <p class="eyebrow">Visual vocabulary · Polysemy</p>
          <h1 id="hero-title">一個核心畫面，<br><em>看懂</em>多個意思。</h1>
          <p class="hero-lead">從 A–Z 索引找到單字，先聽發音，再打開張老師的字圖。把不同用法連回同一個核心概念。</p>
        </div>
        <div class="hero-art" aria-hidden="true"><span>A<small>ONE WORD</small></span></div>
      </section>
      <section class="source-section" aria-labelledby="source-title">
        <h2 id="source-title">參考資料</h2>
        <p>教學概念參考：<a href="https://isbn.ncl.edu.tw/FCKEDITOR_UploadFiles/1591341900.pdf" target="_blank" rel="noopener noreferrer">《超圖解秒懂核心英單》</a>，田中茂範、中村俊佑著；劉芳英譯；語研學院，2020。</p>
      </section>
      <section class="index-panel" aria-labelledby="index-title">
        <div class="index-heading"><h2 id="index-title">單字索引</h2><span id="result-count" class="result-count"></span></div>
        <label class="search-label" for="word-search">搜尋單字</label>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
          <input id="word-search" class="search-input" type="search" autocomplete="off" placeholder="輸入單字，例如 frame" value="${escapeHtml(searchText)}">
        </div>
        <p class="alpha-heading">依字母快速找字</p>
        <nav class="alphabet" aria-label="單字字母索引">
          ${letters.map((letter) => `<button class="letter-chip" type="button" data-letter="${escapeHtml(letter)}">${escapeHtml(letter)}</button>`).join("")}
        </nav>
        <div id="word-groups" class="word-groups">${renderGroups()}</div>
      </section>
      <section class="extras-panel" aria-labelledby="extras-title">
        <div><p class="eyebrow">延伸學習</p><h2 id="extras-title">比較字圖</h2><p>把相關單字放在一起看。</p></div>
        ${comparisons.map((item) => `<a class="extra-link" href="#compare/${encodeURIComponent(item.slug)}">${escapeHtml(item.title)} <span aria-hidden="true">↗</span></a>`).join("")}
      </section>
    `;
    const count = document.getElementById("result-count");
    count.textContent = `找到 ${filteredWords().length} 個單字`;
    updateAlphabetAvailability();
  }

  function updateAlphabetAvailability() {
    document.querySelectorAll(".letter-chip").forEach((button) => {
      button.disabled = !document.getElementById(`letter-${button.dataset.letter}`);
    });
  }

  function figureMarkup(item, label) {
    return `
      <figure class="figure-frame">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" width="1448" height="1086">
        <figcaption class="figure-caption">
          <span>點「放大閱讀」可查看圖片細節。</span>
          <button type="button" class="zoom-button" data-open-image="${escapeHtml(item.image)}" data-image-alt="${escapeHtml(item.alt)}" data-image-title="${escapeHtml(label)}">放大閱讀 ↗</button>
        </figcaption>
      </figure>
    `;
  }

  function renderWord(item) {
    const position = words.findIndex((word) => word.slug === item.slug);
    const extraSound = item.pronunciation.slice(1);
    const comparison = comparisons.find((entry) => entry.slug === item.comparison);
    const previous = words[position - 1];
    const next = words[position + 1];
    app.innerHTML = `
      <article class="detail-page">
        <div class="detail-top"><a class="back-link" href="#home">← 返回單字索引</a><span>${position + 1} / ${words.length}</span></div>
        <div class="detail-heading">
          <div><p class="eyebrow">核心字圖</p><h1>${escapeHtml(item.word)}</h1>${item.concept ? `<p>${escapeHtml(item.concept)}</p>` : ""}</div>
          ${soundButton(item.pronunciation[0].text, "聽單字發音", "detail-sound", `播放 ${item.word} 發音`)}
        </div>
        ${extraSound.length ? `<div class="speech-options" aria-label="不同詞性的搭配詞發音">${extraSound.map((entry) => soundButton(entry.text, entry.label, "sound-button", `播放${entry.label} ${entry.text}`)).join("")}</div><p class="speech-note">聽搭配詞，留意不同詞性的讀法。</p>` : ""}
        ${figureMarkup(item, `${item.word} 字圖`)}
        ${comparison ? `<aside class="related-card"><div><strong>延伸比較｜${escapeHtml(comparison.title)}</strong><p>${escapeHtml(comparison.description)}</p></div><a href="#compare/${encodeURIComponent(comparison.slug)}">查看比較圖 →</a></aside>` : ""}
        <nav class="detail-nav" aria-label="前後單字">
          ${previous ? `<a class="nav-link" href="#word/${encodeURIComponent(previous.slug)}"><small>← 上一字</small><strong>${escapeHtml(previous.word)}</strong></a>` : '<span class="nav-placeholder"></span>'}
          ${next ? `<a class="nav-link" href="#word/${encodeURIComponent(next.slug)}"><small>下一字 →</small><strong>${escapeHtml(next.word)}</strong></a>` : '<span class="nav-placeholder"></span>'}
        </nav>
      </article>
    `;
  }

  function renderComparison(item) {
    const related = words.filter((word) => word.comparison === item.slug);
    app.innerHTML = `
      <article class="detail-page">
        <div class="detail-top"><a class="back-link" href="#home">← 返回單字索引</a></div>
        <div class="detail-heading">
          <div><p class="eyebrow">延伸比較圖</p><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.description)}</p></div>
        </div>
        <div class="speech-options" aria-label="比較圖單字發音">${item.pronunciation.map((entry) => soundButton(entry.text, entry.label, "sound-button")).join("")}</div>
        ${figureMarkup(item, `${item.title} 比較圖`)}
        ${related.length ? `<aside class="related-card"><div><strong>回看單字圖</strong><p>比較後再看各字的核心概念。</p></div><div class="related-links">${related.map((word) => `<a href="#word/${encodeURIComponent(word.slug)}">${escapeHtml(word.word)} →</a>`).join("")}</div></aside>` : ""}
      </article>
    `;
  }

  function render() {
    let path;
    try { path = decodeURIComponent(window.location.hash.slice(1)); }
    catch { renderMissing(); return; }
    speechStatus.textContent = "";
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (!path || path === "home") {
      renderHome();
    } else if (path.startsWith("word/")) {
      const item = words.find((word) => word.slug === path.slice(5));
      item ? renderWord(item) : renderMissing();
    } else if (path.startsWith("compare/")) {
      const item = comparisons.find((entry) => entry.slug === path.slice(8));
      item ? renderComparison(item) : renderMissing();
    } else {
      renderMissing();
    }
    window.scrollTo(0, 0);
  }

  function renderMissing() {
    app.innerHTML = '<section class="detail-page"><h1>找不到這張字圖</h1><p><a class="back-link" href="#home">← 返回單字索引</a></p></section>';
  }

  function updateZoom() {
    const zoom = zoomLevels[zoomIndex];
    dialogImage.style.width = `${zoom * 100}%`;
    zoomReadout.textContent = `${zoom * 100}%`;
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      speechStatus.textContent = "這個瀏覽器目前不支援語音播放。";
      return;
    }
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    const voices = synthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === "en-us") || voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) || null;
    utterance.onerror = () => { speechStatus.textContent = `無法播放 ${text}，請稍後再試。`; };
    speechStatus.textContent = `播放 ${text}`;
    synthesis.speak(utterance);
  }

  document.addEventListener("input", (event) => {
    if (event.target.id !== "word-search") return;
    searchText = event.target.value.trim().toLocaleLowerCase();
    document.getElementById("word-groups").innerHTML = renderGroups();
    updateAlphabetAvailability();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const speechButton = target.closest("[data-speak]");
    if (speechButton) { speak(speechButton.dataset.speak); return; }

    const letterButton = target.closest("[data-letter]");
    if (letterButton) {
      document.getElementById(`letter-${letterButton.dataset.letter}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (target.closest("[data-top]")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const imageButton = target.closest("[data-open-image]");
    if (imageButton) {
      dialogImage.src = imageButton.dataset.openImage;
      dialogImage.alt = imageButton.dataset.imageAlt;
      dialogTitle.textContent = imageButton.dataset.imageTitle;
      zoomIndex = 0;
      updateZoom();
      dialog.showModal();
      return;
    }

    const zoomButton = target.closest("[data-zoom-step]");
    if (zoomButton) {
      zoomIndex = Math.max(0, Math.min(zoomLevels.length - 1, zoomIndex + Number(zoomButton.dataset.zoomStep)));
      updateZoom();
      return;
    }
    if (target.closest("[data-close-dialog]")) dialog.close();
  });

  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  window.addEventListener("hashchange", render);
  render();
})();
