import { writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'

const W = 1200
const H = 630

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1f2335"/>
      <stop offset="100%" stop-color="#16161e"/>
    </linearGradient>
    <pattern id="scan" width="1" height="3" patternUnits="userSpaceOnUse">
      <rect width="1" height="1" fill="rgba(0,0,0,0.18)"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- terminal chrome -->
  <rect x="80" y="80" width="${W - 160}" height="${H - 160}" rx="14" fill="#1a1b26" stroke="#292e42" stroke-width="2"/>
  <rect x="80" y="80" width="${W - 160}" height="42" rx="14" fill="#16161e"/>
  <circle cx="110" cy="101" r="7" fill="#f7768e"/>
  <circle cx="135" cy="101" r="7" fill="#e0af68"/>
  <circle cx="160" cy="101" r="7" fill="#9ece6a"/>
  <text x="190" y="106" font-family="JetBrains Mono, monospace" font-size="14" fill="#565f89">~/dojo — vim</text>

  <!-- title -->
  <text x="125" y="220" font-family="JetBrains Mono, monospace" font-size="80" font-weight="700" fill="#c0caf5">
    <tspan fill="#9ece6a">❯</tspan> nvimdojo<tspan fill="#7aa2f7">▊</tspan>
  </text>
  <text x="125" y="270" font-family="JetBrains Mono, monospace" font-size="26" fill="#7dcfff">
    learn vim by playing
  </text>

  <!-- code block -->
  <rect x="125" y="320" width="950" height="180" rx="10" fill="#16161e" stroke="#292e42"/>
  <text x="145" y="358" font-family="JetBrains Mono, monospace" font-size="22" fill="#565f89">
    <tspan fill="#7dcfff">func</tspan> <tspan fill="#7aa2f7">(s</tspan> <tspan fill="#bb9af7">*Server</tspan><tspan fill="#7aa2f7">)</tspan> <tspan fill="#7dcfff">Get</tspan><tspan fill="#c0caf5">(</tspan><tspan fill="#e0af68">id string</tspan><tspan fill="#c0caf5">) {</tspan>
  </text>
  <text x="145" y="395" font-family="JetBrains Mono, monospace" font-size="22" fill="#565f89">
    <tspan>    </tspan><tspan fill="#9ece6a">// task:</tspan> <tspan fill="#c0caf5">rename Get → Fetch</tspan>
  </text>
  <text x="145" y="432" font-family="JetBrains Mono, monospace" font-size="22" fill="#565f89">
    <tspan>    </tspan><tspan fill="#c0caf5">return</tspan> <tspan fill="#7aa2f7">s.fetch(id)</tspan>
  </text>
  <text x="145" y="469" font-family="JetBrains Mono, monospace" font-size="22" fill="#c0caf5">}</text>

  <!-- keys -->
  <g transform="translate(750, 360)" font-family="JetBrains Mono, monospace" font-size="28" font-weight="700">
    <rect x="0" y="0" width="60" height="48" rx="6" fill="#292e42" stroke="#3b4261"/>
    <text x="22" y="34" fill="#bb9af7">c</text>
    <rect x="70" y="0" width="60" height="48" rx="6" fill="#292e42" stroke="#3b4261"/>
    <text x="86" y="34" fill="#bb9af7">i</text>
    <rect x="140" y="0" width="60" height="48" rx="6" fill="#292e42" stroke="#3b4261"/>
    <text x="156" y="34" fill="#bb9af7">w</text>
    <text x="220" y="34" fill="#9ece6a">→ Fetch</text>
  </g>

  <!-- statusline -->
  <rect x="80" y="${H - 80}" width="${W - 160}" height="40" rx="0" fill="#16161e"/>
  <rect x="80" y="${H - 80}" width="120" height="40" fill="#7aa2f7"/>
  <text x="110" y="${H - 53}" font-family="JetBrains Mono, monospace" font-size="20" font-weight="700" fill="#16161e">NORMAL</text>
  <text x="220" y="${H - 53}" font-family="JetBrains Mono, monospace" font-size="18" fill="#565f89">handler.go</text>
  <text x="${W - 220}" y="${H - 53}" font-family="JetBrains Mono, monospace" font-size="18" fill="#565f89">⌨ 5/10  ⚡ dojo</text>

  <rect width="${W}" height="${H}" fill="url(#scan)"/>
</svg>
`

mkdirSync('public', { recursive: true })
await sharp(Buffer.from(svg)).png().toFile('public/og.png')
writeFileSync('public/og.svg', svg)
console.log('wrote public/og.png and public/og.svg')
