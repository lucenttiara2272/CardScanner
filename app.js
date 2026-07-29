/* ===========================================================================
   Centering Gauge
   ---------------------------------------------------------------------------
   The whole application: styles, page markup and logic. index.html only loads
   this file, so this is the only thing to replace when updating.
   =========================================================================== */

const VERSION = 'v37';

(function boot() {

// ---- styles -----------------------------------------------------------------
const CSS = String.raw`
  :root {
    --graphite:#1b1a17; --slab:#24231f; --rule:#38352e;
    --ink:#ece7db; --ink-dim:#8b857a;
    --border-yel:#ffcb05; --edge-cyan:#52c7d8;
    --pass:#74bf76; --warn:#e5a33c; --fail:#e0603e;
  }
  * { box-sizing:border-box; }
  html, body { margin:0; background:var(--graphite); color:var(--ink);
    font-family:"Archivo",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }

  header { display:flex; align-items:center; gap:14px; padding:14px 18px;
    border-bottom:1px solid var(--rule); flex-wrap:wrap; }
  .mark { width:4px; height:26px; background:var(--border-yel); flex:none; }
  .ver { font-family:"IBM Plex Mono",monospace; font-size:11px; color:var(--ink-dim);
    border:1px solid var(--rule); padding:4px 8px; letter-spacing:0.05em; }
  h1 { font-size:15px; font-weight:800; letter-spacing:0.16em; text-transform:uppercase; margin:0; flex:1; min-width:140px; }

  .btn { font-family:"Archivo",sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.1em; text-transform:uppercase; border:1px solid var(--rule);
    background:none; color:var(--ink); padding:9px 16px; cursor:pointer; }
  .btn:hover { border-color:var(--ink-dim); }
  .btn:focus-visible { outline:2px solid var(--edge-cyan); outline-offset:2px; }
  .btn[data-primary] { background:var(--border-yel); border-color:var(--border-yel); color:var(--graphite); }
  .btn[data-primary]:hover { background:#ffd83d; }
  .btn[data-on="1"] { border-color:var(--edge-cyan); color:var(--edge-cyan); }
  .btn:disabled { opacity:0.5; cursor:default; }

  .rail { display:flex; padding:0 18px; border-bottom:1px solid var(--rule); }
  .rail div { display:flex; align-items:baseline; gap:9px; padding:11px 20px 11px 0;
    margin-right:20px; font-size:12px; color:var(--ink-dim);
    border-bottom:2px solid transparent; margin-bottom:-1px; }
  .rail div[data-on="1"] { color:var(--ink); border-bottom-color:var(--border-yel); }
  .rail div[data-done="1"] { border-bottom-color:var(--rule); }
  .rail b { font-family:"IBM Plex Mono",monospace; font-size:11px; font-weight:500; }

  .work { display:grid; grid-template-columns:1fr 300px; gap:1px; background:var(--rule); }
  .stage, .panel { background:var(--graphite); }
  .stage { padding:18px; display:flex; flex-direction:column; gap:14px; min-width:0; }

  /* image viewport: fits by default, scrolls when zoomed to native pixels */
  .viewport { overflow:auto; background:var(--slab); border:1px solid var(--rule); }
  #canvas { display:block; margin:0 auto; touch-action:none; cursor:crosshair; }
  #canvas[data-pick="1"] { cursor:copy; }
  #canvas:focus-visible { outline:2px solid var(--edge-cyan); outline-offset:-2px; }

  .row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

  /* corner inspector: laid out the way the corners sit on the card */
  .stage[data-step="3"] > .row, .stage[data-step="4"] > .row { order:-1; }

  .edges { display:none; flex-direction:column; gap:1px; background:var(--rule); border:1px solid var(--rule); }
  .edges[data-on="1"] { display:flex; }
  .edge { background:var(--graphite); padding:14px 16px; display:flex; flex-direction:column; gap:8px; }
  .edge header { display:flex; align-items:baseline; gap:10px; font-size:11px; }
  .edge header span { letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-dim); font-size:9.5px; }
  .edge header em { font-style:normal; font-family:"IBM Plex Mono",monospace; font-size:9.5px; color:var(--ink-dim); }
  .edge header b { font-family:"IBM Plex Mono",monospace; font-weight:500; margin-left:auto; }
  .edge[data-q="good"] header b { color:var(--pass); }
  .edge[data-q="soft"] header b { color:var(--warn); }
  .edge[data-q="bad"]  header b { color:var(--fail); }
  .tags { display:flex; gap:5px; }
  .tags i { font-style:normal; font-family:"IBM Plex Mono",monospace; font-size:9px;
    padding:2px 6px; border:1px solid var(--rule); cursor:help; }
  .tags i[data-d="edgeward"] { color:var(--fail); border-color:var(--fail); }
  .tags i[data-d="mixed"] { color:var(--warn); border-color:var(--warn); }
  .tags i[data-d="inward"] { color:var(--ink-dim); }
  .strip { background:var(--slab); overflow:hidden; line-height:0; }
  .strip canvas { width:100%; height:auto; display:block; image-rendering:auto; }
  .prof { display:block; width:100%; cursor:crosshair; background:var(--slab); }
  .edgeZoom { background:var(--graphite); padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
  .edgeZoom canvas { width:100%; height:auto; display:block; background:var(--slab); }
  #edgeDetail { background:var(--graphite); padding:0; }
  #edgeDetail > .hint { padding:14px 16px; }
  .corners { display:none; grid-template-columns:1fr 1fr; gap:1px; background:var(--rule); border:1px solid var(--rule); }
  .corners[data-on="1"] { display:grid; }
  .cnr { margin:0; background:var(--graphite); padding:14px; display:flex; flex-direction:column; gap:10px; }
  .cnrView { background:var(--slab); display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .cnrView canvas { display:block; width:100%; height:auto; image-rendering:auto; }
  .cnrView canvas { max-height:30vh; width:auto; max-width:100%; margin:0 auto; }
  .cnr figcaption { display:flex; align-items:baseline; gap:10px; font-size:11px; }
  .cnr figcaption em { font-style:normal; font-family:"IBM Plex Mono",monospace;
    font-size:9.5px; color:var(--ink-dim); }
  .cnr figcaption span { letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-dim); font-size:9.5px; }
  .cnr figcaption b { font-family:"IBM Plex Mono",monospace; font-weight:500; margin-left:auto; }
  .cnr[data-q="good"] figcaption b { color:var(--pass); }
  .cnr[data-q="soft"] figcaption b { color:var(--warn); }
  .cnr[data-q="bad"]  figcaption b { color:var(--fail); }

  .zoom { display:flex; align-items:center; gap:10px; border:1px solid var(--rule); padding:0 12px; height:37px; }
  .zoom label { font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-dim); }
  .zoom input[type=range] { width:130px; accent-color:var(--border-yel); }
  .zoom b { font-family:"IBM Plex Mono",monospace; font-size:11.5px; font-weight:500; min-width:44px; text-align:right; }
  .zoom button { font-family:"Archivo",sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase; background:none;
    border:1px solid var(--rule); color:var(--ink-dim); padding:4px 9px; cursor:pointer; }
  .zoom button:hover { color:var(--ink); border-color:var(--ink-dim); }
  .zoom button:focus-visible { outline:2px solid var(--edge-cyan); outline-offset:2px; }

  .sep { display:flex; align-items:center; gap:12px; border:1px solid var(--rule); padding:8px 12px; font-size:11.5px; }
  .sw { display:flex; align-items:center; gap:7px; color:var(--ink-dim); }
  .sw i { width:18px; height:18px; display:block; border:1px solid var(--rule); font-style:normal; }
  .sw i[data-empty="1"] { background:repeating-linear-gradient(45deg,#2c2a25,#2c2a25 3px,#1b1a17 3px,#1b1a17 6px); }
  .sep b { font-family:"IBM Plex Mono",monospace; font-weight:500; margin-left:auto; }
  .sep b + b { margin-left:16px; }
  .sep b[data-res="good"] { color:var(--pass); }
  .sep b[data-res="soft"] { color:var(--warn); }
  .sep b[data-res="bad"]  { color:var(--fail); }
  .sep[data-q="good"] b { color:var(--pass); }
  .sep[data-q="soft"] b { color:var(--warn); }
  .sep[data-q="bad"]  b { color:var(--fail); }

  .fits { display:flex; border:1px solid var(--rule); font-size:11px; }
  .fits div { flex:1; padding:7px 10px; display:flex; flex-direction:column; gap:3px; }
  .fits div + div { border-left:1px solid var(--rule); }
  .fits span { font-size:9.5px; letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-dim); }
  .fits b { font-family:"IBM Plex Mono",monospace; font-weight:500; }
  .fits em { font-style:normal; font-size:9.5px; font-family:"IBM Plex Mono",monospace; color:var(--ink-dim); }
  .fits em[data-tight="1"] { color:var(--fail); }
  .fits div[data-q="good"] b { color:var(--pass); }
  .fits div[data-q="soft"] b { color:var(--warn); }
  .fits div[data-q="bad"]  b { color:var(--fail); }

  .hint { font-size:12.5px; line-height:1.55; color:var(--ink-dim); margin:0; max-width:58ch; }
  .hint b { color:var(--ink); font-weight:600; }

  .flag { display:none; font-size:12.5px; line-height:1.5;
    border-left:2px solid var(--warn); padding:8px 0 8px 12px; color:var(--ink); }
  .flag[data-show="1"] { display:block; }
  .flag[data-level="bad"] { border-left-color:var(--fail); }

  .panel { padding:18px; display:flex; flex-direction:column; gap:18px; }
  .panel[data-idle="1"] { opacity:0.4; }
  .block { display:flex; flex-direction:column; gap:7px; }
  .block > h2 { font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:var(--ink-dim); margin:0; }

  .ratio { font-family:"IBM Plex Mono",monospace; font-size:30px; font-weight:500; line-height:1; }
  .ratio small { font-size:12px; color:var(--ink-dim); letter-spacing:0.08em; margin-left:8px; }

  .picker { font-family:"Archivo",sans-serif; font-size:12px; font-weight:600;
    background:var(--slab); color:var(--ink); border:1px solid var(--rule);
    padding:8px 10px; width:100%; cursor:pointer; }
  .picker:focus-visible { outline:2px solid var(--edge-cyan); outline-offset:2px; }

  .seg { display:flex; border:1px solid var(--rule); }
  .seg button { font-family:"Archivo",sans-serif; font-size:12px; font-weight:600;
    background:none; border:0; color:var(--ink-dim); padding:7px 13px; cursor:pointer; }
  .seg button + button { border-left:1px solid var(--rule); }
  .seg button[data-on="1"] { color:var(--graphite); background:var(--ink); }
  .seg button:focus-visible { outline:2px solid var(--edge-cyan); outline-offset:-2px; }

  .bands { display:flex; height:26px; position:relative; border:1px solid var(--rule); }
  .bands i { flex:1; display:grid; place-items:center; font-family:"IBM Plex Mono",monospace; font-size:10px; font-style:normal; color:var(--graphite); }
  .bands i + i { border-left:1px solid rgba(27,26,23,0.35); }
  .needle { position:absolute; top:-5px; bottom:-5px; width:2px; background:var(--ink); transform:translateX(-1px); transition:left 140ms ease-out; pointer-events:none; }
  @media (prefers-reduced-motion:reduce) { .needle { transition:none; } }

  .ticks { display:flex; font-family:"IBM Plex Mono",monospace; font-size:9.5px; color:var(--ink-dim); }
  .ticks span { flex:1; text-align:right; }

  .verdict { border:1px solid var(--rule); padding:14px; display:flex; align-items:baseline; gap:12px; }
  .verdict b { font-family:"IBM Plex Mono",monospace; font-size:40px; font-weight:600; line-height:1; }
  .verdict span { font-size:12px; line-height:1.4; color:var(--ink-dim); }

  .gaps { font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--ink-dim); line-height:1.8; }
  .gaps b { color:var(--ink); font-weight:500; }

  /* ---------- collection ---------- */
  .collection { border-top:1px solid var(--rule); }
  .collBar { display:flex; align-items:center; gap:14px; padding:14px 18px;
    border-bottom:1px solid var(--rule); font-size:12px; flex-wrap:wrap; }
  .collBar b { font-family:"IBM Plex Mono",monospace; font-weight:500; }
  .collBar em { font-style:normal; font-family:"IBM Plex Mono",monospace; color:var(--ink-dim); font-size:11px; }
  .collNote { color:var(--ink-dim); font-size:11.5px; margin-left:auto; }
  .collNote [data-warn="1"], .collBar span[data-warn="1"] { color:var(--warn); }

  table.coll { width:100%; border-collapse:collapse; font-size:12.5px; }
  table.coll th { text-align:left; font-size:9.5px; letter-spacing:0.12em; text-transform:uppercase;
    color:var(--ink-dim); font-weight:600; padding:10px 12px; border-bottom:1px solid var(--rule);
    cursor:pointer; white-space:nowrap; }
  table.coll th:hover { color:var(--ink); }
  table.coll th[data-sort]::after { content:' ▾'; color:var(--border-yel); }
  table.coll th[data-sort="asc"]::after { content:' ▴'; }
  table.coll td { padding:8px 12px; border-bottom:1px solid var(--rule); vertical-align:middle; }
  table.coll tbody tr { cursor:pointer; }
  table.coll tbody tr:hover td { background:var(--slab); }
  table.coll .mono { font-family:"IBM Plex Mono",monospace; }
  table.coll .dim { color:var(--ink-dim); }
  table.coll .tImg { width:44px; padding:4px 0 4px 12px; }
  table.coll .tImg img { display:block; width:34px; height:auto; border:1px solid var(--rule); }
  table.coll td.cName { cursor:text; }
  table.coll td.cName:hover { background:var(--slab); box-shadow:inset 0 0 0 1px var(--rule); }
  table.coll td i { color:#4a463e; font-style:italic; }
  table.coll td em { font-style:normal; color:var(--ink-dim); font-size:11px; }
  table.coll td[data-g="10"] { color:var(--pass); }
  table.coll td[data-g="9"] { color:#a8c26a; }
  table.coll td[data-g="8"] { color:var(--warn); }
  table.coll td[data-g="x"], table.coll td[data-g="5"], table.coll td[data-g="6"] { color:var(--fail); }
  .bar { flex:1; max-width:220px; height:6px; background:var(--slab); border:1px solid var(--rule); }
  .bar i { display:block; height:100%; background:var(--border-yel); transition:width 160ms linear; }
  @media (prefers-reduced-motion:reduce) { .bar i { transition:none; } }

  .batchT td.fname { font-size:12px; max-width:340px; }
  .batchT .why { display:block; font-size:10.5px; color:var(--warn); margin-top:3px; line-height:1.45; }
  .batchT tr[data-lv="failed"] td.fname .why { color:var(--fail); }
  .batchT .acts { white-space:nowrap; text-align:right; }
  .batchT .sides i { font-style:normal; font-family:"IBM Plex Mono",monospace; font-size:9.5px;
    border:1px solid var(--rule); padding:1px 5px; margin-right:3px; color:var(--ink-dim); }
  .calHelp { padding:16px 18px; border-bottom:1px solid var(--rule); display:flex;
    flex-direction:column; gap:10px; }
  .batchT .acts .mini + .mini { margin-left:5px; }
  .lvl { font-family:"IBM Plex Mono",monospace; font-size:10px; letter-spacing:0.08em;
    text-transform:uppercase; padding:3px 8px; border:1px solid var(--rule); }
  .lvl[data-lv="ok"] { color:var(--pass); border-color:var(--pass); }
  .lvl[data-lv="check"] { color:var(--warn); border-color:var(--warn); }
  .lvl[data-lv="failed"] { color:var(--fail); border-color:var(--fail); }

  .mini { background:none; border:1px solid var(--rule); color:var(--ink-dim);
    font-size:11px; padding:2px 7px; cursor:pointer; }
  .mini:hover { color:var(--ink); border-color:var(--ink-dim); }
  .mini[data-del]:hover { color:var(--fail); border-color:var(--fail); }

  .detail { border-top:1px solid var(--rule); background:var(--slab); }
  .dGrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:24px; padding:18px; }
  .dGrid h3 { font-size:9.5px; letter-spacing:0.12em; text-transform:uppercase;
    color:var(--ink-dim); margin:0 0 8px; font-weight:600; }
  .dGrid h3 + p { margin:0 0 16px; }
  .dGrid p { font-size:12px; line-height:1.7; }
  .dGrid p.dim { color:var(--ink-dim); }
  .dGrid label { display:block; font-size:10px; letter-spacing:0.1em; text-transform:uppercase;
    color:var(--ink-dim); margin-bottom:8px; }
  .dGrid input { display:block; width:100%; margin-top:3px; background:var(--graphite);
    border:1px solid var(--rule); color:var(--ink); font-family:"Archivo",sans-serif;
    font-size:12.5px; padding:6px 8px; text-transform:none; letter-spacing:0; }
  .dGrid input:focus-visible { outline:2px solid var(--edge-cyan); outline-offset:1px; }
  .dGrid input::placeholder { color:#4a463e; font-style:italic; }
  .dGrid p em { font-style:normal; color:var(--ink-dim); font-size:10.5px; }

  /* card lookup */
  .lookup { display:flex; gap:6px; margin-bottom:12px; }
  .lookup input { flex:1; background:var(--graphite); border:1px solid var(--rule);
    color:var(--ink); font-family:"Archivo",sans-serif; font-size:12.5px; padding:7px 9px; }
  .lookup input:focus-visible { outline:2px solid var(--edge-cyan); outline-offset:1px; }
  .lookup button { font-family:"Archivo",sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase; background:none; color:var(--ink);
    border:1px solid var(--rule); padding:7px 12px; cursor:pointer; white-space:nowrap; }
  .lookup button:hover { border-color:var(--ink-dim); }
  .lookup button:disabled { opacity:0.5; cursor:default; }

  .hits { display:flex; flex-direction:column; gap:1px; background:var(--rule);
    border:1px solid var(--rule); margin-bottom:12px; max-height:280px; overflow:auto; }
  .hit { display:flex; gap:10px; align-items:center; background:var(--graphite);
    padding:7px 9px; cursor:pointer; text-align:left; border:0; width:100%; }
  .hit:hover { background:var(--slab); }
  .hit img { width:30px; height:auto; display:block; border:1px solid var(--rule); flex:none; }
  .hit div { min-width:0; }
  .hit b { display:block; font-size:12px; font-weight:600; color:var(--ink);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .hit span { display:block; font-family:"IBM Plex Mono",monospace; font-size:9.5px; color:var(--ink-dim); }
  .hit i { font-style:normal; margin-left:auto; font-family:"IBM Plex Mono",monospace;
    font-size:11px; color:var(--pass); flex:none; }

  .lookNote { font-size:11px; line-height:1.5; color:var(--ink-dim); margin:0 0 12px; }
  .lookNote[data-err="1"] { color:var(--fail); }

  .priceBox { border:1px solid var(--rule); padding:12px; margin-bottom:12px; }
  .priceBox b { font-family:"IBM Plex Mono",monospace; font-size:22px; font-weight:600; }
  .priceBox span { display:block; font-size:10.5px; color:var(--ink-dim); line-height:1.5; margin-top:5px; }
  .priceBox em { font-style:normal; color:var(--warn); }

  /* ---------- scan (phone) ---------- */
  .scanView { border-top:1px solid var(--rule); }
  .scanLive, .scanDone { padding:16px; display:flex; flex-direction:column; gap:14px;
    max-width:560px; margin:0 auto; }
  .scanStage { position:relative; background:#000; border:1px solid var(--rule); line-height:0; min-height:220px; }
  .scanStage video { width:100%; height:auto; display:block; }
  .scanStage canvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }

  .scanVerdict { border:1px solid var(--rule); padding:11px 14px; display:flex;
    flex-direction:column; gap:4px; }
  .scanVerdict b { font-size:14px; font-weight:600; }
  .scanVerdict span { font-family:"IBM Plex Mono",monospace; font-size:11px; color:var(--ink-dim); }
  .scanVerdict[data-lv="good"] { border-color:var(--pass); }
  .scanVerdict[data-lv="good"] b { color:var(--pass); }
  .scanVerdict[data-lv="soft"] { border-color:var(--warn); }
  .scanVerdict[data-lv="soft"] b { color:var(--warn); }
  .scanVerdict[data-lv="bad"] { border-color:var(--rule); }
  .scanVerdict[data-lv="bad"] b { color:var(--ink-dim); }

  .scanActions { display:flex; gap:10px; flex-wrap:wrap; }
  .scanActions .btn { flex:1; min-width:110px; padding:14px 16px; }
  .btn[data-ready="0"][data-primary] { background:var(--rule); border-color:var(--rule); color:var(--ink-dim); }

  .scanBad { color:var(--fail); font-size:13px; line-height:1.5; margin:0; }
  .scanCard img { width:120px; height:auto; display:block; border:1px solid var(--rule); margin:0 auto; }
  .scanNums { display:flex; flex-direction:column; gap:12px; }
  .scanBig { display:flex; align-items:baseline; gap:8px; font-family:"IBM Plex Mono",monospace; }
  .scanBig b { font-size:34px; font-weight:500; }
  .scanBig i { font-style:normal; font-size:20px; color:var(--ink-dim); }
  .scanBig span { font-family:"Archivo",sans-serif; font-size:10px; letter-spacing:0.12em;
    text-transform:uppercase; color:var(--ink-dim); margin-left:auto; }
  .scanCeil { border:1px solid var(--rule); padding:14px; display:flex; align-items:baseline; gap:12px; }
  .scanCeil b { font-family:"IBM Plex Mono",monospace; font-size:38px; font-weight:600; }
  .scanCeil span { font-size:12px; color:var(--ink-dim); line-height:1.4; }
  .scanCeil[data-lv="ok"] b { color:var(--pass); }
  .scanCeil[data-lv="check"] b { color:var(--warn); }
  .scanCeil[data-lv="failed"] b { color:var(--fail); }
  .scanMm { font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--ink-dim); line-height:1.7; margin:0; }
  .scanMm em { font-style:normal; font-size:10.5px; }
  .scanWarn { font-size:11.5px; line-height:1.5; color:var(--warn); margin:0;
    border-left:2px solid var(--warn); padding-left:10px; }
  .scanNums[data-doubt="1"] .scanBig b { color:var(--ink-dim); }
  .scanNums[data-doubt="1"] .scanWarn { color:var(--fail); border-left-color:var(--fail); }

  @media (max-width:600px) {
    header { padding:10px 12px; gap:8px; }
    h1 { font-size:12px; letter-spacing:0.1em; }
    .ver { display:none; }
    header .btn { padding:8px 11px; font-size:11px; letter-spacing:0.06em; }
    .scanLive, .scanDone { padding:12px; }
  }

  footer { padding:16px 18px 40px; font-size:11.5px; line-height:1.6; color:var(--ink-dim); max-width:72ch; border-top:1px solid var(--rule); }

  @media (max-width:760px) { .work { grid-template-columns:1fr; } }
`;
document.head.insertAdjacentHTML('beforeend', '<style>' + CSS + '</style>');

// ---- page markup ------------------------------------------------------------
const MARKUP = String.raw`
<header>
  <div class="mark"></div>
  <h1>Centering Gauge</h1>
  <span class="ver" id="verBadge"></span>
  <button class="btn" id="scanBtn" data-on="0">Scan</button>
  <button class="btn" id="batchBtn" data-on="0">Batch</button>
  <button class="btn" id="collBtn" data-on="0">Collection (0)</button>
  <button class="btn" data-primary id="loadBtn">Load card photo</button>
  <input type="file" id="file" accept="image/*" hidden>
</header>

<div class="rail" id="rail">
  <div data-step="1" data-on="1"><b>01</b> Fit the edges</div>
  <div data-step="2"><b>02</b> Measure centering</div>
  <div data-step="3"><b>03</b> Inspect corners</div>
  <div data-step="4"><b>04</b> Inspect edges</div>
</div>

<div class="work" id="work">
  <div class="stage" id="stage">
    <div class="viewport" id="viewport"><canvas id="canvas" tabindex="0"></canvas></div>
    <div class="corners" id="cornerGrid"></div>
    <div class="edges" id="edgeList"></div>
    <div class="row" id="actions"></div>
    <div id="sepWrap"></div>
    <div id="fitsWrap"></div>
    <p class="flag" id="flag"></p>
    <div id="hintWrap"><p class="hint" id="hint">Load a photo of a single card to begin.</p></div>
  </div>

  <div class="panel" id="panel" data-idle="1">
    <div class="block">
      <h2>Card</h2>
      <select id="cardType" class="picker">
        <option value="standard">Pokémon / Magic — 63 × 88</option>
        <option value="yugioh">Yu-Gi-Oh — 59 × 86</option>
        <option value="sports">Sports — 63.5 × 88.9</option>
      </select>
    </div>
    <div class="block">
      <h2>Side</h2>
      <div class="seg" id="sideSeg">
        <button data-side="front" data-on="1">Front</button>
        <button data-side="back" data-on="0">Back</button>
      </div>
    </div>
    <div class="block"><h2>Left / Right</h2><div class="ratio" id="hRatio">— / —</div></div>
    <div class="block"><h2>Top / Bottom</h2><div class="ratio" id="vRatio">— / —</div></div>
    <div class="block">
      <h2>Tolerance</h2>
      <div class="bands" id="bands"></div>
      <div class="ticks" id="ticks"></div>
    </div>
    <div class="verdict"><b id="ceiling">—</b><span id="ceilingNote">No measurement yet.</span></div>
    <div class="gaps" id="gaps"></div>
  </div>
</div>

<div class="collection" id="collection" style="display:none"></div>

<div class="collection" id="batch" style="display:none"></div>

<div class="scanView" id="scan" style="display:none"></div>

<footer>
  The background reference for each edge is now found in two passes: a thin outer
  strip locates the card roughly, then the true background is sampled from the gap
  between the frame and the card. A margin of a few percent no longer poisons it &mdash;
  though more margin still gives a cleaner reading.
</footer>
`;
document.body.innerHTML = MARKUP;

document.title = 'Centering Gauge ' + VERSION;
const vb = document.getElementById('verBadge');
if (vb) vb.textContent = VERSION;

// ---- application ------------------------------------------------------------

// Card sizes by game. Pokemon and Magic share the standard 63x88; Yu-Gi-Oh is
// genuinely smaller, and sports cards are the exact 2.5x3.5 inch conversion.
const CARD_TYPES = {
  standard:{ label:'Pokémon / Magic', w:63,   h:88   },
  yugioh:  { label:'Yu-Gi-Oh',        w:59,   h:86   },
  sports:  { label:'Sports 2.5×3.5"', w:63.5, h:88.9 }
};
let CARD_MM = { ...CARD_TYPES.standard };
const MAX_EDGE = 1200;
const TOLERANCE = {
  front:[{g:10,max:55},{g:9,max:60},{g:8,max:65},{g:7,max:70},{g:6,max:75},{g:5,max:80}],
  back: [{g:10,max:75},{g:9,max:80},{g:8,max:85},{g:7,max:90},{g:6,max:90},{g:5,max:95}]
};
const BAND_COLOR = ['#74bf76','#a8c26a','#d9bb52','#e5a33c','#e08149','#e0603e'];
const EDGE_KEYS = ['top','right','bottom','left'];
const SEP_POOR = 50, SEP_OK = 120;
const REFINE_MM = 1.2;
const CORNER_INSET = 0.15;   // fraction skipped at each end of an edge
const REGION_MAX  = 1700;    // pixels across the card crop in the second pass
const CORNER_R_MM   = 3.0;   // nominal corner radius of a trading card
const CORNER_VIEW_MM= 9;     // size of each magnified corner view
const BORDER_ZONE_MM= 2.6;   // how far in from the edge still counts as border
const EDGE_INSET_MM = 3.0;   // skip the corner arcs, covered by step 3
const EDGE_SKIN_MM  = 0.18;  // ignore the outermost pixels, blurred by the cut
const EDGE_BASE_MM  = 12;    // window for the local brightness baseline
const EDGE_DEPTH_DEFAULT = 1.3;  // mm inward analysed by default

const canvas = document.getElementById('canvas');
const viewport = document.getElementById('viewport');
const ctx = canvas.getContext('2d');

const state = {
  step:1, img:null, edges:null, fits:null, scanPts:null, showScan:false,
  sampled:{bg:null,card:null}, pickMode:null, sleeve:null, pxPerMm:null,
  cardType:'standard', aspectWarn:null, guideQuality:null, guideSource:null, letterbox:null,
  frameSkew:1, frameMm:null, guideConsensus:null, guideBacking:0,
  view:'gauge', sortKey:'date', sortDir:'desc', openCard:null, focusField:null,
  scan:{ stream:null, running:false, lastCheck:0, quality:null, shot:null, result:null, busy:false, error:null },
  batch:null, batchCalib:null,
  quad:null, corners:null, cornerRef:null, cornerPxPerMm:null, cornerNative:null,
  edgeScan:null, edgeMark:null, edgeDepth:EDGE_DEPTH_DEFAULT,
  borderRef:null, borderH:null, borderSrc:null,
  borderPxPerMm:null, borderMm:null,
  cornerSens:5, showWhitening:true, margins:null,
  zoomPct:null, flat:null, guides:null, side:'front',
  drag:null, pointer:null, scale:1
};

// ===========================================================================
// LETTERBOX
//
// A phone used as a webcam, a screen recording, or a stream in the wrong
// aspect all arrive with synthetic bars down the sides or across the top. Those
// bars have a hard, straight, perfectly persistent edge - so the card detector
// locks onto them instead of the card and reports a beautifully tight fit on
// completely the wrong rectangle.
//
// They are safely distinguishable: synthetic fill is uniform to within a couple
// of levels, while any photographed surface, however dark, carries sensor noise.
// ===========================================================================

const BAR_UNIFORM = 12;   // max spread within a row before it is not a bar
const BAR_MATCH   = 26;   // how far a row may drift from the outermost one
const BAR_MAX     = 0.42; // never eat more than this fraction of a side

function stripLetterbox(img) {
  const W=img.width||img.naturalWidth, H=img.height||img.naturalHeight;
  if (!W||!H) return { img, cropped:false };

  const s=Math.min(1, 420/Math.max(W,H));
  const w=Math.max(8,Math.round(W*s)), h=Math.max(8,Math.round(H*s));
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cc=c.getContext('2d',{willReadFrequently:true});
  cc.drawImage(img,0,0,w,h);
  const d=cc.getImageData(0,0,w,h).data;
  const at=(x,y)=>{ const i=((y|0)*w+(x|0))*4; return [d[i],d[i+1],d[i+2]]; };

  // Summarise a row or column: mean colour and how much it varies.
  function line(fixed, horiz) {
    const n=horiz?w:h, step=Math.max(1,Math.round(n/60));
    let r=0,g=0,b=0,k=0, lo=999, hi=-1;
    for (let i=0;i<n;i+=step) {
      const p=horiz?at(i,fixed):at(fixed,i);
      r+=p[0]; g+=p[1]; b+=p[2]; k++;
      const L=0.299*p[0]+0.587*p[1]+0.114*p[2];
      if (L<lo) lo=L; if (L>hi) hi=L;
    }
    return { r:r/k, g:g/k, b:b/k, spread:hi-lo };
  }

  const dist=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.g-b.g)+Math.abs(a.b-b.b);

  // Walk inward while rows stay uniform and match the outermost one.
  function depth(horiz, fromStart) {
    const n=horiz?h:w;
    const first=line(fromStart?0:n-1, horiz);
    if (first.spread>BAR_UNIFORM) return 0;
    let k=0;
    const lim=Math.floor(n*BAR_MAX);
    for (let i=1;i<lim;i++) {
      const L=line(fromStart?i:n-1-i, horiz);
      if (L.spread>BAR_UNIFORM || dist(L,first)>BAR_MATCH) break;
      k=i;
    }
    return k+1;
  }

  const top=depth(true,true), bottom=depth(true,false);
  const left=depth(false,true), right=depth(false,false);

  // Ignore a single soft edge row; only real bars are worth cutting.
  const minBar=Math.max(3, Math.round(Math.min(w,h)*0.015));
  const t=top>minBar?top:0, b2=bottom>minBar?bottom:0;
  const l=left>minBar?left:0, r2=right>minBar?right:0;
  if (!t&&!b2&&!l&&!r2) return { img, cropped:false };

  const inv=1/s;
  const rx=Math.round(l*inv), ry=Math.round(t*inv);
  const rw=Math.round((w-l-r2)*inv), rh=Math.round((h-t-b2)*inv);
  if (rw<W*0.2||rh<H*0.2) return { img, cropped:false };

  const out=document.createElement('canvas');
  out.width=rw; out.height=rh;
  out.getContext('2d').drawImage(img, rx, ry, rw, rh, 0, 0, rw, rh);
  return { img:out, cropped:true, bars:{ top:t*inv, bottom:b2*inv, left:l*inv, right:r2*inv } };
}

// ===========================================================================
// DETECTION
// ===========================================================================

const DETECT_W = 900;
const SAMPLES = 70;

function getPixels(img) {
  const s=Math.min(1,DETECT_W/Math.max(img.width,img.height));
  const w=Math.round(img.width*s), h=Math.round(img.height*s);
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cc=c.getContext('2d');
  cc.drawImage(img,0,0,w,h);
  return { d:cc.getImageData(0,0,w,h).data, w, h, scale:s };
}

const median = arr => { const s=[...arr].sort((a,b)=>a-b); return s[Math.floor(s.length/2)]; };
const colourDist = (a,b) => Math.abs(a.r-b.r)+Math.abs(a.g-b.g)+Math.abs(a.b-b.b);
const bgDist = (d,i,bg) => Math.abs(d[i]-bg.r)+Math.abs(d[i+1]-bg.g)+Math.abs(d[i+2]-bg.b);

function patchColour(px,cx,cy,radius) {
  const { d,w,h }=px; const R=[],G=[],B=[];
  for (let y=Math.max(0,cy-radius); y<=Math.min(h-1,cy+radius); y++)
    for (let x=Math.max(0,cx-radius); x<=Math.min(w-1,cx+radius); x++) {
      const i=(y*w+x)*4; R.push(d[i]); G.push(d[i+1]); B.push(d[i+2]);
    }
  return R.length ? { r:median(R), g:median(G), b:median(B) } : null;
}

// Reads the background beside one edge. `limit` is how far in it may look,
// in pixels: on the first pass a thin sliver that survives a 1% margin, on the
// second the measured gap between the frame and the card.
function marginColour(px, side, limit) {
  const { d,w,h }=px;
  let x0,x1,y0,y1;
  if (side==='left')       { x0=0;        x1=limit;   y0=h*0.15; y1=h*0.85; }
  else if (side==='right') { x0=w-limit;  x1=w;       y0=h*0.15; y1=h*0.85; }
  else if (side==='top')   { x0=w*0.15;   x1=w*0.85;  y0=0;      y1=limit;  }
  else                     { x0=w*0.15;   x1=w*0.85;  y0=h-limit; y1=h;     }

  const R=[],G=[],B=[];
  const stepX = Math.max(1, Math.round((x1-x0)/60));
  const stepY = Math.max(1, Math.round((y1-y0)/60));
  for (let y=Math.max(0,Math.floor(y0)); y<Math.min(h,y1); y+=stepY)
    for (let x=Math.max(0,Math.floor(x0)); x<Math.min(w,x1); x+=stepX) {
      const i=(y*w+x)*4; R.push(d[i]); G.push(d[i+1]); B.push(d[i+2]);
    }
  if (R.length<20) return null;
  const c={ r:median(R), g:median(G), b:median(B) };
  c.spread=median(R.map((_,i)=>Math.abs(R[i]-c.r)+Math.abs(G[i]-c.g)+Math.abs(B[i]-c.b)));
  return c;
}

// Calibration carries two things and only one of them travels between photos.
// The SEPARATION between card and surface is a property of that pairing and is
// stable. The absolute COLOUR is not - exposure and white balance shift shot to
// shot - so it is checked against each photo and dropped when it describes a
// different one. Applied blindly it makes every pixel read as card.
function buildModels(px, limits) {
  const models={};
  let mismatch=0, checked=0;

  for (const side of EDGE_KEYS) {
    const m=marginColour(px, side, limits[side]);
    let bg;

    if (state.sampled.bg && m) {
      checked++;
      const drift=colourDist(m, state.sampled.bg);
      const sep=state.sampled.card ? colourDist(state.sampled.bg, state.sampled.card) : 200;
      if (drift > Math.max(45, sep*0.35)) {
        bg={ ...m };            // this photo's own background wins
        mismatch++;
      } else {
        bg={ ...state.sampled.bg, spread:m.spread };
      }
    } else if (state.sampled.bg) {
      bg={ ...state.sampled.bg, spread:12 };
    } else if (m) {
      bg=m;
    } else {
      bg={ r:128,g:128,b:128,spread:20 };
    }

    // The threshold has to clear two things: this photo's own background noise,
    // and however far the reference colour sits from this photo's background.
    // Miss the second and the background itself reads as card - which is what
    // a borrowed calibration does when the light has shifted between shots.
    const spread = m ? m.spread : 12;
    const drift  = m ? colourDist(m, bg) : 0;
    bg.threshold = Math.max(34, spread*3.2, drift*2.0);
    models[side]=bg;
  }

  models.__mismatch = checked ? mismatch/checked : 0;
  return models;
}

function scanRay(px,bg,x0,y0,dx,dy,steps,mmPerStep) {
  const { d,w,h }=px;
  const RUN=5;
  const lum=t=>{
    const x=Math.round(x0+dx*t), y=Math.round(y0+dy*t);
    if (x<0||y<0||x>=w||y>=h) return null;
    const i=(y*w+x)*4;
    return 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
  };
  const far=t=>{
    const x=Math.round(x0+dx*t), y=Math.round(y0+dy*t);
    if (x<0||y<0||x>=w||y>=h) return -1;
    return bgDist(d,(y*w+x)*4,bg);
  };

  // A card is large; a groove, a shadow line or a seam in the surface is not.
  // A candidate edge is PREFERRED if the region stays mostly foreground past
  // it. But dark artwork reads as background, so this can never be a hard
  // requirement — if nothing satisfies it, the first candidate is used, which
  // is exactly what happened before the test existed. The refinement can only
  // improve on the old answer, never fall below it.
  const confirm=Math.max(12, Math.round(steps*0.22));
  let hit=-1, first=-1, run=0;
  for (let t=0;t<steps;t++) {
    const v=far(t);
    if (v<0) break;
    if (v>bg.threshold) {
      if (++run>=RUN) {
        const start=t-RUN+1;
        if (first<0) first=start;
        let fg=0, tested=0;
        for (let u=start; u<Math.min(steps,start+confirm); u+=2) {
          const w=far(u);
          if (w<0) break;
          tested++;
          if (w>bg.threshold) fg++;
        }
        if (tested && fg/tested>0.62) { hit=start; break; }
        run=0;
        t=start+Math.max(2, Math.round(confirm*0.3));   // step over the clutter
      }
    } else run=0;
  }
  if (hit<0) hit=first;               // nothing persisted: behave as before
  if (hit===0) return { atFrame:true };   // foreground from pixel zero
  if (hit<1) return null;

  const reach=Math.max(6, Math.round(REFINE_MM/mmPerStep));
  const grad={};
  let bestT=hit, bestV=-1;
  for (let t=Math.max(2,hit-2); t<=hit+reach; t++) {
    const a=lum(t-2), b=lum(t+2);
    if (a===null||b===null) continue;
    const v=Math.abs(b-a);
    grad[t]=v;
    if (v>bestV) { bestV=v; bestT=t; }
  }

  let doubled=false;
  const lo=Math.round(0.4/mmPerStep), hi=Math.round(1.6/mmPerStep);
  for (let t=bestT+Math.max(3,lo); t<=bestT+hi; t++) {
    const a=lum(t-2), b=lum(t+2);
    if (a===null||b===null) continue;
    if (Math.abs(b-a)>bestV*0.55) { doubled=true; break; }
  }

  const g0=grad[bestT-1], g1=grad[bestT], g2=grad[bestT+1];
  let t=bestT;
  if (g0!==undefined&&g1!==undefined&&g2!==undefined) {
    const den=g0-2*g1+g2;
    if (Math.abs(den)>1e-6) t+=Math.max(-1,Math.min(1,0.5*(g0-g2)/den));
  }
  return { x:x0+dx*t, y:y0+dy*t, doubled, offset:t-hit, depth:t };
}

function fitLine(pts,vertical) {
  let sa=0,sb=0,saa=0,sab=0; const n=pts.length;
  for (const p of pts) {
    const a=vertical?p.y:p.x, b=vertical?p.x:p.y;
    sa+=a; sb+=b; saa+=a*a; sab+=a*b;
  }
  const den=n*saa-sa*sa;
  if (Math.abs(den)<1e-9) return null;
  const m=(n*sab-sa*sb)/den;
  return { m, c:(sb-m*sa)/n, vertical };
}

const lineDist=(L,p)=>Math.abs((L.vertical?p.x:p.y)-(L.m*(L.vertical?p.y:p.x)+L.c))/Math.sqrt(1+L.m*L.m);

function robustFit(pts,vertical) {
  let keep=pts.slice(), L=fitLine(keep,vertical);
  if (!L) return null;
  for (let pass=0;pass<4&&keep.length>8;pass++) {
    const d=keep.map(p=>lineDist(L,p));
    const cut=Math.max(1.2, median(d)*2.5);
    const next=keep.filter((p,i)=>d[i]<=cut);
    if (next.length<8||next.length===keep.length) break;
    keep=next; L=fitLine(keep,vertical)||L;
  }
  const res=keep.map(p=>lineDist(L,p));
  return { line:L, keep, rms:Math.sqrt(res.reduce((s,v)=>s+v*v,0)/res.length), all:pts };
}

// A card edge puts every ray at nearly the same depth - a sharp cluster. A
// scratch, a seam or speckled texture scatters them. So the densest cluster of
// depths is the card, and it wins even when clutter outnumbers it, which is
// where a median-based filter fails: with mostly garbage the median IS garbage.
function depthMode(pts, binPx) {
  if (pts.length<12) return pts;
  const ds=pts.map(p=>p.depth);
  const lo=Math.min(...ds), hi=Math.max(...ds);
  if (hi-lo < binPx*2) return pts;

  const nb=Math.max(4, Math.ceil((hi-lo)/binPx));
  const bins=new Array(nb).fill(0);
  for (const d of ds) bins[Math.min(nb-1, Math.floor((d-lo)/binPx))]++;

  // Three adjacent bins, so a cluster straddling a boundary is not split.
  let best=0, bestSum=-1;
  for (let i=0;i<nb;i++) {
    const sum=(bins[i-1]||0)+bins[i]+(bins[i+1]||0);
    if (sum>bestSum) { bestSum=sum; best=i; }
  }
  const centre=lo+(best+0.5)*binPx;
  const keep=pts.filter(p=>Math.abs(p.depth-centre)<=binPx*2.5);
  return keep.length>=12 ? keep : pts;
}

const scaleUp = inv => p => ({ x:p.x*inv, y:p.y*inv });

const SIDES = {
  left:{vertical:true,along:'y',dir:1},
  right:{vertical:true,along:'y',dir:-1},
  top:{vertical:false,along:'x',dir:1},
  bottom:{vertical:false,along:'x',dir:-1}
};

// One full sweep of all four edges. `ranges` says where along each edge the
// rays are fired from. Sweeping a fixed fraction of the FRAME wastes rays off
// the ends of the card whenever the card does not fill the shot, so pass two
// hands in the card's own extent instead.
function runScan(px, models, mmPerStep, ranges) {
  const { w,h }=px;
  const result={};
  for (const [key,s] of Object.entries(SIDES)) {
    const bg=models[key];
    const start=s.dir===1 ? 0 : (s.along==='y'?w-1:h-1);
    const depth=Math.round((s.along==='y'?w:h)*0.48);
    const { from, to }=ranges[key];
    const pts=[]; let doubled=0, atFrame=0; const offsets=[], depths=[];

    for (let i=0;i<SAMPLES;i++) {
      const u=from+(to-from)*i/(SAMPLES-1);
      const hit=s.along==='y'
        ? scanRay(px,bg,start,u,s.dir,0,depth,mmPerStep)
        : scanRay(px,bg,u,start,0,s.dir,depth,mmPerStep);
      if (hit && hit.atFrame) { atFrame++; continue; }
      if (hit) { pts.push(hit); if (hit.doubled) doubled++; offsets.push(hit.offset); depths.push(hit.depth); }
    }
    result[key]={ pts, doubled, offsets, depths, side:s, atFrame };
  }
  return result;
}

// Crops a region of the ORIGINAL image and rasterises it at up to `maxEdge`
// pixels. Pass one runs on the whole frame at low resolution just to find the
// card; pass two comes back here for the card alone at full detail.
function getPixelsRegion(img, rx, ry, rw, rh, maxEdge) {
  const s = Math.min(1, maxEdge/Math.max(rw,rh));
  const w = Math.max(8, Math.round(rw*s)), h = Math.max(8, Math.round(rh*s));
  const c = document.createElement('canvas');
  c.width=w; c.height=h;
  const cc = c.getContext('2d');
  cc.drawImage(img, rx, ry, rw, rh, 0, 0, w, h);
  return { d:cc.getImageData(0,0,w,h).data, w, h, scale:s, ox:rx, oy:ry };
}

function detectEdges(img) {
  // ---- pass one: whole frame, low resolution, just to locate the card ----
  const p1=getPixels(img);
  p1.ox=0; p1.oy=0;
  const w1=p1.w, h1=p1.h;

  const thin={ left:Math.max(4,Math.round(w1*0.015)), right:Math.max(4,Math.round(w1*0.015)),
               top:Math.max(4,Math.round(h1*0.015)), bottom:Math.max(4,Math.round(h1*0.015)) };
  const wideRanges={
    left:{from:h1*0.12,to:h1*0.88}, right:{from:h1*0.12,to:h1*0.88},
    top:{from:w1*0.12,to:w1*0.88},  bottom:{from:w1*0.12,to:w1*0.88}
  };

  // The step size is unknown until the card is found, so pass one uses a
  // rough guess; pass two recomputes it from the measured card.
  let models=buildModels(p1, thin);
  let scan=runScan(p1, models, CARD_MM.h/(h1*0.6), wideRanges);
  let calibDrift=models.__mismatch||0;
  let frameHits=EDGE_KEYS.reduce((a,k)=>a+(scan[k].atFrame||0),0)/(SAMPLES*4);
  let ranges=wideRanges, px=p1, mmPerStep=CARD_MM.h/(h1*0.6);

  const margins={};
  let usable=true;
  for (const key of EDGE_KEYS) {
    const ds=scan[key].depths;
    if (ds.length<10) { usable=false; break; }
    margins[key]=median(ds);
  }

  // Margins are reported against the ORIGINAL frame, whatever resolution the
  // second pass ends up using.
  const marginPct={};
  if (usable) for (const key of EDGE_KEYS) {
    marginPct[key]=margins[key]/((key==='left'||key==='right')?w1:h1)*100;
  }

  let pxPerMm=null;

  if (usable) {
    const cl=margins.left, cr=w1-margins.right, ct=margins.top, cb=h1-margins.bottom;
    const cw=cr-cl, ch=cb-ct;

    if (cw>30 && ch>30) {
      // ---- pass two: crop to the card plus a margin, at native resolution ----
      const inv1=1/p1.scale;
      const padX=cw*0.22*inv1, padY=ch*0.22*inv1;
      let rx=Math.max(0, cl*inv1-padX), ry=Math.max(0, ct*inv1-padY);
      let rw=Math.min(img.width-rx, cw*inv1+padX*2);
      let rh=Math.min(img.height-ry, ch*inv1+padY*2);

      const p2=getPixelsRegion(img, Math.round(rx), Math.round(ry), Math.round(rw), Math.round(rh), REGION_MAX);
      const cardWpx=cw*inv1*p2.scale, cardHpx=ch*inv1*p2.scale;
      const step2=CARD_MM.h/cardHpx;

      // Card position inside the crop.
      const l2=(cl*inv1-p2.ox)*p2.scale, t2=(ct*inv1-p2.oy)*p2.scale;
      const r2=l2+cardWpx, b2=t2+cardHpx;

      const limits={
        left:Math.max(3,Math.floor(l2*0.7)),
        right:Math.max(3,Math.floor((p2.w-r2)*0.7)),
        top:Math.max(3,Math.floor(t2*0.7)),
        bottom:Math.max(3,Math.floor((p2.h-b2)*0.7))
      };
      const tight={
        left:  { from:t2+cardHpx*CORNER_INSET, to:b2-cardHpx*CORNER_INSET },
        right: { from:t2+cardHpx*CORNER_INSET, to:b2-cardHpx*CORNER_INSET },
        top:   { from:l2+cardWpx*CORNER_INSET, to:r2-cardWpx*CORNER_INSET },
        bottom:{ from:l2+cardWpx*CORNER_INSET, to:r2-cardWpx*CORNER_INSET }
      };

      const m2=buildModels(p2, limits);
      const s2=runScan(p2, m2, step2, tight);
      let better=true;
      for (const key of EDGE_KEYS) if (s2[key].pts.length<12) better=false;
      if (better) {
        models=m2; scan=s2; ranges=tight; px=p2; mmPerStep=step2;
        pxPerMm=cardWpx/CARD_MM.w;
        calibDrift=m2.__mismatch||0;
        frameHits=EDGE_KEYS.reduce((a,k)=>a+(s2[k].atFrame||0),0)/(SAMPLES*4);
      }
    }
  }

  // Points come back in whatever space the winning pass used; this returns
  // them to original-image coordinates.
  const toOrig = p => ({ x:p.x/px.scale+px.ox, y:p.y/px.scale+px.oy });

  const out={},fits={},scanPts={};
  let doubledTotal=0, rayTotal=0;

  for (const key of EDGE_KEYS) {
    const { pts, doubled, offsets, side }=scan[key];
    rayTotal+=pts.length; doubledTotal+=doubled;

    if (pts.length<12) { fits[key]=null; scanPts[key]={all:pts.map(toOrig),keep:[]}; continue; }

    // Depth clustering first: the line fit cannot recover from a majority of
    // bad points, because its own outlier cutoff is derived from them.
    const binPx=Math.max(2, Math.round((px.w+px.h)/2*0.006));
    const core=depthMode(pts, binPx);
    const fit=robustFit(core, side.vertical);
    if (!fit) { fits[key]=null; scanPts[key]={all:pts.map(toOrig),keep:[]}; continue; }

    const a0=ranges[key].from, a1=ranges[key].to;
    const val=a=>fit.line.m*a+fit.line.c;
    const raw=side.vertical
      ? [{x:val(a0),y:a0},{x:val(a1),y:a1}]
      : [{x:a0,y:val(a0)},{x:a1,y:val(a1)}];
    out[key]=raw.map(toOrig);

    fits[key]={
      kept:fit.keep.length, total:SAMPLES,
      rms:fit.rms/px.scale,
      doubled: pts.length?doubled/pts.length:0,
      shadowMm: offsets.length?median(offsets)*mmPerStep:0,
      marginPct: usable ? marginPct[key] : null
    };
    scanPts[key]={all:pts.map(toOrig),keep:fit.keep.map(toOrig)};
  }

  const mp=EDGE_KEYS.map(k=>fits[k]?fits[k].marginPct:null).filter(v=>v!==null);

  return {
    edges: Object.keys(out).length===4?out:null,
    fits, scanPts, models,
    sleeve: rayTotal?doubledTotal/rayTotal:0,
    margins: usable?margins:null,
    calibDrift, frameHits,
    pxPerMm,
    tightest: mp.length?Math.min(...mp):null,
    widest: mp.length?Math.max(...mp):null
  };
}

// ===========================================================================
// GEOMETRY + HOMOGRAPHY
// ===========================================================================

function intersect(a1,a2,b1,b2) {
  const d=(a1.x-a2.x)*(b1.y-b2.y)-(a1.y-a2.y)*(b1.x-b2.x);
  if (Math.abs(d)<1e-9) return null;
  const p=a1.x*a2.y-a1.y*a2.x, q=b1.x*b2.y-b1.y*b2.x;
  return { x:(p*(b1.x-b2.x)-(a1.x-a2.x)*q)/d, y:(p*(b1.y-b2.y)-(a1.y-a2.y)*q)/d };
}

function cornersFromEdges(e) {
  const tl=intersect(e.top[0],e.top[1],e.left[0],e.left[1]);
  const tr=intersect(e.top[0],e.top[1],e.right[0],e.right[1]);
  const br=intersect(e.bottom[0],e.bottom[1],e.right[0],e.right[1]);
  const bl=intersect(e.bottom[0],e.bottom[1],e.left[0],e.left[1]);
  return (tl&&tr&&br&&bl)?[tl,tr,br,bl]:null;
}

function solve(A,b) {
  const n=b.length,M=A.map((r,i)=>[...r,b[i]]);
  for (let col=0;col<n;col++) {
    let piv=col;
    for (let r=col+1;r<n;r++) if (Math.abs(M[r][col])>Math.abs(M[piv][col])) piv=r;
    [M[col],M[piv]]=[M[piv],M[col]];
    const p=M[col][col];
    if (Math.abs(p)<1e-12) return null;
    for (let c=col;c<=n;c++) M[col][c]/=p;
    for (let r=0;r<n;r++) { if(r===col) continue;
      const f=M[r][col]; if(!f) continue;
      for (let c=col;c<=n;c++) M[r][c]-=f*M[col][c];
    }
  }
  return M.map(r=>r[n]);
}

function homography(from,to) {
  const A=[],b=[];
  for (let i=0;i<4;i++) {
    const {x,y}=from[i],{x:u,y:v}=to[i];
    A.push([x,y,1,0,0,0,-x*u,-y*u]); b.push(u);
    A.push([0,0,0,x,y,1,-x*v,-y*v]); b.push(v);
  }
  return solve(A,b);
}

function sampleRGBA(data,w,h,x,y,out) {
  const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
  for (let c=0;c<4;c++) {
    let acc=0;
    for (let dy=0;dy<2;dy++) for (let dx=0;dx<2;dx++) {
      const pxx=Math.min(w-1,Math.max(0,x0+dx)), pyy=Math.min(h-1,Math.max(0,y0+dy));
      acc+=data[(pyy*w+pxx)*4+c]*(dx?fx:1-fx)*(dy?fy:1-fy);
    }
    out[c]=acc;
  }
}

function straighten(img,quad) {
  const len=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const wide=(len(quad[0],quad[1])+len(quad[3],quad[2]))/2;
  const tall=(len(quad[0],quad[3])+len(quad[1],quad[2]))/2;
  const landscape=wide>tall;
  const mmW=landscape?CARD_MM.h:CARD_MM.w, mmH=landscape?CARD_MM.w:CARD_MM.h;
  const H=Math.round(mmH>mmW?MAX_EDGE:MAX_EDGE*mmH/mmW), W=Math.round(H*mmW/mmH);

  const src=document.createElement('canvas');
  src.width=img.width; src.height=img.height;
  src.getContext('2d').drawImage(img,0,0);
  const sd=src.getContext('2d').getImageData(0,0,img.width,img.height).data;

  const h=homography([{x:0,y:0},{x:W,y:0},{x:W,y:H},{x:0,y:H}],quad);
  if (!h) return null;

  const out=document.createElement('canvas');
  out.width=W; out.height=H;
  const od=out.getContext('2d').createImageData(W,H);
  const p=[0,0,0,0];
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) {
    const dd=h[6]*x+h[7]*y+1;
    const u=(h[0]*x+h[1]*y+h[2])/dd, v=(h[3]*x+h[4]*y+h[5])/dd;
    const i=(y*W+x)*4;
    if (u<0||v<0||u>=img.width||v>=img.height) { od.data[i+3]=255; continue; }
    sampleRGBA(sd,img.width,img.height,u,v,p);
    od.data[i]=p[0]; od.data[i+1]=p[1]; od.data[i+2]=p[2]; od.data[i+3]=255;
  }
  out.getContext('2d').putImageData(od,0,0);
  return { canvas:out, w:W, h:H, mmPerPx:mmW/W, landscape };
}

function tiltCheck(quad) {
  const len=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const r=(a,b)=>Math.max(a,b)/Math.max(1,Math.min(a,b));
  return Math.max(r(len(quad[0],quad[1]),len(quad[3],quad[2])),
                  r(len(quad[0],quad[3]),len(quad[1],quad[2])));
}

// ===========================================================================
// CORNERS
//
// Nothing here produces a grade. Corner condition is an appearance judgement,
// not a measurement, so the job is to magnify each corner and to quantify one
// specific thing - how much of the border has gone pale - while reporting how
// much signal was actually available to say it with.
// ===========================================================================

function sourceData(img) {
  const c=document.createElement('canvas');
  c.width=img.width; c.height=img.height;
  const cc=c.getContext('2d');
  cc.drawImage(img,0,0);
  return { d:cc.getImageData(0,0,img.width,img.height).data, w:img.width, h:img.height };
}

// Maps millimetre coordinates on the card straight to pixels in the photo.
function cardToSource(quad, mmW, mmH) {
  return homography([{x:0,y:0},{x:mmW,y:0},{x:mmW,y:mmH},{x:0,y:mmH}], quad);
}

// Lifts a rectangle of the card, given in millimetres, out of the original
// photo at whatever resolution is asked for.
function cropCard(src, H, x0, y0, wmm, hmm, pxPerMm) {
  const W=Math.max(1,Math.round(wmm*pxPerMm)), Hh=Math.max(1,Math.round(hmm*pxPerMm));
  const out=document.createElement('canvas');
  out.width=W; out.height=Hh;
  const octx=out.getContext('2d');
  const od=octx.createImageData(W,Hh);
  const p=[0,0,0,0];

  for (let j=0;j<Hh;j++) for (let i=0;i<W;i++) {
    const mx=x0+i/pxPerMm, my=y0+j/pxPerMm;
    const den=H[6]*mx+H[7]*my+1;
    const u=(H[0]*mx+H[1]*my+H[2])/den;
    const v=(H[3]*mx+H[4]*my+H[5])/den;
    const k=(j*W+i)*4;
    if (u<0||v<0||u>=src.w||v>=src.h) { od.data[k+3]=255; continue; }
    sampleRGBA(src.d,src.w,src.h,u,v,p);
    od.data[k]=p[0]; od.data[k+1]=p[1]; od.data[k+2]=p[2]; od.data[k+3]=255;
  }
  octx.putImageData(od,0,0);
  return { canvas:out, data:od, w:W, h:Hh };
}

// The colour of healthy border, taken from the middle of all four edges where
// wear is least likely. This is the yardstick the corners are judged against,
// and it comes from this card under this light rather than from any table.
function borderReference(src, H, mmW, mmH, pxPerMm) {
  const R=[],G=[],B=[];
  const inA=0.45, inB=1.7;               // mm in from the card edge

  const strips=[
    { x0:mmW*0.30, x1:mmW*0.70, y0:inA, y1:inB, horiz:true  },
    { x0:mmW*0.30, x1:mmW*0.70, y0:mmH-inB, y1:mmH-inA, horiz:true },
    { x0:inA, x1:inB, y0:mmH*0.30, y1:mmH*0.70, horiz:false },
    { x0:mmW-inB, x1:mmW-inA, y0:mmH*0.30, y1:mmH*0.70, horiz:false }
  ];

  for (const st of strips) {
    const crop=cropCard(src,H,st.x0,st.y0,st.x1-st.x0,st.y1-st.y0,Math.min(12,pxPerMm));
    const d=crop.data.data;
    for (let i=0;i<d.length;i+=4) { R.push(d[i]); G.push(d[i+1]); B.push(d[i+2]); }
  }
  if (!R.length) return null;

  const ref={ r:median(R), g:median(G), b:median(B) };

  // How far this border sits from white is the whole budget for detecting
  // whitening. A silver border has far less of it than a yellow one.
  const tw={ r:255-ref.r, g:255-ref.g, b:255-ref.b };
  ref.headroom=Math.hypot(tw.r,tw.g,tw.b);
  ref.toWhite=tw;

  // How much healthy border varies on its own, which sets the noise floor.
  const proj=[];
  for (let i=0;i<R.length;i++) {
    proj.push(((R[i]-ref.r)*tw.r+(G[i]-ref.g)*tw.g+(B[i]-ref.b)*tw.b)/(ref.headroom||1));
  }
  const m=median(proj);
  ref.spread=median(proj.map(v=>Math.abs(v-m)))||1;
  return ref;
}

// Distance from a point to the card's outer boundary, measured in the corner's
// own frame with the card corner at the origin. Handles the rounded part.
function edgeDistance(u,v,r) {
  if (u<r && v<r) {
    const d=Math.hypot(u-r,v-r);
    return d<=r ? r-d : -1;              // negative means outside the card
  }
  return (u<0||v<0) ? -1 : Math.min(u,v);
}

// Flags border pixels that have moved toward white, and paints them.
function analyseCorner(crop, which, pxPerMm, ref, sensitivity) {
  const { data, w, h }=crop;
  const d=data.data;
  const tint=document.createElement('canvas');
  tint.width=w; tint.height=h;
  const tctx=tint.getContext('2d');
  const td=tctx.createImageData(w,h);

  // Threshold in multiples of how much healthy border varies on its own. An
  // absolute floor here would stop the slider doing anything on a smooth
  // border, which hides the difference between "clean" and "stuck".
  const cut=Math.max(0.4, ref.spread)*sensitivity;
  let flagged=0, zone=0, peak=0;

  for (let j=0;j<h;j++) for (let i=0;i<w;i++) {
    // Fold every corner into the same orientation so one rule covers all four.
    const u=(which==='tr'||which==='br' ? (w-1-i) : i)/pxPerMm;
    const v=(which==='bl'||which==='br' ? (h-1-j) : j)/pxPerMm;

    const dist=edgeDistance(u,v,CORNER_R_MM);
    const k=(j*w+i)*4;
    if (dist<0 || dist>BORDER_ZONE_MM) continue;
    zone++;

    const pr=d[k]-ref.r, pg=d[k+1]-ref.g, pb=d[k+2]-ref.b;
    const toward=(pr*ref.toWhite.r+pg*ref.toWhite.g+pb*ref.toWhite.b)/(ref.headroom||1);

    if (toward>peak) peak=toward;
    if (toward>cut) {
      flagged++;
      td.data[k]=255; td.data[k+1]=70; td.data[k+2]=60; td.data[k+3]=150;
    }
  }
  tctx.putImageData(td,0,0);

  const mm2=flagged/(pxPerMm*pxPerMm);
  const zoneMm2=zone/(pxPerMm*pxPerMm);
  // `peak` is the palest pixel found, reported whether or not anything tripped
  // the threshold - it turns an empty result into something you can act on.
  return { mm2, zoneMm2, pct: zoneMm2? flagged/zone*100 : 0, tint, peak, cut };
}

function buildCorners() {
  const quad=state.quad, flat=state.flat;
  if (!quad||!flat) return;

  const mmW=flat.landscape?CARD_MM.h:CARD_MM.w;
  const mmH=flat.landscape?CARD_MM.w:CARD_MM.h;

  const H=cardToSource(quad,mmW,mmH);
  if (!H) return;

  const len=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const nativePxPerMm=((len(quad[0],quad[1])+len(quad[3],quad[2]))/2)/mmW;
  const pxPerMm=Math.min(38, Math.max(14, nativePxPerMm*1.7));

  const src=sourceData(state.img);
  const ref=borderReference(src,H,mmW,mmH,pxPerMm);
  if (!ref) return;

  const S=CORNER_VIEW_MM;
  const spots={
    tl:[0,0], tr:[mmW-S,0], br:[mmW-S,mmH-S], bl:[0,mmH-S]
  };

  const out={};
  for (const [key,[x0,y0]] of Object.entries(spots)) {
    const crop=cropCard(src,H,x0,y0,S,S,pxPerMm);
    const an=analyseCorner(crop,key,pxPerMm,ref,state.cornerSens);
    out[key]={ crop, ...an };
  }

  state.cornerRef=ref;
  state.cornerPxPerMm=pxPerMm;
  state.cornerNative=nativePxPerMm;
  state.corners=out;
}

const CORNER_ORDER=['tl','tr','bl','br'];
const CORNER_NAME={tl:'Top left',tr:'Top right',bl:'Bottom left',br:'Bottom right'};

// Says plainly how much signal was available, because on a pale border the
// answer is "not much" and that matters more than the number itself.
function renderCornerNote() {
  const el=document.getElementById('cornerNote');
  if (!el||!state.cornerRef) return;
  const ref=state.cornerRef;
  const head=ref.headroom;
  const q = head>170 ? 'plenty of' : head>110 ? 'workable' : 'very little';
  const warn = head<=110
    ? ' On a border this pale, a highlight and a worn patch look almost the same — treat the numbers as a prompt to look, not as a verdict.'
    : '';
  // Peak is the palest pixel found anywhere in a corner's border zone. When
  // every peak sits under the cut, nothing gets flagged - and the gap between
  // the two is what tells you whether that means clean or under-sensitive.
  const peaks=state.corners?CORNER_ORDER.map(k=>state.corners[k].peak):[];
  const cut=state.corners?state.corners.tl.cut:0;
  const maxPeak=peaks.length?Math.max(...peaks):0;
  const headline = maxPeak<cut
    ? `Nothing tripped the threshold. The palest pixel in any corner reads <b>${maxPeak.toFixed(1)}</b>
       against a cut of <b>${cut.toFixed(1)}</b> \u2014 wind sensitivity down until red starts appearing
       and you will see what the border's own variation looks like, which is the level to stay above.`
    : `Areas tinted red have shifted toward white relative to healthy border sampled from the
       middle of all four edges.`;

  el.innerHTML =
    `${headline}
     There is <b>${q}</b> separation here (${Math.round(head)} of 442)
     between that border and pure white.${warn}
     Detection ran at ${state.cornerPxPerMm.toFixed(0)} px/mm.
     <b>These are measurements, not a grade</b> — glare, holo shimmer and print texture all
     read as whitening. Trust your eyes on the magnified views; use the numbers to compare
     one corner against another.`;
}

function renderCorners() {
  const grid=document.getElementById('cornerGrid');
  if (!grid) return;
  if (state.step!==3||!state.corners) { grid.innerHTML=''; return; }

  grid.innerHTML=CORNER_ORDER.map(k=>{
    const c=state.corners[k];
    const q=c.pct<0.8?'good':c.pct<4?'soft':'bad';
    return `<figure class="cnr" data-q="${q}">
      <div class="cnrView" id="cv-${k}"></div>
      <figcaption><span>${CORNER_NAME[k]}</span>
        <em>peak ${c.peak.toFixed(1)} / cut ${c.cut.toFixed(1)}</em>
        <b>${c.mm2.toFixed(2)} mm&sup2;</b></figcaption>
    </figure>`;
  }).join('');

  for (const k of CORNER_ORDER) {
    const holder=document.getElementById('cv-'+k);
    const c=state.corners[k];
    const view=document.createElement('canvas');
    view.width=c.crop.w; view.height=c.crop.h;
    const vc=view.getContext('2d');
    vc.drawImage(c.crop.canvas,0,0);
    if (state.showWhitening) vc.drawImage(c.tint,0,0);
    holder.appendChild(view);
  }
}

// ===========================================================================
// COLLECTION
//
// Records live in localStorage, which is convenient and not durable - a browser
// can clear it, and a file:// page keeps its own. Export is therefore treated as
// part of normal use rather than an afterthought.
// ===========================================================================

const STORE_KEY='centeringGauge.v1';

function storeAvailable() {
  try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; }
  catch(e) { return false; }
}

let memoryStore={ cards:[], nextId:1, lastExport:null };

function loadStore() {
  if (!storeAvailable()) return memoryStore;
  try {
    const raw=localStorage.getItem(STORE_KEY);
    if (!raw) return { cards:[], nextId:1, lastExport:null };
    const o=JSON.parse(raw);
    return { cards:o.cards||[], nextId:o.nextId||1, lastExport:o.lastExport||null };
  } catch(e) { return { cards:[], nextId:1, lastExport:null }; }
}

function writeStore(st) {
  memoryStore=st;
  if (!storeAvailable()) return { ok:true, memoryOnly:true };
  try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); return { ok:true }; }
  catch(e) { return { ok:false, error:'Storage is full. Export what you have, then remove some records.' }; }
}

function storeBytes() {
  if (!storeAvailable()) return 0;
  const raw=localStorage.getItem(STORE_KEY);
  return raw?raw.length:0;
}

// A small JPEG of the straightened card, so the list is scannable by eye.
function makeThumb(flat, w) {
  const c=document.createElement('canvas');
  const scale=w/flat.w;
  c.width=Math.round(w); c.height=Math.round(flat.h*scale);
  c.getContext('2d').drawImage(flat.canvas,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg',0.72);
}

// Everything measured about the card in front of you, frozen into a record.
function buildRecord() {
  const f=state.flat, g=state.guides;
  if (!f||!g) return null;

  const left=g.left, right=f.w-g.right, top=g.top, bottom=f.h-g.bottom;
  const hPct=ratio(left,right), vPct=ratio(top,bottom);
  const worst=Math.max(hPct??0, vPct??0);
  const tol=TOLERANCE[state.side];
  const hit=tol.findIndex(t=>worst<=t.max);

  const mm=v=>+(v*f.mmPerPx).toFixed(3);

  const rec={
    id:null, savedAt:new Date().toISOString(),
    card:{ name:'', set:'', number:'', rarity:'', notes:'' },
    type:state.cardType, side:state.side,
    centering:{
      leftMm:mm(left), rightMm:mm(right), topMm:mm(top), bottomMm:mm(bottom),
      hPct:+(hPct??0).toFixed(2), vPct:+(vPct??0).toFixed(2),
      worst:+worst.toFixed(2),
      ceiling: hit===-1 ? null : tol[hit].g
    },
    corners:null, edges:null,
    quality:{
      pxPerMm: state.pxPerMm?+state.pxPerMm.toFixed(1):null,
      separation: state.borderRef?Math.round(state.borderRef.headroom):null,
      sensitivity: state.cornerSens,
      depthMm: state.edgeDepth,
      guideSource: state.guideSource?{...state.guideSource}:null
    },
    thumb:makeThumb(f,150)
  };

  if (state.corners) {
    rec.corners={};
    for (const k of CORNER_ORDER) {
      const c=state.corners[k];
      rec.corners[k]={ mm2:+c.mm2.toFixed(3), peak:+c.peak.toFixed(1), cut:+c.cut.toFixed(1) };
    }
  }
  if (state.edgeScan) {
    rec.edges={};
    for (const k of EDGE_ORDER) {
      const e=state.edgeScan[k]; if (!e) continue;
      rec.edges[k]={
        mm2:+e.mm2.toFixed(3), peak:+e.peak.toFixed(1), cut:+e.cut.toFixed(1),
        spikes:e.spikes.map(i=>({
          mm:+(e.startMm+(i/e.profile.length)*e.spanMm).toFixed(1),
          depthMm:+e.centroid[i].toFixed(2)
        }))
      };
    }
  }
  return rec;
}

function saveCurrentCard() {
  const rec=buildRecord();
  if (!rec) return { ok:false, error:'Straighten a card first.' };
  const st=loadStore();
  rec.id='#'+String(st.nextId).padStart(4,'0');
  st.nextId++;
  st.cards.unshift(rec);
  const w=writeStore(st);
  return w.ok ? { ok:true, id:rec.id, memoryOnly:w.memoryOnly } : w;
}

// ---- summary helpers used by the list ----
const worstCorner = r => r.corners
  ? Math.max(...CORNER_ORDER.map(k=>r.corners[k]?r.corners[k].mm2:0)) : null;
const worstEdge = r => r.edges
  ? Math.max(...EDGE_ORDER.map(k=>r.edges[k]?r.edges[k].mm2:0)) : null;

function exportCards() {
  const st=loadStore();
  const blob=new Blob([JSON.stringify(st,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='card-gauge-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  URL.revokeObjectURL(a.href);
  st.lastExport=new Date().toISOString();
  writeStore(st);
  renderCollection();
}

function importCards(file) {
  const fr=new FileReader();
  fr.onload=()=>{
    let incoming;
    try { incoming=JSON.parse(fr.result); } catch(e) { alert('That file is not valid JSON.'); return; }
    const list=Array.isArray(incoming)?incoming:(incoming.cards||[]);
    if (!list.length) { alert('No records found in that file.'); return; }

    const st=loadStore();
    const seen=new Set(st.cards.map(c=>c.id+'|'+c.savedAt));
    let added=0;
    for (const rec of list) {
      const key=rec.id+'|'+rec.savedAt;
      if (seen.has(key)) continue;           // same record, already here
      // Re-number anything whose id is taken by a different record.
      if (st.cards.some(c=>c.id===rec.id)) {
        rec.id='#'+String(st.nextId).padStart(4,'0');
        st.nextId++;
      }
      st.cards.push(rec); seen.add(key); added++;
    }
    st.cards.sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
    const w=writeStore(st);
    if (!w.ok) { alert(w.error); return; }
    renderCollection();
    alert(added+' record'+(added===1?'':'s')+' added.');
  };
  fr.readAsText(file);
}

// ===========================================================================
// CARD LOOKUP
//
// pokemontcg.io returns identification and prices in one response. Two things
// to be clear about:
//
//   - The call happens from the browser, so it depends on the API permitting
//     cross-origin requests. If it does not, the failure is reported plainly
//     rather than swallowed.
//   - Prices are for RAW, ungraded cards. Deciding whether to submit needs the
//     gap between raw and graded value, which no free API publishes. This says
//     what the card is worth now, not what a 10 would fetch.
// ===========================================================================

const API_BASE='https://api.pokemontcg.io/v2';
const KEY_STORE='centeringGauge.apiKey';

const apiKey=()=>{ try { return localStorage.getItem(KEY_STORE)||''; } catch(e) { return ''; } };
const setApiKey=k=>{ try { k?localStorage.setItem(KEY_STORE,k):localStorage.removeItem(KEY_STORE); } catch(e){} };

// Cardmarket first: euros, and the closer market for Europe. TCGplayer covers
// the rest. Foil variants are checked because plenty of cards have no plain
// printing at all.
function bestPrice(card) {
  const cm=card.cardmarket&&card.cardmarket.prices;
  if (cm) {
    const v=cm.trendPrice||cm.averageSellPrice||cm.avg7||cm.avg30;
    if (v) return { value:v, currency:'EUR', source:'Cardmarket',
                    updated:card.cardmarket.updatedAt||null,
                    low:cm.lowPrice||null, url:card.cardmarket.url||null };
  }
  const tp=card.tcgplayer&&card.tcgplayer.prices;
  if (tp) {
    for (const k of ['normal','holofoil','reverseHolofoil','1stEditionHolofoil','1stEditionNormal']) {
      const p=tp[k];
      if (p && (p.market||p.mid)) {
        return { value:p.market||p.mid, currency:'USD', source:'TCGplayer '+k,
                 updated:card.tcgplayer.updatedAt||null,
                 low:p.low||null, url:card.tcgplayer.url||null };
      }
    }
  }
  return null;
}

// A bare collector number like 092/086 searches by number; anything else by name.
function buildQuery(text) {
  const t=text.trim();
  const m=t.match(/^(\d{1,3})\s*\/\s*(\d{1,3})$/);
  // The number keeps its leading zeros because that is how it is printed, but
  // printedTotal is a plain integer in the API and will not match "086".
  if (m) return `number:"${m[1]}" set.printedTotal:${parseInt(m[2],10)}`;
  const only=t.match(/^#?(\d{1,3})$/);
  if (only) return `number:"${only[1]}"`;
  return `name:"*${t.replace(/"/g,'')}*"`;
}

async function searchCards(text) {
  const q=buildQuery(text);
  const url=`${API_BASE}/cards?q=${encodeURIComponent(q)}&pageSize=12`
          + `&orderBy=-set.releaseDate`;
  const headers={};
  const k=apiKey();
  if (k) headers['X-Api-Key']=k;

  let res;
  try {
    res=await fetch(url,{ headers });
  } catch(e) {
    // A blocked cross-origin request surfaces here as a bare TypeError.
    throw new Error('Could not reach the card database. This is usually the API '
      + 'refusing browser requests from this page, or no connection. Nothing is wrong with your data.');
  }
  if (res.status===429) throw new Error('Rate limited. Add a free API key to lift the limit, or wait a minute.');
  if (res.status===403) throw new Error('The API rejected the request (403). If you set a key, check it.');
  if (!res.ok) throw new Error('Card database returned '+res.status+'.');

  const json=await res.json();
  return (json.data||[]).map(c=>({
    id:c.id, name:c.name,
    set:c.set?c.set.name:'', setId:c.set?c.set.id:'',
    number:c.number+(c.set&&c.set.printedTotal?'/'+c.set.printedTotal:''),
    rarity:c.rarity||'',
    thumb:c.images?c.images.small:null,
    price:bestPrice(c)
  }));
}

// Writes a chosen result onto a stored record.
function attachCard(recId, hit) {
  const st=loadStore();
  const rec=st.cards.find(c=>c.id===recId);
  if (!rec) return;
  rec.card.name=hit.name;
  rec.card.set=hit.set;
  rec.card.number=hit.number;
  rec.card.rarity=hit.rarity;
  rec.market = hit.price ? { ...hit.price, at:new Date().toISOString(), apiId:hit.id } : null;
  rec.apiId=hit.id;
  writeStore(st);
  renderCollection();
}

async function refreshPrice(recId) {
  const st=loadStore();
  const rec=st.cards.find(c=>c.id===recId);
  if (!rec||!rec.apiId) return;
  const headers={}; const k=apiKey(); if (k) headers['X-Api-Key']=k;
  const res=await fetch(`${API_BASE}/cards/${encodeURIComponent(rec.apiId)}`,{ headers });
  if (!res.ok) throw new Error('Lookup returned '+res.status+'.');
  const json=await res.json();
  const p=bestPrice(json.data||{});
  const st2=loadStore();
  const r2=st2.cards.find(c=>c.id===recId);
  if (r2) { r2.market = p ? { ...p, at:new Date().toISOString(), apiId:rec.apiId } : null; writeStore(st2); }
  renderCollection();
}

const money=m=>{
  if (!m) return '—';
  const sym=m.currency==='EUR'?'\u20ac':m.currency==='USD'?'$':'';
  return sym+m.value.toFixed(2);
};

// ===========================================================================
// COLLECTION VIEW
// ===========================================================================

const COLS=[
  { k:'id',    label:'ID',        get:r=>r.id },
  { k:'name',  label:'Card',      get:r=>r.card.name||'—' },
  { k:'worst', label:'Centering', get:r=>r.centering.worst },
  { k:'ceil',  label:'Ceiling',
    get:r=>(r.centering.combinedCeiling!==undefined&&r.centering.combinedCeiling!==null)
      ? r.centering.combinedCeiling : (r.centering.ceiling??0) },
  { k:'cnr',   label:'Corners',   get:r=>worstCorner(r) },
  { k:'edg',   label:'Edges',     get:r=>worstEdge(r) },
  { k:'val',   label:'Value',     get:r=>r.market?r.market.value:-1 },
  { k:'date',  label:'Saved',     get:r=>r.savedAt }
];

const rowName = r =>
  (r.card.name ? r.card.name : '<i>click to name</i>') +
  (r.card.number ? ` <em>${r.card.number}</em>` : '');

function renderCollection() {
  const host=document.getElementById('collection');
  if (!host) return;
  const st=loadStore();
  const cards=st.cards.slice();

  const sk=state.sortKey, dir=state.sortDir;
  const col=COLS.find(c=>c.k===sk);
  if (col) cards.sort((a,b)=>{
    const x=col.get(a), y=col.get(b);
    const c = (x===null||x===undefined)?1:(y===null||y===undefined)?-1
      : (typeof x==='number'? x-y : String(x).localeCompare(String(y)));
    return dir==='asc'?c:-c;
  });

  const bytes=storeBytes();
  const kb=(bytes/1024).toFixed(0);
  const warn = !storeAvailable()
    ? '<span data-warn="1">This browser will not persist data from a local file — export before closing.</span>'
    : bytes>3.6e6
    ? '<span data-warn="1">Storage is nearly full. Export and prune.</span>'
    : st.lastExport
    ? 'Last export '+st.lastExport.slice(0,10)
    : '<span data-warn="1">Never exported. Browser storage can be cleared without warning.</span>';

  host.innerHTML=`
    <div class="collBar">
      <b>${st.cards.length}</b> card${st.cards.length===1?'':'s'}
      <em>${kb} KB</em>
      <span class="collNote">${warn}</span>
      <button class="btn" id="priceBtn">Refresh prices</button>
      <button class="btn" id="keyBtn">${apiKey()?'API key set':'API key'}</button>
      <button class="btn" id="expBtn">Export</button>
      <button class="btn" id="impBtn">Import</button>
      <input type="file" id="impFile" accept="application/json" hidden>
    </div>
    ${cards.length?`
    <table class="coll">
      <thead><tr><th></th>${COLS.map(c=>
        `<th data-k="${c.k}" ${sk===c.k?`data-sort="${dir}"`:''}>${c.label}</th>`).join('')}<th></th></tr></thead>
      <tbody>${cards.map(r=>{
        const wc=worstCorner(r), we=worstEdge(r);
        const cg=(r.centering.combinedCeiling!==undefined&&r.centering.combinedCeiling!==null)
          ? r.centering.combinedCeiling : r.centering.ceiling;
        return `<tr data-id="${r.id}">
          <td class="tImg">${r.thumb?`<img src="${r.thumb}" alt="">`:''}</td>
          <td class="mono">${r.id}</td>
          <td class="cName" data-for="${r.id}">${rowName(r)}</td>
          <td class="mono">${r.centering.worst.toFixed(1)}</td>
          <td class="mono" data-g="${cg??'x'}">${cg??'<5'}</td>
          <td class="mono">${wc===null?'—':wc.toFixed(2)}</td>
          <td class="mono">${we===null?'—':we.toFixed(2)}</td>
          <td class="mono">${r.market?money(r.market):'—'}</td>
          <td class="mono dim">${r.savedAt.slice(0,10)}</td>
          <td><button class="mini" data-del="${r.id}">✕</button></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`:'<p class="hint" style="padding:18px">Nothing saved yet. Measure a card, then use <b>Save to collection</b> on the corners or edges step.</p>'}
    <div id="cardDetail"></div>`;

  document.getElementById('keyBtn').onclick=()=>{
    const cur=apiKey();
    const k=prompt('Optional API key from pokemontcg.io/api. Lifts the rate limit; '
      + 'lookups work without one. Leave blank to clear.', cur);
    if (k===null) return;
    setApiKey(k.trim());
    renderCollection();
  };

  document.getElementById('priceBtn').onclick=async()=>{
    const b=document.getElementById('priceBtn');
    const withId=loadStore().cards.filter(c=>c.apiId);
    if (!withId.length) { b.textContent='None linked'; setTimeout(()=>renderCollection(),1800); return; }
    b.disabled=true;
    let done=0, failed=0;
    for (const c of withId) {
      b.textContent=`${done+1} of ${withId.length}…`;
      try { await refreshPrice(c.id); } catch(e) { failed++; }
      done++;
      await new Promise(r=>setTimeout(r, apiKey()?120:2100));   // stay inside the free limit
    }
    renderCollection();
    if (failed) alert(failed+' of '+withId.length+' could not be refreshed.');
  };

  document.getElementById('expBtn').onclick=exportCards;
  document.getElementById('impBtn').onclick=()=>document.getElementById('impFile').click();
  document.getElementById('impFile').onchange=e=>{ if (e.target.files[0]) importCards(e.target.files[0]); };

  host.querySelectorAll('thead th[data-k]').forEach(th=>{
    th.onclick=()=>{
      const k=th.dataset.k;
      state.sortDir = (state.sortKey===k && state.sortDir==='asc') ? 'desc':'asc';
      state.sortKey=k;
      renderCollection();
    };
  });

  host.querySelectorAll('button[data-del]').forEach(b=>{
    b.onclick=ev=>{
      ev.stopPropagation();
      const id=b.dataset.del;
      if (!confirm('Delete '+id+'? This cannot be undone.')) return;
      const st2=loadStore();
      st2.cards=st2.cards.filter(c=>c.id!==id);
      writeStore(st2);
      if (state.openCard===id) state.openCard=null;
      renderCollection();
    };
  });

  host.querySelectorAll('tbody tr').forEach(tr=>{
    tr.onclick=()=>{ state.openCard = state.openCard===tr.dataset.id ? null : tr.dataset.id; renderCollection(); };
  });

  // The name cell is the common case, so it opens the row already focused.
  host.querySelectorAll('td.cName').forEach(td=>{
    td.onclick=ev=>{
      ev.stopPropagation();
      state.openCard=td.dataset.for;
      state.focusField='name';
      renderCollection();
    };
  });

  renderCardDetail();
}

function renderCardDetail() {
  const host=document.getElementById('cardDetail');
  if (!host) return;
  if (!state.openCard) { host.innerHTML=''; return; }
  const st=loadStore();
  const r=st.cards.find(c=>c.id===state.openCard);
  if (!r) { host.innerHTML=''; return; }

  const c=r.centering;
  const f=(v,d=2)=>v===null||v===undefined?'—':(+v).toFixed(d);

  host.innerHTML=`<div class="detail">
    <div class="dGrid">
      <div>
        <h3>Identification</h3>
        <div class="lookup">
          <input id="lookInput" placeholder="card name or 092/086"
                 value="${(r.card.number||r.card.name||'').replace(/"/g,'&quot;')}">
          <button id="lookGo">Find</button>
        </div>
        <p class="lookNote" id="lookNote"></p>
        <div id="lookHits"></div>
        ${r.market?`<div class="priceBox">
          <b>${money(r.market)}</b>
          <span>${r.market.source}${r.market.low?', low '+money({...r.market,value:r.market.low}):''}
            &middot; read ${r.market.at.slice(0,10)}<br>
            <em>Raw, ungraded.</em> A graded copy sells for a different figure the API does not carry.</span>
        </div>`:''}
        <label>Name <input data-f="name" value="${r.card.name||''}" placeholder="card name"></label>
        <label>Set <input data-f="set" value="${r.card.set||''}" placeholder="set code"></label>
        <label>Number <input data-f="number" value="${r.card.number||''}" placeholder="collector no."></label>
        <label>Rarity <input data-f="rarity" value="${r.card.rarity||''}" placeholder="rarity"></label>
        <label>Notes <input data-f="notes" value="${r.card.notes||''}" placeholder=""></label>
      </div>
      <div>
        <h3>Centering &mdash; ${r.side}</h3>
        <p class="mono">L ${f(c.leftMm)} &nbsp; R ${f(c.rightMm)} mm<br>
           T ${f(c.topMm)} &nbsp; B ${f(c.bottomMm)} mm<br>
           ${f(c.hPct,1)} / ${f(c.vPct,1)} &rarr; worst <b>${f(c.worst,1)}</b><br>
           ceiling <b>${c.ceiling??'<5'}</b></p>
        ${r.back?`<h3>Centering &mdash; back</h3>
        <p class="mono">L ${f(r.back.centering.leftMm)} &nbsp; R ${f(r.back.centering.rightMm)} mm<br>
           T ${f(r.back.centering.topMm)} &nbsp; B ${f(r.back.centering.bottomMm)} mm<br>
           worst <b>${f(r.back.centering.worst,1)}</b> &rarr; ceiling <b>${r.back.centering.ceiling??'<5'}</b></p>
        ${c.combinedCeiling!==undefined&&c.combinedCeiling!==null
          ? `<p class="mono">both sides &rarr; <b>${c.combinedCeiling}</b></p>`:''}`:''}
        <h3>Conditions</h3>
        <p class="mono dim">${f(r.quality.pxPerMm,1)} px/mm &middot; separation ${r.quality.separation??'—'}<br>
           sensitivity ${f(r.quality.sensitivity,1)} &middot; depth ${f(r.quality.depthMm,1)} mm</p>
      </div>
      <div>
        <h3>Corners mm&sup2;</h3>
        <p class="mono">${r.corners?CORNER_ORDER.map(k=>`${k.toUpperCase()} ${f(r.corners[k].mm2)}`).join('<br>'):'not run'}</p>
        <h3>Edges mm&sup2;</h3>
        <p class="mono">${r.edges?EDGE_ORDER.map(k=>{
          const e=r.edges[k]; if (!e) return '';
          const sp=e.spikes&&e.spikes.length
            ? ' <em>'+e.spikes.map(x=>`${x.mm}mm@${x.depthMm}`).join(' ')+'</em>' : '';
          return `${k} ${f(e.mm2)}${sp}`;
        }).filter(Boolean).join('<br>'):'not run'}</p>
      </div>
    </div>
  </div>`;

  const fields=[...host.querySelectorAll('input[data-f]')];

  const commit=inp=>{
    const st2=loadStore();
    const rec=st2.cards.find(x=>x.id===r.id);
    if (!rec) return;
    rec.card[inp.dataset.f]=inp.value.trim();
    writeStore(st2);
    // Update the one cell that changed rather than redrawing the table, so
    // the caret stays where you left it.
    const cell=document.querySelector(`td.cName[data-for="${r.id}"]`);
    if (cell) cell.innerHTML=rowName(rec);
  };

  fields.forEach((inp,i)=>{
    inp.oninput=()=>{ clearTimeout(inp._t); inp._t=setTimeout(()=>commit(inp),200); };
    inp.onblur=()=>{ clearTimeout(inp._t); commit(inp); };
    inp.onkeydown=ev=>{
      if (ev.key==='Enter') {
        ev.preventDefault();
        clearTimeout(inp._t); commit(inp);
        const next=fields[i+1];
        if (next) next.focus(); else inp.blur();
      } else if (ev.key==='Escape') {
        inp.blur();
      }
    };
  });

  const li=document.getElementById('lookInput');
  const lg=document.getElementById('lookGo');
  const ln=document.getElementById('lookNote');
  const lh=document.getElementById('lookHits');

  const setNote=(msg,err)=>{ if (ln) { ln.innerHTML=msg||''; ln.dataset.err=err?'1':'0'; } };

  const runLookup=async()=>{
    const q=(li.value||'').trim();
    if (q.length<2) { setNote('Type at least two characters, or a collector number.'); return; }
    lg.disabled=true; lg.textContent='…'; lh.innerHTML=''; setNote('Searching…');
    try {
      const hits=await searchCards(q);
      if (!hits.length) { setNote('Nothing matched. Try the card name, or the number as 092/086.'); return; }
      setNote(`${hits.length} match${hits.length===1?'':'es'} — pick one to fill the fields and read its price.`);
      lh.innerHTML='<div class="hits">'+hits.map((h,i)=>
        `<button class="hit" data-i="${i}">
           ${h.thumb?`<img src="${h.thumb}" alt="">`:''}
           <div><b>${h.name}</b><span>${h.set} · ${h.number}${h.rarity?' · '+h.rarity:''}</span></div>
           <i>${h.price?money(h.price):''}</i>
         </button>`).join('')+'</div>';
      lh.querySelectorAll('button.hit').forEach(b=>{
        b.onclick=()=>attachCard(r.id, hits[+b.dataset.i]);
      });
    } catch(e) {
      setNote(e.message, true);
    } finally {
      lg.disabled=false; lg.textContent='Find';
    }
  };

  if (lg) lg.onclick=runLookup;
  if (li) li.onkeydown=ev=>{ if (ev.key==='Enter') { ev.preventDefault(); runLookup(); } };

  // Opening a row from the name cell should land the caret in it.
  if (state.focusField) {
    const target=fields.find(f=>f.dataset.f===state.focusField);
    if (target) { target.focus(); target.select(); }
    state.focusField=null;
  }
}

function setView(v) {
  state.view=v;
  document.getElementById('rail').style.display = v==='gauge'?'':'none';
  document.getElementById('work').style.display = v==='gauge'?'':'none';
  document.getElementById('collection').style.display = v==='collection'?'':'none';
  document.getElementById('batch').style.display = v==='batch'?'':'none';
  document.getElementById('scan').style.display = v==='scan'?'':'none';
  const bb=document.getElementById('batchBtn');
  if (bb) bb.dataset.on = v==='batch'?'1':'0';
  const sb=document.getElementById('scanBtn');
  if (sb) sb.dataset.on = v==='scan'?'1':'0';
  if (v!=='scan') stopScan();
  const b=document.getElementById('collBtn');
  if (b) {
    const n=loadStore().cards.length;
    b.textContent = v==='gauge' ? `Collection (${n})` : 'Back to gauge';
    b.dataset.on = v==='collection'?'1':'0';
  }
  if (v==='collection') renderCollection();
  if (v==='batch') renderBatch();
  if (v==='scan') renderScan();
}

// ===========================================================================
// BATCH
//
// The pipeline reads and writes the shared state object, so each card borrows
// it, runs, hands back a record, and puts everything back as it was. Slower
// than a refactor would allow, but it means batch runs exactly the same code
// path as the interactive gauge rather than a parallel copy that can drift.
// ===========================================================================

const BATCH_KEYS=['img','edges','fits','scanPts','flat','quad','guides','guideSource','side',
  'guideQuality','corners','edgeScan','edgeMark','borderRef','borderH','borderSrc',
  'borderPxPerMm','borderMm','pxPerMm','sampled','aspectWarn'];

const snapshotState=()=>{ const o={}; for (const k of BATCH_KEYS) o[k]=state[k]; return o; };
const restoreState=o=>{ for (const k of BATCH_KEYS) state[k]=o[k]; };

const loadImage = file => new Promise((res,rej)=>{
  const img=new Image();
  img.onload=()=>res(img);
  img.onerror=()=>rej(new Error('could not decode'));
  img.src=URL.createObjectURL(file);
});

const nextFrame = () => new Promise(r=>setTimeout(r,0));

// Everything that could make a reading untrustworthy, gathered in one place.
function assessCard(det, quad, guideSource, rec) {
  const reasons=[];
  let level='ok';
  const flag=(lv,msg)=>{ reasons.push(msg); if (lv==='failed'||level==='ok') level=lv; };

  if (det.calibDrift>0.4)
    flag('check',`calibrated colours did not fit this photo — used its own background instead`);

  const a=aspectCheck(quad);
  if (a && a.off>0.05) flag('failed',`shape is ${a.seen.toFixed(3)} against ${a.want.toFixed(3)} expected — wrong card type, or an edge line is off`);

  const tilt=tiltCheck(quad);
  if (tilt>1.20) flag('check','strong camera angle');
  else if (tilt>1.10) flag('check','noticeable camera angle');

  if (det.pxPerMm!==null && det.pxPerMm<8)
    flag('check',`only ${det.pxPerMm.toFixed(1)} px/mm — one pixel is ${(1/det.pxPerMm).toFixed(2)} mm`);

  const weak=EDGE_KEYS.filter(k=>!det.fits[k]||det.fits[k].kept<22||det.fits[k].rms>1.2);
  if (weak.length) flag('check','loose edge fit on '+weak.join(', '));

  const assumed=EDGE_KEYS.filter(k=>guideSource[k]==='mirrored'||guideSource[k]==='none');
  if (assumed.length) flag('check','inner border assumed on '+assumed.join(', '));

  // The frame of a card is the same width all round: however off-centre it sits,
  // left+right must total about the same as top+bottom. When they do not, a
  // guide has landed somewhere it should not - and no amount of care about the
  // percentages helps, because they are computed from the wrong lines.
  const c0=rec.centering;
  const lr=c0.leftMm+c0.rightMm, tb=c0.topMm+c0.bottomMm;
  if (lr>0.2 && tb>0.2) {
    const r=Math.max(lr,tb)/Math.min(lr,tb);
    if (r>1.5) flag('failed',`border widths disagree — ${lr.toFixed(1)} mm across against ${tb.toFixed(1)} mm down. A card's frame is even, so a guide is in the wrong place`);
    else if (r>1.2) flag('check',`border widths differ — ${lr.toFixed(1)} mm across against ${tb.toFixed(1)} mm down; worth checking the guides`);
  }

  // A verdict sitting on a threshold is inside the noise, whatever the number says.
  const tol=TOLERANCE[rec.side];
  const w=rec.centering.worst;
  let near=Infinity;
  for (const t of tol) near=Math.min(near, Math.abs(w-t.max));
  if (near<1.5) flag('check',`${near.toFixed(1)} from a grade boundary — too close to call`);

  // Individually survivable, together damning. A measurement carrying three
  // separate concerns has usually gone wrong somewhere, and a confident number
  // under a pile of warnings is the exact failure this tool exists to avoid.
  if (level==='check' && reasons.length>=3) {
    return { level:'failed',
             reasons:[...reasons, `${reasons.length} concerns at once — treat this reading as unreliable`] };
  }

  return { level, reasons };
}

// Groups files by base name so Claydol_front.jpg and Claydol_back.jpg become
// one card. Anything without a side suffix is treated as a lone front.
function pairFiles(files) {
  const groups=new Map();
  for (const f of files) {
    const base=f.name.replace(/\.[^.]+$/,'');
    const m=base.match(/^(.*?)[\s_.-]+(front|back|f|b)$/i);
    if (m && m[1]) {
      const key=m[1].toLowerCase();
      const side=/^(front|f)$/i.test(m[2])?'front':'back';
      if (!groups.has(key)) groups.set(key,{ name:m[1], front:null, back:null });
      const g=groups.get(key);
      if (!g[side]) g[side]=f; else groups.set(base.toLowerCase()+'#'+Math.random(),{ name:base, front:f, back:null });
    } else {
      groups.set(base.toLowerCase()+'#solo',{ name:base, front:f, back:null });
    }
  }
  return [...groups.values()];
}

async function processOne(file, side) {
  let img;
  try { img=await loadImage(file); }
  catch(e) { return { file, name:file.name, level:'failed', reasons:['not a readable image'], rec:null }; }

  const saved=snapshotState();
  try {
    state.side=side||'front';
    const lb=stripLetterbox(img);
    state.letterbox=lb.cropped?lb.bars:null;
    state.img=img=lb.img;
    state.flat=null; state.quad=null; state.corners=null; state.edgeScan=null;
    state.edgeMark=null; state.borderRef=null;
    // A batch shares one surface and one light, so colours sampled once apply
    // to all of it. Without this the background has to be guessed per photo,
    // which is what fails on a busy or uneven backdrop.
    state.sampled = state.batchCalib
      ? { bg:{...state.batchCalib.bg}, card:{...state.batchCalib.card} }
      : { bg:null, card:null };

    const det=detectEdges(img);
    if (!det.edges) {
      const why = det.frameHits>0.4
        ? `background reference does not match this photo — ${Math.round(det.frameHits*100)}% of rays read as card from the frame edge`
        : 'could not find four card edges';
      return { file, name:file.name, level:'failed', reasons:[why], rec:null };
    }
    state.edges=det.edges;

    const quad=cornersFromEdges(det.edges);
    if (!quad) return { file, name:file.name, level:'failed', reasons:['edges do not meet at four corners'], rec:null };

    const flat=straighten(img,quad);
    if (!flat) return { file, name:file.name, level:'failed', reasons:['could not straighten'], rec:null };
    state.flat=flat; state.quad=quad;

    const inner=findInnerBorder(flat);
    state.guides={left:flat.w*0.09,right:flat.w*0.91,top:flat.h*0.09,bottom:flat.h*0.91};
    for (const k of EDGE_KEYS) if (inner.guides[k]!==null) state.guides[k]=inner.guides[k];
    state.guideSource=inner.source;
    state.guideQuality=inner.quality;

    buildCorners();
    buildEdges();

    const rec=buildRecord();
    if (!rec) return { file, name:file.name, level:'failed', reasons:['no measurement produced'], rec:null };

    const { level, reasons }=assessCard(det,quad,inner.source,rec);
    return { file, name:file.name, level, reasons, rec };
  } catch(e) {
    return { file, name:file.name, level:'failed', reasons:['error: '+e.message], rec:null };
  } finally {
    restoreState(saved);
  }
}

// One card, both sides where available. PSA judges each side against its own
// tolerance, so the card is only as good as its worse side.
async function processGroup(g) {
  const out={ name:g.name, level:'ok', reasons:[], rec:null, file:g.front||g.back,
              files:{front:g.front,back:g.back}, sides:{} };

  for (const side of ['front','back']) {
    if (!g[side]) continue;
    const r=await processOne(g[side], side);
    out.sides[side]=r;
    if (r.reasons.length) out.reasons.push(...r.reasons.map(x=>side+': '+x));
    if (r.level==='failed') out.level='failed';
    else if (r.level==='check'&&out.level==='ok') out.level='check';
  }

  const fr=out.sides.front&&out.sides.front.rec;
  const bk=out.sides.back&&out.sides.back.rec;
  const primary=fr||bk;
  if (!primary) { out.level='failed'; if (!out.reasons.length) out.reasons.push('no measurement produced'); return out; }

  const rec=primary;
  rec.card.name=g.name;
  if (fr&&bk) {
    rec.back={ centering:bk.centering, corners:bk.corners, edges:bk.edges,
               quality:bk.quality, thumb:bk.thumb };
    // The card cannot grade above its weaker side.
    const a=fr.centering.ceiling, b=bk.centering.ceiling;
    rec.centering.combinedCeiling = (a===null||b===null) ? null : Math.min(a,b);
  }
  out.rec=rec;
  return out;
}

async function runBatch(files) {
  const groups=pairFiles(files);
  state.batch={ items:[], total:groups.length, done:0, running:true };
  setView('batch');
  renderBatch();

  for (const g of groups) {
    await nextFrame();
    const item=await processGroup(g);
    state.batch.items.push(item);
    state.batch.done++;
    renderBatch();
  }
  state.batch.running=false;
  renderBatch();
}

function saveBatchItem(i) {
  const it=state.batch.items[i];
  if (!it||!it.rec||it.saved) return;
  const st=loadStore();
  const rec=JSON.parse(JSON.stringify(it.rec));
  rec.id='#'+String(st.nextId).padStart(4,'0');
  const src=[it.files&&it.files.front?it.files.front.name:null,
             it.files&&it.files.back?it.files.back.name:null].filter(Boolean).join(' + ');
  rec.card.notes=(rec.card.notes?rec.card.notes+' ':'')+'['+(src||it.name)+']';
  st.nextId++;
  st.cards.unshift(rec);
  const w=writeStore(st);
  if (!w.ok) { alert(w.error); return; }
  it.saved=rec.id;
  renderBatch();
}

// ===========================================================================
// BATCH VIEW
// ===========================================================================

const LEVEL_LABEL={ ok:'clean', check:'check', failed:'failed' };

function renderBatch() {
  const host=document.getElementById('batch');
  if (!host) return;
  const b=state.batch;

  if (!b) {
    const cal=state.batchCalib;
    const canTake=state.sampled&&state.sampled.bg&&state.sampled.card;
    const sepv=cal?Math.round(colourDist(cal.bg,cal.card)):null;

    host.innerHTML=`<div class="collBar">
        <button class="btn" data-primary id="batchPick">Choose photos</button>
        <button class="btn" id="takeCal" ${canTake?'':'disabled'}>Use colours from current card</button>
        ${cal?'<button class="btn" id="clearCal">Clear</button>':''}
        <span class="collNote">${cal
          ? `<span data-warn="1">Calibrated</span> <span class="sw" style="display:inline-flex;vertical-align:-4px"><i style="background:${rgbCss(cal.bg)}"></i><i style="background:${rgbCss(cal.card)}"></i></span> ${sepv} apart — clear this if results look worse than without.`
          : 'Not calibrated. Each photo is measured on its own, which is usually what you want.'}</span>
        <input type="file" id="batchFiles" accept="image/*" multiple hidden>
      </div>
      <div class="calHelp">
        <p class="hint"><b>Run without calibration first.</b> Automatic detection now samples
        the real gap between frame and card and discards clutter on its own, and on mixed
        photos it usually beats a borrowed reference. Colours sampled from one card carry that
        card's border and that shot's light &mdash; useful across a set photographed in one
        sitting, misleading across anything else.</p>
        <p class="hint">Calibrate only if a batch fails without it, and expect to re-do it
        whenever the card or the lighting changes.</p>
        <p class="hint">Files ending <b>_front</b> and <b>_back</b> with the same base name are
        paired into one card, and its ceiling is the worse of the two sides.</p>
      </div>`;

    document.getElementById('batchPick').onclick=()=>document.getElementById('batchFiles').click();
    document.getElementById('batchFiles').onchange=e=>{
      const f=[...e.target.files]; if (f.length) runBatch(f);
    };
    document.getElementById('takeCal').onclick=()=>{
      if (!canTake) return;
      state.batchCalib={ bg:{...state.sampled.bg}, card:{...state.sampled.card} };
      renderBatch();
    };
    const cc=document.getElementById('clearCal');
    if (cc) cc.onclick=()=>{ state.batchCalib=null; renderBatch(); };
    return;
  }

  const counts={ ok:0, check:0, failed:0 };
  for (const it of b.items) counts[it.level]++;
  const savable=b.items.filter(it=>it.rec&&!it.saved&&it.level==='ok').length;
  const pct=b.total?Math.round(b.done/b.total*100):0;

  host.innerHTML=`
    <div class="collBar">
      ${b.running
        ? `<b>${b.done}</b> of <b>${b.total}</b><div class="bar"><i style="width:${pct}%"></i></div>`
        : `<b>${b.items.length}</b> processed`}
      <em>${counts.ok} clean &middot; ${counts.check} to check &middot; ${counts.failed} failed</em>
      ${!b.running?`<button class="btn" id="saveClean" ${savable?'':'disabled'}>Save ${savable} clean</button>
                    <button class="btn" id="batchReset">New batch</button>`:''}
    </div>
    ${b.items.length?`
    <table class="coll batchT" data-sorted="1">
      <thead><tr><th></th><th>Card</th><th>Sides</th><th>Centering</th><th>Ceiling</th><th>Corners</th><th>Edges</th><th>Status</th><th></th></tr></thead>
      <tbody>${b.items
        .map((it,i)=>({it,i}))
        .sort((a,c)=>{
          const rank={failed:0,check:1,ok:2};
          return rank[a.it.level]-rank[c.it.level] || a.i-c.i;
        })
        .map(({it,i})=>{
        const r=it.rec;
        const wc=r?worstCorner(r):null, we=r?worstEdge(r):null;
        const ceil = r ? (r.centering.combinedCeiling!==undefined?r.centering.combinedCeiling:r.centering.ceiling) : null;
        const sides=['front','back'].filter(k=>it.sides&&it.sides[k]&&it.sides[k].rec);
        return `<tr data-lv="${it.level}">
          <td class="tImg">${r&&r.thumb?`<img src="${r.thumb}" alt="">`:''}</td>
          <td class="fname">${it.name}${it.reasons.length?`<span class="why">${it.reasons.join(' &middot; ')}</span>`:''}</td>
          <td class="sides">${sides.length?sides.map(k=>`<i>${k[0].toUpperCase()}</i>`).join(''):'—'}</td>
          <td class="mono">${r?r.centering.worst.toFixed(1):'—'}</td>
          <td class="mono" data-g="${ceil??'x'}">${r?(ceil??'<5'):'—'}</td>
          <td class="mono">${wc===null?'—':wc.toFixed(2)}</td>
          <td class="mono">${we===null?'—':we.toFixed(2)}</td>
          <td class="mono">${r.market?money(r.market):'—'}</td>
          <td><span class="lvl" data-lv="${it.level}">${LEVEL_LABEL[it.level]}</span></td>
          <td class="acts">
            ${it.saved?`<span class="mono dim">${it.saved}</span>`
              :`${r?`<button class="mini" data-save="${i}">Save</button>`:''}
                <button class="mini" data-open="${i}">Open</button>`}
          </td>
        </tr>`;
      }).join('')}</tbody>
    </table>`:''}`;

  const sc=document.getElementById('saveClean');
  if (sc) sc.onclick=()=>{
    b.items.forEach((it,i)=>{ if (it.level==='ok'&&it.rec&&!it.saved) saveBatchItem(i); });
    const cb=document.getElementById('collBtn');
    if (cb) cb.textContent='Collection ('+loadStore().cards.length+')';
  };

  const br=document.getElementById('batchReset');
  if (br) br.onclick=()=>{ state.batch=null; renderBatch(); };

  host.querySelectorAll('button[data-save]').forEach(btn=>{
    btn.onclick=()=>{
      saveBatchItem(+btn.dataset.save);
      const cb=document.getElementById('collBtn');
      if (cb) cb.textContent='Collection ('+loadStore().cards.length+')';
    };
  });

  // Anything doubtful can be pulled into the normal gauge and corrected by hand.
  host.querySelectorAll('button[data-open]').forEach(btn=>{
    btn.onclick=()=>{
      const it=b.items[+btn.dataset.open];
      if (!it||!it.file) return;
      setView('gauge');
      openFile(it.file);
    };
  });
}

// ===========================================================================
// SCAN - live camera with framing guidance
//
// Almost every bad measurement in testing traced back to framing: card too
// small in the frame, tilted, or with too little margin to read a background
// from. All of that is visible before the shutter, so this checks it live and
// says so, rather than discovering it afterwards.
// ===========================================================================

const SCAN_MIN_MARGIN  = 0.05;   // smallest gap to any frame edge
const SCAN_GOOD_PXMM   = 11;     // resolution that measures comfortably
const SCAN_MIN_PXMM    = 8;      // below this a pixel is worth over 0.1 mm

const cameraPossible = () =>
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;

// A cheap read of where the card is, run on a small frame several times a
// second. Nothing here needs sub-pixel accuracy - it only has to answer
// "is this framed well enough to shoot".
function quickFrame(cnv, nativeH) {
  const w=cnv.width, h=cnv.height;
  const d=cnv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;

  const px=(x,y)=>{ const i=((y|0)*w+(x|0))*4; return [d[i],d[i+1],d[i+2]]; };
  const dist=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);

  // Background from the outer 4% ring.
  const band=Math.max(2,Math.round(Math.min(w,h)*0.04));
  const R=[],G=[],B=[];
  for (let x=0;x<w;x+=3) for (const y of [1,h-2]) { const p=px(x,y); R.push(p[0]);G.push(p[1]);B.push(p[2]); }
  for (let y=0;y<h;y+=3) for (const x of [1,w-2]) { const p=px(x,y); R.push(p[0]);G.push(p[1]);B.push(p[2]); }
  if (!R.length) return null;
  const med=a=>{ const s=[...a].sort((x,y)=>x-y); return s[s.length>>1]; };
  const bg=[med(R),med(G),med(B)];

  const devs=R.map((_,i)=>dist([R[i],G[i],B[i]],bg));
  const spread=med(devs);
  const thr=Math.max(38, spread*3.2);

  // A dozen rays per side is plenty for a bounding box.
  function edge(fromEdge, along, dir) {
    const hits=[];
    const span=along==='y'?h:w, depth=Math.round((along==='y'?w:h)*0.46);
    for (let i=0;i<14;i++) {
      const u=Math.round(span*(0.18+0.64*i/13));
      let run=0;
      for (let t=0;t<depth;t++) {
        const x=along==='y'?(dir===1?t:w-1-t):u;
        const y=along==='y'?u:(dir===1?t:h-1-t);
        if (dist(px(x,y),bg)>thr) { if (++run>=4) { hits.push(t-3); break; } }
        else run=0;
      }
    }
    return hits.length>=6 ? med(hits) : null;
  }

  const L=edge(0,'y',1), Rt=edge(0,'y',-1), T=edge(0,'x',1), Bt=edge(0,'x',-1);
  if (L===null||Rt===null||T===null||Bt===null) return { found:false };

  const cw=w-L-Rt, ch=h-T-Bt;
  if (cw<20||ch<20) return { found:false };

  const fill=(cw*ch)/(w*h);
  const marginMin=Math.min(L/w, Rt/w, T/h, Bt/h);
  // Aspect tells us about tilt without needing the corners.
  const seen=Math.min(cw,ch)/Math.max(cw,ch);
  const want=Math.min(CARD_MM.w,CARD_MM.h)/Math.max(CARD_MM.w,CARD_MM.h);
  const skew=Math.abs(seen-want)/want;

  // The card's height as a fraction of the preview, scaled up to the camera's
  // real sensor height, gives the resolution a capture would actually get.
  const longSide=Math.max(cw,ch)/Math.max(w,h);
  const estPxPerMm = nativeH ? (longSide*nativeH)/CARD_MM.h : null;

  return { found:true, fill, marginMin, skew, estPxPerMm,
           box:{ x:L/w, y:T/h, w:cw/w, h:ch/h },
           sep: spread };
}

function scanVerdict(q) {
  if (!q || !q.found) return { level:'bad', text:'Card not found — plain surface, whole card in view' };
  const notes=[];
  let hard=false;

  if (q.estPxPerMm!==null) {
    if (q.estPxPerMm < SCAN_MIN_PXMM) { notes.push('move closer'); hard=true; }
    else if (q.estPxPerMm < SCAN_GOOD_PXMM) notes.push('a little closer sharpens it');
  }
  if (q.marginMin < SCAN_MIN_MARGIN) { notes.push('leave a gap all round'); hard=true; }
  if (q.skew > 0.10) { notes.push('hold the phone flatter'); hard=true; }

  if (!notes.length) return { level:'good', text:'Ready' };
  return { level: hard ? 'bad' : 'soft', text: notes.join(' · ') };
}

// Status is written into the existing element. Re-rendering here would build a
// fresh <video> with no stream attached, leaving the camera running against an
// element nobody can see - which is exactly what went wrong the first time.
function setScanStatus(text, level) {
  const el=document.getElementById('scanVerdict');
  if (!el) return;
  el.dataset.lv=level||'bad';
  el.innerHTML=`<b>${text}</b>`;
}

async function startScan() {
  const v=document.getElementById('scanVideo');
  if (!v || state.scan.stream) return;

  state.scan.error=null;
  setScanStatus('Starting camera\u2026');

  const tries=[
    { video:{ facingMode:{ ideal:'environment' }, width:{ ideal:2560 }, height:{ ideal:1440 } }, audio:false },
    { video:{ facingMode:{ ideal:'environment' } }, audio:false },
    { video:true, audio:false }                     // laptops with only a front camera
  ];

  let stream=null, lastErr=null;
  for (const c of tries) {
    try { stream=await navigator.mediaDevices.getUserMedia(c); break; }
    catch(e) { lastErr=e; }
  }

  if (!stream) {
    const msg = lastErr && lastErr.name==='NotAllowedError'
      ? 'Camera permission was declined. Allow it for this page and press Retry.'
      : lastErr && lastErr.name==='NotFoundError'
      ? 'No camera found on this device.'
      : 'Could not open the camera' + (lastErr?': '+lastErr.name:'') + '.';
    state.scan.error=msg;
    setScanStatus(msg,'bad');
    const rt=document.getElementById('scanRetry');
    if (rt) rt.hidden=false;
    return;
  }

  state.scan.stream=stream;
  attachStream(v);
}

// Binds a live stream to whichever <video> is currently on screen.
function attachStream(v) {
  if (!v || !state.scan.stream) return;
  v.srcObject=state.scan.stream;
  v.play().catch(()=>{});
  state.scan.running=true;

  const ready=()=>{
    if (v.videoWidth) setScanStatus(`Camera ready \u2014 ${v.videoWidth}\u00d7${v.videoHeight}`,'soft');
    requestAnimationFrame(scanLoop);
  };
  if (v.videoWidth) ready();
  else v.onloadedmetadata=ready;

  // If no frames arrive, say so instead of showing black forever.
  setTimeout(()=>{
    if (state.view==='scan' && state.scan.running && !v.videoWidth)
      setScanStatus('Camera opened but sent no frames. Try another app that uses it, or reload.','bad');
  }, 4000);
}

function stopScan() {
  if (state.scan.stream) state.scan.stream.getTracks().forEach(t=>t.stop());
  state.scan.stream=null;
  state.scan.running=false;
  const v=document.getElementById('scanVideo');
  if (v) v.srcObject=null;
}

const scanWork=document.createElement('canvas');

function scanLoop(ts) {
  if (!state.scan.running || state.view!=='scan') return;
  const v=document.getElementById('scanVideo');
  const ov=document.getElementById('scanOverlay');
  if (!v||!ov||!v.videoWidth) { requestAnimationFrame(scanLoop); return; }

  // Analyse a few times a second, not every frame.
  if (ts - state.scan.lastCheck > 220) {
    state.scan.lastCheck=ts;
    const sw=220, sh=Math.round(sw*v.videoHeight/v.videoWidth);
    scanWork.width=sw; scanWork.height=sh;
    scanWork.getContext('2d',{willReadFrequently:true}).drawImage(v,0,0,sw,sh);
    state.scan.quality=quickFrame(scanWork, Math.max(v.videoWidth, v.videoHeight));
    paintVerdict();
  }

  drawScanOverlay(v, ov);
  requestAnimationFrame(scanLoop);
}

function drawScanOverlay(v, ov) {
  const r=v.getBoundingClientRect();
  const dpr=window.devicePixelRatio||1;
  if (ov.width!==Math.round(r.width*dpr)) { ov.width=Math.round(r.width*dpr); ov.height=Math.round(r.height*dpr); }
  const c=ov.getContext('2d');
  c.setTransform(dpr,0,0,dpr,0,0);
  c.clearRect(0,0,r.width,r.height);

  const q=state.scan.quality;
  const vd=scanVerdict(q);
  const col=vd.level==='good'?'#74bf76':vd.level==='soft'?'#e5a33c':'#e0603e';

  // Target frame: a card at the size we want, centred.
  const aspect=CARD_MM.w/CARD_MM.h;
  let gh=r.height*0.82, gw=gh*aspect;
  if (gw>r.width*0.9) { gw=r.width*0.9; gh=gw/aspect; }
  const gx=(r.width-gw)/2, gy=(r.height-gh)/2;

  c.strokeStyle='rgba(236,231,219,0.55)';
  c.lineWidth=1.5; c.setLineDash([9,7]);
  c.strokeRect(gx,gy,gw,gh);
  c.setLineDash([]);

  // Where the card actually is.
  if (q && q.found) {
    c.strokeStyle=col; c.lineWidth=2.5;
    c.strokeRect(q.box.x*r.width, q.box.y*r.height, q.box.w*r.width, q.box.h*r.height);
  }
}

function paintVerdict() {
  const el=document.getElementById('scanVerdict');
  if (!el) return;
  const q=state.scan.quality, vd=scanVerdict(q);
  el.dataset.lv=vd.level;
  el.innerHTML=`<b>${vd.text}</b>`+(q&&q.found
    ? `<span>${q.estPxPerMm?q.estPxPerMm.toFixed(1)+' px/mm &middot; ':''}margin ${Math.round(q.marginMin*100)}% &middot; skew ${Math.round(q.skew*100)}%</span>`
    : '');
  const btn=document.getElementById('scanShot');
  if (btn) btn.dataset.ready = (vd.level==='good'||vd.level==='soft') ? '1':'0';
}

async function captureScan() {
  const v=document.getElementById('scanVideo');
  if (!v||!v.videoWidth) return;
  const c=document.createElement('canvas');
  c.width=v.videoWidth; c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0);
  stopScan();
  state.scan.shot=c;
  state.scan.result=null;
  state.scan.busy=true;
  renderScan();
  await new Promise(r=>setTimeout(r,20));
  runScanPipeline(c);
}

// The captured canvas goes through exactly the same pipeline as a loaded file.
function runScanPipeline(canvas) {
  const lb=stripLetterbox(canvas);
  state.letterbox=lb.cropped?lb.bars:null;
  canvas=lb.img;
  state.img=canvas;
  state.flat=null; state.quad=null; state.corners=null; state.edgeScan=null;
  state.borderRef=null; state.sampled={bg:null,card:null};

  const det=detectEdges(canvas);
  if (!det.edges) { state.scan.busy=false; state.scan.result={ ok:false, why:'Could not find the card. Try a plainer surface.' }; renderScan(); return; }
  state.edges=det.edges;
  // Carry the diagnostics across, or Details shows an empty gauge.
  state.fits=det.fits;
  state.scanPts=det.scanPts;
  state.pxPerMm=det.pxPerMm;
  state.sleeve=det.sleeve;
  refreshAspect();

  const quad=cornersFromEdges(det.edges);
  const flat=quad&&straighten(canvas,quad);
  if (!flat) { state.scan.busy=false; state.scan.result={ ok:false, why:'Could not straighten the card.' }; renderScan(); return; }

  state.flat=flat; state.quad=quad;
  const inner=findInnerBorder(flat);
  state.guides={left:flat.w*0.09,right:flat.w*0.91,top:flat.h*0.09,bottom:flat.h*0.91};
  for (const k of EDGE_KEYS) if (inner.guides[k]!==null) state.guides[k]=inner.guides[k];
  state.guideSource=inner.source;
  buildCorners(); buildEdges();

  const rec=buildRecord();
  const { level, reasons }=assessCard(det,quad,inner.source,rec);
  state.scan.busy=false;
  state.scan.result={ ok:true, rec, level, reasons, pxPerMm:det.pxPerMm };
  renderScan();
}

// ===========================================================================
// SCAN VIEW
// ===========================================================================

function renderScan() {
  const host=document.getElementById('scan');
  if (!host) return;
  const sc=state.scan;

  // Result screen
  if (sc.result) {
    const r=sc.result;
    if (!r.ok) {
      host.innerHTML=`<div class="scanDone">
        <p class="scanBad">${r.why}</p>
        <button class="btn" data-primary id="scanAgain">Scan again</button>
      </div>`;
      document.getElementById('scanAgain').onclick=()=>{ sc.result=null; sc.shot=null; renderScan(); if (cameraPossible()) startScan(); };
      return;
    }
    const c=r.rec.centering;
    const lv=r.level;
    const bad=lv==='failed';

    // A confident number on top of a failed measurement is worse than no
    // number, so when the reading cannot be trusted it is withheld and the
    // reason takes its place.
    const verdictBlock = bad
      ? `<div class="scanCeil" data-lv="failed">
           <b>&mdash;</b>
           <span>This reading cannot be trusted. Open <b>Details</b> and set the guides by hand,
           or scan again.</span>
         </div>`
      : `<div class="scanCeil" data-lv="${lv}">
           <b>${c.ceiling??'<5'}</b>
           <span>${c.ceiling===10?'centering clears a 10':'centering caps this at '+(c.ceiling??'under 5')}</span>
         </div>`;

    host.innerHTML=`<div class="scanDone">
      <div class="scanCard"><img src="${r.rec.thumb}" alt=""></div>
      <div class="scanNums" ${bad?'data-doubt="1"':''}>
        <div class="scanBig"><b>${Math.round(c.hPct)}</b><i>/</i><b>${100-Math.round(c.hPct)}</b><span>left / right</span></div>
        <div class="scanBig"><b>${Math.round(c.vPct)}</b><i>/</i><b>${100-Math.round(c.vPct)}</b><span>top / bottom</span></div>
        ${verdictBlock}
        <p class="scanMm">L ${c.leftMm.toFixed(2)} &nbsp; R ${c.rightMm.toFixed(2)} mm<br>
           T ${c.topMm.toFixed(2)} &nbsp; B ${c.bottomMm.toFixed(2)} mm<br>
           <em>${r.pxPerMm?r.pxPerMm.toFixed(1)+' px/mm':''}</em></p>
        ${r.reasons.length?`<p class="scanWarn">${r.reasons.join(' · ')}</p>`:''}
      </div>
      <div class="scanActions">
        <button class="btn" ${bad?'':'data-primary'} id="scanSave">${bad?'Save anyway':'Save'}</button>
        <button class="btn" ${bad?'data-primary':''} id="scanAgain">Scan again</button>
        <button class="btn" id="scanDetail">Details</button>
      </div>
    </div>`;

    document.getElementById('scanAgain').onclick=()=>{ sc.result=null; sc.shot=null; renderScan(); if (cameraPossible()) startScan(); };
    document.getElementById('scanDetail').onclick=()=>{ setView('gauge'); goStep(2); };
    document.getElementById('scanSave').onclick=()=>{
      const res=saveCurrentCard();
      const b=document.getElementById('scanSave');
      if (!res.ok) { b.textContent='Failed'; return; }
      b.textContent='Saved '+res.id; b.disabled=true;
      const cb=document.getElementById('collBtn');
      if (cb) cb.textContent='Collection ('+loadStore().cards.length+')';
    };
    return;
  }

  if (sc.busy) { host.innerHTML='<div class="scanDone"><p class="hint">Measuring…</p></div>'; return; }

  // No camera available: explain why, and offer the capture fallback.
  if (!cameraPossible()) {
    host.innerHTML=`<div class="scanDone">
      <p class="hint"><b>Live camera needs a secure page.</b> Browsers only grant camera access
      over <b>https://</b>, so a file opened straight from disk cannot use it. Host this single
      file anywhere with HTTPS &mdash; GitHub Pages is free &mdash; and the live view with framing
      guidance works.</p>
      <p class="hint">In the meantime the button below opens your phone&rsquo;s own camera app.
      Fill about two thirds of the frame with the card, keep the phone flat above it, and leave
      a clear gap all the way round.</p>
      <button class="btn" data-primary id="scanFallback">Take a photo</button>
      <input type="file" id="scanFile" accept="image/*" capture="environment" hidden>
    </div>`;
    document.getElementById('scanFallback').onclick=()=>document.getElementById('scanFile').click();
    document.getElementById('scanFile').onchange=e=>{
      const f=e.target.files[0]; if (!f) return;
      const img=new Image();
      img.onload=()=>{ sc.busy=true; renderScan(); setTimeout(()=>runScanPipeline(img),20); };
      img.src=URL.createObjectURL(f);
    };
    return;
  }

  // Live view
  host.innerHTML=`<div class="scanLive">
    <div class="scanStage">
      <video id="scanVideo" playsinline muted></video>
      <canvas id="scanOverlay"></canvas>
    </div>
    <div class="scanVerdict" id="scanVerdict" data-lv="bad"><b>Starting camera…</b></div>
    ${sc.error?`<p class="scanBad">${sc.error}</p>`:''}
    <div class="scanActions">
      <button class="btn" data-primary id="scanShot" data-ready="0">Capture</button>
      <button class="btn" id="scanStop">Stop camera</button>
      <button class="btn" id="scanRetry" hidden>Retry</button>
    </div>
    <p class="hint">Line the card up inside the dashed guide. The box turns green when the
    framing is good &mdash; card filling most of the frame, a clear gap all round, phone held
    flat above it.</p>
  </div>`;

  document.getElementById('scanShot').onclick=captureScan;
  document.getElementById('scanStop').onclick=()=>{ stopScan(); renderScan(); };
  const rt=document.getElementById('scanRetry');
  if (rt) rt.onclick=()=>{ stopScan(); rt.hidden=true; startScan(); };

  // Rebuilt DOM means a fresh <video>; hand it the stream we already have.
  const v=document.getElementById('scanVideo');
  if (sc.stream) attachStream(v); else startScan();
}

// ===========================================================================
// LOADING
// ===========================================================================

document.getElementById('cardType').onchange = e => {
  state.cardType=e.target.value;
  CARD_MM={ ...CARD_TYPES[state.cardType] };
  if (state.img) { state.flat=null; state.corners=null; goStep(1); runDetect(); }
};

// The shape you marked has an aspect ratio, and the card types are far enough
// apart that it can vouch for - or contradict - the selection. Only meaningful
// on a square-on shot, since perspective distorts the quad.
function aspectCheck(quad) {
  const len=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const w=(len(quad[0],quad[1])+len(quad[3],quad[2]))/2;
  const h=(len(quad[0],quad[3])+len(quad[1],quad[2]))/2;
  if (!w||!h) return null;
  const seen=Math.min(w,h)/Math.max(w,h);
  const want=Math.min(CARD_MM.w,CARD_MM.h)/Math.max(CARD_MM.w,CARD_MM.h);
  const off=Math.abs(seen-want)/want;

  let best=null, bestOff=Infinity;
  for (const [k,t] of Object.entries(CARD_TYPES)) {
    const r=Math.min(t.w,t.h)/Math.max(t.w,t.h);
    const d=Math.abs(seen-r)/r;
    if (d<bestOff) { bestOff=d; best=k; }
  }
  return { seen, want, off, best, bestOff };
}

document.getElementById('collBtn').onclick=()=>setView(state.view==='collection'?'gauge':'collection');
document.getElementById('batchBtn').onclick=()=>setView(state.view==='batch'?'gauge':'batch');
document.getElementById('scanBtn').onclick=()=>setView(state.view==='scan'?'gauge':'scan');
document.getElementById('loadBtn').onclick=()=>document.getElementById('file').click();

document.getElementById('file').onchange = e => {
  if (e.target.files[0]) openFile(e.target.files[0]);
};

function openFile(file) {
  {
  const img=new Image();
  img.onload=()=>{
    const lb=stripLetterbox(img);
    state.letterbox=lb.cropped?lb.bars:null;
    state.img=lb.img; state.flat=null; state.guides=null;
    state.fits=null; state.scanPts=null; state.sleeve=null; state.margins=null;
    state.sampled={bg:null,card:null}; state.pickMode=null;
    const W=state.img.width,H=state.img.height;
    state.edges={
      top:[{x:W*0.22,y:H*0.10},{x:W*0.78,y:H*0.10}],
      bottom:[{x:W*0.22,y:H*0.90},{x:W*0.78,y:H*0.90}],
      left:[{x:W*0.10,y:H*0.22},{x:W*0.10,y:H*0.78}],
      right:[{x:W*0.90,y:H*0.22},{x:W*0.90,y:H*0.78}]
    };
    goStep(1);
    runDetect();
  };
  img.src=URL.createObjectURL(file);
  }
}

// Recomputed whenever the lines change, not just after detection, so a hand
// correction clears the warning it fixed.
function refreshAspect() {
  state.aspectWarn=null;
  if (!state.edges) return;
  const q=cornersFromEdges(state.edges);
  if (!q || tiltCheck(q)>=1.06) return;
  const a=aspectCheck(q);
  if (!a) return;
  if (a.off>0.03 && a.best!==state.cardType && a.bestOff<a.off/2) {
    state.aspectWarn=`The shape marked has an aspect ratio of ${a.seen.toFixed(3)}, but ${CARD_TYPES[state.cardType].label} should be ${a.want.toFixed(3)}. That matches ${CARD_TYPES[a.best].label} instead — check the card type, or the edge lines.`;
  } else if (a.off>0.05) {
    state.aspectWarn=`The shape marked has an aspect ratio of ${a.seen.toFixed(3)} against ${a.want.toFixed(3)} expected. One of the edge lines is probably off.`;
  }
}

function runDetect() {
  const res=detectEdges(state.img);
  state.scanPts=res.scanPts;
  state.fits=res.fits;
  state.sleeve=res.sleeve;
  state.pxPerMm=res.pxPerMm;
  state.margins=res.margins;

  const sep=(state.sampled.bg&&state.sampled.card)
    ? colourDist(state.sampled.bg,state.sampled.card) : null;

  if (sep!==null && sep<SEP_POOR) {
    setFlag('bad',`Card and background are too close in colour to separate (${Math.round(sep)} apart). Reshoot on a contrasting surface.`);
  } else if (!res.edges && res.frameHits>0.4) {
    setFlag('bad',`The background reference does not match this photo — ${Math.round(res.frameHits*100)}% of scan rays read as card from the frame edge inward. Re-sample the background on this image, or clear the batch calibration.`);
  } else if (!res.edges) {
    setFlag('bad','Could not find four edges. If the card runs off the frame, reshoot with a margin of background all the way around.');
  } else {
    state.edges=res.edges;

    refreshAspect();
    if (res.calibDrift>0.4 && !state.aspectWarn)
      state.aspectWarn=`Calibrated colours did not match this photo on ${Math.round(res.calibDrift*100)}% of sides, so its own background was used instead. The reading stands, but re-sampling on this image would be firmer.`;

    // rms is what says whether the line is right; kept only needs to be enough
    // to fit one, now that clutter is deliberately discarded upstream.
    const weak=EDGE_KEYS.filter(k=>!res.fits[k]||res.fits[k].kept<22||res.fits[k].rms>1.2);
    if (res.tightest!==null && res.tightest<2) {
      setFlag('warn',`The tightest margin is only ${res.tightest.toFixed(1)}% of the frame. The background was still found, but around 10% on every side reads much more cleanly.`);
    } else if (state.letterbox) {
      const b=state.letterbox;
      const parts=Object.entries(b).filter(([,v])=>v>0).map(([k,v])=>`${k} ${Math.round(v)}px`);
      setFlag('warn',`Blank bars trimmed from the image (${parts.join(', ')}) — they have a hard straight edge the detector would otherwise mistake for the card.`);
    } else if (state.aspectWarn) {
      setFlag('warn', state.aspectWarn);
    } else if (res.pxPerMm!==null && res.pxPerMm<8) {
      setFlag('warn',`Detection is working at only ${res.pxPerMm.toFixed(1)} px/mm, so one pixel is ${(1/res.pxPerMm).toFixed(2)} mm. Fill more of the frame with the card, or shoot at higher resolution, for a finer reading.`);
    } else if (res.widest!==null && res.widest>22) {
      setFlag('warn',`The card fills only part of the frame — margins up to ${res.widest.toFixed(0)}%. Detection works, but moving closer puts more pixels on the card and sharpens every measurement.`);
    } else if (weak.length) {
      setFlag('warn',`Check the ${weak.join(' and ')} edge${weak.length>1?'s':''} — the fit there is loose.`);
    } else if (res.sleeve>0.35) {
      setFlag('warn',`A second edge was found just outside the card on ${Math.round(res.sleeve*100)}% of scan lines — this card may be sleeved.`);
    } else if (sep!==null && sep<SEP_OK) {
      setFlag('warn','Colours are workable but not generous. More contrast would help.');
    } else setFlag(null);
  }

  renderSep();
  renderFits();
  draw();
}

const rgbCss=c=>`rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;

function renderSep() {
  const wrap=document.getElementById('sepWrap');
  if (state.step!==1||!state.img) { wrap.innerHTML=''; return; }
  const { bg,card }=state.sampled;
  const sep=(bg&&card)?colourDist(bg,card):null;
  const q=sep===null?'':sep<SEP_POOR?'bad':sep<SEP_OK?'soft':'good';
  const label=sep===null?'background found automatically':`${Math.round(sep)} apart`;
  // Detection resolution is what actually caps precision, so it is shown.
  const r=state.pxPerMm;
  const rq=r===null?'':r<8?'bad':r<14?'soft':'good';
  const res=r===null?'':`<b data-res="${rq}" title="detection resolution">${r.toFixed(1)} px/mm</b>`;
  wrap.innerHTML=
    `<div class="sep" ${q?`data-q="${q}"`:''}>
       <span class="sw">Background <i ${bg?`style="background:${rgbCss(bg)}"`:'data-empty="1"'}></i></span>
       <span class="sw">Border <i ${card?`style="background:${rgbCss(card)}"`:'data-empty="1"'}></i></span>
       <b>${label}</b>${res}
     </div>`;
}

function renderFits() {
  const wrap=document.getElementById('fitsWrap');
  if (state.step!==1||!state.fits) { wrap.innerHTML=''; return; }
  wrap.innerHTML='<div class="fits">'+EDGE_KEYS.map(k=>{
    const f=state.fits[k];
    if (!f) return `<div data-q="bad"><span>${k}</span><b>none</b></div>`;
    const q=(f.kept>=30&&f.rms<0.8)?'good':(f.kept>=22&&f.rms<1.2)?'soft':'bad';
    const mg=f.marginPct===null?'' :
      `<em ${(f.marginPct<2||f.marginPct>22)?'data-tight="1"':''}>margin ${f.marginPct.toFixed(1)}%</em>`;
    return `<div data-q="${q}"><span>${k}</span><b>${f.kept}/${f.total} · ${f.rms.toFixed(2)}px</b>${mg}</div>`;
  }).join('')+'</div>';
}

// ===========================================================================
// STEPS
// ===========================================================================

function setPick(mode) {
  state.pickMode = state.pickMode===mode ? null : mode;
  canvas.dataset.pick = state.pickMode?'1':'0';
  const b=document.getElementById('pickBg'), c=document.getElementById('pickCard');
  if (b) b.dataset.on=state.pickMode==='bg'?'1':'0';
  if (c) c.dataset.on=state.pickMode==='card'?'1':'0';
  const hint=document.getElementById('pickHint');
  if (hint) hint.textContent = state.pickMode==='bg'
    ? 'Click a clear patch of background, away from any shadow.'
    : state.pickMode==='card'
    ? 'Click the printed border near the middle of an edge, not the artwork.'
    : '';
}

// The scale that shows the whole image inside the viewport.
function fitScale() {
  const src=source(); if (!src) return 1;
  const availW=(viewport.clientWidth||600)-2;
  const maxH=Math.max(260, window.innerHeight*0.60);
  return Math.min(availW/src.width, maxH/src.height);
}

function zoomButton() {
  return `<div class="zoom">
    <label for="zoomRange">Zoom</label>
    <button id="zoomFit" type="button">Fit</button>
    <input type="range" id="zoomRange" min="10" max="400" step="1" value="${state.zoomPct||100}">
    <b id="zoomVal">${state.zoomPct||100}%</b>
  </div>`;
}

// Range inputs ignore the wheel by default, which is exactly the gesture you
// want when a slider sits away from the thing it controls.
function wheelable(el, step) {
  if (!el) return;
  el.addEventListener('wheel', e=>{
    e.preventDefault();
    const min=+el.min, max=+el.max;
    const next=Math.min(max, Math.max(min, +el.value + (e.deltaY<0?step:-step)));
    if (next===+el.value) return;
    el.value=next;
    el.dispatchEvent(new Event('input'));
  }, { passive:false });
}

function wireZoom() {
  const range=document.getElementById('zoomRange');
  const val=document.getElementById('zoomVal');
  const fit=document.getElementById('zoomFit');
  if (!range) return;

  wheelable(range, 5);
  range.oninput=()=>{
    // Hold whatever is in the middle of the viewport as the zoom changes,
    // otherwise zooming in throws you back to the top-left corner.
    const cx=(viewport.scrollLeft+viewport.clientWidth/2)/state.scale;
    const cy=(viewport.scrollTop+viewport.clientHeight/2)/state.scale;
    state.zoomPct=+range.value;
    val.textContent=state.zoomPct+'%';
    resize();
    viewport.scrollLeft=cx*state.scale-viewport.clientWidth/2;
    viewport.scrollTop=cy*state.scale-viewport.clientHeight/2;
  };

  fit.onclick=()=>{
    state.zoomPct=null;
    resize();
    const pct=Math.round(state.scale*100);
    range.value=pct;
    val.textContent=pct+'%';
  };
}


// Says which guides were placed automatically and which were not, since a
// full-art card will often produce a mix.
function renderGuideNote() {
  const el=document.getElementById('guideNote');
  if (!el) return;
  const src=state.guideSource;
  if (!src) { el.innerHTML=''; return; }

  const by={measured:[],guided:[],mirrored:[],none:[],edited:[]};
  for (const k of EDGE_KEYS) (by[src[k]]||by.none).push(k);

  const list=a=>a.join(', ');
  const bits=[];
  if (by.measured.length) bits.push(`<b>${list(by.measured)}</b> measured directly`);
  if (by.guided.length)   bits.push(`<b>${list(by.guided)}</b> found on a second look, once the other sides showed where to search`);
  if (by.mirrored.length) bits.push(`<b>${list(by.mirrored)}</b> mirrored from the opposite side &mdash; assumed, not measured`);
  if (by.edited.length)   bits.push(`<b>${list(by.edited)}</b> set by you`);

  const dashed=by.guided.length+by.mirrored.length+by.none.length;
  const tail = dashed
    ? ' Dashed lines were not measured directly — check those before trusting the numbers.'
    : '';

  // How many sides agreed on one frame width. A card's frame is uniform, so
  // four is what a correct read looks like whatever the card type.
  // The claim only describes what detection found, so it is dropped as soon as
  // any guide is yours.
  const agree = (state.guideConsensus && !by.edited.length)
    ? ` Detection settled on a <b>${state.guideConsensus.toFixed(2)} mm</b> frame, with left+right and top+bottom agreeing.`
    : '';

  el.innerHTML = bits.length
    ? bits.join('. ')+'.'+agree+tail
    : `<b>No inner border found</b> — the frame and artwork are too close in tone on every side. Place all four guides by hand.`;
}

function goStep(n) {
  state.step=n; state.drag=null; state.pointer=null;
  if (n!==1) setPick(null);
  document.querySelectorAll('#rail div').forEach(d=>{
    const s=+d.dataset.step;
    d.dataset.on=s===n?'1':'0'; d.dataset.done=s<n?'1':'0';
  });
  document.getElementById('panel').dataset.idle=n===2?'0':'1';

  const actions=document.getElementById('actions');
  const wrap=document.getElementById('hintWrap');

  if (n===1) {
    actions.innerHTML=
      '<button class="btn" data-primary id="go">Straighten card</button>'+
      '<button class="btn" id="pickBg">Sample background</button>'+
      '<button class="btn" id="pickCard">Sample border</button>'+
      `<button class="btn" id="scanToggle" data-on="${state.showScan?1:0}">Scan points</button>`+
      zoomButton();
    document.getElementById('go').onclick=doStraighten;
    document.getElementById('pickBg').onclick=()=>setPick('bg');
    document.getElementById('pickCard').onclick=()=>setPick('card');
    document.getElementById('scanToggle').onclick=()=>{
      state.showScan=!state.showScan;
      document.getElementById('scanToggle').dataset.on=state.showScan?'1':'0';
      draw();
    };
    wireZoom();
    wrap.innerHTML=
      `<p class="hint" id="pickHint"></p>
       <p class="hint">Rays sweep the card&rsquo;s own edges, and any that stray onto clutter
       are discarded &mdash; so a count well under 70 is normal. The <b>fit</b> figure is what
       matters: under 0.8px is tight, above 1.2px means something is interfering.
       <b>Margin</b> near 10% a side is the sweet spot. The <b>px/mm</b> figure is the
       resolution detection actually had to work with &mdash; above 14 is comfortable, below 8
       and a single pixel is worth more than a tenth of a millimetre. Drag any handle to correct.</p>`;
  } else if (n===2) {
    actions.innerHTML='<button class="btn" id="back">Redo edges</button>'+
      '<button class="btn" data-primary id="toCorners">Inspect corners</button>'+zoomButton();
    document.getElementById('back').onclick=()=>goStep(1);
    document.getElementById('toCorners').onclick=()=>goStep(3);
    wireZoom();
    wrap.innerHTML=`<p class="hint" id="guideNote"></p>
      <p class="hint">Drag each <b>yellow line</b> onto the inside edge of the
      printed border. Line up the straight middle of each side and ignore the corners.
      Arrow keys nudge, shift for ten.</p>`;
    renderGuideNote();
  } else {
    actions.innerHTML=
      '<button class="btn" id="backMeasure">Back to centering</button>'+
      '<button class="btn" data-primary id="toEdges">Inspect edges</button>'+
      '<button class="btn" id="saveCard">Save to collection</button>'+
      `<button class="btn" id="whiteToggle" data-on="${state.showWhitening?1:0}">Highlight</button>`+
      `<div class="zoom">
         <label for="sensRange">Sensitivity</label>
         <input type="range" id="sensRange" min="2" max="12" step="0.5" value="${state.cornerSens}">
         <b id="sensVal">${state.cornerSens.toFixed(1)}</b>
       </div>`;
    document.getElementById('backMeasure').onclick=()=>goStep(2);
    document.getElementById('toEdges').onclick=()=>goStep(4);
    document.getElementById('whiteToggle').onclick=()=>{
      state.showWhitening=!state.showWhitening;
      document.getElementById('whiteToggle').dataset.on=state.showWhitening?'1':'0';
      renderCorners();
    };
    const sr=document.getElementById('sensRange'), sv=document.getElementById('sensVal');
    wheelable(sr, 0.5);
    sr.oninput=()=>{
      state.cornerSens=+sr.value;
      sv.textContent=state.cornerSens.toFixed(1);
      buildCorners();
      renderCorners();
      renderCornerNote();
    };
    if (!state.corners) buildCorners();
    wrap.innerHTML='<p class="hint" id="cornerNote"></p>';
    renderCornerNote();
  }

  if (n===4) {
    actions.innerHTML=
      '<button class="btn" id="backCorners">Back to corners</button>'+
      '<button class="btn" data-primary id="saveCard">Save to collection</button>'+
      `<div class="zoom">
         <label for="sensRange4">Sensitivity</label>
         <input type="range" id="sensRange4" min="2" max="12" step="0.5" value="${state.cornerSens}">
         <b id="sensVal4">${state.cornerSens.toFixed(1)}</b>
       </div>`+
      `<div class="zoom">
         <label for="depthRange">Depth</label>
         <input type="range" id="depthRange" min="0.5" max="2.6" step="0.1" value="${state.edgeDepth}">
         <b id="depthVal">${state.edgeDepth.toFixed(1)} mm</b>
       </div>`;
    document.getElementById('backCorners').onclick=()=>goStep(3);

    const rebuild=()=>{ state.edgeMark=null; buildEdges(); renderEdges(); renderEdgeNote(); };

    const sr=document.getElementById('sensRange4'), sv=document.getElementById('sensVal4');
    wheelable(sr,0.5);
    sr.oninput=()=>{
      state.cornerSens=+sr.value;
      sv.textContent=state.cornerSens.toFixed(1);
      state.corners=null;
      rebuild();
    };

    const dr=document.getElementById('depthRange'), dv=document.getElementById('depthVal');
    wheelable(dr,0.1);
    dr.oninput=()=>{
      state.edgeDepth=+dr.value;
      dv.textContent=state.edgeDepth.toFixed(1)+' mm';
      rebuild();
    };
    if (!state.edgeScan) buildEdges();
    wrap.innerHTML='<p class="hint" id="edgeNote"></p>';
    renderEdgeNote();
  }

  const sc=document.getElementById('saveCard');
  if (sc) sc.onclick=()=>{
    const r=saveCurrentCard();
    if (!r.ok) { setFlag('bad', r.error); return; }
    sc.textContent='Saved '+r.id;
    sc.disabled=true;
    setTimeout(()=>{ sc.textContent='Save to collection'; sc.disabled=false; }, 2200);
    const b=document.getElementById('collBtn');
    if (b) b.textContent='Collection ('+loadStore().cards.length+')';
    if (r.memoryOnly) setFlag('warn','Saved, but this browser will not keep local-file data between sessions. Export from the collection before closing.');
  };

  document.getElementById('stage').dataset.step=n;
  document.getElementById('viewport').style.display = (n===3||n===4) ? 'none' : '';
  document.getElementById('cornerGrid').dataset.on = n===3 ? '1' : '0';
  document.getElementById('edgeList').dataset.on = n===4 ? '1' : '0';
  if (n===3) renderCorners();
  if (n===4) renderEdges();
  renderSep();
  renderFits();
  resize();
}

async function doStraighten() {
  const quad=cornersFromEdges(state.edges);
  if (!quad) { setFlag('bad','Two lines are parallel, so they never meet at a corner.'); return; }
  const btn=document.getElementById('go');
  btn.textContent='Straightening\u2026'; btn.disabled=true;
  await new Promise(r=>setTimeout(r,16));

  const flat=straighten(state.img,quad);
  if (!flat) { setFlag('bad','Could not build a correction from those lines.'); btn.textContent='Straighten card'; btn.disabled=false; return; }

  state.flat=flat;
  state.quad=quad;
  state.corners=null;
  state.edgeScan=null; state.edgeMark=null; state.borderRef=null;
  state.guides={left:flat.w*0.09,right:flat.w*0.91,top:flat.h*0.09,bottom:flat.h*0.91};

  // Suggest the inner border, but only where the scans actually agreed. Any
  // side that comes back weak keeps its default and gets flagged, because a
  // confident wrong guide is worse than an obvious placeholder.
  const inner=findInnerBorder(flat);
  state.guideQuality=inner.quality;
  state.guideSource=inner.source;
  state.guideConsensus=inner.consensus;
  state.guideBacking=inner.backing;
  for (const k of EDGE_KEYS) {
    if (inner.guides[k]!==null) state.guides[k]=inner.guides[k];
  }

  const tilt=tiltCheck(quad);
  if (tilt>1.20) setFlag('bad','Strong angle in the original photo. Correction applied, but the far edge carries fewer real pixels.');
  else if (tilt>1.08) setFlag('warn','Slight angle detected and corrected.');
  else setFlag(null);

  goStep(2);
}

function setFlag(level,msg) {
  const el=document.getElementById('flag');
  if (!level) { el.dataset.show='0'; return; }
  el.dataset.show='1'; el.dataset.level=level; el.textContent=msg;
}

// ===========================================================================
// EDGES
//
// Same whiteness metric as the corners, different shape of problem: an edge is
// 80mm long, so magnifying it is useless. What works is a profile along its
// length - a grader running an edge is looking for discontinuities, and a graph
// makes those obvious in a way a long thin photograph does not.
// ===========================================================================

const EDGE_ORDER=['top','bottom','left','right'];
const EDGE_LABEL={top:'Top',bottom:'Bottom',left:'Left',right:'Right'};

// Border reference is shared with the corner step; compute it once.
function ensureBorderRef() {
  if (state.borderRef) return state.borderRef;
  const flat=state.flat, quad=state.quad;
  if (!flat||!quad) return null;
  const mmW=flat.landscape?CARD_MM.h:CARD_MM.w;
  const mmH=flat.landscape?CARD_MM.w:CARD_MM.h;
  const H=cardToSource(quad,mmW,mmH);
  if (!H) return null;
  const len=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const native=((len(quad[0],quad[1])+len(quad[3],quad[2]))/2)/mmW;
  const pxPerMm=Math.min(38,Math.max(14,native*1.7));
  const src=sourceData(state.img);
  const ref=borderReference(src,H,mmW,mmH,pxPerMm);
  if (!ref) return null;
  state.borderRef=ref; state.borderH=H; state.borderSrc=src;
  state.borderPxPerMm=pxPerMm; state.borderMm={w:mmW,h:mmH};
  return ref;
}

// How wide the printed border actually is on one side, taken from the guides
// placed in step 2. Using this instead of a constant keeps the strip inside the
// border on cards with a thin frame.
function measuredBorderMm(key) {
  const f=state.flat, g=state.guides;
  if (!f||!g) return BORDER_ZONE_MM;
  const px = key==='left' ? g.left
           : key==='right' ? f.w-g.right
           : key==='top' ? g.top
           : f.h-g.bottom;
  const mm=px*f.mmPerPx;
  return (mm>0.6 && mm<8) ? mm : BORDER_ZONE_MM;
}

// The lighting along an edge, as distinct from anything on it. A rolling median
// over roughly 12mm follows a specular highlight travelling down a metallic
// border but cannot follow a 1mm nick, which is exactly the separation wanted.
function rollingBaseline(profile, pxPerMm) {
  const n=profile.length;
  const half=Math.max(4, Math.round(EDGE_BASE_MM*pxPerMm/2));
  const step=Math.max(1, Math.round(0.4*pxPerMm));
  const knots=[];

  for (let i=0;i<n;i+=step) {
    const a=Math.max(0,i-half), b=Math.min(n,i+half);
    const win=[];
    for (let j=a;j<b;j++) win.push(profile[j]);
    win.sort((x,y)=>x-y);
    knots.push({ i, v:win[win.length>>1] });
  }
  if (!knots.length) return new Float32Array(n);

  const base=new Float32Array(n);
  for (let k=0;k<knots.length;k++) {
    const k0=knots[k], k1=knots[Math.min(knots.length-1,k+1)];
    const span=Math.max(1,k1.i-k0.i);
    for (let i=k0.i;i<Math.min(n,k1.i);i++) {
      const t=(i-k0.i)/span;
      base[i]=k0.v*(1-t)+k1.v*t;
    }
  }
  const last=knots[knots.length-1];
  for (let i=last.i;i<n;i++) base[i]=last.v;
  return base;
}

function analyseEdgeStrip(crop, key, pxPerMm, ref, sens) {
  const { data, w, h }=crop;
  const d=data.data;
  const alongX = (key==='top'||key==='bottom');
  const alongN = alongX ? w : h;
  const deepN  = alongX ? h : w;
  const flip   = (key==='bottom'||key==='right');

  const cut=Math.max(0.4, ref.spread)*sens;
  const skin=Math.max(1, Math.round(EDGE_SKIN_MM*pxPerMm));

  const whiteAt=(a,dp)=>{
    const idx = flip ? (deepN-1-dp) : dp;
    const x = alongX ? a : idx;
    const y = alongX ? idx : a;
    const k=(y*w+x)*4;
    return ((d[k]-ref.r)*ref.toWhite.r+(d[k+1]-ref.g)*ref.toWhite.g+(d[k+2]-ref.b)*ref.toWhite.b)/(ref.headroom||1);
  };

  // ---- pass one: the profile, as the mean of each column's brightest quarter ----
  const profile=new Float32Array(alongN);
  const col=new Float32Array(Math.max(1,deepN-skin));
  for (let a=0;a<alongN;a++) {
    let n=0;
    for (let dp=skin;dp<deepN;dp++) col[n++]=whiteAt(a,dp);
    const slice=Array.prototype.slice.call(col,0,n).sort((p,q)=>q-p);
    const take=Math.max(1,Math.round(n*0.25));
    let sum=0; for (let i=0;i<take;i++) sum+=slice[i];
    profile[a]=sum/take;
  }

  // ---- pass two: everything is measured against the local baseline ----
  const base=rollingBaseline(profile,pxPerMm);
  const residual=new Float32Array(alongN);
  let peak=-Infinity;
  for (let a=0;a<alongN;a++) {
    residual[a]=profile[a]-base[a];
    if (residual[a]>peak) peak=residual[a];
  }

  // Where in the depth does each column's brightness sit? Wear starts at the
  // cut edge and fades inward; a printed element does not. This is what tells
  // a chipped edge from artwork crowding the border.
  const centroid=new Float32Array(alongN);
  let flagged=0, zone=0;
  for (let a=0;a<alongN;a++) {
    const local=base[a]+cut;
    let wsum=0, dsum=0;
    for (let dp=skin;dp<deepN;dp++) {
      const v=whiteAt(a,dp);
      zone++;
      if (v>local) flagged++;
      const ex=Math.max(0, v-base[a]);
      wsum+=ex; dsum+=ex*(dp/pxPerMm);
    }
    centroid[a]= wsum>0 ? dsum/wsum : 0;
  }

  return {
    profile, base, residual, centroid, cut,
    peak: peak===-Infinity?0:peak,
    mm2: flagged/(pxPerMm*pxPerMm),
    zoneMm2: zone/(pxPerMm*pxPerMm),
    pct: zone? flagged/zone*100 : 0,
    pxPerMm, alongX,
    lighting: Math.max(...base)-Math.min(...base)
  };
}

// Highest points on the profile, spaced apart so one wide defect is reported
// once rather than fifty times.
function findSpikes(residual, cut, pxPerMm, limit) {
  const minGap=Math.round(1.5*pxPerMm);
  const idx=Array.from(residual.keys()).filter(i=>residual[i]>cut);
  idx.sort((a,b)=>residual[b]-residual[a]);
  const out=[];
  for (const i of idx) {
    if (out.every(j=>Math.abs(j-i)>=minGap)) out.push(i);
    if (out.length>=limit) break;
  }
  return out.sort((a,b)=>a-b);
}

function buildEdges() {
  const ref=ensureBorderRef();
  if (!ref) return;
  const { w:mmW, h:mmH }=state.borderMm;
  const H=state.borderH, src=state.borderSrc;
  const pxPerMm=state.borderPxPerMm;

  const out={};
  for (const key of EDGE_ORDER) {
    const depth=Math.min(state.edgeDepth, measuredBorderMm(key)*0.92, BORDER_ZONE_MM);
    const alongX = (key==='top'||key==='bottom');
    const spanMm = (alongX?mmW:mmH) - EDGE_INSET_MM*2;
    if (spanMm<10) continue;

    const x0 = alongX ? EDGE_INSET_MM : (key==='left' ? 0 : mmW-depth);
    const y0 = alongX ? (key==='top' ? 0 : mmH-depth) : EDGE_INSET_MM;
    const wmm = alongX ? spanMm : depth;
    const hmm = alongX ? depth  : spanMm;

    const crop=cropCard(src,H,x0,y0,wmm,hmm,pxPerMm);
    const an=analyseEdgeStrip(crop,key,pxPerMm,ref,state.cornerSens);
    an.spikes=findSpikes(an.residual,an.cut,pxPerMm,4);
    out[key]={ crop, depth, spanMm, startMm:EDGE_INSET_MM, ...an };
  }
  state.edgeScan=out;
}

// Vertical edges are rotated so every strip reads left-to-right and lines up
// with its profile underneath.
function orientStrip(crop, key) {
  if (key==='top'||key==='bottom') return crop.canvas;
  const c=document.createElement('canvas');
  c.width=crop.h; c.height=crop.w;
  const cx=c.getContext('2d');
  cx.translate(c.width/2,c.height/2);
  cx.rotate(-Math.PI/2);
  cx.drawImage(crop.canvas,-crop.w/2,-crop.h/2);
  return c;
}


function renderEdgeNote() {
  const el=document.getElementById('edgeNote');
  if (!el||!state.edgeScan||!state.borderRef) return;
  const head=state.borderRef.headroom;
  const worst=EDGE_ORDER.map(k=>state.edgeScan[k]).filter(Boolean)
    .sort((a,b)=>b.peak-a.peak)[0];
  const anySpike=EDGE_ORDER.some(k=>state.edgeScan[k]&&state.edgeScan[k].spikes.length);

  const lit=EDGE_ORDER.map(k=>state.edgeScan[k]).filter(Boolean)
    .sort((a,b)=>b.lighting-a.lighting)[0];
  const litNote = lit && lit.lighting>lit.cut*0.8
    ? ` The pale line tracking each profile is the lighting &mdash; a highlight sliding along the
        border. It rises and falls over centimetres, so the threshold follows it rather than
        cutting straight across, and only sharp local excursions count.`
    : '';

  el.innerHTML =
    (anySpike
      ? `Red lines mark the sharpest excursions above the local baseline &mdash; those are what to look at.`
      : `Nothing rose far enough above its local baseline to flag. The largest excursion is
         ${worst?worst.peak.toFixed(1):'—'} against a cut of ${worst?worst.cut.toFixed(1):'—'}.`) +
    litNote +
    ` Each flagged position is tagged with its distance along the edge: <b>red</b> means the
      brightness sits hard against the cut, which is what wear looks like, while <b>grey</b>
      means it is set in from the edge and more likely something printed. <b>Depth</b> controls
      how far into the border is examined &mdash; keep it shallow and card design stays out of it.` +
    ` Each strip runs from ${EDGE_INSET_MM} mm inside one corner to ${EDGE_INSET_MM} mm inside the
      other, since the corners are covered separately, and its depth follows the border width you
      measured in step 2. Border-to-white separation is ${Math.round(head)} of 442.
      <b>Measurements, not a grade</b> &mdash; a print line, a holo edge or a bright patch of art
      reaching the frame all read the same as wear.`;
}

function renderEdges() {
  const host=document.getElementById('edgeList');
  if (!host) return;
  if (state.step!==4||!state.edgeScan) { host.innerHTML=''; return; }

  host.innerHTML=EDGE_ORDER.map(k=>{
    const e=state.edgeScan[k];
    if (!e) return '';
    const q=e.pct<0.5?'good':e.pct<3?'soft':'bad';
    const tags=e.spikes.map(i=>{
      const mm=e.startMm+(i/e.profile.length)*e.spanMm;
      const c=e.centroid[i];
      const cls=c<0.45?'edgeward':c<0.85?'mixed':'inward';
      return `<i data-d="${cls}" title="${c.toFixed(2)} mm in from the cut edge">${mm.toFixed(0)}mm</i>`;
    }).join('');
    return `<section class="edge" data-q="${q}">
      <header><span>${EDGE_LABEL[k]}</span>
        <em>above baseline ${e.peak.toFixed(1)} / cut ${e.cut.toFixed(1)}</em>
        ${tags?`<div class="tags">${tags}</div>`:''}
        <b>${e.mm2.toFixed(2)} mm&sup2;</b></header>
      <div class="strip" id="st-${k}"></div>
      <canvas class="prof" id="pf-${k}" data-key="${k}"></canvas>
    </section>`;
  }).join('')+'<div id="edgeDetail"></div>';

  for (const k of EDGE_ORDER) {
    const e=state.edgeScan[k]; if (!e) continue;
    document.getElementById('st-'+k).appendChild(orientStrip(e.crop,k));
    drawProfile(k);
  }
  renderEdgeDetail();
}

function drawProfile(key) {
  const e=state.edgeScan[key];
  const cv=document.getElementById('pf-'+key);
  if (!e||!cv) return;

  const cssW=cv.parentElement.clientWidth||600, cssH=64;
  const dpr=window.devicePixelRatio||1;
  cv.style.width=cssW+'px'; cv.style.height=cssH+'px';
  cv.width=Math.round(cssW*dpr); cv.height=Math.round(cssH*dpr);
  const c=cv.getContext('2d');
  c.setTransform(dpr,0,0,dpr,0,0);
  c.clearRect(0,0,cssW,cssH);

  const P=e.profile, B=e.base, n=P.length;
  let hi=0; for (let i=0;i<n;i++) { const v=B[i]+e.cut; if (v>hi) hi=v; if (P[i]>hi) hi=P[i]; }
  const top=Math.max(hi*1.08, 1);
  const yOf=v=>cssH-4-(Math.max(0,Math.min(top,v))/top)*(cssH-10);

  // millimetre ticks every 10mm
  c.strokeStyle='#38352e'; c.lineWidth=1; c.font='9px "IBM Plex Mono", monospace';
  c.fillStyle='#8b857a';
  for (let mm=0; mm<=e.spanMm; mm+=10) {
    const x=(mm/e.spanMm)*cssW;
    c.beginPath(); c.moveTo(x,0); c.lineTo(x,cssH-1); c.stroke();
    if (mm) c.fillText(String(Math.round(mm+e.startMm)), x+3, 10);
  }

  const colAt=(arr,x)=>{
    const i0=Math.floor(x/cssW*n), i1=Math.max(i0+1,Math.floor((x+1)/cssW*n));
    let m=-Infinity; for (let i=i0;i<i1&&i<n;i++) if (arr[i]>m) m=arr[i];
    return m===-Infinity?0:m;
  };

  // filled profile
  c.beginPath(); c.moveTo(0,cssH);
  for (let x=0;x<cssW;x++) c.lineTo(x,yOf(colAt(P,x)));
  c.lineTo(cssW,cssH); c.closePath();
  c.fillStyle='rgba(82,199,216,0.22)'; c.fill();
  c.strokeStyle='#52c7d8'; c.lineWidth=1.25; c.stroke();

  // the lighting itself: a rolling median of the profile
  c.beginPath();
  for (let x=0;x<cssW;x++) {
    const y=yOf(colAt(B,x));
    x?c.lineTo(x,y):c.moveTo(x,y);
  }
  c.strokeStyle='rgba(236,231,219,0.35)'; c.lineWidth=1; c.stroke();

  // threshold, which now follows the lighting instead of cutting across it
  c.setLineDash([4,4]); c.strokeStyle='#e5a33c'; c.lineWidth=1;
  c.beginPath();
  for (let x=0;x<cssW;x++) {
    const y=yOf(colAt(B,x)+e.cut);
    x?c.lineTo(x,y):c.moveTo(x,y);
  }
  c.stroke(); c.setLineDash([]);

  // the spots worth looking at
  for (const i of e.spikes) {
    const x=i/n*cssW;
    c.strokeStyle='#e0603e'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(x,0); c.lineTo(x,cssH); c.stroke();
  }

  if (state.edgeMark && state.edgeMark.key===key) {
    const x=state.edgeMark.i/n*cssW;
    c.strokeStyle='#ece7db'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(x,0); c.lineTo(x,cssH); c.stroke();
  }

  cv.onclick=ev=>{
    const b=cv.getBoundingClientRect();
    const i=Math.round((ev.clientX-b.left)/b.width*n);
    state.edgeMark={ key, i:Math.max(0,Math.min(n-1,i)) };
    for (const k of EDGE_ORDER) drawProfile(k);
    renderEdgeDetail();
  };
}

// Magnified look at whichever point on an edge is marked.
function renderEdgeDetail() {
  const host=document.getElementById('edgeDetail');
  if (!host) return;
  const m=state.edgeMark;
  if (!m||!state.edgeScan[m.key]) {
    host.innerHTML='<p class="hint">Click anywhere on a profile to magnify that point. Red lines mark the spots furthest above the threshold.</p>';
    return;
  }
  const e=state.edgeScan[m.key];
  const alongMm=e.startMm+(m.i/e.profile.length)*e.spanMm;
  const val=e.residual[m.i];
  const cen=e.centroid[m.i];
  // Wear begins at the cut and fades inward; print does not.
  const verdict = cen<0.45
    ? 'hard against the edge, which is what wear looks like.'
    : cen<0.85
    ? 'slightly set in — could be either.'
    : 'set well in from the edge, so more likely something printed than damage.';

  host.innerHTML=`<div class="edgeZoom">
      <div id="edgeZoomView"></div>
      <p class="hint"><b>${EDGE_LABEL[m.key]} edge at ${alongMm.toFixed(1)} mm</b> from the
      ${e.alongX?'left':'top'} corner. This point sits ${val.toFixed(1)} above the local
      baseline, against a threshold of ${e.cut.toFixed(1)}. Its brightness is centred
      <b>${cen.toFixed(2)} mm</b> in from the cut edge &mdash; ${verdict}</p>
    </div>`;

  const { w:mmW, h:mmH }=state.borderMm;
  const span=6;                                    // mm shown either side
  const half=span/2;
  const alongX=e.alongX;
  const px=Math.min(60, state.borderPxPerMm*2.4);

  let x0,y0,wmm,hmm;
  if (alongX) {
    x0=Math.max(0,Math.min(mmW-span, alongMm-half));
    y0=(m.key==='top')?0:mmH-e.depth;
    wmm=span; hmm=e.depth;
  } else {
    y0=Math.max(0,Math.min(mmH-span, alongMm-half));
    x0=(m.key==='left')?0:mmW-e.depth;
    wmm=e.depth; hmm=span;
  }
  const crop=cropCard(state.borderSrc,state.borderH,x0,y0,wmm,hmm,px);
  document.getElementById('edgeZoomView').appendChild(orientStrip(crop,m.key));
}

// ===========================================================================
// INNER BORDER
//
// The straightened card is axis-aligned, so the inner border is a perfectly
// straight vertical or horizontal line. That means no line fit is needed at
// all - just the median of many independent scans, which survives most of them
// failing. Full-art cards fail often, because the illustration meets the frame
// directly and contrast there depends on what the art happens to be doing.
// ===========================================================================

const GUIDE_MIN_MM = 0.7;    // skip the card edge itself
const GUIDE_MAX_MM = 7.0;    // widest border worth considering

function findInnerBorder(flat) {
  const cc=flat.canvas.getContext('2d');
  const img=cc.getImageData(0,0,flat.w,flat.h).data;
  const pxPerMm=1/flat.mmPerPx;
  const W=flat.w, H=flat.h;

  const at=(x,y)=>{ const i=((y|0)*W+(x|0))*4; return [img[i],img[i+1],img[i+2]]; };
  const diff=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);

  const sides={
    left:  { horiz:true,  from:0,   dir: 1, span:H, size:W },
    right: { horiz:true,  from:W-1, dir:-1, span:H, size:W },
    top:   { horiz:false, from:0,   dir: 1, span:W, size:H },
    bottom:{ horiz:false, from:H-1, dir:-1, span:W, size:H }
  };

  const SCANS=60;
  const loPx=Math.max(2, Math.round(GUIDE_MIN_MM*pxPerMm));

  // Every significant transition along one ray, not just the strongest. On a
  // Supporter or a Tool the frame is often NOT the strongest thing near the
  // edge - the art panel or the banner beats it - so taking only the maximum
  // throws away the answer before anything can vote on it.
  function peaks(fixed, s, hiPx) {
    const g=[];
    for (let t=loPx;t<=hiPx;t++) {
      const p0=s.horiz ? at(s.from+s.dir*(t-2), fixed) : at(fixed, s.from+s.dir*(t-2));
      const p1=s.horiz ? at(s.from+s.dir*(t+2), fixed) : at(fixed, s.from+s.dir*(t+2));
      g[t]=diff(p0,p1);
    }
    // Local maxima including plateaus. A crisp or quantised edge gives a flat
    // top, and emitting every pixel of it splits one real edge across several
    // depth bins - which thins its ray count until a partial artifact looks
    // just as well supported.
    const out=[];
    let t=loPx+1;
    while (t<hiPx) {
      const v=g[t];
      if (v<26 || v<g[t-1]) { t++; continue; }
      let e=t;
      while (e+1<hiPx && g[e+1]===v) e++;
      if (e+1<hiPx && g[e+1]>v) { t=e+1; continue; }   // still climbing
      const c=(t+e)/2;
      const lo=g[t-1], hi=(e+1<hiPx?g[e+1]:g[e]);
      const den=lo-2*v+hi;
      const off=Math.abs(den)>1e-6 ? Math.max(-1,Math.min(1,0.5*(lo-hi)/den)) : 0;
      out.push({ t:c+off, w:v });
      t=e+1;
    }
    return out;
  }

  // Gather every ray's peaks into depth clusters for one side.
  function clusters(s) {
    const hiPx=Math.min(s.size-3, Math.round(GUIDE_MAX_MM*pxPerMm));
    if (hiPx<=loPx+2) return [];
    const all=[];
    for (let i=0;i<SCANS;i++) {
      const u=Math.round(s.span*(0.15+0.70*i/(SCANS-1)));
      for (const p of peaks(u,s,hiPx)) all.push(p);
    }
    if (!all.length) return [];

    const bin=Math.max(1, pxPerMm*0.22);
    const map=new Map();
    for (const p of all) {
      const k=Math.round(p.t/bin);
      const e=map.get(k)||{ sum:0, wsum:0, n:0 };
      e.sum+=p.t*p.w; e.wsum+=p.w; e.n++;
      map.set(k,e);
    }
    return [...map.values()]
      .filter(e=>e.n>=14)
      .map(e=>({ depth:e.sum/e.wsum, weight:e.wsum, n:e.n }))
      .sort((a,b)=>a.depth-b.depth);
  }

  const cand={};
  for (const [key,s] of Object.entries(sides)) cand[key]=clusters(s);

  // Vote over PAIRS, not single sides. Individual borders genuinely differ when
  // a card is off-centre - that is what centring means - so agreeing on one
  // width needs a tolerance so wide that everything agrees with everything.
  // What cannot change is the SUM: left+right and top+bottom both equal twice
  // the frame width, however the card sits inside it.
  const tolSum=Math.max(3, pxPerMm*0.55);
  const combos=(a,b)=>{
    const out=[];
    for (const x of a) for (const y of b) {
      const sum=x.depth+y.depth;
      if (sum < GUIDE_MIN_MM*2*pxPerMm) continue;
      out.push({ x, y, sum, w:x.weight+y.weight });
    }
    return out;
  };
  const horizC=combos(cand.left, cand.right);
  const vertC =combos(cand.top,  cand.bottom);

  // Matching sums are necessary but not sufficient - a pair of decoys can satisfy
  // them too - and "take the outermost" alone is worse, because glare and sleeve
  // edges sit outside the frame and win it.
  //
  // What actually defines a frame is that it runs the FULL LENGTH of the card,
  // so nearly every ray finds it. Glare is patchy, a sleeve edge is partial, a
  // highlight covers part of one side. Ray count separates them; gradient
  // strength does not, and in fact favours the hard-edged artifacts.
  const valid=[];
  for (const h of horizC) for (const v of vertC) {
    if (Math.abs(h.sum-v.sum) > tolSum) continue;
    valid.push({ h, v,
      rays:h.x.n+h.y.n+v.x.n+v.y.n,
      sum:(h.sum+v.sum)/2 });
  }

  let pickH=null, pickV=null;
  if (valid.length) {
    const mostRays=Math.max(...valid.map(c=>c.rays));
    // Only among combinations with comparable support does outermost decide.
    const credible=valid.filter(c=>c.rays >= mostRays*0.8);
    const best=credible.reduce((a,b)=>b.sum<a.sum?b:a);
    pickH=best.h; pickV=best.v;
  }

  const chosen={};
  if (pickH && pickV) {
    chosen.left=pickH.x; chosen.right=pickH.y;
    chosen.top=pickV.x;  chosen.bottom=pickV.y;
  }
  const consensusPx=(pickH&&pickV)?(pickH.sum+pickV.sum)/4:null;
  const backing=(pickH&&pickV)?4:0;

  const width={}, quality={}, source={};

  for (const key of EDGE_KEYS) {
    let pick=chosen[key]||null;
    let how = pick ? 'measured' : null;
    // No pairing satisfied the constraint: fall back to this side's strongest.
    if (!pick && cand[key].length) {
      pick=cand[key].reduce((a,b)=>b.weight>a.weight?b:a);
      how='guided';
    }

    if (pick) {
      width[key]=pick.depth;
      quality[key]={ found:pick.n, total:SCANS, spreadMm:0 };
      source[key]=how;
    } else {
      width[key]=null; quality[key]={ found:0, total:SCANS, spreadMm:null }; source[key]=null;
    }
  }

  // Mirror anything still missing from the opposite side.
  const solved=EDGE_KEYS.filter(k=>width[k]!==null);
  if (solved.length) {
    const opposite={left:'right',right:'left',top:'bottom',bottom:'top'};
    const typical=median(solved.map(k=>width[k]));
    for (const key of EDGE_KEYS) {
      if (width[key]!==null) continue;
      const opp=width[opposite[key]];
      width[key]=(opp!==null&&opp!==undefined)?opp:typical;
      source[key]='mirrored';
    }
  }

  const guides={};
  for (const key of EDGE_KEYS) {
    const s=sides[key];
    guides[key]= width[key]==null ? null : (s.dir===1 ? width[key] : s.size-1-width[key]);
    if (source[key]===null) source[key]='none';
  }

  return { guides, quality, source,
           consensus: consensusPx!==null ? consensusPx*flat.mmPerPx : null,
           backing };
}

// ===========================================================================
// CANVAS
// ===========================================================================

const source=()=>state.step===1?state.img:(state.flat&&state.flat.canvas);

function resize() {
  const src=source(); if (!src) return;

  const maxH = Math.max(260, window.innerHeight*0.60);

  // Null zoom means fit-to-view; any number is a literal percentage, with the
  // viewport scrolling once the image outgrows it.
  state.scale = state.zoomPct===null ? fitScale() : state.zoomPct/100;

  const cssW = src.width*state.scale;
  const cssH = src.height*state.scale;
  const dpr = window.devicePixelRatio||1;

  canvas.style.width = cssW+'px';
  canvas.style.height = cssH+'px';
  canvas.width = Math.round(cssW*dpr);
  canvas.height = Math.round(cssH*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);

  viewport.style.maxHeight = (maxH+2)+'px';

  if (state.zoomPct===null) {
    const val=document.getElementById('zoomVal');
    const range=document.getElementById('zoomRange');
    const pct=Math.round(state.scale*100);
    if (val) val.textContent=pct+'%';
    if (range) range.value=pct;
  }

  draw();
  if (state.step===2) measure();
}
window.addEventListener('resize',()=>{ if (state.zoomPct===null) resize(); });

function draw() {
  const src=source(); if (!src) return;
  const w=canvas.width/(window.devicePixelRatio||1);
  const h=canvas.height/(window.devicePixelRatio||1);
  ctx.clearRect(0,0,w,h);
  ctx.drawImage(src,0,0,w,h);
  if (state.step===1) { drawEdges(w,h); if (state.showScan) drawScanPoints(); }
  else drawGuides(w,h);
  if (state.pointer&&state.drag) drawLoupe();
}

function drawScanPoints() {
  if (!state.scanPts) return;
  const s=state.scale;
  ctx.save();
  for (const key of EDGE_KEYS) {
    const sp=state.scanPts[key]; if (!sp) continue;
    const kept=new Set(sp.keep.map(p=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`));
    for (const p of sp.all) {
      const ok=kept.has(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
      ctx.fillStyle=ok?'#74bf76':'#e0603e';
      ctx.beginPath(); ctx.arc(p.x*s,p.y*s,ok?2:3,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawEdges(w,h) {
  const s=state.scale;
  ctx.save();
  for (const key of EDGE_KEYS) {
    const [a,b]=state.edges[key].map(p=>({x:p.x*s,y:p.y*s}));
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,ext=w+h;
    ctx.strokeStyle='#52c7d8'; ctx.globalAlpha=0.5; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(a.x-dx/L*ext,a.y-dy/L*ext);
    ctx.lineTo(b.x+dx/L*ext,b.y+dy/L*ext);
    ctx.stroke();
    ctx.globalAlpha=1; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.fillStyle='#52c7d8';
    for (const p of [a,b]) { ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill(); }
  }
  const quad=cornersFromEdges(state.edges);
  if (quad) {
    ctx.strokeStyle='#ffcb05'; ctx.lineWidth=1.5;
    for (const c of quad) {
      const x=c.x*s,y=c.y*s;
      ctx.beginPath();
      ctx.moveTo(x-7,y); ctx.lineTo(x+7,y);
      ctx.moveTo(x,y-7); ctx.lineTo(x,y+7);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawGuides(w,h) {
  const s=state.scale,g=state.guides; if (!g) return;
  const src=state.guideSource||{};
  ctx.save();

  // Measured guides are solid; anything inferred is dashed, so a guess never
  // looks like a reading.
  const style=key=>{
    const how=src[key];
    const solid = how==='measured' || how==='edited';
    ctx.setLineDash(solid?[]:[7,5]);
    ctx.strokeStyle='#ffcb05';
    ctx.globalAlpha=solid?1:0.75;
    ctx.fillStyle='#ffcb05';
  };

  ctx.lineWidth=2;
  for (const key of ['left','right']) {
    style(key);
    const x=g[key]*s;
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha=1;
    ctx.fillRect(x-4,h/2-14,8,28);
  }
  for (const key of ['top','bottom']) {
    style(key);
    const y=g[key]*s;
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha=1;
    ctx.fillRect(w/2-14,y-4,28,8);
  }
  ctx.restore();
}

function drawLoupe() {
  const src=source(),R=52,Z=4;
  const {x,y}=state.pointer;
  const cw=canvas.width/(window.devicePixelRatio||1);
  const lx=x>cw-150?x-70-R:x+70+R, ly=Math.max(R+6,y-60);
  const half=R/Z/state.scale;
  ctx.save();
  ctx.beginPath(); ctx.arc(lx,ly,R,0,Math.PI*2); ctx.clip();
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(src,x/state.scale-half,y/state.scale-half,half*2,half*2,lx-R,ly-R,R*2,R*2);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle='#ece7db'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(lx,ly,R,0,Math.PI*2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx-9,ly); ctx.lineTo(lx+9,ly);
  ctx.moveTo(lx,ly-9); ctx.lineTo(lx,ly+9);
  ctx.stroke();
  ctx.restore();
}

// ===========================================================================
// POINTER
// ===========================================================================

const eventPos=e=>{
  const b=canvas.getBoundingClientRect();
  return { x:e.clientX-b.left, y:e.clientY-b.top };
};

function takeSample(p) {
  const px=getPixels(state.img);
  const cx=Math.round(p.x/state.scale*px.scale);
  const cy=Math.round(p.y/state.scale*px.scale);
  const col=patchColour(px,cx,cy,4);
  if (!col) return;
  state.sampled[state.pickMode]=col;
  setPick(null);
  runDetect();
}

canvas.addEventListener('pointerdown', e => {
  if (!source()) return;
  const p=eventPos(e);
  if (state.step===1 && state.pickMode) { takeSample(p); return; }

  canvas.setPointerCapture(e.pointerId);
  state.pointer=p;

  if (state.step===1) {
    let best=null,bestD=Infinity;
    for (const key of EDGE_KEYS) {
      state.edges[key].forEach((pt,i)=>{
        const d=Math.hypot(p.x-pt.x*state.scale,p.y-pt.y*state.scale);
        if (d<bestD) { bestD=d; best={key,i}; }
      });
    }
    state.drag={kind:'handle',...best};
    state.edges[best.key][best.i]={x:p.x/state.scale,y:p.y/state.scale};
    if (state.fits) { state.fits[best.key]=null; renderFits(); }
  } else {
    const g=state.guides;
    const cand=[
      {key:'left',d:Math.abs(p.x-g.left*state.scale)},
      {key:'right',d:Math.abs(p.x-g.right*state.scale)},
      {key:'top',d:Math.abs(p.y-g.top*state.scale)},
      {key:'bottom',d:Math.abs(p.y-g.bottom*state.scale)}
    ].sort((a,b)=>a.d-b.d)[0];
    state.drag={kind:'guide',key:cand.key};
    if (state.guideSource) { state.guideSource[cand.key]='edited'; renderGuideNote(); }
    moveGuide(cand.key,p);
  }
  draw();
  if (state.step===2) measure();
});

canvas.addEventListener('pointermove', e => {
  if (!state.drag) return;
  const p=eventPos(e); state.pointer=p;
  if (state.drag.kind==='handle') {
    state.edges[state.drag.key][state.drag.i]={x:p.x/state.scale,y:p.y/state.scale};
  } else moveGuide(state.drag.key,p);
  draw();
  if (state.step===2) measure();
});

function moveGuide(key,p) {
  const v=(key==='left'||key==='right')?p.x/state.scale:p.y/state.scale;
  const max=(key==='left'||key==='right')?state.flat.w:state.flat.h;
  state.guides[key]=Math.min(max,Math.max(0,v));
}

function endDrag(){
  if(!state.drag) return;
  const wasHandle=state.drag.kind==='handle';
  state.drag=null; state.pointer=null;
  if (wasHandle && state.step===1) { refreshAspect(); showAspect(); }
  draw();
}

// The step-1 flag is shared, so only overwrite it with aspect news.
function showAspect() {
  if (state.step!==1) return;
  if (state.aspectWarn) setFlag('warn', state.aspectWarn);
  else { const el=document.getElementById('flag'); if (el && el.dataset.show==='1') el.dataset.show='0'; }
}
canvas.addEventListener('pointerup',endDrag);
canvas.addEventListener('pointercancel',endDrag);

let lastHandle={key:'top',i:0}, lastGuide='left';
canvas.addEventListener('keydown', e => {
  if (!source()) return;
  const step=e.shiftKey?10:1;
  const m={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
  if (!m) return;
  e.preventDefault();
  if (state.step===1) {
    if (state.drag&&state.drag.kind==='handle') lastHandle={key:state.drag.key,i:state.drag.i};
    const pt=state.edges[lastHandle.key][lastHandle.i];
    pt.x+=m[0]; pt.y+=m[1];
    if (state.fits) { state.fits[lastHandle.key]=null; renderFits(); }
  } else {
    if (state.drag&&state.drag.kind==='guide') lastGuide=state.drag.key;
    if (state.guideSource) { state.guideSource[lastGuide]='edited'; renderGuideNote(); }
    const horiz=lastGuide==='left'||lastGuide==='right';
    state.guides[lastGuide]+=horiz?m[0]:m[1];
  }
  draw();
  if (state.step===2) measure();
});

// ===========================================================================
// MEASUREMENT
// ===========================================================================

document.getElementById('sideSeg').onclick = e => {
  const b=e.target.closest('button'); if (!b) return;
  state.side=b.dataset.side;
  document.querySelectorAll('#sideSeg button').forEach(x=>x.dataset.on=x.dataset.side===state.side?'1':'0');
  buildScale();
  if (state.step===2) measure();
};

function buildScale() {
  const tol=TOLERANCE[state.side];
  document.getElementById('bands').innerHTML=
    tol.map((t,i)=>`<i style="background:${BAND_COLOR[i]}">${t.g}</i>`).join('')+
    '<div class="needle" id="needle" style="left:-99px"></div>';
  document.getElementById('ticks').innerHTML=tol.map(t=>`<span>${t.max}</span>`).join('');
}

function measure() {
  const f=state.flat,g=state.guides; if (!f||!g) return;
  const left=g.left,right=f.w-g.right,top=g.top,bottom=f.h-g.bottom;
  // Same evenness test the batch and scan apply: a card's frame is uniform, so
  // left+right must roughly equal top+bottom whatever the centring.
  const lrMm=(left+right)*f.mmPerPx, tbMm=(top+bottom)*f.mmPerPx;
  state.frameSkew = (lrMm>0.2&&tbMm>0.2) ? Math.max(lrMm,tbMm)/Math.min(lrMm,tbMm) : 1;
  state.frameMm = { lr:lrMm, tb:tbMm };
  const hPct=ratio(left,right), vPct=ratio(top,bottom);
  show('hRatio',hPct,left<=right?'left tight':'right tight');
  show('vRatio',vPct,top<=bottom?'top tight':'bottom tight');
  const mm=v=>(v*f.mmPerPx).toFixed(2);
  document.getElementById('gaps').innerHTML=
    `L <b>${mm(left)}</b> mm &nbsp; R <b>${mm(right)}</b> mm<br>`+
    `T <b>${mm(top)}</b> mm &nbsp; B <b>${mm(bottom)}</b> mm`;
  updateVerdict(Math.max(hPct??0,vPct??0), hPct!==null&&vPct!==null);
}

function ratio(a,b){ const t=a+b; if(t<=0||a<0||b<0) return null; return Math.max(a,b)/t*100; }

function show(id,pct,note) {
  const el=document.getElementById(id);
  if (pct===null) { el.innerHTML='&mdash; / &mdash;<small>lines crossed over</small>'; return; }
  const n=Math.round(pct);
  el.innerHTML=`${n} / ${100-n}<small>${note}</small>`;
}

function updateVerdict(worst,valid) {
  const el=document.getElementById('ceiling'), note=document.getElementById('ceilingNote');
  const needle=document.getElementById('needle'), tol=TOLERANCE[state.side];
  if (!valid) {
    el.textContent='\u2014'; el.style.color='var(--ink)';
    note.textContent='Opposite guides have crossed.';
    if (needle) needle.style.left='-99px';
    return;
  }
  // A grade computed from guides that cannot both be right is worse than none.
  if (state.frameSkew>1.5) {
    el.textContent='\u2014';
    el.style.color='var(--fail)';
    note.innerHTML=`Border widths disagree &mdash; <b>${state.frameMm.lr.toFixed(1)} mm</b> across
      against <b>${state.frameMm.tb.toFixed(1)} mm</b> down. A card's frame is even, so one pair
      of guides is in the wrong place. Fix them before reading the ratio.`;
    if (needle) needle.style.left='-99px';
    return;
  }

  const hit=tol.findIndex(t=>worst<=t.max);
  const grade=hit===-1?'<5':tol[hit].g;
  el.textContent=grade;
  el.style.color=hit===-1?'var(--fail)':BAND_COLOR[hit];
  note.innerHTML=(hit===0
    ? `Centering clears the ${state.side} tolerance for a 10.`
    : `Centering alone caps this at ${grade} on the ${state.side}.`)
    + (state.frameSkew>1.2
      ? ` <b>Borders differ ${state.frameMm.lr.toFixed(1)} vs ${state.frameMm.tb.toFixed(1)} mm</b> — check the guides.`
      : '');
  if (needle) {
    let pos=100;
    if (hit!==-1) {
      const lo=hit===0?50:tol[hit-1].max;
      const within=Math.min(1,Math.max(0,(worst-lo)/(tol[hit].max-lo)));
      pos=(hit+within)/tol.length*100;
    }
    needle.style.left=pos+'%';
  }
}

buildScale();
setView('gauge');


})();
