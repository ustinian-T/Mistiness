export type FlowerItem = {
  month : number
  monthName : string
  flower : string
  godName : string
  dynasty : string
  poem : string
  keywords : string[]
  cultureImage : string
  dynastyStyle : string
  aiScript : string
}

export const MONTH_COLORS : string[] = [
  '#e8a0a0', '#f5c6a0', '#f5a0c0', '#c9a0e8',
  '#e85050', '#a0c8e8', '#e8c0a0', '#f5e0a0',
  '#b8d89a', '#e8b090', '#c8a8d8', '#a8c8e8',
]

export const KEYWORD_MAP : Record<string, string[]> = {
  '高洁': ['梅花', '荷花', '菊花'],
  '爱情': ['桃花', '杏花'],
  '隐逸': ['菊花'],
  '团圆': ['桂花'],
  '夏日': ['荷花'],
  '清冷': ['梅花'],
  '孤傲': ['梅花'],
  '春日': ['桃花', '杏花'],
  '相逢': ['桃花'],
  '温柔': ['杏花'],
  '明艳': ['桃花'],
  '华贵': ['芍药'],
  '浪漫': ['芍药'],
  '美人': ['芍药'],
  '开拓': ['榴花'],
  '热烈': ['榴花'],
  '丝路': ['榴花'],
  '君子': ['荷花'],
  '清净': ['荷花'],
  '赤诚': ['蜀葵'],
  '向阳': ['蜀葵'],
  '忠直': ['蜀葵'],
  '内敛': ['桂花'],
  '清雅': ['桂花', '山茶'],
  '自然': ['菊花'],
  '柔美': ['芙蓉'],
  '坚韧': ['芙蓉', '山茶'],
  '风华': ['芙蓉'],
  '自持': ['山茶'],
  '仙雅': ['水仙'],
  '空灵': ['水仙'],
}

export function getFlowerImage(month : number) : string {
  return `/static/images/flowers/${String(month).padStart(2, '0')}.jpg`
}

export function getGodImage(month : number) : string {
  return `/static/images/gods/${String(month).padStart(2, '0')}.jpg`
}

export const FLOWERS : FlowerItem[] = [
  {
    month: 1,
    monthName: '正月',
    flower: '梅花',
    godName: '林逋',
    dynasty: '北宋',
    poem: '疏影横斜水清浅，暗香浮动月黄昏',
    keywords: ['高洁', '清冷', '孤傲'],
    cultureImage: '寒梅临水、月下暗香，孤高隐逸、不染尘俗，兼具隐士淡泊风骨与文人清雅审美',
    dynastyStyle: '北宋诗文情理兼备，咏物常寄寓人格追求，语言清雅冲淡，兼具隐逸意趣与入世哲思',
    aiScript: '正月梅花是岁寒之首，花神林逋以"梅妻鹤子"传为佳话，写下疏影暗香的咏梅绝唱。同朝王安石、苏轼、黄庭坚均有传世咏梅名篇，北宋文人常将寒梅品性与文人风骨相融，于花木中寄寓人格追求，尽显清雅自持的宋代审美。',
  },
  {
    month: 2,
    monthName: '二月',
    flower: '杏花',
    godName: '陆游',
    dynasty: '南宋',
    poem: '小楼一夜听春雨，深巷明朝卖杏花',
    keywords: ['春日', '相逢', '温柔'],
    cultureImage: '春雨绵绵、巷陌杏花，江南市井闲适温柔，兼具日常烟火气与文人恬淡心境',
    dynastyStyle: '南宋诗词细腻婉约，多描摹江南风物与市井日常，于寻常景致中寄寓闲情与感怀，语言清新生动',
    aiScript: '二月杏花伴着江南春雨绽放，花神陆游以一夜春雨、深巷卖花勾勒出南宋市井的温柔烟火。同朝叶绍翁、范成大、杨万里均留下咏杏佳句，南宋文人偏爱从日常春景中捕捉诗意，尽显恬淡闲适的江南情调。',
  },
  {
    month: 3,
    monthName: '三月',
    flower: '桃花',
    godName: '息夫人',
    dynasty: '春秋',
    poem: '桃之夭夭，灼灼其华',
    keywords: ['爱情', '春日', '明艳'],
    cultureImage: '春日繁花、明艳盛放，关联女子青春与婚嫁喜事，是华夏最早的春日美好意象',
    dynastyStyle: '先秦诗歌质朴直白，多以草木起兴抒情，语言凝练厚重，承载上古礼乐文化与朴素人文情感',
    aiScript: '三月桃花盛放于仲春时节，花神息夫人的典故为桃花添上了温婉的人文底色。《诗经》中"桃之夭夭"传为尹吉甫采集、孔子编订，春秋时期的诗句质朴真挚，是华夏最早的春日花木诗意表达。',
  },
  {
    month: 4,
    monthName: '四月',
    flower: '芍药',
    godName: '杨玉环',
    dynasty: '唐代',
    poem: '云想衣裳花想容，春风拂槛露华浓',
    keywords: ['华贵', '浪漫', '美人'],
    cultureImage: '繁花华贵、美人相映，盛唐雍容富贵，以花喻人，尽显大唐宫廷美学与浪漫文风',
    dynastyStyle: '唐诗气象雍容开阔，辞藻华美浪漫，擅长以花木喻人抒怀，兼具宫廷华贵气韵与文人抒情张力',
    aiScript: '四月芍药雍容盛放，花神杨玉环与芍药的典故尽显盛唐华贵气象。李白写下"云想衣裳花想容"以花喻人，同朝白居易、王维、李商隐也多有吟咏花木的佳作，唐诗融繁花与美人为一体，尽显大唐浪漫雍容的文风。',
  },
  {
    month: 5,
    monthName: '五月',
    flower: '榴花',
    godName: '张骞',
    dynasty: '西汉',
    poem: '张骞使西域还，得安石榴、胡桃、蒲桃',
    keywords: ['开拓', '热烈', '丝路'],
    cultureImage: '仲夏火红、西域传入，见证汉代丝绸之路文化交流，兼具开拓精神与热烈生命力',
    dynastyStyle: '西汉文辞质朴写实，偏重史事记载与风物叙事，赋作辞藻宏丽，记录疆域开拓与物产交流',
    aiScript: '五月榴花如火盛放，花神张骞出使西域带回石榴树种，见证了汉代丝路开拓的历史。西汉司马相如、贾谊、扬雄的辞赋与史文尽显大汉宏阔气象，榴花也成为中西文明交融的独特花木符号。',
  },
  {
    month: 6,
    monthName: '六月',
    flower: '荷花',
    godName: '周敦颐',
    dynasty: '北宋',
    poem: '出淤泥而不染，濯清涟而不妖',
    keywords: ['高洁', '君子', '清净'],
    cultureImage: '淤泥生花、洁净自持，儒家君子品格核心象征，代表坚守本心、不与世俗同流合污',
    dynastyStyle: '北宋诗文重理趣与修身，咏物常蕴含儒家哲思，文风雅正通透，将君子品格寄寓于自然花木之中',
    aiScript: '六月荷花盛夏盛放，花神周敦颐以《爱莲说》定义了荷花"出淤泥而不染"的君子品格。同朝苏轼、欧阳修、范仲淹均有咏荷抒怀之作，北宋文人常以荷花喻修身立德的追求。',
  },
  {
    month: 7,
    monthName: '七月',
    flower: '蜀葵',
    godName: '徐渭',
    dynasty: '明代',
    poem: '丹心托向谁，画里向阳枝',
    keywords: ['赤诚', '向阳', '忠直'],
    cultureImage: '花枝向阳、赤诚本心，忠直热忱，兼具文人书画意境与坦荡热烈的生命追求',
    dynastyStyle: '明代诗文融合书画意趣，个性鲜明，常借花木抒发个人心志，写意感强，兼具文人狂放与细腻',
    aiScript: '七月蜀葵向阳而生，花神徐渭以画中向阳蜀葵寄托赤诚丹心。同代书画家唐寅、文徵明、沈周也常以花木入画入诗，明代文人多将书画意境融入诗文，借草木直抒胸臆，尽显坦荡热忱的文人底色。',
  },
  {
    month: 8,
    monthName: '八月',
    flower: '桂花',
    godName: '李清照',
    dynasty: '南宋',
    poem: '何须浅碧深红色，自是花中第一流',
    keywords: ['团圆', '内敛', '清雅'],
    cultureImage: '花香内敛、中秋团圆，清雅温润，推崇内在品格胜过外表艳丽，是南宋婉约词核心意象',
    dynastyStyle: '南宋诗词兼具婉约柔美与豪放风骨，咏物重内在品格，不尚浓艳，于清淡物象中寄寓家国情怀',
    aiScript: '八月桂花中秋飘香，花神李清照盛赞桂花"自是花中第一流"，推崇内敛不张扬的内在之美。同朝辛弃疾、姜夔、张孝祥也常以桂花抒怀，南宋文人咏花不重外形艳丽，更看重花木承载的品格与情志。',
  },
  {
    month: 9,
    monthName: '九月',
    flower: '菊花',
    godName: '陶渊明',
    dynasty: '东晋',
    poem: '采菊东篱下，悠然见南山',
    keywords: ['隐逸', '自然', '高洁'],
    cultureImage: '秋菊凌霜、田园归隐，淡泊自在，是华夏隐逸文化的核心符号，代表远离官场、亲近自然',
    dynastyStyle: '东晋诗文崇尚自然田园，文风冲淡质朴，追求隐逸自在的精神境界，开创山水田园诗的审美范式',
    aiScript: '九月秋菊凌霜而开，花神陶渊明以"采菊东篱下"奠定了菊花隐逸文化的内核。同代谢灵运、王羲之、孙绰均偏爱自然花木意象，东晋文人从自然中寻得精神归宿，尽显淡泊超然的魏晋风度。',
  },
  {
    month: 10,
    monthName: '十月',
    flower: '芙蓉',
    godName: '王昭君',
    dynasty: '西汉',
    poem: '有女同车，颜如舜华。将翱将翔，佩玉琼琚',
    keywords: ['柔美', '坚韧', '风华'],
    cultureImage: '秋木芙蓉、温婉柔美，女子风华，以花喻人，兼具少女的清丽与巾帼的坚韧风骨',
    dynastyStyle: '西汉诗歌温婉质朴，多以花木喻女子形貌与品格，兼具柔美与端方，承载先秦以来的诗教传统',
    aiScript: '十月木芙蓉深秋盛放，"舜华"即木芙蓉，《诗经》以其喻女子清丽容颜。花神王昭君为芙蓉赋予了柔美坚韧的风骨，西汉班婕妤、卓文君、刘向也常以花木喻人，尽显汉代温婉端方的审美气质。',
  },
  {
    month: 11,
    monthName: '十一月',
    flower: '山茶',
    godName: '王阳明',
    dynasty: '唐代',
    poem: '浮花惊鸿照影来',
    keywords: ['坚韧', '清雅', '自持'],
    cultureImage: '寒冬花开、轻盈坚韧，自持坚守，在百花凋零的冬季依然盛放，兼具清雅之姿与坚韧之心',
    dynastyStyle: '唐诗气韵灵动飘逸，咏物诗善用意象营造空灵意境，语言凝练传神，兼具画面感与抒情性',
    aiScript: '十一月山茶凌寒绽放，花影轻盈如惊鸿照水。唐代诗人刘禹锡、柳宗元、温庭筠均有吟咏耐寒花木的佳作，唐诗常以灵动笔触描摹花木姿态，借冬日盛放的山茶赞颂坚韧自持的品格，意境清雅悠远。',
  },
  {
    month: 12,
    monthName: '十二月',
    flower: '水仙',
    godName: '洛神',
    dynasty: '三国',
    poem: '翩若惊鸿，婉若游龙。凌波微步，罗袜生尘',
    keywords: ['仙雅', '空灵', '清冷'],
    cultureImage: '临水白花、空灵仙气，清冷飘逸，素净淡雅不染尘俗，是冬日独有的仙雅临水意象',
    dynastyStyle: '三国建安文学辞藻华美浪漫，气韵慷慨刚健，善写仙神意象与高远情志，兼具浪漫想象与雄浑风骨',
    aiScript: '十二月水仙临水而立，素净清雅如洛神凌波而来。曹植《洛神赋》写下"翩若惊鸿"的千古名句，同代曹操、曹丕的诗文则尽显建安风骨，三国文学融浪漫仙韵与雄浑气韵于一体，赋予水仙空灵不染的仙雅气质。',
  },
]

export function getFlowerByMonth(month : number) : FlowerItem | null {
  return FLOWERS.find(f => f.month === month) ?? null
}

export function getDynastyStats() : Map<string, number> {
  const stats = new Map<string, number>()
  for (const f of FLOWERS) {
    stats.set(f.dynasty, (stats.get(f.dynasty) ?? 0) + 1)
  }
  return stats
}

export function recommendByKeyword(keyword : string) : FlowerItem[] {
  const flowerNames = KEYWORD_MAP[keyword] ?? []
  return flowerNames
    .map(name => FLOWERS.find(f => f.flower === name))
    .filter(f => f != null) as FlowerItem[]
}

export const ALL_KEYWORDS : string[] = Object.keys(KEYWORD_MAP).sort()
