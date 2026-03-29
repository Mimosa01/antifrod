// ================================================================
//  ⚙️  НАСТРОЙКИ — вставьте ваши данные из Supabase
// ================================================================
const SUPABASE_URL      = 'https://hykcogmfilydwbugvqvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a2NvZ21maWx5ZHdidWd2cXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NDc5NjksImV4cCI6MjA5MDMyMzk2OX0.A56SJnio_v2-0B6im-UOIfEZ7vo-mIgDMSDAyaLi2iI';

// Таблица: CREATE TABLE quiz ( id, name, age, score, answers JSONB, mail, created_at )
const TABLE = 'quiz';

const COL_NAME    = 'name';
const COL_AGE     = 'age';
const COL_SCORE   = 'score';        // строка «N/M (p%)»; без answers — только из неё
const COL_ANSWERS = 'answers';
const COL_MAIL    = 'mail';
// ================================================================

// ── Init Supabase ──
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Состояние ──
let allRows      = [];
let filteredRows = [];
let charts       = {};
let curPage      = 1;
const PAGE_SIZE  = 20;

// ── Имена вопросов для баров ──
const Q_LABELS = [
  'В1: Звонок службы безопасности',
  'В2: Фишинг Госуслуги',
  'В3: Взлом аккаунта друга',
  'В4: Выигрыш с комиссией',
  'В5: Пароль в онлайн-игре',
  'В6: Безопасный счёт',
  'В7: Предоплата незнакомцу',
  'В8: Крипто в Telegram',
  'В9: СМС от банка',
  'В10: Ребёнок в интернете'
];

// ================================================================
//  АВТОРИЗАЦИЯ
// ================================================================
async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  if (!email || !pass) { showLoginError('Заполните все поля'); return; }

  btn.disabled = true;
  btn.textContent = 'Входим…';
  errEl.classList.remove('show');

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  if (error) {
    showLoginError('Неверный email или пароль');
    btn.disabled = false; btn.textContent = 'Войти →';
    return;
  }
  enterDashboard(data.user.email);
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = '⚠️ ' + msg;
  el.classList.add('show');
}

async function doLogout() {
  await sb.auth.signOut();
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('l-pass').value = '';
}

function enterDashboard(email) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('sb-email').textContent = email;
  loadAll();
}

// Восстанавливаем сессию при перезагрузке страницы
(async () => {
  const { data } = await sb.auth.getSession();
  if (data?.session?.user) enterDashboard(data.session.user.email);
})();

// ================================================================
//  ЗАГРУЗКА ДАННЫХ ИЗ SUPABASE
// ================================================================
async function loadAll() {
  showToast('🔄 Загружаем данные…');

  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('❌ ' + error.message);
    console.error(error);
    return;
  }

  allRows = data || [];
  applyFilters();

  const t = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('last-update').textContent = `Обновлено в ${t} · ${allRows.length} записей всего`;
  showToast('✅ Загружено ' + allRows.length + ' записей');
}

// ================================================================
//  ФИЛЬТРЫ
// ================================================================
function applyFilters() {
  const cls      = (document.getElementById('f-class')?.value     || '').trim().toLowerCase();
  const search   = (document.getElementById('f-search')?.value    || '').trim().toLowerCase();
  const dateFrom = document.getElementById('f-date-from')?.value  || '';
  const dateTo   = document.getElementById('f-date-to')?.value    || '';

  filteredRows = allRows.filter(row => {
    const name = (row[COL_NAME]  || '').toLowerCase();
    const ag   = (row[COL_AGE] || '').toLowerCase();
    const mail = (row[COL_MAIL] || '').toLowerCase();
    if (cls    && !ag.includes(cls)) return false;
    if (search && !name.includes(search) && !ag.includes(search) && !mail.includes(search)) return false;
    if (dateFrom && (row.created_at || '') < dateFrom) return false;
    if (dateTo   && (row.created_at || '') > dateTo + 'T23:59:59') return false;
    return true;
  });

  curPage = 1;
  renderAll();
}

function clearFilters() {
  ['f-class','f-date-from','f-date-to','f-search'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filteredRows = [...allRows];
  curPage = 1;
  renderAll();
}

// ================================================================
//  РЕНДЕР
// ================================================================
function renderAll() {
  renderMetrics();
  renderCharts();
  renderTable();
  renderQBars();
}

// ── Метрики ──
function renderMetrics() {
  const rows = filteredRows;
  const n    = rows.length;
  document.getElementById('m-total').textContent = n;
  if (!n) {
    ['m-avg','m-high','m-low'].forEach(id => document.getElementById(id).textContent = '—');
    return;
  }
  const scores = rows.map(r => getRowCorrectCount(r));
  const avg    = (scores.reduce((a,b)=>a+b,0) / n);
  const high   = scores.filter(s => s >= 8).length;
  const low    = scores.filter(s => s <= 4).length;
  document.getElementById('m-avg').textContent  = avg.toFixed(1);
  document.getElementById('m-high').textContent = `${high} (${pct(high,n)}%)`;
  document.getElementById('m-low').textContent  = `${low} (${pct(low,n)}%)`;
}

// ── Графики ──
function renderCharts() {
  const rows = filteredRows;

  // Глобальные дефолты Chart.js
  Chart.defaults.color       = '#64748B';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
  Chart.defaults.font.family = 'Manrope';
  Chart.defaults.font.size   = 12;

  // 1. Гистограмма баллов
  const counts = Array(11).fill(0);
  rows.forEach(r => { const s = clamp(getRowCorrectCount(r),0,10); counts[s]++; });

  destroyChart('scoreChart');
  charts.scoreChart = new Chart(document.getElementById('scoreChart'), {
    type: 'bar',
    data: {
      labels: counts.map((_,i) => i),
      datasets: [{
        label: 'Чел.',
        data: counts,
        backgroundColor: counts.map((_,i) =>
          i>=8 ? 'rgba(34,197,94,0.75)' : i>=5 ? 'rgba(251,191,36,0.75)' : 'rgba(239,68,68,0.75)'
        ),
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // 2. Пончик уровней
  const h = rows.filter(r => getRowCorrectCount(r) >= 8).length;
  const m = rows.filter(r => { const s = getRowCorrectCount(r); return s >= 5 && s < 8; }).length;
  const l = rows.filter(r => getRowCorrectCount(r) < 5).length;

  destroyChart('levelChart');
  charts.levelChart = new Chart(document.getElementById('levelChart'), {
    type: 'doughnut',
    data: {
      labels: ['Высокий (≥8)', 'Средний (5–7)', 'Низкий (≤4)'],
      datasets: [{
        data: [h, m, l],
        backgroundColor: ['rgba(34,197,94,0.8)','rgba(251,191,36,0.8)','rgba(239,68,68,0.8)'],
        borderColor: 'transparent', hoverOffset: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, pointStyleWidth: 9 } } }
    }
  });

  // 3. Линия по дням
  const dayMap = {};
  rows.forEach(r => {
    if (!r.created_at) return;
    const d = r.created_at.slice(0,10);
    dayMap[d] = (dayMap[d]||0) + 1;
  });
  const days = Object.keys(dayMap).sort().slice(-14);

  destroyChart('timeChart');
  charts.timeChart = new Chart(document.getElementById('timeChart'), {
    type: 'line',
    data: {
      labels: days.map(fmtDate),
      datasets: [{
        label: 'Прохождений',
        data: days.map(d => dayMap[d]),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#6366F1',
        pointRadius: 4,
        fill: true, tension: 0.4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ── Таблица с пагинацией ──
function renderTable() {
  const wrap  = document.getElementById('resp-table-wrap');
  const pgDiv = document.getElementById('pagination');
  const rows  = filteredRows;

  document.getElementById('resp-count').textContent = rows.length;

  if (!rows.length) {
    wrap.innerHTML = '<div class="empty"><span class="empty-icon">📭</span>Нет записей</div>';
    pgDiv.style.display = 'none';
    return;
  }

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const start  = (curPage - 1) * PAGE_SIZE;
  const slice  = rows.slice(start, start + PAGE_SIZE);

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Возраст</th>
            <th>Email</th>
            <th>Результат</th>
            <th>Уровень</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          ${slice.map((r, i) => {
            const s   = getRowCorrectCount(r);
            const lvl = s>=8 ? ['rb-high','🏆 Высокий'] : s>=5 ? ['rb-medium','⚠️ Средний'] : ['rb-low','📚 Низкий'];
            return `<tr>
              <td class="td-muted">${start+i+1}</td>
              <td class="td-name">${esc(r[COL_NAME]||'—')}</td>
              <td class="td-muted">${esc(r[COL_AGE]||'—')}</td>
              <td class="td-muted">${esc(r[COL_MAIL]||'—')}</td>
              <td><strong>${esc(formatRowResult(r))}</strong></td>
              <td><span class="result-badge ${lvl[0]}">${lvl[1]}</span></td>
              <td class="td-mono">${fmtDateTime(r.created_at)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  // Пагинация
  if (totalPages > 1) {
    pgDiv.style.display = 'flex';
    document.getElementById('pg-info').textContent = `Стр. ${curPage} из ${totalPages}`;
    document.getElementById('pg-prev').disabled = curPage === 1;
    document.getElementById('pg-next').disabled = curPage === totalPages;
  } else {
    pgDiv.style.display = 'none';
  }
}

function changePage(delta) {
  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
  curPage = clamp(curPage + delta, 1, totalPages);
  renderTable();
  document.getElementById('sec-responses').scrollIntoView({ behavior: 'smooth' });
}

// ── Q-бары ──
function renderQBars() {
  const wrap = document.getElementById('q-bars-wrap');
  const rows = filteredRows;
  document.getElementById('q-total-label').textContent = `по ${rows.length} прохождениям`;

  if (!rows.length) {
    wrap.innerHTML = '<div class="empty"><span class="empty-icon">📊</span>Нет данных</div>';
    return;
  }

  // Проверяем наличие поля answers
  const hasAnswers = rows.some(r => r[COL_ANSWERS]);

  let pcts;

  if (hasAnswers) {
    const nQ = Q_LABELS.length;
    const correct = Array(nQ).fill(0);
    let counted = 0;
    rows.forEach(r => {
      const ans = parseAnswersBools(r);
      if (!ans) return;
      counted++;
      ans.forEach((a, i) => {
        if (i < nQ && isAnswerCorrect(a)) correct[i]++;
      });
    });
    pcts = correct.map(c => (counted ? Math.round((c / counted) * 100) : 0));
  } else {
    // Нет поля answers → показываем заглушку с пояснением
    pcts = Q_LABELS.map(() => 0);
  }

  const bars = Q_LABELS.map((lbl, i) => {
    const p   = pcts[i];
    const cls = p>=70 ? 'qb-good' : p>=45 ? 'qb-medium' : 'qb-bad';
    return `
      <div class="q-bar-row">
        <div class="q-bar-meta">
          <strong>${lbl}</strong>
          <span>${hasAnswers ? p+'% верных' : 'нет данных'}</span>
        </div>
        <div class="q-bar-track">
          <div class="q-bar-fill ${cls}" style="width:${p}%"></div>
        </div>
      </div>`;
  }).join('');

  wrap.innerHTML = `<div class="q-bars">${bars}</div>`;

  if (!hasAnswers) {
    wrap.innerHTML += `
      <div style="margin-top:18px;padding:14px 16px;background:rgba(251,191,36,0.08);
                  border:1px solid rgba(251,191,36,0.2);border-radius:10px;
                  font-size:12px;color:var(--yellow);line-height:1.6;">
        💡 <strong>Для детальной аналитики по вопросам</strong> добавьте в таблицу
        столбец <code style="background:rgba(255,255,255,0.08);padding:1px 6px;border-radius:4px;">answers</code>
        (JSON-массив true/false) при сохранении результатов теста.
      </div>`;
  }
}

// ================================================================
//  НАВИГАЦИЯ
// ================================================================
function showSection(name) {
  ['overview','responses','questions'].forEach(s => {
    document.getElementById('sec-' + s).style.display = (s === name) ? 'block' : 'none';
  });
  document.querySelectorAll('.sb-nav-item a').forEach(a => a.classList.remove('active'));
  document.getElementById('nav-' + name)?.classList.add('active');
}

// ================================================================
//  ЭКСПОРТ CSV
// ================================================================
function exportCSV() {
  if (!filteredRows.length) { showToast('⚠️ Нет данных'); return; }
  const rows = [['#','Имя','Возраст','Email','Результат','Уровень','Дата']];
  filteredRows.forEach((r, i) => {
    const s   = getRowCorrectCount(r);
    const lvl = s>=8 ? 'Высокий' : s>=5 ? 'Средний' : 'Низкий';
    rows.push([i+1, r[COL_NAME]||'', r[COL_AGE]||'', r[COL_MAIL]||'', formatRowResult(r), lvl, fmtDateTime(r.created_at)]);
  });
  const csv  = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `quiz-${new Date().toISOString().slice(0,10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ CSV сохранён');
}

// ================================================================
//  УТИЛИТЫ
// ================================================================
/** Ответ в БД считается верным (boolean, 1 или строка "true"). */
function isAnswerCorrect(a) {
  if (a === true || a === 1) return true;
  if (typeof a === 'string') {
    const t = a.trim().toLowerCase();
    return t === 'true' || t === '1';
  }
  return false;
}

/** Массив ответов true/false из строки или jsonb; null если нет данных. */
function parseAnswersBools(row) {
  const raw = row[COL_ANSWERS];
  if (raw == null || raw === '') return null;
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr) || !arr.length) return null;
    return arr;
  } catch (_) {
    return null;
  }
}

/** Число верных ответов: из answers; иначе из score вида N/10. */
function getRowCorrectCount(row) {
  const arr = parseAnswersBools(row);
  if (arr) return arr.filter(isAnswerCorrect).length;
  return parseScore(row[COL_SCORE]);
}

/** Строка для таблицы и CSV: «7/10 (70%)» или «—». */
function formatRowResult(row) {
  const arr = parseAnswersBools(row);
  if (arr && arr.length) {
    const c = arr.filter(isAnswerCorrect).length;
    const t = arr.length;
    const p = Math.round((c / t) * 100);
    return `${c}/${t} (${p}%)`;
  }
  const raw = row[COL_SCORE];
  const m = String(raw || '').match(/(\d+)\s*\/\s*(\d+)/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const p = b ? Math.round((a / b) * 100) : 0;
    return `${a}/${b} (${p}%)`;
  }
  return '—';
}

/** Fallback: число верных из строки score «N/M …» (без поля answers). */
function parseScore(val) {
  if (typeof val === 'number') return val;
  const m = String(val||'').match(/(\d+)\s*\/\s*\d+/);
  if (m) return parseInt(m[1], 10);
  return parseInt(val, 10) || 0;
}

function pct(a, b) { return b ? Math.round((a/b)*100) : 0; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function fmtDate(str) {
  if (!str) return '—';
  const [y,m,d] = str.split('-');
  return `${d}.${m}`;
}

function fmtDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('ru-RU',
    { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

let _toastT;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => el.classList.remove('show'), 2800);
}