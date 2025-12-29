import {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    FIVE_ELEMENTS,
    ELEMENT_RELATIONS,
    TWO_HOUR_PERIODS,
    type ElementType
} from "./constants";

// 立春日计算
function getLichunDay(year: number) {
    if (year >= 2000 && year <= 2050) {
        const lichunDays = [
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        ];
        return lichunDays[year - 2000];
    }
    return Math.floor((year * 0.2422 + 3.87 - Math.floor(year * 0.2422 + 3.87)) * 31) + 4;
}

// 节气日计算
function getJieqiDay(year: number, month: number) {
    return Math.floor((year * 0.2422 + month * 2.08 - Math.floor(year * 0.2422 + month * 2.08)) * 31) + 6;
}

export function getYearGanZhi(date: Date) {
    let year = date.getFullYear();
    const lichunDay = getLichunDay(year);
    const lichunDate = new Date(year, 1, lichunDay); // Month is 0-indexed, so 1 is Feb
    if (date < lichunDate) {
        year -= 1;
    }
    let ganIndex = (year - 4) % 10;
    if (ganIndex < 0) ganIndex += 10;
    let zhiIndex = (year - 4) % 12;
    if (zhiIndex < 0) zhiIndex += 12;
    return {
        gan: HEAVENLY_STEMS[ganIndex],
        zhi: EARTHLY_BRANCHES[zhiIndex],
    };
}

export function getMonthGanZhi(date: Date, yearGan: string) {
    const month = date.getMonth() + 1;
    let lunarMonth = month;
    const lichunDay = getLichunDay(date.getFullYear());

    if (month === 2 && date.getDate() < lichunDay) {
        lunarMonth = 1;
    } else if (date.getDate() < getJieqiDay(date.getFullYear(), month)) {
        lunarMonth = month - 1 === 0 ? 12 : month - 1;
    }

    const yearGanIndex = HEAVENLY_STEMS.indexOf(yearGan as any);
    let monthGanBase = 0;
    if (yearGanIndex === 0 || yearGanIndex === 5) monthGanBase = 2; // 甲/己 -> 丙
    else if (yearGanIndex === 1 || yearGanIndex === 6) monthGanBase = 4; // 乙/庚 -> 戊
    else if (yearGanIndex === 2 || yearGanIndex === 7) monthGanBase = 6; // 丙/辛 -> 庚
    else if (yearGanIndex === 3 || yearGanIndex === 8) monthGanBase = 8; // 丁/壬 -> 壬
    else if (yearGanIndex === 4 || yearGanIndex === 9) monthGanBase = 0; // 戊/癸 -> 甲

    const monthGanIndex = (monthGanBase + lunarMonth - 1) % 10;
    const monthZhiIndex = (lunarMonth + 1) % 12;

    return {
        gan: HEAVENLY_STEMS[monthGanIndex],
        zhi: EARTHLY_BRANCHES[monthZhiIndex],
    };
}

export function getDayGanZhi(date: Date) {
    const baseDate = new Date(1900, 0, 31);
    const baseGanIndex = 0; // 甲
    const baseZhiIndex = 4; // 辰 (Wait, 1900-01-31 is slightly different, let's trust user algo first or verify)
    // User algo: baseDate 1900-01-31.

    const diffTime = date.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));

    let ganIndex = (baseGanIndex + diffDays) % 10;
    if (ganIndex < 0) ganIndex += 10;

    let zhiIndex = (baseZhiIndex + diffDays) % 12;
    if (zhiIndex < 0) zhiIndex += 12;

    return {
        gan: HEAVENLY_STEMS[ganIndex],
        zhi: EARTHLY_BRANCHES[zhiIndex],
    };
}

export function getHourGanZhi(date: Date, dayGan: string) {
    const hour = date.getHours();
    // Handle Early Rat (0-1) vs Late Rat (23-0). In GanZhi, day starts at 23:00 (Zi Hour).
    // But usually Day GanZhi changes at 23:00 or 00:00? 
    // Standard bazi changes day at 23:00. This code assumes date object is consistent.
    // The user's code:
    // if zhiIndex == -1 => (hour+1)/2 % 12.
    // Rat (Zi) is 23:00-01:00.

    let zhiIndex = -1;
    for (let i = 0; i < TWO_HOUR_PERIODS.length; i++) {
        if ((TWO_HOUR_PERIODS[i].hours as readonly number[]).includes(hour)) {
            zhiIndex = TWO_HOUR_PERIODS[i].zhiIndex;
            break;
        }
    }
    if (zhiIndex === -1) {
        zhiIndex = Math.floor((hour + 1) / 2) % 12;
    }

    const dayGanIndex = HEAVENLY_STEMS.indexOf(dayGan as any);
    let hourGanBase = -1;
    if (dayGanIndex === 0 || dayGanIndex === 5) hourGanBase = 0; // 甲/己 -> 甲
    else if (dayGanIndex === 1 || dayGanIndex === 6) hourGanBase = 2; // 乙/庚 -> 丙
    else if (dayGanIndex === 2 || dayGanIndex === 7) hourGanBase = 4; // 丙/辛 -> 戊
    else if (dayGanIndex === 3 || dayGanIndex === 8) hourGanBase = 6; // 丁/壬 -> 庚
    else if (dayGanIndex === 4 || dayGanIndex === 9) hourGanBase = 8; // 戊/癸 -> 壬

    const hourGanIndex = (hourGanBase + zhiIndex) % 10;

    return {
        gan: HEAVENLY_STEMS[hourGanIndex],
        zhi: EARTHLY_BRANCHES[zhiIndex],
    };
}

export function determineFortune(userElement: string, ganElement: string, zhiElement: string) {
    let fortune = "平"; // Default to Neutral?
    // Logic from user: 
    // if user == gan: Ji
    // if user generates gan: ? (user algo said: relations[user].generates == gan => Ji)
    // Let's copy exact logic.

    // User logic:
    // if (user == gan) Ji
    // else if (user generates gan) Ji
    // else if (user defeats gan) Ji  <-- This is interesting, usually "Me Controlling" is wealth/power = Good?
    // else if (gan defeats user) Xiong
    // if (user == zhi) Ji

    const relations = ELEMENT_RELATIONS as any;
    const userRel = relations[userElement];
    const ganRel = relations[ganElement];

    fortune = "凶"; // Default bad?

    if (userElement === ganElement) fortune = "吉";
    else if (userRel?.generates === ganElement) fortune = "吉";
    else if (userRel?.defeats === ganElement) fortune = "吉";
    else if (ganRel?.defeats === userElement) fortune = "凶";
    // Missing case: Gan generates User (Resource)? Usually Good. User code didn't handle it explicitly so it falls through.

    if (userElement === zhiElement) fortune = "吉";

    return fortune;
}

export function getFullGanZhi(date: Date) {
    const yearGZ = getYearGanZhi(date);
    const monthGZ = getMonthGanZhi(date, yearGZ.gan);
    const dayGZ = getDayGanZhi(date);
    // Note: For Hour GanZhi, we need Day Gan. 
    // However, is the Day GanZhi calculated based on 00:00 or 23:00?
    // User code uses `getDayGanZhi(dateToUse)` where dateToUse has current hours.
    // Standardly Day changes at 23:00 for Hour Pillar calculation purposes?
    // The user's code `getDayGanZhi` is purely based on 1900-01-31 and day difference. 
    // `Math.floor` on days implies 00:00 cut-off.
    // So we use that.

    const hourGZ = getHourGanZhi(date, dayGZ.gan);

    return {
        year: yearGZ,
        month: monthGZ,
        day: dayGZ,
        hour: hourGZ
    };
}

export function getElementColor(character: string) {
    if (!character) return "text-gray-600";

    // @ts-ignore
    const element = FIVE_ELEMENTS[character];
    if (!element) return "text-gray-600";

    // @ts-ignore
    const elementRelation = ELEMENT_RELATIONS[element];
    if (!elementRelation) return "text-gray-600";

    // Adjusted for Tailwind v4 or standard palette
    if (elementRelation.color === "gold") return "text-yellow-600";
    if (elementRelation.color === "brown") return "text-amber-900";

    return `text-${elementRelation.color}-600`;
}
