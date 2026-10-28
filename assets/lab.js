/* Лабораторія: журнал і архів. Дописуй записи сюди, сторінка /lab/ рендерить сама.
   date: YYYY-MM-DD · tag: agents | base | assistant | site · uk/en: текст */
window.LAB = {
  updated: "2026-10-28",
  journal: [
    { date: "2026-10-28", tag: "assistant", uk: "Помічник виріс у задум офісу: веб-застосунок, де веду клієнта від диктофону на зустрічі до готової стратегії, картка клієнта з усім в одному місці, агенти на сервері. Розписав у Сигналі.", en: "The assistant grew into an office concept: a web app where I lead a client from a voice memo at the meeting to a ready strategy, a client card with everything in one place, agents on a server. Written up in Signal." },
    { date: "2026-10-25", tag: "assistant", uk: "Почав помічника для соло: перша задача, на якій він буде відточуватись, і схема пам'яті контексту.", en: "Started the solo assistant: the first task it will be honed on, and the context-memory scheme." },
    { date: "2026-10-20", tag: "base", uk: "Нове впровадження: прийшли за рекламою, виявилось, що немає системи. Погоджено відділ продажу, сайт, телефонію, CRM і дашборд керуючому.", en: "New rollout: they came for ads, turned out there was no system. Agreed: sales team, website, telephony, CRM and a manager dashboard." },
    { date: "2026-10-10", tag: "agents", uk: "Ланцюг агентів для офісних заявок пройшов тиждень у реальній роботі: ручна частина процесу скоротилась на 80%.", en: "The agent chain for office applications ran a week in real work: the manual part of the process shrank by 80%." },
    { date: "2026-09-15", tag: "agents", uk: "Перший робочий ланцюг: читач заявки → заповнювач форм → збирач PDF → перевіряючий. Виправив логіку передачі контексту між агентами.", en: "First working chain: application reader → form filler → PDF builder → checker. Fixed how context is handed between agents." },
    { date: "2026-08-01", tag: "agents", uk: "Почав вивчати багатоагентні системи: де один промт ламається і чому потрібна передача між ролями.", en: "Started studying multi-agent systems: where a single prompt breaks and why hand-off between roles is needed." }
  ],
  archive: [
    { uk: "Дільниця 10.6", en: "Dilnytsia 10.6", status: "case", href: "../cases/dilnytsia.html", uk_p: "Система обліку станції техогляду. Липень–жовтень 2026, у роботі.", en_p: "Accounting system for a vehicle inspection station. July–October 2026, in use." },
    { uk: "Турбо Термінал", en: "Turbo Terminal", status: "case", href: "../cases/turbo-terminal.html", uk_p: "Облік митного терміналу, кіоск для охоронців 60+. 9 тижнів до продакшну.", en_p: "Customs terminal accounting, a kiosk for guards aged 60+. 9 weeks to production." },
    { uk: "Smirnovich", en: "Smirnovich", status: "case", href: "../cases/smirnovich.html", uk_p: "Сайт-галерея з продажем картин. Три дні від ідеї до запуску.", en_p: "A gallery website selling paintings. Three days from idea to launch." },
    { uk: "Health Time", en: "Health Time", status: "case", href: "../cases/health-time.html", uk_p: "Бізнес-система дистриб'ютора з нуля за 12 місяців.", en_p: "A distributor's business system from zero in 12 months." },
    { uk: "ЖК «Aqua Vita»", en: "Aqua Vita residential complex", status: "paused", uk_p: "Цифровий образ і система залучення покупців для забудовника. На паузі з боку клієнта.", en_p: "Digital presence and a buyer-acquisition system for a developer. Paused on the client's side." },
    { uk: "Business Sim", en: "Business Sim", status: "paused", uk_p: "Тренажер бізнес-рішень на AI. Перша партія зіграна, далі перейшов до агентів.", en_p: "An AI decision-making trainer. Round one played, then moved on to agents." },
    { uk: "404bureau", en: "404bureau", status: "closed", uk_p: "Концепт агенції для малого бізнесу. Закрив: той самий сенс тепер живе у «Фундаменті для бізнесу».", en_p: "A small-business agency concept. Closed: the same idea now lives in “Foundation for a business”." },
    { uk: "Експертний контент", en: "Expert content", status: "closed", uk_p: "Відео про системи і AI. Відклав: спочатку системи, потім розповіді про них.", en_p: "Video about systems and AI. Postponed: systems first, stories about them later." }
  ]
};
