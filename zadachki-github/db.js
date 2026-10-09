/* =============================================================
   Логические задачки — общая база (Supabase)
   Хранит профили, решённые задачи и статистику посещений.
   Если база недоступна, сайт продолжает работать как раньше.
   ============================================================= */

const DB_URL = 'https://itbnvifyywrdgscsiqet.supabase.co';
const DB_KEY = 'sb_publishable_lZQNxBUE2ZJDPKVpfS0Now_-h_fKdYd';

const db = {
  url: DB_URL,
  key: DB_KEY,
  token: '',            /* заполняется при первом входе */
  uid: '',
  ok: false,            /* база доступна */
  reason: ''            /* почему не работает, для подсказки в профиле */
};

/* ---------------- запросы ---------------- */
/* Каждый запрос к базе ограничен по времени.
   Зачем: на слабой сети (а у телефона сеть часто слабая) запрос к базе
   мог идти очень долго. Пока он не кончится, телефон показывал
   «загрузку» — страница уже нарисована, но телефон её не показывал.
   Теперь запрос, который не ответил за DB_TIMEOUT, просто отменяется:
   сайт работает без базы (рейтинг и статистика посещений будут пустыми),
   но открывается сразу. */
const DB_TIMEOUT = 4000;

async function dbFetch(path, options) {
  const opts = options || {};
  const headers = {
    apikey: db.key,
    Authorization: 'Bearer ' + (db.token || db.key),
    'Content-Type': 'application/json'
  };
  if (opts.prefer) headers.Prefer = opts.prefer;

  /* Отменяем запрос, если база не ответила вовремя.
     AbortController есть не во всех браузерах (в старых телефонах его
     нет вовсе), поэтому спрашиваем: если контроллера нет — просто делаем
     запрос как раньше. Иначе на старом телефоне страница падала бы. */
  let ctrl = null;
  let timer = null;
  try {
    if (typeof AbortController === 'function') {
      ctrl = new AbortController();
      timer = setTimeout(function () { ctrl.abort(); }, DB_TIMEOUT);
    }
  } catch (e) {
    ctrl = null;
  }

  let res;
  try {
    res = await fetch(DB_URL + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctrl ? ctrl.signal : undefined
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (!res.ok) {
    let msg = 'HTTP ' + res.status;
    try { const j = await res.json(); msg = j.message || j.error || msg; } catch (e) { }
    throw new Error(msg);
  }
  if (res.status === 204) return [];
  return res.json();
}

/* ---------------- вход без регистрации ---------------- */
db.signUp = async function () {
  const r = await dbFetch('/auth/v1/signup', { method: 'POST', body: {} });
  if (!r || !r.access_token) throw new Error('нет токена');
  db.token = r.access_token;
  db.uid = r.user.id;
  storeSet('db_token', db.token);
  storeSet('db_uid', db.uid);
};
db.init = async function () {
  try {
    /* берём сохранённый ключ пользователя, чтобы не создавать новый при каждом заходе */
    db.token = storeGet('db_token', '');
    db.uid = storeGet('db_uid', '');
    if (!db.token || !db.uid) {
      const r = await dbFetch('/auth/v1/signup', { method: 'POST', body: {} });
      if (!r || !r.access_token) throw new Error('нет токена');
      db.token = r.access_token;
      db.uid = r.user.id;
      storeSet('db_token', db.token);
      storeSet('db_uid', db.uid);
    }
    /* проверяем, что токен ещё живой */
    const me = await dbFetch('/auth/v1/user', { method: 'GET' });
    if (me && me.id) db.uid = me.id;
    db.ok = true;
  } catch (e) {
    /* сохранённый токен протух (он живёт недолго) — заводим новый */
    try {
      storeSet('db_token', '');
      storeSet('db_uid', '');
      db.token = '';
      db.uid = '';
      await db.signUp();
      db.ok = true;
    } catch (e2) {
      db.ok = false;
      db.reason = e2.message || String(e2);
    }
  }
  return db.ok;
};

/* ---------------- профиль ---------------- */
/* В общую базу отправляем только то, что нужно для рейтинга:
   имя, рисованную картинку и число решённых задач. Пол, возраст,
   история задач и всё личное остаются на устройстве — в открытой
   базе им не место. (Колонки gender/age в таблице нет: если захотим
   показывать их в рейтинге, придётся добавить их через SQL.) */
db.saveProfile = async function (p) {
  if (!db.ok || !p) return false;
  const row = {
    user_id: db.uid,
    name: p.name,
    avatar: p.avatar || 'babushka',
    year: null,                 /* год рождения больше не спрашиваем */
    solved: p.solved || [],
    visits: p.visits || 0
  };
  try {
    /* один запрос: обновить строку, а если её нет — создать
       (user_id уникальный, поэтому это работает как «вставить или обновить») */
    await dbFetch('/rest/v1/profiles?on_conflict=user_id', {
      method: 'POST', body: row, prefer: 'resolution=merge-duplicates'
    });
    return true;
  } catch (e) {
    return false;
  }
};

/* удалить свою строку из общей базы.
   Важно: сервер отвечает «ок», даже если правила безопасности не дали
   ничего удалить, поэтому после попытки проверяем, осталась ли строка. */
db.deleteMyData = async function () {
  if (!db.ok) return false;
  try {
    await dbFetch('/rest/v1/profiles?user_id=eq.' + db.uid, { method: 'DELETE' });
    try {
      await dbFetch('/rest/v1/visits?user_id=eq.' + db.uid, { method: 'DELETE' });
    } catch (e) { /* посещения могут быть защищены сильнее — не страшно */ }
    const left = await dbFetch('/rest/v1/profiles?select=user_id&user_id=eq.' + db.uid);
    return !(left && left.length);
  } catch (e) {
    return false;
  }
};

/* ---------------- рейтинг: 50 мест ---------------- */
/* Пока в базе есть 4 записи, созданные при проверках сайта
   («Тихая Георгина», «Родная Лилия», «Умная Черёмуха»,
   «Бережная Незабудка»). Удалить их из браузера нельзя: ключ сайта
   умеет читать, а правила безопасности не дают ему менять и удалять
   чужие строки (сервер отвечает «ок», а ничего не происходит), и
   ключи тех посетителей, которых создала проверка, уже не сохранились.

   Поэтому рейтинг показывает только записи, созданные начиная с этой
   даты. Когда появится доступ к панели Supabase, выполните
   `delete from profiles; delete from visits;` и удалите эту строчку —
   тогда в рейтинге снова будут все, кто занимался. */
const RATING_FROM = '2026-10-10T00:00:00Z';

db.rating = async function () {
  if (!db.ok) return null;
  try {
    const rows = await dbFetch('/rest/v1/profiles?select=user_id,name,avatar,solved,created_at&limit=500&order=created_at.desc');
    const list = (rows || [])
      /* пропускаем записи, созданные при проверках до даты запуска */
      .filter(r => !r.created_at || String(r.created_at) >= RATING_FROM)
      .map(r => ({
        user_id: r.user_id,
        name: r.name,
        avatar: r.avatar,
        solved: Array.isArray(r.solved) ? r.solved.length : 0,
        me: r.user_id === db.uid
      }));
    list.sort((a, b) => b.solved - a.solved);
    return list.slice(0, 50);
  } catch (e) {
    return null;
  }
};

/* ---------------- посещения ---------------- */
db.countVisit = async function () {
  if (!db.ok) return false;
  const today = new Date();
  const iso = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  const day = iso(today);
  try {
    /* одна строка на пользователя в день: если уже есть — ничего не создаём
       (resolution=ignore-duplicates не даёт ошибку) */
    await dbFetch('/rest/v1/visits?on_conflict=user_id,day', {
      method: 'POST',
      body: { user_id: db.uid, day: day },
      prefer: 'resolution=ignore-duplicates'
    });
    return true;
  } catch (e) {
    return false;
  }
};

db.visitStats = async function () {
  if (!db.ok) return null;
  try {
    const from = new Date();
    from.setDate(from.getDate() - 29);
    const iso = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    const rows = await dbFetch('/rest/v1/visits?select=day&day=gte.' + iso(from) + '&limit=5000');
    const today = new Date();
    const todayIso = iso(today);
    const weekAgo = iso(new Date(today.getTime() - 6 * 86400000));
    let day = 0, week = 0;
    const seenDay = new Set(), seenWeek = new Set();
    (rows || []).forEach(r => {
      const key = r.day;
      if (key === todayIso) { if (!seenDay.has(key)) { day++; seenDay.add(key); } }
      if (key >= weekAgo) { week++; }
    });
    /* месяц: уникальные пользователи за 30 дней */
    const users = await dbFetch('/rest/v1/visits?select=user_id&day=gte.' + iso(from) + '&limit=5000');
    const uniq = new Set((users || []).map(u => u.user_id).filter(Boolean));
    return { day: day, week: week, month: uniq.size };
  } catch (e) {
    return null;
  }
};

function pad2(n) { return String(n).padStart(2, '0'); }
