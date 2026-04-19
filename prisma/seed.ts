import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  // ============================================
  // ユーザー
  // ============================================

  // 管理者（園長）
  const admin = await prisma.user.create({
    data: { email: "admin@morisawa-hoiku.jp", password: hash, name: "森澤 健一", role: "ADMIN", phone: "090-1234-5678" },
  });

  // 保育士 4名
  const teacher1 = await prisma.user.create({
    data: { email: "tanaka@morisawa-hoiku.jp", password: hash, name: "田中 花子", role: "TEACHER", phone: "090-2345-6789" },
  });
  const teacher2 = await prisma.user.create({
    data: { email: "suzuki@morisawa-hoiku.jp", password: hash, name: "鈴木 美咲", role: "TEACHER", phone: "090-3456-7890" },
  });
  const teacher3 = await prisma.user.create({
    data: { email: "nakamura@morisawa-hoiku.jp", password: hash, name: "中村 あゆみ", role: "TEACHER", phone: "090-4567-8901" },
  });
  const teacher4 = await prisma.user.create({
    data: { email: "kobayashi@morisawa-hoiku.jp", password: hash, name: "小林 真理", role: "TEACHER", phone: "090-5678-9012" },
  });

  // 保護者 8名
  const parent1 = await prisma.user.create({
    data: { email: "yamada@example.com", password: hash, name: "山田 一郎", role: "PARENT", phone: "080-1111-2222" },
  });
  const parent1b = await prisma.user.create({
    data: { email: "yamada.yoko@example.com", password: hash, name: "山田 良子", role: "PARENT", phone: "080-1111-3333" },
  });
  const parent2 = await prisma.user.create({
    data: { email: "sato@example.com", password: hash, name: "佐藤 恵子", role: "PARENT", phone: "080-3333-4444" },
  });
  const parent3 = await prisma.user.create({
    data: { email: "takahashi@example.com", password: hash, name: "高橋 大輔", role: "PARENT", phone: "080-4444-5555" },
  });
  const parent4 = await prisma.user.create({
    data: { email: "watanabe@example.com", password: hash, name: "渡辺 麻衣", role: "PARENT", phone: "080-5555-6666" },
  });
  const parent5 = await prisma.user.create({
    data: { email: "ito@example.com", password: hash, name: "伊藤 健太", role: "PARENT", phone: "080-6666-7777" },
  });
  const parent6 = await prisma.user.create({
    data: { email: "kimura@example.com", password: hash, name: "木村 さやか", role: "PARENT", phone: "080-7777-8888" },
  });
  const parent7 = await prisma.user.create({
    data: { email: "hayashi@example.com", password: hash, name: "林 誠", role: "PARENT", phone: "080-8888-9999" },
  });
  const parent8 = await prisma.user.create({
    data: { email: "matsumoto@example.com", password: hash, name: "松本 裕美", role: "PARENT", phone: "080-9999-0000" },
  });

  // ============================================
  // クラス 3つ
  // ============================================
  const tulip = await prisma.class.create({
    data: { name: "ちゅうりっぷ組", ageGroup: "2歳児", year: 2026 },
  });
  const sakura = await prisma.class.create({
    data: { name: "さくら組", ageGroup: "3歳児", year: 2026 },
  });
  const himawari = await prisma.class.create({
    data: { name: "ひまわり組", ageGroup: "4歳児", year: 2026 },
  });

  // クラス担任
  await prisma.classTeacher.create({ data: { classId: tulip.id, teacherId: teacher3.id, role: "MAIN" } });
  await prisma.classTeacher.create({ data: { classId: tulip.id, teacherId: teacher4.id, role: "SUB" } });
  await prisma.classTeacher.create({ data: { classId: sakura.id, teacherId: teacher1.id, role: "MAIN" } });
  await prisma.classTeacher.create({ data: { classId: himawari.id, teacherId: teacher2.id, role: "MAIN" } });

  // ============================================
  // 園児 10名
  // ============================================
  const child1 = await prisma.child.create({
    data: { name: "山田 ゆい", nameKana: "ヤマダ ユイ", birthDate: "2023-03-15", gender: "女", classId: sakura.id, bloodType: "A" },
  });
  const child2 = await prisma.child.create({
    data: { name: "佐藤 はると", nameKana: "サトウ ハルト", birthDate: "2022-07-20", gender: "男", classId: himawari.id, bloodType: "O" },
  });
  const child3 = await prisma.child.create({
    data: { name: "高橋 あおい", nameKana: "タカハシ アオイ", birthDate: "2023-01-08", gender: "女", classId: sakura.id, bloodType: "B" },
  });
  const child4 = await prisma.child.create({
    data: { name: "渡辺 そうた", nameKana: "ワタナベ ソウタ", birthDate: "2022-11-25", gender: "男", classId: himawari.id, bloodType: "A" },
  });
  const child5 = await prisma.child.create({
    data: { name: "伊藤 ひなた", nameKana: "イトウ ヒナタ", birthDate: "2024-02-14", gender: "女", classId: tulip.id, bloodType: "AB" },
  });
  const child6 = await prisma.child.create({
    data: { name: "木村 れん", nameKana: "キムラ レン", birthDate: "2023-06-30", gender: "男", classId: sakura.id, bloodType: "O" },
  });
  const child7 = await prisma.child.create({
    data: { name: "林 みお", nameKana: "ハヤシ ミオ", birthDate: "2022-09-12", gender: "女", classId: himawari.id, bloodType: "A" },
  });
  const child8 = await prisma.child.create({
    data: { name: "松本 ゆうと", nameKana: "マツモト ユウト", birthDate: "2024-04-05", gender: "男", classId: tulip.id, bloodType: "B" },
  });
  const child9 = await prisma.child.create({
    data: { name: "山田 こはる", nameKana: "ヤマダ コハル", birthDate: "2024-08-18", gender: "女", classId: tulip.id, bloodType: "A",
      notes: "ゆいのお姉ちゃんと一緒に登園しています" },
  });
  const child10 = await prisma.child.create({
    data: { name: "高橋 りく", nameKana: "タカハシ リク", birthDate: "2022-05-01", gender: "男", classId: himawari.id, bloodType: "O",
      notes: "あおいの兄" },
  });

  // ============================================
  // 親子関係
  // ============================================
  // 山田家: parent1(父), parent1b(母) → child1(ゆい), child9(こはる)
  await prisma.childParent.create({ data: { childId: child1.id, parentId: parent1.id, relation: "父" } });
  await prisma.childParent.create({ data: { childId: child1.id, parentId: parent1b.id, relation: "母" } });
  await prisma.childParent.create({ data: { childId: child9.id, parentId: parent1.id, relation: "父" } });
  await prisma.childParent.create({ data: { childId: child9.id, parentId: parent1b.id, relation: "母" } });
  // 佐藤家
  await prisma.childParent.create({ data: { childId: child2.id, parentId: parent2.id, relation: "母" } });
  // 高橋家: parent3 → child3(あおい), child10(りく)
  await prisma.childParent.create({ data: { childId: child3.id, parentId: parent3.id, relation: "父" } });
  await prisma.childParent.create({ data: { childId: child10.id, parentId: parent3.id, relation: "父" } });
  // 渡辺家
  await prisma.childParent.create({ data: { childId: child4.id, parentId: parent4.id, relation: "母" } });
  // 伊藤家
  await prisma.childParent.create({ data: { childId: child5.id, parentId: parent5.id, relation: "父" } });
  // 木村家
  await prisma.childParent.create({ data: { childId: child6.id, parentId: parent6.id, relation: "母" } });
  // 林家
  await prisma.childParent.create({ data: { childId: child7.id, parentId: parent7.id, relation: "父" } });
  // 松本家
  await prisma.childParent.create({ data: { childId: child8.id, parentId: parent8.id, relation: "母" } });

  const allChildren = [child1, child2, child3, child4, child5, child6, child7, child8, child9, child10];

  // ============================================
  // アレルギー情報
  // ============================================
  await prisma.allergy.create({ data: { childId: child1.id, allergen: "卵", severity: "MODERATE", notes: "加熱済みは少量OK。生卵は完全除去" } });
  await prisma.allergy.create({ data: { childId: child1.id, allergen: "ピーナッツ", severity: "SEVERE", notes: "アナフィラキシーの既往あり。エピペン保管中" } });
  await prisma.allergy.create({ data: { childId: child4.id, allergen: "牛乳", severity: "MODERATE", notes: "乳製品全般。代替として豆乳を使用" } });
  await prisma.allergy.create({ data: { childId: child5.id, allergen: "小麦", severity: "MILD", notes: "少量なら問題なし。大量摂取で蕁麻疹" } });
  await prisma.allergy.create({ data: { childId: child8.id, allergen: "エビ・カニ", severity: "SEVERE", notes: "甲殻類全般NG。触れるだけでも発疹" } });

  // ============================================
  // 持病情報
  // ============================================
  await prisma.medicalInfo.create({
    data: { childId: child1.id, condition: "アトピー性皮膚炎", medication: "ヒルドイドソフト軟膏", hospital: "こどもクリニックさくら", doctorName: "大野 健一", doctorPhone: "03-1234-5678", notes: "乾燥が酷いときは塗布回数を増やす" },
  });
  await prisma.medicalInfo.create({
    data: { childId: child3.id, condition: "喘息", medication: "フルタイド吸入", hospital: "みどり小児科", doctorName: "青木 真理", doctorPhone: "03-2345-6789", notes: "季節の変わり目に悪化しやすい。運動時は注意" },
  });
  await prisma.medicalInfo.create({
    data: { childId: child7.id, condition: "熱性けいれん の既往", hospital: "中央総合病院 小児科", doctorName: "川島 正", doctorPhone: "03-3456-7890", notes: "38.5℃以上でダイアップ座薬使用。保管場所：職員室冷蔵庫" },
  });

  // ============================================
  // 緊急連絡先（全園児分）
  // ============================================
  const emergencyData = [
    { childId: child1.id, contacts: [
      { name: "山田 一郎", relation: "父", phone: "080-1111-2222", priority: 1 },
      { name: "山田 良子", relation: "母", phone: "080-1111-3333", priority: 2 },
      { name: "山田 キヨ", relation: "祖母（父方）", phone: "080-1111-4444", priority: 3 },
    ]},
    { childId: child2.id, contacts: [
      { name: "佐藤 恵子", relation: "母", phone: "080-3333-4444", priority: 1 },
      { name: "佐藤 剛", relation: "父", phone: "080-3333-5555", priority: 2 },
    ]},
    { childId: child3.id, contacts: [
      { name: "高橋 大輔", relation: "父", phone: "080-4444-5555", priority: 1 },
      { name: "高橋 亜希", relation: "母", phone: "080-4444-6666", priority: 2 },
    ]},
    { childId: child4.id, contacts: [
      { name: "渡辺 麻衣", relation: "母", phone: "080-5555-6666", priority: 1 },
      { name: "渡辺 翔太", relation: "父", phone: "080-5555-7777", priority: 2 },
    ]},
    { childId: child5.id, contacts: [
      { name: "伊藤 健太", relation: "父", phone: "080-6666-7777", priority: 1 },
      { name: "伊藤 彩", relation: "母", phone: "080-6666-8888", priority: 2 },
    ]},
    { childId: child6.id, contacts: [
      { name: "木村 さやか", relation: "母", phone: "080-7777-8888", priority: 1 },
      { name: "木村 拓也", relation: "父", phone: "080-7777-9999", priority: 2 },
    ]},
    { childId: child7.id, contacts: [
      { name: "林 誠", relation: "父", phone: "080-8888-9999", priority: 1 },
      { name: "林 由美", relation: "母", phone: "080-8888-0000", priority: 2 },
    ]},
    { childId: child8.id, contacts: [
      { name: "松本 裕美", relation: "母", phone: "080-9999-0000", priority: 1 },
      { name: "松本 大地", relation: "父", phone: "080-9999-1111", priority: 2 },
    ]},
    { childId: child9.id, contacts: [
      { name: "山田 一郎", relation: "父", phone: "080-1111-2222", priority: 1 },
      { name: "山田 良子", relation: "母", phone: "080-1111-3333", priority: 2 },
    ]},
    { childId: child10.id, contacts: [
      { name: "高橋 大輔", relation: "父", phone: "080-4444-5555", priority: 1 },
      { name: "高橋 亜希", relation: "母", phone: "080-4444-6666", priority: 2 },
    ]},
  ];

  for (const { childId, contacts } of emergencyData) {
    for (const c of contacts) {
      await prisma.emergencyContact.create({ data: { childId, ...c } });
    }
  }

  // ============================================
  // お迎え者
  // ============================================
  const pickupData = [
    { childId: child1.id, persons: [
      { name: "山田 一郎", relation: "父", phone: "080-1111-2222" },
      { name: "山田 良子", relation: "母", phone: "080-1111-3333" },
      { name: "山田 キヨ", relation: "祖母", phone: "080-1111-4444", notes: "金曜日のお迎え担当" },
    ]},
    { childId: child2.id, persons: [
      { name: "佐藤 恵子", relation: "母", phone: "080-3333-4444" },
      { name: "佐藤 剛", relation: "父", phone: "080-3333-5555" },
    ]},
    { childId: child3.id, persons: [
      { name: "高橋 大輔", relation: "父", phone: "080-4444-5555" },
      { name: "高橋 亜希", relation: "母", phone: "080-4444-6666" },
      { name: "高橋 節子", relation: "祖母", phone: "080-4444-7777" },
    ]},
    { childId: child5.id, persons: [
      { name: "伊藤 健太", relation: "父", phone: "080-6666-7777" },
      { name: "伊藤 彩", relation: "母", phone: "080-6666-8888" },
    ]},
    { childId: child6.id, persons: [
      { name: "木村 さやか", relation: "母", phone: "080-7777-8888" },
    ]},
    { childId: child8.id, persons: [
      { name: "松本 裕美", relation: "母", phone: "080-9999-0000" },
      { name: "松本 大地", relation: "父", phone: "080-9999-1111" },
    ]},
  ];

  for (const { childId, persons } of pickupData) {
    for (const p of persons) {
      await prisma.pickupPerson.create({ data: { childId, name: p.name, relation: p.relation, phone: p.phone, notes: (p as { notes?: string }).notes } });
    }
  }

  // ============================================
  // 出欠データ（本日 + 過去3日分）
  // ============================================
  const checkInTimes = ["07:45", "08:10", "08:25", "08:30", "08:40", "08:55", "09:00", "09:05", "09:10", "09:15"];
  const checkOutTimes = ["16:30", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "16:00", "17:20"];
  const checkInPeople = ["山田 一郎", "佐藤 恵子", "高橋 大輔", "渡辺 麻衣", "伊藤 彩", "木村 さやか", "林 誠", "松本 裕美", "山田 良子", "高橋 亜希"];

  for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
    const date = daysAgo(dayOffset);
    for (let i = 0; i < allChildren.length; i++) {
      // 1日につき1人は欠席（ランダムに）
      if (dayOffset > 0 && i === dayOffset + 2) continue;
      await prisma.attendance.create({
        data: {
          childId: allChildren[i].id,
          date,
          checkInTime: checkInTimes[i],
          checkInBy: checkInPeople[i],
          // 今日は午後まだの子がいる（最後の2人はまだ降園してない想定）
          checkOutTime: dayOffset === 0 && i >= 8 ? null : checkOutTimes[i],
          checkOutBy: dayOffset === 0 && i >= 8 ? null : checkInPeople[i],
          pickupPerson: dayOffset === 0 && i >= 8 ? null : checkInPeople[i],
        },
      });
    }
  }

  // ============================================
  // 連絡帳（今日と昨日分・複数の園児）
  // ============================================
  // 保護者からの連絡（今日の朝）
  const contactBookParentData = [
    { childId: child1.id, authorId: parent1.id, date: today(),
      homeMood: "GOOD", homeTemp: 36.4, homeMeal: "パン、バナナ、ヨーグルト", homeSleep: "21:00〜6:30", homeBowel: "あり（普通）", homeNotes: "昨夜少し咳が出ていましたが、今朝は元気です。" },
    { childId: child2.id, authorId: parent2.id, date: today(),
      homeMood: "NORMAL", homeTemp: 36.8, homeMeal: "おにぎり、味噌汁", homeSleep: "20:30〜7:00", homeBowel: "あり", homeNotes: "" },
    { childId: child3.id, authorId: parent3.id, date: today(),
      homeMood: "GOOD", homeTemp: 36.3, homeMeal: "食パン、スクランブルエッグ、牛乳", homeSleep: "21:30〜6:45", homeBowel: "なし", homeNotes: "喘息の薬は朝飲みました。" },
    { childId: child5.id, authorId: parent5.id, date: today(),
      homeMood: "BAD", homeTemp: 37.1, homeMeal: "おかゆ少量", homeSleep: "20:00〜5:30（夜中2回起きた）", homeBowel: "あり（軟便）", homeNotes: "少しぐずりがちです。こまめに水分補給をお願いします。" },
    { childId: child6.id, authorId: parent6.id, date: today(),
      homeMood: "GOOD", homeTemp: 36.5, homeMeal: "ご飯、卵焼き、みかん", homeSleep: "20:00〜7:00", homeBowel: "あり", homeNotes: "" },
  ];
  for (const d of contactBookParentData) {
    await prisma.contactBook.create({ data: d });
  }

  // 保育士からの連絡（昨日分）
  const contactBookTeacherData = [
    { childId: child1.id, authorId: teacher1.id, date: daysAgo(1),
      schoolMood: "GOOD", schoolTemp: 36.5, schoolMeal: "完食！カレーをおかわりしました", schoolSleep: "12:30〜14:30", schoolBowel: "1回（普通）", schoolActivity: "お絵描き、ブロック遊び", schoolNotes: "お友達と仲良く遊べていました。午後は絵本の読み聞かせに集中していました。" },
    { childId: child2.id, authorId: teacher2.id, date: daysAgo(1),
      schoolMood: "GOOD", schoolTemp: 36.6, schoolMeal: "ほぼ完食（野菜少し残し）", schoolSleep: "12:30〜14:00", schoolBowel: "なし", schoolActivity: "外遊び、砂場", schoolNotes: "園庭で元気いっぱいに走り回っていました。最近お友達に優しくできるようになりました。" },
    { childId: child3.id, authorId: teacher1.id, date: daysAgo(1),
      schoolMood: "NORMAL", schoolTemp: 36.4, schoolMeal: "2/3程度", schoolSleep: "12:30〜14:30", schoolBowel: "あり", schoolActivity: "粘土遊び、歌", schoolNotes: "午前中少し咳が出ていましたが、午後は落ち着いていました。" },
    { childId: child5.id, authorId: teacher3.id, date: daysAgo(1),
      schoolMood: "GOOD", schoolTemp: 36.3, schoolMeal: "完食", schoolSleep: "12:00〜14:30", schoolBowel: "2回", schoolActivity: "おままごと、積み木", schoolNotes: "ご機嫌で一日過ごせました。積み木を上手に積めるようになりました！" },
  ];
  for (const d of contactBookTeacherData) {
    await prisma.contactBook.create({ data: d });
  }

  // ============================================
  // タイムライン投稿（複数日分）
  // ============================================
  const timelinePosts = [
    { authorId: teacher1.id, content: "🎨 さくら組でお絵描きをしました！テーマは「わたしの家族」。みんなとても上手に描けました。お迎えの際にぜひ作品を見てあげてくださいね！", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { authorId: teacher2.id, content: "🌳 ひまわり組は園庭で春のお花探しをしました。たんぽぽ、チューリップ、パンジーを見つけて大喜び！はるとくんが「お花にお水あげたい！」と言ってジョウロを持ってきてくれました。", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { authorId: teacher3.id, content: "🧸 ちゅうりっぷ組の様子です。今日は新しい絵本「はらぺこあおむし」を読みました。ひなたちゃんがページをめくるたびに「あおむし〜！」と言っていて、とても可愛かったです。", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { authorId: teacher1.id, content: "🎵 今日はみんなで「チューリップ」を歌いました。さくら組のれんくんが振り付けを考えてくれて、みんなで踊りながら歌いました♪ とっても楽しかったです！", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { authorId: admin.id, content: "📸 先日の避難訓練の様子です。全クラスとも速やかに避難できました。避難完了まで3分12秒。前回より30秒短縮できました。保護者の皆さまもご家庭での防災対策の確認をお願いいたします。", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { authorId: teacher2.id, content: "🍳 今日の給食は子どもたちに大人気のカレーライスでした！ほぼ全員が完食、おかわりする子も続出でした。調理の先生方ありがとうございます✨", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000) },
  ];
  for (const p of timelinePosts) {
    const post = await prisma.timelinePost.create({ data: { authorId: p.authorId, content: p.content, createdAt: p.createdAt } });
    // いくつかにいいねをつける
    const likers = [parent1.id, parent2.id, parent3.id, parent4.id, parent5.id];
    const likeCount = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < likeCount; i++) {
      await prisma.timelineLike.create({ data: { postId: post.id, userId: likers[i] } });
    }
  }

  // タイムラインにコメント
  const firstPost = await prisma.timelinePost.findFirst({ orderBy: { createdAt: "desc" } });
  if (firstPost) {
    await prisma.timelineComment.create({ data: { postId: firstPost.id, authorId: parent1.id, content: "ゆいが家でも絵を描いていました！ありがとうございます😊" } });
    await prisma.timelineComment.create({ data: { postId: firstPost.id, authorId: parent6.id, content: "れんも「先生と絵を描いた」って嬉しそうに話してくれました！" } });
  }

  // ============================================
  // 欠席・遅刻連絡
  // ============================================
  await prisma.absenceReport.create({
    data: { childId: child4.id, parentId: parent4.id, date: today(), type: "ABSENT", reason: "発熱（38.2℃）のため休ませます。", confirmed: true },
  });
  await prisma.absenceReport.create({
    data: { childId: child7.id, parentId: parent7.id, date: today(), type: "LATE", reason: "通院のため遅れます", arrivalTime: "10:30", confirmed: true },
  });
  await prisma.absenceReport.create({
    data: { childId: child2.id, parentId: parent2.id, date: daysAgo(1), type: "EARLY_PICKUP", reason: "午後から歯医者の予約があります", pickupTime: "14:00", confirmed: true },
  });
  await prisma.absenceReport.create({
    data: { childId: child8.id, parentId: parent8.id, date: daysAgo(2), type: "ABSENT", reason: "家族の用事のためお休みします", confirmed: true },
  });
  // 未確認の連絡
  await prisma.absenceReport.create({
    data: { childId: child6.id, parentId: parent6.id, date: daysAgo(0), type: "EARLY_PICKUP", reason: "習い事のため15:30にお迎えに行きます", pickupTime: "15:30", confirmed: false },
  });

  // ============================================
  // お知らせ
  // ============================================
  const announcements = [
    { authorId: admin.id, title: "【重要】4月の行事予定について", content: "4月25日（金）に春の遠足を予定しています。\n\n場所：中央公園\n時間：9:30集合〜14:00解散\n持ち物：お弁当、水筒、レジャーシート、帽子、着替え\n\n雨天の場合は翌週月曜日に延期します。\n詳しいしおりは後日配布いたします。", category: "EVENT", pinned: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { authorId: admin.id, title: "【重要】5月の保育料について", content: "5月分の保育料の引き落とし日は5月7日（水）です。\n残高のご確認をお願いいたします。\n\nご不明点がございましたら事務室までお問い合わせください。", category: "IMPORTANT", pinned: false, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { authorId: teacher1.id, title: "さくら組だより 4月号", content: "保護者の皆さまへ\n\n新年度が始まりました。子どもたちも新しいクラスに少しずつ慣れてきました。\n\n今月のねらい：\n・新しいお友達や先生に親しみを持つ\n・春の自然に触れて楽しむ\n\n持ち物のお願い：\n・お着替え一式を常にロッカーに入れておいてください\n・汚れてもよい服装で登園をお願いします", category: "GENERAL", pinned: false, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { authorId: admin.id, title: "保護者参観日のご案内", content: "5月15日（木）に保護者参観を実施します。\n\n時間：10:00〜11:30\n内容：普段の保育の様子をご覧いただけます\n\n参加される方は4月末までにお知らせください。", category: "EVENT", pinned: false, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { authorId: admin.id, title: "感染症に関するお知らせ", content: "現在、市内で手足口病が流行しています。\n\n園でも予防対策を強化しておりますが、ご家庭でも以下の点にご注意ください：\n・手洗い・うがいの徹底\n・発熱や発疹がある場合は登園を控えてください\n・症状が見られた場合は速やかに医療機関を受診してください", category: "IMPORTANT", pinned: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ];
  for (const a of announcements) {
    const ann = await prisma.announcement.create({ data: { authorId: a.authorId, title: a.title, content: a.content, category: a.category, pinned: a.pinned, createdAt: a.createdAt } });
    // いくつかに既読をつける
    const readers = [parent1.id, parent2.id, parent3.id, parent4.id, parent5.id];
    const readCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < readCount; i++) {
      await prisma.readReceipt.create({ data: { announcementId: ann.id, userId: readers[i] } });
    }
  }

  // ============================================
  // 行事カレンダー（4月〜5月）
  // ============================================
  const events = [
    { title: "入園式・始業式", description: "新年度スタートです。", date: "2026-04-01", startTime: "10:00", endTime: "11:30", location: "ホール", category: "EVENT" },
    { title: "身体測定（ちゅうりっぷ組）", description: "身長・体重を測定します。", date: "2026-04-14", category: "HEALTH_CHECK" },
    { title: "身体測定（さくら組・ひまわり組）", description: "身長・体重を測定します。", date: "2026-04-15", category: "HEALTH_CHECK" },
    { title: "避難訓練", description: "地震を想定した避難訓練を行います。", date: "2026-04-18", startTime: "10:30", category: "EVENT" },
    { title: "春の遠足", description: "中央公園へ遠足に行きます。お弁当・水筒を持参してください。雨天の場合は4/28に延期。", date: "2026-04-25", startTime: "09:30", endTime: "14:00", location: "中央公園", category: "EVENT" },
    { title: "誕生会（4月生まれ）", description: "4月生まれのお友達をお祝いします。", date: "2026-04-28", startTime: "10:00", endTime: "11:00", location: "ホール", category: "EVENT" },
    { title: "昭和の日", date: "2026-04-29", category: "HOLIDAY" },
    { title: "こどもの日イベント", description: "こいのぼり制作をした作品をお披露目します。", date: "2026-05-02", startTime: "10:00", location: "各教室", category: "EVENT" },
    { title: "こどもの日", date: "2026-05-05", category: "HOLIDAY" },
    { title: "振替休日", date: "2026-05-06", category: "HOLIDAY" },
    { title: "内科健診", description: "園医による内科健診を行います。", date: "2026-05-12", startTime: "13:30", endTime: "15:00", category: "HEALTH_CHECK" },
    { title: "保護者参観", description: "保護者の皆様に普段の保育をご覧いただきます。", date: "2026-05-15", startTime: "10:00", endTime: "11:30", location: "各教室", category: "EVENT" },
    { title: "歯科検診", description: "歯科医による検診。", date: "2026-05-20", startTime: "10:00", category: "HEALTH_CHECK" },
    { title: "誕生会（5月生まれ）", description: "5月生まれのお友達をお祝いします。", date: "2026-05-26", startTime: "10:00", location: "ホール", category: "EVENT" },
  ];
  for (const ev of events) {
    await prisma.event.create({
      data: { title: ev.title, description: ev.description || null, date: ev.date, startTime: ev.startTime || null, endTime: ev.endTime || null, location: ev.location || null, category: ev.category, allDay: !ev.startTime },
    });
  }

  // ============================================
  // 健康記録（過去数日分）
  // ============================================
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = daysAgo(dayOffset);
    for (const child of allChildren) {
      const baseTemp = 36.2 + Math.random() * 0.8;
      await prisma.healthRecord.create({
        data: {
          childId: child.id, date, recordedById: teacher1.id,
          temperature: Math.round(baseTemp * 10) / 10,
          notes: baseTemp > 37.3 ? "微熱あり。経過観察中" : undefined,
        },
      });
    }
  }
  // 身体測定データ
  const bodyData = [
    { child: child1, weight: 14.2, height: 95.3 },
    { child: child2, weight: 16.8, height: 103.5 },
    { child: child3, weight: 13.5, height: 93.8 },
    { child: child4, weight: 17.1, height: 105.2 },
    { child: child5, weight: 11.3, height: 85.6 },
    { child: child6, weight: 14.8, height: 96.1 },
    { child: child7, weight: 15.9, height: 101.0 },
    { child: child8, weight: 12.0, height: 87.4 },
    { child: child9, weight: 10.5, height: 78.2 },
    { child: child10, weight: 17.5, height: 106.8 },
  ];
  for (const d of bodyData) {
    await prisma.healthRecord.create({
      data: { childId: d.child.id, date: "2026-04-15", recordedById: teacher1.id, weight: d.weight, height: d.height, temperature: 36.4 },
    });
  }

  // ============================================
  // 午睡チェック（今日の分）
  // ============================================
  const napTimes = ["12:35", "12:40", "12:45", "12:50", "12:55", "13:00", "13:05", "13:10", "13:15", "13:20",
                    "13:05", "13:10", "13:15", "13:20", "13:25", "13:30", "13:35", "13:40", "13:45", "13:50"];
  const positions = ["FACE_UP", "FACE_UP", "LEFT", "FACE_UP", "RIGHT", "FACE_UP", "FACE_UP", "LEFT", "FACE_UP", "FACE_UP",
                     "FACE_UP", "RIGHT", "FACE_UP", "FACE_UP", "FACE_UP", "LEFT", "FACE_UP", "FACE_UP", "RIGHT", "FACE_UP"];
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < allChildren.length; i++) {
      const idx = round * 10 + i;
      await prisma.napCheck.create({
        data: {
          childId: allChildren[i].id, date: today(), time: napTimes[idx],
          checkedById: i < 4 ? teacher1.id : i < 7 ? teacher2.id : teacher3.id,
          position: positions[idx], breathing: "NORMAL",
        },
      });
    }
  }

  // ============================================
  // シフト（今週分）
  // ============================================
  const teachers = [teacher1, teacher2, teacher3, teacher4];
  const shiftPatterns = [
    { type: "EARLY", start: "07:00", end: "16:00" },
    { type: "NORMAL", start: "08:30", end: "17:30" },
    { type: "LATE", start: "10:00", end: "19:00" },
  ];
  for (let dayOffset = -2; dayOffset <= 5; dayOffset++) {
    const date = daysAgo(-dayOffset); // 未来も含む
    for (let i = 0; i < teachers.length; i++) {
      const pattern = shiftPatterns[(i + dayOffset + 10) % 3]; // ローテーション
      await prisma.shift.create({
        data: {
          teacherId: teachers[i].id, date, startTime: pattern.start, endTime: pattern.end, shiftType: pattern.type as string,
        },
      });
    }
  }

  // ============================================
  // 緊急一斉連絡（過去の例）
  // ============================================
  await prisma.emergencyBroadcast.create({
    data: {
      authorId: admin.id, title: "台風接近に伴う臨時休園のお知らせ",
      content: "明日4月20日（月）は台風15号の接近に伴い、臨時休園といたします。\n\n登園はされないようお願いいたします。翌日の開園については改めてご連絡いたします。\n\nご不便をおかけしますが、安全のためご理解ください。",
      severity: "CRITICAL", isActive: false, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.emergencyBroadcast.create({
    data: {
      authorId: admin.id, title: "本日の給食メニュー変更のお知らせ",
      content: "本日の給食で予定していた「エビフライ」ですが、食材の入荷が遅れたため「鶏の唐揚げ」に変更いたします。\n\nアレルギー対応食については変更ありません。ご了承ください。",
      severity: "INFO", isActive: false, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ シードデータの投入が完了しました！");
  console.log("");
  console.log("📋 テストアカウント（パスワード: password123）");
  console.log("  管理者: admin@morisawa-hoiku.jp");
  console.log("  保育士: tanaka@morisawa-hoiku.jp / suzuki@morisawa-hoiku.jp");
  console.log("  保護者: yamada@example.com（山田ゆい・こはるの父）");
  console.log("         sato@example.com（佐藤はるとの母）");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
