/**
 * renderer.js
 * portfolio.json 데이터를 받아 각 섹션 DOM을 채우고, 일부 섹션은 이벤트를 바인딩합니다.
 */

/**
 * HTML 특수문자 이스케이프 (innerHTML 삽입 시 XSS 완화)
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 링크 href 기본 검증
 * @param {unknown} raw
 * @returns {string}
 */
function sanitizeHref(raw) {
  if (raw == null) return "";
  const href = String(raw).trim();
  if (href === "") return "";
  if (/^javascript:/i.test(href) || /^data:/i.test(href)) return "";
  return href;
}

/**
 * 외부 링크 여부
 * @param {string} href
 * @returns {boolean}
 */
function isExternalHref(href) {
  return /^https?:\/\//i.test(href);
}

/**
 * 이미지 태그 공통: lazy 로딩 + alt (성능·접근성)
 * @param {string} src
 * @param {string} alt
 * @param {string} className
 * @returns {string}
 */
function imgTag(src, alt, className) {
  const safeSrc = escapeHtml(src);
  const safeAlt = escapeHtml(alt);
  const cls = className ? ` class="${escapeHtml(className)}"` : "";
  return `<img src="${safeSrc}" alt="${safeAlt}" loading="lazy"${cls} />`;
}

/**
 * 레벨 1~5 → 퍼센트 (프로그레스 바)
 * @param {unknown} level
 * @returns {number}
 */
function levelToPercent(level) {
  const n = Math.min(5, Math.max(1, Number(level) || 1));
  return n * 20;
}

function renderHero(hero) {
  const root = document.querySelector("#hero .section__inner");
  if (!root) return;

  const h = hero && typeof hero === "object" ? hero : {};

  const nameEn = escapeHtml(h.nameEn ?? "");
  const name = escapeHtml(h.name ?? "");
  const tagline = escapeHtml(h.tagline ?? "");
  const subTagline = escapeHtml(h.subTagline ?? "");

  const primary = h.ctaPrimary && typeof h.ctaPrimary === "object" ? h.ctaPrimary : {};
  const secondary = h.ctaSecondary && typeof h.ctaSecondary === "object" ? h.ctaSecondary : {};

  const primaryHref = sanitizeHref(primary.href) || "#";
  const secondaryHref = sanitizeHref(secondary.href) || "#";
  const primaryLabel = escapeHtml(primary.label ?? "바로가기");
  const secondaryLabel = escapeHtml(secondary.label ?? "더보기");

  const primaryTarget = isExternalHref(primaryHref) ? ' target="_blank"' : "";
  const primaryRel = isExternalHref(primaryHref) ? ' rel="noopener noreferrer"' : "";
  const secondaryTarget = isExternalHref(secondaryHref) ? ' target="_blank"' : "";
  const secondaryRel = isExternalHref(secondaryHref) ? ' rel="noopener noreferrer"' : "";

  const showScroll = Boolean(h.scrollIndicator);

  const scrollBlock = showScroll
    ? `
    <a class="hero__scroll" href="#about" aria-label="아래 소개 섹션으로 이동">
      <span class="hero__scroll-label">Scroll</span>
      <span class="hero__scroll-arrow" aria-hidden="true"></span>
    </a>
  `
    : "";

  root.innerHTML = `
    <div class="hero">
      <div class="hero__content">
        <p class="hero__name-en">${nameEn}</p>
        <h1 class="hero__name">${name}</h1>
        <p class="hero__tagline">
          <span class="hero__tagline-text" data-full-tagline="${tagline}">${tagline}</span>
          <span class="hero__tagline-cursor" aria-hidden="true"></span>
        </p>
        <p class="hero__subtagline">${subTagline}</p>
        <div class="hero__actions">
          <a class="hero__btn hero__btn--primary" href="${escapeHtml(primaryHref)}"${primaryTarget}${primaryRel}>${primaryLabel}</a>
          <a class="hero__btn hero__btn--secondary" href="${escapeHtml(secondaryHref)}"${secondaryTarget}${secondaryRel}>${secondaryLabel}</a>
        </div>
      </div>
      ${scrollBlock}
    </div>
  `.trim();
}

function bindHeroTyping() {
  if (window.__portfolioHeroTypingBound) return;
  window.__portfolioHeroTypingBound = true;

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const el = document.querySelector(".hero__tagline-text");
  if (!el) return;

  const fullText = el.dataset.fullTagline || el.textContent.trim();
  if (!fullText) return;

  el.textContent = "";
  let index = 0;
  const delay = 150;
  const timer = window.setInterval(() => {
    index += 1;
    el.textContent = fullText.slice(0, index);
    if (index >= fullText.length) {
      window.clearInterval(timer);
    }
  }, delay);
}

/**
 * About 섹션
 * @param {object} about
 */
function renderAbout(about) {
  const root = document.querySelector("#about .section__inner");
  if (!root) return;

  const a = about && typeof about === "object" ? about : {};
  const summary = escapeHtml(a.summary ?? "");
  const keywords = Array.isArray(a.keywords) ? a.keywords : [];
  const profileSrc = sanitizeHref(a.profileImage ?? "");
  const initials = escapeHtml(a.initials ?? "LB");
  const showAvail = Boolean(a.availableForWork);
  const availLabel = escapeHtml(a.availableLabel ?? "");

  const tagsHtml = keywords
    .map((k) => `<span class="about__tag">${escapeHtml(String(k))}</span>`)
    .join("");

  const statusHtml = showAvail
    ? `<div class="about__status"><span class="about__pulse" aria-hidden="true"></span><span class="about__badge">${availLabel}</span></div>`
    : "";

  const imgHtml =
    profileSrc && profileSrc !== "#"
      ? imgTag(profileSrc, "프로필 사진", "about__photo")
      : "";

  root.innerHTML = `
    <div class="about">
      <h2 class="about__title">About</h2>
      <div class="about__grid">
        <div class="about__avatar" data-about-avatar>
          ${imgHtml}
          <div class="about__initials" aria-hidden="true">${initials}</div>
        </div>
        <div class="about__body">
          ${statusHtml}
          <p class="about__summary">${summary}</p>
          <div class="about__tags">${tagsHtml}</div>
        </div>
      </div>
    </div>
  `.trim();

  const wrap = root.querySelector("[data-about-avatar]");
  const img = root.querySelector(".about__photo");
  if (wrap && img) {
    img.addEventListener("error", () => {
      wrap.classList.add("about__avatar--fallback");
    });
    if (img.complete && img.naturalWidth === 0) {
      wrap.classList.add("about__avatar--fallback");
    }
  } else if (wrap && !img) {
    wrap.classList.add("about__avatar--fallback");
  }
}

/**
 * Tech Stack 섹션 마크업 생성
 * @param {object} techStack
 */
function renderTechStack(techStack) {
  const root = document.querySelector("#tech-stack .section__inner");
  if (!root) return;

  const ts = techStack && typeof techStack === "object" ? techStack : {};
  const categories = Array.isArray(ts.categories) ? ts.categories : [];
  const guide = ts.levelGuide && typeof ts.levelGuide === "object" ? ts.levelGuide : {};

  const tabsHtml = categories
    .map((cat, i) => {
      const label = escapeHtml(cat.name ?? `Category ${i}`);
      const active = i === 0 ? " is-active" : "";
      return `<button type="button" class="techstack__tab${active}" data-tech-tab="${i}" aria-pressed="${i === 0 ? "true" : "false"}">${label}</button>`;
    })
    .join("");

  const panelsHtml = categories
    .map((cat, i) => {
      const items = Array.isArray(cat.items) ? cat.items : [];
      const active = i === 0 ? " is-active" : "";
      const itemsHtml = items
        .map((it) => {
          const name = escapeHtml(it.name ?? "");
          const level = Math.min(5, Math.max(1, Number(it.level) || 1));
          const noteRaw = it.note != null ? String(it.note).trim() : "";
          const hasNote = noteRaw.length > 0;
          const noteClass = hasNote ? " techstack__item--has-note" : "";
          const tooltip = hasNote
            ? `<div class="techstack__tooltip" role="tooltip">${escapeHtml(noteRaw)}</div>`
            : "";
          const pct = levelToPercent(level);
          return `
            <div class="techstack__item${noteClass}">
              <div class="techstack__item-head">
                <h3 class="techstack__item-name">${name}</h3>
                <span class="techstack__item-level">Lv ${level}</span>
              </div>
              ${tooltip}
              <div class="techstack__bar-track">
                <div class="techstack__bar-fill" data-level="${level}" style="width:0%"></div>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="techstack__panel${active}" data-tech-panel="${i}" role="tabpanel">
          <div class="techstack__list">${itemsHtml}</div>
        </div>
      `;
    })
    .join("");

  const legendItems = ["1", "2", "3", "4", "5"]
    .map((k) => {
      const label = escapeHtml(guide[k] ?? "");
      return `<li class="techstack__legend-item"><span class="techstack__legend-key">${k}</span><span>${label}</span></li>`;
    })
    .join("");

  root.innerHTML = `
    <div class="techstack">
      <h2 class="techstack__title">Tech Stack</h2>
      <div class="techstack__tabs" role="tablist" aria-label="기술 스택 카테고리">${tabsHtml}</div>
      ${panelsHtml}
      <div class="techstack__legend">
        <h3 class="techstack__legend-title">Level guide</h3>
        <ul class="techstack__legend-list">${legendItems}</ul>
      </div>
    </div>
  `.trim();
}

/**
 * Tech Stack 탭 + 프로그레스 바 IntersectionObserver
 */
function bindTechStackInteractions() {
  const section = document.getElementById("tech-stack");
  if (!section) return;

  let inView = false;

  function animatePanelBars(panel) {
    if (!panel || panel.dataset.barsDone === "1") return;
    panel.dataset.barsDone = "1";
    panel.querySelectorAll(".techstack__bar-fill").forEach((fill) => {
      const level = Number(fill.dataset.level) || 1;
      const pct = levelToPercent(level);
      fill.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.width = `${pct}%`;
        });
      });
    });
  }

  function animateActivePanel() {
    if (!inView) return;
    const active = section.querySelector(".techstack__panel.is-active");
    animatePanelBars(active);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          inView = true;
          animateActivePanel();
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  io.observe(section);

  section.querySelectorAll("[data-tech-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-tech-tab");
      section.querySelectorAll("[data-tech-tab]").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      section.querySelectorAll("[data-tech-panel]").forEach((p) => {
        p.classList.toggle("is-active", p.getAttribute("data-tech-panel") === idx);
      });
      animateActivePanel();
    });
  });
}

/**
 * 프로젝트 링크 버튼 HTML (live > demo > github 순, 존재하는 항목만)
 * @param {object} p
 * @returns {string}
 */
function buildProjectLinksHtml(p) {
  const links = [];
  const live = sanitizeHref(p.liveUrl);
  const demo = sanitizeHref(p.demoVideo);
  const gh = sanitizeHref(p.github);

  if (live) {
    links.push(
      `<a class="projects-modal__link" href="${escapeHtml(live)}" target="_blank" rel="noopener noreferrer" aria-label="라이브 사이트 열기">라이브 보기</a>`
    );
  }
  if (demo) {
    links.push(
      `<a class="projects-modal__link projects-modal__link--ghost" href="${escapeHtml(demo)}" target="_blank" rel="noopener noreferrer" aria-label="데모 영상 열기">데모 영상</a>`
    );
  }
  if (gh) {
    links.push(
      `<a class="projects-modal__link projects-modal__link--ghost" href="${escapeHtml(gh)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub 저장소 열기">GitHub</a>`
    );
  }
  return `<div class="projects-modal__actions">${links.join("")}</div>`;
}

/** @type {Record<string, object>} */
window.__portfolioProjectsById = {};

/**
 * Projects 섹션
 * @param {Array|object} projects
 */
function renderProjects(projects) {
  const root = document.querySelector("#projects .section__inner");
  if (!root) return;

  const list = Array.isArray(projects) ? projects : [];
  window.__portfolioProjectsById = {};
  list.forEach((p) => {
    if (p && p.id != null) window.__portfolioProjectsById[String(p.id)] = p;
  });

  const cardsHtml = list
    .map((p) => {
      const id = escapeHtml(p.id ?? "");
      const title = escapeHtml(p.title ?? "");
      const subtitle = escapeHtml(p.subtitle ?? "");
      const period = escapeHtml(p.period ?? "");
      const team = Number(p.teamSize) || 1;
      const badge =
        team === 1
          ? `<span class="projects__badge">개인 프로젝트</span>`
          : `<span class="projects__badge">팀 프로젝트 (${team}인)</span>`;
      const techs = Array.isArray(p.techStack) ? p.techStack : [];
      const thumb = sanitizeHref(p.thumbnail ?? "");
      const fallbackText = escapeHtml(techs[0] ? String(techs[0]) : "Project");

      const thumbBlock =
        thumb && thumb !== "#"
          ? `<div class="projects__thumb-wrap">${imgTag(thumb, `${title} 썸네일`, "projects__thumb")}</div>`
          : `<div class="projects__thumb-wrap"><div class="projects__thumb-fallback" aria-hidden="true">${fallbackText}</div></div>`;

      const highlights = p.highlights ? escapeHtml(String(p.highlights)) : "";
      const hiBlock = highlights
        ? `<blockquote class="projects__highlights">${highlights}</blockquote>`
        : "";

      return `
        <article class="projects__card" data-project-id="${id}" role="button" tabindex="0" aria-label="${title} 상세 보기">
          ${thumbBlock}
          <div class="projects__card-body">
            <div class="projects__meta-row">${badge}<span class="projects__period">${period}</span></div>
            <h3 class="projects__card-title">${title}</h3>
            <p class="projects__card-sub">${subtitle}</p>
            ${hiBlock}
          </div>
        </article>
      `;
    })
    .join("");

  root.innerHTML = `
    <div class="projects">
      <h2 class="projects__title">Projects</h2>
      <div class="projects__grid">${cardsHtml}</div>
    </div>
    <div id="projects-modal" class="projects-modal" hidden aria-hidden="true">
      <div class="projects-modal__backdrop" data-modal-backdrop tabindex="-1" aria-label="닫기"></div>
      <div class="projects-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="projects-modal-title">
        <button type="button" class="projects-modal__close" data-modal-close aria-label="상세 창 닫기">×</button>
        <div class="projects-modal__body" id="projects-modal-body"></div>
      </div>
    </div>
  `.trim();

  root.querySelectorAll(".projects__thumb").forEach((img) => {
    img.addEventListener("error", () => {
      const w = img.closest(".projects__thumb-wrap");
      if (!w) return;
      const card = img.closest(".projects__card");
      const techFirst = card ? card.querySelector(".projects__card-title") : null;
      const text = techFirst ? techFirst.textContent.trim().slice(0, 24) : "Project";
      img.remove();
      const fb = document.createElement("div");
      fb.className = "projects__thumb-fallback";
      fb.setAttribute("aria-hidden", "true");
      fb.textContent = text;
      w.appendChild(fb);
    });
  });
}

function fillProjectModal(project) {
  const body = document.getElementById("projects-modal-body");
  if (!body || !project) return;

  const rawTitle = String(project.title ?? "");
  const title = escapeHtml(rawTitle);
  const subtitle = escapeHtml(project.subtitle ?? "");
  const period = escapeHtml(project.period ?? "");
  const role = escapeHtml(project.role ?? "");
  const desc = escapeHtml(project.description ?? "");
  const features = Array.isArray(project.features) ? project.features : [];
  const techs = Array.isArray(project.techStack) ? project.techStack : [];
  const arch = sanitizeHref(project.architectureDiagram ?? "");
  const thumb = sanitizeHref(project.thumbnail ?? "");

  const featuresHtml = features.map((f) => `<li>${escapeHtml(String(f))}</li>`).join("");
  const tagsHtml = techs.map((t) => `<span class="projects-modal__tag">${escapeHtml(String(t))}</span>`).join("");

  const archBlock =
    arch && arch !== "#"
      ? `<figure class="projects-modal__arch-wrap">${imgTag(arch, `${rawTitle} 아키텍처 다이어그램`, "projects-modal__arch")}</figure>`
      : "";

  const thumbTop =
    thumb && thumb !== "#"
      ? imgTag(thumb, `${rawTitle} 썸네일`, "projects-modal__thumb")
      : `<div class="projects-modal__thumb-fallback" aria-hidden="true">${escapeHtml(techs[0] ? String(techs[0]) : rawTitle)}</div>`;

  const linksHtml = buildProjectLinksHtml(project);

  body.innerHTML = `
    ${thumbTop}
    <h3 id="projects-modal-title" class="projects-modal__title">${title}</h3>
    <p class="projects-modal__sub">${subtitle}</p>
    <div class="projects-modal__meta"><span>${period}</span><span>${role}</span></div>
    <p class="projects-modal__desc">${desc}</p>
    <p class="projects-modal__features-title">주요 기능</p>
    <ul class="projects-modal__features">${featuresHtml}</ul>
    ${archBlock}
    <div class="projects-modal__tags">${tagsHtml}</div>
    ${linksHtml}
  `;

  const archImg = body.querySelector(".projects-modal__arch");
  if (archImg) {
    archImg.addEventListener("error", () => {
      const fig = archImg.closest("figure");
      if (fig) fig.remove();
    });
  }
}

function bindProjectsModal() {
  const root = document.querySelector("#projects .section__inner");
  const modal = document.getElementById("projects-modal");
  if (!root || !modal) return;

  const body = document.getElementById("projects-modal-body");
  const backdrop = modal.querySelector("[data-modal-backdrop]");
  const closeBtn = modal.querySelector("[data-modal-close]");

  function openModal(id) {
    const p = window.__portfolioProjectsById[id];
    if (!p) return;
    fillProjectModal(p);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (body) body.innerHTML = "";
  }

  root.querySelectorAll(".projects__card").forEach((card) => {
    const open = () => {
      const id = card.getAttribute("data-project-id");
      if (id) openModal(id);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  backdrop?.addEventListener("click", closeModal);
  closeBtn?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}

/**
 * Experience 섹션
 * @param {Array|object} experience
 */
function renderExperience(experience) {
  const root = document.querySelector("#experience .section__inner");
  if (!root) return;

  const ex = experience && typeof experience === "object" && !Array.isArray(experience) ? experience : {};
  const work = Array.isArray(ex.work) ? ex.work : [];
  const education = Array.isArray(ex.education) ? ex.education : [];
  const training = Array.isArray(ex.training) ? ex.training : [];
  const certifications = Array.isArray(ex.certifications) ? ex.certifications : [];
  const activities = Array.isArray(ex.activities) ? ex.activities : [];

  const workHtml = work
    .map((row) => {
      const company = escapeHtml(row.company ?? "");
      const title = escapeHtml(row.title ?? "");
      const period = escapeHtml(row.period ?? "");
      const duration = escapeHtml(row.duration ?? "");
      const location = escapeHtml(row.location ?? "");
      const leaving = escapeHtml(row.leavingReason ?? "");
      const tasks = Array.isArray(row.tasks) ? row.tasks : [];
      const tasksHtml =
        tasks.length > 0
          ? `<ul class="experience__work-tasks">${tasks
              .map((t) => `<li>${escapeHtml(String(t))}</li>`)
              .join("")}</ul>`
          : "";

      const metaParts = [period, duration, location].filter(Boolean);
      const meta = metaParts.map((m) => `<span>${m}</span>`).join("");
      const leavingBlock = leaving ? `<p class="experience__card-note">퇴사사유: ${leaving}</p>` : "";

      return `
        <li class="experience__tl-item">
          <span class="experience__tl-dot" aria-hidden="true"></span>
          <div class="experience__card">
            <h3 class="experience__card-title">${company}</h3>
            <p class="experience__card-sub">${title}</p>
            <div class="experience__card-meta">${meta}</div>
            ${tasksHtml}
            ${leavingBlock}
          </div>
        </li>
      `;
    })
    .join("");

  const eduHtml = education
    .map((row) => {
      const title = escapeHtml(row.institution ?? "");
      const sub = [row.major, row.degree]
        .filter(Boolean)
        .map((x) => escapeHtml(String(x)))
        .join(" · ");
      const period = escapeHtml(row.period ?? "");
      const status = escapeHtml(row.status ?? "");
      const note = row.note ? escapeHtml(String(row.note)) : "";
      const noteBlock = note ? `<p class="experience__card-note">${note}</p>` : "";
      return `
        <li class="experience__tl-item">
          <span class="experience__tl-dot" aria-hidden="true"></span>
          <div class="experience__card">
            <h3 class="experience__card-title">${title}</h3>
            <p class="experience__card-sub">${sub}</p>
            <div class="experience__card-meta"><span>${period}</span><span>${status}</span></div>
            ${noteBlock}
          </div>
        </li>
      `;
    })
    .join("");

  const trainHtml = training
    .map((row) => {
      const title = escapeHtml(row.institution ?? "");
      const course = escapeHtml(row.courseName ?? "");
      const period = escapeHtml(row.period ?? "");
      const status = escapeHtml(row.status ?? "");
      const hours = row.hours ? `총 ${escapeHtml(String(row.hours))}` : "";
      const skills = Array.isArray(row.skills) ? row.skills : [];
      const skillsHtml = skills.map((s) => `<span class="experience__skill">${escapeHtml(String(s))}</span>`).join("");
      const metaParts = [period, status, hours].filter(Boolean);
      return `
        <li class="experience__tl-item">
          <span class="experience__tl-dot" aria-hidden="true"></span>
          <div class="experience__card">
            <h3 class="experience__card-title">${title}</h3>
            <p class="experience__card-sub">${course}</p>
            <div class="experience__card-meta">${metaParts.map((m) => `<span>${m}</span>`).join("")}</div>
            <div class="experience__skills">${skillsHtml}</div>
          </div>
        </li>
      `;
    })
    .join("");

  const certHtml = certifications
    .map((c) => {
      const name = escapeHtml(c.name ?? "");
      const issuer = escapeHtml(c.issuer ?? "");
      const date = escapeHtml(c.date ?? "");
      const status = escapeHtml(c.status ?? "");
      return `
        <article class="experience__cert">
          <div class="experience__cert-icon" aria-hidden="true">🏆</div>
          <div class="experience__cert-body">
            <h3 class="experience__cert-name">${name}</h3>
            <p class="experience__cert-issuer">${issuer}</p>
            <p class="experience__cert-date">${date} · ${status}</p>
          </div>
        </article>
      `;
    })
    .join("");

  const actHtml = activities
    .map((a) => {
      return `
        <article class="experience__activity">
          <h3 class="experience__activity-title">${escapeHtml(a.title ?? "")}</h3>
          <p class="experience__activity-period">${escapeHtml(a.period ?? "")}</p>
          <p class="experience__activity-desc">${escapeHtml(a.description ?? "")}</p>
        </article>
      `;
    })
    .join("");

  root.innerHTML = `
    <div class="experience">
      <h2 class="experience__title">Experience</h2>
      <div class="experience__tabs" role="tablist" aria-label="경력·이력 구분">
        <button type="button" class="experience__tab" data-exp-tab="work" aria-selected="false" role="tab">경력</button>
        <button type="button" class="experience__tab" data-exp-tab="education" aria-selected="false" role="tab">학력</button>
        <button type="button" class="experience__tab is-active" data-exp-tab="training" aria-selected="true" role="tab">교육</button>
        <button type="button" class="experience__tab" data-exp-tab="certifications" aria-selected="false" role="tab">자격증</button>
        <button type="button" class="experience__tab" data-exp-tab="activities" aria-selected="false" role="tab">활동</button>
      </div>
      <div class="experience__panel" data-exp-panel="work" role="tabpanel"><ul class="experience__timeline">${workHtml}</ul></div>
      <div class="experience__panel" data-exp-panel="education" role="tabpanel"><ul class="experience__timeline">${eduHtml}</ul></div>
      <div class="experience__panel is-active" data-exp-panel="training" role="tabpanel"><ul class="experience__timeline">${trainHtml}</ul></div>
      <div class="experience__panel" data-exp-panel="certifications" role="tabpanel"><div class="experience__certs">${certHtml}</div></div>
      <div class="experience__panel" data-exp-panel="activities" role="tabpanel"><div class="experience__activities">${actHtml}</div></div>
    </div>
  `.trim();
}

function bindExperienceTabs() {
  const root = document.querySelector("#experience .experience");
  if (!root) return;

  root.querySelectorAll("[data-exp-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-exp-tab");
      root.querySelectorAll("[data-exp-tab]").forEach((b) => {
        const on = b.getAttribute("data-exp-tab") === key;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      root.querySelectorAll("[data-exp-panel]").forEach((p) => {
        p.classList.toggle("is-active", p.getAttribute("data-exp-panel") === key);
      });
    });
  });
}

/**
 * Contact 섹션 + mailto 폼
 * @param {object} contact
 */
function renderContact(contact) {
  const root = document.querySelector("#contact .section__inner");
  if (!root) return;

  const c = contact && typeof contact === "object" ? contact : {};
  const emailAddr = String(c.email ?? "").trim();
  const emailDisplay = escapeHtml(emailAddr);
  const mailHref = emailAddr ? `mailto:${emailAddr}` : "#";

  const phonePlain = String(c.phone ?? "").trim();
  const phoneDisplay = escapeHtml(phonePlain);
  const telHref = phonePlain ? `tel:${phonePlain.replace(/[^\d+]/g, "")}` : "";
  const github = sanitizeHref(c.github ?? "");
  const linkedin = sanitizeHref(c.linkedin ?? "");
  const blog = sanitizeHref(c.blog ?? "");

  const liBlock =
    linkedin && linkedin !== "#"
      ? `<a class="contact__link" href="${escapeHtml(linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn 프로필 열기">
          <span class="contact__link-icon" aria-hidden="true">in</span>
          <span class="contact__link-text"><span class="contact__link-label">LinkedIn</span><span class="contact__link-value">프로필</span></span>
        </a>`
      : "";

  const blogBlock =
    blog && blog !== "#"
      ? `<a class="contact__link" href="${escapeHtml(blog)}" target="_blank" rel="noopener noreferrer" aria-label="블로그 열기">
          <span class="contact__link-icon" aria-hidden="true">↗</span>
          <span class="contact__link-text"><span class="contact__link-label">Blog</span><span class="contact__link-value">방문하기</span></span>
        </a>`
      : "";

  const formEnabled = Boolean(c.formEnabled);
  const ph = c.formPlaceholder && typeof c.formPlaceholder === "object" ? c.formPlaceholder : {};
  const pName = escapeHtml(ph.name ?? "이름");
  const pEmail = escapeHtml(ph.email ?? "이메일");
  const pMsg = escapeHtml(ph.message ?? "메시지");
  const pSubmit = escapeHtml(ph.submit ?? "보내기");
  const responseNote = escapeHtml(c.responseNote ?? "");

  const formHtml = formEnabled
    ? `
    <form class="contact__form" id="contact-form" novalidate data-mailto="${escapeHtml(emailAddr)}">
      <div class="contact__field">
        <label class="contact__label" for="contact-name">${pName}</label>
        <input class="contact__input" id="contact-name" name="name" type="text" autocomplete="name" required placeholder="${pName}" />
        <p class="contact__error" data-error-for="name" aria-live="polite"></p>
      </div>
      <div class="contact__field">
        <label class="contact__label" for="contact-email">${pEmail}</label>
        <input class="contact__input" id="contact-email" name="email" type="email" autocomplete="email" required placeholder="${pEmail}" />
        <p class="contact__error" data-error-for="email" aria-live="polite"></p>
      </div>
      <div class="contact__field">
        <label class="contact__label" for="contact-message">${pMsg}</label>
        <textarea class="contact__textarea" id="contact-message" name="message" required minlength="10" placeholder="${pMsg}"></textarea>
        <p class="contact__error" data-error-for="message" aria-live="polite"></p>
      </div>
      <button type="submit" class="contact__submit" aria-label="메일 앱으로 보내기">${pSubmit}</button>
      <p class="contact__note">${responseNote}</p>
      <div class="contact__success" id="contact-success" role="status">메일 앱이 열립니다. 메시지를 확인한 뒤 전송해 주세요.</div>
    </form>
  `
    : "";

  root.innerHTML = `
    <div class="contact">
      <h2 class="contact__title">Contact</h2>
      <div class="contact__grid">
        <div>
          <h3 class="contact__info-title">연락처</h3>
          <div class="contact__links">
            <a class="contact__link" href="${escapeHtml(mailHref)}" aria-label="이메일 보내기">
              <span class="contact__link-icon" aria-hidden="true">✉</span>
              <span class="contact__link-text"><span class="contact__link-label">Email</span><span class="contact__link-value">${emailDisplay}</span></span>
            </a>
            ${
              phonePlain
                ? `<a class="contact__link" href="${escapeHtml(telHref)}" aria-label="전화 걸기">
              <span class="contact__link-icon" aria-hidden="true">☎</span>
              <span class="contact__link-text"><span class="contact__link-label">Phone</span><span class="contact__link-value">${phoneDisplay}</span></span>
            </a>`
                : ""
            }
            ${
              github && github !== "#"
                ? `<a class="contact__link" href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub 열기">
              <span class="contact__link-icon" aria-hidden="true">⌘</span>
              <span class="contact__link-text"><span class="contact__link-label">GitHub</span><span class="contact__link-value">저장소</span></span>
            </a>`
                : ""
            }
            ${liBlock}
            ${blogBlock}
          </div>
        </div>
        ${formHtml ? `<div>${formHtml}</div>` : ""}
      </div>
    </div>
  `.trim();
}

function bindContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const success = document.getElementById("contact-success");

  function setErr(field, msg) {
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = msg || "";
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    setErr("name", "");
    setErr("email", "");
    setErr("message", "");
    if (success) success.classList.remove("is-visible");

    const name = form.querySelector("#contact-name")?.value.trim() ?? "";
    const email = form.querySelector("#contact-email")?.value.trim() ?? "";
    const message = form.querySelector("#contact-message")?.value.trim() ?? "";

    let ok = true;
    if (!name) {
      setErr("name", "이름을 입력해 주세요.");
      ok = false;
    }
    if (!email || !validateEmail(email)) {
      setErr("email", "올바른 이메일 형식을 입력해 주세요.");
      ok = false;
    }
    if (!message || message.length < 10) {
      setErr("message", "메시지는 최소 10자 이상 입력해 주세요.");
      ok = false;
    }
    if (!ok) return;

    const subject = encodeURIComponent(`[Portfolio] ${name} 님의 메시지`);
    const body = encodeURIComponent(`이름: ${name}\n이메일: ${email}\n\n${message}`);
    const mailtoBase = (form.getAttribute("data-mailto") || "").trim();
    window.location.href = `mailto:${mailtoBase}?subject=${subject}&body=${body}`;
    if (success) success.classList.add("is-visible");
  });
}

/**
 * 섹션별 동적 UI 바인딩 (main.js에서 렌더 직후 1회 호출)
 */
function portfolioBindDynamicSections() {
  if (window.__portfolioDynamicBound) return;
  window.__portfolioDynamicBound = true;
  bindHeroTyping();
  bindTechStackInteractions();
  bindProjectsModal();
  bindExperienceTabs();
  bindContactForm();
}

window.portfolioBindDynamicSections = portfolioBindDynamicSections;
