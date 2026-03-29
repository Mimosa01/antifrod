const questions = [
  {
    q: "Вам звонят и говорят: «Это служба безопасности банка. На вас пытаются оформить кредит. Назовите код из СМС, чтобы мы его отменили.» Что это?",
    opts: ["🚨 Мошенник! Банки никогда не просят СМС-коды", "✅ Настоящий банк, нужно помочь"],
    correct: 0,
    explain: "Банки НИКОГДА не запрашивают коды из СМС по телефону. Это классическая схема мошенников."
  },
  {
    q: "Вам прислали ссылку: «gоsuslug1.ru — подтвердите аккаунт и получите выплату 5000 руб.» Как поступить?",
    opts: ["🚨 Не переходить — это фишинговый сайт", "✅ Перейти и получить деньги"],
    correct: 0,
    explain: "Настоящий сайт — gosuslugi.ru. «gоsuslug1.ru» — поддельный домен для кражи данных."
  },
  {
    q: "Незнакомый человек в игре предлагает: «Скажи свой пароль — я подарю тебе легендарный предмет». Что делать?",
    opts: ["✅ Сказать пароль — это выгодно!", "🚨 Отказать и заблокировать — это мошенник"],
    correct: 1,
    explain: "Никто не дарит ценные вещи в обмен на пароль. Это попытка угнать аккаунт."
  },
  {
    q: "Вам пишет «подруга» в ВКонтакте: «Дай 3000 руб. в долг, срочно нужно, переведи на этот номер». Что делать?",
    opts: ["🚨 Позвонить подруге — аккаунт, скорее всего, взломан", "✅ Перевести деньги — подруга в беде"],
    correct: 0,
    explain: "Взлом аккаунтов и просьбы денег у контактов — популярная схема. Сначала позвоните лично!"
  },
  {
    q: "Компания обещает: «Вложи 50 000 руб. и получи 200 000 руб. через 2 недели — 400% прибыли!» Это...",
    opts: ["✅ Отличная инвестиция, нужно вложиться", "🚨 Финансовая пирамида или мошенничество"],
    correct: 1,
    explain: "Никто не может гарантировать 400% за 2 недели на легальном рынке. Это признак пирамиды или мошенников."
  }
];

let current = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const q = questions[current];
  document.getElementById('questionText').textContent = q.q;
  const opts = document.getElementById('quizOptions');
  opts.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.onclick = () => answer(i);
    opts.appendChild(btn);
  });
  document.getElementById('quizFeedback').className = 'quiz-feedback';
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('quizNext').className = 'quiz-next';
  document.getElementById('quizNext').textContent = current === questions.length - 1 ? 'Узнать результат →' : 'Следующий вопрос →';
  answered = false;
  updateProgress();
}

function answer(idx) {
  if (answered) return;
  answered = true;
  const q = questions[current];
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === idx) btn.classList.add('wrong');
  });
  const fb = document.getElementById('quizFeedback');
  if (idx === q.correct) {
    score++;
    fb.className = 'quiz-feedback show ok';
    fb.textContent = '✅ Правильно! ' + q.explain;
  } else {
    fb.className = 'quiz-feedback show fail';
    fb.textContent = '❌ Неверно. ' + q.explain;
  }
  document.getElementById('quizNext').className = 'quiz-next show';
}

function nextQuestion() {
  // mark current dot done
  document.getElementById('dot-' + current).className = 'progress-dot done';
  current++;
  if (current >= questions.length) {
    showResult();
  } else {
    document.getElementById('dot-' + current).className = 'progress-dot active';
    renderQuestion();
  }
}

function updateProgress() {
  questions.forEach((_, i) => {
    const dot = document.getElementById('dot-' + i);
    if (i < current) dot.className = 'progress-dot done';
    else if (i === current) dot.className = 'progress-dot active';
    else dot.className = 'progress-dot';
  });
}

function showResult() {
  document.getElementById('quizBody').style.display = 'none';
  document.getElementById('quizProgress').style.display = 'none';
  const result = document.getElementById('quizResult');
  result.className = 'quiz-result show';

  document.getElementById('resultScore').textContent = score + '/5';

  const msg = document.getElementById('resultMsg');
  const desc = document.getElementById('resultDesc');

  if (score >= 4) {
    msg.className = 'result-msg great';
    msg.textContent = '🛡️ Вы отлично разбираетесь в мошенниках!';
    desc.textContent = 'Вы хорошо защищены. Поделитесь этим тестом с близкими — помогите и им!';
  } else if (score >= 2) {
    msg.className = 'result-msg ok';
    msg.textContent = '⚠️ Неплохо, но стоит быть внимательнее';
    desc.textContent = 'Вы знаете основы, но некоторые схемы могут вас обмануть. Прочитайте раздел для взрослых.';
  } else {
    msg.className = 'result-msg bad';
    msg.textContent = '🚨 Будьте осторожны!';
    desc.textContent = 'Мошенники могут вас обмануть. Обязательно прочитайте все разделы этой страницы!';
  }
}

function restartQuiz() {
  current = 0;
  score = 0;
  answered = false;
  document.getElementById('quizBody').style.display = 'block';
  document.getElementById('quizProgress').style.display = 'flex';
  document.getElementById('quizResult').className = 'quiz-result';
  renderQuestion();
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Init quiz
renderQuestion();

// ===== SOS PANEL =====
function toggleSOS() {
  const panel = document.getElementById('sosPanel');
  panel.classList.toggle('open');
}

// Close on outside click
document.addEventListener('click', function(e) {
  const sticky = document.getElementById('sos-sticky');
  if (!sticky.contains(e.target)) {
    document.getElementById('sosPanel').classList.remove('open');
  }
});

// ===== CHECKLIST =====
let clTimerInterval = null;
let clStartTime = null;

function startClTimer() {
  if (clTimerInterval) return;
  clStartTime = Date.now();
  clTimerInterval = setInterval(() => {
    const elapsed = Date.now() - clStartTime;
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('clTimer').textContent =
      String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }, 1000);
}

function toggleCheck(item) {
  item.classList.toggle('done');
  updateClProgress();
}

function updateClProgress() {
  const items = document.querySelectorAll('.checklist-item');
  const done = document.querySelectorAll('.checklist-item.done').length;
  const pct = Math.round((done / items.length) * 100);
  document.getElementById('clProgressFill').style.width = pct + '%';
  document.getElementById('clProgressText').textContent = done + ' / ' + items.length;
}

function resetChecklist() {
  document.querySelectorAll('.checklist-item').forEach(el => el.classList.remove('done'));
  updateClProgress();
  if (clTimerInterval) { clearInterval(clTimerInterval); clTimerInterval = null; }
  document.getElementById('clTimer').textContent = '00:00:00';
}

// ===== SCHEMES FILTER =====
function filterSchemes(type, btn) {
  document.querySelectorAll('.scheme-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.scheme-card').forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.removeAttribute('data-hidden');
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// ===== PDF памятка (файл в папке с сайтом; имя должно совпадать с реальным файлом на диске) =====
const PAMYATKA_PDF_FILE = 'pamytka.pdf';

function downloadPDF(evt) {
  const btn = evt?.currentTarget ?? document.querySelector('.pdf-btn');
  const absUrl = new URL(PAMYATKA_PDF_FILE, window.location.href).href;

  if (window.location.protocol === 'file:') {
    evt?.preventDefault();
    window.open(absUrl, '_blank', 'noopener,noreferrer');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✅ Во вкладке: меню → «Сохранить как…»';
    btn.style.background = '#22C55E';
    btn.style.color = 'white';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.color = '';
    }, 5000);
    return;
  }

  // http(s): браузер сам качает по href + download — без fetch/blob
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = '✅ Скачано! Откройте файл и распечатайте';
  btn.style.background = '#22C55E';
  btn.style.color = 'white';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.style.color = '';
  }, 4000);
}


// Ссылка на форму: https://docs.google.com/forms/d/e/1FAIpQLSdkMnIIo94a-aLBgnEcZyo1fet0pvCtFOthbH8OfNjADI3S4w/viewform

// ================================================================
//  НАСТРОЙКИ — ID полей Google Forms (должен совпадать текст вариантов в форме и в AT_QUESTIONS)
// ================================================================
const AT_GOOGLE_FORM_ID   = '1FAIpQLSdkMnIIo94a-aLBgnEcZyo1fet0pvCtFOthbH8OfNjADI3S4w';
const AT_ENTRY_NAME       = 'entry.239915771';   // Имя
const AT_ENTRY_AGE        = 'entry.2128759393';  // Возраст
const AT_ENTRY_ANSWER_1  = 'entry.1818165224';
const AT_ENTRY_ANSWER_2  = 'entry.2131372978';
const AT_ENTRY_ANSWER_3  = 'entry.1828342047';
const AT_ENTRY_ANSWER_4  = 'entry.1720755040';
const AT_ENTRY_ANSWER_5  = 'entry.1964542871';
const AT_ENTRY_ANSWER_6  = 'entry.284885333';
const AT_ENTRY_ANSWER_7  = 'entry.1750699026';
const AT_ENTRY_ANSWER_8  = 'entry.718686130';
const AT_ENTRY_ANSWER_9  = 'entry.1834229679';
const AT_ENTRY_ANSWER_10 = 'entry.729263910';

/** Порядок = вопросы 1…10; в Google Form у каждого вопроса варианты дословно как в AT_QUESTIONS[].opts */
const AT_FORM_ANSWER_ENTRIES = [
  AT_ENTRY_ANSWER_1,
  AT_ENTRY_ANSWER_2,
  AT_ENTRY_ANSWER_3,
  AT_ENTRY_ANSWER_4,
  AT_ENTRY_ANSWER_5,
  AT_ENTRY_ANSWER_6,
  AT_ENTRY_ANSWER_7,
  AT_ENTRY_ANSWER_8,
  AT_ENTRY_ANSWER_9,
  AT_ENTRY_ANSWER_10
];
// ================================================================


// ── Банк вопросов (10 штук) ──
const AT_QUESTIONS = [
  {
    q: 'Вам звонит «сотрудник банка» и просит назвать 3-значный CVV-код с обратной стороны карты для «подтверждения личности». Ваши действия?',
    opts: [
      'Назвать код — это стандартная проверка',
      'Попросить подождать и найти номер банка самостоятельно',
      'Положить трубку и перезвонить по номеру на карте',
      'Спросить имя сотрудника и тогда назвать код'
    ],
    correct: 2,
    explain: 'Банки НИКОГДА не запрашивают CVV по телефону. Кладите трубку и звоните по номеру на обороте карты.'
  },
  {
    q: 'Вы получили письмо: «Ваш аккаунт Госуслуг заблокирован. Перейдите по ссылке gosuslugi-help.ru для разблокировки». Что делать?',
    opts: [
      'Перейти по ссылке и ввести логин/пароль',
      'Проигнорировать — вы не пользуетесь Госуслугами',
      'Не переходить, открыть gosuslugi.ru вручную и проверить аккаунт',
      'Переслать письмо другу, чтобы он проверил'
    ],
    correct: 2,
    explain: 'Настоящий сайт — только gosuslugi.ru. Всегда набирайте адрес вручную, никогда не переходите по ссылкам из писем.'
  },
  {
    q: 'В социальной сети вам пишет лучший друг: «Одолжи 5000 руб. до завтра, срочно нужно, переведи на этот номер». Что сделаете?',
    opts: [
      'Переведу сразу — друг в беде',
      'Попрошу объяснить причину, и если убедит — переведу',
      'Позвоню другу напрямую, чтобы убедиться, что это он',
      'Переведу половину — так безопаснее'
    ],
    correct: 2,
    explain: 'Взлом аккаунта и рассылка просьб о деньге — классическая схема. Всегда проверяйте звонком, прежде чем переводить деньги.'
  },
  {
    q: 'Сайт предлагает «выигрыш 50 000 руб.», но для получения нужно заплатить «налог 500 руб.». Это…',
    opts: [
      'Законный выигрыш — налоги платят все',
      'Мошенничество: реальных выигрышей с предоплатой не бывает',
      'Выгодно — отдать 500, получить 50 000',
      'Нужно уточнить детали и тогда решить'
    ],
    correct: 1,
    explain: 'Схема «заплати налог/комиссию для получения приза» — стопроцентное мошенничество. Никаких выигрышей с предоплатой не существует.'
  },
  {
    q: 'Незнакомец в онлайн-игре предлагает обменять ваш редкий предмет, но просит сначала «подтвердить аккаунт» — ввести пароль в специальном чате. Как поступить?',
    opts: [
      'Ввести пароль — обмен выгодный',
      'Попросить сначала получить предмет, потом ввести',
      'Отказать: пароль нельзя вводить нигде, кроме официального сайта',
      'Спросить у другого игрока, стоит ли доверять'
    ],
    correct: 2,
    explain: 'Пароль вводится ТОЛЬКО на официальном сайте игры. Любая просьба ввести пароль «для обмена» — угон аккаунта.'
  },
  {
    q: 'Звонят и говорят: «Это полиция. На вас оформлен кредит мошенниками. Чтобы защитить деньги, срочно переведите их на "безопасный счёт"». Это…',
    opts: [
      'Полиция действительно так работает — нужно слушаться',
      'Возможно, правда — лучше перестраховаться и перевести',
      'Мошенники: полиция и банки не используют понятие «безопасный счёт»',
      'Нужно уточнить номер удостоверения сотрудника'
    ],
    correct: 2,
    explain: '«Безопасный счёт» — главный признак мошенников. Ни полиция, ни банки никогда не просят переводить деньги на сторонние счета.'
  },
  {
    q: 'Вы хотите купить телефон через объявление. Продавец просит внести 50% предоплаты переводом на карту физлица, а товар отправит потом. Что делать?',
    opts: [
      'Перевести — продавец выглядит честным',
      'Перевести половину, а вторую — при получении',
      'Встретиться лично или использовать сервис безопасной сделки',
      'Попросить скидку за предоплату и тогда согласиться'
    ],
    correct: 2,
    explain: 'Предоплата незнакомцу — огромный риск. Используйте защищённые сделки платформы или встречайтесь лично при получении.'
  },
  {
    q: 'В Telegram-канале «эксперт» обещает 300% прибыли в месяц от инвестиций в криптовалюту, показывает «скрины выплат». Как оценить предложение?',
    opts: [
      'Вложить небольшую сумму — вдруг правда работает',
      'Это финансовая пирамида или мошенничество',
      'Спросить знакомых, вдруг кто-то уже пробовал',
      'Попросить гарантии в письменном виде'
    ],
    correct: 1,
    explain: 'Гарантированный высокий доход — главный признак пирамиды. Скрины выплат легко подделываются. Проверяйте лицензию на cbr.ru.'
  },
  {
    q: 'Вы получили СМС: «Ваша карта заблокирована. Позвоните по номеру 8-800-XXX-XXXX». Что сделаете в первую очередь?',
    opts: [
      'Немедленно позвоню по указанному номеру',
      'Найду официальный номер банка на карте или официальном сайте и позвоню туда',
      'Перейду по ссылке в СМС и проверю',
      'Подожду — вдруг само разблокируется'
    ],
    correct: 1,
    explain: 'Номера из СМС могут быть поддельными. Всегда используйте номер с обратной стороны карты или с официального сайта банка.'
  },
  {
    q: 'Ребёнок говорит, что познакомился в интернете с «добрым взрослым», который хочет прислать подарок, но просит фото и домашний адрес. Что это?',
    opts: [
      'Добрый человек, нужно помочь ребёнку получить подарок',
      'Возможно, мошенник — нужно уточнить подробности',
      'Опасная ситуация: ребёнку нельзя делиться данными с незнакомцами',
      'Нормальная ситуация, если ребёнок общается давно'
    ],
    correct: 2,
    explain: 'Это классические признаки опасного поведения в сети. Ребёнку нельзя давать личные данные незнакомым людям ни при каких условиях.'
  }
];

// ── Состояние теста ──
let atCurrent  = 0;   // текущий вопрос
let atScore    = 0;   // количество правильных ответов
let atAnswered = false;
let atUserName = '';
let atUserClass = '';
/** Выбранный текст ответа по каждому вопросу (индекс = номер вопроса − 1), для Google Forms */
let atPickedAnswers = [];

// ── Переключение шагов ──
function atShowStep(id) {
  document.querySelectorAll('.at-step').forEach(s => s.classList.remove('at-active'));
  document.getElementById(id).classList.add('at-active');
}

// ── Проверка формы: разблокировать кнопку ──
function atCheckForm() {
  const name    = document.getElementById('at-name').value.trim();
  const cls     = document.getElementById('at-class').value.trim();
  const consent = document.getElementById('at-consent').checked;
  const btn     = document.getElementById('at-start-btn');
  if (name && cls && consent) {
    btn.classList.add('at-ready');
  } else {
    btn.classList.remove('at-ready');
  }
}

// ── Запуск теста ──
function atStart() {
  atUserName  = document.getElementById('at-name').value.trim();
  atUserClass = document.getElementById('at-class').value.trim();
  atCurrent   = 0;
  atScore     = 0;
  atAnswered  = false;
  atPickedAnswers = [];
  document.getElementById('at-q-total').textContent = AT_QUESTIONS.length;
  atShowStep('at-step-question');
  atRenderQuestion();
}

// ── Отрисовка текущего вопроса ──
function atRenderQuestion() {
  const q   = AT_QUESTIONS[atCurrent];
  const pct = (atCurrent / AT_QUESTIONS.length) * 100;

  document.getElementById('at-q-num').textContent      = atCurrent + 1;
  document.getElementById('at-progbar-fill').style.width = pct + '%';
  document.getElementById('at-score-live').textContent  = atScore;
  document.getElementById('at-q-text').textContent      = q.q;

  // Очистка
  const optsEl = document.getElementById('at-options');
  optsEl.innerHTML = '';
  document.getElementById('at-explain').className = 'at-explain';
  document.getElementById('at-explain').textContent = '';
  document.getElementById('at-next-btn').className  = 'at-next-btn';
  document.getElementById('at-next-btn').textContent =
    atCurrent === AT_QUESTIONS.length - 1 ? 'Завершить тест →' : 'Следующий вопрос →';

  atAnswered = false;

  // Рендер вариантов
  const letters = ['А', 'Б', 'В', 'Г'];
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'at-opt';
    btn.innerHTML = `<span class="at-opt-letter">${letters[i]}</span>${opt}`;
    btn.onclick = () => atAnswer(i);
    optsEl.appendChild(btn);
  });
}

// ── Обработка ответа ──
function atAnswer(idx) {
  if (atAnswered) return;
  atAnswered = true;

  const q    = AT_QUESTIONS[atCurrent];
  const opts = document.querySelectorAll('.at-opt');

  // Блокируем все кнопки и подсвечиваем
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) {
      btn.classList.add('at-opt-correct');
    } else if (i === idx) {
      btn.classList.add('at-opt-wrong');
    }
  });

  // Счёт
  const isCorrect = (idx === q.correct);
  if (isCorrect) atScore++;
  document.getElementById('at-score-live').textContent = atScore;

  atPickedAnswers[atCurrent] = q.opts[idx];

  // Объяснение
  const explEl = document.getElementById('at-explain');
  explEl.textContent = (isCorrect ? '✅ Правильно! ' : '❌ Неверно. ') + q.explain;
  explEl.className   = 'at-explain at-show ' + (isCorrect ? 'at-ok' : 'at-fail');

  // Показываем кнопку «Далее»
  document.getElementById('at-next-btn').classList.add('at-show');
}

// ── Следующий вопрос / завершение ──
function atNext() {
  atCurrent++;
  if (atCurrent >= AT_QUESTIONS.length) {
    atShowResult();
  } else {
    atRenderQuestion();
  }
}

// ── Результат ──
function atShowResult() {
  const total   = AT_QUESTIONS.length;
  const wrong   = total - atScore;
  const pct     = Math.round((atScore / total) * 100);
  const ring    = document.getElementById('at-result-ring');

  document.getElementById('at-result-score').textContent = atScore;
  document.getElementById('at-result-total').textContent = 'из ' + total;
  document.getElementById('at-bd-correct').textContent   = atScore;
  document.getElementById('at-bd-wrong').textContent     = wrong;
  document.getElementById('at-bd-pct').textContent       = pct + '%';
  document.getElementById('at-result-name').textContent  =
    '👤 ' + atUserName + ' · ' + atUserClass;

  // Уровень
  let title, msg;
  if (pct >= 80) {
    title = '🛡️ Вы хорошо разбираетесь!';
    msg   = 'Отличный результат. Вы умеете распознавать мошенников и защищать себя. Поделитесь знаниями с близкими!';
    ring.className = 'at-result-ring';
  } else if (pct >= 50) {
    title = '⚠️ Будьте внимательнее';
    msg   = 'Базовые знания есть, но некоторые схемы могут вас обмануть. Рекомендуем перечитать разделы выше.';
    ring.className = 'at-result-ring at-medium';
  } else {
    title = '📚 Стоит изучить тему';
    msg   = 'Мошенники могут воспользоваться незнанием. Внимательно изучите все разделы страницы — это займёт 5 минут и защитит вас.';
    ring.className = 'at-result-ring at-low';
  }

  document.getElementById('at-result-title').textContent = title;
  document.getElementById('at-result-msg').textContent   = msg;

  atShowStep('at-step-result');

  atSendToGoogle(atUserName, atUserClass, atPickedAnswers);
}

// ── Сброс ──
function atReset() {
  atCurrent  = 0;
  atScore    = 0;
  atAnswered = false;
  atPickedAnswers = [];
  document.getElementById('at-send-status').textContent = '';
  document.getElementById('at-send-status').className   = 'at-send-status';
  // Сбрасываем форму
  document.getElementById('at-name').value    = '';
  document.getElementById('at-class').value   = '';
  document.getElementById('at-consent').checked = false;
  document.getElementById('at-start-btn').classList.remove('at-ready');
  atShowStep('at-step-form');
}

// ── Отправка данных в Google Forms ──
// Если ответов нет, но в Network виден 302: в редакторе формы включите «Принимать ответы» (закрытая форма редиректит, но не сохраняет).
// Варианты в форме должны дословно совпадать с AT_QUESTIONS[i].opts (включая «» и —).
// POST: только имя, возраст и 10 ответов (fetch + URLSearchParams, без iframe).
function atSendToGoogle(name, age, pickedTexts) {
  const statusEl = document.getElementById('at-send-status');
  statusEl.textContent = '⏳ Сохраняем результат…';
  statusEl.className = 'at-send-status';

  if (AT_FORM_ANSWER_ENTRIES.length !== AT_QUESTIONS.length) {
    console.warn('[advtest] Число entry для ответов не совпадает с числом вопросов.');
  }

  const answersSent = AT_FORM_ANSWER_ENTRIES.reduce(
    (n, _, i) => n + (pickedTexts[i] != null && String(pickedTexts[i]).trim() !== '' ? 1 : 0),
    0
  );
  if (answersSent < AT_QUESTIONS.length) {
    console.warn('[advtest] В Google уйдут не все ответы:', answersSent, '/', AT_QUESTIONS.length, pickedTexts);
  }

  const url = `https://docs.google.com/forms/d/e/${AT_GOOGLE_FORM_ID}/formResponse`;

  function appendTrimmed(body, key, value) {
    if (value == null) return;
    const s = String(value).trim();
    if (s === '') return;
    body.append(key, s);
  }

  const body = new URLSearchParams();
  appendTrimmed(body, AT_ENTRY_NAME, name);
  appendTrimmed(body, AT_ENTRY_AGE, age);
  AT_FORM_ANSWER_ENTRIES.forEach((entryKey, i) => appendTrimmed(body, entryKey, pickedTexts[i]));

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body
  })
    .then(() => {
      statusEl.textContent = '✅ Результат сохранён';
      statusEl.className = 'at-send-status at-ok-send';
    })
    .catch((err) => {
      console.error('[advtest] Ошибка отправки', err);
      statusEl.textContent = '⚠️ Не удалось сохранить (нет соединения)';
      statusEl.className = 'at-send-status at-fail-send';
    });
}
