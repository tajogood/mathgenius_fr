import type { Problem } from '../math';
import { fractionText, gcd, percentage } from '../math';

type Props = { problem: Problem; phase: 'concept' | 'question' | 'solution'; step: number };
const tint = '#657fe7';
const warm = '#f4ad66';

function Dots({ amount, color = 'blue', crossed = 0 }: { amount: number; color?: 'blue' | 'orange'; crossed?: number }) {
  return <div className="practice-dots" role="img" aria-label={amount + '개의 블록'}>
    {Array.from({ length: amount }, (_, i) =>
      <span key={i} className={'practice-dot practice-dot--' + color +
        (i >= amount - crossed ? ' practice-dot--crossed' : '')} />)}
  </div>;
}

function Groups({ pieces, count }: { pieces: number; count: number }) {
  return <div className="practice-groups">{Array.from({ length: count }, (_, i) =>
    <div className="practice-group" key={i}><Dots amount={pieces} color={i % 2 === 0 ? 'blue' : 'orange'} /></div>)}</div>;
}

/** 모든 분수 막대는 같은 전체 폭을 사용합니다. 등분선은 색칠 위에 그립니다. */
function SegmentedBar({ n, d, color = tint }: { n: number; d: number; color?: string }) {
  const full = 352, fraction = Math.max(0, Math.min(n / d, 1));
  return <svg className="practice-bar" viewBox="0 0 360 58" preserveAspectRatio="none"
    role="img" aria-label={d + '등분 중 ' + n + '개가 색칠된 막대'}>
    <rect x="4" y="4" width={full} height="48" rx="7" fill="#fff" />
    <rect x="4" y="4" width={full * fraction} height="48" fill={color} />
    {Array.from({ length: d - 1 }, (_, i) => {
      const x = 4 + full * (i + 1) / d;
      return <path key={i} d={'M ' + x + ' 5 V 51'} stroke="#51618b" strokeDasharray="5 4" strokeWidth="1.8" />;
    })}
    <rect x="4" y="4" width={full} height="48" rx="7" stroke="#aebcdb" strokeWidth="2.4" fill="none" />
  </svg>;
}

function Shapes({ shape }: { shape: number }) {
  return <svg viewBox="0 0 250 180" className="practice-illustration" role="img" aria-label="문제의 도형">
    <defs><linearGradient id="shapeFill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9eb1ff" /><stop offset="1" stopColor="#667de5" /></linearGradient></defs>
    {shape === 0 ? <circle cx="125" cy="90" r="65" fill="url(#shapeFill)" stroke="#5264bb" strokeWidth="3" />
      : shape === 1 ? <polygon points="125,18 55,155 195,155" fill="url(#shapeFill)" stroke="#5264bb" strokeWidth="3" strokeLinejoin="round" />
        : shape === 2 ? <rect x="61" y="27" width="128" height="128" rx="5" fill="url(#shapeFill)" stroke="#5264bb" strokeWidth="3" />
          : <rect x="30" y="48" width="190" height="95" rx="5" fill="url(#shapeFill)" stroke="#5264bb" strokeWidth="3" />}
  </svg>;
}

function Clock({ hour, minutes }: { hour: number; minutes: number }) {
  const rad = Math.PI / 180;
  const minuteAngle = minutes * 6 * rad, hourAngle = ((hour % 12) * 30 + minutes / 2) * rad;
  const cx = 130, cy = 130;
  return <svg viewBox="0 0 260 260" className="practice-clock" role="img" aria-label="긴 바늘과 짧은 바늘이 가리키는 아날로그 시계">
    <circle cx={cx} cy={cy} r="115" fill="#fff" stroke="#b7c7ef" strokeWidth="5" />
    {Array.from({ length: 60 }, (_, i) => {
      const r = i * 6 * rad, long = i % 5 === 0;
      return <line key={i}
        x1={cx + (long ? 100 : 105) * Math.sin(r)}
        y1={cy - (long ? 100 : 105) * Math.cos(r)}
        x2={cx + 111 * Math.sin(r)} y2={cy - 111 * Math.cos(r)}
        stroke="#8492b7" strokeWidth={long ? 2.4 : 1} />;
    })}
    {Array.from({ length: 12 }, (_, i) => {
      const value = i + 1, r = value * 30 * rad;
      return <text key={value} x={cx + 86 * Math.sin(r)} y={cy - 86 * Math.cos(r) + 5}
        textAnchor="middle" fill="#46587c" fontSize="16" fontWeight="800">{value}</text>;
    })}
    <line x1={cx} y1={cy} x2={cx + 57 * Math.sin(hourAngle)} y2={cy - 57 * Math.cos(hourAngle)}
      stroke="#f5a95f" strokeWidth="9" strokeLinecap="round" />
    <line x1={cx} y1={cy} x2={cx + 78 * Math.sin(minuteAngle)} y2={cy - 78 * Math.cos(minuteAngle)}
      stroke="#5469d5" strokeWidth="5" strokeLinecap="round" />
    <circle cx={cx} cy={cy} r="9" fill="#465dbd" />
    <text x={cx} y="258" fill="#8793ad" fontSize="10" textAnchor="middle">주황: 시침 · 파랑: 분침</text>
  </svg>;
}

function Angle({ degrees }: { degrees: number }) {
  const cx = 145, cy = 158, r = 108, a = degrees * Math.PI / 180;
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  const arcR = 47;
  const arcX = cx + arcR * Math.cos(a), arcY = cy - arcR * Math.sin(a);
  return <svg viewBox="0 0 290 205" className="practice-illustration" role="img" aria-label="기준선과 회전한 선 사이의 각">
    <path d={'M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy}
      stroke="#dfe5f7" strokeWidth="2" fill="none" />
    {Array.from({ length: 13 }, (_, i) => {
      const angle = i * 15 * Math.PI / 180;
      const inner = i % 3 === 0 ? 92 : 99;
      return <line key={i} x1={cx + inner * Math.cos(angle)} y1={cy - inner * Math.sin(angle)}
        x2={cx + r * Math.cos(angle)} y2={cy - r * Math.sin(angle)}
        stroke="#bac8e3" strokeWidth={i % 3 === 0 ? 2 : 1} />;
    })}
    <path d={'M ' + (cx + arcR) + ' ' + cy + ' A ' + arcR + ' ' + arcR + ' 0 0 0 ' + arcX + ' ' + arcY}
      fill="none" stroke="#f1ad68" strokeWidth="6" strokeLinecap="round" />
    <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#5b6fda" strokeWidth="6" strokeLinecap="round" />
    <line x1={cx} y1={cy} x2={x} y2={y} stroke="#5b6fda" strokeWidth="6" strokeLinecap="round" />
    <circle cx={cx} cy={cy} r="6" fill="#4b5fc4" />
    <text x={cx + 51} y={cy - 10} fontSize="22" fontWeight="900" fill="#e6a052">?</text>
  </svg>;
}

function Transformation({ kind }: { kind: number }) {
  const shape = 'M0,0 H65 V17 H24 V63 H0 Z';
  const operation = kind === 0 ? '' : kind === 1 ? 'translate(65 0) scale(-1 1)' : 'rotate(90 32 32)';
  return <svg viewBox="0 0 320 145" className="practice-wide-illustration" role="img"
    aria-label="연한 도형을 옮긴 뒤 진한 도형과 비교한 모습">
    {Array.from({ length: 13 }, (_, i) => <line key={'v' + i} x1={i * 25 + 10} x2={i * 25 + 10} y1="2" y2="142" stroke="#e6ecfa" />)}
    {Array.from({ length: 6 }, (_, i) => <line key={'h' + i} x1="2" x2="318" y1={i * 25 + 10} y2={i * 25 + 10} stroke="#e6ecfa" />)}
    <g transform="translate(38 39)"><path d={shape} fill="#d7dff0" stroke="#9caccc" strokeWidth="2.5" /></g>
    <path d="M125 73 H171 M163 65 L171 73 L163 81" stroke="#929fc0" strokeWidth="2.5" fill="none" />
    <g transform={'translate(206 39) ' + operation}><path d={shape} fill="#7387ee" stroke="#5668c9" strokeWidth="2.5" /></g>
    <text x="70" y="130" textAnchor="middle" fill="#8996ae" fontSize="12">처음</text>
    <text x="239" y="130" textAnchor="middle" fill="#5364bc" fontSize="12">이동 후</text>
  </svg>;
}

function AreaGrid({ columns, rows }: { columns: number; rows: number }) {
  const unit = Math.min(34, 225 / Math.max(columns, rows));
  const w = columns * unit, h = rows * unit;
  const x = (355 - w) / 2, y = (230 - h) / 2 - 5;
  return <svg viewBox="0 0 355 255" className="practice-wide-illustration" role="img"
    aria-label={columns + '열 ' + rows + '행의 단위 넓이 격자'}>
    <rect x={x} y={y} width={w} height={h} rx="2" fill="#d9e2ff" stroke="#6980e1" strokeWidth="2" />
    {Array.from({ length: columns - 1 }, (_, i) => <line key={'c' + i} x1={x + (i + 1) * unit} x2={x + (i + 1) * unit}
      y1={y} y2={y + h} stroke="#8ba2e6" strokeDasharray="4 3" strokeWidth="1.5" />)}
    {Array.from({ length: rows - 1 }, (_, i) => <line key={'r' + i} x1={x} x2={x + w}
      y1={y + (i + 1) * unit} y2={y + (i + 1) * unit} stroke="#8ba2e6" strokeDasharray="4 3" strokeWidth="1.5" />)}
    <text x={x + w / 2} y={y + h + 23} textAnchor="middle" fontSize="15" fontWeight="800" fill="#5464b5">가로 {columns}cm</text>
    <text x={x - 10} y={y + h / 2} textAnchor="end" fontSize="13" fontWeight="800" fill="#5464b5">세로 {rows}cm</text>
  </svg>;
}

function VolumeBox({ width, depth, height }: { width: number; depth: number; height: number }) {
  const x = 80, y = 80, ux = 31, vx = 16, vy = -11, hz = 27;
  const X = x + width * ux, Y = y + height * hz;
  const dX = depth * vx, dY = depth * vy;
  const vec = (points: string, fill: string) => <polygon points={points} fill={fill} stroke="#6980d2" strokeWidth="2" strokeLinejoin="round" />;
  return <svg viewBox="0 0 385 245" className="practice-wide-illustration" role="img"
    aria-label={'가로 ' + width + ', 세로 ' + depth + ', 높이 ' + height + '인 직육면체 단위 격자'}>
    {vec(x + ',' + y + ' ' + X + ',' + y + ' ' + (X + dX) + ',' + (y + dY) + ' ' + (x + dX) + ',' + (y + dY), '#d4ddff')}
    {vec(X + ',' + y + ' ' + (X + dX) + ',' + (y + dY) + ' ' + (X + dX) + ',' + (Y + dY) + ' ' + X + ',' + Y, '#9caef3')}
    {vec(x + ',' + y + ' ' + X + ',' + y + ' ' + X + ',' + Y + ' ' + x + ',' + Y, '#b6c7ff')}
    {Array.from({ length: width - 1 }, (_, i) => {
      const xi = x + (i + 1) * ux;
      return <g key={'w' + i} stroke="#758bd8" strokeWidth="1.25">
        <line x1={xi} y1={y} x2={xi} y2={Y} />
        <line x1={xi} y1={y} x2={xi + dX} y2={y + dY} />
      </g>;
    })}
    {Array.from({ length: height - 1 }, (_, i) => {
      const yi = y + (i + 1) * hz;
      return <g key={'h' + i} stroke="#758bd8" strokeWidth="1.25">
        <line x1={x} y1={yi} x2={X} y2={yi} />
        <line x1={X} y1={yi} x2={X + dX} y2={yi + dY} />
      </g>;
    })}
    {Array.from({ length: depth - 1 }, (_, i) => {
      const dx = (i + 1) * vx, dy = (i + 1) * vy;
      return <g key={'d' + i} stroke="#758bd8" strokeWidth="1.25">
        <line x1={x + dx} y1={y + dy} x2={X + dx} y2={y + dy} />
        <line x1={X + dx} y1={y + dy} x2={X + dx} y2={Y + dy} />
      </g>;
    })}
    <text x={x + width * ux / 2} y={Y + 22} textAnchor="middle" fill="#5064b7" fontSize="14" fontWeight="900">가로 {width}cm</text>
    <text x={X + dX + 11} y={Y + dY / 2 - 4} fill="#5064b7" fontSize="12" fontWeight="800">세로 {depth}cm</text>
    <text x={x - 14} y={y + height * hz / 2} textAnchor="end" fill="#5064b7" fontSize="13" fontWeight="800">높이 {height}cm</text>
  </svg>;
}

function PracticeScene({ problem: p, phase, step }: Props) {
  const concept = phase === 'concept', solution = phase === 'solution';
  const advanced = solution || (concept && step >= 1);
  const { topic } = p;
  let content: React.ReactNode;
  let caption: string;

  switch (topic) {
    case 'split': {
      const a = concept ? 7 : p.a, b = concept ? 3 : p.b;
      content = <div className="practice-stack">
        <div className="practice-equation">{a} = {b} + <span className="practice-blank">?</span></div>
        <div className="practice-two-groups"><Dots amount={b} />
          <span className="practice-operator">+</span><Dots amount={a - b} color="orange" /></div>
        {advanced && <p className="practice-emphasis">{a}개를 {b}개와 {a - b}개로 나누었어요.</p>}
      </div>;
      caption = '왼쪽과 오른쪽 블록을 합치면 전체 개수가 돼요.'; break;
    }
    case 'addsub': {
      const a = concept ? (step === 2 ? 7 : 5) : p.a;
      const b = concept ? 2 : p.b;
      const subtract = concept ? step === 2 : p.mode === 'subtract';
      content = <div className="practice-stack">
        <div className="practice-equation">{a} {subtract ? '−' : '+'} {b} = ?</div>
        <div className="practice-two-groups"><Dots amount={a} crossed={subtract ? b : 0} />
          {!subtract && <><span className="practice-operator">+</span><Dots amount={b} color="orange" /></>}</div>
        {subtract && <p className="practice-emphasis">선이 그어진 {b}개를 빼 주세요.</p>}
      </div>;
      caption = '블록을 하나씩 세어 보세요.'; break;
    }
    case 'shapes': {
      const a = concept ? Math.min(step, 2) : p.a;
      content = <Shapes shape={a} />;
      caption = '변과 꼭짓점의 수에 집중해 보세요.'; break;
    }
    case 'multiply': {
      const a = concept ? 3 : p.a, b = concept ? 4 : p.b;
      content = <div className="practice-stack">
        <div className="practice-equation">{a} × {b} = ?</div>
        <Groups pieces={b} count={a} />
      </div>;
      caption = '각 묶음의 수가 같다는 것을 확인하세요.'; break;
    }
    case 'clock': {
      const a = concept ? 3 : p.a, b = concept ? 30 : p.b;
      content = <Clock hour={a} minutes={b} />;
      caption = '짧은 바늘이 시, 긴 바늘이 분을 알려줘요.'; break;
    }
    case 'divide': {
      const a = concept ? 3 : p.a, b = concept ? 4 : p.b;
      content = <div className="practice-stack">
        <div className="practice-equation">{a * b} ÷ {a} = ?</div>
        <div className="practice-sharing">{Array.from({ length: a }, (_, i) =>
          <div className="practice-person" key={i}>
            <span>🙂 {i + 1}번 친구</span><Dots amount={b} color={i % 2 ? 'orange' : 'blue'} />
          </div>)}</div>
      </div>;
      caption = '친구들이 모두 같은 수를 받는지 세어 보세요.'; break;
    }
    case 'fractionintro': {
      const a = concept ? (step === 2 ? 3 : 1) : p.a, b = concept ? 4 : p.b;
      content = <div className="practice-stack"><div className="practice-equation">전체 {b}칸 중 색칠한 {a}칸</div>
        <SegmentedBar n={a} d={b} /></div>;
      caption = '점선으로 나눈 크기는 모두 같아요.'; break;
    }
    case 'lengthtime': {
      const length = concept ? step !== 1 : p.mode === 'length';
      const a = concept ? (length ? 2 : 1) : p.a, b = concept ? (length ? 30 : 0) : p.b;
      content = <div className="practice-stack">
        <div className="practice-unit">{length ? '📏 길이' : '⏱️ 시간'}</div>
        <div className="practice-equation">{length ? a + 'm ' + b + 'cm' : a + '분'}</div>
        <div className="practice-meter">
          {Array.from({ length: length ? a : 1 }, (_, i) => <span key={i} className="practice-meter-part">{length ? '1m' : '60초'}</span>)}
          {length && b > 0 && <span className="practice-meter-part practice-meter-part--partial">{b}cm</span>}
        </div>
        <p className="practice-emphasis">{length ? '1m = 100cm' : '1분 = 60초'}</p>
      </div>;
      caption = '큰 단위를 작은 단위로 바꾸는 관계를 기억해요.'; break;
    }
    case 'angles': {
      content = <Angle degrees={concept ? (step === 0 ? 45 : step === 1 ? 90 : 120) : p.a} />;
      caption = '기준선부터 두 번째 선까지 벌어진 크기를 보세요.'; break;
    }
    case 'transform': {
      content = <Transformation kind={concept ? step : p.a} />;
      caption = '색과 모양뿐 아니라 도형의 방향도 비교해요.'; break;
    }
    case 'decimaladd': {
      const a = concept ? 12 : p.a, b = concept ? 5 : p.b;
      content = <div className="practice-stack">
        <div className="practice-equation">{(a / 10).toFixed(1)} + {(b / 10).toFixed(1)} = ?</div>
        <div className="practice-decimals">
          <div><small>첫 번째 수 · 0.1 조각 {a}개</small><Dots amount={a} /></div>
          <div><small>두 번째 수 · 0.1 조각 {b}개</small><Dots amount={b} color="orange" /></div>
        </div>
      </div>;
      caption = '0.1 조각 열 개가 모이면 1이 돼요.'; break;
    }
    case 'reduce': {
      const a = concept ? 2 : p.a, b = concept ? 4 : p.b;
      const normalized = fractionText(a, b);
      content = <div className="practice-stack">
        <div className="practice-equation">{a}/{b} {advanced ? '= ' + normalized : '= ?'}</div>
        <div className="practice-compare-bars">
          <div><small>{a}/{b}</small><SegmentedBar n={a} d={b} /></div>
          <div><small>{advanced ? normalized : '같은 크기의 분수는?'}</small>
            {advanced ? <SegmentedBar n={a / gcd(a, b)} d={b / gcd(a, b)} color={warm} />
              : <div className="practice-bar-placeholder">?</div>}
          </div>
        </div>
      </div>;
      caption = '전체 길이는 그대로 두고 칸 수만 줄여요.'; break;
    }
    case 'area': {
      const a = concept ? 4 : p.a, b = concept ? 3 : p.b;
      content = <AreaGrid columns={a} rows={b} />;
      caption = '점선으로 나뉜 작은 정사각형을 세어 보세요.'; break;
    }
    case 'proportion': {
      const a = concept ? 2 : p.a, b = concept ? 3 : p.b, c = concept ? 2 : p.c!;
      content = <div className="practice-stack">
        <div className="practice-equation">{a} : {b} = {a * c} : {advanced ? b * c : '?'}</div>
        <div className="practice-proportion">
          <div className="practice-proportion-set"><div className="practice-proportion-bars">
            <span style={{ flex: a, backgroundColor: tint }} /><span style={{ flex: b, backgroundColor: warm }} />
          </div><small>{a} : {b}</small></div>
          <span className="practice-operator">＝</span>
          <div className="practice-proportion-set"><div className="practice-proportion-bars">
            <span style={{ flex: a, backgroundColor: tint }} />
            <span style={{ flex: b, backgroundColor: advanced ? warm : '#e3e8f5' }} />
          </div><small>{a * c} : {advanced ? b * c : '?'}</small></div>
        </div>
      </div>;
      caption = '두 막대의 파랑:주황 비율이 같아요.'; break;
    }
    case 'volume': {
      const a = concept ? 3 : p.a, b = concept ? 2 : p.b, c = concept ? 4 : p.c!;
      content = <VolumeBox width={a} depth={b} height={c} />;
      caption = '작은 정육면체가 몇 층 쌓였는지 생각해요.'; break;
    }
    default: {
      content = null;
      caption = '';
    }
  }
  return <div className="scene-inner scene-inner--practice" key={topic + '-' + (concept ? step : solution ? step : 0)}>
    {content}
    <p className="practice-caption">{caption}</p>
    {solution && step === 2 && <p className="practice-final">정답: {p.answer}</p>}
  </div>;
}

export default PracticeScene;
