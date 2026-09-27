import { esc, listCard, pdfDoc } from "./cards.js";
import { clock, ex, S, type Spec } from "./kit.js";

const FOOTER = "Nina · Tu profe de español";

export const library: Spec[] = [
  {
    title: "Un día en Valencia",
    type: "GRADED_READER",
    subtitle: "საკითხავი · A1 · 1 თავი",
    description: "მარტივი ტექსტი აწმყო დროში: ლაურას ერთი დღე ვალენსიაში.",
    estMinutes: 10,
    tags: ["A1", "lectura"],
    topic: 19,
    build: async () => ({
      chapter: 1,
      body: "Laura vive en Valencia. Su casa está en el centro, cerca de una plaza muy bonita.\n\nPor la mañana, Laura toma un café con leche y una tostada con tomate. Después, va al trabajo en bicicleta. En Valencia hay muchas bicicletas.\n\nLaura trabaja en un hotel. Habla español, inglés y un poco de francés. Los turistas son muy simpáticos.\n\nA las dos, Laura come con su amigo Lucas. Normalmente comen una paella. ¡La paella es de Valencia!\n\nPor la tarde, Laura camina por la playa de la Malvarrosa. El mar es azul y hace sol.\n\nPor la noche, Laura cena a las nueve y media. Lee un libro y a las once dice: «¡Buenas noches, Valencia!»",
      glossary: [
        { es: "el centro", ka: "ცენტრი" },
        { es: "cerca de", ka: "ახლოს" },
        { es: "después", ka: "შემდეგ" },
        { es: "va al trabajo", ka: "სამსახურში მიდის" },
        { es: "habla", ka: "ლაპარაკობს" },
        { es: "come", ka: "ჭამს, სადილობს" },
        { es: "normalmente", ka: "ჩვეულებრივ" },
        { es: "camina", ka: "სეირნობს" },
        { es: "el mar", ka: "ზღვა" },
        { es: "hace sol", ka: "მზიანი ამინდია" },
        { es: "cena", ka: "ვახშმობს" },
        { es: "lee un libro", ka: "წიგნს კითხულობს" },
      ],
    }),
  },
  {
    title: "El primer café de Ana",
    type: "GRADED_READER",
    subtitle: "საკითხავი · A1 · PDF-ითაც",
    description: "ანას პირველი დილა ბარსელონაში — ტექსტი, ლექსიკონი და დასაბეჭდი PDF.",
    estMinutes: 8,
    tags: ["A1", "lectura"],
    topic: 14,
    build: async (m) => {
      const text = [
        "Es lunes. Son las ocho de la mañana y Ana está en Barcelona.",
        "Ana entra en un bar pequeño. Hay mucha gente. El camarero es joven y simpático.",
        "—¡Buenos días! ¿Qué te pongo? —pregunta el camarero.",
        "—Un café con leche, por favor —dice Ana.",
        "—¿Algo para comer?",
        "—Sí, un cruasán.",
        "El café es muy bueno. Ana mira la calle: hay turistas, bicicletas y mucho sol.",
        "—¿Cuánto es? —pregunta Ana.",
        "—Dos euros con ochenta.",
        "Ana paga y sonríe. Su primer café en España. ¡Qué bien!",
      ];
      const file = await m.file(
        await pdfDoc(
          [
            {
              overline: "LECTURA · CAPÍTULO 1",
              title: "El primer café de Ana",
              html: `<div class="box" lang="es" style="font-size:14pt;line-height:1.9">${text.map((line) => `<p style="margin-top:2mm">${esc(line)}</p>`).join("")}</div>
              <p class="hand" lang="es" style="margin-top:8mm;font-size:24pt;color:var(--burgundy)">Un día a la vez</p>`,
            },
          ],
          FOOTER,
        ),
        "El primer café de Ana.pdf",
        "საკითხავი ტექსტი: ანას პირველი ყავა",
      );
      return {
        chapter: 1,
        body: text.join("\n\n"),
        file,
        glossary: [
          { es: "lunes", ka: "ორშაბათი" },
          { es: "entra en", ka: "შედის" },
          { es: "mucha gente", ka: "ბევრი ხალხი" },
          { es: "joven", ka: "ახალგაზრდა" },
          { es: "pregunta", ka: "კითხულობს" },
          { es: "mira", ka: "უყურებს" },
          { es: "paga", ka: "იხდის" },
          { es: "sonríe", ka: "იღიმის" },
        ],
      };
    },
  },
  {
    title: "Un paseo por Valencia",
    type: "STORY",
    subtitle: "ისტორია · დიალოგით",
    estMinutes: 7,
    tags: ["A1"],
    topic: 33,
    build: async (m) => ({
      characters: [S.laura, S.lucas],
      place: { es: "Valencia, España", ka: "ვალენსია, ესპანეთი" },
      image: await m.brand("illustrations/scene-walking.webp", "სეირნობა ქალაქში"),
      contextKa: "შაბათია. ლაურა ლუკასს ვალენსიის ძველ ქალაქს აჩვენებს.",
      dialogue: await m.dialogue({
        context: { es: "El sábado por la tarde", ka: "შაბათს, შუადღით" },
        speakers: [S.laura, S.lucas],
        lines: [
          ["laura", "Mira, Lucas. Esta es la plaza de la Virgen.", "Look, Lucas. This is the Plaza de la Virgen."],
          ["lucas", "¡Qué bonita! ¿Y qué es eso?", "How beautiful! And what's that?"],
          ["laura", "Es la catedral. Es muy antigua.", "It's the cathedral. It's very old."],
          ["lucas", "¿Hay un mercado por aquí?", "Is there a market around here?"],
          ["laura", "Sí, el Mercado Central está muy cerca.", "Yes, the Central Market is very close."],
          ["lucas", "¡Genial! Quiero comprar naranjas.", "Great! I want to buy oranges."],
          ["laura", "Las naranjas de Valencia son las mejores.", "Valencia oranges are the best."],
          ["lucas", "¿Y después, una horchata?", "And afterwards, a horchata?"],
          ["laura", "¡Claro! Vamos.", "Of course! Let's go."],
        ],
      }),
      grammarKa: "**Esta es…** — ესაა… (მდედრობითი). **Este es…** — ესაა… (მამრობითი).\n\n**¿Qué es eso?** — ეს რა არის? — როცა ნივთს თითით აჩვენებ.",
      cultureKa: "ჰორჩატა (horchata) ვალენსიის ტრადიციული ცივი სასმელია, რომელსაც ჩუფას თხილისგან ამზადებენ. მას ხშირად „ფარტონთან“ — გრძელ, ტკბილ ფუნთუშასთან ერთად სვამენ.",
    }),
  },
  {
    title: "Amigos en la terraza",
    type: "STORY",
    subtitle: "ისტორია · ტაპასები",
    estMinutes: 7,
    tags: ["A1"],
    topic: 14,
    build: async (m) => ({
      characters: [S.ana, S.lucas, S.laura, S.camarero],
      place: { es: "Una terraza en Barcelona", ka: "ტერასა ბარსელონაში" },
      image: await m.brand("illustrations/scene-cafe-friends.webp", "მეგობრები ტერასაზე"),
      contextKa: "პარასკევი საღამოა. ანა, ლუკასი და ლაურა ტერასაზე სხედან და ტაპასებს უკვეთავენ.",
      dialogue: await m.dialogue({
        context: { es: "El viernes por la noche", ka: "პარასკევს, საღამოს" },
        speakers: [S.camarero, S.ana, S.lucas, S.laura],
        lines: [
          ["camarero", "Buenas noches, chicos. ¿Qué vais a tomar?", "Good evening, guys. What are you having?"],
          ["lucas", "Para empezar, unas patatas bravas.", "To start, some patatas bravas."],
          ["laura", "Y una tortilla de patatas, por favor.", "And a Spanish omelette, please."],
          ["ana", "¿Qué son las croquetas?", "What are croquetas?"],
          ["camarero", "Son pequeñas, con jamón. ¡Están muy ricas!", "They're small, with ham. They're delicious!"],
          ["ana", "Vale, unas croquetas también.", "OK, some croquetas too."],
          ["camarero", "¿Y para beber?", "And to drink?"],
          ["laura", "Tres aguas con gas, por favor.", "Three sparkling waters, please."],
        ],
      }),
      grammarKa: "**¿Qué vais a tomar?** — რას მიირთმევთ? **vais** — vosotros-ის ფორმაა („თქვენ“ მეგობრებისთვის).\n\n**unas patatas** — რამდენიმე კარტოფილი: un / una → unos / unas.",
      cultureKa: "ტაპასები პატარა კერძებია, რომლებსაც მეგობრები ერთად უკვეთავენ და ერთმანეთს უყოფენ. ერთ ბარში რამდენიმე ტაპასს ჭამენ, მერე კი შემდეგ ბარში გადადიან — ამას „ir de tapas“ ჰქვია.",
    }),
  },
  {
    title: "Poco a poco · პოდკასტი #1",
    type: "AUDIO",
    description: "მოკლე პოდკასტი ნელი ესპანურით: ყავა ესპანეთში.",
    estMinutes: 4,
    tags: ["podcast"],
    topic: 14,
    build: async (m) => {
      const { audio, transcript, seconds } = await m.track(
        {
          context: { es: "El café en España", ka: "ყავა ესპანეთში" },
          speakers: [S.nina],
          lines: [
            ["nina", "¡Hola, hola! Soy Nina, tu profe.", "Hi there! I'm Nina, your teacher."],
            ["nina", "Hoy hablamos del café en España.", "Today we talk about coffee in Spain."],
            ["nina", "En España, el café es muy importante.", "In Spain, coffee is very important."],
            ["nina", "Por la mañana, mucha gente toma un café con leche.", "In the morning, many people have a white coffee."],
            ["nina", "Después de comer, toman un café solo o un cortado.", "After lunch, they have an espresso or a cortado."],
            ["nina", "¿Y en Georgia? En Georgia tomamos mucho café turco, ¿verdad?", "And in Georgia? In Georgia we drink a lot of Turkish coffee, right?"],
            ["nina", "Mi consejo: en un bar español, di: «Un cortado, por favor».", "My tip: in a Spanish bar, say: 'A cortado, please'."],
            ["nina", "Es fácil y suena muy natural.", "It's easy and sounds very natural."],
            ["nina", "¡Hasta la próxima! Poco a poco.", "Until next time! Little by little."],
          ],
        },
        1,
      );
      m.subtitle = `პოდკასტი · ${clock(seconds)}`;
      return { audio, introKa: "ჩემი პატარა პოდკასტი ნელი ესპანურით. მოუსმინე გზაში ან ყავასთან ერთად — ტექსტი ქვემოთაა.", transcript };
    },
  },
  {
    title: "¿A qué hora quedamos? · ვიდეო",
    type: "VIDEO",
    estMinutes: 4,
    tags: ["A1"],
    topic: 11,
    build: async (m) => {
      const { video, dialogue, seconds } = await m.dialogueVideo({
        name: "A qué hora quedamos",
        image: ["reloj", "cafe-pedido"],
        hand: "¿A qué hora?",
        titleKa: "შეხვედრაზე შეთანხმება",
        context: { es: "Quedar con amigos", ka: "ანა და ლუკასი შეხვედრის დროს ათანხმებენ." },
        speakers: [S.ana, S.lucas],
        lines: [
          ["ana", "Lucas, ¿quedamos el sábado?", "Lucas, shall we meet on Saturday?"],
          ["lucas", "¡Sí! ¿A qué hora?", "Yes! What time?"],
          ["ana", "¿A las cinco de la tarde?", "At five in the afternoon?"],
          ["lucas", "Mejor a las seis. A las cinco trabajo.", "Better at six. At five I'm working."],
          ["ana", "Vale, a las seis en el café Sol.", "OK, at six at Café Sol."],
          ["lucas", "¡Perfecto! Hasta el sábado.", "Perfect! See you on Saturday."],
        ],
      });
      m.subtitle = `ვიდეო · ${clock(seconds)}`;
      return { video, introKa: "როგორ შევთანხმდეთ შეხვედრის დროზე? უყურე და მიაქციე ყურადღება, როგორ ამბობენ დროს.", dialogue };
    },
  },
  {
    title: "Frases útiles para viajar",
    type: "DOCUMENT",
    subtitle: "PDF · 2 გვ. · მოგზაურისთვის",
    estMinutes: 10,
    tags: ["viaje"],
    topic: 38,
    build: async (m) => {
      const table = (rows: Array<[string, string]>) => `<table>${rows.map(([es, ka]) => `<tr><td lang="es" style="font-weight:700;width:55%">${esc(es)}</td><td>${esc(ka)}</td></tr>`).join("")}</table>`;
      const file = await m.file(
        await pdfDoc(
          [
            {
              overline: "DE VIAJE",
              title: "Frases útiles",
              html: `<h2>En el aeropuerto</h2>${table([["¿Dónde está la salida?", "სად არის გასასვლელი?"], ["¿Cómo voy al centro?", "როგორ მივიდე ცენტრში?"], ["Un billete para el centro, por favor.", "ერთი ბილეთი ცენტრამდე, გთხოვ."]])}
              <h2>En el hotel</h2>${table([["Tengo una reserva a nombre de…", "ჯავშანი მაქვს … სახელზე"], ["¿A qué hora es el desayuno?", "რომელ საათზეა საუზმე?"], ["¿Hay wifi? ¿Cuál es la contraseña?", "ვაიფაი არის? რა არის პაროლი?"]])}
              <h2>En la calle</h2>${table([["Perdone, ¿dónde está…?", "უკაცრავად, სად არის…?"], ["¿Está lejos?", "შორსაა?"], ["¿Puede repetir, por favor?", "შეგიძლიათ გაიმეოროთ?"], ["Más despacio, por favor.", "უფრო ნელა, გთხოვთ."]])}`,
            },
            {
              overline: "DE VIAJE",
              title: "En el restaurante",
              html: `${table([["Una mesa para dos, por favor.", "მაგიდა ორისთვის, გთხოვთ."], ["¿Qué me recomienda?", "რას მირჩევთ?"], ["Soy vegetariana / vegetariano.", "ვეგეტარიანელი ვარ."], ["La cuenta, por favor.", "ანგარიში, გთხოვთ."]])}
              <h2>Emergencias</h2>${table([["¡Ayuda!", "მიშველეთ!"], ["Necesito un médico.", "ექიმი მჭირდება."], ["He perdido mi pasaporte.", "პასპორტი დავკარგე."], ["¿Habla inglés?", "ინგლისური იცით?"]])}
              <div class="box ka" style="font-size:12pt">ყველაზე მნიშვნელოვანი ფრაზა: <b lang="es">«Perdone, no entiendo. ¿Puede repetir?»</b> — არაფერია სამარცხვინო, ესპანელები ამას სიამოვნებით გაიმეორებენ.</div>
              <p class="hand" lang="es" style="margin-top:8mm;font-size:26pt;color:var(--burgundy)">¡Buen viaje!</p>`,
            },
          ],
          FOOTER,
        ),
        "Frases útiles para viajar.pdf",
        "მოგზაურის ფრაზების ფურცელი",
      );
      return { file, noteKa: "ჩამოტვირთე ტელეფონში — მოგზაურობისას ინტერნეტის გარეშეც გამოგადგება.", allowDownload: true };
    },
  },
  {
    title: "La familia",
    type: "VOCAB",
    estMinutes: 5,
    tags: ["A1"],
    topic: 24,
    build: async (m) => ({
      layout: "list",
      title: { es: "La familia", ka: "ოჯახი" },
      introKa: "ოჯახის წევრები. მამრობითი მრავლობითი (los padres, los hermanos) ხშირად ორივე სქესს აერთიანებს.",
      entries: await m.entries([
        { article: "la", es: "madre", ka: "დედა", en: "mother", exampleEs: "Mi madre se llama Nino.", exampleKa: "დედაჩემს ნინო ჰქვია." },
        { article: "el", es: "padre", ka: "მამა", en: "father" },
        { article: "los", es: "padres", ka: "მშობლები", en: "parents", exampleEs: "Mis padres viven en Tbilisi.", exampleKa: "ჩემი მშობლები თბილისში ცხოვრობენ." },
        { article: "el", es: "hermano", ka: "ძმა", en: "brother", exampleEs: "Tengo un hermano.", exampleKa: "ერთი ძმა მყავს." },
        { article: "la", es: "hermana", ka: "და", en: "sister" },
        { article: "el", es: "hijo", ka: "შვილი (ვაჟი)", en: "son" },
        { article: "la", es: "hija", ka: "შვილი (ქალიშვილი)", en: "daughter" },
        { article: "el", es: "abuelo", ka: "ბაბუა", en: "grandfather" },
        { article: "la", es: "abuela", ka: "ბებია", en: "grandmother", exampleEs: "Mi abuela cocina muy bien.", exampleKa: "ბებიაჩემი ძალიან კარგად ამზადებს საჭმელს." },
        { article: "el", es: "marido", ka: "ქმარი", en: "husband" },
        { article: "la", es: "mujer", ka: "ცოლი, ქალი", en: "wife, woman" },
        { article: "el", es: "primo / la prima", ka: "ბიძაშვილი, დეიდაშვილი…", en: "cousin" },
      ]),
    }),
  },
  {
    title: "Los días de la semana",
    type: "VOCAB",
    estMinutes: 4,
    tags: ["A1"],
    topic: 13,
    build: async (m) => ({
      layout: "list",
      title: { es: "Los días de la semana", ka: "კვირის დღეები" },
      introKa: "კვირის დღეები ესპანურად პატარა ასოთი იწერება და კვირა ორშაბათით იწყება.",
      entries: await m.entries([
        { article: "el", es: "lunes", ka: "ორშაბათი", en: "Monday", exampleEs: "El lunes tengo clase.", exampleKa: "ორშაბათს გაკვეთილი მაქვს." },
        { article: "el", es: "martes", ka: "სამშაბათი", en: "Tuesday" },
        { article: "el", es: "miércoles", ka: "ოთხშაბათი", en: "Wednesday" },
        { article: "el", es: "jueves", ka: "ხუთშაბათი", en: "Thursday" },
        { article: "el", es: "viernes", ka: "პარასკევი", en: "Friday", exampleEs: "El viernes vamos de tapas.", exampleKa: "პარასკევს ტაპასებზე მივდივართ." },
        { article: "el", es: "sábado", ka: "შაბათი", en: "Saturday" },
        { article: "el", es: "domingo", ka: "კვირა", en: "Sunday" },
        { es: "hoy", ka: "დღეს", en: "today", exampleEs: "Hoy es martes.", exampleKa: "დღეს სამშაბათია." },
        { es: "mañana", ka: "ხვალ", en: "tomorrow" },
        { es: "ayer", ka: "გუშინ", en: "yesterday" },
        { article: "el", es: "fin de semana", ka: "შაბათ-კვირა", en: "weekend" },
      ]),
    }),
  },
  {
    title: "Los colores",
    type: "VOCAB",
    estMinutes: 4,
    tags: ["A1"],
    topic: 29,
    build: async (m) => ({
      layout: "list",
      title: { es: "Los colores", ka: "ფერები" },
      introKa: "ფერები სიტყვის შემდეგ მოდის და სქესში ეთანხმება: un coche rojo, una casa roja.",
      entries: await m.entries([
        { es: "rojo / roja", ka: "წითელი", en: "red", exampleEs: "Una camiseta roja.", exampleKa: "წითელი მაისური." },
        { es: "azul", ka: "ლურჯი", en: "blue", exampleEs: "El mar es azul.", exampleKa: "ზღვა ლურჯია." },
        { es: "verde", ka: "მწვანე", en: "green" },
        { es: "amarillo / amarilla", ka: "ყვითელი", en: "yellow" },
        { es: "negro / negra", ka: "შავი", en: "black" },
        { es: "blanco / blanca", ka: "თეთრი", en: "white", exampleEs: "Una casa blanca.", exampleKa: "თეთრი სახლი." },
        { es: "gris", ka: "ნაცრისფერი", en: "grey" },
        { es: "marrón", ka: "ყავისფერი", en: "brown" },
        { es: "naranja", ka: "ნარინჯისფერი", en: "orange" },
        { es: "rosa", ka: "ვარდისფერი", en: "pink" },
      ]),
    }),
  },
  {
    title: "Los días de la semana · ბარათი",
    type: "INFO_CARD",
    estMinutes: 2,
    tags: ["A1"],
    topic: 13,
    build: async (m) => ({
      pages: [
        await m.card(
          listCard({
            overline: "LA SEMANA",
            titleEs: "¿Qué día es hoy?",
            titleKa: "კვირის დღეები",
            rows: [
              { es: "lunes · martes", ka: "ორშაბათი · სამშაბათი" },
              { es: "miércoles · jueves", ka: "ოთხშაბათი · ხუთშაბათი" },
              { es: "viernes", ka: "პარასკევი" },
              { es: "sábado · domingo", ka: "შაბათი · კვირა" },
              { es: "el fin de semana", ka: "შაბათ-კვირა" },
            ],
            tipKa: "„El lunes“ — ორშაბათს (ერთხელ). „Los lunes“ — ყოველ ორშაბათს.",
            page: "1 / 1",
          }),
          "La semana",
          "კვირის დღეების ბარათი",
        ),
      ],
      altKa: "ბარათი კვირის დღეებით",
      captionKa: "¿Qué día es hoy?",
    }),
  },
  {
    title: "Frases de emergencia",
    type: "INFO_CARD",
    estMinutes: 2,
    tags: ["viaje"],
    topic: 38,
    build: async (m) => ({
      pages: [
        await m.card(
          listCard({
            overline: "SOS",
            titleEs: "No entiendo",
            titleKa: "როცა ვერ გაიგე",
            image: "cuaderno",
            rows: [
              { es: "Perdone, no entiendo.", ka: "უკაცრავად, ვერ გავიგე." },
              { es: "¿Puede repetir, por favor?", ka: "შეგიძლიათ გაიმეოროთ?" },
              { es: "Más despacio, por favor.", ka: "უფრო ნელა, გთხოვთ." },
              { es: "¿Cómo se dice … en español?", ka: "როგორ არის ესპანურად …?" },
            ],
            page: "1 / 1",
          }),
          "No entiendo",
          "ფრაზები, როცა ვერ გაიგე",
        ),
      ],
      altKa: "ბარათი: ფრაზები, როცა თანამოსაუბრე ვერ გაიგე",
      captionKa: "No entiendo · როცა ვერ გაიგე",
    }),
  },
  {
    title: "Los artículos: el, la, los, las",
    type: "GRAMMAR",
    estMinutes: 6,
    tags: ["A1"],
    topic: 14,
    build: async () => ({
      titleEs: "Los artículos",
      ruleKa: "ესპანურში ყველა სახელს აქვს სქესი: **el** — მამრობითი, **la** — მდედრობითი. მრავლობითში: **los**, **las**.",
      body: "ქართულში სქესი არ გვაქვს, ამიტომ სიტყვა ყოველთვის არტიკლთან ერთად ისწავლე: არა „café“, არამედ **el café**.\n\n- ჩვეულებრივ **-o** → el: el zumo, el vino\n- ჩვეულებრივ **-a** → la: la cuenta, la mesa\n- გამონაკლისები: **el día**, **el problema**, **la mano**\n\n**un / una** — განუსაზღვრელი: un café, una tostada.",
      table: {
        caption: "არტიკლები",
        headers: ["", "მხოლობითი", "მრავლობითი"],
        rows: [
          ["მამრობითი", "el café · un café", "los cafés · unos cafés"],
          ["მდედრობითი", "la mesa · una mesa", "las mesas · unas mesas"],
        ],
      },
      examples: [
        { es: "**El** café está muy bueno.", ka: "ყავა ძალიან კარგია." },
        { es: "**La** cuenta, por favor.", ka: "ანგარიში, გთხოვ." },
        { es: "**Los** amigos de Ana son españoles.", ka: "ანას მეგობრები ესპანელები არიან." },
        { es: "Quiero **una** tostada.", ka: "ერთი ტოსტი მინდა." },
      ],
      mistakes: [
        { wrong: "la día", right: "el día", noteKa: "-a-ზე ბოლოვდება, მაგრამ მამრობითია" },
        { wrong: "el mano", right: "la mano", noteKa: "-o-ზე ბოლოვდება, მაგრამ მდედრობითია" },
      ],
      tipKa: "ლექსიკის ბარათებზე el ლურჯ-მწვანედაა, la კი ბორდოსფრად. ფერი დაგეხმარება სქესის დამახსოვრებაში.",
    }),
  },
  {
    title: "Verbos en -ar: hablar",
    type: "GRAMMAR",
    estMinutes: 7,
    tags: ["A1"],
    topic: 19,
    build: async () => ({
      titleEs: "Verbos en -ar",
      ruleKa: "-ar-ზე დაბოლოებული ზმნები ერთნაირად იცვლება: მოაცილე **-ar** და დაამატე **-o, -as, -a, -amos, -áis, -an**.",
      body: "ყველაზე დიდი ჯგუფია! ერთი ზმნა თუ ისწავლე — ასობით იცი.\n\n- **hablar** — ლაპარაკი\n- **trabajar** — მუშაობა\n- **tomar** — დალევა, აღება\n- **estudiar** — სწავლა",
      table: {
        caption: "hablar — აწმყო",
        headers: ["", "hablar", "trabajar"],
        rows: [
          ["yo", "habl**o**", "trabaj**o**"],
          ["tú", "habl**as**", "trabaj**as**"],
          ["él / ella", "habl**a**", "trabaj**a**"],
          ["nosotros", "habl**amos**", "trabaj**amos**"],
          ["vosotros", "habl**áis**", "trabaj**áis**"],
          ["ellos / ellas", "habl**an**", "trabaj**an**"],
        ],
      },
      examples: [
        { es: "**Hablo** georgiano y un poco de español.", ka: "ქართულად და ცოტა ესპანურად ვლაპარაკობ." },
        { es: "Laura **trabaja** en un hotel.", ka: "ლაურა სასტუმროში მუშაობს." },
        { es: "¿**Tomamos** un café?", ka: "დავლიოთ ყავა?" },
      ],
      mistakes: [{ wrong: "Yo hablar español.", right: "Yo hablo español.", noteKa: "ინფინიტივი ცალკე არ გამოიყენება" }],
      tipKa: "ზმნების ცხრილი ერთ ბარათზე დაწერე და მაცივარზე მიაკარი. ყოველ დილით ერთხელ ხმამაღლა წაიკითხე.",
    }),
  },
  {
    title: "tener — tengo, tienes…",
    type: "GRAMMAR",
    estMinutes: 6,
    tags: ["A1"],
    topic: 27,
    build: async () => ({
      titleEs: "El verbo tener",
      ruleKa: "**tener** = ქონა. ასაკსაც tener-ით ვამბობთ: **Tengo 30 años** — სიტყვასიტყვით „30 წელი მაქვს“.",
      body: "tener არარეგულარულია — yo-ს ფორმაში **g** ჩნდება, სხვაგან კი **e → ie**.\n\n- **Tengo un hermano.** — ძმა მყავს.\n- **Tengo hambre.** — მშია.\n- **Tengo 28 años.** — 28 წლის ვარ.",
      table: {
        caption: "tener — აწმყო",
        headers: ["", "tener", "ქართულად"],
        rows: [
          ["yo", "**tengo**", "მაქვს"],
          ["tú", "**tienes**", "გაქვს"],
          ["él / ella", "**tiene**", "აქვს"],
          ["nosotros", "**tenemos**", "გვაქვს"],
          ["vosotros", "**tenéis**", "გაქვთ"],
          ["ellos / ellas", "**tienen**", "აქვთ"],
        ],
      },
      examples: [
        { es: "¿Cuántos años **tienes**?", ka: "რამდენი წლის ხარ?" },
        { es: "Ana **tiene** una reserva.", ka: "ანას ჯავშანი აქვს." },
        { es: "**Tenemos** clase el lunes.", ka: "ორშაბათს გაკვეთილი გვაქვს." },
      ],
      mistakes: [{ wrong: "Soy 28 años.", right: "Tengo 28 años.", noteKa: "ასაკი — tener-ით" }],
      tipKa: "„Tengo hambre“ (მშია), „tengo sed“ (მწყურია), „tengo frío“ (მცივა) — ეს სამი ფრაზა მოგზაურობისას ყველაზე ხშირად დაგჭირდება.",
    }),
  },
  {
    title: "En la estación de tren",
    type: "DIALOGUE",
    estMinutes: 4,
    tags: ["viaje"],
    topic: 40,
    build: async (m) =>
      m.dialogue({
        context: { es: "En la taquilla", ka: "სადგურის სალაროსთან ბილეთს ყიდულობ ვალენსიამდე." },
        speakers: [S.tu, { id: "taquilla", name: "Taquilla", initial: "T", tone: "navy" }],
        lines: [
          ["tu", "Buenos días. Un billete para Valencia, por favor.", "Good morning. A ticket to Valencia, please."],
          ["taquilla", "¿De ida o de ida y vuelta?", "One way or return?"],
          ["tu", "De ida y vuelta.", "Return."],
          ["taquilla", "¿Para hoy?", "For today?"],
          ["tu", "Sí. ¿A qué hora sale el próximo tren?", "Yes. What time does the next train leave?"],
          ["taquilla", "A las diez y cuarto, del andén tres.", "At a quarter past ten, from platform three."],
          ["tu", "Perfecto. ¿Cuánto es?", "Perfect. How much is it?"],
          ["taquilla", "Son cuarenta y dos euros.", "That's forty-two euros."],
        ],
      }),
  },
  {
    title: "En el hotel",
    type: "DIALOGUE",
    estMinutes: 4,
    tags: ["viaje"],
    topic: 39,
    build: async (m) =>
      m.dialogue({
        context: { es: "En la recepción", ka: "სასტუმროში მიდიხარ და ოთახის შესახებ კითხულობ." },
        speakers: [S.tu, S.recep],
        lines: [
          ["recep", "Buenas tardes. ¿En qué puedo ayudarle?", "Good afternoon. How can I help you?"],
          ["tu", "Hola. Tengo una reserva a nombre de Mariam.", "Hi. I have a reservation under the name Mariam."],
          ["recep", "Sí, aquí está. Tres noches, ¿verdad?", "Yes, here it is. Three nights, right?"],
          ["tu", "Sí. ¿A qué hora es el desayuno?", "Yes. What time is breakfast?"],
          ["recep", "De siete a diez y media.", "From seven to half past ten."],
          ["tu", "¿Y cuál es la contraseña del wifi?", "And what's the wifi password?"],
          ["recep", "Está en la tarjeta. Su habitación es la doscientos cinco.", "It's on the card. Your room is two hundred and five."],
          ["tu", "Muchas gracias.", "Thank you very much."],
        ],
      }),
  },
  {
    title: "La h muda",
    type: "PRONUNCIATION",
    estMinutes: 3,
    tags: ["pronunciación"],
    topic: 2,
    build: async (m) => ({
      title: "h",
      items: [{ grapheme: "h", hintKa: "h ესპანურში არასოდეს გამოითქმის: hola — „ოლა“, hotel — „ოტელ“.", example: "hola", audio: await m.say("hola… hotel… hermano", "nina", "-30%") }],
      examples: ["hola", "el hotel", "el hermano", "la hora", "hablar", "hoy"],
      tipKa: "ქართველებს ხშირად უნდათ, რომ h „ჰ“-დ წარმოთქვან. დაივიწყე ის — ესპანურში h უბრალოდ სიჩუმეა.",
    }),
  },
  {
    title: "b / v",
    type: "PRONUNCIATION",
    estMinutes: 3,
    tags: ["pronunciación"],
    topic: 2,
    build: async (m) => ({
      title: "b · v",
      items: [
        { grapheme: "b", hintKa: "b და v ესპანურში ერთნაირად ჟღერს — როგორც რბილი „ბ“.", example: "bien", audio: await m.say("bien… Barcelona", "nina", "-30%") },
        { grapheme: "v", hintKa: "v არ ჟღერს როგორც ქართული „ვ“: vale — „ბალე“.", example: "vale", audio: await m.say("vale… Valencia… vivo", "nina", "-30%") },
      ],
      examples: ["bien", "vale", "Valencia", "vivo", "el vino", "la bicicleta"],
      tipKa: "როცა გვარს ასოებით ამბობ და ესპანელმა ვერ გაიგოს, თქვი „be de Barcelona“ ან „uve de Valencia“.",
    }),
  },
  {
    title: "¿Qué dices?",
    type: "EXERCISE",
    subtitle: "სიტუაციები · ჩატის კონტექსტით",
    estMinutes: 5,
    tags: ["A1"],
    topic: 16,
    build: async () =>
      ex(
        "multiple_choice",
        "¿Qué dices?",
        "წაიკითხე სიტუაცია და აირჩიე, რას იტყვი",
        [
          { context: "Camarero: ¿Qué le pongo?", prompt: { ka: "ყავა გინდა." }, options: [{ id: "a", text: "Un café, por favor." }, { id: "b", text: "Soy de Georgia." }, { id: "c", text: "Hasta luego." }], correctId: "a" },
          { context: "Señor: Perdone, ¿tiene hora?", prompt: { ka: "ხუთი საათია." }, options: [{ id: "a", text: "Son las cinco." }, { id: "b", text: "Tengo cinco años." }, { id: "c", text: "Cinco euros." }], correctId: "a" },
          { context: "Laura: ¡Gracias por el café!", prompt: { ka: "რას უპასუხებ?" }, options: [{ id: "a", text: "De nada." }, { id: "b", text: "Por favor." }, { id: "c", text: "Buenos días." }], correctId: "a" },
          { context: "Recepcionista: ¿Su nombre, por favor?", prompt: { ka: "შენი სახელი თქვი." }, options: [{ id: "a", text: "Me llamo Mariam." }, { id: "b", text: "Vivo en Tbilisi." }, { id: "c", text: "Muy bien." }], correctId: "a" },
          { context: "Lucas: ¿Quieres un zumo?", prompt: { ka: "არა, გმადლობ." }, options: [{ id: "a", text: "No, gracias." }, { id: "b", text: "No, por favor." }, { id: "c", text: "No, de nada." }], correctId: "a" },
          { context: "Señora: ...rápido, rápido...", prompt: { ka: "ვერ გაიგე. რას იტყვი?" }, options: [{ id: "a", text: "Más despacio, por favor." }, { id: "b", text: "Más café, por favor." }, { id: "c", text: "Adiós." }], correctId: "a" },
        ],
        { variant: "chat_context" },
      ),
  },
  {
    title: "ჩასვი tener-ის ფორმა",
    type: "EXERCISE",
    estMinutes: 4,
    tags: ["A1"],
    topic: 27,
    build: async () =>
      ex(
        "fill_blank",
        "tener",
        "ჩასვი tener-ის სწორი ფორმა",
        [
          { verbHint: "tener", rows: [{ before: "Yo", after: "dos hermanos.", answer: "tengo" }, { before: "¿Cuántos años", after: "tú?", answer: "tienes" }] },
          { verbHint: "tener", rows: [{ before: "Ana", after: "una reserva.", answer: "tiene" }, { before: "Nosotros", after: "clase el lunes.", answer: "tenemos" }] },
          { verbHint: "tener", rows: [{ before: "¿Vosotros", after: "hambre?", answer: "tenéis", options: ["tenéis", "tienen", "tenemos"] }, { before: "Ellos", after: "un perro.", answer: "tienen", options: ["tienen", "tiene", "tenéis"] }] },
          { verbHint: "tener", strictAccents: false, rows: [{ before: "Mi abuela", after: "ochenta años.", answer: "tiene" }, { before: "Yo no", after: "tiempo hoy.", answer: "tengo" }] },
        ],
      ),
  },
  {
    title: "ააწყე წინადადება — En la estación",
    type: "EXERCISE",
    estMinutes: 5,
    tags: ["viaje"],
    topic: 40,
    build: async () =>
      ex(
        "sentence_builder",
        "En la estación",
        "ააწყე წინადადება",
        [
          { promptKa: "ერთი ბილეთი ვალენსიამდე, გთხოვ.", tiles: ["Valencia,", "billete", "para", "Un", "por", "favor"], answer: ["Un", "billete", "para", "Valencia,", "por", "favor"] },
          { promptKa: "რომელ საათზე გადის მატარებელი?", tiles: ["sale", "hora", "el", "¿A", "qué", "tren?"], answer: ["¿A", "qué", "hora", "sale", "el", "tren?"] },
          { promptKa: "ორივე მხარეს, გთხოვ.", tiles: ["vuelta,", "y", "De", "ida", "favor", "por"], answer: ["De", "ida", "y", "vuelta,", "por", "favor"] },
          { promptKa: "სად არის მესამე ბაქანი?", tiles: ["tres?", "está", "el", "¿Dónde", "andén"], answer: ["¿Dónde", "está", "el", "andén", "tres?"] },
          { promptKa: "მატარებელი ათის თხუთმეტ წუთზე გადის.", tiles: ["diez", "sale", "y", "las", "El", "tren", "a", "cuarto."], answer: ["El", "tren", "sale", "a", "las", "diez", "y", "cuarto."] },
        ],
        { variant: "tiles_with_translation_hint" },
      ),
  },
  {
    title: "¿A qué hora sale el tren?",
    type: "EXERCISE",
    subtitle: "მოსმენა · 5 ნაბიჯი",
    estMinutes: 5,
    tags: ["viaje"],
    topic: 40,
    build: async (m) =>
      ex(
        "listening",
        "¿A qué hora sale el tren?",
        "მოუსმინე განცხადებას და აირჩიე სწორი დრო",
        [
          { audio: await m.say("El tren a Madrid sale a las siete y media.", "narrador"), questionEs: "¿A qué hora sale el tren a Madrid?", options: [{ id: "a", text: "7:30" }, { id: "b", text: "7:15" }, { id: "c", text: "6:30" }], correctId: "a" },
          { audio: await m.say("El tren a Sevilla sale a las once menos cuarto.", "narrador"), questionEs: "¿A qué hora sale el tren a Sevilla?", options: [{ id: "a", text: "11:15" }, { id: "b", text: "10:45" }, { id: "c", text: "11:45" }], correctId: "b" },
          { audio: await m.say("El tren a Bilbao sale del andén cuatro.", "narrador"), questionEs: "¿De qué andén sale?", questionKa: "რომელი ბაქნიდან?", options: [{ id: "a", text: "2" }, { id: "b", text: "4" }, { id: "c", text: "14" }], correctId: "b" },
          { audio: await m.say("El tren a Valencia tiene un retraso de veinte minutos.", "narrador"), questionEs: "¿Cuántos minutos de retraso?", questionKa: "რამდენი წუთით აგვიანებს?", options: [{ id: "a", text: "12" }, { id: "b", text: "20" }, { id: "c", text: "2" }], correctId: "b" },
          { audio: await m.say("El último tren a Barcelona sale a las nueve y diez de la noche.", "narrador"), questionEs: "¿A qué hora sale el último tren?", options: [{ id: "a", text: "21:10" }, { id: "b", text: "19:10" }, { id: "c", text: "21:50" }], correctId: "a" },
        ],
      ),
  },
  {
    title: "En la taquilla — შენი არჩევანი",
    type: "EXERCISE",
    estMinutes: 5,
    tags: ["viaje"],
    topic: 40,
    build: async () =>
      ex(
        "branching_dialogue",
        "En la taquilla",
        "სადგურზე ხარ. აირჩიე, რას უპასუხებ მოლარეს",
        [
          {
            start: "a",
            speakers: [{ id: "taquilla", name: "Taquilla", initial: "T", tone: "navy" }],
            nodes: [
              { id: "a", speakerId: "taquilla", text: "Buenos días. ¿Adónde va?", choices: [{ text: "A Valencia, por favor.", next: "b", isGood: true }, { text: "Muy bien, gracias.", next: "a2", isGood: false }] },
              { id: "a2", speakerId: "taquilla", text: "Me alegro. Pero… ¿adónde va?", choices: [{ text: "Perdón. A Valencia, por favor.", next: "b", isGood: true }] },
              { id: "b", speakerId: "taquilla", text: "¿De ida o de ida y vuelta?", choices: [{ text: "De ida y vuelta.", next: "c", isGood: true }, { text: "Solo de ida.", next: "c", isGood: true }] },
              { id: "c", speakerId: "taquilla", text: "Son treinta euros. ¿Paga con tarjeta?", choices: [{ text: "Sí, con tarjeta.", next: "d", isGood: true }, { text: "¿Treinta? ¡No!", next: "c2", isGood: false }] },
              { id: "c2", speakerId: "taquilla", text: "Es el precio del billete. ¿Lo quiere?", choices: [{ text: "Sí, perdón. Con tarjeta.", next: "d", isGood: true }] },
              { id: "d", speakerId: "taquilla", text: "Aquí tiene. El tren sale del andén dos. ¡Buen viaje!" },
            ],
          },
        ],
        { variant: "scene" },
      ),
  },
  {
    title: "¿Verdadero o falso? España",
    type: "GAME",
    estMinutes: 3,
    tags: ["cultura"],
    topic: 7,
    build: async () =>
      ex(
        "swipe_true_false",
        "España",
        "რას იცნობ ესპანეთზე? მართალია თუ მცდარი?",
        [
          { statement: "Madrid es la capital de España.", isTrue: true },
          { statement: "La paella es de Valencia.", isTrue: true },
          { statement: "En España cenan a las seis de la tarde.", isTrue: false },
          { statement: "En Barcelona hablan español y catalán.", isTrue: true },
          { statement: "Sevilla está en el norte de España.", isTrue: false },
          { statement: "«Hasta luego» significa «ხვალამდე».", isTrue: false },
          { statement: "La horchata es una bebida de Valencia.", isTrue: true },
          { statement: "En España el fin de semana es el sábado y el domingo.", isTrue: true },
        ],
        { variant: "buttons_only" },
      ),
  },
  {
    title: "Comida, bebida o lugar",
    type: "GAME",
    estMinutes: 3,
    tags: ["A1"],
    topic: 14,
    build: async () =>
      ex(
        "drag_sort",
        "Comida, bebida o lugar",
        "დაალაგე სიტყვები სამ ჯგუფად",
        [
          {
            buckets: [{ id: "comida", label: "comida" }, { id: "bebida", label: "bebida" }, { id: "lugar", label: "lugar" }],
            items: [
              { id: "1", text: "la tostada", bucketId: "comida" },
              { id: "2", text: "el zumo", bucketId: "bebida" },
              { id: "3", text: "la plaza", bucketId: "lugar" },
              { id: "4", text: "el cruasán", bucketId: "comida" },
              { id: "5", text: "el té", bucketId: "bebida" },
              { id: "6", text: "la estación", bucketId: "lugar" },
              { id: "7", text: "la paella", bucketId: "comida" },
              { id: "8", text: "el agua", bucketId: "bebida" },
              { id: "9", text: "el hotel", bucketId: "lugar" },
            ],
          },
        ],
        { variant: "multi_buckets" },
      ),
  },
  {
    title: "La familia — წყვილები",
    type: "GAME",
    estMinutes: 3,
    tags: ["A1"],
    topic: 24,
    build: async () =>
      ex(
        "matching_pairs",
        "La familia",
        "დააკავშირე სიტყვა და თარგმანი",
        [
          { mode: "word_translation", pairs: [{ left: "la madre", right: "დედა" }, { left: "el padre", right: "მამა" }, { left: "el hermano", right: "ძმა" }, { left: "la hermana", right: "და" }] },
          { mode: "word_translation", pairs: [{ left: "la abuela", right: "ბებია" }, { left: "el abuelo", right: "ბაბუა" }, { left: "la hija", right: "ქალიშვილი" }, { left: "los padres", right: "მშობლები" }] },
        ],
        { variant: "lines" },
      ),
  },
  {
    title: "¿Qué es? — სურათები",
    type: "GAME",
    estMinutes: 3,
    tags: ["A1"],
    topic: 14,
    build: async (m) =>
      ex(
        "matching_pairs",
        "¿Qué es?",
        "დააკავშირე სიტყვა სურათთან",
        [
          {
            mode: "word_image",
            pairs: [
              { left: "el reloj", right: await m.image("reloj", "el reloj") },
              { left: "el cuaderno", right: await m.image("cuaderno", "el cuaderno") },
              { left: "el zumo", right: await m.image("zumo", "el zumo") },
              { left: "el cruasán", right: await m.image("cruasan", "el cruasán") },
              { left: "el agua", right: await m.image("agua", "el agua") },
              { left: "la cuenta", right: await m.image("cuenta", "la cuenta") },
            ],
          },
        ],
        { variant: "tap_pairs" },
      ),
  },
  {
    title: "ბლოკი 3 · En el café",
    type: "CHECKPOINT",
    subtitle: "ბლოკის შემოწმება · 3 ნაწილი",
    estMinutes: 12,
    topic: 14,
    build: async (m) =>
      ex("checkpoint", "ბლოკი 3 · En el café", "შეამოწმე მესამე ბლოკი: კაფე, querer, თავაზიანი თხოვნა", [
        {
          sections: [
            {
              labelKa: "ლექსიკა",
              stepRefs: [
                { templateId: "matching_pairs", mode: "word_image", pairs: [{ left: "el café", right: await m.image("cafe-con-leche", "el café") }, { left: "la tostada", right: await m.image("tostada", "la tostada") }, { left: "el zumo", right: await m.image("zumo", "el zumo") }] },
                { templateId: "drag_sort", buckets: [{ id: "el", label: "el" }, { id: "la", label: "la" }], items: [{ id: "1", text: "cuenta", bucketId: "la" }, { id: "2", text: "té", bucketId: "el" }, { id: "3", text: "tostada", bucketId: "la" }, { id: "4", text: "azúcar", bucketId: "el" }] },
              ],
            },
            {
              labelKa: "querer",
              stepRefs: [
                { templateId: "fill_blank", verbHint: "querer", rows: [{ before: "Yo", after: "un té.", answer: "quiero" }, { before: "¿Qué", after: "tú?", answer: "quieres" }, { before: "Nosotros", after: "la cuenta.", answer: "queremos" }] },
                { templateId: "sentence_builder", promptKa: "რისი დალევა გინდა?", tiles: ["tomar?", "quieres", "¿Qué"], answer: ["¿Qué", "quieres", "tomar?"] },
              ],
            },
            {
              labelKa: "მოსმენა",
              stepRefs: [
                { templateId: "listening", audio: await m.clip([["camarero", "¿Qué le pongo?", ""], ["ana", "Un cortado y un cruasán, por favor.", ""]], "Bloque 3 escucha"), questionEs: "¿Qué pide Ana?", questionKa: "რა შეუკვეთა ანამ?", options: [{ id: "a", text: "un cortado y un cruasán" }, { id: "b", text: "un café solo y una tostada" }, { id: "c", text: "un té y un cruasán" }], correctId: "a" },
              ],
            },
          ],
        },
      ]),
  },
  {
    title: "Mi familia · ვიდეო",
    type: "VIDEO",
    status: "DRAFT",
    subtitle: "მზადდება",
    tags: ["A1"],
    topic: 24,
    build: async () => ({ introKa: "ლუკასი ოჯახის ფოტოებს აჩვენებს. ვიდეოს ჯერ ვიღებ — მალე აქ იქნება." }),
  },
  {
    title: "De compras · დიალოგი",
    type: "DIALOGUE",
    status: "DRAFT",
    subtitle: "დრაფტი",
    tags: ["A1"],
    topic: 28,
    build: async () => ({
      context: { es: "En una tienda de ropa", ka: "ტანსაცმლის მაღაზიაში" },
      speakers: [S.ana, { id: "dependienta", name: "Dependienta", initial: "D", tone: "sage" }],
      lines: [{ speakerId: "dependienta", es: "Hola, ¿puedo ayudarte?", en: "Hi, can I help you?" }],
    }),
  },
];
