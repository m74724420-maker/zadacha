/* =============================================================
   ГРАММАТИКА — ПОДРОБНЫЕ ОБЪЯСНЕНИЯ, ЧАСТЬ 1 (основные темы)

   К файлу fr_words.js. Там — сами темы и фразы для повтора.
   Здесь — то, без чего грамматику не выучить: правило по шагам,
   исключения из него и то, как говорят неправильно.

   Как это работает: тема ищется по id. Что есть в этой таблице —
   то показывается на экране темы. Нет — показывается как раньше.

   Правила записываются обычным текстом. Если внутри правила русские
   кавычки «…» — эта часть станет живой: коснёшься, и голос
   произнесёт её по-французски.

   Ошибки записаны так:
     bad  — как говорят неправильно (часто по-русски с французским
            выговором; коснёшься — услышишь);
     good — как надо;
     why  — почему так.
   ============================================================= */

FR.grammarDeep = FR.grammarDeep || {};

FR.grammarDeep.sexe = {
  rules: [
    'В русском род слышно только у слов «мама» и «папа». Во французском он есть у всех: «le» — он, «la» — она. Произносить надо всегда.',
    'Как понять, кто перед вами? Смотрите на окончание. Слово на -e — женский: «la table», «la porte», «la maison». Слово не на -e — мужской: «le pain», «le jardin», «le livre».',
    'Слово женского рода бывает и на -ette, -ette (bicy-clette), -esse (professe), -eure (docteure), -trice (actrice).',
    'Есть слова, которые оканчиваются на -e, но всё равно мужского рода: «le livre» (книга), «le père» (отец), «le stade», «le système». Их учат наизусть.',
    'Род не меняется от того, что вы слово сказали или не сказали. Он приписан слову навсегда.'
  ],
  exceptions: [
    '«Le» перед словом на гласный звук превращается в «l’»: le homme → l’homme, le arbre → l’arbre, le école → l’école. Но «le hiking» остаётся «le hiking» — звук слышен.',
    'Некоторые слова меняют род по смыслу: «lureau» — стул (муж.), «la lire» — кровать (жен.). Похожие звучат, но род разный.'
  ],
  mistakes: [
    { bad: 'la pain', good: 'le pain', why: 'pain не кончается на -e, значит мужской.' },
    { bad: 'le maison', good: 'la maison', why: 'кончается на -e — женский.' },
    { bad: 'la homme', good: 'l’homme', why: 'перед гласным звуком le сокращается: l’.' }
  ]
};

FR.grammarDeep.articles = {
  rules: [
    'Артикль — служебное слово перед словом. Сам по себе он ничего не значит, но без него фраза по-французски не звучит. Утверждение «la maison» вместо «maison» — это ошибка, как сказать «дом» вместо «тот дом».',
    'Le, la — для уже известного: «тот самый дом». Un, une — для нового, «какой-то дом», «один дом». Сравните: «Je vois la maison» (вот тот дом, на который я смотрю) и «J’ai une maison» (у меня есть дом, тот самый, о котором я рассказываю).',
    'Les — несколько. Никакого рода: les hommes, les femmes, les enfants.',
    'Des — «несколько новых». После des следующий глагол читается без выговора: «des Maison» — это «несколько домов», а не «несколько масонов».',
    'Артикль опускают: с городами и странами после «à» и «de» («à Paris», «de France»), с именами собственными («Paris est grand»), во множественном числе имён («les Colin»).'
  ],
  exceptions: [
    '«À + le» = au, «à + les» = aux. «De + le» = du, «de + les» = des. Смотрите, как приятно: «le Gare» → «au Gare» → «du Gare».',
    '«de» перед гласным звуком теряет e: «de + ami» = «d’ami». А «du» звучит как «дю» и остаётся неизменным: «du pain», «du fromage».',
  ],
  mistakes: [
    { bad: 'la maison de Marie', good: 'la maison de Marie', why: 'тут всё верно — проверьте на всякий случай, что перед «de» с именем артикль не нужен.' },
    { bad: 'J’aime le fromage', good: 'J’aime le fromage', why: 'верно.' },
    { bad: 'Je achète du pain', good: 'J’achète du pain', why: 'верно: часть откуда.' },
    { bad: 'Il veux un maison', good: 'Il veut une maison', why: 'maison — женский, значит une. Артикль подбирают по роду слова, а не по смыслу.' }
  ]
};

FR.grammarDeep.etre = {
  rules: [
    'Être — самый употребительный глагол. Он же «есть», «быть», «существовать»: «Je suis Marie» — я есть Мария, то есть я Мария.',
    'У всех лиц, кроме «je», окончание -s: tu es, il est, elle est, on est. У «vous» — ête, у «nous» — sommes, у «ils/elles» — sont. Запомните по именам: два «существа» (tu, il), поэтому -s.',
    'С «nous» окончание длинное: nous sommes. С «vous» — ête: это «ête», а не «ette», никаких двойных t.',
    'После être можно ставить прилагательное: «Je suis malade», «Elle est belle», «Ils sont français». Или название профессии: «Elle est médecin».',
    'В вопросе «être» не пропадает: «Tu es français ?» — «Ты француз?» Слова est перед вопросом остаётся на месте.'
  ],
  exceptions: [
    'Перед «ne» и «pas» форма меняется: je suis → je ne suis pas.',
    'В разговоре «tu» и «vous» смешиваются по привычке, но для бабушки правильно: vous со взрослыми и незнакомыми, tu — с близкими и детьми.'
  ],
  mistakes: [
    { bad: 'je suis Marie', good: 'je suis Marie', why: 'верно. Частая ошибка — «je suis» + «-s», то есть «je suis suis». Так не говорят.' },
    { bad: 'tu esAggregate', good: 'tu es', why: 'у tu окончание -s, а не -es.' },
    { bad: 'vous êtes', good: 'vous êtes', why: 'верно: с ударением, иначе это «вы были».' },
    { bad: 'je ne suis pas', good: 'je ne suis pas', why: 'верно: без ne форма была бы «je suis», значит в отрицании ne исчезает.' }
  ]
};

FR.grammarDeep.avoir = {
  rules: [
    'Avoir — «иметь, у кого-то есть». Его же «я имею». Считать от «я» бесполезно: j’ai не похоже на «я имею» ничем.',
    'У всех окончание -a или -as или -ont: j’ai, tu as, il a, nous avons, vous avez, ils ont.',
    'Чаще всего avoir идёт с именем вещи: «j’ai un livre», «elle a deux enfants». Это работает как «у меня есть».',
    'Есть устойчивые сочетания, которые говорят целиком: «j’ai faim» (я голоден), «j’ai soif» (хочу пить), «j’ai chaud» (жарко), «j’ai froid» (холодно), «j’ai peur» (боюсь), «j’ai mal à la tête» (болит голова). Их учат наизусть.',
    'Вежливая просьба — это «je voudrais». Про это отдельная тема «Я бы хотел»: одно слово заменяет и «дайте», и «сколько стоит», и «покажите».'
  ],
  exceptions: [
    'Ужасное правило, но важное: перед «du» и «le» avoir теряет окончание — j’ai, а не j’ai un. «Le pain» → «j’ai du pain». Произносится всё равно «жю па́н», но буквально в тексте «du».',
    'Это правило не касается «de» без артикля: «j’ai de l’argent», «j’ai de la chance». Там avoir остаётся: j’ai.',
    'Отрицание: «je n’ai pas» — «я не имею». Форма та же, что и утверждение, добавляется только ne.'
  ],
  mistakes: [
    { bad: 'j’ai le pain', good: 'j’ai du pain', why: 'перед «le» глагол теряет окончание: avoir + le = du.' },
    { bad: 'j’ai besoin d’un pain', good: 'j’ai besoin d’un pain', why: 'верно: здесь «d’», а не «du», потому что le не было.' },
    { bad: 'il a faim', good: 'il a faim', why: 'верно. Но «il est faim» — грубая ошибка: faim только с avoir.' },
    { bad: 'je suis faim', good: 'j’ai faim', why: 'голод — это avoir, а не être. «Je suis faim» говорят те, кто переводит с русского на лету.' }
  ]
};

FR.grammarDeep.nommer = {
  rules: [
    'Se lever, s’appeler — возвратные глаголы. Возвратные — те, где «se» стоит перед инфинитивом. Сам se ничего не значит, а смысл несёт глагол.',
    '«Je m’appelle Marie» буквально «я называю себя Мария». Смысл тот же: меня зовут Мария.',
    'Перед «se» глагол стоит в инфинитиве: «Je vais m’appeler», «Elle va se lever» — «Я собираюсь представиться», «Она встанет».',
    'Возвратные глаголы спрягаются с «être»: «Je me suis levé» — «Я встал». Не с avoir! Это отличает их от обычных: «J’ai mangé» (я поел), «Je me suis levé» (я встал).'
  ],
  exceptions: [
    'Возвратных глаголов не так много, их учат списком: s’appeler (называться), se lever (вставать), s’habiller (одеваться), se laver (мыться), se reposer (отдыхать). Пяти хватает, остальное — потом.',
    'Не все глаголы со «se» возвратные. «Il se décide» — «решается» тоже возвратный. Но «se dire» звучит неправильно: говорят «il se dit».'
  ],
  mistakes: [
    { bad: 'je m’appelle', good: 'je m’appelle', why: 'верно. Ошибка — «j’appelle» без se: так не говорят.' },
    { bad: 'je appelle Marie', good: 'je m’appelle Marie', why: 'пропали возвратный se и две буквы m перед app: без них смысл теряется.' },
    { bad: 'je mecalledais', good: 'je m’appelais', why: 'двойная l и забытое e в конце: m’appelle.' }
  ]
};

FR.grammarDeep.non = {
  rules: [
    'Отрицание всегда из двух слов: ne перед глаголом, pas после. «Je ne comprends pas» — я не понимаю.',
    'В разговоре «ne» проглатывают, но «pas» — никогда. «Je comprends pas» — нормально в устах, «Je ne pas comprends» — ошибка.',
    'Отрицание стоит в одной части предложения и отменяет всё, что после него. «Je ne mange pas de viande» — я не ем мяса.',
    'Частица «de» после отрицания: «Je n’ai pas de pain» — у меня нет хлеба. Было «j’ai du pain», стало «j’ai pas de pain».'
  ],
  exceptions: [
    'После «jamais» и «pas» «ne» не выбрасывают: «Je ne fume jamais» (никогда). Порядок жёсткий: ne → jamais → pas → глагол? Нет: «Je ne fume jamais» — ne стоит до глагола, jamais после него, pas в конце.',
    'Глаголы être и avoir в отрицании остаются в своей форме: «je ne suis pas», «je n’ai pas». А вот «parler» теряет окончание: «je ne parle pas».'
  ],
  mistakes: [
    { bad: 'je pas compris', good: 'je n’ai pas compris', why: 'нет «ne» и нет «ai». По-русски «не понял» отвечает «comprendre», а у него прошедшее время через avoir.' },
    { bad: 'je ne pas comprendre', good: 'je ne comprends pas', why: 'порядок: сначала ne, потом глагол, потом pas.' },
    { bad: 'je n’ai pas pain', good: 'je n’ai pas de pain', why: 'после отрицания «du» превращается в «de»: у меня нет хлеба.' }
  ]
};

FR.grammarDeep.questions = {
  rules: [
    'Порядок слов в вопросе такой же, как в утверждении. Разница одна — голос идёт вверх, в конце. Слова-вопросы ставятся в начало, но не обязаны.',
    'С вопросительным словом порядок прямой: «Où est la gare ?» — где вокзал? В русском «Где вокзал?» — то же самое.',
    'Можно спросить и без вопросительного слова, просто подняв голос: «Vous êtes française ?» Второй вариант вежливее.',
    'Обычно спрашивают «¿Comment…?» — «как», «Combien…?» — «сколько», «Où…?» — «где».'
  ],
  exceptions: [
    'Если вопросительное слово стоит в начале, запятая перед «est» не нужна. Но если слово в конце, запятая обязательна: «Vous voulez du café, s’il vous plaît?»',
    'Глагол «être» в вопросе с «qui» или «où» не опускают, в отличие от английского: «Où est la gare ?», а не «Où la gare est ?»'
  ],
  mistakes: [
    { bad: 'vous êtes française?', good: 'Vous êtes française ?', why: 'в вопросе перед знаком «?» ставим пробел, и с заглавной — это вежливо.' },
    { bad: 'quelle heure il est?', good: 'Quelle heure est-il ?', why: 'с вопросительным словом в начале порядок прямой: «quelle heure est-il».' },
    { bad: 'combien ça fait?', good: 'Combien ça fait ?', why: 'верно, это «сколько стоит». Хотя для покупок привычнее «Combien ça coûte ?».' }
  ]
};

FR.grammarDeep.nombres = {
  rules: [
    'До двадцати числа учат наизусть: un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix, onze, douze, treize, quatorze, quinze, seize.',
    'Дальше двадцать — «vingt» (20). Дальше тридцать — «trente», сорок — «quarante», пятьдесят — «cinquante».',
    'Шестьдесят — «soixante». И тут французский хитрит: 70 и 80 собираются из шестидесяти: 70 = soixante-dix (шестьдесят + десять), 80 = quatre-vingts (четыре двадцатки).',
    'Дальше 90 = quatre-vingt-dix (четыре двадцатки + десять).',
    'После «vingt» и «cent» перед числом ничего не добавляют: «vingt-deux», но «vingt et un» — «двадцать один». Всё остальное соединяется через «et»: «trente et un», «soixante et onze».'
  ],
  exceptions: [
    '«quatre-vingts» с «s» — только когда это круглое число 80. «Quatre-vingts kms» — восемьдесят километров. Но «quatre-vingt-un» — без s.',
    '«cent» прибавляет «un» без «et»: «cent un», но «cent et un» не говорят.'
  ],
  mistakes: [
    { bad: 'quatre-vingt-cinq', good: 'quatre-vingt-cinq', why: 'верно. Но «quatre-vingts-cinq» — ошибка: s только у круглого восьмидесяти.' },
    { bad: 'soixante-quinze', good: 'soixante-quinze', why: 'верно: 75 = 60 + 15.' },
    { bad: 'vingt-et-un', good: 'vingt et un', why: 'соединять «et» не нужно: vingt и так уже на «un» заканчивается.' }
  ]
};

FR.grammarDeep.politesse = {
  rules: [
    'Во французском вежливость обязательна, а не опциональна. Без «s’il vous plaît» и «merci» вас сочтут грубияном, даже если сказано правильно.',
    'В магазине и кафе работает одно предложение: «Je voudrais…» — «я бы хотел». Оно заменяет и «дайте», и «сколько стоит», и «покажите».',
    'При входе к незнакомому: «Bonjour, madame» — и дальше можно молчать хоть час. Это не пустота, а приветствие.',
    'Прощание: «Au revoir» (до свидания), «Bonne journée» (хорошего дня) — второе теплее, его говорят чаще.',
    'Извиниться стоит заранее: «Pardon» — когда столкнулись, «Excusez-moi» — когда хотите пройти, спросить дорогу или перебить.'
  ],
  exceptions: [
    '«Je voudrais» — настоящее время, но звучит как «я бы хотел». Никакого будущего тут нет, просто глагол хотения в вежливой форме.',
    '«Merci» говорят и в ответ на «Je voudrais…» — тогда добавляют «de» перед тем, за что благодарят: «Merci de votre aide».'
  ],
  mistakes: [
    { bad: 'Je veux un café, s’il vous plaît', good: 'Je voudrais un café, s’il vous plaît', why: '«Je veux» звучит как приказ: «я хочу». Вежливая форма — «je voudrais».' },
    { bad: 'Bonsoir madame', good: 'Bonsoir, madame', why: 'после приветствия ставим запятую, иначе два слова слипаются в нечто невнятное.' },
    { bad: 'De rien', good: 'De rien', why: 'верно: на «merci» отвечают «de rien», иначе разговор повисает.' }
  ]
};
