(function () {
  "use strict";

  var DATA = (window.ASSIGNMENTS || []).slice();
  var COURSES = {
    HTMG6097: { name: "Executive Leadership Development", color: "#f59e0b" },
    SWAS6021: { name: "Intelligent Technologies for ESG", color: "#10b981" },
    GENG5002: { name: "Intercultural Communication", color: "#8b5cf6" },
    PLES6015: { name: "FinTech: Law & Regulations", color: "#06b6d4" },
    FINA6333: { name: "AI and Financial Computing", color: "#ef4444" },
    FINA6335: { name: "RegTech Applications in Finance", color: "#e11d48" }
  };
  var GUIDE = {
    HTMG6097: {
      approach: [
        "先看 rubric 的分值分布,按分值分配篇幅,不要平均用力",
        "每个论点配一个真实职场细节:时间、对象、你说了什么、结果如何",
        "用课程概念解释,不要只讲故事;结论回到题目",
        "匿名处理同事、公司、客户信息"
      ],
      pitfalls: [
        "写成理论综述,没有自己的判断",
        "例子空泛,只有形容词",
        "直接使用 AI 生成正文——课程明确按抄袭处理",
        "漏引用/格式要求"
      ],
      checklist: [
        "字数符合要求",
        "结构对齐 rubric",
        "每个论点有证据",
        "匿名检查",
        "按课程要求做 AI 声明"
      ]
    },
    SWAS6021: {
      approach: [
        "先画边界与输入表:活动数据、单位、排放因子",
        "每个数字写公式,保留计算表/脚本",
        "结论回答题目,不要只贴表格",
        "附录保留原始数据与过程日志"
      ],
      pitfalls: [
        "边界定义错(运营控制权 vs 股权) ",
        "单位不统一",
        "只给结果没有过程",
        "漏 Process Log / AI 声明"
      ],
      checklist: [
        "每题都有数字与公式",
        "分项加总一致",
        "附录齐全",
        "引用格式统一"
      ]
    },
    GENG5002: {
      approach: [
        "先选一个真有亲身经历的题目",
        "引言 120 词内交代场景 + thesis",
        "每段一个论点 + 一个细节 + 一个概念",
        "交稿前匿名化人名/公司/店名"
      ],
      pitfalls: [
        "写成旅游见闻,没有分析",
        "引用页码对不上",
        "直接引语过多",
        "漏 AI 声明"
      ],
      checklist: [
        "字数符合",
        "APA7 引用",
        "匿名检查",
        "Turnitin / AI 声明"
      ]
    },
    PLES6015: {
      approach: [
        "先拆题:合规痛点 + 涉及法规",
        "按「问题 → 技术 → 落地 → 风险」四段写",
        "把工具映射到具体流程",
        "结论给可执行建议"
      ],
      pitfalls: [
        "法规引用不准确",
        "技术名词堆砌",
        "忽略数据隐私/合规风险"
      ],
      checklist: [
        "每个小问都回答",
        "法规/案例有出处",
        "风险单独一段",
        "格式统一"
      ]
    }
  };

  var SOURCES = {
    brief: { label: "已核对 brief", short: "已核对", cls: "src-brief", banner: "已核对原始作业说明;下面按这份 brief 整理。" },
    notes: { label: "笔记整理", short: "笔记", cls: "src-notes", banner: "根据课程笔记/提纲整理,未逐字核对原始 brief;以课程说明为准。" },
    platform: { label: "平台页", short: "平台", cls: "src-platform", banner: "根据 SOUL 作业页/提交页整理;具体评分细则以 brief 为准。" },
    artifact: { label: "成品/README", short: "成品", cls: "src-artifact", banner: "根据你提交的成品/README 整理;只还原过程,不提供可交正文。" },
    inferred: { label: "未核对", short: "未核对", cls: "src-inferred", banner: "这份作业的说明我还没看过。当前只有 SOUL 标题与截止时间,解析已隐藏,等拿到 brief 再补。" }
  };

  var state = { month: new Date(), filter: "all", q: "", detailId: null, tab: "req" };
  (function () {
    var now = new Date();
    var todo = DATA.filter(function (a) { return a.status !== "submitted"; }).sort(sortDue);
    var next = todo.filter(function (a) { return dueDate(a) >= now; })[0];
    if (next) {
      var d = dueDate(next);
      state.month = new Date(d.getFullYear(), d.getMonth(), 1);
    } else {
      state.month = new Date(now.getFullYear(), now.getMonth(), 1);
    }
  })();

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function dueDate(a) { return new Date(a.due); }
  function courseMeta(code) { return COURSES[code] || { name: "Course", color: "#64748b" }; }
  function guideFor(code) { return GUIDE[code] || { approach: [], pitfalls: [], checklist: [] }; }
  function sortDue(a, b) { return dueDate(a) - dueDate(b); }
  function fmtMD(d) { return pad(d.getMonth() + 1) + "/" + pad(d.getDate()); }
  function fmtHM(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function fmtMonth(d) { return d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月"; }
  function isPast(a) { return dueDate(a) < new Date(); }
  function statusOf(a) {
    if (a.status === "submitted") return { key: "submitted", label: "已交", cls: "ok" };
    if (isPast(a)) return { key: "overdue", label: "已过期", cls: "over" };
    return { key: "todo", label: "未交", cls: "todo" };
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function hexToRgba(hex, alpha) {
    var h = String(hex || "#64748b").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
  }
  function itemsOn(key) {
    return DATA.filter(function (a) { return dateKey(dueDate(a)) === key; }).sort(sortDue);
  }
  function shortTitle(a) {
    if (a.short) return a.short;
    return a.course.slice(0, 4);
  }

  /* ---------- hero ---------- */
  function renderHero() {
    var now = new Date();
    var todo = DATA.filter(function (a) { return a.status !== "submitted"; }).sort(sortDue);
    var upcoming = todo.filter(function (a) { return dueDate(a) >= now; });
    var next = upcoming[0] || todo[0];
    var weekCount = todo.filter(function (a) {
      var diff = dueDate(a) - now;
      return diff >= 0 && diff <= 7 * 86400000;
    }).length;
    var done = DATA.filter(function (a) { return a.status === "submitted"; }).length;
    var hero = $("#hero");
    if (!next) {
      hero.innerHTML =
        '<div class="hero-top"><span>最近截止</span><span class="hero-pill">全部完成</span></div>' +
        '<div class="hero-main"><div class="hero-days"><b>0</b><span>项</span></div><div><h2>暂时没有未交作业</h2><p>往月作业仍可在日历里复查</p></div></div>' +
        '<div class="hero-foot"><span>已交 ' + done + ' 项</span><span>本周 0 项</span></div>';
      return;
    }
    var due = dueDate(next);
    var diffDays = Math.ceil((due - now) / 86400000);
    var dayText, dayUnit;
    if (diffDays < 0) { dayText = Math.abs(diffDays); dayUnit = "天前"; }
    else if (diffDays === 0) { dayText = "今"; dayUnit = "天"; }
    else { dayText = diffDays; dayUnit = "天"; }
    var c = courseMeta(next.course);
    var st = statusOf(next);
    var statusLine = st.label;
    hero.innerHTML =
      '<div class="hero-top"><span>最近截止</span><span class="hero-pill">未交 ' + todo.length + ' 项</span></div>' +
      '<div class="hero-main"><div class="hero-days"><b>' + dayText + '</b><span>' + dayUnit + '</span></div>' +
      '<div><h2>' + esc(next.title) + '</h2><p>' + esc(next.course) + ' · ' + fmtMD(due) + " " + fmtHM(due) + ' · ' + statusLine + '</p></div></div>' +
      '<div class="hero-foot"><span>本周 ' + weekCount + ' 项</span><span>已交 ' + done + ' 项</span><span>' + esc(c.name) + '</span></div>';
  }

  /* ---------- calendar ---------- */
  function renderCalendar() {
    var y = state.month.getFullYear();
    var m = state.month.getMonth();
    $("#monthLabel").textContent = fmtMonth(state.month);
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7; // Monday first
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var rows = Math.ceil((offset + daysInMonth) / 7);
    var start = new Date(y, m, 1 - offset);
    var todayKey = dateKey(new Date());
    var nowKey = todayKey;
    var html = "";
    for (var i = 0; i < rows * 7; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var key = dateKey(d);
      var items = itemsOn(key);
      var out = d.getMonth() !== m;
      var cls = "day";
      if (out) cls += " out";
      if (key === todayKey) cls += " today";
      if (key < nowKey) cls += " past";
      if (items.length) cls += " has";
      var style = "";
      if (items.length) {
        var c = courseMeta(items[0].course);
        style = ' style="background:' + hexToRgba(c.color, 0.10) + ";border-color:" + hexToRgba(c.color, 0.22) + '"';
      }
      var chips = "";
      if (items.length) {
        var max = 2;
        for (var j = 0; j < Math.min(max, items.length); j++) {
          var a = items[j];
          var cc = courseMeta(a.course);
          chips += '<span class="chip' + (a.status === "submitted" ? " done" : "") + '" style="background:' + cc.color + '" title="' + esc(a.title) + '">' + esc(shortTitle(a)) + "</span>";
        }
        if (items.length > max) chips += '<span class="more">+' + (items.length - max) + "</span>";
      }
      html += '<button class="' + cls + '" data-key="' + key + '"' + style + ' aria-label="' + key + " 共 " + items.length + ' 项">' +
        '<span class="num">' + d.getDate() + "</span>" +
        '<span class="chips">' + chips + "</span></button>";
    }
    $("#calGrid").innerHTML = html;
    renderLegend();
  }

  function renderLegend() {
    var codes = [];
    DATA.forEach(function (a) { if (codes.indexOf(a.course) < 0) codes.push(a.course); });
    var html = codes.map(function (code) {
      var c = courseMeta(code);
      return '<span><i style="background:' + c.color + '"></i>' + esc(code) + "</span>";
    }).join("");
    $("#legend").innerHTML = html;
  }

  /* ---------- filters + list ---------- */
  function filtered() {
    var now = new Date();
    return DATA.filter(function (a) {
      if (state.filter === "todo") return a.status !== "submitted";
      if (state.filter === "submitted") return a.status === "submitted";
      if (state.filter === "history") return dueDate(a) < now;
      return true;
    }).sort(sortDue);
  }

  function renderFilters() {
    var now = new Date();
    var counts = {
      all: DATA.length,
      todo: DATA.filter(function (a) { return a.status !== "submitted"; }).length,
      submitted: DATA.filter(function (a) { return a.status === "submitted"; }).length,
      history: DATA.filter(function (a) { return dueDate(a) < now; }).length
    };
    var defs = [
      ["all", "全部", counts.all],
      ["todo", "未交", counts.todo],
      ["submitted", "已交", counts.submitted],
      ["history", "历史", counts.history]
    ];
    $("#filters").innerHTML = defs.map(function (d) {
      return '<button class="filter' + (state.filter === d[0] ? " active" : "") + '" data-filter="' + d[0] + '">' + d[1] + " " + d[2] + "</button>";
    }).join("");
  }

  function itemHtml(a) {
    var st = statusOf(a);
    var src = SOURCES[a.source] || SOURCES.inferred;
    var c = courseMeta(a.course);
    var due = dueDate(a);
    var dateLabel = fmtMD(due);
    var timeLabel = a.estimated ? "约" : fmtHM(due);
    return '<button class="item' + (isPast(a) ? " past" : "") + '" data-id="' + a.id + '">' +
      '<div class="date-box' + (a.estimated ? " est" : "") + '"><b>' + dateLabel + "</b><span>" + timeLabel + "</span></div>" +
      '<div class="item-main">' +
        '<div class="item-top"><span class="dot" style="background:' + c.color + '"></span><span class="code">' + esc(a.course) + '</span><span class="src-chip ' + src.cls + '">' + src.short + '</span><span class="badge ' + st.cls + '">' + st.label + "</span></div>" +
        "<h3>" + esc(a.title) + "</h3>" +
        "<p>" + esc(a.type || "") + (a.weight ? " · " + esc(a.weight) : "") + "</p>" +
      "</div>" +
      '<span class="chev">›</span>' +
    "</button>";
  }

  function renderList() {
    var items = filtered();
    var list = $("#list");
    if (!items.length) {
      list.innerHTML = '<div class="empty">这个筛选下没有作业。<br>换个筛选,或回到「全部」。</div>';
      return;
    }
    var groups = {};
    items.forEach(function (a) {
      var d = dueDate(a);
      var k = d.getFullYear() + "-" + pad(d.getMonth() + 1);
      if (!groups[k]) groups[k] = { label: d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月", items: [] };
      groups[k].items.push(a);
    });
    var keys = Object.keys(groups).sort();
    list.innerHTML = keys.map(function (k) {
      return '<h2 class="month-title">' + groups[k].label + "</h2>" + groups[k].items.map(itemHtml).join("");
    }).join("");
  }

  function renderSourceLegend() {
    var el = $("#contentLegend");
    if (!el) return;
    el.innerHTML = '<span class="src-chip src-brief">已核对 brief</span>' +
      '<span class="src-chip src-notes">笔记整理</span>' +
      '<span class="src-chip src-platform">平台页</span>' +
      '<span class="src-chip src-artifact">成品</span>' +
      '<span class="src-chip src-inferred">未核对</span>' +
      '<span class="legend-text">点开看来源</span>';
  }

  function renderAll() {
    renderHero();
    renderCalendar();
    renderFilters();
    renderList();
    renderSourceLegend();
  }

  /* ---------- day sheet ---------- */
  function openDay(key) {
    var items = itemsOn(key);
    var d = new Date(key + "T12:00:00");
    var week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
    $("#sheetTitle").textContent = (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 · " + week + " · " + items.length + " 项";
    if (!items.length) {
      $("#sheetBody").innerHTML = '<div class="empty">这天没有作业。</div>';
    } else {
      $("#sheetBody").innerHTML = items.map(itemHtml).join("");
    }
    $("#daySheet").classList.add("open");
    $("#backdrop").classList.add("open");
  }

  function closeDay() {
    $("#daySheet").classList.remove("open");
    if (!$("#detail").classList.contains("open")) $("#backdrop").classList.remove("open");
  }

  /* ---------- detail ---------- */
  function section(title, arr, cls) {
    if (!arr || !arr.length) return "";
    return "<h3>" + title + "</h3>" +
      '<div class="section-card"><ul class="' + (cls || "") + '">' +
      arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
      "</ul></div>";
  }

  function renderTab() {
    var a = DATA.filter(function (x) { return x.id === state.detailId; })[0];
    if (!a) return;
    var src = a.source || "inferred";
    var body = "";
    if (src === "inferred") {
      body = '<div class="note">这份作业的说明我还没看过,不能把猜测当解析。当前只保留 SOUL 上的标题与截止时间;等拿到 brief 再补「要求 / 拆解 / 坑 / 清单」。</div>';
    } else {
      var g = guideFor(a.course);
      if (state.tab === "req") {
        body = section("作业要求", a.requirements, "");
      } else if (state.tab === "approach") {
        body = section("拆解思路", (a.approach && a.approach.length ? a.approach : g.approach), "");
      } else if (state.tab === "pitfalls") {
        body = section("常见坑", (a.pitfalls && a.pitfalls.length ? a.pitfalls : g.pitfalls), "warn");
      } else if (state.tab === "checklist") {
        body = section("提交前自查", (a.checklist && a.checklist.length ? a.checklist : g.checklist), "check");
      } else if (state.tab === "captain") {
        var steps = a.captain || [];
        if (steps.length) {
          body = "<h3>班长做法(仅提供思路)</h3>" +
            '<div class="note">下面是我当时实际走的步骤,不是标准答案;流程可以参考,内容要自己写。</div>' +
            '<div class="section-card"><ol>' +
            steps.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
            "</ol></div>" +
            (a.captainNote ? '<div class="note">' + esc(a.captainNote) + "</div>" : "");
        } else {
          body = '<div class="note">这份还没有过程记录,先不编。等我把当时的草稿/步骤找齐再补。</div>';
        }
      } else {
        body = "";
      }
    }
    body += '<div class="note">仅供思路参考。请按课程要求独立完成,不要直接复制站内文字或例子。</div>';
    $("#detailBody").innerHTML = body;
    $all("#detailTabs .tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-tab") === state.tab);
    });
  }

  function openDetail(id) {
    var a = DATA.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    state.detailId = id;
    state.tab = "req";
    var c = courseMeta(a.course);
    var st = statusOf(a);
    var due = dueDate(a);
    $("#detailCourse").textContent = a.course + " · " + c.name;
    $("#detailTitle").textContent = a.title;
    $("#detailMeta").innerHTML =
      '<span class="pill">' + fmtMD(due) + (a.estimated ? " 约" : " " + fmtHM(due)) + "</span>" +
      '<span class="pill">' + esc(a.type || "") + "</span>" +
      (a.weight ? '<span class="pill">' + esc(a.weight) + "</span>" : "") +
      '<span class="pill">' + st.label + "</span>";
    var ai = a.aiPolicy || (a.course === "HTMG6097"
      ? "课程明确:AI 生成按抄袭处理,可能 FAIL。本站只给结构,正文请自己写。"
      : (a.course === "GENG5002"
        ? "需 Process Log + AI 声明;Turnitin AI <10%。"
        : "仅供思路参考,请按课程要求独立完成。"));
    var src = SOURCES[a.source] || SOURCES.inferred;
    $("#detailAi").className = "ai-banner " + src.cls;
    $("#detailAi").innerHTML = "<b>" + src.label + "</b><br>" + src.banner +
      (a.sourceNote ? '<span class="src-note">' + esc(a.sourceNote) + "</span>" : "") +
      '<span class="ai-policy">' + esc(ai) + "</span>";
    $("#detailAi").style.display = "block";
    var dis = (a.source === "inferred");
    $all("#detailTabs .tab").forEach(function (t) {
      t.classList.toggle("disabled", dis && t.getAttribute("data-tab") !== "req");
    });
    renderTab();
    $("#detail").classList.add("open");
    $("#detail").setAttribute("aria-hidden", "false");
    $("#backdrop").classList.add("open");
    try { history.replaceState(null, "", "#a=" + id); } catch (e) {}
  }

  function closeDetail() {
    $("#detail").classList.remove("open");
    $("#detail").setAttribute("aria-hidden", "true");
    if (!$("#daySheet").classList.contains("open")) $("#backdrop").classList.remove("open");
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }

  /* ---------- search ---------- */
  function openSearch() {
    $("#search").classList.add("open");
    var input = $("#searchInput");
    input.value = state.q;
    renderSearch();
    setTimeout(function () { input.focus(); }, 120);
  }
  function closeSearch() {
    $("#search").classList.remove("open");
  }
  function renderSearch() {
    var q = state.q.trim().toLowerCase();
    var items = DATA.filter(function (a) {
      if (!q) return true;
      return (a.title + " " + a.course + " " + a.type + " " + (a.weight || "")).toLowerCase().indexOf(q) >= 0;
    }).sort(sortDue);
    if (!items.length) {
      $("#searchBody").innerHTML = '<div class="empty">没有匹配的作业。</div>';
      return;
    }
    $("#searchBody").innerHTML = items.map(function (a) {
      var c = courseMeta(a.course);
      var d = dueDate(a);
      return '<button class="search-hit" data-id="' + a.id + '">' +
        '<span class="dot" style="background:' + c.color + '"></span>' +
        "<span style=\"flex:1\"><b>" + esc(a.title) + "</b><span>" + esc(a.course) + " · " + fmtMD(d) + (a.estimated ? " 约" : " " + fmtHM(d)) + "</span></span>" +
        '<span class="chev">›</span></button>';
    }).join("");
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  /* ---------- events ---------- */
  $("#prevMonth").addEventListener("click", function () {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
    renderCalendar();
  });
  $("#nextMonth").addEventListener("click", function () {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
    renderCalendar();
  });
  $("#todayBtn").addEventListener("click", function () {
    var n = new Date();
    state.month = new Date(n.getFullYear(), n.getMonth(), 1);
    renderCalendar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  $("#calGrid").addEventListener("click", function (e) {
    var day = e.target.closest(".day");
    if (!day) return;
    openDay(day.getAttribute("data-key"));
  });
  $("#filters").addEventListener("click", function (e) {
    var b = e.target.closest(".filter");
    if (!b) return;
    state.filter = b.getAttribute("data-filter");
    renderFilters();
    renderList();
  });
  $("#list").addEventListener("click", function (e) {
    var b = e.target.closest(".item");
    if (!b) return;
    openDetail(b.getAttribute("data-id"));
  });
  $("#sheetBody").addEventListener("click", function (e) {
    var b = e.target.closest(".item");
    if (!b) return;
    closeDay();
    openDetail(b.getAttribute("data-id"));
  });
  $("#sheetClose").addEventListener("click", closeDay);
  $("#backdrop").addEventListener("click", function () {
    closeDay();
    if ($("#detail").classList.contains("open")) closeDetail();
  });
  $("#detailClose").addEventListener("click", closeDetail);
  $("#detailTabs").addEventListener("click", function (e) {
    var t = e.target.closest(".tab");
    if (!t) return;
    state.tab = t.getAttribute("data-tab");
    renderTab();
  });
  $("#detailCopy").addEventListener("click", function () {
    var url = location.origin + location.pathname + "#a=" + state.detailId;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast("链接已复制"); }, function () { window.prompt("复制链接", url); });
    } else {
      window.prompt("复制链接", url);
    }
  });
  $("#btnAbout").addEventListener("click", function () { $("#about").classList.add("open"); });
  $("#aboutClose").addEventListener("click", function () { $("#about").classList.remove("open"); });
  $("#searchClose").addEventListener("click", closeSearch);
  $("#searchInput").addEventListener("input", function (e) {
    state.q = e.target.value;
    renderSearch();
  });
  $("#searchBody").addEventListener("click", function (e) {
    var b = e.target.closest(".search-hit");
    if (!b) return;
    closeSearch();
    openDetail(b.getAttribute("data-id"));
  });
  $all(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var goto = btn.getAttribute("data-goto");
      $all(".nav-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      if (goto === "calendar") window.scrollTo({ top: 0, behavior: "smooth" });
      if (goto === "list") $("#list").scrollIntoView({ behavior: "smooth", block: "start" });
      if (goto === "search") openSearch();
      if (goto === "about") $("#about").classList.add("open");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if ($("#search").classList.contains("open")) return closeSearch();
    if ($("#about").classList.contains("open")) return $("#about").classList.remove("open");
    if ($("#detail").classList.contains("open")) return closeDetail();
    if ($("#daySheet").classList.contains("open")) return closeDay();
  });
  window.addEventListener("hashchange", function () {
    var m = location.hash.match(/^#a=(.+)$/);
    if (m) openDetail(decodeURIComponent(m[1]));
  });

  /* ---------- boot ---------- */
  renderAll();
  var m = location.hash.match(/^#a=(.+)$/);
  if (m) setTimeout(function () { openDetail(decodeURIComponent(m[1])); }, 60);
})();
