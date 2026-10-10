/* =============================================================
   ГРАММАТИКА — ПОДРОБНЫЕ ОБЪЯСНЕНИЯ, ЧАСТЬ 2 (глаголы и местоимения)
   Всё описание файла — в fr_grammar_deep.js.
   ============================================================= */

FR.grammarDeep = FR.grammarDeep || {};

/* ---------------- ПРИЛАГАТЕЛЬНЫЕ ---------------- */
FR.grammarDeep.adj = {
  rules: [
    'Прилагательное подстраивается под слово: мужской род — без окончания, женский — с -e, множественное — с -s.',
    'Как угадать род: слово на -e — женский («la grande maison»), не на -e — мужской («le grand jardin»).',
    'Множественное число — это +s: grand → grands, grande → grandes. Но если слово уже кончается на -s или -x, -s не добавляют: «un pays» → «des pays», «un prix» → «des prix».',
    'Прилагательное обычно стоит после существительного: «une maison grande et belle». Реже — до, и тогда оба article: «une grande maison».',
    'Слово «beau» — исключение: красивый. Beau (он), belle (она), beaux, belles. Перед гласным: «bel homme», но «beau homme» тоже говорят, особенно в начале фразы.'
  ],
  exceptions: [
    'Все прилагательные женского рода получают -e. Но есть те, у которых это -esse: «abrégé» → «abrégée» (тот, кто любит короткое — «abrége», та, кто любит — «abrégeе»), «professeur» → «professe».',
    '«Nouveau» → «nouvelle». «Vieux» → «vieille», а перед гласным — «vieil»: «un vieil homme».',
    'Цвета никаких исключений не имеют: «blanche», «jaune» — просто женского рода +e.',
    'Прилагательные-«счастливчики» есть и у времён: «mieux», «plutôt» — они не меняются никогда.'
  ],
  mistakes: [
    { bad: 'la grand maison', good: 'la grande maison', why: 'maison женского рода — прилагательное тоже.' },
    { bad: 'les grandes maison', good: 'les grandes maisons', why: 'во множественном числе существительное тоже получает -s.' },
    { bad: 'la belle homme', good: 'la belle femme', why: 'homme — мужской, красивая женщина — «belle femme».' }
  ]
};

/* ---------------- ГЛАГОЛЫ НА -ER ---------------- */
FR.grammarDeep.verbe_er = {
  rules: [
    'Первая группа — самые частые глаголы: parler (говорить), habiter (жить), travailler (работать), aimer (любить), manger (есть), regarder (смотреть), acheter (покупать), tourner (поворачивать), arriver (приходить), entrer (входить).',
    'Окончание одно на всех шестерых: -e, -es, -e, -ons, -ez, -ent. Различаются только «мы» (-ons) и «вы» (-ez).',
    'Перед «ne…pas» глагол теряет окончание: «je parle» → «je ne parle pas».',
    'В будущем прибавляют -ai: «je parlerai». Тут вообще ничего не надо запоминать — правило одно на все глаголы первой группы.'
  ],
  exceptions: [
    'Все эти глаголы берут инфинитив без «er»: parler → parler, habiter → habiter, aimer → aimer. Просто убирают -er и оставляют основу.',
    'Есть слова-обманки: «acheter» → «j’achète», «préférer» → «je préfère» — тут e закрытое, это слышно и видно. Их читают как исключения, а не по правилу.',
    '«Errer», «jurer» вообще не имеют формы «tu» — вместо этого «toi, tu…».'
  ],
  mistakes: [
    { bad: 'je ne parle pas', good: 'je ne parle pas', why: 'верно — глагол потерял -e.' },
    { bad: 'tu parle', good: 'tu parles', why: 'у «ты» нужно -s.' },
    { bad: 'nous parle', good: 'nous parlons', why: 'у «мы» -ons, а не -e.' },
    { bad: 'je parlerai', good: 'je parlerai', why: 'верно: будущее время на -ai, никакой зубрёжки.' }
  ]
};

/* ---------------- ГЛАГОЛЫ НА -IR ---------------- */
FR.grammarDeep.verbe_ir = {
  rules: [
    'Вторая группа: finir (кончать), choisir (выбирать), réussir (преуспеть), grandir (расти), grossir (поправиться), obéir (слушаться).',
    'Окончание: -is, -is, -it, -issons, -issez, -issent. Узнать легко: если у «мы» есть -iss, значит глагол из этой группы.',
    'Перед «ne» -is тоже исчезает: «je ne finis pas».',
    'В будущем: -irai. «Je finirai» — закончу.'
  ],
  exceptions: [
    'Проверка на «мы» работает не всегда. «Nous finissons» (группа 2), но «nous Choisissez» — а всё равно группа 2. Ориентируйтесь не на правило, а на список.',
    '«Mentir», «partir», «sentir», «servir» — оканчиваются на -ir, но спрягаются как группа 3. Это главная ловушка: «nous partons», «nous sentons».',
    '«Mourir», «mourir» — тоже третья группа, хотя кончается на -ir: «nousmourons».'
  ],
  mistakes: [
    { bad: 'je ne fini pas', good: 'je ne finis pas', why: 'перед ne окончание -is исчезает.' },
    { bad: 'nous finisissons', good: 'nous finissons', why: 'один s, а не два: глагол уже кончается на s.' },
    { bad: 'nous partissons', good: 'nous partons', why: 'partir — не вторая группа, а третья. Из-за таких слов и нужен список.' }
  ]
};

/* ---------------- ГЛАГОЛЫ НА -RE ---------------- */
FR.grammarDeep.verbe_re = {
  rules: [
    'Третья группа: vendre (продавать), attendre (ждать), répondre (отвечать), entendre (слышать), perdre (терять), rendre (возвращать), demander (спрашивать).',
    'Окончание: -s, -s, -t, -ons, -ez, -ent. Обратите внимание на «он» — там -t, а не -d. Это отличает третью группу от первой.',
    'Перед «ne» глагол теряет окончание: «je ne vends pas», «je ne réponds pas».',
    'В будущем: -rai. «Je vendrai» — продам.'
  ],
  exceptions: [
    'Все эти глаголы кончаются на -re, а инфинитив у них без -re: «vendre» → «vendre», «attendre» → «attendre».',
    '«Répondre» — единственный, у кого «ils» на -ent и при этом с двумя n: «ils répondent». Остальные — «ils vendent», «ils attendent».',
    '«Faire» формально третья группа (fais, fais, fait, faisons, faites, font), но его все знают наизусть — он в списке десяти главных.'
  ],
  mistakes: [
    { bad: 'je ne vends pas', good: 'je ne vends pas', why: 'верно: -s исчезло.' },
    { bad: 'il rend', good: 'il rend', why: 'верно: у него -d, а не -t — это первая группа.' },
    { bad: 'il attends', good: 'il attend', why: 'у третьей группы в «он» стоит -t, не -s.' }
  ]
};

/* ---------------- УКАЗАТЕЛЬНЫЕ ---------------- */
FR.grammarDeep.demons = {
  rules: [
    'Ce, cet, cette, ces — это «этот». Четыре формы на два рода и два числа: ce — он, cet — он перед гласным, cette — она, ces — они.',
    'Разница между ce и cet только в произношении: «ce» — «сэ», «cet» — «сэт». Оба читаются одинаково.',
    'Перед словом на -h или на гласный звук — cet: «cet homme», «cet arbre», «cet hiver».',
    'На письме «cet» можно опустить: «ce homme» в книге встретится, в речи никто так не скажет.'
  ],
  exceptions: [
    'Слова на h с молчащим h всё равно берут cet: «l’homme» — h не читается. Но «le héros» — h читается, и там le: «le héros».',
    '«C’est» и «ces» — разные слова. «C’est Marie» — это Мария (это). «Ces livres» — эти книги. Не путайте.',
    'Всегда можно сказать «voilà» вместо указательного слова: «Voilà ma sœur». Это проще и звучит естественно.'
  ],
  mistakes: [
    { bad: 'ce homme est grand', good: 'cet homme est grand', why: 'перед гласным звуком — cet.' },
    { bad: 'ce arbre', good: 'cet arbre', why: 'то же: arbre начинается с гласного звука.' },
    { bad: 'ce livres', good: 'ces livres', why: 'множественное число — ces, род здесь не важен.' }
  ]
};

/* ---------------- МЕСТОИМЕНИЯ ПОСЛЕ ПРЕДЛОГА ---------------- */
FR.grammarDeep.pronom_prep = {
  rules: [
    'В русском «мне», «тебе», «ему» — это одни и те же слова с разными окончаниями. Во французском после предлога они вообще другие: de moi, de toi, de lui.',
    'Полный список: de moi (от меня), de toi (от тебя), de lui / d’elle (от него, от неё), de nous, de vous, d’eux / d’elles.',
    'С предлогом «à» получается то же самое, но проще: «à moi» — мне, «à toi» — тебе, «à lui» — ему, «à elle» — ей, «à nous» — нам, «à vous» — вам, «à eux» — им.',
    'Перед гласным звуком у всех, кроме moi и toi, добавляется -s: «de lui» → «de eux» — нет, у lui и eux убирают: «de lui», «de eux». А вот «de nous» → «d’entre nous».'
  ],
  exceptions: [
    '«Moi» и «toi» не меняются никогда, их учат наизусть: de moi, à moi, pour moi, avec moi.',
    'Всё остальное образуется по одной схеме: de + [l’] + nous / vous / eux / elles. Поэтому «avec eux», «chez eux», «pour elles» получаются сами.',
    'Эти местоимения никогда не стоят в начале фразы. «Moi, je…» — ошибка. Только с предлогом: «Pour moi, c’est important».'
  ],
  mistakes: [
    { bad: 'de moi', good: 'de moi', why: 'верно — и не путайте с «deme» (жилище).' },
    { bad: 'à mon', good: 'à moi', why: 'после предлога местоимение, а не притяжательное: «à moi», а не «à mon».' },
    { bad: 'moi, je suis Marie', good: 'Je suis Marie', why: '«moi» не ставят в начало фразы — это сразу выдаёт иностранца.' }
  ]
};
