/* =============================================================
   ГРАММАТИКА — ПОДРОБНЫЕ ОБЪЯСНЕНИЯ, ЧАСТЬ 4 (времена)

   Восемь тем про время. Здесь — правила по шагам, исключения и
   то, как говорят неправильно. Описание формата — в начале файла
   fr_grammar_deep.js.
   ============================================================= */

FR.grammarDeep = FR.grammarDeep || {};

/* ---------------- КАРТА ВРЕМЁН ---------------- */
FR.grammarDeep.temps = {
  rules: [
    'Во французском два прошедших времени: imparfait (несовершенное) и passé composé (совершённое). Понять их проще, чем кажется, если помнить про картинку.',
    'Imparfait — это фон. Он ничего не сообщает, а показывает: дождь шёл, город жил, она спала. Действие длится и глазу не видно его начала и конца.',
    'Passé composé — это событие. У него есть начало и конец: он позвонил, мы приехали, я поел.',
    'Présent — то, что происходит сейчас или происходит вообще: «я говорю по-французски», «вода кипит при 100 градусах».',
    'Futur simple — то, что будет: «je parlerai». Futur proche — «я сейчас сделаю»: «je vais parler». В разговоре чаще второе.',
    'Есть ещё времена, которые носители языка почти не используют: futur antérieur, plus-que-parfait в рассказах, imparfait du subjonctif. Их можно не учить.'
  ],
  exceptions: [
    'Passé composé — не простое прошедшее время, а составное: два глагола в одной форме. «J’ai mangé» — это «я (съел-часть)», где «ai» помогает, а «mangé» несёт смысл.',
    'Imparfait образуется от инфинитива по первому спряжению: parler → parl-ais, finir → fin-issais. Это единственное место, где 1-е спряжение помогает запомнить 2-е.',
    'Futur simple тоже составное: инфинитив без окончания + ai. «Je parlerai» = parler + ai. Поэтому оно работает с любым глаголом, даже незнакомым.'
  ],
  mistakes: [
    { bad: 'hier, je mange une pomme', good: 'hier, j’ai mangé une pomme', why: 'вчера — это прошлое, нужно passé composé.' },
    { bad: 'quand j’étais petit, je mangeais beaucoup', good: 'quand j’étais petit, je mangeais beaucoup', why: 'верно: привычка — imparfait.' },
    { bad: 'demain, je mange', good: 'demain, je mangerai', why: 'завтра — будущее. В разговоре скажут «je vais manger».' }
  ]
};

/* ---------------- PASSÉ COMPOSÉ ---------------- */
FR.grammarDeep.passe_compose = {
  rules: [
    'Составляется из двух глаголов: вспомогательный (avoir или être) + participe passé (третья форма). «J’ai mangé»: j’ai помогает, mangé — смысл.',
    'Третья форма образуется от инфинитива: -er → -é (parler → parlé), -ir → -i (finir → fini), -re → -u (vendre → vendu).',
    'В большинстве случаев вспомогательный — avoir. «J’ai mangé», «j’ai parlé», «j’ai vu». Неправильных времён тут почти нет.',
    'С être — только у глаголов движения и перемены состояния: aller, venir, arriver, partir, entrer, sortir, monter, descendre, rester, tomber, naître, mourir, passer, retourner, devenir.',
    'У глаголов с être частица не согласуется с тем, о ком говорят, — но подлежащее всегда «я» или «мы», поэтому выглядит всегда одинаково: «je suis allé», «nous sommes allés».',
    'Отрицание и вопрос строятся как обычно: «je n’ai pas mangé», «as-tu mangé ?».'
  ],
  exceptions: [
    'Глаголы с être — их 16, учат списком. Обратите внимание на «rester», «tomber», «passer», «retourner»: «je suis resté» звучит как «я был» — так и значит.',
    'У aller в отрицании частица не ставится: «je ne suis pas allé». Все остальные: «je ne suis pas arrivé».',
    'У «sortir» есть два значения. «Je suis sorti» — я вышел (движение). «J’ai sorti le chien» — я вывел собаку (действие, поэтому avoir). С «rester» так не выйдет: только «je suis resté».'
  ],
  mistakes: [
    { bad: 'j’ai mangé', good: 'j’ai mangé', why: 'верно. Частая ошибка — «j’ai mange», без прошедшего времени: это «я ем, а ел когда-то ещё».' },
    { bad: 'je suis mangé', good: 'j’ai mangé', why: 'manger работает с avoir, а не с être.' },
    { bad: 'je ne suis pas allé', good: 'je ne suis pas allé', why: 'верно: у aller отрицание без частицы.' },
    { bad: 'j’ai parti', good: 'je suis parti', why: 'partir — глагол движения, значит être: «je suis parti».' }
  ]
};

/* ---------------- IMPARFAIT ---------------- */
FR.grammarDeep.imparfait = {
  rules: [
    'Imparfait — «делал, делал и делал». Три признака: длительность, повторяемость, описание обстановки.',
    'Образуется от первой формы спряжения плюс окончания 2-го лица множественного: nous parle → nous parl-ions. Отсюда parle-ais, parl-ais, parl-ait, parl-ions, parl-iez, parl-aient.',
    'Формы «tu» и «il» совпадают, но это не ошибка, а особенность языка: в imparfait говорят медленно, звуки тянутся, «звук исчезает».',
    'Imparfait отвечает на вопрос «какой был?» — «le café était petit». Passé composé отвечает на «что сделал?» — «j’ai mangé».',
    'Отрицание: «je ne mangeais pas». В imparfait частица ne перед глаголом не исчезает, в отличие от passé composé.'
  ],
  exceptions: [
    'У être в imparfait неправильные формы: j’étais, tu étais, il était, nous étions, vous étiez, ils étaient. Это самое частое исключение во всём языке.',
    'У aller: j’allais, tu allais, il allait, nous allions, vous alliez, ils allaient. У imperfect только «ai» превращается в «ais», всё остальное по правилу.',
    'Имперфект работает и в настоящем: «il faisait beau» — «была хорошая погода» (о том времени, когда мы говорили). Поэтому перевод «делал» тут обманчив.'
  ],
  mistakes: [
    { bad: 'je mangais', good: 'je mangeais', why: 'верно: «я ел (долго)».' },
    { bad: 'j’ai mangé', good: 'je mangeais', why: 'однократное действие — это passé composé, не imparfait.' },
    { bad: 'il était', good: 'il était', why: 'верно: у être в imparfait окончание -ait, а не -ais.' }
  ]
};

/* ---------------- ДВА ПРОШЕДШИХ ---------------- */
FR.grammarDeep.passe_imparfait = {
  rules: [
    'Когда в рассказе два прошедших времени, деление жёсткое: imparfait — фон, passé composé — событие поверх фона.',
    'Фон — это то, что длилось и было видно: «il pleuvait» (шёл дождь), «je marchais» (я шёл), «elle dormait» (она спала).',
    'Событие — то, что в этом фоне вдруг произошло: «j’ai vu un café», «le téléphone a sonné», «il est arrivé».',
    'Связка двух времён: сначала ставим второй, потом первый. «Il pleuvait, je marchais. Puis j’ai vu un café» — дождь шёл, я шёл, и вот увидел кафе.',
    'В рассказе о жизни это даёт «тогда я был маленьким, а случилось вот это»: «Quand j’étais jeune, j’ai étudié le français».'
  ],
  exceptions: [
    'В России то же самое: «Шёл дождь, и вдруг приехал автобус». Правило переносится напрямую — учится легко.',
    'Глагол «être» в imparfait может стоять в начале как «обстоятельство места»: «il était minuit» — было полночь.',
    'Если действие повторялось и вы хотите сказать именно об этом, нужен imparfait с «chaque fois»: «chaque matin, il pleuvait».'
  ],
  mistakes: [
    { bad: 'j’ai pleuvait', good: 'il pleuvait', why: 'дождь сам не делает — его льёт. Для погоды всегда il, без je.' },
    { bad: 'quand j’étais petit, j’ai mangé beaucoup', good: 'quand j’étais petit, je mangeais beaucoup', why: 'привычка во времени — imparfait.' },
    { bad: 'je dormais quand le téléphone a sonné', good: 'je dormais quand le téléphone a sonné', why: 'верно — классическая связка фона и события.' }
  ]
};

/* ---------------- PLUS-QUE-PARFAIT ---------------- */
FR.grammarDeep.plus_que_parfait = {
  rules: [
    'Нужен, когда два прошедших стоят рядом и надо показать, что одно было раньше другого: «когда он пришёл, я уже поел».',
    'Составляется так же, как passé composé, но во вспомогательном глаголе окончание длиннее: j’ai mangé → j’avais mangé, je suis allé → j’étais allé.',
    'Подсказка в самом слове: avant (до), déjà (уже), quand (когда) — все эти слова требуют plus-que-parfait.',
    'Время как отношение: «Il était arrivé avant moi» — он приехал до меня, значит раньше, чем я.'
  ],
  exceptions: [
    'У être то же правило: j’étais parti — «я уже уехал».',
    'Но в разговоре plus-que-parfait часто опускают: «Je suis arrivé avant toi» — «juste» подразумевается. И это правильно.',
    'В сложных фразах plus-que-parfait ставят перед passé composé во избежание путаницы: «Quand je suis arrivée, il était déjà parti».'
  ],
  mistakes: [
    { bad: 'j’ai eu mangé avant d’arriver', good: 'j’avais déjà mangé avant d’arriver', why: '«до» требует plus-que-parfait: avais, а не ai.' },
    { bad: 'j’avais déjà mangé', good: 'j’avais déjà mangé', why: 'верно: узнаваемый признак — déjà.' },
    { bad: 'il était déjà parti', good: 'il était déjà parti', why: 'верно.' }
  ]
};

/* ---------------- IMPÉRATIF ---------------- */
FR.grammarDeep.imperatif = {
  rules: [
    'Три формы: tu, vous, nous. Всё, что вам нужно в жизни.',
    'У «nous» и «vous» форма берётся из настоящего времени: parle- → parlons, parlez. И почти всегда «vous» звучит с -ez: «parlez», «regardez», «écrivez».',
    'У «vous» почти всегда оставляют -ez: «parlez», «écrivez», «regardez», «prenez». «vous parle» — это «говорит» (он говорит), а не «говорите».',
    'Глаголы на «er» в «vous» окончание не меняют: «parler» → «parlez», «regarder» → «regardez».',
    'Возвратные глаголы ставят «vous» перед ударным гласным: «asseyez-vous», «levez-vous», «revenez». Не «assoyez-vous».'
  ],
  exceptions: [
    'У être в «vous» странная форма: «soyez»! Из «être» нельзя убрать -r, поэтому вместо «êtes» говорят «soyez». Первое, что узнают иностранцы во французском.',
    'У avoir и savoir в «vous»: «ayez», «sachez». Они тоже взяты не из «avez», «savez», а из других форм.',
    'С «vous» частица «ne» и «pas» ставятся после глагола: «Ne venez pas !» — «Не приходите!»'
  ],
  mistakes: [
    { bad: 'vous parle', good: 'parlez', why: 'в императиве у «vous» нужно -ez, иначе это «он говорит».' },
    { bad: 'assoyez-vous', good: 'asseyez-vous', why: 'возвратный глагол: «vous» ставится перед ударным гласным.' },
    { bad: 'soyez', good: 'soyez', why: 'верно, и это одно из самых первых слов, которые стоит выучить.' },
    { bad: 'Ne pas venez', good: 'Ne venez pas', why: 'в императиве «ne» идёт перед глаголом, «pas» — после.' }
  ]
};

/* ---------------- CONDITIONNEL ---------------- */
FR.grammarDeep.conditionnel = {
  rules: [
    'Образуется как imparfait, но от инфинитива: parler → parlerais, finir → finirais, vendre → vendrais.',
    'Смысл — нереальность: мечта, вежливость или вежливое «мог бы». «Je voudrais» — «я бы хотел», а не «я хочу».',
    'Хотите узнать, сможете ли вы? Тоже условное: «Pourriez-vous m’aider ?»',
    'Если всё хорошо: «Ça serait génial !» — «Это было бы здорово!».'
  ],
  exceptions: [
    'У être, avoir, faire, aller, venir, pouvoir, prendre, vouloir, devoir, savoir — неправильные: je serais, j’aurais, je ferais, j’irais, je viendrais, je pourrais, je prendrais, je voudrais, je devrais, je saurais.',
    '«Il faudrait» — «надо было бы»: мягкий и очень полезный оборот. «Il faudrait partir tôt» — надо было бы выйти пораньше.',
    'Почти вся вежливость во французском стоит на условном наклонении: je voudrais, je pourrais, j’aimerais, auriez-vous l’obligeance.',
  ],
  mistakes: [
    { bad: 'je voudrais un café', good: 'je voudrais un café', why: 'верно: вежливость, а не требование.' },
    { bad: 'je veux un café', good: 'je voudrais un café', why: 'с «je veux» официант слышит приказ, а не просьбу.' },
    { bad: 'j’aurais', good: 'j’aurais', why: 'верно: avoir в условном меняется полностью.' },
    { bad: 'je serais', good: 'je serais', why: 'верно.' }
  ]
};

/* ---------------- SUBJONCTIF ---------------- */
FR.grammarDeep.subjonctif = {
  rules: [
    'Появляется только после «que»: «il faut que…», «je veux que…», «il est important que…». В этих фразах в русском тоже стоит «чтобы».',
    'Местоимения que, qui, où, quand работают иначе: «Je sais qu’il parle» — это не subjonctif, это просто «что».',
    'Отрицание живёт внутри: «il faut que je ne vienne pas» — надо, чтобы я не пришёл.',
    'Порядок слов прямой: «il faut que je vienne», не «il faut que vienne je».',
    'Часто после «ne…pas» субъюнктив не нужен вовсе: «je ne crois pas qu’il vienne» — «не верю, что придёт», всё равно que.'
  ],
  exceptions: [
    'Перед que «il» превращается в «il» и остаётся: «qu’il», «qu’elle». «Il faut qu’il vienne» — через «qu’», а не «que il».',
    'У сильных глаголов форма заучивается: avoir → ait, être → soit, faire → fasse, prendre → prenne, pouvoir → puisse, vouloir → veuille, devoir → doive, savoir → sache.',
    'У большинства глаголов форма subjonctif совпадает с imparfait: parler → qu’il parle, finir → qu’il finisse. Запоминать нужно только восемь сильных.'
  ],
  mistakes: [
    { bad: 'je veux que tu m’aides', good: 'je veux que tu m’aides', why: 'верно: после «que» стоит форма subjonctif, а не infinitif.' },
    { bad: 'je veux que tu m’aider', good: 'je veux que tu m’aides', why: 'после «que» — только спрягаемая форма, инфинитив не подходит.' },
    { bad: 'je sais que il parle', good: 'je sais qu’il parle', why: 'перед il гласная: «qu’il», а не «que il».' }
  ]
};
