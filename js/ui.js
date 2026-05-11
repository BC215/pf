/**
 * ui.js
 * 스크롤·클릭 등 사용자 인터랙션: 내비 활성 표시, 모바일 메뉴, 스크롤 애니메이션.
 * 전역 객체에 init을 노출해 main.js에서 데이터 렌더 이후 한 번 호출합니다.
 */

(function () {
  /** 관찰할 섹션 id 목록 (index.html의 앵커와 동일한 순서 권장) */
  const SECTION_IDS = [
    "hero",
    "about",
    "tech-stack",
    "projects",
    "experience",
    "contact",
  ];

  /**
   * 현재 스크롤 위치에 가장 가까운 섹션에 해당하는 내비 링크에 하이라이트 적용
   */
  function initNavActiveHighlight() {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll('.site-nav__link[href^="#"]'));
    const idToLink = new Map(
      links.map((a) => {
        const id = a.getAttribute("href").slice(1);
        return [id, a];
      })
    );

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);

    if (sections.length === 0) return;

    /** 모든 링크에서 활성 클래스 제거 (.active 는 요구사항 명시 클래스) */
    function clearActive() {
      links.forEach((link) => link.classList.remove("active", "is-active"));
    }

    /**
     * IntersectionObserver: 뷰포트와 겹치는 비율이 threshold를 넘으면 콜백 호출
     * rootMargin으로 상단 내비 높이만큼 보정해 "보이는 구역" 기준을 맞춤
     */
    const observer = new IntersectionObserver(
      (entries) => {
        /** 가장 많이 보이는 항목을 우선 선택 */
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = visible.target.id;
        const link = idToLink.get(id);
        if (!link) return;

        clearActive();
        link.classList.add("active");
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));

    /** 첫 로드 시 첫 번째 섹션 활성화 */
    const firstId = sections[0].id;
    const firstLink = idToLink.get(firstId);
    if (firstLink) {
      clearActive();
      firstLink.classList.add("active");
    }
  }

  /**
   * 모바일 햄버거 메뉴: 패널 열림/닫힘 및 접근성 속성 동기화
   */
  function initHamburgerMenu() {
    const nav = document.querySelector(".site-nav");
    const toggle = document.querySelector(".site-nav__toggle");
    const menu = document.getElementById("site-nav-menu");

    if (!nav || !toggle || !menu) return;

    function setOpen(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
    }

    toggle.addEventListener("click", () => {
      const next = !nav.classList.contains("is-open");
      setOpen(next);
    });

    /** 앵커 클릭 시 모바일 메뉴 자동 닫기 (레이아웃 겹침 방지) */
    menu.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 47.99rem)").matches) {
          setOpen(false);
        }
      });
    });

    /** 창 크기가 커지면 열린 모바일 상태 초기화 */
    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 47.99rem)").matches) {
        setOpen(false);
      }
    });
  }

  /**
   * .reveal 요소가 뷰포트에 들어오면 .is-visible 추가 (CSS 전환과 연동)
   */
  function initScrollReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (elements.length === 0) return;

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          /** 한 번만 재생하려면 관찰 해제 */
          obs.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      }
    );

    elements.forEach((el) => revealObserver.observe(el));
  }

  /**
   * 외부(main.js)에서 호출하는 초기화 진입점
   */
  function init() {
    initNavActiveHighlight();
    initHamburgerMenu();
    initScrollReveal();
  }

  /** 모듈 시스템 없이 main.js와 연동 */
  window.portfolioUi = { init };
})();
