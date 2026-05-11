/**
 * main.js
 * 앱 진입점: portfolio.json을 불러온 뒤 renderer 함수를 순서대로 호출하고 UI를 초기화합니다.
 * http(s)로 열 때는 fetch로 data/portfolio.json 을 사용하고,
 * file:// 로 열어 fetch 가 막히면 index.html 의 임베드 JSON(#portfolio-embedded-data)으로 대체합니다.
 */

(function () {
  /** JSON 파일 경로 (index.html 기준 상대 경로) */
  const DATA_URL = "./data/portfolio.json";

  /** fetch 실패·HTTP 오류 시 사용: index.html 내 <script type="application/json" id="portfolio-embedded-data"> */
  const EMBEDDED_DATA_ID = "portfolio-embedded-data";

  /**
   * index.html 에 넣어 둔 임베드 JSON을 파싱 (file:// 등에서 fetch 가 불가할 때)
   * @returns {object}
   */
  function loadEmbeddedPortfolioData() {
    const el = document.getElementById(EMBEDDED_DATA_ID);
    if (!el || !el.textContent.trim()) {
      throw new Error("임베드된 포트폴리오 데이터 요소가 없습니다.");
    }
    return JSON.parse(el.textContent.trim());
  }

  /**
   * 우선 fetch, 실패 시 임베드 JSON
   * @returns {Promise<object>}
   */
  async function loadPortfolioData() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (response.ok) {
        return await response.json();
      }
      console.warn(
        "[portfolio]",
        "fetch 응답이 ok 가 아닙니다. 임베드 JSON으로 대체합니다.",
        response.status,
        response.statusText
      );
    } catch (err) {
      console.warn("[portfolio]", "fetch 실패 — file:// 이거나 경로/서버 문제일 수 있습니다. 임베드 JSON으로 대체합니다.", err);
    }

    return loadEmbeddedPortfolioData();
  }

  /**
   * 로드·렌더링 중 오류 시 사용자에게 최소한의 안내를 히어로 영역에 표시
   * @param {string} message
   */
  function showFatalError(message) {
    const heroInner = document.querySelector("#hero .section__inner");
    if (!heroInner) return;

    heroInner.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = message;
    p.setAttribute("role", "alert");
    heroInner.appendChild(p);
  }

  /**
   * DOM 준비 후 실행되는 애플리케이션 부트스트랩
   */
  async function bootstrap() {
    let data;

    try {
      data = await loadPortfolioData();
    } catch (err) {
      console.error(err);
      showFatalError(
        "포트폴리오 데이터를 불러오지 못했습니다. data/portfolio.json 과 index.html 의 임베드 JSON(#portfolio-embedded-data)을 확인해 주세요."
      );
      if (window.portfolioUi) {
        window.portfolioUi.init();
      }
      return;
    }

    try {
      /** renderer.js에 정의된 함수들을 JSON 키와 매칭해 순서대로 호출 */
      renderHero(data.hero);
      renderAbout(data.about);
      renderTechStack(data.techStack);
      renderProjects(data.projects);
      renderExperience(data.experience);
      renderContact(data.contact);
    } catch (err) {
      console.error(err);
      showFatalError("데이터는 받았지만 화면을 그리는 중 오류가 발생했습니다. 콘솔 로그를 확인해 주세요.");
    } finally {
      /** 렌더 성공/실패와 관계없이 내비·햄버거·reveal UI는 동작하도록 초기화 */
      if (window.portfolioUi) {
        window.portfolioUi.init();
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootstrap();
  });
})();
