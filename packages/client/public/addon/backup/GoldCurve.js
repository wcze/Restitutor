(() => {
   const storageKey = "restitutor-addon-gold-history";
   const translations = {
      en: "Gold Curve",
      de: "Goldkurve",
      "zh-CN": "金币曲线",
      ru: "График золота",
      fr: "Courbe de l'or",
      es: "Curva de oro",
      tr: "Altın Grafiği",
   };
   const localizedText = {
      en: { gold: "Gold", loans: "Loans", availableGold: "Available gold", actualGold: "Actual gold", noData: "No gold data", day: "Day", month: "Month", year: "Year", days: "days", months: "months", years: "years", close: "Close", availableTip: "Your province's available gold (excluding loans)", actualTip: "Your province's actual gold (including loans)" },
      de: { gold: "Gold", noData: "Keine Golddaten", day: "Tag", month: "Monat", year: "Jahr", close: "Close" },
      "zh-CN": { gold: "\u91d1\u5e01", noData: "\u6682\u65e0\u91d1\u5e01\u6570\u636e", day: "\u65e5", month: "\u6708", year: "\u5e74", close: "\u5173\u95ed" },
      ru: { gold: "\u0417\u043e\u043b\u043e\u0442\u043e", noData: "\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445", day: "\u0414\u0435\u043d\u044c", month: "\u041c\u0435\u0441\u044f\u0446", year: "\u0413\u043e\u0434", close: "\u0417\u0430\u043a\u0440\u044b\u0442\u044c" },
      fr: { gold: "Or", noData: "Aucune donnee", day: "Jour", month: "Mois", year: "An", close: "Fermer" },
      es: { gold: "Oro", noData: "Sin datos", day: "Dia", month: "Mes", year: "Ano", close: "Cerrar" },
      tr: { gold: "Altin", noData: "Altin verisi yok", day: "Gun", month: "Ay", year: "Yil", close: "Kapat" },
   };
   const loanText = {
      en: { ago: " ago", loans: "Loans" },
      de: { loans: "Darlehen", availableGold: "Verfugbares Gold", actualGold: "Tatsachliches Gold", days: "Tage", months: "Monate", years: "Jahre", ago: " vor" },
      "zh-CN": { loans: "\u8d37\u6b3e", availableGold: "\u53ef\u7528\u91d1\u5e01", actualGold: "\u5b9e\u9645\u91d1\u5e01", days: "\u5929", months: "\u4e2a\u6708", years: "\u5e74", ago: "\u524d" },
      ru: { loans: "\u0417\u0430\u0439\u043c\u044b", availableGold: "\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0435 \u0437\u043e\u043b\u043e\u0442\u043e", actualGold: "\u0424\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u0437\u043e\u043b\u043e\u0442\u043e", days: "\u0434\u043d\u0435\u0439", months: "\u043c\u0435\u0441\u044f\u0446\u0435\u0432", years: "\u043b\u0435\u0442", ago: " \u043d\u0430\u0437\u0430\u0434" },
      fr: { loans: "Prets", availableGold: "Or disponible", actualGold: "Or reel", days: "jours", months: "mois", years: "ans", ago: " auparavant" },
      es: { loans: "Prestamos", availableGold: "Oro disponible", actualGold: "Oro real", days: "dias", months: "meses", years: "anos", ago: " atras" },
      tr: { loans: "Loans", availableGold: "Mevcut altin", actualGold: "Gercek altin", days: "gun", months: "ay", years: "yil", ago: " once" },
   };

   const modeTips = {
      en: ["Available gold (excluding loans)", "Actual gold (including loans)"],
      de: ["Verfügbares Gold (ohne Darlehen)", "Tatsächliches Gold (einschließlich Darlehen)"],
      "zh-CN": ["可用金币（不含贷款）", "实际金币（含贷款）"],
      ru: ["Доступное золото (без долгов)", "Фактическое золото (с долгами)"],
      fr: ["Or disponible (hors prêts)", "Or réel (avec prêts)"],
      es: ["Oro disponible (sin préstamos)", "Oro real (con préstamos)"],
   };
   const history = loadHistory();
   let period = "day";
   let lastTick = -1;
   let panel;
   let canvas;
   let hoveredPoint = -1;
   let goldMode = "available";

   addStyles();
   addButton();
   pollGold();
   setInterval(pollGold, 250);
   GameStateUpdated.on(() => {
      addButton();
      recordGold();
      drawChart();
   });

   function pollGold() {
      if (!G.save?.state) return;
      if (G.save.state.tick !== lastTick) {
         recordGold();
         drawChart();
      }
   }

   function recordGold() {
      const state = G.save?.state;
      const province = state?.provinces?.[state.playerProvince];
      if (!state || !province || state.tick === lastTick) return;
      if (history.stateId !== state.id) {
         history.daily = [];
         history.monthly = [];
         history.yearly = [];
         history.lastMonth = -1;
         history.lastYear = -1;
         history.stateId = state.id;
         lastTick = -1;
      }
      lastTick = state.tick;
      const available = province.resources.gold[0] - province.resources.gold[1];
      const loans = Array.isArray(province.loans) ? province.loans : [];
      const loanTotal = loans.reduce((total, loan) => total + Number(loan.principal || 0) + Number(loan.interest || 0), 0);
      const actual = available - loanTotal;
      const previous = history.daily[history.daily.length - 1];
      if (previous && state.tick > previous.tick + 1) {
         for (let tick = previous.tick + 1; tick < state.tick; tick++) {
            const date = new Date(193, 0, tick);
            const month = (date.getFullYear() - 193) * 12 + date.getMonth();
            history.daily.push({ tick, month, available: previous.available, actual: previous.actual, loans: previous.loans });
         }
      }
      history.daily.push({ tick: state.tick, month: state.month, available, actual, loans: loanTotal });
      if (history.daily.length > 60) history.daily.splice(0, history.daily.length - 60);
      if (history.lastMonth !== state.month) {
         history.monthly.push({ tick: state.tick, month: state.month, available, actual, loans: loanTotal });
         if (history.monthly.length > 36) history.monthly.splice(0, history.monthly.length - 36);
         history.lastMonth = state.month;
      }
      const year = Math.floor(state.month / 12);
      if (history.lastYear !== year) {
         history.yearly.push({ tick: state.tick, month: state.month, available, actual, loans: loanTotal });
         if (history.yearly.length > 24) history.yearly.splice(0, history.yearly.length - 24);
         history.lastYear = year;
      }
      saveHistory();
   }

   function addButton() {
      if (document.querySelector("[data-addon-gold-button]")) return;
      const button = document.createElement("button");
      button.className = "addon-gold-button";
      button.setAttribute("data-addon-gold-button", "");
      button.setAttribute("aria-label", getTranslation());
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3V19H21V21H3V3H5ZM19.9393 5.93934L22.0607 8.06066L16 14.1213L13 11.121L9.06066 15.0607L6.93934 12.9393L13 6.87868L16 9.879L19.9393 5.93934Z"></path></svg>`;
      button.addEventListener("click", () => {
         if (panel) {
            panel.closest(".addon-gold-overlay")?.remove();
            panel = undefined;
            return;
         }
         panel = createPanel();
         const overlay = document.createElement("div");
         overlay.className = "modal-overlay addon-gold-overlay";
         overlay.addEventListener("mousedown", (event) => {
            if (event.target === overlay) {
               overlay.remove();
               panel = undefined;
            }
         });
         overlay.appendChild(panel);
         document.body.appendChild(overlay);
         drawChart();
      });
      const topPanel = document.querySelector(".top-right-panel");
      const buttonTooltip = document.createElement("div");
      buttonTooltip.className = "addon-gold-button-tooltip floating-tip panel";
      buttonTooltip.style.display = "none";
      button.addEventListener("mouseenter", (event) => showButtonTooltip(event, buttonTooltip));
      button.addEventListener("mousemove", (event) => showButtonTooltip(event, buttonTooltip));
      button.addEventListener("mouseleave", () => {
         hideButtonTooltip(buttonTooltip);
      });
      document.body.appendChild(buttonTooltip);
      if (topPanel) topPanel.prepend(button);
      else new MutationObserver((_mutations, observer) => {
         const panel = document.querySelector(".top-right-panel");
         if (panel) {
            panel.prepend(button);
            observer.disconnect();
         }
      }).observe(document.body, { childList: true, subtree: true });
   }

   function showButtonTooltip(event, tooltip, content = getTranslation()) {
      tooltip.textContent = content;
      tooltip.style.display = "block";
      tooltip.style.left = `${event.clientX + 40}px`;
      tooltip.style.top = `${event.clientY + -13}px`;
   }

   function hideButtonTooltip(tooltip) {
      tooltip.style.display = "none";
   }

   function getTranslation() {
      return translations[G.save?.options?.language] || translations.en;
   }

   function getPeriodLabels() {
      const language = G.save?.options?.language;
      const labels = {
         en: ["Day", "Month", "Year"],
         de: ["Tag", "Monat", "Jahr"],
         "zh-CN": ["日", "月", "年"],
         ru: ["День", "Месяц", "Год"],
         fr: ["Jour", "Mois", "An"],
         es: ["Día", "Mes", "Año"],
         tr: ["Gün", "Ay", "Yıl"],
      };
      const selected = labels[language] || labels.en;
      return { day: selected[0], month: selected[1], year: selected[2] };
   }

   function getPeriodLabels() {
      const labels = {
         en: ["Day", "Month", "Year"],
         de: ["Tag", "Monat", "Jahr"],
         "zh-CN": ["日", "月", "年"],
         ru: ["День", "Месяц", "Год"],
         fr: ["Jour", "Mois", "An"],
         es: ["Día", "Mes", "Año"],
         tr: ["Gün", "Ay", "Yıl"],
      };
      const selected = labels[G.save?.options?.language] || labels.en;
      return { day: selected[0], month: selected[1], year: selected[2] };
   }

   function getLocalizedText() {
      const language = G.save?.options?.language;
      const text = { ...localizedText.en, ...(localizedText[language] || {}), ...(loanText[language] || {}) };
      return {
         ...text,
         availableTip: text.availableTip || localizedText.en.availableTip,
         actualTip: text.actualTip || localizedText.en.actualTip,
      };
   }

   getPeriodLabels = () => {
      const labels = { en: ["Day", "Month", "Year"], de: ["Tag", "Monat", "Jahr"], "zh-CN": ["日", "月", "年"], ru: ["День", "Месяц", "Год"], fr: ["Jour", "Mois", "An"], es: ["Día", "Mes", "Año"], tr: ["Gün", "Ay", "Yıl"] };
      const selected = labels[G.save?.options?.language] || labels.en;
      return { day: selected[0], month: selected[1], year: selected[2] };
   };

   getPeriodLabels = () => {
      const text = getLocalizedText();
      return { day: text.day, month: text.month, year: text.year };
   };

   function formatDate(tick) {
      const date = new Date(193, 0, tick);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
   }

   function createPanel() {
      const root = document.createElement("section");
      root.className = "modal panel lg addon-gold-panel";
      root.innerHTML = `
         <header class="header addon-gold-header">
            <div class="addon-gold-title"></div>
            <div class="mi pointer addon-gold-close" aria-label="">close</div>
         </header>
         <div class="modal-content">
            <nav class="addon-gold-tabs">
               <button data-period="day"></button>
               <button data-period="month"></button>
               <button data-period="year"></button>
               <label class="addon-gold-option addon-gold-option-available"><input type="radio" name="gold-mode" value="available" checked><span></span></label>
               <label class="addon-gold-option addon-gold-option-actual"><input type="radio" name="gold-mode" value="actual"><span></span></label>
            </nav>
            <div class="addon-gold-chart-wrap">
               <canvas class="addon-gold-chart" width="760" height="320"></canvas>
            </div>
         </div>
         <div class="addon-gold-tooltip floating-tip panel"></div>
      `;
      const text = getLocalizedText();
      root.querySelector(".addon-gold-option-available span").textContent = text.availableGold;
      root.querySelector(".addon-gold-option-actual span").textContent = text.actualGold;
      root.querySelector(".addon-gold-close").setAttribute("aria-label", text.close);
      root.querySelectorAll('[name="gold-mode"]').forEach((option) => {
         option.checked = option.value === goldMode;
      });
      root.querySelector(".addon-gold-title").textContent = getTranslation();
      const labels = getPeriodLabels();
      root.querySelector('[data-period="day"]').textContent = labels.day;
      root.querySelector('[data-period="month"]').textContent = labels.month;
      root.querySelector('[data-period="year"]').textContent = labels.year;
      root.querySelectorAll('[name="gold-mode"]').forEach((option) => option.addEventListener("change", () => { goldMode = option.value; drawChart(); }));
      root.querySelector(".addon-gold-close").addEventListener("click", () => {
         root.closest(".addon-gold-overlay")?.remove();
         panel = undefined;
      });
      root.querySelectorAll("[data-period]").forEach((tab) => {
         tab.addEventListener("click", () => {
            period = tab.dataset.period;
            root.querySelectorAll("[data-period]").forEach((item) => item.classList.toggle("active", item === tab));
            drawChart();
         });
      });
      root.querySelector(`[data-period="${period}"]`).classList.add("active");
      canvas = root.querySelector(".addon-gold-chart");
      const tooltip = root.querySelector(".addon-gold-tooltip");
      root.querySelectorAll('[name="gold-mode"]').forEach((option) => {
         const optionTip = (modeTips[G.save?.options?.language] || modeTips.en)[option.value === "available" ? 0 : 1];
         const label = option.closest(".addon-gold-option");
         label.addEventListener("mouseenter", (event) => showButtonTooltip(event, tooltip, optionTip));
         label.addEventListener("mousemove", (event) => showButtonTooltip(event, tooltip, optionTip));
         label.addEventListener("mouseleave", () => hideButtonTooltip(tooltip));
      });
      canvas.addEventListener("mousemove", (event) => showPointTooltip(event, tooltip));
      canvas.addEventListener("mouseleave", () => {
         hoveredPoint = -1;
         tooltip.style.display = "none";
         drawChart();
      });
      return root;
   }

   function showPointTooltip(event, tooltip) {
      const points = period === "day" ? history.daily : period === "month" ? history.monthly : history.yearly;
      if (points.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const index = Math.max(0, Math.min(points.length - 1, Math.round(((x - 58) / (760 - 76)) * (points.length - 1))));
      const point = points[index];
      hoveredPoint = index;
      drawChart();
      const relativeValue = period === "day" ? point.tick : period === "month" ? point.month : Math.floor(point.month / 12);
      const text = getLocalizedText();
      const relativeUnit = period === "day" ? text.days : period === "month" ? text.months : text.years;
      const relative = relativeValue === 0 ? "" : ` (${relativeValue} ${relativeUnit})`;
      const actualDetails = goldMode === "actual"
         ? `<div>${text.loans}: ${formatNumber(point.loans || 0)}</div><div>${text.availableGold}: ${formatNumber(point.available)}</div>`
         : "";
      tooltip.innerHTML = `<div>${formatDate(point.tick)}${relative}</div><div class="divider"></div><div>${text.availableGold}: ${formatNumber(point.available)}</div>${actualDetails}`;
      tooltip.style.display = "block";
      tooltip.style.left = `${event.clientX + 40}px`;
      tooltip.style.top = `${event.clientY + -13}px`;
   }

   showPointTooltip = function (event, tooltip) {
      const points = period === "day" ? history.daily : period === "month" ? history.monthly : history.yearly;
      if (points.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const index = Math.max(0, Math.min(points.length - 1, Math.round(((x - 58) / (760 - 76)) * (points.length - 1))));
      const point = points[index];
      hoveredPoint = index;
      drawChart();
      const text = getLocalizedText();
      const latestPoint = points[points.length - 1];
      const currentValue = period === "day" ? latestPoint.tick : period === "month" ? latestPoint.month : Math.floor(latestPoint.month / 12);
      const pointValue = period === "day" ? point.tick : period === "month" ? point.month : Math.floor(point.month / 12);
      const elapsed = Math.max(0, currentValue - pointValue);
      const relativeUnit = period === "day" ? text.days : period === "month" ? text.months : text.years;
      const relative = elapsed === 0 ? "" : ` (${elapsed} ${relativeUnit}${text.ago})`;
      const displayDetails = goldMode === "actual"
         ? `${text.actualGold}: ${formatNumber(point.actual)}<br> ${text.loans}: ${formatNumber(point.loans || 0)}<br> ${text.availableGold}: ${formatNumber(point.available)}`
         : `${text.availableGold}: ${formatNumber(point.available)}`;
      tooltip.innerHTML = `<div>${formatDate(point.tick)}${relative}</div><div class="divider"></div><div>${displayDetails}</div>`;
      tooltip.style.display = "block";
      tooltip.style.left = `${event.clientX + 40}px`;
      tooltip.style.top = `${event.clientY - 13}px`;
   };

   function drawChart() {
      if (!canvas || !panel) return;
      const context = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const padding = { left: 58, right: 18, top: 20, bottom: 38 };
      const points = period === "day" ? history.daily : period === "month" ? history.monthly : history.yearly;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#171313";
      context.fillRect(0, 0, width, height);
      context.font = "12px Arial";
      context.lineWidth = 1;
      context.strokeStyle = "#4d4038";
      context.fillStyle = "#b9aaa0";
      if (points.length === 0) {
         context.fillText(getLocalizedText().noData, width / 2 - 34, height / 2);
         return;
      }
      const values = points.map((point) => point[goldMode]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = Math.max(1, max - min);
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      for (let i = 0; i <= 4; i++) {
         const y = padding.top + (chartHeight * i) / 4;
         context.beginPath();
         context.moveTo(padding.left, y);
         context.lineTo(width - padding.right, y);
         context.stroke();
         const value = max - (range * i) / 4;
         context.fillText(formatNumber(value), 6, y + 4);
      }
      context.strokeStyle = "#c38b45";
      context.lineWidth = 2;
      context.beginPath();
      points.forEach((point, index) => {
         const x = padding.left + (chartWidth * index) / Math.max(1, points.length - 1);
         const y = padding.top + chartHeight * (1 - (point[goldMode] - min) / range);
         if (index === 0) context.moveTo(x, y);
         else context.lineTo(x, y);
      });
      context.stroke();
      context.fillStyle = "#d8b06c";
      points.forEach((point, index) => {
         if (points.length > 80 && index % Math.ceil(points.length / 40) !== 0 && index !== points.length - 1) return;
         const x = padding.left + (chartWidth * index) / Math.max(1, points.length - 1);
         const y = padding.top + chartHeight * (1 - (point[goldMode] - min) / range);
         context.beginPath();
         context.arc(x, y, index === hoveredPoint ? 5 : 2.5, 0, Math.PI * 2);
         context.fill();
         if (index === hoveredPoint) {
            context.strokeStyle = "#d8b06c66";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(x, padding.top);
            context.lineTo(x, height - padding.bottom);
            context.stroke();
         }
      });
      context.fillStyle = "#b9aaa0";
   }

   function formatNumber(value) {
      const truncated = Math.trunc(Number(value) * 10) / 10;
      return truncated.toLocaleString("zh-CN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
   }

   function loadHistory() {
      try {
         const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
         if (Array.isArray(value)) {
            return { daily: value.slice(-60), monthly: [], yearly: [], lastMonth: -1, lastYear: -1, stateId: null };
         }
         return {
            daily: Array.isArray(value.daily) ? value.daily.slice(-60) : [],
            monthly: Array.isArray(value.monthly) ? value.monthly.slice(-36) : [],
            yearly: Array.isArray(value.yearly) ? value.yearly.slice(-24) : [],
            lastMonth: Number.isInteger(value.lastMonth) ? value.lastMonth : -1,
            lastYear: Number.isInteger(value.lastYear) ? value.lastYear : -1,
            stateId: value.stateId || null,
         };
      } catch {
         return { daily: [], monthly: [], yearly: [], lastMonth: -1, lastYear: -1, stateId: null };
      }
   }

   function saveHistory() {
      try {
         localStorage.setItem(storageKey, JSON.stringify(history));
      } catch {
         // Storage can be unavailable in private browsing.
      }
   }

   function addStyles() {
      const style = document.createElement("style");
      style.textContent = `
         .addon-gold-button,.addon-gold-panel{font-family:Arial,sans-serif;box-sizing:border-box}
         .addon-gold-button{display:flex;align-items:center;justify-content:center;color:#eadbc9;background:transparent;border:0;padding:0 12px;cursor:var(--hand-cursor);opacity:.75}
         .addon-gold-button:hover{color:#eadbc9;background:transparent;opacity:.75}
         .addon-gold-button svg{width:20px;height:20px}
         .addon-gold-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:10001;background:rgba(0,0,0,.6)}
         .addon-gold-panel{position:relative;left:auto;top:auto;transform:none;z-index:10001;color:#eadbc9}
         .addon-gold-header{display:flex;align-items:center}
         .addon-gold-title{font-size:18px;font-weight:bold;flex:1}
         .addon-gold-close{color:#d8c0ab;background:transparent;border:0;font-size:22px;line-height:20px;cursor:var(--hand-cursor);padding:0 5px}
         .addon-gold-tabs{display:flex;gap:5px;padding:10px 0}
         .addon-gold-tabs button{color:#c6b5a8;background:#30241f;border:1px solid #57443a;border-radius:2px;padding:5px 16px;cursor:var(--hand-cursor)}
         .addon-gold-tabs button.active{color:#fff1dc;background:#78522d;border-color:#c38b45}
         .addon-gold-tabs button:first-child{margin-left:10px}
         .addon-gold-option{display:flex;align-items:center;gap:4px;margin-left:8px;color:#c6b5a8;white-space:nowrap;cursor:var(--hand-cursor)}
         .addon-gold-option input{accent-color:#c38b45;cursor:var(--hand-cursor)}
         .addon-gold-option-available{margin-left:auto}
         .addon-gold-option-actual{margin-right:10px}
         .addon-gold-option:first-child{margin-left:auto}
         .addon-gold-option:last-child{margin-right:10px}
         .addon-gold-chart-wrap{width:100%;overflow:hidden;background:#171313;border:1px solid #4d4038}
         .addon-gold-chart{display:block;width:100%;height:auto}
         .addon-gold-tooltip{display:none;position:fixed;pointer-events:none;white-space:nowrap;padding:10px;z-index:10002}
         .addon-gold-button-tooltip{position:fixed;pointer-events:none;white-space:nowrap;padding:10px;z-index:10003}
         .divider{margin:5px 0}
      `;
      document.head.appendChild(style);
   }
})();
