(() => {
  const T = {
    'PREVIEW': ['PREVIEW', 'PRIEKŠSKATĪJUMS', 'ПРЕДПРОСМОТР'],
    'Live Availability · Elizabetes 75, Rīga': ['Live Availability · Elizabetes 75, Rīga', 'Pieejamība tiešsaistē · Elizabetes 75, Rīga', 'Свободные места онлайн · Элизабетес 75, Рига'],
    'Workspace For Independent Barbers': ['Workspace For Independent Barbers', 'Darba vieta neatkarīgiem bārberiem', 'Рабочее место для независимых барберов'],
    'Built around': ['Built around', 'Radīts ap', 'Создано вокруг'],
    'the barber.': ['the barber.', 'bārberi.', 'барбера.'],
    'Keep your clients. Set your schedule. Grow your brand. Pay strictly for client time from': ['Keep your clients. Set your schedule. Grow your brand. Pay strictly for client time from', 'Saglabā savus klientus. Pats nosaki grafiku. Attīsti savu vārdu. Maksā tikai par klientam nepieciešamo laiku no', 'Сохраняй своих клиентов. Сам определяй график. Развивай своё имя. Плати только за время работы с клиентом — от'],
    '. No salon kickbacks. No fixed-lease pressure.': ['. No salon kickbacks. No fixed-lease pressure.', '. Bez komisijas salonam un bez fiksētas nomas sloga.', '. Без комиссии салону и без давления фиксированной аренды.'],
    'Reserve Chair Now': ['Reserve Chair Now', 'Rezervē darba vietu', 'Забронировать место'],
    'Book Free 15-Min Tour': ['Book Free 15-Min Tour', 'Piesaki bezmaksas 15 min. apskati', 'Записаться на бесплатный 15-мин. осмотр'],
    'Free prep & cleanup': ['Free prep & cleanup', 'Bezmaksas sagatavošana un uzkopšana', 'Бесплатная подготовка и уборка'],
    'Client revenue kept': ['Client revenue kept', 'Ieņēmumi paliek tev', 'Весь доход остаётся тебе'],
    'Rent on off-days': ['Rent on off-days', 'Noma brīvdienās', 'Аренда в выходные дни'],
    'You keep': ['You keep', 'Tev paliek', 'У тебя остаётся'],
    '0.10 €/min': ['0.10 €/min', '0,10 €/min', '0,10 €/мин'],
    '0.10 €': ['0.10 €', '0,10 €', '0,10 €'],
    'Barber Dilemmas & Fixes': ['Barber Dilemmas & Fixes', 'Bārberu dilemmas un risinājumi', 'Дилеммы барбера и решения'],
    'Where are you stuck?': ['Where are you stuck?', 'Kas tevi kavē?', 'Что тебя останавливает?'],
    'Tap your current salon reality below to reveal the direct mathematical antidote.': ['Tap your current salon reality below to reveal the direct mathematical antidote.', 'Izvēlies savu pašreizējo situāciju salonā un apskati skaidru aprēķinu.', 'Выбери свою текущую ситуацию в салоне и посмотри понятный расчёт.'],
    'Giving 40–50% commission to shop owners?': ['Giving 40–50% commission to shop owners?', 'Atdod 40–50% komisijā salona īpašniekam?', 'Отдаёшь 40–50% комиссии владельцу салона?'],
    'The Solution': ['The Solution', 'Risinājums', 'Решение'],
    '+€1,800+/mo net': ['+€1,800+/mo net', '+1800 € mēnesī', '+1800 € в месяц'],
    'of your haircut price. At €30 per client and €6/hr chair time (0.10 €/min), you take home': ['of your haircut price. At €30 per client and €6/hr chair time (0.10 €/min), you take home', 'no sava pakalpojuma cenas. Ja klients maksā 30 € un darba vieta maksā 6 €/stundā (0,10 €/min.), tev paliek', 'от стоимости своей услуги. При цене 30 € за клиента и 6 €/час за рабочее место (0,10 €/мин.) у тебя остаётся'],
    'instead of €15. Your craft, your rate, your money.': ['instead of €15. Your craft, your rate, your money.', 'nevis 15 €. Tavs darbs, tava cena, tava nauda.', 'вместо 15 €. Твоя работа, твоя цена, твои деньги.'],
    'Trapped paying €600+ monthly chair rent?': ['Trapped paying €600+ monthly chair rent?', 'Maksā vairāk nekā 600 € mēnesī par krēsla nomu?', 'Платишь более 600 € в месяц за аренду кресла?'],
    'Zero Off-Day Waste': ['Zero Off-Day Waste', '0 € par brīvdienām', '0 € за нерабочие дни'],
    'strictly for scheduled appointments. Taking Wednesday off? Going on holiday for a week? Your station bill is strictly': ['strictly for scheduled appointments. Taking Wednesday off? Going on holiday for a week? Your station bill is strictly', 'tikai par rezervēto klientu laiku. Brīva trešdiena vai nedēļa atvaļinājumā? Darba vietas maksa ir', 'только за забронированное время клиентов. Выходной в среду или неделя отпуска? Плата за место составит'],
    'Want to go independent but fear setup costs?': ['Want to go independent but fear setup costs?', 'Vēlies strādāt neatkarīgi, bet baida sākuma izmaksas?', 'Хочешь работать независимо, но пугают стартовые расходы?'],
    'Turnkey Ready': ['Turnkey Ready', 'Viss gatavs darbam', 'Всё готово к работе'],
    'Skip lease deposits, utility bills, health inspection paperwork, and fit-out debt. Just walk into a premium studio on Elizabetes 75 with clean towels, KALVE coffee, sanitizers, and high-speed Wi-Fi provided.': ['Skip lease deposits, utility bills, health inspection paperwork, and fit-out debt. Just walk into a premium studio on Elizabetes 75 with clean towels, KALVE coffee, sanitizers, and high-speed Wi-Fi provided.', 'Bez nomas depozīta, komunālajiem rēķiniem, telpu iekārtošanas parāda un liekas birokrātijas. Elizabetes ielā 75 tevi gaida profesionāla darba vide, tīri dvieļi, KALVE kafija, dezinfekcijas līdzekļi un ātrs Wi-Fi.', 'Без арендного депозита, коммунальных счетов, долгов за обустройство и лишней бюрократии. На Элизабетес 75 тебя ждут профессиональное рабочее место, чистые полотенца, кофе KALVE, средства дезинфекции и быстрый Wi-Fi.'],
    'Anxious about VID taxes & self-employed status?': ['Anxious about VID taxes & self-employed status?', 'Nezini, kā sākt ar VID un pašnodarbinātā statusu?', 'Не знаешь, как начать с VID и статусом самозанятого?'],
    'Founder Mentorship': ['Founder Mentorship', 'Dibinātāja atbalsts', 'Поддержка основателя'],
    'BARBERS HUB walks you through registered self-employment in Latvia step-by-step. Get trusted accountant contacts, payment terminal advice, and marketing tactics to transition with complete legal certainty.': ['BARBERS HUB walks you through registered self-employment in Latvia step-by-step. Get trusted accountant contacts, payment terminal advice, and marketing tactics to transition with complete legal certainty.', 'BARBERS HUB soli pa solim izskaidros pašnodarbinātā reģistrāciju Latvijā un ieteiks uzticamus grāmatvežus, maksājumu risinājumus un mārketinga paņēmienus.', 'BARBERS HUB пошагово объяснит регистрацию самозанятости в Латвии и порекомендует проверенных бухгалтеров, платёжные решения и маркетинговые инструменты.'],
    'Edgars walks you through registered self-employment in Latvia step-by-step. Get trusted accountant contacts, payment terminal advice, and marketing tactics to transition with complete legal certainty.': ['Edgars walks you through registered self-employment in Latvia step-by-step. Get trusted accountant contacts, payment terminal advice, and marketing tactics to transition with complete legal certainty.', 'Edgars soli pa solim izskaidros pašnodarbinātā reģistrāciju Latvijā un ieteiks uzticamus grāmatvežus, maksājumu risinājumus un mārketinga paņēmienus.', 'Эдгарс пошагово объяснит регистрацию самозанятости в Латвии и порекомендует проверенных бухгалтеров, платёжные решения и маркетинговые инструменты.'],
    'Income model': ['Income model', 'Ienākumu modelis', 'Модель дохода'],
    'Compare your work model': ['Compare your work model', 'Salīdzini darba modeļus', 'Сравни модели работы'],
    'Configure your service price, duration, working days and workspace plan.': ['Configure your service price, duration, working days and workspace plan.', 'Norādi pakalpojuma cenu, ilgumu, darba dienas un darba vietas plānu.', 'Укажи цену и длительность услуги, рабочие дни и тариф рабочего места.'],
    'Clients per day': ['Clients per day', 'Klienti dienā', 'Клиентов в день'],
    '2 cuts/day': ['2 cuts/day', '2 klienti/dienā', '2 клиента/день'],
    '6 cuts/day': ['6 cuts/day', '6 klienti/dienā', '6 клиентов/день'],
    '10 cuts/day': ['10 cuts/day', '10 klienti/dienā', '10 клиентов/день'],
    'Your average service price': ['Your average service price', 'Vidējā pakalpojuma cena', 'Средняя цена услуги'],
    'Service time': ['Service time', 'Pakalpojuma ilgums', 'Длительность услуги'],
    'Work days': ['Work days', 'Darba dienas', 'Рабочие дни'],
    'Workspace plan': ['Workspace plan', 'Darba vietas plāns', 'Тариф рабочего места'],
    'Pay only for reserved working minutes. Daily workspace fee is capped at 60 €.': ['Pay only for reserved working minutes. Daily workspace fee is capped at 60 €.', 'Maksā tikai par rezervētajām darba minūtēm. Maksimālā maksa ir 60 € dienā.', 'Плати только за забронированные рабочие минуты. Максимальная плата — 60 € в день.'],
    '10 working days within a 30-day period. Fixed workspace fee: 299 €. Extra clients outside FLEX days can be booked from 60 minutes at €0.10 per minute.': ['10 working days within a 30-day period. Fixed workspace fee: 299 €. Extra clients outside FLEX days can be booked from 60 minutes at €0.10 per minute.', '10 darba dienas 30 dienu periodā. Fiksēta maksa: 299 €. Papildu klientus ārpus FLEX dienām vari rezervēt no 60 minūtēm par €0,10 minūtē.', '10 рабочих дней в течение 30 дней. Фиксированная стоимость: 299 €. Дополнительных клиентов вне дней FLEX можно принимать, бронируя от 60 минут по цене 0,10 € за минуту.'],
    '15 working days within a 30-day period. Fixed workspace fee: 399 €. Extra clients outside FLEX days can be booked from 60 minutes at €0.10 per minute.': ['15 working days within a 30-day period. Fixed workspace fee: 399 €. Extra clients outside FLEX days can be booked from 60 minutes at €0.10 per minute.', '15 darba dienas 30 dienu periodā. Fiksēta maksa: 399 €. Papildu klientus ārpus FLEX dienām vari rezervēt no 60 minūtēm par €0,10 minūtē.', '15 рабочих дней в течение 30 дней. Фиксированная стоимость: 399 €. Дополнительных клиентов вне дней FLEX можно принимать, бронируя от 60 минут по цене 0,10 € за минуту.'],
    '20 working days within a 30-day period. Fixed workspace fee: 499 €. Extra clients outside FLEX days can be booked from 60 minutes at €0.10 per minute.': ['20 working days within a 30-day period. Fixed workspace fee: 499 €. Extra clients outside FLEX days can be booked from 60 minutes at €0.10 per minute.', '20 darba dienas 30 dienu periodā. Fiksēta maksa: 499 €. Papildu klientus ārpus FLEX dienām vari rezervēt no 60 minūtēm par €0,10 minūtē.', '20 рабочих дней в течение 30 дней. Фиксированная стоимость: 499 €. Дополнительных клиентов вне дней FLEX можно принимать, бронируя от 60 минут по цене 0,10 € за минуту.'],
    'Monthly comparison after workspace fee only': ['Monthly comparison after workspace fee only', 'Mēneša salīdzinājums pēc darba vietas maksas', 'Сравнение за месяц после оплаты рабочего места'],
    '50% split example': ['50% split example', '50% komisijas piemērs', 'Пример комиссии 50%'],
    'Illustrative comparison assumption': ['Illustrative comparison assumption', 'Ilustratīvs pieņēmums', 'Иллюстративный расчёт'],
    'BARBERS HUB Station': ['BARBERS HUB Station', 'BARBERS HUB darba vieta', 'Рабочее место BARBERS HUB'],
    'Minute plan workspace fee': ['Minute plan workspace fee', 'Minūšu plāna maksa', 'Стоимость поминутного тарифа'],
    'FLEX 10 workspace fee': ['FLEX 10 workspace fee', 'FLEX 10 maksa', 'Стоимость FLEX 10'],
    'FLEX 15 workspace fee': ['FLEX 15 workspace fee', 'FLEX 15 maksa', 'Стоимость FLEX 15'],
    'FLEX 20 workspace fee': ['FLEX 20 workspace fee', 'FLEX 20 maksa', 'Стоимость FLEX 20'],
    'Difference vs 50% split:': ['Difference vs 50% split:', 'Starpība pret 50% komisiju:', 'Разница с комиссией 50%:'],
    'Turnover': ['Turnover', 'Apgrozījums', 'Оборот'],
    'Workspace fee': ['Workspace fee', 'Darba vietas maksa', 'Плата за рабочее место'],
    'Illustrative comparison only. Taxes, card fees, tools, products, cancellations and other business costs are not deducted.': ['Illustrative comparison only. Taxes, card fees, tools, products, cancellations and other business costs are not deducted.', 'Aprēķins ir ilustratīvs. Nodokļi, karšu komisijas, instrumenti, produkti, atceltās vizītes un citas uzņēmējdarbības izmaksas nav atskaitītas.', 'Расчёт является примером. Налоги, комиссии карт, инструменты, продукты, отмены и другие расходы бизнеса не вычтены.'],
    'View Reservation Options': ['View Reservation Options', 'Apskati rezervācijas iespējas', 'Посмотреть варианты бронирования'],
    'Freedom Pathway': ['Freedom Pathway', 'Ceļš uz neatkarību', 'Путь к независимости'],
    'Five steps to your direction': ['Five steps to your direction', 'Pieci soļi tavā virzienā', 'Пять шагов в твоём направлении'],
    'A frictionless journey from employed cutter to self-reliant salon master.': ['A frictionless journey from employed cutter to self-reliant salon master.', 'Vienkāršs ceļš no algota meistara līdz patstāvīgam profesionālim.', 'Простой путь от наёмного мастера к самостоятельному профессионалу.'],
    'Step 01 · 60 min min': ['Step 01 · 60 min min', '1. solis · no 60 min.', 'Шаг 01 · от 60 мин.'],
    'Pick your start date': ['Pick your start date', 'Izvēlies sākuma datumu', 'Выбери дату начала'],
    'Book your chair spot on the live availability grid. Real-time slot reservation up to 20 days ahead.': ['Book your chair spot on the live availability grid. Real-time slot reservation up to 20 days ahead.', 'Rezervē darba vietu pieejamības kalendārā līdz 20 dienām uz priekšu.', 'Забронируй рабочее место в календаре доступности до 20 дней вперёд.'],
    'Step 02 · Plug & Play': ['Step 02 · Plug & Play', '2. solis · viss gatavs', 'Шаг 02 · всё готово'],
    'Bring tools & clients': ['Bring tools & clients', 'Paņem instrumentus un klientus', 'Возьми инструменты и клиентов'],
    'Walk straight to a spotless station. Sanitizers, hot towels, mirrors, lighting, and guest waiting lounge already prepped.': ['Walk straight to a spotless station. Sanitizers, hot towels, mirrors, lighting, and guest waiting lounge already prepped.', 'Tevi gaida tīra darba vieta, dezinfekcijas līdzekļi, dvieļi, spoguļi, apgaismojums un klientu uzgaidāmā zona.', 'Тебя ждут чистое рабочее место, средства дезинфекции, полотенца, зеркала, освещение и зона ожидания.'],
    'Step 03 · Autonomy': ['Step 03 · Autonomy', '3. solis · patstāvība', 'Шаг 03 · самостоятельность'],
    'Cut 100% independently': ['Cut 100% independently', 'Strādā 100% patstāvīgi', 'Работай на 100% самостоятельно'],
    'You choose your techniques, determine price points, take payment straight to your bank account, and nurture your client circle.': ['You choose your techniques, determine price points, take payment straight to your bank account, and nurture your client circle.', 'Tu izvēlies darba metodes, nosaki cenas, saņem maksājumus savā kontā un veido savu klientu loku.', 'Ты выбираешь методы работы, устанавливаешь цены, получаешь оплату на свой счёт и развиваешь свою клиентскую базу.'],
    'Step 04 · Acceleration': ['Step 04 · Acceleration', '4. solis · izaugsme', 'Шаг 04 · рост'],
    'Add on-demand support': ['Add on-demand support', 'Pievieno vajadzīgo atbalstu', 'Добавь нужную поддержку'],
    'Opt in for tax accounting, marketing masterclasses, client booking funnels, and studio portrait photography whenever you feel ready.': ['Opt in for tax accounting, marketing masterclasses, client booking funnels, and studio portrait photography whenever you feel ready.', 'Kad esi gatavs, izvēlies grāmatvedības, mārketinga, klientu piesaistes vai foto atbalstu.', 'Когда будешь готов, выбери поддержку в бухгалтерии, маркетинге, привлечении клиентов или фотографии.'],
    'Step 05 · The Goal': ['Step 05 · The Goal', '5. solis · mērķis', 'Шаг 05 · цель'],
    'From 60 min': ['From 60 min', 'No 60 min.', 'От 60 мин.'],
    'Plug & Play': ['Plug & Play', 'Viss gatavs', 'Всё готово'],
    'Autonomy': ['Autonomy', 'Patstāvība', 'Самостоятельность'],
    'Acceleration': ['Acceleration', 'Izaugsme', 'Рост'],
    'The Goal': ['The Goal', 'Mērķis', 'Цель'],
    'Build your legacy': ['Build your legacy', 'Veido savu vārdu', 'Создавай своё имя'],
    'Stay long-term in the collective or use BARBERS HUB as your low-risk springboard to open your standalone shop.': ['Stay long-term in the collective or use BARBERS HUB as your low-risk springboard to open your standalone shop.', 'Paliec kopienā ilgtermiņā vai izmanto BARBERS HUB kā drošu sākuma platformu ceļā uz savu salonu.', 'Оставайся в сообществе надолго или используй BARBERS HUB как безопасную стартовую площадку к собственному салону.'],
    'The Ecosystem': ['The Ecosystem', 'Ekosistēma', 'Экосистема'],
    'Everything around your chair': ['Everything around your chair', 'Viss ap tavu darba vietu', 'Всё вокруг твоего рабочего места'],
    'Zero hidden operational friction. Toggle between guaranteed workspace gear and growth add-ons.': ['Zero hidden operational friction. Toggle between guaranteed workspace gear and growth add-ons.', 'Apskati, kas iekļauts darba vietā un kādu papildu atbalstu vari izvēlēties izaugsmei.', 'Посмотри, что входит в рабочее место и какую дополнительную поддержку можно выбрать для роста.'],
    'With Workspace': ['With Workspace', 'Iekļauts darba vietā', 'Включено в рабочее место'],
    'Optional Support': ['Optional Support', 'Papildu atbalsts', 'Дополнительная поддержка'],
    'Ergonomic Barber Station': ['Ergonomic Barber Station', 'Ergonomiska bārbera darba vieta', 'Эргономичное место барбера'],
    'Heavy-duty hydraulic chair, oversized clear mirrors, power pods, tool rails, and focused color-correct daylight lighting.': ['Heavy-duty hydraulic chair, oversized clear mirrors, power pods, tool rails, and focused color-correct daylight lighting.', 'Profesionāls hidrauliskais krēsls, lieli spoguļi, elektrības pieslēgumi, instrumentu novietnes un kvalitatīvs darba apgaismojums.', 'Профессиональное гидравлическое кресло, большие зеркала, розетки, полки для инструментов и качественное рабочее освещение.'],
    'Towels, Laundry & Sanitation': ['Towels, Laundry & Sanitation', 'Dvieļi, mazgāšana un higiēna', 'Полотенца, стирка и гигиена'],
    'Unlimited fresh warm salon towels, neck strips, clean paper rolls, and medical-grade tool disinfectant.': ['Unlimited fresh warm salon towels, neck strips, clean paper rolls, and medical-grade tool disinfectant.', 'Tīri salona dvieļi, kakla lentes, papīra materiāli un profesionāli instrumentu dezinfekcijas līdzekļi.', 'Чистые салонные полотенца, воротнички, бумажные материалы и профессиональные средства дезинфекции инструментов.'],
    'KALVE Specialty Coffee': ['KALVE Specialty Coffee', 'KALVE īpašā kafija', 'Спешелти-кофе KALVE'],
    'Freshly roasted specialty coffee, filtered chilled water, and relaxed client reception lounge area.': ['Freshly roasted specialty coffee, filtered chilled water, and relaxed client reception lounge area.', 'Svaigi grauzdēta kafija, filtrēts ūdens un ērta klientu uzgaidāmā zona.', 'Свежеобжаренный кофе, фильтрованная вода и удобная зона ожидания для клиентов.'],
    '30 Free Buffer Minutes': ['30 Free Buffer Minutes', '30 bezmaksas sagatavošanās minūtes', '30 бесплатных минут на подготовку'],
    '15 minutes pre-session setup + 15 minutes post-cut teardown automatically added free of charge on every slot.': ['15 minutes pre-session setup + 15 minutes post-cut teardown automatically added free of charge on every slot.', 'Katrai rezervācijai bez maksas pievienotas 15 minūtes sagatavošanai un 15 minūtes uzkopšanai.', 'К каждому бронированию бесплатно добавляются 15 минут на подготовку и 15 минут на уборку.'],
    'VID & Tax Compliance Mentorship': ['VID & Tax Compliance Mentorship', 'VID un nodokļu konsultācijas', 'Консультации по VID и налогам'],
    'Direct guidance on Latvian micro-business vs self-employed tax regimes, invoicing, and POS terminal registration.': ['Direct guidance on Latvian micro-business vs self-employed tax regimes, invoicing, and POS terminal registration.', 'Praktisks skaidrojums par nodokļu režīmiem, rēķiniem un maksājumu termināļa reģistrāciju Latvijā.', 'Практическое объяснение налоговых режимов, счетов и регистрации платёжного терминала в Латвии.'],
    'Content & Barber Portfolio Studio': ['Content & Barber Portfolio Studio', 'Satura un portfolio studija', 'Студия контента и портфолио'],
    'Access to studio lighting and backdrop corner to photograph your fades and beard craft for Instagram.': ['Access to studio lighting and backdrop corner to photograph your fades and beard craft for Instagram.', 'Pieejams studijas apgaismojums un fons darbu fotografēšanai un publicēšanai sociālajos tīklos.', 'Доступны студийный свет и фон для съёмки работ и публикации в социальных сетях.'],
    'Client Growth & Rebooking Playbook': ['Client Growth & Rebooking Playbook', 'Klientu piesaistes un atkārtoto vizīšu sistēma', 'Система привлечения и повторной записи клиентов'],
    'Proven scripts, automated booking setups, and Instagram ad templates designed specifically for barbers in Riga.': ['Proven scripts, automated booking setups, and Instagram ad templates designed specifically for barbers in Riga.', 'Praktiski sarunu paraugi, rezervāciju risinājumi un Instagram reklāmu veidnes bārberiem Rīgā.', 'Практические сценарии общения, решения для бронирования и шаблоны рекламы Instagram для барберов в Риге.'],
    'Uncompromising Transparency': ['Uncompromising Transparency', 'Pilnīga caurspīdība', 'Полная прозрачность'],
    'Honest pricing. Zero lock-in.': ['Honest pricing. Zero lock-in.', 'Skaidra cena. Bez saistībām.', 'Понятная цена. Без обязательств.'],
    'Choose pay-as-you-go minute billing or discounted multi-day bundles.': ['Choose pay-as-you-go minute billing or discounted multi-day bundles.', 'Izvēlies minūšu apmaksu vai izdevīgāku vairāku dienu FLEX plānu.', 'Выбери поминутную оплату или выгодный многодневный тариф FLEX.'],
    'Most Flexible': ['Most Flexible', 'Elastīgākais', 'Самый гибкий'],
    'Pay-By-The-Minute': ['Pay-By-The-Minute', 'Maksa par minūti', 'Оплата за минуту'],
    'per reserved min': ['per reserved min', 'par rezervēto minūti', 'за забронированную минуту'],
    'Minimum Time': ['Minimum Time', 'Minimālais laiks', 'Минимальное время'],
    'Day Cap Limit': ['Day Cap Limit', 'Maksimums dienā', 'Максимум в день'],
    '60 € / day': ['60 € / day', '60 € / dienā', '60 € / день'],
    'Includes +30 min buffer (15m before, 15m after)': ['Includes +30 min buffer (15m before, 15m after)', 'Iekļautas +30 min. (15 min. pirms un 15 min. pēc)', 'Включено +30 мин. (15 мин. до и 15 мин. после)'],
    'Book live up to 20 days in advance': ['Book live up to 20 days in advance', 'Rezervē tiešsaistē līdz 20 dienām uz priekšu', 'Бронируй онлайн до 20 дней вперёд'],
    'Instant card checkout, no monthly commitments': ['Instant card checkout, no monthly commitments', 'Droša kartes apmaksa bez mēneša saistībām', 'Безопасная оплата картой без месячных обязательств'],
    'Reserve Hourly Chair': ['Reserve Hourly Chair', 'Rezervē darba vietu', 'Забронировать рабочее место'],
    'FLEX Passes (Use within 30 days)': ['FLEX Passes (Use within 30 days)', 'FLEX abonementi (izmanto 30 dienās)', 'Абонементы FLEX (использовать за 30 дней)'],
    'FLEX 10 Days': ['FLEX 10 Days', 'FLEX · 10 dienas', 'FLEX · 10 дней'],
    'Ideal for combining with other part-time work.': ['Ideal for combining with other part-time work.', 'Piemērots apvienošanai ar citu darbu.', 'Подходит для совмещения с другой работой.'],
    'FLEX 15 Days': ['FLEX 15 Days', 'FLEX · 15 dienas', 'FLEX · 15 дней'],
    'Regular independent barber base.': ['Regular independent barber base.', 'Regulāram neatkarīga bārbera grafikam.', 'Для регулярного графика независимого барбера.'],
    'FLEX 20 Days': ['FLEX 20 Days', 'FLEX · 20 dienas', 'FLEX · 20 дней'],
    '29.90 €/day': ['29.90 €/day', '29,90 €/dienā', '29,90 €/день'],
    '26.60 €/day': ['26.60 €/day', '26,60 €/dienā', '26,60 €/день'],
    '24.95 €/day': ['24.95 €/day', '24,95 €/dienā', '24,95 €/день'],
    'Need to take an extra client outside your FLEX days? Reserve an available workstation from 60 minutes and pay only €0.10 per minute.': ['Need to take an extra client outside your FLEX days? Reserve an available workstation from 60 minutes and pay only €0.10 per minute.', 'Vajag pieņemt papildu klientu ārpus FLEX dienām? Rezervē brīvo darba vietu no 60 minūtēm un maksā tikai €0,10 par minūti.', 'Нужно принять дополнительного клиента вне дней FLEX? Забронируйте свободное рабочее место от 60 минут и платите только 0,10 € за минуту.'],
    'Full-time intensive calendar operation.': ['Full-time intensive calendar operation.', 'Intensīvam pilna laika darba grafikam.', 'Для интенсивного полного рабочего графика.'],
    'Curious about a single trial day?': ['Curious about a single trial day?', 'Vēlies izmēģināt vienu dienu?', 'Хочешь попробовать один день?'],
    'Text “TEST”': ['Text “TEST”', 'Raksti “TESTS”', 'Напиши «ТЕСТ»'],
    'Why Barbers Hub Exists': ['Why Barbers Hub Exists', 'Kāpēc pastāv BARBERS HUB', 'Зачем существует BARBERS HUB'],
    'A workspace for building': ['A workspace for building', 'Darba vieta, kur veidot', 'Рабочее место, где можно создать'],
    'something of your own': ['something of your own', 'kaut ko savu', 'что-то своё'],
    'Edgars · Founder': ['Edgars · Founder', 'Edgars · dibinātājs', 'Эдгарс · основатель'],
    '“I started my professional barbering journey in 2013. Since then, I have worked for someone else, rented a chair, built my own business, survived the COVID pandemic and experienced both the highs and lows of this industry.”': ['“I started my professional barbering journey in 2013. Since then, I have worked for someone else, rented a chair, built my own business, survived the COVID pandemic and experienced both the highs and lows of this industry.”', '“Savu profesionālo bārbera ceļu sāku 2013. gadā. Kopš tā laika esmu strādājis pie cita, īrējis krēslu, veidojis savu biznesu, pārdzīvojis Covid-19 pandēmiju un pieredzējis gan nozares kāpumus, gan kritumus.”', '«Свой профессиональный путь барбера я начал в 2013 году. С тех пор я работал у других, арендовал кресло, строил собственный бизнес, пережил пандемию Covid-19 и видел как взлёты, так и падения этой отрасли».'],
    'The Core Belief': ['The Core Belief', 'Pamatpārliecība', 'Главное убеждение'],
    '“BARBERS HUB is the place I wish I had throughout that journey: a workspace where experienced barbers can build something of their own with the support and community to help them succeed. Because becoming independent should not mean doing it alone.”': ['“BARBERS HUB is the place I wish I had throughout that journey: a workspace where experienced barbers can build something of their own with the support and community to help them succeed. Because becoming independent should not mean doing it alone.”', '“BARBERS HUB ir vieta, kuru es būtu vēlējies savā ceļā — darba vide, kur pieredzējuši bārberi var veidot kaut ko savu ar atbalstu un kopienu. Kļūt neatkarīgam nedrīkst nozīmēt darīt visu vienam.”', '«BARBERS HUB — это место, которого мне не хватало на моём пути: среда, где опытные барберы могут создавать своё дело с поддержкой и сообществом. Независимость не должна означать, что всё нужно делать одному».'],
    'Barber since 2013 · Elizabetes 75, Rīga': ['Barber since 2013 · Elizabetes 75, Rīga', 'Bārberis kopš 2013. gada · Elizabetes 75, Rīga', 'Барбер с 2013 года · Элизабетес 75, Рига'],
    'A Launchpad, Not A Trap': ['A Launchpad, Not A Trap', 'Starta platforma, nevis slazds', 'Стартовая площадка, а не ловушка'],
    'One of our first barbers has already gone on to build his own brand and open his own shop. We count that as our true metric of success.': ['One of our first barbers has already gone on to build his own brand and open his own shop. We count that as our true metric of success.', 'Viens no mūsu pirmajiem bārberiem jau ir izveidojis savu zīmolu un atvēris savu salonu. Tieši tā mēs vērtējam panākumus.', 'Один из наших первых барберов уже создал собственный бренд и открыл свой салон. Именно так мы измеряем успех.'],
    'Chat directly with Edgars on WhatsApp': ['Chat directly with Edgars on WhatsApp', 'Raksti Edgaram WhatsApp', 'Написать Эдгарсу в WhatsApp'],
    'Honest Answers': ['Honest Answers', 'Godīgas atbildes', 'Честные ответы'],
    'Everything you wonder before booking': ['Everything you wonder before booking', 'Viss, ko vēlies zināt pirms rezervācijas', 'Всё, что хочется знать до бронирования'],
    'Direct, straight-shooting answers with zero sugarcoating.': ['Direct, straight-shooting answers with zero sugarcoating.', 'Tiešas un skaidras atbildes bez izskaistināšanas.', 'Прямые и понятные ответы без прикрас.'],
    'Do I need a full client list right away?': ['Do I need a full client list right away?', 'Vai uzreiz vajadzīgs pilns klientu saraksts?', 'Нужна ли сразу полная база клиентов?'],
    'No. The 0.10 €/min model was purposefully built so you only reserve time when your actual bookings exist. If you only have 3 clients on Saturday, book 3 hours. As your clientele expands, scale your days up seamlessly.': ['No. The 0.10 €/min model was purposefully built so you only reserve time when your actual bookings exist. If you only have 3 clients on Saturday, book 3 hours. As your clientele expands, scale your days up seamlessly.', 'Nē. 0,10 €/min. modelis ļauj rezervēt laiku tikai tad, kad ir reāli klientu pieraksti. Ja sestdien ir trīs klienti, rezervē trīs stundas. Klientu lokam augot, vienkārši palielini darba dienu skaitu.', 'Нет. Модель 0,10 €/мин. позволяет бронировать время только при реальных записях. Если в субботу три клиента — забронируй три часа. По мере роста клиентской базы просто увеличивай количество рабочих дней.'],
    'Does BARBERS HUB provide walk-ins?': ['Does BARBERS HUB provide walk-ins?', 'Vai BARBERS HUB nodrošina klientus bez pieraksta?', 'Предоставляет ли BARBERS HUB клиентов без записи?'],
    'We do not promise guaranteed walk-in traffic. When an organic street walk-in comes in at Elizabetes 75, it simply goes to whichever active barber has their chair free and wants the cut. We provide marketing guidance to help you win your own clientele.': ['We do not promise guaranteed walk-in traffic. When an organic street walk-in comes in at Elizabetes 75, it simply goes to whichever active barber has their chair free and wants the cut. We provide marketing guidance to help you win your own clientele.', 'Mēs nesolām garantētu klientu plūsmu bez pieraksta. Ja Elizabetes ielā 75 ienāk klients, viņš var doties pie brīvā bārbera, kurš vēlas viņu apkalpot. Mēs piedāvājam mārketinga atbalstu sava klientu loka veidošanai.', 'Мы не обещаем гарантированный поток клиентов без записи. Если на Элизабетес 75 приходит клиент, он может обратиться к свободному барберу, готовому его принять. Мы предлагаем маркетинговую поддержку для развития собственной клиентской базы.'],
    'What legal status do I need to begin?': ['What legal status do I need to begin?', 'Kāds juridiskais statuss vajadzīgs, lai sāktu?', 'Какой юридический статус нужен для начала?'],
    'You need a legally registered self-employed status (Pašnodarbinātais) or an SIA company in Latvia. If you are unsure which VID registration code is best, book a free studio tour and we will explain the options clearly.': ['You need a legally registered self-employed status (Pašnodarbinātais) or an SIA company in Latvia. If you are unsure which VID registration code is best, book a free studio tour and we will explain the options clearly.', 'Nepieciešams Latvijā reģistrēts pašnodarbinātā statuss vai SIA. Ja nezini, kurš VID reģistrācijas veids ir piemērotāks, piesaki bezmaksas apskati, un mēs izskaidrosim iespējas.', 'Нужен зарегистрированный в Латвии статус самозанятого или SIA. Если не знаешь, какой вид регистрации VID подходит, запишись на бесплатный осмотр — мы объясним варианты.'],
    'What tools and products must I bring?': ['What tools and products must I bring?', 'Kādi instrumenti un produkti jāņem līdzi?', 'Какие инструменты и продукты нужно принести?'],
    'Bring your clippers, shears, trimmers, razors, and preferred styling pomades. We provide the heavy-duty hydraulic workstation, fresh warm towels, laundry, neck strips, Barbicide, neck dusters, and paper consumables.': ['Bring your clippers, shears, trimmers, razors, and preferred styling pomades. We provide the heavy-duty hydraulic workstation, fresh warm towels, laundry, neck strips, Barbicide, neck dusters, and paper consumables.', 'Ņem līdzi mašīnītes, šķēres, trimmerus, skuvekļus un iecienītos veidošanas produktus. Mēs nodrošinām profesionālu darba vietu, tīrus dvieļus, mazgāšanu, kakla lentes, Barbicide, kakla birstes un papīra materiālus.', 'Принеси машинки, ножницы, триммеры, бритвы и любимые средства для укладки. Мы предоставляем профессиональное рабочее место, чистые полотенца, стирку, воротнички, Barbicide, щётки и бумажные материалы.'],
    'Who is BARBERS HUB NOT suitable for?': ['Who is BARBERS HUB NOT suitable for?', 'Kam BARBERS HUB nav piemērots?', 'Кому BARBERS HUB не подходит?'],
    'Barbers looking for an employer to manage their daily agenda, discipline their schedule, or hand them passive appointments. Here you are the boss: you control your pricing, respect your station, and drive your own trajectory.': ['Barbers looking for an employer to manage their daily agenda, discipline their schedule, or hand them passive appointments. Here you are the boss: you control your pricing, respect your station, and drive your own trajectory.', 'Bārberiem, kuri meklē darba devēju, kas vadīs viņu grafiku un nodrošinās pierakstus. Šeit tu esi savas darbības vadītājs — pats nosaki cenas, rūpējies par darba vietu un virzi savu attīstību.', 'Барберам, которые ищут работодателя, управляющего графиком и обеспечивающего записи. Здесь ты сам руководишь своей работой: устанавливаешь цены, заботишься о рабочем месте и определяешь направление развития.'],
    '“Becoming independent shouldn’t mean doing it alone.”': ['“Becoming independent shouldn’t mean doing it alone.”', '“Kļūt neatkarīgam nedrīkst nozīmēt darīt visu vienam.”', '«Независимость не должна означать, что всё нужно делать одному».'],
    'Edgars · Founder, BARBERS HUB': ['Edgars · Founder, BARBERS HUB', 'Edgars · BARBERS HUB dibinātājs', 'Эдгарс · основатель BARBERS HUB'],
    'Still on the fence? Drop me a quick audio note or message on WhatsApp. No sales pressure, just barbers talking shop and real numbers.': ['Still on the fence? Drop me a quick audio note or message on WhatsApp. No sales pressure, just barbers talking shop and real numbers.', 'Vēl šaubies? Atsūti mums īsu ziņu vai balss ierakstu WhatsApp. Bez pārdošanas spiediena — tikai godīga saruna par darbu un skaitļiem.', 'Всё ещё сомневаешься? Отправь нам короткое сообщение или голосовую запись в WhatsApp. Без давления продаж — только честный разговор о работе и цифрах.'],
    'Chat with us on WhatsApp': ['Chat with us on WhatsApp', 'Raksti mums WhatsApp', 'Написать нам в WhatsApp'],
    'Find the exact building, entrance and the paid underground parking in the neighbouring building before your visit.': ['Find the exact building, entrance and the paid underground parking in the neighbouring building before your visit.', 'Pirms vizītes apskati precīzu ēkas atrašanās vietu, ieeju un maksas pazemes stāvvietu blakus ēkā.', 'Перед визитом посмотри точное расположение здания, вход и платную подземную парковку в соседнем здании.'],
    'BARBERS HUB · ELIZABETES 75': ['BARBERS HUB · ELIZABETES 75', 'BARBERS HUB · ELIZABETES 75', 'BARBERS HUB · ЭЛИЗАБЕТЕС 75'],
    'OPEN MAP': ['OPEN MAP', 'ATVĒRT KARTI', 'ОТКРЫТЬ КАРТУ'],
    'IEEJA': ['ENTRANCE', 'IEEJA', 'ВХОД'],
    'PAZEMES PARKINGS': ['UNDERGROUND PARKING', 'PAZEMES PARKINGS', 'ПОДЗЕМНАЯ ПАРКОВКА'],
    'ELIZABETES 73': ['ELIZABETES 73', 'ELIZABETES 73', 'ЭЛИЗАБЕТЕС 73'],
    'BARBERS HUB ieeja': ['BARBERS HUB entrance', 'BARBERS HUB ieeja', 'Вход в BARBERS HUB'],
    'Dodies caur centrālo arku Elizabetes ielā 75.': ['Enter through the central arch at Elizabetes iela 75.', 'Dodies caur centrālo arku Elizabetes ielā 75.', 'Вход через центральную арку по адресу Элизабетес 75.'],
    'Pazemes stāvvieta': ['Underground parking', 'Pazemes stāvvieta', 'Подземная парковка'],
    'Blakus ēkā — Radisson Blu Elizabete, Elizabetes ielā 73.': ['In the neighbouring building — Radisson Blu Elizabete, Elizabetes iela 73.', 'Blakus ēkā — Radisson Blu Elizabete, Elizabetes ielā 73.', 'В соседнем здании — Radisson Blu Elizabete, Элизабетес 73.'],
    'Stāvvieta ir atsevišķs maksas pakalpojums. Pieejamību un cenu nosaka stāvvietas operators.': ['Parking is a separate paid service. Availability and pricing are set by the parking operator.', 'Stāvvieta ir atsevišķs maksas pakalpojums. Pieejamību un cenu nosaka stāvvietas operators.', 'Парковка является отдельной платной услугой. Наличие мест и стоимость определяет оператор парковки.'],
    'Zero Risk First Step': ['Zero Risk First Step', 'Pirmais solis bez riska', 'Первый шаг без риска'],
    'Take command of your chair': ['Take command of your chair', 'Pārņem kontroli pār savu darba vietu', 'Возьми своё рабочее место под контроль'],
    'Reserve as little as 60 minutes. Experience complete freedom, retain your margin, and see why barbers never go back to salon splits.': ['Reserve as little as 60 minutes. Experience complete freedom, retain your margin, and see why barbers never go back to salon splits.', 'Rezervē jau no 60 minūtēm, saglabā savus ieņēmumus un izmēģini neatkarīgu darbu bez salona komisijas.', 'Бронируй от 60 минут, сохраняй свой доход и попробуй независимую работу без комиссии салону.'],
    'Check Live Station Calendar': ['Check Live Station Calendar', 'Apskati darba vietu kalendāru', 'Посмотреть календарь мест'],
    'Immediate confirmation · Secure checkout': ['Immediate confirmation · Secure checkout', 'Tūlītējs apstiprinājums · droša apmaksa', 'Мгновенное подтверждение · безопасная оплата'],
    'LIVE DESK': ['LIVE DESK', 'DARBA VIETA', 'РАБОЧЕЕ МЕСТО'],
    'Reserve Chair': ['Reserve Chair', 'Rezervēt vietu', 'Забронировать место'],
    'Dizaina uzmetums · nav publicēts': ['Design draft · not published', 'Dizaina uzmetums · nav publicēts', 'Макет дизайна · не опубликовано'],
    'Šī ir tikai priekšskatījuma poga. Nekas netika nosūtīts.': ['This is a preview button only. Nothing was submitted.', 'Šī ir tikai priekšskatījuma poga. Nekas netika nosūtīts.', 'Это только кнопка предпросмотра. Ничего не отправлено.']
  };

  const langIndex = { en: 0, lv: 1, ru: 2 };
  const originalText = new WeakMap();
  let currentLang = 'en';

  const isTranslatableNode = (node) => {
    const parent = node.parentElement;
    if (!parent || !node.nodeValue.trim()) return false;
    if (parent.closest('script, style, .material-symbols-outlined')) return false;
    if (node.nodeValue.trim().startsWith('https://')) return false;
    return true;
  };

  function translateNode(node) {
    if (!isTranslatableNode(node)) return;
    const currentKey = node.nodeValue.trim();
    if (T[currentKey]) originalText.set(node, node.nodeValue);
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const key = source.trim();
    const translated = T[key]?.[langIndex[currentLang]];
    if (!translated) return;
    node.nodeValue = source.replace(key, translated);
  }

  function translateTree() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateNode(node);
  }

  function localizeDynamicValues() {
    const cuts = document.getElementById('calc-cuts-slider');
    const cutsDisplay = document.getElementById('calc-cuts-display');
    if (cuts && cutsDisplay) {
      const n = Number(cuts.value);
      cutsDisplay.textContent = currentLang === 'lv' ? `${n} klienti` : currentLang === 'ru' ? `${n} клиентов` : `${n} ${n === 1 ? 'cut' : 'cuts'}`;
    }
    const extra = document.getElementById('calc-extra-val');
    if (extra) {
      extra.textContent = extra.textContent.replace(/\s\/\s(?:mo|mēn\.|мес\.)$/, currentLang === 'lv' ? ' / mēn.' : currentLang === 'ru' ? ' / мес.' : ' / mo');
    }
  }

  function updateLinks() {
    document.querySelectorAll('a[href*="reserve.barbershub.lv"]').forEach((link) => {
      const url = new URL(link.href);
      url.searchParams.set('lang', currentLang);
      link.href = url.toString();
    });
  }

  function updateLanguageControls() {
    document.querySelectorAll('button[data-preview-lang]').forEach((button) => {
      const active = button.dataset.previewLang === currentLang;
      button.classList.toggle('text-text-crisp', active);
      button.classList.toggle('font-bold', active);
      button.classList.toggle('text-text-muted', !active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function applyLocale(lang, updateUrl = true) {
    currentLang = langIndex[lang] === undefined ? 'en' : lang;
    document.documentElement.lang = currentLang;
    document.title = currentLang === 'lv' ? 'BARBERS HUB · Darba vieta bārberiem' : currentLang === 'ru' ? 'BARBERS HUB · Рабочее место для барберов' : 'BARBERS HUB · Workspace for barbers';
    translateTree();
    localizeDynamicValues();
    updateLinks();
    updateLanguageControls();
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', currentLang);
      history.replaceState({}, '', url);
    }
  }

  const languageButtons = [...document.querySelectorAll('header button')].filter((button) => ['EN', 'LV', 'RU'].includes(button.textContent.trim()));
  languageButtons.forEach((button) => {
    const lang = button.textContent.trim().toLowerCase();
    button.dataset.previewLang = lang;
    button.addEventListener('click', () => applyLocale(lang));
  });

  const refreshAfterCalculator = () => setTimeout(() => applyLocale(currentLang, false), 0);
  document.querySelectorAll('#calc-cuts-slider, #calc-service-price, #calc-service-minutes, #calc-work-days').forEach((input) => input.addEventListener('input', refreshAfterCalculator));
  document.querySelectorAll('.calc-plan-btn').forEach((button) => button.addEventListener('click', refreshAfterCalculator));

  const headerWhatsApp = document.querySelector('header a[href^="https://wa.me/"]');
  if (headerWhatsApp) {
    headerWhatsApp.href = 'https://wa.me/37125774433';
    headerWhatsApp.setAttribute('aria-label', 'WhatsApp');
    const oldIcon = headerWhatsApp.querySelector('.material-symbols-outlined');
    if (oldIcon) {
      oldIcon.outerHTML = '<svg aria-hidden="true" class="w-5 h-5 text-text-crisp" fill="currentColor" viewBox="0 0 24 24"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.27-1.38a9.91 9.91 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91a9.84 9.84 0 0 0-2.91-7Zm-7 15.24h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.37 8.25 8.25 0 1 1 8.25 8.24Zm4.52-6.17c-.25-.13-1.47-.73-1.7-.81-.23-.08-.39-.13-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.24a7.5 7.5 0 0 1-1.38-1.72c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z"/></svg>';
    }
  }

  const requested = new URLSearchParams(window.location.search).get('lang')?.toLowerCase();
  applyLocale(langIndex[requested] === undefined ? 'en' : requested, false);
  window.barbersHubPreviewLocale = applyLocale;
})();
