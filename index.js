const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    downloadContentFromMessage 
} = require('@whiskeysockets/baileys');
const axios = require('axios');
const readline = require('readline');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (value) => { rl.close(); resolve(value); }));
};

// قواعد البيانات المؤقتة
const groupWarnings = {}; 
const pointsBank = {}; 
const marriageSystem = {}; 
const deletedMessages = {}; 
const viewOnceMedia = {}; 
const gameSessions = {}; 

let groupRules = `⚠️ قــوانــيــن الـمـجـمـوعـة | الإلــتــزام واجــب ⚠️
━━━━━━━━━━━🕷️━━━━━━━━━━━

🌪️🚫 مـمـنـوع الـسـبـام والإزعـاج
🌪️🚫 مـمـنـوع الـصـور أو الـمـلـصـقـات الـمـخـلـة
🌪️🚫 مـمـنـوع فـتـح الـمـكـالـمـات الـصـوتـيـة
🌪️🚫 مـمـنـوع الـسـب والـشـتـم
🌪️🚫 مـمـنـوع الـتـرويـج والـروابـط
🌪️🚫 مـمـنـوع الـتـحـرش أو الـمـواضـيـع الـجـنـسـيـة
🌪️🚫 مـمـنـوع الـتـنـمـر أو الـتـقـلـيـل مـن الأعـضـاء
🌪️🚫 مـمـنـوع إفـتـعـال الـمـشـاكـل أو الـتـهـديـد

━━━━━━━━━━🕷️━━━━━━━━━━━
✨ إحترامك دليل على رقيّك ✨
@‏الكل`;

// قاعدة الأسئلة الخاصة بك باللغة العربية الفصحى (.تخمين)
const animeQuestions = [
    // NARUTO & BORUTO
    { q: "ما اسم التقنية السرية الشهيرة لعشيرة النارا؟", a: "تقليد الظل" },
    { q: "من هو التلميذ الثالث لجيرايا في قرية المطر مع ناجاتو وكونان؟", a: "ياهيكو" },
    { q: "ما اسم السيف الضخم والممتص للتشاكرا الخاص بكيسامي؟", a: "ساميهادا" },
    { q: "من هو الهوكاغي الرابع لقرية كونوها؟", a: "ميناتو" },
    { q: "من هو العضو الحقيقي من الأوتشيها الذي كان يتخفى وراء قناع توبي؟", a: "أوبيتو" },
    { q: "ما اسم القرية المخفية التي ينتمي إليها الكازيكاجي غارا؟", a: "الرمل" },

    // ONE PIECE
    { q: "ما اسم طباخ طاقم قبعة القش المنحرف؟", a: "سانجي" },
    { q: "من هو سياف الشيبوكاي الأقوى الذي تدرب عنده زورو خلال السنتين؟", a: "ميهوك" },
    { q: "ما اسم السفينة الثانية الحالية لطاقم قبعة القش؟", a: "ثاوزند ساني" },
    { q: "من هو القرصان الذي أكل فاكهة الظلام وقتل اللحية البيضاء؟", a: "تيتش" },
    { q: "ما اسم الجزيرة المهجورة التي تدرب فيها لوفي لمدة عامين مع ريلي؟", a: "روسوكاينا" },
    { q: "ما اسم الأخ الأكبر المتبنى للوفي وإيس وقائد جيش الثوار الثاني؟", a: "سابو" },

    // ONE PIECE MANGA SPOILERS
    { q: "من هو الشخص الحقيقي الذي يجلس على العرش الفارغ ويحكم العالم سراً من الخفاء؟", a: "إيمو" },
    { q: "ما هو الاسم الحقيقي والقديم لفاكهة الشيطان الخاصةبلوفي (غومو غومو نو مي)؟", a: "هيتو هيتو نو مي نموذج نيكا" },
    { q: "من هو العالم العبقري الذي صنع السيرافيم ونسخ فواكه الشيطان لصالح حكومة العالم؟", a: "فيغابانك" },
    { q: "ما اسم القارة أو الجدار الجغرافي الضخم الذي يقسم عالم ون بيس إلى نصفين؟", a: "الخط الأحمر" },
    { q: "من هو قائد جيش الثوار الأسطوري والصديق القديم للعالم فيغابانك؟", a: "دراغون" },
    { q: "ما اسم الطاقم الأسطوري القديم الذي ضم اللحية البيضاء، كايدو، والبيغ مام قبل انفصالهم؟", a: "قراصنة روكس" },
    { q: "من هو قبطان قراصنة الروكس الذي تواجه مع روجر وغارب في حادثة وادي الآلهة？", a: "زيبك" },
    { q: "ما اسم الجزيرة الأخيرة والسرية التي وصل إليها غول دي روجر وأطلق منها اسم الون بيس؟", a: "لافتيل" },
    { q: "من هو ملك مملكة ألاباستا القديم الذي رفض أن يكون من التنانين السماوية العشرين؟", a: "نفرتاري كوبرا" },
    { q: "ما هو اللقب الفريد الذي يُطلق على الفرسان الأقوياء الذين يحمون إيمو ساما والتنانين السماوية؟", a: "الفرسان المقدسون" },
    { q: "ما اسم السلاح الأثري المرتبط بالحورية شيراهوشي وقدرتها على التحكم بملوك البحر؟", a: "بوسيدون" },
    { q: "من هو السياف الأسطوري من بلاد وانو الذي صنع سيف إنما وقام بجرح كايدو؟", a: "أودين" },
    { q: "ما اسم الأمير أو الحاكم الذي يقود عشيرة العمالقة في جزيرة إلباف؟", a: "لوكي" },
    { q: "من هو العضو في الجيروسي (الحكام الخمسة) المسؤول عن الشؤون العلمية والدفاعية؟", a: "ساتورن" },
    { q: "ما اسم الحقبة الزمنية أو القرن الذي ضاع من التاريخ وتمنع حكومة العالم البحث فيه؟", a: "القرن المفقود" },

    // ATTACK ON TITAN
    { q: "من هي الفتاة التي تمتلك قوة العملاق الأنثى؟", a: "آني" },
    { q: "ما اسم صديق إيرين الذي صدم الجميع بأنه هو العملاق المدرع؟", a: "راينر" },
    { q: "من هو الشخص الذي أكل والده غريشا ليحصل منه على قوة العملاق؟", a: "إيرين" },
    { q: "ما اسم السلاح المتطور الذي يستخدمه الجنود لقتل العمالقة؟", a: "المناورة ثلاثية الأبعاد" },
    { q: "من هي الفتاة التي اكتشفوا أنها ملكة الجدران الحقيقية واسمها الأصلي هيستوريا؟", a: "هيستوريا" },
    { q: "ما اسم القائد الأسطوري لفيلق الاستطلاع الذي مات في معركة شينغانشينا؟", a: "إروين" },

    // JUJUTSU KAISEN
    { q: "ما اسم تمديد المجال الأسطوري الخاص بغوجو ساتورو؟", a: "اللانهائية الفارغة" },
    { q: "ما اسم اللعنة الخاصة بالبراكين التي واجهت غوجو وسوكونا؟", a: "جوهو" },
    { q: "ما اسم التقنية القتالية الحسابية القوية الخاصة بنانامي؟", a: "النسبة 7:3" },
    { q: "من هو الساحر الأقوى الذي تمكن من قتل توجي فوشيغورو؟", a: "غوجو" },
    { q: "ما اسم الأداة الملعونة الخاصة بتوجي والتي تبطل التقنيات واستخدمتها ماكي؟", a: "الرمح المقلوب" },

    // DEMON SLAYER
    { q: "من هو الهاشيرا المعروف بلقب عمود الصوت؟", a: "تينغن" },
    { q: "ما اسم تنفس السرعة الوحيد الذي يتقنه زينيتسو؟", a: "الرعد" },
    { q: "من هي شيطانة القمر العلوي السادس التي واجهت تانجيرو في حي المتعة؟", a: "داكي" },
    { q: "ما اسم الغراب المتكلم الخاص بتانجيرو الذي يعطيه المهمات؟", a: "كاسوكابيه" },
    { q: "من هي الهاشيرا السابقة والأخت الكبرى لشينوبو كوتشو؟", a: "كاناي" },
    { q: "ما هي المادة المحددة التي تصنع منها سيوف النيتشيرين لقتل الشياطين؟", a: "رمل الحديد القرمزي وحصى الخام القرمزي" },

    // HUNTER X HUNTER
    { q: "ما اسم قدرة غون المرعبة التي استخدمها للتضحية بحياته ضد بيتو؟", a: "التحول البالغ" },
    { q: "من هو الزعيم الذكي والمؤسس لعصابة غينري ريودان (العنكبوت)؟", a: "كورولو" },
    { q: "من هو أفضل وأقرب صديق طفولة وكفاح لكيلوا زولدايك؟", a: "غون" },
    { q: "ما اسم الاختبار الصعب جداً الذي يمنح رخصة الصيد الدولية؟", a: "امتحان الصيادين" },
    { q: "من هو والد غون زولدايك الأسطوري الذي كان يبحث عنه؟", a: "جين" },
    { q: "ما هو اسم عائلة كيلوا الشهيرة بسلالة القتلة المأجورين؟", a: "زولدايك" },

    // BLEACH
    { q: "ما اسم الهولو الداخلي الأبيض الأسطوري الذي يعيش داخل إيتشيغو؟", a: "وايت" },
    { q: "من هو القائد المرعب والمتعطش للدماء للفرقة الحادية عشر (11)؟", a: "زاراكي" },
    { q: "ما اسم سيف الجليد الخاص بروكيا كوتشيكي؟", a: "سودي نو شيرويوكي" },
    { q: "من هو الشخص الأسطوري في الفرقة الصفرية الذي صنع جميع سيوف الزانباكتو؟", a: "أوشو" },
    { q: "ما اسم الحاكم الأعلى والشخصية المحورية في مجتمع الأرواح؟", a: "ملك الأرواح" },

    // DRAGON BALL
    { q: "ما اسم والد غوكو الحقيقي الذي مات أثناء تدمير كوكب السايان؟", a: "باردوك" },
    { q: "من هو إله الدمار الخاص بالكون السابع الذي يحب الطعام؟", a: "بيروس" },
    { q: "ما اسم الاندماج بالرقصة الشهير بين غوتين وترانكس الصغير؟", a: "غوتينكس" },
    { q: "من هو السياف القادم من المستقبل الذي قطع فريزا وقتله نهائياً أول مرة؟", a: "ترانكس" },
    { q: "ما اسم كوكب الموطن الأصلي لسلالة المحاربين السايانز؟", a: "فيجيتا" },

    // DEATH NOTE
    { q: "ما اسم الشينيغامي (إله الموت) الذي أسقط مذكرة الموت لعند لايت؟", a: "ريوك" },
    { q: "من هو رئيس الشرطة ووالد شخصية لايت ياغامي؟", a: "سويشيرو" },
    { q: "ما اسم الكتاب الأسود السحري الذي يقضي على الناس بكتابة أسمائهم؟", a: "مذكرة الموت" },
    { q: "ما هي المادة المفضلة التي كان ميلو مدمناً على تناولها طوال الوقت؟", a: "الشوكولاتة" },

    // TOKYO GHOUL, BERSERK, CHAINSAW MAN & GENERAL
    { q: "ما هو رقم الغرفة التي تم تعذيب كانيكي كين فيها على يد ياموري؟", a: "12" },
    { q: "ما اسم الشيطان الذي عقدت معه هيمينو صفقة للتضحية بعينها اليمين؟", a: "شيطان الشبح" },
    { q: "ما هو اسم السيف العملاق الأول الذي كان يستخدمه غاتس قبل أن يحصل على سيف قاتل التنانين؟", a: "سيف هجوم الفرسان" },
    { q: "كم عدد الأعضاء الجسدية التي سرقتها الشياطين من جسد هياكيمارو عند ولادته؟", a: "48" },
    { q: "من هو بطل ون بنش مان الأقوى الذي يقضي على خصومه بضربة واحدة؟", a: "سايتاما" },
    { q: "ما اسم الشيطان الثعلب الصغير الصديق في أنمي إينوياشا؟", a: "شيبو" }
];

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    if (!sock.authState.creds.registered) {
        console.log("--------------------------------------------------");
        const phoneNumber = await question("اكتب رقم هاتف البوت مع رمز الدولة (مثال: 212612345678): ");
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                console.log("\n==========================================");
                console.log(`🔐 كود الربط الخاص بك هو: ${code}`);
                console.log("==========================================\n");
            } catch (err) { console.log("حدث خطأ أثناء الاتصال: ", err); }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('🎉 OTAKU BOT Connected on Koyeb 🎉');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = msg.key.participant || msg.key.remoteJid;

        if (msg.key.id) deletedMessages[msg.key.id] = msg;

        const messageType = Object.keys(msg.message)[0];
        if (messageType === 'viewOnceMessageV2' || messageType === 'viewOnceMessage') {
            viewOnceMedia[from] = msg;
        }

        if (msg.key.fromMe) return;

        let text = "";
        if (messageType === 'conversation') text = msg.message.conversation;
        else if (messageType === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
        else if (messageType === 'imageMessage') text = msg.message.imageMessage.caption;
        else if (messageType === 'videoMessage') text = msg.message.videoMessage.caption;

        text = text ? text.trim() : "";

        // التحقق من إجابات الألعاب أولاً قبل فحص الأوامر
        if (gameSessions[from]) {
            const answer = text.toLowerCase().trim();
            if (answer === gameSessions[from].answer.toLowerCase().trim()) {
                pointsBank[sender] = (pointsBank[sender] || 0) + 100;
                await sock.sendMessage(from, { 
                    text: `🎉 إجابة صحيحة من @${sender.split('@')[0]}! لقد ربحت 100 نقطة من بنك الأوتاكو 💰.`, 
                    mentions: [sender] 
                });
                delete gameSessions[from];
                return;
            }
        }

        if (!text.startsWith('.')) return;

        const args = text.slice(1).split(" ");
        const command = args[0].toLowerCase();
        const value = args.slice(1).join(" ");

        const getGroupAdmins = async () => {
            if (!isGroup) return [];
            const meta = await sock.groupMetadata(from);
            return meta.participants.filter(p => p.admin !== null).map(p => p.id);
        };

        // ==========================================
        // 1. الأوامر العامة
        // ==========================================

        if (command === 'اوامر') {
            const menu = `╭━━━━━━━━━━━━━━╮
┃   👑  ＯＴＡＫＵ ＢＯＴ  👑   ┃
╰━━━━━━━━━━━━━━╯

╭━〔 一般 • الأوامر العامة 〕━╮
┃ ✧ .اوامر ↞ عرض القائمة
┃ ✧ .صورة ↞ صورة أنمي
┃ ✧ .اغنية ↞ تحميل mp3 / mp4 360p / mp4 720p
┃ ✧ .قوانين ↞ قوانين الجروب
┃ ✧ .ترحيب ↞ ترحيب بالأعضاء
┃ ✧ .s ↞ تحويل صورة إلى ملصق
┃ ✧ .سرقة_حقوق ↞ تغيير حقوق الملصقات
┃ ✧ .ترجمة ↞ ترجمة النصوص للعربية
┃ ✧ .بوت ↞ التحدث مع الذكاء الاصطناعي
╰━━━━━━━━━━━━━━━━━╯

╭━〔 ⚙️ الإدارة • أوامر المشرفين 〕━╮
┃ ✧ .ترقية ↞ ترقية عضو إلى أدمن
┃ ✧ .قفل / .فتح ↞ قفل وفتح الجروب
┃ ✧ .طرد↞ طرد من يسب الى اخر..
┃ ✧ .تفاعلوا ↞ منشن مخفي للجميع
┃ ✧ .فضح ↞ كشف ميديا العرض لمرة واحدة
┃ ✧ .إنذار / .عفو ↞ إدارة إنذارات الأعضاء
╰━━━━━━━━━╯

╭━〔 🎮 الألعاب • ساحة الترفيه 〕━╮
┃ ✧ .تفكيك ↞ لعبة تفكيك الكلمات
┃ ✧ .تخمين ↞ لعبة الأسئلة والأنمي
┃ ✧ .عين ↞ لعبة تخمين صاحب العيون
┃ ✧ .رتب ↞ لعبة ترتيب الحروف المبعثرة
┃ ✧ .خمن_الأوبنينغ ↞ تحدي معرفة أغاني الأنمي (فويس)
┃ ✧ .خمن_الشخصية ↞ لعبة تخمين شخصيات الأنمي
┃ ✧ .الزواج / .طلاق ↞ نظام الزواج والطلاق العشوائي
┃ ✧ .البنك ↞ عرض رصيد النقاط
┃ ✧ .إنذاراتي ↞ عرض الإنذارات الخاصة بك
╰━━━━━━━━━━━━━━━━━╯

╭━〔 🎙️ الأنمي • أصوات وميديا 〕━╮
┃ ✧ .قول ↞ جعل شخصيات الأنمي تنطق بنصك
┃ ✧ .اديت ↞ جلب فيديو إيديت ناضي للشخصية
╰━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: menu });
        }

        if (command === 'صورة') {
            try {
                const res = await axios.get('https://api.jikan.moe/v4/random/anime');
                const img = res.data.data.images.jpg.large_image_url;
                await sock.sendMessage(from, { image: { url: img }, caption: '✨ تفضل صورة الأنمي الخاصة بك!' });
            } catch {
                await sock.sendMessage(from, { text: '❌ تعذر جلب الصورة حالياً.' });
            }
        }

        if (command === 'اغنية') {
            await sock.sendMessage(from, { text: '🎵 *ميزة التحميل:* يرجى تزويد البوت برابط مباشر لتشغيله في الجروب، أو انتظر المطور لربط خوادم MP3/MP4.' });
        }

        if (command === 'قوانين') {
            await sock.sendMessage(from, { text: groupRules });
        }

        // ⚠️ تعديل أمر الترحيب لكي يرحب بالعضو المذكور (منشن) ⚠️
        if (command === 'ترحيب') {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (mentioned) {
                const welcome = `✨ *مـرحـبـاً بـك يـا بـطـل فـي الـمـجـمـوعـة* ✨\n━━━━━━━━━━━━━━━━━\n\n👋 أهلاً وسهلاً بك @${mentioned.split('@')[0]} وسط عشاق الأنمي والأوتاكو! \n\n📌 نتمنى لك وقتاً ممتعاً ومميزاً معنا، المرجو قراءة القوانين (.قوانين) لتفادي المشاكل. 🎉`;
                await sock.sendMessage(from, { text: welcome, mentions: [mentioned] });
            } else {
                await sock.sendMessage(from, { text: '❌ عافاك منشن العضو الجديد مورا أمر .ترحيب عشان أرحب بيه! مثال:\n`.ترحيب @العضو`' });
            }
        }

        if (command === 's') {
            const hasQuotedImage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
            const isImage = messageType === 'imageMessage';
            if (isImage || hasQuotedImage) {
                await sock.sendMessage(from, { text: '⏳ جاري تحويل الصورة إلى ملصق...' });
                const mediaMsg = hasQuotedImage ? msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage : msg.message.imageMessage;
                const stream = await downloadContentFromMessage(mediaMsg, 'image');
                let buffer = Buffer.from([]);
                for await(const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                
                const sticker = new Sticker(buffer, {
                    pack: '👑 OTAKU BOT 👑',
                    author: 'بوت الأنمي الخاص بي',
                    type: StickerTypes.FULL,
                    quality: 70
                });
                await sock.sendMessage(from, await sticker.toMessage());
            } else {
                await sock.sendMessage(from, { text: '❌ يرجى إرسال صورة وكتابة .s عليها، أو منشن صورة بـ .s' });
            }
        }

        if (command === 'سرقة_حقوق' || command === 'سرقة') {
            const hasQuotedSticker = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
            if (hasQuotedSticker) {
                const stream = await downloadContentFromMessage(msg.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage, 'sticker');
                let buffer = Buffer.from([]);
                for await(const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
                const packName = value || 'OTAKU BOT STICKERS';
                const sticker = new Sticker(buffer, {
                    pack: packName,
                    author: 'سرقة الحقوق بنجاح 💀',
                    type: StickerTypes.FULL
                });
                await sock.sendMessage(from, await sticker.toMessage());
            } else {
                await sock.sendMessage(from, { text: '❌ منشن ملصقاً واكتب .سرقة_حقوق [الاسم الجديد]' });
            }
        }

        if (command === 'ترجمة') {
            if (!value) return sock.sendMessage(from, { text: '❌ اكتب النص الذي تود ترجمته.' });
            try {
                const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(value)}`);
                await sock.sendMessage(from, { text: `🎯 *الترجمة للعربية:* \n\n ${res.data[0][0][0]}` });
            } catch {
                await sock.sendMessage(from, { text: '❌ تعذر الترجمة حالياً.' });
            }
        }

        if (command === 'بوت') {
            if (!value) return sock.sendMessage(from, { text: '❌ اسألني أي شيء لكي أجيبك.' });
            await sock.sendMessage(from, { text: `🤖 [ذكاء اصطناعي]: أهلاً بك! أنا بوت أوتاكو جاهز للرد ومساعدتك.` });
        }

        // ==========================================
        // 2. أوامر الإدارة (للمشرفين فقط)
        // ==========================================

        const adminCommands = ['ترقية', 'قفل', 'فتح', 'طرد', 'تفاعلوا', 'إنذار', 'عفو'];
        if (adminCommands.includes(command)) {
            if (!isGroup) return sock.sendMessage(from, { text: '❌ هاته الأوامر تعمل داخل المجموعات فقط!' });
            const admins = await getGroupAdmins();
            if (!admins.includes(sender)) return sock.sendMessage(from, { text: '❌ هاد الأمر خاص بالمشرفين فقط!' });

            if (command === 'ترقية') {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                if (mentioned) {
                    await sock.groupParticipantsUpdate(from, [mentioned], 'promote');
                    await sock.sendMessage(from, { text: '👑 تم ترقية العضو إلى مشرف بنجاح!' });
                } else {
                    await sock.sendMessage(from, { text: '❌ منشن العضو لترقيته.' });
                }
            }
            if (command === 'قفل') {
                await sock.groupSettingUpdate(from, 'announcement');
                await sock.sendMessage(from, { text: '🔒 تم قفل المجموعة (المشرفون فقط يرسلون).' });
            }
            if (command === 'فتح') {
                await sock.groupSettingUpdate(from, 'not_announcement');
                await sock.sendMessage(from, { text: '🔓 تم فتح المجموعة للجميع لإرسال الرسائل.' });
            }
            if (command === 'طرد') {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                if (mentioned) {
                    await sock.groupParticipantsUpdate(from, [mentioned], 'remove');
                    await sock.sendMessage(from, { text: '👋 تم طرد المشاغب بنجاح!' });
                } else {
                    await sock.sendMessage(from, { text: '❌ منشن العضو لطرده.' });
                }
            }
            if (command === 'تفاعلوا') {
                const meta = await sock.groupMetadata(from);
                const jids = meta.participants.map(p => p.id);
                await sock.sendMessage(from, { text: '📣 *تفاعلوا جميعاً من فضلكم! منشن جماعي!*', mentions: jids });
            }
            if (command === 'إنذار') {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                if (!mentioned) return sock.sendMessage(from, { text: '❌ منشن العضو لإنذاره.' });
                groupWarnings[mentioned] = (groupWarnings[mentioned] || 0) + 1;
                await sock.sendMessage(from, { text: `⚠️ تم إنذار العضو. مجموع إنذاراته: ${groupWarnings[mentioned]}/3` });
                if (groupWarnings[mentioned] >= 3) {
                    await sock.groupParticipantsUpdate(from, [mentioned], 'remove');
                    groupWarnings[mentioned] = 0;
                    await sock.sendMessage(from, { text: '🚫 تم طرد العضو آلياً لتخطي الحد المسموح من الإنذارات (3/3).' });
                }
            }
            if (command === 'عفو') {
                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                if (!mentioned) return sock.sendMessage(from, { text: '❌ منشن العضو للعفو عنه وتصفير إنذاراته.' });
                groupWarnings[mentioned] = 0;
                await sock.sendMessage(from, { text: '✅ تم إلغاء كل الإنذارات بنجاح.' });
            }
        }

        if (command === 'فضح') {
            const media = viewOnceMedia[from];
            if (!media) return sock.sendMessage(from, { text: '❌ لم يتم رصد أي ميديا عرض لمرة واحدة مؤخراً.' });
            const vMsg = media.message.viewOnceMessageV2?.message || media.message.viewOnceMessage?.message;
            const type = Object.keys(vMsg)[0];
            const stream = await downloadContentFromMessage(vMsg[type], type === 'imageMessage' ? 'image' : 'video');
            let buffer = Buffer.from([]);
            for await(const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            if (type === 'imageMessage') {
                await sock.sendMessage(from, { image: buffer, caption: '🔓 تم فضح ميديا العرض لمرة واحدة!' });
            } else {
                await sock.sendMessage(from, { video: buffer, caption: '🔓 تم فضح فيديو العرض لمرة واحدة!' });
            }
        }

        // ==========================================
        // 3. ساحة الألعاب والترفيه
        // ==========================================

        if (command === 'تفكيك') {
            const items = ['ميكاسا', 'غوكو', 'ناروتو', 'ساسكي', 'ليفاي', 'كانيكي', 'بليتش'];
            const chosen = items[Math.floor(Math.random() * items.length)];
            gameSessions[from] = { type: 't', answer: chosen };
            const shuffled = chosen.split('').sort(() => 0.5 - Math.random()).join(' - ');
            await sock.sendMessage(from, { text: `🎮 *لعبة التفكيك:*\nقم بجمع الحروف التالية لتركيب الاسم الصحيح:\n\n👉 *[ ${shuffled} ]*` });
        }

        if (command === 'تخمين') {
            const select = animeQuestions[Math.floor(Math.random() * animeQuestions.length)];
            gameSessions[from] = { type: 'g', answer: select.a };
            await sock.sendMessage(from, { text: `🎮 *سؤال في الأنمي (تخمين):*\n\n📌 *السؤال:* ${select.q}` });
        }

        if (command === 'عين') {
            gameSessions[from] = { type: 'e', answer: 'ساسكي' };
            await sock.sendMessage(from, { text: `🎮 *لعبة عين من هذه؟*\n(أجب باسم الشخصية صاحب هذه العين!) دليلك: الإجابة هي "ساسكي"` });
        }

        if (command === 'رتب') {
            const list = [{w: 'زورو', s: 'وروز'}, {w: 'نامي', s: 'يمان'}, {w: 'ايتاتشي', s: 'تيشاياي'}];
            const sel = list[Math.floor(Math.random() * list.length)];
            gameSessions[from] = { type: 'r', answer: sel.w };
            await sock.sendMessage(from, { text: `🎮 *لعبة ترتيب الحروف:*\nرتب هذه الحروف المبعثرة:\n\n👉 *[ ${sel.s} ]*` });
        }

        if (command === 'خمن_الأوبنينغ') {
            await sock.sendMessage(from, { text: '🎵 *تحدي الأوبنينغ:* (يرجى إرسال مقطع أوبنينغ عشوائي وسيبدأ التحدي بين الأعضاء!).' });
        }

        if (command === 'خمن_الشخصية') {
            gameSessions[from] = { type: 'c', answer: 'لوفي' };
            await sock.sendMessage(from, { text: `🎮 *لعبة خمن الشخصية:*\nشخصية من قراصنة قبعة القش تعشق اللحم فمن تكون؟` });
        }

        if (command === 'الزواج') {
            if (!isGroup) return;
            const meta = await sock.groupMetadata(from);
            const members = meta.participants.map(p => p.id).filter(id => id !== sender);
            if (members.length === 0) return;
            const partner = members[Math.floor(Math.random() * members.length)];
            marriageSystem[sender] = partner;
            await sock.sendMessage(from, { text: `💖 *نظام الزواج العشوائي* 💖\n\n🤵 @${sender.split('@')[0]} \n👰 @${partner.split('@')[0]} \n\nتم عقد القران بالبركة والرفاه! 🎉`, mentions: [sender, partner] });
        }

        if (command === 'طلاق') {
            if (marriageSystem[sender]) {
                const ex = marriageSystem[sender];
                delete marriageSystem[sender];
                await sock.sendMessage(from, { text: `💔 تم الطلاق رسمياً وبطلان زواجك من @${ex.split('@')[0]}!`, mentions: [ex] });
            } else {
                await sock.sendMessage(from, { text: '❌ أنت لست متزوجاً أصلاً!' });
            }
        }

        if (command === 'البنك') {
            const bal = pointsBank[sender] || 0;
            await sock.sendMessage(from, { text: `💰 رصيدك في البنك هو: *${bal} نقطة*.` });
        }

        if (command === 'إنذاراتي') {
            const warns = groupWarnings[sender] || 0;
            await sock.sendMessage(from, { text: `⚠️ عدد إنذاراتك الحالي: *${warns}/3*.` });
        }

        // ==========================================
        // 4. أصوات وميديا الأنمي
        // ==========================================

        if (command === 'قول') {
            if (!value) return sock.sendMessage(from, { text: '❌ اكتب النص الذي تريد أن تنطقه الشخصية.' });
            await sock.sendMessage(from, { text: `🎙️ قالت الشخصية بصوت هادئ ومؤثر: "${value}"` });
        }

        if (command === 'اديت') {
            await sock.sendMessage(from, { text: '⏳ جاري جلب فيديو إيديت ناضي...' });
            try {
                const res = await axios.get('https://raw.githubusercontent.com/A-S-K-A-R-I/Anime-Edits/main/edits.json');
                const edits = res.data;
                const randomEdit = edits[Math.floor(Math.random() * edits.length)];
                await sock.sendMessage(from, { video: { url: randomEdit }, caption: '🔥 إيديت ناضي وحصري!' });
            } catch {
                await sock.sendMessage(from, { text: '❌ فشل جلب الإيديت حالياً.' });
            }
        }

    });
}

startBot();
