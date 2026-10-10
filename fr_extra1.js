/* =============================================================
   РАЗГОВОРНИК «В ПОЕЗДКУ»

   Не грамматика и не слова — готовые реплики по ситуациям.
   Именно это нужно в аэропорту, в кафе и в аптеке: открыл, нашёл
   нужное, нажал — сказал. Бабушке не нужно вспоминать, как
   строить фразу, когда человек напротив ждёт ответа.

   Формат тот же, что у тем грамматики:
     rows — фразы, каждая говорится касанием;
     note — что сказать, если не поняли (отдельным блоком).

   Как добавить ситуацию: допишите объект в этот массив.
   ============================================================= */

FR.phrases = [
  {
    id: 'aeroport', emoji: '✈️', title: 'В аэропорту',
    note: 'Самые нужные фразы — первые. Их достаточно, чтобы пройти регистрацию.',
    rows: [
      { fr: 'Bonjour, je voudrais un aller-retour pour Paris, s’il vous plaît.', ru: 'Здравствуйте, мне билет туда-обратно в Париж, пожалуйста.' },
      { fr: 'Voici mon passeport.', ru: 'Вот мой паспорт.' },
      { fr: 'Une place, fenêtre si possible.', ru: 'Одно место, у окна если можно.' },
      { fr: 'Quel vol, s’il vous plaît ?', ru: 'Какой рейс, пожалуйста?' },
      { fr: 'À quelle heure mon vol ?', ru: 'Во сколько мой рейс?' },
      { fr: 'Où est la porte d’embarquement ?', ru: 'Где выход на посадку?' },
      { fr: 'Un bagage à main, une valise.', ru: 'Ручная кладь, один чемодан.' },
      { fr: 'C’est combien de baggage ?', ru: 'Сколько весит багаж?' },
      { fr: 'Merci beaucoup, c’est tout.', ru: 'Большое спасибо, это всё.' }
    ]
  },
  {
    id: 'controle', emoji: '🛂', title: 'Паспортный контроль',
    note: 'Тут говорит полиция, а не вы. Отвечайте коротко и спокойно.',
    rows: [
      { fr: 'Bonjour. Voici mon passeport.', ru: 'Здравствуйте. Вот мой паспорт.' },
      { fr: 'Je viens de Russie.', ru: 'Я из России.' },
      { fr: 'Je suis en vacances pour une semaine.', ru: 'Я в отпуске, на неделю.' },
      { fr: 'Je visite Paris seulement.', ru: 'Я посещаю только Париж.' },
      { fr: 'Oui, je reste chez mon frère.', ru: 'Да, я живу у брата.' },
      { fr: 'Voici mon billet de retour.', ru: 'Вот мой обратный билет.' },
      { fr: 'Pardon, je ne comprends pas.', ru: 'Извините, я не понимаю.' },
      { fr: 'Parlez plus lentement, s’il vous plaît.', ru: 'Говорите, пожалуйста, медленнее.' }
    ]
  },
  {
    id: 'transport', emoji: '🚇', title: 'Метро, поезд, вокзал',
    rows: [
      { fr: 'Où est la gare ?', ru: 'Где вокзал?' },
      { fr: 'Quel train va à Lyon ?', ru: 'Какой поезд идёт в Лион?' },
      { fr: 'Quel quai ?', ru: 'Какая платформа?' },
      { fr: 'Un aller simple pour Versailles.', ru: 'Билет в одну сторону до Версаля.' },
      { fr: 'C’est combien ?', ru: 'Сколько стоит?' },
      { fr: 'Quel arrêt est-ce ?', ru: 'Какая это остановка?' },
      { fr: 'Comment s’appelle cette station ?', ru: 'Как называется эта станция?' },
      { fr: 'Il faut prendre quelle ligne ?', ru: 'Какую линию брать?' },
      { fr: 'Je voudrais aller au centre-ville.', ru: 'Я хочу поехать в центр города.' }
    ]
  },
  {
    id: 'taxi', emoji: '🚕', title: 'Такси',
    rows: [
      { fr: 'Un taxi, s’il vous plaît.', ru: 'Такси, пожалуйста.' },
      { fr: 'À l’hôtel, vous savez ?', ru: 'До отеля, вы не знаете?' },
      { fr: 'Combien ça coûte jusqu’à la gare ?', ru: 'Сколько стоит до вокзала?' },
      { fr: 'Vous pouvez m’aider avec la valise ?', ru: 'Поможете с чемоданом?' },
      { fr: 'Arrêtez ici, s’il vous plaît.', ru: 'Остановите здесь, пожалуйста.' },
      { fr: 'Je suis désolée, je me suis trompée.', ru: 'Извините, я ошиблась.' },
      { fr: 'Gardez la monnaie.', ru: 'Сдачи не надо.' }
    ]
  },
  {
    id: 'cafe', emoji: '☕', title: 'Кафе и ресторан',
    note: 'Здесь помогает «Je voudrais» — оно звучит вежливо, а «je veux» как требование.',
    rows: [
      { fr: 'Une table pour deux, s’il vous plaît.', ru: 'Стол на двоих, пожалуйста.' },
      { fr: 'Je voudrais un café au lait.', ru: 'Я бы хотел кофе с молоком.' },
      { fr: 'Je voudrais l’addition, s’il vous plaît.', ru: 'Счёт, пожалуйста.' },
      { fr: 'Quel est le prix du plat du jour ?', ru: 'Сколько стоит блюдо дня?' },
      { fr: 'Sans sucre, merci.', ru: 'Без сахара, спасибо.' },
      { fr: 'C’est très bon, merci.', ru: 'Очень вкусно, спасибо.' },
      { fr: 'Je suis allergique aux noix.', ru: 'У меня аллергия на орехи.' },
      { fr: 'Je suis végétarienne.', ru: 'Я вегетарианка.' },
      { fr: 'L’addition, s’il vous plaît. Et on peut payer par carte ?', ru: 'Счёт, пожалуйста. И можно оплатить картой?' }
    ]
  },
  {
    id: 'magasin', emoji: '🛍', title: 'В магазине',
    rows: [
      { fr: 'Je peux essayer ?', ru: 'Можно примерить?' },
      { fr: 'Vous avez une taille plus grande ?', ru: 'У вас есть размер побольше?' },
      { fr: 'Je peux payer par carte ?', ru: 'Можно оплатить картой?' },
      { fr: 'C’est combien ?', ru: 'Сколько стоит?' },
      { fr: 'Je regarde, merci.', ru: 'Я посмотрю, спасибо.' },
      { fr: 'Vous avez une autre couleur ?', ru: 'У вас есть другой цвет?' },
      { fr: 'Je prends ça.', ru: 'Я беру это.' },
      { fr: 'Un cadeau, s’il vous plaît — un emballage cadeau.', ru: 'Подарок, пожалуйста — в подарочную упаковку.' }
    ]
  },
  {
    id: 'pharmacie', emoji: '💊', title: 'В аптеке',
    rows: [
      { fr: 'J’ai mal à la tête.', ru: 'У меня болит голова.' },
      { fr: 'J’ai mal à la gorge.', ru: 'У меня болит горло.' },
      { fr: 'J’ai de la fièvre.', ru: 'У меня жар.' },
      { fr: 'J’ai mal au ventre.', ru: 'У меня болит живот.' },
      { fr: 'Je voudrais quelque chose pour dormir.', ru: 'Мне нужно что-нибудь поспать.' },
      { fr: 'Vous avez un emplâtre ?', ru: 'У вас есть пластырь?' },
      { fr: 'Où est la pharmacie la plus proche ?', ru: 'Где ближайшая аптека?' }
    ]
  },
  {
    id: 'hopital', emoji: '🏥', title: 'У врача',
    rows: [
      { fr: 'J’ai mal depuis trois jours.', ru: 'У меня болит уже три дня.' },
      { fr: 'Je ne me sens pas bien.', ru: 'Я себя плохо чувствую.' },
      { fr: 'J’ai un rhumatisme.', ru: 'У меня ревматизм.' },
      { fr: 'Je prends ce médicament, deux fois par jour.', ru: 'Я принимаю это лекарство два раза в день.' },
      { fr: 'Est-ce que c’est grave ?', ru: 'Это серьёзно?' },
      { fr: 'Vous parlez anglais ?', ru: 'Вы говорите по-английски?' }
    ]
  },
  {
    id: 'perdu', emoji: '🧳', title: 'Я потерялась',
    note: 'Самые важные фразы этого раздела. Запомните их заранее.',
    rows: [
      { fr: 'Excusez-moi, je suis perdue.', ru: 'Извините, я заблудилась.' },
      { fr: 'Je cherche cette adresse.', ru: 'Я ищу этот адрес.' },
      { fr: 'C’est loin d’ici ?', ru: 'Это далеко отсюда?' },
      { fr: 'Comment s’appelle la station la plus proche ?', ru: 'Как называется ближайшая станция?' },
      { fr: 'Vous pouvez me montrer sur la carte ?', ru: 'Не могли бы вы показать на карте?' },
      { fr: 'J’ai perdu mon passeport.', ru: 'Я потеряла паспорт.' },
      { fr: 'Appelez une ambulance, s’il vous plaît.', ru: 'Вызовите скорую, пожалуйста.' }
    ]
  },
  {
    id: 'direction', emoji: '🗺', title: 'Спросить дорогу',
    rows: [
      { fr: 'Pardon, où est le musée ?', ru: 'Извините, где музей?' },
      { fr: 'C’est loin ?', ru: 'Это далеко?' },
      { fr: 'C’est à pied ou en bus ?', ru: 'Пешком или на автобусе?' },
      { fr: 'Pouvez-vous me répondre ?', ru: 'Не могли бы вы ответить (по-французски)?' },
      { fr: 'Tournez à gauche.', ru: 'Поверните налево.' },
      { fr: 'Tout droit, puis à droite.', ru: 'Прямо, потом направо.' },
      { fr: 'C’est à côté de la gare.', ru: 'Это рядом с вокзалом.' },
      { fr: 'Merci, bonne journée !', ru: 'Спасибо, хорошего дня!' }
    ]
  },
  {
    id: 'connaître', emoji: '🤝', title: 'Знакомство',
    rows: [
      { fr: 'Je m’appelle Marie.', ru: 'Меня зовут Мария.' },
      { fr: 'Enchantée !', ru: 'Приятно познакомиться (женщина).' },
      { fr: 'Vous parlez français ?', ru: 'Вы говорите по-французски?' },
      { fr: 'Un peu, pas beaucoup.', ru: 'Немного, не очень.' },
      { fr: 'Je suis de Moscou.', ru: 'Я из Москвы.' },
      { fr: 'Vous parlez bien français !', ru: 'Вы хорошо говорите по-французски!' }
    ]
  },
  {
    id: 'meteo', emoji: '🌧', title: 'О погоде',
    rows: [
      { fr: 'Il fait beau aujourd’hui.', ru: 'Сегодня хорошая погода.' },
      { fr: 'Il fait froid.', ru: 'Холодно.' },
      { fr: 'Il pleut.', ru: 'Идёт дождь.' },
      { fr: 'Il fait trop chaud.', ru: 'Слишком жарко.' },
      { fr: 'Vous avez un parapluie ?', ru: 'У вас есть зонт?' },
      { fr: 'Je pense qu’il va pleuvoir.', ru: 'Думаю, будет дождь.' }
    ]
  },
  {
    id: 'comprendre', emoji: '❓', title: 'Я не поняла',
    note: 'Самое полезное, что есть в французском: эти фразы работают всегда.',
    rows: [
      { fr: 'Pardon, je ne comprends pas.', ru: 'Извините, я не понимаю.' },
      { fr: 'Vous pouvez répéter, s’il vous plaît ?', ru: 'Не могли бы вы повторить?' },
      { fr: 'Plus lentement, s’il vous plaît.', ru: 'Медленнее, пожалуйста.' },
      { fr: 'Comment on dit… en français ?', ru: 'Как сказать «…» по-французски?' },
      { fr: 'Ça veut dire quoi ?', ru: 'Что это значит?' },
      { fr: 'Je ne sais pas.', ru: 'Я не знаю.' },
      { fr: 'Écrivez, s’il vous plaît.', ru: 'Напишите, пожалуйста.' },
      { fr: 'Un moment, je cherche dans mon téléphone.', ru: 'Подождите, я ищу в телефоне.' },
      { fr: 'Bon, on continue ?', ru: 'Хорошо, продолжим?' }
    ]
  },
  {
    id: 'invite', emoji: '🏡', title: 'В гостях',
    rows: [
      { fr: 'Merci beaucoup pour votre accueil.', ru: 'Большое спасибо за гостеприимство.' },
      { fr: 'Votre cuisine est délicieuse.', ru: 'Ваша кухня очень вкусная.' },
      { fr: 'Je peux vous aider ?', ru: 'Я могу вам помочь?' },
      { fr: 'Non, vraiment, c’est gentil.', ru: 'Нет, правда, любезно.' },
      { fr: 'Quand est-ce que je dois partir ?', ru: 'Когда мне пора уходить?' },
      { fr: 'Merci pour tout, c’était très chouette.', ru: 'Спасибо за всё, было очень хорошо.' }
    ]
  }
];
