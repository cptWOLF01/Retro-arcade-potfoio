export const TOP = ['...hhhh...', '..hhhhhh..', '..hssssh..', '..skssks..', '..ssssss..', '...ssss...', '..wwwwww..', '.wwwwwwww.', '.swwwwwws.', '.swwwwwws.', '..wwwwww..', '..bbbbbb..', '..bbbbbb..']
export const LEGS = { idle: ['..bb..bb..', '..ss..ss..', '..kk..kk..'], a: ['.bbb..bbb.', '.ss....ss.', '.kk....kk.'], b: ['...bbbb...', '...ssss...', '...kkkk...'] }
export const FR = Object.fromEntries(Object.entries(LEGS).map(([k, v]) => [k, [...TOP, ...v]]))
export const PAL = { h: '#111', s: '#f2c29b', k: '#111', w: '#fff', b: '#2b6cff' }
export const OUT = { h: '#0b1020', s: '#0b1020', k: '#0b1020', w: '#0b1020', b: '#0b1020' }

export const ITEMS = {
  ball: { name: 'FOOTBALL', rows: ['..kkkk..', '.kwwwwk.', 'kwwkkwwk', 'kwkkkkwk', 'kwkkkkwk', 'kwwkkwwk', '.kwwwwk.', '..kkkk..'], pal: { k: '#0b1020', w: '#fff' } },
  laptop: { name: 'LAPTOP', rows: ['.kkkkkkk.', '.kbbbbbk.', '.kbbbbbk.', '.kbbbbbk.', '.kkkkkkk.', 'kkkkkkkkk', '.kkkkkkk.'], pal: { k: '#0b1020', b: '#2bb5ff' } },
  coffee: { name: 'COFFEE', rows: ['.s..s...', '..s..s..', 'kkkkkk..', 'kccccckk', 'kccccckk', 'kccccck.', '.kccck..', '..kkk...'], pal: { k: '#0b1020', c: '#8a4b1e', s: '#fff' } },
}
export const POWER = ['ball', 'laptop', 'coffee']

export const STAR = ['....y....', '....y....', '...yyy...', 'yyyyyyyyy', '.yyyyyyy.', '..yyyyy..', '..yyyyy..', '.yyy.yyy.', '.yy...yy.']
export const TROPHY = [
  '.yyyyyyyyyyyy.', 'yy.lyyyyyyy.yy', 'y..lyyyyyyy..y', 'y..lyyywwyy..y', 'yy.lyyywwyy.yy', '.yyyyyyyyyyyy.',
  '..yyyyyyyyyy..', '...yyyyyyyy...', '.....yyyy.....', '......yy......', '......yy......', '.....yyyy.....', '....yyyyyy....', '...dddddddd...', '...dddddddd...',
]
export const HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']
