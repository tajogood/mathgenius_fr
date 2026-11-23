/**
 * 2022 revised Korean elementary math achievement STANDARD IDENTIFIERS.
 * 29 (grades 1-2) + 47 (3-4) + 45 (5-6) = 121 identifiers.
 *
 * The associations below are chapter-index mappings, not certified standards mastery.
 * A chapter can introduce a standard without teaching every sub-skill within it.
 *
 * Source of standard identifiers: MOE Notice 2022-33, Annex 8.
 * Grade-semester unit organization is textbook-style and can vary by publisher.
 */
export type StandardIndex = {
  id: string;
  band: '1~2학년' | '3~4학년' | '5~6학년';
  chapterIds: string[];
};

const MAPPING: Record<string, string[]> = {
  // 1~2학년군 / 수와 연산 (11)
  '2수01': [
    '1-1-1,1-1-5,1-2-1','2-1-1,2-2-1','1-1-4,2-2-1','1-1-3,1-2-2',
    '1-1-3,1-2-2,1-2-4','2-1-3,1-2-6','1-2-6','1-2-6','1-2-6',
    '2-1-6','2-2-2',
  ],
  // 변화와 관계 (2)
  '2수02':['1-2-5,2-2-6','2-2-6'],
  // 도형과 측정 (13)
  '2수03':[
    '1-1-2','1-1-2','1-2-3','1-2-3','2-1-2','1-1-4',
    '1-2-5,2-2-4','2-2-4','2-2-4','2-1-4','2-1-4','2-2-3','2-2-3',
  ],
  // 자료와 가능성 (3)
  '2수04':['2-1-5','2-2-5','2-2-5'],

  // 3~4학년군 / 수와 연산 (16)
  '4수01':[
    '4-1-1','4-1-1','3-1-1','3-1-4,3-2-1,4-1-3',
    '3-1-3','3-2-2','4-1-3','4-1-3',
    '3-1-6','3-2-4','3-2-4',
    '3-1-6','3-1-6','3-1-6',
    '4-2-1','4-2-3',
  ],
  // 변화와 관계 (3)
  '4수02':['4-1-6','4-1-6','4-1-6'],
  // 도형과 측정 (25)
  '4수03':[
    '3-1-2','3-1-2','3-1-2','4-1-4','4-1-4',
    '3-2-3','3-2-3','4-2-2','4-2-2','4-2-4',
    '4-2-6','4-2-6','3-1-5','3-1-5','3-1-5',
    '3-1-5','3-2-5','3-2-5','3-2-5','3-2-5',
    '3-2-5','3-2-5','3-2-5','4-1-2','4-1-2',
  ],
  // 자료와 가능성 (3)
  '4수04':['4-1-5','4-2-5','3-2-6,4-1-5,4-2-5'],

  // 5~6학년군 / 수와 연산 (15)
  '6수01':[
    '5-1-1','5-2-1','5-2-1',
    '5-1-2','5-1-2','5-1-4','5-1-4',
    '5-1-5','5-2-2','6-1-1',
    '6-1-1,6-2-1','5-1-4','5-2-4',
    '6-1-3','6-1-3,6-2-2',
  ],
  // 변화와 관계 (5)
  '6수02':['5-1-3','6-1-4','6-1-4','6-2-4','6-2-4'],
  // 도형과 측정 (19)
  '6수03':[
    '5-2-3','5-2-3','5-2-5','5-2-5','6-1-2',
    '6-1-2','6-2-6','6-2-6','6-2-3','6-2-3',
    '5-1-6','5-1-6','5-1-6','5-1-6',
    '6-2-5','6-2-5','6-1-6','6-1-6','6-1-6',
  ],
  // 자료와 가능성 (6)
  '6수04':[
    '5-2-6','6-1-5','6-1-5','5-2-6','5-2-6','5-2-6',
  ],
};

export const achievementStandards: StandardIndex[] = Object.entries(MAPPING).flatMap(([prefix,refs])=>{
  const band: StandardIndex['band'] = prefix[0]==='2'?'1~2학년':prefix[0]==='4'?'3~4학년':'5~6학년';
  return refs.map((unitIds,i)=>({
    id:prefix+'-'+String(i+1).padStart(2,'0'),
    band,
    chapterIds:unitIds.split(','),
  }));
});

export const STANDARDS_TOTAL=achievementStandards.length;
export const standardsForChapter=(unitId:string): StandardIndex[] =>
  achievementStandards.filter(standard=>standard.chapterIds.includes(unitId));

if(STANDARDS_TOTAL!==121) throw new Error('Expected 121 achievement standards; got '+STANDARDS_TOTAL);
