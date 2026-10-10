/* =============================================================
   ГРАММАТИКА — ПОДРОБНЫЕ ОБЪЯСНЕНИЯ, ЧАСТЬ 3
   (предлоги, частота, дополнения, времена, вежливость, десять глаголов)
   Описание файла — в fr_grammar_deep.js.
   ============================================================= */

FR.grammarDeep = FR.grammarDeep || {};

/* ---------------- ПРЕДЛОГИ ---------------- */
FR.grammarDeep.prepositions = {
  rules: [
    'У каждого города есть почтовый индекс, и это не совпадение: во французском «à Paris» — это «в Париже», а «de Paris» — «из Парижа». Предлог не переводится, а выполняет работу.',
    '«À + le» = au, «à + les» = aux. «De + le» = du, «de + les» = des. Пример: «je vais au café», «je viens du café», «je parle aux enfants», «je viens des enfants».',
    '«Dans» — внутри чего-то с тем же размером: «dans la voiture», «dans la maison», «dans la boîte».',
    '«Sur» — на поверхности: «sur la table», «sur le mur». Разница видна: книга «dans la valise», а не «sur la valise».',
    '«Chez» значит «у» и сразу понятен: «chez moi» — у меня дома, «chez le médecin» — у врача в кабинете, «chez nous» — у нас в стране.',
    '«Avec» — с кем или с чем: «avec mon frère», «avec un café» (с кофе).',
    '«Pour» — для: «pour vous», «pour Paris» (в сторону Парижа, в отпуск).',
    '«De» во французском часто значит «из», а не «о»: «de France» — из Франции, «un litre de lait» — литр молока, «une chambre de deux personnes» — комната на двоих.'
  ],
  exceptions: [
    '«À» и «de» вставляются внутрь слов: «au» (à le), «aux» (à les), «du» (de le), «des» (de les). Их не говорят отдельно.',
    'В названиях стран и городов предлоги часто убирают: «Je suis en France», «Je vais en Espagne» — но «Je vais à Paris» (город остаётся с à).',
    '«С именами людей» — только de: «le livre de Marie», «la maison de Paul». Никаких «du Marie».',
    '«Chez» не переводится как «в»: «chez le dentist» — у стоматолога, в его кабинете, а не внутри зубов.'
  ],
  mistakes: [
    { bad: 'Je vais à le café', good: 'Je vais au café', why: '«à» + «le» = «au».' },
    { bad: 'Je viens de le France', good: 'Je viens de France', why: 'в названии страны предлога нет.' },
    { bad: 'Je suis dans Paris', good: 'Je suis à Paris', why: 'город — это точка, а не ёмкость: à Paris, не dans Paris.' },
    { bad: 'la maison à Marie', good: 'la maison de Marie', why: 'с людьми бывает только de.' }
  ]
};

/* ---------------- ЧАСТОТА ---------------- */
FR.grammarDeep.frequence = {
  rules: [
    'Наречия частоты отвечают на «как часто». Их четыре, и они стоят в строгом порядке: toujours (всегда) — souvent (часто) — parfois (иногда) — jamais (никогда). Это шкала от «каждый день» до «никогда».',
    'Ставятся перед глаголом: «Je bois toujours du café», «Elle vient parfois à Paris».',
    'Иногда добавляют «dans» — «parfois dans la semaine» (иногда в течение недели). Это звучит мягче.',
    'В вопросе: «Tu manges toujours des pâtes ?» — «Ты всегда ешь макароны?»'
  ],
  exceptions: [
    'После «ne» порядок меняется: «Je ne fume jamais» — jamais уходит за pas. И «souvent» превращается в «pas souvent»: «Je ne fume pas souvent».',
    '«Toujours» в утверждении отрицается словом «ne» без «pas»: «Il ne travaille jamais le dimanche» — пассивная форма без pas.',
    '«Déjà» (уже) ставится в конце: «Tu as déjà mangé ?» — «Ты уже поел?» — это разговорный вопрос.'
  ],
  mistakes: [
    { bad: 'je ne jamais fume', good: 'je ne fume jamais', why: 'jamais всегда после глагола, а не перед ним.' },
    { bad: 'je ne fume pas souvent', good: 'je ne fume pas souvent', why: 'верно: «pas» перед souvent.' },
    { bad: 'je fume jamais pas', good: 'je ne fume jamais', why: 'pas в отрицании с jamais не нужен вовсе.' }
  ]
};

/* ---------------- МЕСТОИМЕНИЯ-ДОПОЛНЕНИЯ ---------------- */
FR.grammarDeep.pronom_obj = {
  rules: [
    'Если в вопросе спросили «где собака?», а вы отвечаете «она там», слово «собака» пропало. По-французски на его место ставят замену — le, la, les — и она стоит ПЕРЕД глаголом.',
    '«Le» и «la» заменяют мужской и женский предмет: «Je le vois» (его), «Je la vois» (её).',
    '«Lui» и «leur» — только про людей: «Je lui parle» (с ним), «Je leur parle» (с ними).',
    '«Y» — «туда», если место уже назвали: «Je vais à Paris» → «J’y vais». Или «в этом».',
    '«En» — оттуда или «этого» про количество: «Je viens de Paris» → «J’en viens». «Je voudrais un café» → «J’en voudrais un».'
  ],
  exceptions: [
    '«J’y» и «J’en» сливаются в одно слово и звучат как «жи» и «жан». Это два самых частых слова французского.',
    'После «en» перед гласным добавляется z: «un yam» → «J’en prends», «un pneu» → «J’en ai deux».',
    'Если «le» и «la» уточняют, что именно вы говорите, «en» лучше не ставить: «J’aime le fromage» — но не «J’aime en le fromage».'
  ],
  mistakes: [
    { bad: 'j’ai besoin de pain', good: 'j’ai besoin de pain', why: 'верно: с «de» местоимение не нужно.' },
    { bad: 'je vais à Paris, j’y vais', good: 'je vais à Paris, j’y vais', why: 'верно: «y» без дефиса после гласной.' },
    { bad: 'j’aime en le fromage', good: 'j’aime le fromage', why: 'en и le вместе не ставят.' },
    { bad: 'je voudrais un pain', good: 'j’en voudrais un', why: 'в магазине крошечное «j’en» заменяет целую фразу: «я бы хотел один».' }
  ]
};

/* ---------------- БУДУЩЕЕ ВРЕМЯ ---------------- */
FR.grammarDeep.futur = {
  rules: [
    'Будущее время — это к настоящему времени приставка -ai, -as, -a, -ons, -ez, -ont. Правило одно на все глаголы, поэтому будущее можно сказать про любой глагол, даже не зная его прошедшего времени.',
    'От инфинитива отбрасываем окончание и прибавляем -ai: parler → parler-ai → je parlerai; vendre → vendr-ai → je vendrai.',
    'В разговоре будущее время почти не говорят. Вместо него — «aller» + инфинитив: «je vais manger». Это короче и естественнее.',
    'Французский различает «я сделаю» и «я сделаюсь»: «Je ferai» (сделаю) и «Je serai fait» (буду сделан). Тут важно, что «-rai» — это прошедшее будущее, а не настоящее будущее.'
  ],
  exceptions: [
    'Шесть глаголов будущего времени неправильные, их учат наизусть: avoir → j’aurai, être → je serai, faire → je ferai, aller → j’irai, voir → je verrai, pouvoir → je pourrai.',
    'Все остальные — сотни глаголов — строятся по правилу. Поэтому «Je parlerai» можно сказать, даже если вы никогда не видели этого глагола.',
    '«Je verrai» (увижу) и «je savais» (знал) — разные слова, путать легко: сохраняется только «v».'
  ],
  mistakes: [
    { bad: 'je serai avoir', good: 'j’aurai', why: 'это две разные формы: «быть» и «иметь» в будущем.' },
    { bad: 'je ferai', good: 'je ferai', why: 'верно: с s в конце, «je fera» — это «je répare».' },
    { bad: 'je parlererai', good: 'je parlerai', why: 'инфинитив talk не вставляют: parler + ai = parlerai.' }
  ]
};

/* ---------------- JE VOUDRAIS ---------------- */
FR.grammarDeep.vouloir = {
  rules: [
    '«Je voudrais» — настоящее время глагола vouloir, но звучит как «я бы хотел». Именно эта форма делает фразу вежливой.',
    'Она заменяет всё: «Je voudrais un café» (вместо «дайте кофе»), «Je voudrais payer» (вместо «я хочу заплатить»), «Je voudrais l’addition» (вместо «счёт, пожалуйста»).',
    'Дальше идёт инфинитив: «Je voudrais voir», «Je voudrais essayer», «Je voudrais parler à Madame».',
    'Есть и форма вежливее: «Vous auriez l’obligeance de…?» — но она слишком канцелярская, бабушке достаточно «je voudrais».'
  ],
  exceptions: [
    '«Je veux» звучит как приказ — «я хочу». Разница между «я хочу» и «я бы хотел» во французском такая же, как в русском, только её слышат сразу.',
    'В ресторане всё начинается с «je voudrais» и заканчивается «l’addition, s’il vous plaît». Два этих слова знают все официанты.',
    'Сказать «Je voudrais» можно и о погоде: «Je voudrais du soleil» — «хотелось бы солнца».'
  ],
  mistakes: [
    { bad: 'je veux un café, s’il vous plaît', good: 'je voudrais un café, s’il vous plaît', why: 'с «je veux» вас проигнорируют: это требование.' },
    { bad: 'je voudrais voir', good: 'je voudrais voir', why: 'верно: после voudrais всегда инфинитив.' },
    { bad: 'je voudrais payer', good: 'je voudrais payer', why: 'верно: конец фразы в магазине или ресторане.' }
  ]
};

/* ---------------- ALLER + ИНФИНИТИВ ---------------- */
FR.grammarDeep.aller_inf = {
  rules: [
    'Вместо будущего времени говорят «aller» + инфинитив: «je vais manger» — я поем, я собираюсь поесть. Короче, чем «je mangerai», и звучит как живая речь.',
    'Спрягается только aller, а он один на всех: vais, vas, va, allons, allez, vont.',
    'Инфинитив стоит в том же лице? Нет, он всегда один и тот же: «je vais manger», «tu vas manger», «il va manger».',
    'Но сам aller может значить и просто «идти»: «Je vais à Paris» — я еду в Париж. Различаются по тому, что стоит после.'
  ],
  exceptions: [
    'Если после aller идёт инфинитив — это ближайшее будущее. Если место или ничего — это движение. «Je vais au café» — иду в кафе; «Je vais voir» — собираюсь увидеть.',
    'Глагол «aller» один из немногих, у которого настоящее время совпадает с будущим: «je vais» — и «я иду», и «я пойду». Смысл подсказывает конец фразы.',
    'Раньше эта форма считалась грубой уличной речью, теперь её говорят все и везде.'
  ],
  mistakes: [
    { bad: 'je vais manger', good: 'je vais manger', why: 'верно.' },
    { bad: 'je vais à manger', good: 'je vais manger', why: '«à» тут лишний: à — это «в/на» место, а не «собираться».' },
    { bad: 'tu vas à voir', good: 'tu vas voir', why: 'инфинитив сам по себе, без предлога.' }
  ]
};

/* ---------------- ДЕСЯТЬ ГЛАГОЛОВ ---------------- */
FR.grammarDeep.top10 = {
  rules: [
    'Из тысяч французских глаголов эти десять встречаются в каждом втором предложении. Их не выводят из правил — их учат наизусть.',
    'Проверка на «ils»: почти все они заканчиваются на -ent — ils sont, ils vont, ils veulent. Но четыре выбиваются: ils font, ils sont, ils vont, ils disent.',
    '«On» вместо «nous»: в разговоре «on» = «мы», «ты», «люди» — все сразу. «On va manger ?» значит «пойдём поесть?» без всяких «nous».',
    'Чтобы понять, спрягается ли глагол с «être» или «avoir», посмотрите на «ils»: если на -ent — это «être» (venir, partir, tomber, naître), остальное — «avoir».'
  ],
  exceptions: [
    '«Vouloir» и «pouvoir» берут «s» в singular: il veut, elle veut, ils veulent. Всё остальное в единственном числе заканчивается на -t.',
    '«Dire» в единственном числе теряет -r: «je dis», «tu dis», «il dit». В «ils» буква r возвращается: «ils disent».',
    '«Savoir» в формах «je sais» не выглядит как «savoir» вообще. Это тот случай, когда учить надо не по виду, а на слух.'
  ],
  mistakes: [
    { bad: 'il veux', good: 'il veut', why: 'у vouloir в «он» — -t, а не -s.' },
    { bad: 'ils faire', good: 'ils font', why: 'faire в «ils» совсем другое слово.' },
    { bad: 'il sais', good: 'je sais / tu sais / il sait', why: 'у savoir в «он» — -t: il sait.' }
  ]
};
