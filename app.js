/* ===========================================================================
   Centering Gauge
   ---------------------------------------------------------------------------
   The whole application: styles, page markup and logic. index.html only loads
   this file, so this is the only thing to replace when updating.
   =========================================================================== */

const VERSION = 'v64';

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
  .narrow { display:none; }
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

  .rail { display:flex; padding:0 18px; border-bottom:1px solid var(--rule);
    overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .rail::-webkit-scrollbar { display:none; }
  .rail div { display:flex; align-items:baseline; gap:9px; padding:11px 20px 11px 0;
    margin-right:20px; font-size:12px; color:var(--ink-dim); white-space:nowrap; flex:none;
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

  .concerns { display:flex; flex-direction:column; gap:6px; }
  .concerns span { font-size:11.5px; line-height:1.45; color:var(--warn);
    border-left:2px solid var(--warn); padding-left:9px; }
  .concerns[data-lv="failed"] span { color:var(--fail); border-left-color:var(--fail); }

  .gaps { font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--ink-dim); line-height:1.8; }
  .gaps b { color:var(--ink); font-weight:500; }

  .concerns { display:none; flex-direction:column; gap:6px; }
  .concerns[data-on="1"] { display:flex; }
  .concerns h4 { margin:0; font-size:9.5px; letter-spacing:0.12em; text-transform:uppercase;
    color:var(--ink-dim); font-weight:600; }
  .concerns p { margin:0; font-size:11.5px; line-height:1.45; padding-left:10px;
    border-left:2px solid var(--warn); color:var(--ink); }
  .concerns[data-lv="failed"] p { border-left-color:var(--fail); }

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
  .priceBox[data-none="1"] b { font-family:"Archivo",sans-serif; font-size:13px; color:var(--ink-dim); }

  .strip2 { margin-bottom:12px; }
  .strip2 .win { overflow-x:auto; border:1px solid var(--rule); background:var(--slab); line-height:0; }
  .strip2 img { display:block; max-width:none; cursor:zoom-in; }
  .strip2 span { display:block; font-size:10.5px; color:var(--ink-dim); line-height:1.5; margin-top:5px; }

  .lightbox { position:fixed; inset:0; background:rgba(10,10,9,0.94); z-index:50;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:20px; }
  .lightbox > div { max-width:100%; overflow-x:auto; border:1px solid var(--rule); background:var(--slab); }
  .lightbox img { display:block; max-width:none; image-rendering:auto; }
  .lightbox button { font-family:"Archivo",sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.1em; text-transform:uppercase; background:var(--border-yel);
    border:0; color:var(--graphite); padding:11px 22px; cursor:pointer; }

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

  /* quick add + tracked collection */
  .qaWrap { display:flex; flex-direction:column; gap:12px; }
  .qaOk { margin:0; padding:8px 10px; border-radius:6px; font-size:12px;
          background:rgba(120,200,140,0.12); color:#9fd8ae; }
  .qaSearch { display:flex; gap:8px; }
  .qaSearch input { flex:1; min-width:0; padding:11px 12px; font-size:16px;
                    border-radius:6px; border:1px solid var(--line);
                    background:var(--panel); color:var(--ink); }
  .qaList { display:flex; flex-direction:column; gap:6px; }
  .qaHit { display:flex; gap:10px; align-items:center; text-align:left; width:100%;
           padding:8px; border-radius:6px; border:1px solid var(--line);
           background:var(--panel); color:var(--ink); cursor:pointer; }
  .qaHit:active { background:var(--panel-2,rgba(255,255,255,0.06)); }
  .qaHit img { width:44px; border-radius:3px; flex:none; }
  .qaNoImg { width:44px; height:61px; border-radius:3px; flex:none;
             background:rgba(255,255,255,0.06); }
  .qaMeta { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .qaMeta b { font-size:14px; }
  .qaMeta em, .qaMeta i { font-style:normal; font-size:11px; color:var(--ink-dim); }
  .qaFoot { display:flex; gap:8px; }
  .qaFoot .btn { flex:1; }

  .ownedView { padding:12px; }
  .ownedWrap { display:flex; flex-direction:column; gap:10px; }
  .ownedEmpty { color:var(--ink-dim); font-size:13px; line-height:1.6; }
  .ownedHead { display:flex; align-items:center; justify-content:space-between;
               gap:10px; font-size:12px; color:var(--ink-dim); }
  .ownedList { display:flex; flex-direction:column; gap:6px; }
  .ownedRow { display:flex; gap:10px; align-items:center;
              padding:8px; border-radius:6px; border:1px solid var(--line);
              background:var(--panel); }
  .ownedRow img { width:40px; border-radius:3px; flex:none; }
  .ownedMeta { display:flex; flex-direction:column; gap:2px; flex:1; min-width:0; }
  .ownedMeta b { font-size:13px; }
  .ownedMeta em, .ownedMeta i { font-style:normal; font-size:11px; color:var(--ink-dim); }
  .ownedQty { display:flex; align-items:center; gap:8px; flex:none; }
  .ownedQty b { font-family:"IBM Plex Mono",monospace; font-size:15px; min-width:22px; text-align:center; }

  .deckWrap { display:flex; flex-direction:column; gap:8px; }
  .deckH { margin:12px 0 2px; font-family:"Archivo",sans-serif; font-size:11px;
           letter-spacing:0.12em; text-transform:uppercase; color:var(--ink-dim); }
  .deckRow { display:flex; align-items:baseline; gap:10px; padding:7px 9px;
             border-radius:5px; border:1px solid var(--line); background:var(--panel); }
  .deckRow[data-need="1"] { border-style:dashed; }
  .deckRow b { font-family:"IBM Plex Mono",monospace; font-size:14px; min-width:20px; }
  .deckName { flex:1; min-width:0; font-size:13px; }
  .deckName em { font-style:normal; display:block; font-size:10px; color:var(--ink-dim); }
  .deckTag { font-size:10px; color:var(--ink-dim); white-space:nowrap; }
  .deckRow[data-need="1"] .deckTag { color:var(--warn,#e0a35c); }
  .deckCost { margin:0; font-size:12px; color:var(--ink-dim); }

  .autoLine { margin:0; font-size:11px; line-height:1.6; color:var(--ink-dim); }
  .camBar { display:flex; gap:8px; align-items:center; flex-wrap:wrap;
            font-size:11px; color:var(--ink-dim); margin-bottom:6px; }
  .camBar select { flex:1; min-width:0; padding:7px 8px; font-size:13px;
                   border-radius:5px; border:1px solid var(--line);
                   background:var(--panel); color:var(--ink); }
  .autoWarn { color:var(--warn,#e5a33c); }
  .rvRow { width:100%; text-align:left; cursor:pointer; color:var(--ink); }
  .scanNums[data-doubt="1"] .scanWarn { color:var(--fail); border-left-color:var(--fail); }

  @media (max-width:760px) {
    /* The long words go, so four buttons fit one row instead of three. */
    .wide { display:none; }
    .narrow { display:inline; }

    header { padding:9px 10px 0; gap:7px; row-gap:0; }
    h1 { flex:1 0 100%; font-size:11.5px; letter-spacing:0.1em; padding-bottom:8px; }
    .mark { display:none; }
    .ver { display:none; }
    header .btn { flex:1; min-width:0; padding:10px 6px; font-size:10.5px;
      letter-spacing:0.04em; margin-bottom:9px; text-align:center; }

    .rail { padding:0 10px; }
    .rail div { padding:10px 14px 10px 0; margin-right:14px; font-size:11.5px; }

    .stage { padding:11px; gap:11px; }
    .panel { padding:14px; }
    .row { gap:7px; }
    .row .btn { flex:1 1 auto; padding:11px 10px; font-size:11px; }
    .zoom { flex:1 1 100%; height:auto; padding:8px 11px; }
    .zoom input[type=range] { flex:1; width:auto; }

    /* Wide tables scroll rather than squashing every column to nothing. */
    .collection { overflow-x:auto; }
    table.coll { min-width:640px; }
    .collBar { padding:11px 12px; gap:9px; }
    .collBar .btn { padding:9px 11px; font-size:10.5px; }
    .collNote { flex:1 0 100%; margin-left:0; order:9; }

    .dGrid { grid-template-columns:1fr; gap:18px; padding:14px; }
    .fits { flex-wrap:wrap; }
    .fits div { flex:1 1 50%; }
    .fits div:nth-child(2n) { border-left:0; }

    .scanLive, .scanDone { padding:11px; }
    .scanActions .btn { min-width:0; }
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
  <button class="btn" id="quickBtn" data-on="0">Quick<span class="wide"> add</span></button>
  <button class="btn" id="batchBtn" data-on="0">Batch</button>
  <button class="btn" id="ownedBtn" data-on="0">Tracked (0)</button>
  <button class="btn" id="deckBtn" data-on="0">Deck</button>
  <button class="btn" id="reviewBtn" data-on="0">Review (0)</button>
  <button class="btn" id="collBtn" data-on="0">Collection (0)</button>
  <button class="btn" data-primary id="loadBtn">Load <span class="wide">card </span>photo</button>
  <input type="file" id="file" accept="image/*" hidden>
</header>

<div class="rail" id="rail">
  <div data-step="1" data-on="1"><b>01</b> <span class="wide">Fit the </span>Edges</div>
  <div data-step="2"><b>02</b> <span class="wide">Measure </span>Centering</div>
  <div data-step="3"><b>03</b> <span class="wide">Inspect </span>Corners</div>
  <div data-step="4"><b>04</b> <span class="wide">Inspect </span>Edges</div>
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
    <div class="concerns" id="concerns"></div>
    <div class="gaps" id="gaps"></div>
  </div>
</div>

<div class="collection" id="collection" style="display:none"></div>

<div class="collection" id="batch" style="display:none"></div>

<div class="scanView" id="scan" style="display:none"></div>
<div class="ownedView" id="owned" style="display:none"></div>
<div class="ownedView" id="deck" style="display:none"></div>
<div class="ownedView" id="review" style="display:none"></div>

<footer>
  Measures <b>centering only</b> &mdash; the width of the border on each side of the
  printed frame &mdash; and reports the highest grade that centering alone would allow.
  Corners and edges are magnified for you to judge; they are not scored. Surface,
  print and authenticity are not examined at all, so a 10 here is a ceiling rather
  than a prediction. Records are kept in this browser only: export from the
  collection to keep them.
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
// Rectified card size, long edge, in pixels. This is the hard limit on
// measurement precision: at 1200 an 88mm card is 13.6 px/mm, so one pixel is
// 0.073mm and a grade boundary can sit less than two pixels away. MIN is a
// floor for small source photos; MAX lets a sharp, frame-filling photo keep the
// detail it actually carries. Raising MAX costs time quadratically - the
// homography resample is per-pixel in JS - so 2400 is a deliberate compromise.
const MIN_EDGE = 1200;
const MAX_EDGE = 2400;
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
  calibDrift:0, assessment:null, sleeveMode:false,
  view:'gauge', sortKey:'date', sortDir:'desc', openCard:null, focusField:null, lastQuery:null,
  scan:{ stream:null, running:false, lastCheck:0, quality:null, shot:null, result:null, busy:false, error:null,
        mode:'grade', lastAdded:null, lastReview:null,
        autoCapture:false, autoId:false, armed:true, goodRun:0, clearRun:0,
        cams:[], camNow:null,
        autoStats:{ added:0, review:0 } },
  batch:null, batchCalib:null,
  deck:null,
  review:{ open:null, hits:null, query:null, msg:null, searching:false },
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

// Longest side of the image the edge scan actually runs on. Everything above this
// is discarded before detection, so this - not the camera, not MAX_EDGE - is the
// real ceiling on how precisely a corner can be placed. Cost scales with area, so
// the [detect] log reports the working size; raise this until the timing hurts.
const DETECT_W = 1400;
const SAMPLES = 70;

// Fit quality in millimetres rather than pixels. A pixel threshold silently
// changes meaning whenever DETECT_W moves - identical physical scatter reads as
// 1.2px at one working size and 1.9px at another - so these gates are in mm and
// hold still no matter what the working size is set to.
const FIT_RMS_MM = 0.10;   // above this the fitted line is not really the edge
const FIT_KEPT   = 0.40;   // fraction of scan lines that have to agree
const FIT_BAD_MM = 0.50;   // beyond this the side is unusable, not merely loose

function fitKeptFrac(f){ return f ? f.kept/(f.total||SAMPLES) : 0; }

// Loose: worth saying out loud, but the reading still stands.
function fitWeak(f) {
  if (!f) return true;
  if (f.edited) return false;
  if (fitKeptFrac(f) < FIT_KEPT) return true;
  return f.rmsMm!=null && f.rmsMm > FIT_RMS_MM;
}

// Unusable: the line was fitted through scatter and nothing downstream of it
// means anything. A right edge holding 12 of 70 lines with millimetres of spread
// is this case, not the one above, and a quad built on it is not a card.
function fitUnusable(f) {
  if (!f) return true;
  if (f.edited) return false;
  if (fitKeptFrac(f) < 0.20) return true;
  return f.rmsMm!=null && f.rmsMm > FIT_BAD_MM;
}

function getPixels(img) {
  // Quick add only has to locate the card well enough to rectify it and read
  // printed text. Grading precision costs real time on a phone - the scan runs
  // twice and the cost goes with the area - and buys nothing here.
  const cap = (state.scan && state.scan.mode==='quick') ? 900 : DETECT_W;
  const s=Math.min(1,cap/Math.max(img.width,img.height));
  const w=Math.round(img.width*s), h=Math.round(img.height*s);
  const c=document.createElement('canvas');
  c.width=w; c.height=h;
  const cc=c.getContext('2d');
  cc.drawImage(img,0,0,w,h);
  console.log(`[detect] working at ${w}\u00d7${h} from ${img.width}\u00d7${img.height}`+
              (s<1?` (scaled ${s.toFixed(3)})`:' (full size)'));
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

  // A sleeve puts a second edge just inside the first. Record where it is, not
  // only that it exists - a card always sits INSIDE its sleeve, so that inner
  // edge is the card whenever the outer one turned out to be plastic.
  let doubled=false, innerT=null, innerV=0;
  const lo=Math.round(0.4/mmPerStep), hi=Math.round(1.6/mmPerStep);
  for (let t=bestT+Math.max(3,lo); t<=bestT+hi; t++) {
    const a=lum(t-2), b=lum(t+2);
    if (a===null||b===null) continue;
    const v=Math.abs(b-a);
    if (v>bestV*0.55) { doubled=true; if (v>innerV) { innerV=v; innerT=t; } }
  }

  // With the sleeve switch on, the inner edge of a pair wins.
  let useT=bestT;
  if (state.sleeveMode && innerT!==null) useT=innerT;

  const sub=(c)=>{
    const a=lum(c-2), b=lum(c-1+1);   // recompute locally, grad only spans the first window
    const gm=k=>{ const p=lum(k-2), q=lum(k+2); return (p===null||q===null)?null:Math.abs(q-p); };
    const g0=gm(c-1), g1=gm(c), g2=gm(c+1);
    if (g0===null||g1===null||g2===null) return c;
    const den=g0-2*g1+g2;
    return Math.abs(den)>1e-6 ? c+Math.max(-1,Math.min(1,0.5*(g0-g2)/den)) : c;
  };
  const t=sub(useT);

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
      // fit.rms and pxPerMm are both in detection pixels, so their ratio is a
      // millimetre figure that stays true whatever DETECT_W happens to be.
      rmsMm: pxPerMm ? fit.rms/pxPerMm : null,
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

  // Match the rectified height to the detail the source actually holds.
  // Upsampling past that only interpolates - it invents smooth pixels and
  // flatters the edge fit without adding any real information - so the source
  // is the ceiling and MIN_EDGE the floor.
  const nativeH = Math.round(Math.max(tall, wide*mmH/mmW));
  // No quick-mode shortcut here, and the reason is worth recording: capping this
  // at 1500 to save time cut the rectified card to about 17 px/mm, which put the
  // collector number near 25px tall and stopped OCR reading anything at all.
  // Detection can be cheap because it only has to locate the card. This step
  // produces the image the text is read from, so it gets the full budget.
  const H = Math.max(MIN_EDGE, Math.min(nativeH, MAX_EDGE));
  const W = Math.round(H*mmW/mmH);

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

// The bottom band of the card, kept at full resolution. The collector number
// lives there - left on modern cards, right on some older ones - so the whole
// width is taken. A few kilobytes buys a legible number after the original
// photo is long gone, and it is exactly the crop OCR would want later.
function makeNumberStrip(flat) {
  const pxPerMm=1/flat.mmPerPx;
  const bandPx=Math.round(7.5*pxPerMm);
  const y0=Math.max(0, flat.h-bandPx);
  const c=document.createElement('canvas');
  c.width=flat.w; c.height=Math.min(bandPx, flat.h);
  c.getContext('2d').drawImage(flat.canvas, 0, y0, flat.w, c.height, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.82);
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
    card:{ name:'', set:'', number:'', rarity:'', notes:'',
           supertype:'', subtypes:[], types:[], evolvesFrom:'', hp:null,
           retreat:null, attackCost:[], legalities:{}, regMark:'' },
    type:state.cardType, side:state.side,
    centering:{
      leftMm:mm(left), rightMm:mm(right), topMm:mm(top), bottomMm:mm(bottom),
      hPct:+(hPct??0).toFixed(2), vPct:+(vPct??0).toFixed(2),
      leftPct:+(share(left,right)??0).toFixed(2),
      topPct:+(share(top,bottom)??0).toFixed(2),
      worst:+worst.toFixed(2),
      ceiling: hit===-1 ? null : tol[hit].g
    },
    corners:null, edges:null,
    quality:{
      pxPerMm: state.pxPerMm?+state.pxPerMm.toFixed(1):null,
      // The rectified card is what every mm figure is read off, so this - not
      // the source figure above - is the real limit on precision.
      measuredPxPerMm: f.mmPerPx?+(1/f.mmPerPx).toFixed(1):null,
      separation: state.borderRef?Math.round(state.borderRef.headroom):null,
      sensitivity: state.cornerSens,
      depthMm: state.edgeDepth,
      guideSource: state.guideSource?{...state.guideSource}:null
    },
    thumb:makeThumb(f,150),
    numStrip:makeNumberStrip(f)
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

// Query syntax here is fussier than the docs suggest, and a bad query returns a
// 500 rather than a useful message. So several forms are tried in turn and the
// narrowing happens on our side, where it cannot break anything.
function queryForms(text) {
  const t=text.trim();
  const num=t.match(/^#?(\d{1,4})\s*(?:\/\s*(\d{1,4}))?$/);

  if (num) {
    // Numbers are stored stripped: a card printed "086/084" is number 86.
    const bare=String(parseInt(num[1],10));
    return {
      kind:'number',
      total: num[2] ? parseInt(num[2],10) : null,
      forms: [`number:${bare}`, `number:"${bare}"`, `number:"${num[1]}"`]
    };
  }

  const safe=t.replace(/["\\]/g,'').trim();
  const first=safe.split(/\s+/)[0];
  return {
    kind:'name',
    total:null,
    forms: [`name:"*${safe}*"`, `name:${first}*`, `name:"${safe}"`]
  };
}

async function apiGet(q, pageSize) {
  const url=`${API_BASE}/cards?q=${encodeURIComponent(q)}`
          + `&pageSize=${pageSize}&orderBy=-set.releaseDate`;
  const headers={};
  const k=apiKey();
  if (k) headers['X-Api-Key']=k;

  let res;
  try {
    res=await fetch(url,{ headers });
  } catch(e) {
    const err=new Error('network'); err.kind='network'; throw err;
  }
  if (!res.ok) {
    // A 250-row request ordered by release date is heavy enough that the API
    // sometimes just gives up. One cheaper retry costs little and rescues most
    // of them; a real failure still surfaces.
    if (res.status>=500 && pageSize>60) {
      try { return await apiGet(q, 60); } catch(e) {}
    }
    const err=new Error('http '+res.status); err.kind='http'; err.status=res.status; throw err;
  }
  const json=await res.json();
  return json.data||[];
}

// Everything a deck list needs and grading does not: what kind of card this is,
// what it evolves from, what its attacks cost, and which formats it is legal in.
// Captured at lookup time because fetching it later costs one API call per card
// and the free tier will not wear that for a large collection.
function deckFacts(c) {
  return {
    supertype:   c.supertype||'',                 // Pokémon | Trainer | Energy
    subtypes:    c.subtypes||[],                  // Basic, Stage 1, ex, Supporter, Item
    types:       c.types||[],                     // Fire, Water, ...
    evolvesFrom: c.evolvesFrom||'',
    hp:          c.hp?parseInt(c.hp,10):null,
    retreat:     Array.isArray(c.retreatCost)?c.retreatCost.length:null,
    attackCost:  (c.attacks||[]).map(a=>a.cost||[]),
    legalities:  c.legalities||{},                // { standard:'Legal', expanded:'Legal' }
    regMark:     c.regulationMark||''
  };
}

const mapCard=c=>({
  id:c.id, name:c.name,
  set:c.set?c.set.name:'', setId:c.set?c.set.id:'',
  printedTotal:c.set?c.set.printedTotal:null,
  number:c.number+(c.set&&c.set.printedTotal?'/'+c.set.printedTotal:''),
  rarity:c.rarity||'',
  thumb:c.images?c.images.small:null,
  price:bestPrice(c),
  ...deckFacts(c)
});

async function searchCards(text) {
  const plan=queryForms(text);
  let raw=null, used=null, lastErr=null;

  for (const q of plan.forms) {
    try {
      const got=await apiGet(q, plan.kind==='number'?250:24);
      if (got.length) { raw=got; used=q; break; }
    } catch(e) {
      lastErr=e;
      if (e.kind==='network') break;          // no point trying more forms
    }
  }

  if (!raw) {
    if (lastErr && lastErr.kind==='network')
      throw new Error('Could not reach the card database at all — no connection, or the API '
        + 'is refusing browser requests from this page.');
    if (lastErr && lastErr.status===429)
      throw new Error('Rate limited. Add a free API key to lift the limit, or wait a minute.');
    if (lastErr && lastErr.status>=500)
      throw new Error('The card database rejected every form of that search (error '
        + lastErr.status + '). Try just the card name.');
    return [];
  }

  let hits=raw.map(mapCard);

  // Narrow by the printed total here rather than in the query. A card marked
  // "086/084" is number 86 in a set of 84 - a secret rare - and that pairing is
  // what makes it unique.
  if (plan.total!==null) {
    const exact=hits.filter(h=>h.printedTotal===plan.total);
    if (exact.length) hits=exact;
  }
  state.lastQuery=used;
  return hits.slice(0,12);
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
  // Deck facts ride along, so a graded card can still be counted in a deck later
  // without a second trip to the API.
  Object.assign(rec.card, {
    supertype:hit.supertype||'', subtypes:hit.subtypes||[], types:hit.types||[],
    evolvesFrom:hit.evolvesFrom||'', hp:hit.hp??null, retreat:hit.retreat??null,
    attackCost:hit.attackCost||[], legalities:hit.legalities||{}, regMark:hit.regMark||''
  });
  rec.market = hit.price
    ? { ...hit.price, at:new Date().toISOString(), apiId:hit.id }
    : { none:true, at:new Date().toISOString(), apiId:hit.id };
  rec.apiId=hit.id;
  writeStore(st);
  renderCollection();
}

async function refreshPrice(recId) {
  const st=loadStore();
  const rec=st.cards.find(c=>c.id===recId);
  if (!rec||!rec.apiId) return;
  const headers={}; const k=apiKey(); if (k) headers['X-Api-Key']=k;
  let res;
  try {
    res=await fetch(`${API_BASE}/cards/${encodeURIComponent(rec.apiId)}`,{ headers });
  } catch(e) {
    throw new Error('could not reach the database');
  }
  if (!res.ok) throw new Error(res.status===404
    ? 'the database no longer lists this card id'
    : 'the database returned '+res.status);
  const json=await res.json();
  const p=bestPrice(json.data||{});
  const st2=loadStore();
  const r2=st2.cards.find(c=>c.id===recId);
  if (r2) {
    r2.market = p
      ? { ...p, at:new Date().toISOString(), apiId:rec.apiId }
      : { none:true, at:new Date().toISOString(), apiId:rec.apiId };
    writeStore(st2);
  }
  renderCollection();
}

const money=m=>{
  if (!m || m.none) return '—';
  const sym=m.currency==='EUR'?'\u20ac':m.currency==='USD'?'$':'';
  return sym+m.value.toFixed(2);
};

// ===========================================================================
// OWNED COPIES  (collection tracking, no grading)
// ===========================================================================
//
// Deliberately a separate store from the graded records. A graded record is one
// physical copy with measurements attached; an owned entry is "I have four of
// these". Mixing them would mean either faking centering data on cards that were
// never measured, or guarding every graded read against nulls - and the list,
// sort and compare views all reach straight into r.centering.worst today.
// ===========================================================================

const OWNED_KEY='centeringGauge.owned.v1';

function loadOwned() {
  if (!storeAvailable()) return { cards:[] };
  try {
    const raw=localStorage.getItem(OWNED_KEY);
    if (!raw) return { cards:[] };
    const o=JSON.parse(raw);
    return { cards:o.cards||[] };
  } catch(e) { return { cards:[] }; }
}

function writeOwned(st) {
  if (!storeAvailable()) return { ok:false, error:'No storage available in this browser.' };
  try { localStorage.setItem(OWNED_KEY, JSON.stringify(st)); return { ok:true }; }
  catch(e) { return { ok:false, error:'Storage is full. Export the collection, then remove some records.' }; }
}

const ownedCount = () => loadOwned().cards.reduce((n,c)=>n+(c.qty||1),0);

// A duplicate raises the count rather than adding a second row. Which printing
// it is still matters, so the key is the API id, not the card name: a Charizard
// from two sets is two entries, four of one printing is one entry of four.
function ownedAdd(hit, thumb) {
  const st=loadOwned();
  const found=st.cards.find(c=>c.apiId===hit.id);
  if (found) {
    found.qty=(found.qty||1)+1;
    found.seenAt=new Date().toISOString();
    if (!found.thumb && thumb) found.thumb=thumb;
  } else {
    st.cards.unshift({
      apiId:hit.id, qty:1,
      addedAt:new Date().toISOString(), seenAt:new Date().toISOString(),
      name:hit.name, set:hit.set, setId:hit.setId, number:hit.number, rarity:hit.rarity,
      thumb:thumb||hit.thumb||null,
      price:hit.price||null,
      supertype:hit.supertype||'', subtypes:hit.subtypes||[], types:hit.types||[],
      evolvesFrom:hit.evolvesFrom||'', hp:hit.hp??null, retreat:hit.retreat??null,
      attackCost:hit.attackCost||[], legalities:hit.legalities||{}, regMark:hit.regMark||''
    });
  }
  return writeOwned(st);
}

function ownedAdjust(apiId, delta) {
  const st=loadOwned();
  const i=st.cards.findIndex(c=>c.apiId===apiId);
  if (i<0) return;
  st.cards[i].qty=(st.cards[i].qty||1)+delta;
  if (st.cards[i].qty<=0) st.cards.splice(i,1);
  writeOwned(st);
}

function ownedExport() {
  const blob=new Blob([JSON.stringify(loadOwned(),null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`owned-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}

// Records saved before deck facts existed have a name and an apiId but nothing a
// deck can be built from. This refills them one at a time, slowly enough not to
// trip the rate limit, and reports progress rather than freezing the page.
async function enrichGraded(onProgress) {
  const st=loadStore();
  const todo=st.cards.filter(r=>r.apiId && r.card && !r.card.supertype);
  if (!todo.length) return { done:0, failed:0, total:0 };
  const headers={}; const k=apiKey(); if (k) headers['X-Api-Key']=k;
  let done=0, failed=0;
  for (const rec of todo) {
    try {
      const res=await fetch(`${API_BASE}/cards/${encodeURIComponent(rec.apiId)}`,{ headers });
      if (res.ok) {
        const c=(await res.json()).data;
        if (c) { Object.assign(rec.card, deckFacts(c)); done++; } else failed++;
      } else failed++;
    } catch(e) { failed++; }
    if (onProgress) onProgress(done+failed, todo.length);
    // The free tier is tight without a key; a short gap costs little next to
    // losing the whole run to a 429 halfway through.
    await new Promise(r=>setTimeout(r, k?120:420));
  }
  writeStore(st);
  return { done, failed, total:todo.length };
}

const qaEsc = s => String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

async function quickSearch() {
  const sc=state.scan, r=sc.result;
  if (!r||!r.quick) return;
  const box=document.getElementById('qaQ');
  const text=(box?box.value:'').trim();
  if (!text) return;
  r.query=text; r.searching=true; r.msg=null; r.hits=null;
  renderScan();
  try {
    r.hits=await searchCards(text);
    if (!r.hits.length) r.msg='Nothing matched. Try the number on its own, or fewer words of the name.';
  } catch(e) {
    r.hits=[]; r.msg=e.message||'Lookup failed.';
  }
  r.searching=false;
  renderScan();
}

function quickPick(i) {
  const r=state.scan.result;
  if (!r||!r.hits||!r.hits[i]) return;
  const hit=r.hits[i];
  const w=ownedAdd(hit, r.thumb);
  if (!w.ok) { r.msg=w.error; renderScan(); return; }
  state.scan.lastAdded=`${hit.name} — ${hit.set} ${hit.number}`;
  quickNext();
}

// Straight back to the camera. The point of this mode is the next card, not a
// confirmation screen between every one.
function quickNext() {
  const sc=state.scan;
  sc.result=null; sc.shot=null; sc.busy=false;
  renderScan();
  if (cameraPossible()) startScan();
}

function renderQuickAdd(host, r) {
  const sc=state.scan;
  const list = r.hits===null ? ''
    : !r.hits.length ? ''
    : `<div class="qaList">${r.hits.map((h,i)=>`
        <button class="qaHit" data-i="${i}">
          ${h.thumb?`<img src="${h.thumb}" alt="">`:'<span class="qaNoImg"></span>'}
          <span class="qaMeta">
            <b>${qaEsc(h.name)}</b>
            <em>${qaEsc(h.set)} &middot; ${qaEsc(h.number)}${h.rarity?' &middot; '+qaEsc(h.rarity):''}</em>
            ${h.price?`<i>${h.price.value.toFixed(2)} ${qaEsc(h.price.currency)}</i>`:''}
          </span>
        </button>`).join('')}</div>`;

  host.innerHTML=`<div class="scanDone qaWrap">
    ${r.autoBusy?`<p class="qaOk">${qaEsc(r.autoMsg||'Working…')}</p>`:''}
    ${r.fault?`<p class="scanWarn">${qaEsc(r.fault)}. The strip below may still be readable — check it before typing.</p>`:''}
    ${sc.lastAdded?`<p class="qaOk">Added ${qaEsc(sc.lastAdded)} &middot; ${ownedCount()} tracked</p>`:''}
    <div class="scanCard"><img src="${r.thumb}" alt=""></div>
    ${r.numStrip?`<div class="strip2">
      <div class="win"><img src="${r.numStrip}" alt="bottom of card"></div>
      <span>Collector number &mdash; read it here and type it below.</span>
    </div>`:''}
    <div class="qaSearch">
      <input id="qaQ" type="search" inputmode="search" autocomplete="off"
             placeholder="Number or name, e.g. 97/084" value="${qaEsc(r.query||'')}">
      <button class="btn" data-primary id="qaGo">${r.searching?'Searching…':'Find'}</button>
    </div>
    ${r.msg?`<p class="scanWarn">${qaEsc(r.msg)}</p>`:''}
    ${list}
    <div class="qaFoot">
      <button class="btn" id="qaSkip">Skip this card</button>
      <button class="btn" id="qaStop">Done</button>
    </div>
  </div>`;

  const q=document.getElementById('qaQ');
  if (q) {
    q.onkeydown=e=>{ if (e.key==='Enter') { e.preventDefault(); quickSearch(); } };
    if (r.hits===null && !r.searching) q.focus();
  }
  const go=document.getElementById('qaGo');
  if (go) go.onclick=quickSearch;
  host.querySelectorAll('.qaHit').forEach(b=>{
    b.onclick=()=>quickPick(+b.dataset.i);
  });
  const skip=document.getElementById('qaSkip');
  if (skip) skip.onclick=()=>{ sc.lastAdded=null; quickNext(); };
  const stop=document.getElementById('qaStop');
  if (stop) stop.onclick=()=>{ sc.lastAdded=null; sc.mode='grade'; setView('owned'); };
}

// ---- owned list view ----

function renderOwned() {
  const host=document.getElementById('owned');
  if (!host) return;
  const st=loadOwned();
  const cards=st.cards;
  const total=cards.reduce((n,c)=>n+(c.qty||1),0);
  const worth=cards.reduce((s,c)=>s+((c.price&&c.price.value)||0)*(c.qty||1),0);
  const cur=(cards.find(c=>c.price&&c.price.currency)||{}).price;

  if (!cards.length) {
    host.innerHTML=`<div class="ownedWrap">
      <p class="ownedEmpty">Nothing tracked yet. Use <b>Quick add</b> to scan cards straight into the collection without grading them.</p>
    </div>`;
    return;
  }

  host.innerHTML=`<div class="ownedWrap">
    <div class="ownedHead">
      <span><b>${total}</b> cards &middot; <b>${cards.length}</b> distinct${worth?` &middot; about ${worth.toFixed(2)} ${qaEsc(cur?cur.currency:'')}`:''}</span>
      <button class="btn" id="ownedExport">Export</button>
    </div>
    <div class="ownedList">${cards.map(c=>`
      <div class="ownedRow">
        ${c.thumb?`<img src="${c.thumb}" alt="">`:'<span class="qaNoImg"></span>'}
        <span class="ownedMeta">
          <b>${qaEsc(c.name)}</b>
          <em>${qaEsc(c.set)} &middot; ${qaEsc(c.number)}${c.supertype?' &middot; '+qaEsc(c.supertype):''}</em>
          ${c.price?`<i>${c.price.value.toFixed(2)} ${qaEsc(c.price.currency)} each</i>`:''}
        </span>
        <span class="ownedQty">
          <button class="btn" data-less="${qaEsc(c.apiId)}">&minus;</button>
          <b>${c.qty||1}</b>
          <button class="btn" data-more="${qaEsc(c.apiId)}">+</button>
        </span>
      </div>`).join('')}</div>
  </div>`;

  const ex=document.getElementById('ownedExport');
  if (ex) ex.onclick=ownedExport;
  host.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>{ ownedAdjust(b.dataset.more,1); renderOwned(); });
  host.querySelectorAll('[data-less]').forEach(b=>b.onclick=()=>{ ownedAdjust(b.dataset.less,-1); renderOwned(); });
}

// ===========================================================================
// AUTO SCAN  (hands-free capture, number OCR, review queue)
// ===========================================================================
//
// Two independent halves, so one failing does not take the other down:
//   - Auto capture fires the shutter once framing has been good for a moment.
//   - Auto identify reads the collector number and looks the card up.
//
// If identification is unavailable or unsure, the card is still captured and
// parked in the review queue. A wrong card quietly entering the collection is
// much worse than a card waiting to be named, so the bar for adding without
// asking is deliberately high and anything short of certain gets referred.
// ===========================================================================

const REVIEW_KEY='centeringGauge.review.v1';
const AUTO_GOOD_FRAMES  = 3;    // ~0.7s of steady good framing before firing
const AUTO_CLEAR_FRAMES = 2;    // the card must leave the frame before re-arming
const OCR_MIN_CONF      = 60;   // Tesseract's own confidence, 0-100
const REVIEW_MAX        = 200;

function loadReview() {
  if (!storeAvailable()) return { items:[] };
  try { const raw=localStorage.getItem(REVIEW_KEY);
        return raw ? { items:(JSON.parse(raw).items||[]) } : { items:[] }; }
  catch(e) { return { items:[] }; }
}
function writeReview(st) {
  if (!storeAvailable()) return { ok:false, error:'No storage available in this browser.' };
  try { localStorage.setItem(REVIEW_KEY, JSON.stringify(st)); return { ok:true }; }
  catch(e) { return { ok:false, error:'Storage is full — clear the review queue, or export and prune.' }; }
}
const reviewCount = () => loadReview().items.length;

function reviewAdd(item) {
  const st=loadReview();
  if (st.items.length>=REVIEW_MAX)
    return { ok:false, error:`Review queue is full (${REVIEW_MAX}). Work through it before scanning more.` };
  st.items.unshift({ id:'r'+Date.now()+Math.random().toString(36).slice(2,6),
                     at:new Date().toISOString(), ...item });
  return writeReview(st);
}
function reviewRemove(id) {
  const st=loadReview();
  st.items=st.items.filter(i=>i.id!==id);
  writeReview(st);
}

// Narrower than the grading strip: this is queue storage, and localStorage fills
// up quickly at full card width.
function makeReviewStrip(flat, w) {
  const pxPerMm=1/flat.mmPerPx;
  const bandPx=Math.max(1, Math.round(8*pxPerMm));
  const y0=Math.max(0, flat.h-bandPx);
  const sc=w/flat.w;
  const c=document.createElement('canvas');
  c.width=Math.round(w); c.height=Math.max(1,Math.round(bandPx*sc));
  c.getContext('2d').drawImage(flat.canvas, 0,y0, flat.w,bandPx, 0,0, c.width,c.height);
  return c.toDataURL('image/jpeg',0.7);
}

// ---- OCR ----

let ocrWorker=null, ocrState='idle';   // idle | loading | ready | failed

function loadScript(src) {
  return new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=src; s.onload=()=>res(); s.onerror=()=>rej(new Error('script blocked or offline'));
    document.head.appendChild(s);
  });
}

// Loaded only when auto identify is switched on, never at startup. The language
// model is a one-time download of a few megabytes which the browser then caches.
async function ocrReady() {
  if (ocrState==='ready')  return true;
  if (ocrState==='failed') return false;
  if (ocrState==='loading') {
    while (ocrState==='loading') await new Promise(r=>setTimeout(r,150));
    return ocrState==='ready';
  }
  ocrState='loading';
  try {
    if (!window.Tesseract)
      await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    ocrWorker=await window.Tesseract.createWorker('eng');
    await ocrWorker.setParameters({
      // The number is digits and a slash. Narrowing the alphabet is the single
      // biggest accuracy win available here.
      // Whitelist is set per pass now, not here - see OCR_ALPHABET. Leaving the
      // digits-and-capitals list installed globally meant the name band could
      // only ever return capitals, so "Munkidori" came back as noise and every
      // name route was dead on arrival.
      tessedit_char_whitelist:'',
      // Block mode, not single-line. The bottom crop routinely holds two lines -
      // the rules text above and the illustrator/set/number line below - and
      // single-line mode garbles anything with more than one.
      tessedit_pageseg_mode:'6'
    });
    ocrState='ready';
    console.log('[ocr] ready');
    return true;
  } catch(e) {
    console.log('[ocr] unavailable:', e&&e.message);
    ocrState='failed';
    return false;
  }
}


// The set code beside the number - PRE, SVI, OBF - turns a guess into a lookup.
// A number alone is shared by every reverse holo and reprint carrying it; a set
// code plus a number is very close to a unique key. Codes come from the API once
// and are cached, so a candidate only counts if it is genuinely a set code.
let setCatalogue=null;
const LANG_TOKENS=new Set(['EN','JP','FR','DE','IT','ES','PT','KO','ZH','NL','RU']);

async function loadSetCodes() {
  if (setCatalogue) return setCatalogue;
  setCatalogue=new Map();
  try {
    const headers={}; const k=apiKey(); if (k) headers['X-Api-Key']=k;
    const res=await fetch(`${API_BASE}/sets?pageSize=500`,{ headers });
    if (res.ok)
      for (const st of ((await res.json()).data||[]))
        if (st.ptcgoCode)
          setCatalogue.set(st.ptcgoCode.toUpperCase(),
                           { id:st.id, name:st.name, total:st.printedTotal });
  } catch(e) { console.log('[sets] catalogue unavailable, falling back to number only'); }
  console.log(`[sets] ${setCatalogue.size} set codes cached`);
  return setCatalogue;
}

// Tesseract runs the set code into whatever follows it - the small EN beside it
// comes back as PRESET - so codes of three letters or more are matched as
// substrings rather than whole words. Two-letter codes still need a clean token,
// because a two-letter fragment turns up inside far too many words to trust.
function findSetCode(t, codes) {
  if (!codes || !codes.size) return null;
  let best=null;
  for (const code of codes.keys()) {
    if (LANG_TOKENS.has(code)) continue;
    let at=-1;
    if (code.length>=3) at=t.indexOf(code);
    else { const m=t.match(new RegExp('\\b'+code+'\\b')); at=m?m.index:-1; }
    if (at<0) continue;
    if (!best || code.length>best.code.length || (code.length===best.code.length && at<best.at))
      best={ code, at };
  }
  return best ? best.code : null;
}

// Everything worth having out of the bottom line, with an honest note on how
// much the number is worth. A slashed pair is a real reading; a lone digit
// pulled out of noise is not, and treating the two alike is what produced
// "12 cards share 4".
// The separator is the least reliable character on the line. A slash comes back
// as a 7, a 1, an I, or vanishes entirely, so "079/086" arrives as "0797086".
// Rather than demand a literal slash, produce every plausible split and let the
// card database decide which one is a real card - the same trick that keeps the
// set codes honest.
function numberCandidates(t) {
  const seen=new Set(), out=[];
  const push=(a,b,trust)=>{
    // parseInt drops the leading zero, which is what the database wants anyway:
    // the card printed as 095/167 is number 95 in the API.
    const n=parseInt(a,10), tot=b!=null?parseInt(b,10):null;
    if (!(n>=1 && n<=999)) return;
    if (tot!=null && !(tot>=1 && tot<=999)) return;
    const key=n+'/'+tot;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ number:n, total:tot, trust });
  };

  // A digit group longer than three has picked up a neighbour: "095/167" comes
  // back as "0955/1674". Which end the spare digit is on cannot be known from
  // the text, so offer both readings of each group and let the database decide.
  const splits=g => g.length<=3 ? [g] : [g.slice(0,3), g.slice(-3), g.slice(0,4)];
  for (const m of t.matchAll(/(\d{1,4})\s*\/\s*(\d{1,4})/g))
    for (const a of splits(m[1]))
      for (const b of splits(m[2]))
        push(a, b, (m[1].length<=3 && m[2].length<=3) ? 'strong' : 'split');
  // A separator misread as a character rather than dropped.
  for (const m of t.matchAll(/(\d{2,3})\s*[\/71IlJ]\s*(\d{2,3})/g)) push(m[1],m[2],'split');
  // Separator lost completely, digits run together.
  for (const m of t.matchAll(/\d{6,8}/g)) {
    const d=m[0];
    if (d.length===6) push(d.slice(0,3), d.slice(3), 'split');
    if (d.length===7) { push(d.slice(0,3), d.slice(4), 'split'); push(d.slice(0,3), d.slice(3,6), 'split'); }
    if (d.length===8) push(d.slice(0,4), d.slice(4), 'split');
  }
  if (!out.length) {
    const solo=t.match(/\b(\d{1,3})\b/);
    if (solo) push(solo[1], null, 'weak');
  }
  return out;
}

function parseStripText(text, codes) {
  const t=(text||'').toUpperCase().replace(/[|]/g,'I');
  const out={ number:null, total:null, setCode:null, regMark:null, trust:'none', candidates:[] };

  out.candidates=numberCandidates(t);
  if (out.candidates.length) {
    const c=out.candidates[0];
    out.number=c.number; out.total=c.total; out.trust=c.trust;
  }

  out.setCode=findSetCode(t, codes);

  if (out.setCode) {
    const rm=t.match(new RegExp('(?:^|[^A-Z])([D-K])\\s*'+out.setCode+'\\b'));
    if (rm) out.regMark=rm[1];
  }
  return out;
}

// Sharpen before handing anything to Tesseract. The text on these crops is
// soft because the card was photographed at around 11 px/mm and then scaled up,
// and a light unsharp pass recovers enough edge for the recogniser to bite on.
// How hard to sharpen before recognition. Too little and soft digits stay
// soft; too much and thin strokes break into speckle.
const UNSHARP=0.9;

function prepCanvas(src) {
  const w=src.width, h=src.height;
  const cx=src.getContext('2d',{ willReadFrequently:true });
  const img=cx.getImageData(0,0,w,h), px=img.data;

  let lo=255, hi=0;
  const grey=new Uint8ClampedArray(w*h);
  for (let i=0,p=0;i<px.length;i+=4,p++) {
    const g=(px[i]*0.299+px[i+1]*0.587+px[i+2]*0.114)|0;
    grey[p]=g;
    if (g<lo) lo=g;
    if (g>hi) hi=g;
  }
  const span=Math.max(1,hi-lo);

  const out=new Uint8ClampedArray(w*h);
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const p=y*w+x;
    if (x===0||y===0||x===w-1||y===h-1) { out[p]=grey[p]; continue; }
    // Standard unsharp: push the pixel away from its neighbourhood average.
    // The previous form subtracted eight full neighbours from a ninefold centre,
    // which all but binarised thin antialiased strokes - and digits on a card
    // are thin antialiased strokes.
    const avg=(grey[p-1]+grey[p+1]+grey[p-w]+grey[p+w]
             + grey[p-w-1]+grey[p-w+1]+grey[p+w-1]+grey[p+w+1])/8;
    out[p]=Math.max(0,Math.min(255, grey[p] + UNSHARP*(grey[p]-avg)));
  }

  for (let i=0,p=0;i<px.length;i+=4,p++) {
    const v=Math.max(0,Math.min(255,((out[p]-lo)*255/span)|0));
    px[i]=px[i+1]=px[i+2]=v;
  }
  cx.putImageData(img,0,0);
  return src;
}

// Crop a horizontal band off the rectified card, scaled so the text is tall
// enough for Tesseract to work with rather than left at whatever the photo gave.
// Cut a rectangle out of the rectified card in millimetres, because the card is
// a known physical object and every feature on it sits at a known place. The
// previous version could only take a band from the very top or the very bottom,
// which is why the name crop began at 0mm - above where any name is printed -
// and caught the border instead of the text.
function bandCanvas(flat, mmTop, mmBottom, x0, x1, targetPx) {
  const pxPerMm=1/flat.mmPerPx;
  const y0=Math.max(0, Math.round(mmTop*pxPerMm));
  const y1=Math.min(flat.h, Math.round(mmBottom*pxPerMm));
  const sx=Math.max(0, Math.round(flat.w*x0));
  const sw=Math.max(1, Math.round(flat.w*(x1-x0)));
  const sh=Math.max(1, y1-y0);
  const up=Math.max(1, Math.min(5, targetPx/sh));
  const c=document.createElement('canvas');
  c.width=Math.round(sw*up); c.height=Math.round(sh*up);
  const cx=c.getContext('2d',{ willReadFrequently:true });
  cx.imageSmoothingQuality='high';
  cx.drawImage(flat.canvas, sx,y0, sw,sh, 0,0, c.width,c.height);
  return prepCanvas(c);
}

// Where things actually are on a 63x88mm card, measured off real cards:
//   - the name runs about 5mm to 12mm down, left of the HP
//   - the set code and collector number sit on the last printed line, roughly
//     82mm down, in the left half - the illustrator credit is the line above and
//     the rules text is to the right, and both were being fed in as noise
const numberCanvas = flat => bandCanvas(flat, 81.5, 87.5, 0.02, 0.52, 190);
const nameCanvas   = flat => bandCanvas(flat,  4.0, 13.5, 0.04, 0.76, 210);

// Two bands, two alphabets. The bottom line is digits, a slash and the capitals
// of a set code; the name is mixed case with apostrophes and hyphens. Narrowing
// the alphabet is the biggest accuracy win available - but only if it is the
// right alphabet for what is being read.
const OCR_ALPHABET = {
  number:'0123456789/ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  name:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'- .é"
};

async function ocrPass(canvas, psm, alphabet) {
  await ocrWorker.setParameters({
    tessedit_pageseg_mode:psm,
    tessedit_char_whitelist:alphabet||''
  });
  const r=await ocrWorker.recognize(canvas);
  return { text:((r&&r.data&&r.data.text)||'').trim(),
           conf:(r&&r.data&&r.data.confidence)||0 };
}

async function readCardFacts(flat) {
  if (!(await ocrReady())) return { ok:false, why:'number reading is unavailable here' };
  const codes=await loadSetCodes();
  // The single number that predicts whether any of this can work. A collector
  // number is about 1.5mm tall, so below roughly 25 px/mm it is under 40px even
  // after upscaling, and Tesseract has little to work with.
  const pxmm=1/flat.mmPerPx;
  console.log(`[ocr] reading a card rectified at ${pxmm.toFixed(1)} px/mm`
    + (pxmm<22?' — too low for the collector number, expect the name to carry it':''));
  try {
    const c=numberCanvas(flat);
    let pass=await ocrPass(c,'6',OCR_ALPHABET.number);
    let f=parseStripText(pass.text, codes);
    // Block mode assumes tidy lines. When it finds nothing, sparse mode often
    // picks the number out of a crop the layout analyser gave up on.
    // A second pass costs as much as the first, so it only runs when the first
    // came back with nothing usable at all - not merely something imperfect.
    if (!f.candidates.length && !f.setCode) {
      const alt=await ocrPass(c,'11',OCR_ALPHABET.number);
      const af=parseStripText(alt.text, codes);
      if (af.candidates.length || af.setCode) { pass=alt; f=af; }
    }
    console.log(`[ocr] number band "${pass.text.replace(/\n/g,' | ')}" conf=${Math.round(pass.conf)} `
      + `-> set=${f.setCode||'--'} candidates=`
      + (f.candidates.length?f.candidates.map(c=>`${c.number}${c.total?'/'+c.total:''}(${c.trust})`).join(' '):'none'));
    return { ok:true, text:pass.text, conf:pass.conf, facts:f };
  } catch(e) {
    return { ok:false, why:'number reading failed' };
  }
}

// The name is roughly three times the height of the collector number, so it
// survives a soft photo far better. That makes it a primary route to the card,
// not just a tiebreaker.
// The top strip is never one line. A Trainer carries its category on the left
// and TRAINER on the right above the name; a Pokemon carries its stage and what
// it evolves from. Single-line mode blends all of that into pulp, so read it as
// a block and throw away the labels.
const NAME_NOISE=/^(TRAINER|ITEM|SUPPORTER|STADIUM|TOOL|POKEMON TOOL|POKEMON|BASIC|STAGE ?[12]|ENERGY|SPECIAL ENERGY|EVOLVES FROM.*|[VX]|VMAX|VSTAR|EX|GX)$/i;

// OCR noise off artwork looks like "SER RWWW F EJ BRR ES TED": many short
// tokens, stray single letters. A wildcard search on that still matches cards,
// which is worse than reading nothing at all - so a candidate has to look like a
// name before it is allowed near the database.
function nameLooksReal(t) {
  const s=(t||'').trim();
  if (s.length<3 || s.length>32) return false;
  if (!/[aeiou]/i.test(s)) return false;
  const w=s.split(/\s+/);
  if (w.length>4) return false;
  if (w.filter(x=>x.length===1).length>1) return false;
  // No card name has a fourteen-letter word. OCR noise does.
  if (w.some(x=>x.length>13)) return false;
  if (w.length===1) return w[0].length>=3;
  return w.reduce((n,x)=>n+x.length,0)/w.length >= 3.2;
}

// OCR reads the name band as one line, so it collects crumbs from whatever else
// touches that strip - a stage tag, an HP figure, the edge of a symbol. That is
// how "Munkidori" arrives as "gg Munkidori", and a wildcard search wraps the
// junk along with the name and matches nothing. So search for several readings
// of the same line, narrowest junk removed first, and let the database pick.
function nameVariants(nm) {
  const out=[];
  const add=x=>{ const t=(x||'').trim(); if (t.length>=3 && out.indexOf(t)<0) out.push(t); };
  add(nm);
  const w=(nm||'').split(/\s+/).filter(Boolean);
  // Drop stray one and two character tokens - no card name contains them alone.
  add(w.filter(x=>x.length>=3).join(' '));
  // Failing that, the longest word is nearly always the name itself.
  if (w.length>1) add(w.slice().sort((a,b)=>b.length-a.length)[0]);
  return out.slice(0,3);
}

// A name route is only believable if the card it found is actually called
// something like what was read.
function nameSimilar(read, found) {
  const norm=x=>(x||'').toLowerCase().replace(/[^a-z]/g,'');
  const head=x=>(x||'').toLowerCase().replace(/[^a-z ]/g,'').trim().split(/\s+/)[0]||'';
  const a=norm(read), b=norm(found);
  if (!a || !b) return false;
  if (a===b) return true;
  // First words agreeing covers ordinary misreads - "Air Ballon" for "Air
  // Balloon" - without letting a three-letter read swallow a longer card.
  if (head(read) && head(read)===head(found)) return true;
  // Containment is only safe once there is enough of it to mean something:
  // "Eri" sits inside "Erika's Bellsprout" and they are different cards.
  return a.length>=5 && b.length>=5 && (a.includes(b) || b.includes(a));
}

async function readCardName(flat) {
  if (ocrState!=='ready') return null;
  try {
    const pass=await ocrPass(nameCanvas(flat),'6',OCR_ALPHABET.name);
    const lines=(pass.text||'').split('\n')
      .map(l=>l.replace(/[^A-Za-z' -]/g,' ').replace(/\s+/g,' ').trim())
      .filter(l=>l.length>=3 && !NAME_NOISE.test(l));
    // The name is the substantial line; the rest is furniture.
    lines.sort((a,b)=>b.length-a.length);
    const best=lines.find(nameLooksReal)||'';
    console.log(`[ocr] name band "${(pass.text||'').replace(/\n/g,' | ')}" -> `
      + (best?`"${best}"`:`nothing name-shaped (best line "${lines[0]||''}")`)
      + ` conf=${Math.round(pass.conf)}`);
    return best ? { name:best, conf:pass.conf } : null;
  } catch(e) { return null; }
}

// ---------------------------------------------------------------------------
// Identify by artwork, when text cannot
//
// Text on a card is small and the photograph is soft, so there is a hard floor
// on what OCR can do. The picture is not small. A perceptual hash of the whole
// card compares the capture against each candidate's own thumbnail, which
// settles cases like "seven printings called Munkidori" without reading a
// single character.
// ---------------------------------------------------------------------------

// ===========================================================================
// ART HASH CACHE
//
// Identifying an ambiguous card means comparing its artwork against every
// candidate the database returned, and each comparison needs that candidate's
// thumbnail hashed. Downloading a picture to produce 64 bits is expensive, and
// it was being paid again on every single scan.
//
// A card's artwork never changes, so the hash for a given image URL is a
// permanent fact. It is worth keeping, and it is small - 16 characters - which
// is the whole reason this is worth doing: tens of thousands of them still cost
// under a megabyte.
//
// They live in IndexedDB rather than localStorage deliberately. localStorage is
// already carrying the collection, thumbnails and all, against a limit of a few
// megabytes; spending that budget on a cache would push out the records the
// cache exists to serve. Everything here degrades to a plain in-memory Map if
// IndexedDB is missing or refuses to open, because a scan that works slowly is
// enormously better than one that does not run.
// ===========================================================================

const ART_DB='centeringGauge.cache', ART_STORE='artHashes', ART_DB_VER=1;
const ART_CAP=20000;          // ~1 MB of hashes; far more cards than anyone scans
const ART_OPEN_TIMEOUT=3000;  // never let storage hold up a measurement

// 64 bits as 16 hex characters. Stored packed because the unpacked form is an
// array of 64 numbers, and structured-clone writes that out far larger than the
// thing it represents.
function packHash(bits) {
  let s='';
  for (let i=0;i<bits.length;i+=4)
    s+=((bits[i]<<3)|(bits[i+1]<<2)|(bits[i+2]<<1)|bits[i+3]).toString(16);
  return s;
}

function unpackHash(hex) {
  const bits=[];
  for (let i=0;i<hex.length;i++) {
    const v=parseInt(hex[i],16);
    if (Number.isNaN(v)) return null;
    bits.push((v>>3)&1,(v>>2)&1,(v>>1)&1,v&1);
  }
  return bits;
}

// Also the fallback store when IndexedDB is unavailable, which is why lookups
// consult it first rather than treating it as a mere optimisation.
const artMem=new Map();

let artDbPromise=null;
function artDb() {
  if (artDbPromise) return artDbPromise;
  artDbPromise=new Promise(resolve=>{
    let settled=false;
    const done=v=>{ if (!settled) { settled=true; resolve(v); } };
    // A blocked or hanging open must not strand the caller. Resolving null just
    // means every lookup is a miss and the app behaves as it did before.
    setTimeout(()=>done(null), ART_OPEN_TIMEOUT);
    let req;
    try { req=indexedDB.open(ART_DB, ART_DB_VER); }
    catch(e) { return done(null); }
    req.onupgradeneeded=()=>{
      const db=req.result;
      if (!db.objectStoreNames.contains(ART_STORE)) {
        const os=db.createObjectStore(ART_STORE,{ keyPath:'url' });
        os.createIndex('seen','seen');   // for pruning oldest-first
      }
    };
    // Pruned here, on open, rather than on write: at this moment the store holds
    // everything carried over from previous sessions, which is the only time the
    // cap can actually be exceeded. Checking after a write instead meant checking
    // when the store was at its smallest, so it never fired.
    req.onsuccess=()=>{ done(req.result); artPrune(req.result); };
    req.onerror=()=>done(null);
    req.onblocked=()=>done(null);
  });
  return artDbPromise;
}

function artRead(db,url) {
  return new Promise(resolve=>{
    try {
      const rq=db.transaction(ART_STORE,'readonly').objectStore(ART_STORE).get(url);
      rq.onsuccess=()=>resolve(rq.result?rq.result.hash:null);
      rq.onerror=()=>resolve(null);
    } catch(e) { resolve(null); }
  });
}

// Fire and forget: a failed write costs a re-download later and nothing else, so
// nothing waits on it.
function artWrite(db,url,hash) {
  try {
    db.transaction(ART_STORE,'readwrite').objectStore(ART_STORE)
      .put({ url, hash, seen:Date.now() });
  } catch(e) {}
}

// Drops the least recently used entries once the store grows past the cap. Runs
// at most once per session and never blocks a lookup.
let artPruned=false;
function artPrune(db) {
  if (artPruned) return;
  artPruned=true;
  try {
    const os=db.transaction(ART_STORE,'readwrite').objectStore(ART_STORE);
    const count=os.count();
    count.onsuccess=()=>{
      const over=count.result-ART_CAP;
      if (over<=0) return;
      let removed=0;
      const cur=os.index('seen').openCursor();
      cur.onsuccess=()=>{
        const c=cur.result;
        if (!c || removed>=over) return;
        c.delete(); removed++; c.continue();
      };
    };
  } catch(e) {}
}

// The one entry point: the hash for a thumbnail, from memory, from storage, or
// from the network in that order.
async function artHash(url) {
  if (!url) return null;
  if (artMem.has(url)) return artMem.get(url);

  const db=await artDb();
  if (db) {
    const stored=await artRead(db,url);
    if (stored) {
      const bits=unpackHash(stored);
      if (bits) { artMem.set(url,bits); return bits; }
    }
  }

  const bits=await hashOfUrl(url);
  if (bits) {
    artMem.set(url,bits);
    if (db) artWrite(db,url,packHash(bits));
  }
  return bits;
}

// dHash: compare each pixel with its right-hand neighbour on a 9x8 grid. It
// describes gradients rather than absolute values, so it survives the exposure
// and colour differences between a phone photo and a catalogue scan.
function dHash(canvas) {
  const W=9, H=8;
  const c=document.createElement('canvas');
  c.width=W; c.height=H;
  const cx=c.getContext('2d',{ willReadFrequently:true });
  cx.imageSmoothingQuality='high';
  cx.drawImage(canvas, 0,0, W,H);
  const d=cx.getImageData(0,0,W,H).data;
  const g=[];
  for (let i=0;i<d.length;i+=4) g.push(d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114);
  const bits=[];
  for (let y=0;y<H;y++) for (let x=0;x<W-1;x++) bits.push(g[y*W+x] > g[y*W+x+1] ? 1:0);
  return bits;
}

const hashDistance = (a,b) => {
  if (!a||!b||a.length!==b.length) return 64;
  let n=0;
  for (let i=0;i<a.length;i++) if (a[i]!==b[i]) n++;
  return n;
};

// Thumbnails come from another origin, so the canvas taints unless the server
// sends CORS headers. If it does not, this returns null and identification
// carries on without it rather than failing.
function hashOfUrl(url) {
  return new Promise(res=>{
    const img=new Image();
    img.crossOrigin='anonymous';
    const done=v=>{ img.onload=img.onerror=null; res(v); };
    img.onload=()=>{
      try {
        const c=document.createElement('canvas');
        c.width=img.naturalWidth; c.height=img.naturalHeight;
        c.getContext('2d').drawImage(img,0,0);
        done(dHash(c));
      } catch(e) { done(null); }
    };
    img.onerror=()=>done(null);
    setTimeout(()=>done(null), 6000);
    img.src=url;
  });
}

// Only worth calling when text has already narrowed things to a handful.
async function pickByArt(hits, flat) {
  const withThumbs=hits.filter(h=>h.thumb).slice(0,10);
  if (withThumbs.length<2) return null;
  const mine=dHash(flat.canvas);

  // Cached hashes come back without touching the network at all. The ones that
  // do not are fetched together rather than one after another: these are ten
  // independent downloads with a six second timeout each, so waiting for them in
  // turn made the worst case a minute of nothing happening.
  const t0=performance.now();
  const cached=withThumbs.filter(h=>artMem.has(h.thumb)).length;
  const hashes=await Promise.all(withThumbs.map(h=>artHash(h.thumb)));

  const scored=[];
  for (let i=0;i<withThumbs.length;i++)
    if (hashes[i]) scored.push({ hit:withThumbs[i], d:hashDistance(mine,hashes[i]) });

  if (scored.length<2) return null;
  scored.sort((a,b)=>a.d-b.d);
  const [best,next]=scored;
  console.log(`[art] ${scored.map(s=>`${s.hit.set} ${s.hit.number}:${s.d}`).join(' ')}`
    + ` (${cached}/${withThumbs.length} in memory, ${Math.round(performance.now()-t0)}ms)`);
  // Close enough to be a real match, and clearly ahead of the runner-up. Two
  // printings that share artwork will tie here, and a tie must not be resolved
  // by guessing - it goes to review instead.
  if (best.d<=14 && next.d-best.d>=5) return best;
  return null;
}

async function tryQuery(q) {
  try { return (await apiGet(q,24)).map(mapCard); } catch(e) { return []; }
}

// Routes to the card, strongest first. Each one is tried only if the evidence it
// needs actually survived OCR, and a route only settles the matter when it comes
// back with exactly one card.
async function autoIdentify(flat, note) {
  // The name band comes off the top of the card, so it survives the commonest
  // failure - an outline that runs past the bottom edge. Read it first and
  // always, rather than treating it as a fallback.
  const nameRead=await readCardName(flat);
  const nm=nameRead?nameRead.name:null;

  const inked=stripHasInk(flat);
  const read = inked ? await readCardFacts(flat)
                     : { ok:false, conf:0, text:'', why:'bottom strip is blank' };
  if (!read.ok && !nm)
    return { confident:false, read, name:null,
             why:(note?note+' · ':'')+(read.why||'nothing legible on the card') };

  const f=read.facts||{ number:null, total:null, setCode:null, trust:'none' };
  const cands=(f.candidates||[]).filter(c=>c.trust!=='weak' || read.conf>=OCR_MIN_CONF).slice(0,4);
  const n=f.number!=null?String(f.number):null;

  // Every combination worth asking about, strongest evidence first. A candidate
  // that came from a guessed separator is fine to try - the database rejects the
  // wrong splits by returning nothing.
  const nms=nm?nameVariants(nm):[];
  // The digits after the slash are the set's printed total, and they identify
  // the set on their own - 167 is Twilight Masquerade whatever the number before
  // the slash turned out to be. It is also the half of the pair most likely to
  // survive: three digits read as a group, no leading zero to lose. So carry it
  // as a filter on every route, not only the number-only ones.
  const totals=[...new Set(cands.map(c=>c.total).filter(Boolean))];

  const routes=[];
  for (const c of cands) {
    const num=String(c.number);
    if (f.setCode) routes.push({ q:`set.ptcgoCode:${f.setCode} number:${num}`, via:`${f.setCode} ${num}`, min:45 });
    for (const v of nms) routes.push({ q:`name:"*${v}*" number:${num}`, via:`${v} ${num}`, min:40, name:v, total:c.total });
  }
  for (const v of nms)
    if (f.setCode) routes.push({ q:`name:"*${v}*" set.ptcgoCode:${f.setCode}`, via:`${v} in ${f.setCode}`, min:40, name:v });
  // Name plus set total, before name alone: it is the same query but with the
  // set pinned down, which is usually the difference between one card and seven.
  for (const v of nms)
    for (const t of totals)
      routes.push({ q:`name:"*${v}*"`, via:`${v} in a set of ${t}`, min:45, name:v, total:t });
  for (const v of nms)
    routes.push({ q:`name:"*${v}*"`, via:v, min:55, name:v });
  for (const c of cands)
    if (c.total) routes.push({ q:`number:${c.number}`, total:c.total, via:`${c.number}/${c.total}`, min:50 });

  if (!routes.length)
    return { confident:false, read, name:nm,
             why:(note?note+' · ':'')
                 +(f.number!=null?`only read a stray "${f.number}"`:'nothing legible on the card') };

  let widest=[];
  const tried=new Set();
  for (const r of routes) {
    // Several routes reduce to the same query once a total is only a filter.
    const key=r.q+'|'+(r.total||'');
    if (tried.has(key)) continue;
    tried.add(key);

    let hits=await tryQuery(r.q);
    // A printed total is a free filter: 95 exists in dozens of sets, but 95 in a
    // set of 167 is nearly unique.
    if (r.total) {
      const narrowed=hits.filter(h=>h.printedTotal===r.total);
      if (!narrowed.length) continue;      // the total says this is the wrong set
      hits=narrowed;
    }
    if (!hits.length) continue;
    // The database matched something, but a loose wildcard will match almost
    // anything. If this route leaned on the name, the answer has to look like it.
    if (r.name && !hits.some(h=>nameSimilar(r.name,h.name))) continue;
    if (hits.length===1) {
      const conf=Math.max(read.conf, (nameRead && r.name)?nameRead.conf:0);
      if (conf>=r.min) return { confident:true, hit:hits[0], read, name:r.name||nm, via:r.via };
      return { confident:false, read, name:nm, hits,
               why:`looks like ${hits[0].name}, only ${Math.round(conf)}% sure` };
    }
    if (!widest.length || hits.length<widest.length) widest=hits;
  }

  // Text has done all it can. If it left a short list, the artwork can often
  // finish the job - and this is the one signal that does not depend on
  // resolving small print.
  if (widest.length>1 && widest.length<=10) {
    const byArt=await pickByArt(widest, flat);
    if (byArt)
      return { confident:true, hit:byArt.hit, read, name:nm,
               via:`artwork match (${byArt.d}/64 different)` };
  }

  return { confident:false, read, name:nm, hits:widest,
           why: widest.length ? `${widest.length} cards match ${nm||n}, artwork could not separate them`
                              : `nothing matched ${nm||n||'that'}` };
}

// ---- camera choice ----

const CAM_KEY='centeringGauge.camera.v1';
const camPref = () => { try { return localStorage.getItem(CAM_KEY)||null; } catch(e) { return null; } };
const setCamPref = id => { try { id?localStorage.setItem(CAM_KEY,id):localStorage.removeItem(CAM_KEY); } catch(e) {} };

async function listCameras() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
    const all=await navigator.mediaDevices.enumerateDevices();
    state.scan.cams=all.filter(d=>d.kind==='videoinput')
      .map((d,i)=>({ id:d.deviceId, label:d.label||`Camera ${i+1}` }));
    console.log('[cam] devices: '+(state.scan.cams.map(c=>c.label).join(' | ')||'none listed'));
    return state.scan.cams;
  } catch(e) { return []; }
}

// Front cameras are never useful here. Phone labels are inconsistent, so keep
// whatever the browser gives and only drop the obvious ones.
function rearCameras() {
  const cams=state.scan.cams||[];
  const rear=cams.filter(c=>!/front|face|user|selfie/i.test(c.label));
  return rear.length?rear:cams;
}

async function useCamera(id) {
  setCamPref(id);
  stopScan();
  state.scan.result=null;
  await startScan();
}

// ---- hands-free capture ----

// Fires once framing has been steadily good, then waits for the card to leave
// the frame before arming again, so a card left on the mat is not scanned twice.
function maybeAutoCapture() {
  const sc=state.scan;
  if (sc.mode!=='quick' || !sc.autoCapture || sc.busy || sc.result) return;

  const q=sc.quality, vd=scanVerdict(q);

  if (!sc.armed) {
    if (!q || !q.found) {
      sc.clearRun=(sc.clearRun||0)+1;
      if (sc.clearRun>=AUTO_CLEAR_FRAMES) { sc.armed=true; sc.clearRun=0; sc.goodRun=0; }
    } else sc.clearRun=0;
    return;
  }

  // Firing on amber was meant to help under side lighting. It did the opposite:
  // it captured frames too poor to read, and an unreadable capture costs more
  // than a slow one - it lands in the review queue to be typed by hand. Green
  // only, but fewer frames of it, so speed comes from deciding sooner rather
  // than from accepting worse.
  if (vd.level==='good') {
    sc.goodRun=(sc.goodRun||0)+1;
    if (sc.goodRun>=AUTO_GOOD_FRAMES) { sc.goodRun=0; sc.armed=false; captureScan(); }
  } else sc.goodRun=0;
}

// The same geometry questions the grading path asks, minus everything
// expensive. If the outline is not card-shaped, or a side was fitted through
// scatter, nothing cropped from it can be trusted - least of all a thin strip
// taken from its very bottom edge.
function quickGeometryNote(det, quad) {
  // Aspect is only meaningful on a squarely-shot card. Under perspective a real
  // card measures well off 0.716, which is why refreshAspect bails above this
  // same tilt threshold - and why gating on aspect alone rejected cards whose
  // strips were perfectly readable.
  if (tiltCheck(quad) < 1.06) {
    const a=aspectCheck(quad);
    if (a && a.off>0.05)
      return `outline is ${a.seen.toFixed(3)} where a card is ${a.want.toFixed(3)} — edges may be off the card`;
  }
  const dead=EDGE_KEYS.filter(k=>fitUnusable(det.fits[k]));
  if (dead.length) return `no usable edge on ${dead.join(', ')} — the outline is a guess`;
  return null;
}

// A strip with almost no contrast holds no text. Cheap to check, and it stops a
// pointless three-second OCR pass on an image of the mat.
function stripHasInk(flat) {
  const c=bandCanvas(flat, 81.5, 87.5, 0.02, 0.52, 110);
  const cx=c.getContext('2d',{ willReadFrequently:true });
  const d=cx.getImageData(0,0,c.width,c.height).data;
  let n=0, sum=0, sq=0;
  for (let i=0;i<d.length;i+=16) { const v=d[i]; sum+=v; sq+=v*v; n++; }
  if (!n) return false;
  const mean=sum/n;
  const sd=Math.sqrt(Math.max(0, sq/n - mean*mean));
  console.log(`[ocr] strip contrast sd=${sd.toFixed(1)}`);
  return sd>18;
}

async function quickAuto(flat) {
  const sc=state.scan;
  if (!sc.result) return;
  sc.result.autoBusy=true;
  sc.result.autoMsg='Reading the number\u2026';
  renderScan();

  // Always try. A quad that overshoots the bottom edge ruins the number strip
  // but leaves the name band at the top untouched, so there is still a route to
  // the card - and refusing to look was throwing that away.
  const res=await autoIdentify(flat, sc.result.fault);
  if (!sc.result) return;                       // moved on while we were working

  if (res.confident) {
    const w=ownedAdd(res.hit, sc.result.thumb);
    if (w.ok) {
      sc.lastAdded=`${res.hit.name} — ${res.hit.set} ${res.hit.number}`
        + (res.via?` (read ${res.via})`:'');
      sc.lastReview=null;
      sc.autoStats.added++;
      quickNext();
      return;
    }
    res.why=w.error;
  }

  const f=(res.read&&res.read.facts)||{};
  const r=reviewAdd({
    thumb:sc.result.thumb, strip:sc.result.reviewStrip,
    ocr:res.read?res.read.text:'', conf:res.read?Math.round(res.read.conf||0):0,
    setCode:f.setCode||null, number:f.number!=null?f.number:null, total:f.total||null,
    trust:f.trust||'none', name:res.name||null,
    why:res.why||'uncertain'
  });
  if (!r.ok) { sc.result.autoBusy=false; sc.result.autoMsg=r.error; renderScan(); return; }

  sc.autoStats.review++;
  sc.lastAdded=null;
  sc.lastReview=res.why||'uncertain';
  quickNext();
}

// ---- review queue view ----

function renderReview() {
  const host=document.getElementById('review');
  if (!host) return;
  const st=loadReview();
  const open=state.review&&state.review.open;

  if (!st.items.length) {
    host.innerHTML=`<div class="ownedWrap"><p class="ownedEmpty">Nothing waiting. Cards land here when auto scan captures one but cannot be sure what it is.</p></div>`;
    return;
  }

  if (open) {
    const it=st.items.find(i=>i.id===open);
    if (!it) { state.review.open=null; renderReview(); return; }
    const rv=state.review;
    const list = !rv.hits ? '' : !rv.hits.length ? '' :
      `<div class="qaList">${rv.hits.map((h,i)=>`
        <button class="qaHit" data-i="${i}">
          ${h.thumb?`<img src="${h.thumb}" alt="">`:'<span class="qaNoImg"></span>'}
          <span class="qaMeta"><b>${qaEsc(h.name)}</b>
            <em>${qaEsc(h.set)} &middot; ${qaEsc(h.number)}${h.rarity?' &middot; '+qaEsc(h.rarity):''}</em>
          </span>
        </button>`).join('')}</div>`;

    host.innerHTML=`<div class="ownedWrap">
      <button class="btn" id="rvBack">&larr; Back to queue (${st.items.length})</button>
      <div class="scanCard"><img src="${it.thumb}" alt=""></div>
      ${it.strip?`<div class="strip2"><div class="win"><img src="${it.strip}" alt="bottom of card"></div>
        <span>${qaEsc(it.why||'')}${it.name?` &middot; name “${qaEsc(it.name)}”`:''}${it.setCode?` &middot; set ${qaEsc(it.setCode)}`:''}${it.ocr?` &middot; read “${qaEsc(it.ocr.replace(/\n/g,' ').slice(0,50))}” (${it.conf}%)`:''}</span></div>`:''}
      <div class="qaSearch">
        <input id="rvQ" type="search" inputmode="search" autocomplete="off"
               placeholder="Number or name" value="${qaEsc(rv.query!=null?rv.query:reviewGuess(it))}">
        <button class="btn" data-primary id="rvGo">${rv.searching?'Searching…':'Find'}</button>
      </div>
      ${rv.msg?`<p class="scanWarn">${qaEsc(rv.msg)}</p>`:''}
      ${list}
      <button class="btn" id="rvDrop">Discard this card</button>
    </div>`;

    document.getElementById('rvBack').onclick=()=>{ state.review={open:null}; renderReview(); };
    const q=document.getElementById('rvQ');
    if (q) q.onkeydown=e=>{ if (e.key==='Enter') { e.preventDefault(); reviewSearch(); } };
    document.getElementById('rvGo').onclick=reviewSearch;
    document.getElementById('rvDrop').onclick=()=>{ reviewRemove(it.id); state.review={open:null}; renderReview(); setView('review'); };
    host.querySelectorAll('.qaHit').forEach(b=>b.onclick=()=>{
      const hit=rv.hits[+b.dataset.i];
      const w=ownedAdd(hit, it.thumb);
      if (!w.ok) { state.review.msg=w.error; renderReview(); return; }
      reviewRemove(it.id);
      state.review={open:null};
      renderReview();
      setView('review');
    });
    return;
  }

  host.innerHTML=`<div class="ownedWrap">
    <div class="ownedHead"><span><b>${st.items.length}</b> waiting to be named</span></div>
    <div class="ownedList">${st.items.map(it=>`
      <button class="ownedRow rvRow" data-open="${it.id}">
        ${it.thumb?`<img src="${it.thumb}" alt="">`:'<span class="qaNoImg"></span>'}
        <span class="ownedMeta">
          <b>${qaEsc(it.name||(it.number!=null&&it.trust==='strong'?String(it.number):'unread'))}</b>
          <em>${qaEsc(it.why||'')}</em>
        </span>
      </button>`).join('')}</div>
  </div>`;
  host.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{
    state.review={ open:b.dataset.open, hits:null, query:null, msg:null, searching:false };
    renderReview();
  });
}

// Best starting point for the box: whatever was actually parsed off the card.
function reviewGuess(it) {
  // Name first: it is what actually got read on a soft photo, and a stray digit
  // from a 12%-confidence pass is worse than nothing in the box.
  if (it.name) return it.name;
  if (it.number!=null && it.total) return `${it.number}/${it.total}`;
  if (it.number!=null && it.trust==='strong') return String(it.number);
  const m=(it.ocr||'').match(/\d{1,3}\s*\/\s*\d{1,3}/);
  return m ? m[0].replace(/\s/g,'') : '';
}

async function reviewSearch() {
  const rv=state.review;
  const box=document.getElementById('rvQ');
  const text=(box?box.value:'').trim();
  if (!text) return;
  rv.query=text; rv.searching=true; rv.msg=null; rv.hits=null;
  renderReview();
  try {
    rv.hits=await searchCards(text);
    if (!rv.hits.length) rv.msg='Nothing matched that.';
  } catch(e) { rv.hits=[]; rv.msg=e.message||'Lookup failed.'; }
  rv.searching=false;
  renderReview();
}

// ===========================================================================
// DECK BUILDER  (Standard)
// ===========================================================================
//
// What this can and cannot do, stated plainly because the output will be read as
// more than it is: it guarantees a LEGAL deck - sixty cards, at most four of any
// name, at least one Basic, complete evolution lines, energy that matches what
// the attackers actually cost. It does not know what is GOOD. No free API
// publishes tournament results, so nothing here is metagame-aware.
// ===========================================================================

// 2026-27 season. Rotation happens every April, so this needs a yearly edit -
// though legalities.standard from the API is preferred wherever it is present,
// and that tracks rotation on its own.
const STANDARD_MARKS = ['H','I','J'];

const DECK_SIZE = 60;
const MAX_COPIES = 4;
const TARGET_POKEMON = 14;
const TARGET_ENERGY = 11;

// Candidate staples, not gospel. Every name here is checked against the API
// before it is suggested, so anything that has rotated out quietly drops off the
// list instead of producing an illegal decklist. Edit freely.
const STAPLE_NAMES = [
  "Professor's Research", "Boss's Orders", "Iono", "Arven",
  "Ultra Ball", "Nest Ball", "Buddy-Buddy Poffin", "Rare Candy",
  "Switch", "Earthen Vessel", "Night Stretcher", "Super Rod",
  "Counter Catcher", "Pokégear 3.0"
];

// The API's own verdict first: it tracks bans as well as rotation, which a
// regulation mark cannot. The mark is the fallback for records saved before
// legalities were captured.
function standardLegal(c) {
  const L=c.legalities;
  if (L && L.standard) return L.standard==='Legal';
  if (c.regMark) return STANDARD_MARKS.indexOf(c.regMark)>=0;
  return false;
}

// A card with an old mark is still legal if some printing of the same name is
// legal now - an unmarked Rare Candy is playable because a current one exists.
// Checking that costs an API call per name, so results are cached for the run.
const nameLegalCache = new Map();
async function nameHasLegalPrint(name) {
  if (nameLegalCache.has(name)) return nameLegalCache.get(name);
  let out=null;
  try {
    const raw=await apiGet(`name:"${name.replace(/["\\]/g,'')}"`, 60);
    const legal=raw.map(mapCard).filter(standardLegal);
    if (legal.length) {
      legal.sort((a,b)=>((a.price&&a.price.value)||1e9)-((b.price&&b.price.value)||1e9));
      out=legal[0];
    }
  } catch(e) { out=null; }
  nameLegalCache.set(name,out);
  return out;
}

// Every owned copy, from both stores, as a flat list of {name, card, qty}.
function deckPool() {
  const by=new Map();
  const add=(c,qty)=>{
    if (!c||!c.name) return;
    const k=c.name;
    const cur=by.get(k);
    if (cur) { cur.qty+=qty; if (!cur.card.supertype && c.supertype) cur.card=c; }
    else by.set(k,{ name:k, card:c, qty });
  };
  for (const r of loadOwned().cards) add(r, r.qty||1);
  for (const r of loadStore().cards) if (r.card && r.card.name) add(r.card, 1);
  return [...by.values()];
}

const isPokemon = c => (c.supertype||'')==='Pokémon' || (c.supertype||'')==='Pokemon';
const isTrainer = c => (c.supertype||'')==='Trainer';
const isEnergy  = c => (c.supertype||'')==='Energy';
const isBasicMon = c => isPokemon(c) && (c.subtypes||[]).indexOf('Basic')>=0;
const stageOf = c => (c.subtypes||[]).indexOf('Stage 2')>=0 ? 2
                   : (c.subtypes||[]).indexOf('Stage 1')>=0 ? 1 : 0;

// Energy an attacker actually needs, ignoring Colorless - Colorless is paid by
// anything, so it never determines which basic Energy goes in the deck.
function energyNeeds(c) {
  const out=new Set();
  for (const cost of (c.attackCost||[]))
    for (const e of cost) if (e && e!=='Colorless') out.add(e);
  if (!out.size) for (const t of (c.types||[])) if (t!=='Colorless') out.add(t);
  return [...out];
}

// Prefer something that can win a game and does not need a whole evolution line
// dragged in behind it. Not a metagame judgement - just fewer moving parts.
function scoreAttacker(e) {
  const c=e.card;
  if (!isPokemon(c) || !(c.attackCost||[]).length) return -1;
  let s=(c.hp||0);
  s -= stageOf(c)*40;                        // each stage is another card to find
  if ((c.subtypes||[]).some(t=>/ex|EX|V|VMAX|VSTAR/.test(t))) s+=60;
  s += Math.min(e.qty,4)*15;                 // copies you actually hold
  return s;
}

async function buildDeck(onProgress) {
  const pool=deckPool();
  if (!pool.length) return { error:'Nothing in the collection yet. Quick add some cards first.' };

  // Split into what is legal now and what is not, honouring the reprint rule.
  const legal=[], rotated=[];
  for (const e of pool) {
    if (standardLegal(e.card)) { legal.push(e); continue; }
    if (onProgress) onProgress(`checking ${e.name}`);
    const alt=await nameHasLegalPrint(e.name);
    if (alt) { e.card={ ...e.card, ...alt }; e.viaReprint=true; legal.push(e); }
    else rotated.push(e);
  }

  const mons=legal.filter(e=>isPokemon(e.card)).sort((a,b)=>scoreAttacker(b)-scoreAttacker(a));
  if (!mons.length)
    return { error:'No Standard-legal Pokémon in the collection. A deck needs at least one Basic Pokémon.',
             rotated };

  const attacker=mons[0];
  const needs=energyNeeds(attacker.card);
  const deck=[];   // { name, count, card, owned, need }
  const put=(name,count,card,ownedQty)=>{
    const owned=Math.min(count, ownedQty||0);
    deck.push({ name, count, card, owned, need:count-owned });
  };

  // --- Pokémon ---
  const stage=stageOf(attacker.card);
  put(attacker.name, Math.min(MAX_COPIES, stage===0?4:3), attacker.card, attacker.qty);

  // Pull in whatever the attacker evolves from, walking the chain back.
  let from=attacker.card.evolvesFrom;
  let guard=0;
  while (from && guard++<3) {
    const owned=legal.find(e=>e.name===from);
    const card=owned ? owned.card : await nameHasLegalPrint(from);
    if (!card) { deck.push({ name:from, count:4, card:null, owned:0, need:4, missing:true }); break; }
    put(from, 4, card, owned?owned.qty:0);
    from=card.evolvesFrom;
  }

  // Top up with other Basics, cheapest commitment first.
  let monCount=deck.reduce((n,d)=>n+d.count,0);
  for (const e of legal.filter(e=>isBasicMon(e.card) && !deck.some(d=>d.name===e.name))) {
    if (monCount>=TARGET_POKEMON) break;
    const n=Math.min(MAX_COPIES, e.qty, TARGET_POKEMON-monCount);
    if (n<=0) continue;
    put(e.name, n, e.card, e.qty);
    monCount+=n;
  }

  // --- Energy ---
  const energyTypes = needs.length?needs:['Colorless'];
  const perType=Math.max(4, Math.floor(TARGET_ENERGY/energyTypes.length));
  const energy=[];
  for (const t of energyTypes) {
    const owned=legal.find(e=>isEnergy(e.card) && e.name.indexOf(t)>=0);
    // Basic Energy has no name limit, and is the cheapest thing in the game.
    energy.push({ name:`Basic ${t} Energy`, count:perType, card:owned?owned.card:null,
                  owned:owned?Math.min(perType,owned.qty):0,
                  need:perType-(owned?Math.min(perType,owned.qty):0), basicEnergy:true });
  }
  const energyCount=energy.reduce((n,d)=>n+d.count,0);

  // --- Trainers fill whatever is left ---
  let room=DECK_SIZE-monCount-energyCount;
  const trainers=[];
  for (const e of legal.filter(e=>isTrainer(e.card))) {
    if (room<=0) break;
    const n=Math.min(MAX_COPIES, e.qty, room);
    if (n<=0) continue;
    trainers.push({ name:e.name, count:n, card:e.card, owned:n, need:0 });
    room-=n;
  }

  // Then the shopping list, only for names the API confirms are legal today.
  const shortfall=[];
  for (const nm of STAPLE_NAMES) {
    if (room<=0) break;
    if (trainers.some(t=>t.name===nm)) continue;
    if (onProgress) onProgress(`checking ${nm}`);
    const card=await nameHasLegalPrint(nm);
    if (!card) continue;
    const n=Math.min(MAX_COPIES, room);
    shortfall.push({ name:nm, count:n, card, owned:0, need:n });
    room-=n;
  }

  const all=[...deck, ...trainers, ...shortfall, ...energy];

  // If staples ran out before 60, say so rather than padding with filler.
  const total=all.reduce((n,d)=>n+d.count,0);
  const cost=all.reduce((s,d)=>s+d.need*((d.card&&d.card.price&&d.card.price.value)||0),0);
  const cur=(all.find(d=>d.card&&d.card.price)||{card:{}}).card.price;

  return {
    attacker:attacker.name, energyTypes, rows:all, total,
    short: DECK_SIZE-total,
    buyCost:cost, buyCurrency:cur?cur.currency:'',
    rotated,
    legalityNotes: checkLegal(all)
  };
}

// The rules a decklist has to satisfy, checked rather than assumed.
function checkLegal(rows) {
  const out=[];
  const total=rows.reduce((n,d)=>n+d.count,0);
  if (total!==DECK_SIZE) out.push(`${total} cards, not ${DECK_SIZE}`);
  for (const d of rows)
    if (!d.basicEnergy && d.count>MAX_COPIES) out.push(`${d.count} copies of ${d.name} — the limit is ${MAX_COPIES}`);
  if (!rows.some(d=>d.card && isBasicMon(d.card))) out.push('no Basic Pokémon — the deck cannot start');
  return out;
}

// Standard decklist text, the format PTCGL and tournament sheets expect.
function deckAsText(res) {
  const grp=k=>res.rows.filter(k);
  const line=d=>`${d.count} ${d.name}${d.card&&d.card.setId?' '+d.card.setId.toUpperCase()+' '+String(d.card.number).split('/')[0]:''}`;
  const mon=grp(d=>d.card&&isPokemon(d.card)||d.missing);
  const tr=grp(d=>d.card&&isTrainer(d.card));
  const en=grp(d=>d.basicEnergy||(d.card&&isEnergy(d.card)));
  const n=a=>a.reduce((s,d)=>s+d.count,0);
  return `Pokémon: ${n(mon)}\n${mon.map(line).join('\n')}\n\n`
       + `Trainer: ${n(tr)}\n${tr.map(line).join('\n')}\n\n`
       + `Energy: ${n(en)}\n${en.map(line).join('\n')}\n`;
}

function renderDeck() {
  const host=document.getElementById('deck');
  if (!host) return;
  const s=state.deck||{};

  if (s.busy) {
    host.innerHTML=`<div class="deckWrap"><p class="ownedEmpty">Building… ${qaEsc(s.step||'')}</p></div>`;
    return;
  }
  if (!s.result) {
    host.innerHTML=`<div class="deckWrap">
      <p class="ownedEmpty">Builds a legal 60-card Standard deck from what you own, and names what you would need to buy to finish it.
      Legality is checked against the card database, not guessed — but nothing here knows what is <b>good</b>, only what is <b>allowed</b>.</p>
      <button class="btn" data-primary id="deckGo">Build a deck</button>
    </div>`;
    const g=document.getElementById('deckGo');
    if (g) g.onclick=runDeckBuild;
    return;
  }

  const r=s.result;
  if (r.error) {
    host.innerHTML=`<div class="deckWrap"><p class="scanWarn">${qaEsc(r.error)}</p>
      <button class="btn" id="deckGo">Try again</button></div>`;
    const g=document.getElementById('deckGo'); if (g) g.onclick=runDeckBuild;
    return;
  }

  const row=d=>`<div class="deckRow" data-need="${d.need>0?'1':'0'}">
      <b>${d.count}</b>
      <span class="deckName">${qaEsc(d.name)}
        ${d.card&&d.card.set?`<em>${qaEsc(d.card.set)}</em>`:''}</span>
      <span class="deckTag">${d.need>0
        ? `buy ${d.need}${d.card&&d.card.price?` · ${(d.card.price.value*d.need).toFixed(2)} ${qaEsc(d.card.price.currency)}`:''}`
        : 'owned'}</span>
    </div>`;

  const section=(title,rows)=>rows.length?`<h3 class="deckH">${title} (${rows.reduce((n,d)=>n+d.count,0)})</h3>${rows.map(row).join('')}`:'';

  host.innerHTML=`<div class="deckWrap">
    <div class="ownedHead">
      <span>Built around <b>${qaEsc(r.attacker)}</b>${r.energyTypes.length?` · ${qaEsc(r.energyTypes.join(', '))}`:''}</span>
      <button class="btn" id="deckGo">Rebuild</button>
    </div>
    ${r.legalityNotes.length?`<p class="scanWarn">${r.legalityNotes.map(qaEsc).join(' · ')}</p>`:
      `<p class="qaOk">Legal: ${r.total} cards, no name over ${MAX_COPIES}, evolution lines complete</p>`}
    ${r.short>0?`<p class="scanWarn">${r.short} slots unfilled — the staples list ran out. Add more names to STAPLE_NAMES, or own more Trainers.</p>`:''}
    ${r.buyCost>0?`<p class="deckCost">To finish it: about <b>${r.buyCost.toFixed(2)} ${qaEsc(r.buyCurrency)}</b></p>`:''}
    ${section('Pokémon', r.rows.filter(d=>(d.card&&isPokemon(d.card))||d.missing))}
    ${section('Trainer', r.rows.filter(d=>d.card&&isTrainer(d.card)))}
    ${section('Energy',  r.rows.filter(d=>d.basicEnergy||(d.card&&isEnergy(d.card))))}
    ${r.rotated.length?`<h3 class="deckH">Not Standard legal (${r.rotated.length})</h3>
      <p class="ownedEmpty">${r.rotated.slice(0,20).map(e=>qaEsc(e.name)).join(', ')}${r.rotated.length>20?'…':''}</p>`:''}
    <button class="btn" id="deckCopy">Copy decklist</button>
  </div>`;

  const g=document.getElementById('deckGo'); if (g) g.onclick=runDeckBuild;
  const cp=document.getElementById('deckCopy');
  if (cp) cp.onclick=()=>{
    const txt=deckAsText(r);
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>{ cp.textContent='Copied'; setTimeout(()=>cp.textContent='Copy decklist',1500); });
    else { const t=document.createElement('textarea'); t.value=txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  };
}

async function runDeckBuild() {
  state.deck={ busy:true, step:'', result:null };
  renderDeck();
  try {
    const res=await buildDeck(step=>{ state.deck.step=step; renderDeck(); });
    state.deck={ busy:false, result:res };
  } catch(e) {
    state.deck={ busy:false, result:{ error:e.message||'Deck build failed.' } };
  }
  renderDeck();
}

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
    let done=0; const problems=[];
    for (const c of withId) {
      b.textContent=`${done+1} of ${withId.length}…`;
      try { await refreshPrice(c.id); }
      catch(e) { problems.push((c.card.name||c.id)+': '+e.message); }
      done++;
      await new Promise(r=>setTimeout(r, apiKey()?120:2100));   // stay inside the free limit
    }
    renderCollection();
    // Say what actually went wrong - a bare count is no help at all.
    if (problems.length) alert('Could not refresh:\n\n'+problems.join('\n'));
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
          <input id="lookInput" placeholder="card name or 094/084"
                 value="${(r.card.name?(r.card.number||r.card.name):'').replace(/"/g,'&quot;')}">
          <button id="lookGo">Find</button>
        </div>
        <p class="lookNote" id="lookNote"></p>
        <div id="lookHits"></div>
        ${r.numStrip?`<div class="strip2">
          <div class="win"><img src="${r.numStrip}" alt="bottom of card" id="stripImg"></div>
          <span>Bottom of the card at full resolution. Scroll sideways &mdash; modern cards carry the
          number at the left, some older ones at the right. Tap to enlarge.</span>
        </div>`:''}
        ${r.market ? (r.market.none
          ? `<div class="priceBox" data-none="1">
               <b>No price published</b>
               <span>The database has this card but no Cardmarket or TCGplayer figure yet &mdash;
               usual for a set this new. Checked ${r.market.at.slice(0,10)}; try again in a few weeks.</span>
             </div>`
          : `<div class="priceBox">
               <b>${money(r.market)}</b>
               <span>${r.market.source}${r.market.low?', low '+money({...r.market,value:r.market.low}):''}
                 &middot; read ${r.market.at.slice(0,10)}<br>
                 <em>Raw, ungraded.</em> A graded copy sells for a different figure the API does not carry.</span>
             </div>`) : ''}
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
           L/R ${f(leftShare(c),1)}/${f(100-leftShare(c),1)} &middot; T/B ${f(topShare(c),1)}/${f(100-topShare(c),1)}<br>
           worst <b>${f(c.worst,1)}</b><br>
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
      setNote(`${hits.length} match${hits.length===1?'':'es'} — pick one to fill the fields and read its price.`
        + (state.lastQuery?` <em style="color:#4a463e">${state.lastQuery}</em>`:''));
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

  const si=document.getElementById('stripImg');
  if (si) si.onclick=()=>{
    // Native resolution, scrollable sideways - downscaling it to fit would
    // defeat the point.
    const box=document.createElement('div');
    box.className='lightbox';
    box.innerHTML=`<div><img src="${r.numStrip}" alt=""></div><button>Close</button>`;
    box.querySelector('button').onclick=()=>box.remove();
    box.onclick=ev=>{ if (ev.target===box) box.remove(); };
    document.body.appendChild(box);
  };

  if (lg) lg.onclick=runLookup;
  if (li) li.onkeydown=ev=>{ if (ev.key==='Enter') { ev.preventDefault(); runLookup(); } };

  // Opening a row from the name cell should land the caret in it. An unnamed
  // record goes straight to the lookup box instead: read the strip, type, Enter.
  if (state.focusField) {
    const target=fields.find(f=>f.dataset.f===state.focusField);
    if (target) { target.focus(); target.select(); }
    state.focusField=null;
  } else if (!r.card.name && li) {
    li.focus(); li.select();
  }
}

function setView(v) {
  state.view=v;
  document.getElementById('rail').style.display = v==='gauge'?'':'none';
  document.getElementById('work').style.display = v==='gauge'?'':'none';
  document.getElementById('collection').style.display = v==='collection'?'':'none';
  document.getElementById('batch').style.display = v==='batch'?'':'none';
  document.getElementById('scan').style.display = v==='scan'?'':'none';
  const ow=document.getElementById('owned');
  if (ow) ow.style.display = v==='owned'?'':'none';
  const qb=document.getElementById('quickBtn');
  if (qb) qb.dataset.on = (v==='scan'&&state.scan.mode==='quick')?'1':'0';
  const ob=document.getElementById('ownedBtn');
  if (ob) { ob.innerHTML=`Tracked (${ownedCount()})`; ob.dataset.on = v==='owned'?'1':'0'; }
  const dk=document.getElementById('deck');
  if (dk) dk.style.display = v==='deck'?'':'none';
  const db=document.getElementById('deckBtn');
  if (db) db.dataset.on = v==='deck'?'1':'0';
  const rvw=document.getElementById('review');
  if (rvw) rvw.style.display = v==='review'?'':'none';
  const rb=document.getElementById('reviewBtn');
  if (rb) { rb.innerHTML=`Review (${reviewCount()})`; rb.dataset.on = v==='review'?'1':'0'; }
  const bb=document.getElementById('batchBtn');
  if (bb) bb.dataset.on = v==='batch'?'1':'0';
  const sb=document.getElementById('scanBtn');
  if (sb) sb.dataset.on = v==='scan'?'1':'0';
  if (v!=='scan') stopScan();
  const b=document.getElementById('collBtn');
  if (b) {
    const n=loadStore().cards.length;
    b.innerHTML = v==='gauge' ? `<span class="wide">Collection</span><span class="narrow">Cards</span> (${n})` : 'Back<span class="wide"> to gauge</span>';
    b.dataset.on = v==='collection'?'1':'0';
  }
  if (v==='collection') renderCollection();
  if (v==='batch') renderBatch();
  if (v==='scan') renderScan();
  if (v==='owned') renderOwned();
  if (v==='deck') renderDeck();
  if (v==='review') renderReview();
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

  // A second edge running alongside the card has three ordinary causes: a
  // sleeve, a soft shadow cast onto the mat, or the card's own 0.25mm side wall
  // seen off the optical axis. The detector can settle on either line, and it
  // cannot tell which cause it is looking at - so it should not claim to.
  if (det.sleeve>0.35)
    flag('check',`a second edge alongside the card on ${Math.round(det.sleeve*100)}% of scan lines — a sleeve, a shadow, or the card's own thickness`);

  const a=aspectCheck(quad);
  if (a && a.off>0.05) flag('failed',`shape is ${a.seen.toFixed(3)} against ${a.want.toFixed(3)} expected — wrong card type, or an edge line is off`);

  const tilt=tiltCheck(quad);
  if (tilt>1.20) flag('check','strong camera angle');
  else if (tilt>1.10) flag('check','noticeable camera angle');

  if (det.pxPerMm!==null && det.pxPerMm<8)
    flag('check',`only ${det.pxPerMm.toFixed(1)} px/mm — one pixel is ${(1/det.pxPerMm).toFixed(2)} mm`);

  // An edge you placed yourself has no machine fit, which is not the same as a
  // bad one - it should not be reported as loose.
  const weak=EDGE_KEYS.filter(k=>fitWeak(det.fits[k]));
  const dead=EDGE_KEYS.filter(k=>fitUnusable(det.fits[k]));
  if (dead.length)
    flag('failed',`no usable edge on ${dead.join(', ')} — the line there was fitted through scatter, so the quad and everything measured from it are unreliable`);
  else if (weak.length) flag('check','loose edge fit on '+weak.join(', '));

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
    if (cb) cb.innerHTML='<span class="wide">Collection</span><span class="narrow">Cards</span> ('+loadStore().cards.length+')';
  };

  const br=document.getElementById('batchReset');
  if (br) br.onclick=()=>{ state.batch=null; renderBatch(); };

  host.querySelectorAll('button[data-save]').forEach(btn=>{
    btn.onclick=()=>{
      saveBatchItem(+btn.dataset.save);
      const cb=document.getElementById('collBtn');
      if (cb) cb.innerHTML='<span class="wide">Collection</span><span class="narrow">Cards</span> ('+loadStore().cards.length+')';
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
           // Shape of the box actually found, in preview pixels. A card is
           // 0.716 wide-over-tall whichever way up it is; anything far off that
           // is not a card outline, so there is no point capturing it.
           shape: Math.min(cw,ch)/Math.max(cw,ch),
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
  // The box here is axis-aligned, so a card lying at an angle measures FATTER
  // than 0.716, not thinner - at 15 degrees it reads about 0.83. Rejecting
  // symmetrically around 0.716 therefore refused every card that was not
  // perfectly square to the frame, which is why capture sat waiting. Only the
  // thin side is a real fault: an outline taller than a card has overshot it.
  if (q.shape!=null && q.shape < (CARD_MM.w/CARD_MM.h)-0.10) {
    notes.push('outline is taller than a card'); hard=true;
  }
  // The other end: a card would have to lie at nearly 40 degrees to bound a
  // near-square box, and the skew check would have caught that first. In
  // practice this is the outline having latched onto something that is not the
  // card - which is exactly what a 0.996 reading means.
  if (q.shape!=null && q.shape > 0.95) {
    notes.push('outline is not card-shaped'); hard=true;
  }

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

  // A phone with three rear cameras exposes three devices, and the browser picks
  // whichever it calls "the" back camera - usually the 12MP main sensor, not the
  // 50MP or 200MP one. Naming a deviceId is the only way to reach the others.
  // The ideals are set absurdly high on purpose: the browser clamps down to the
  // best mode the chosen camera actually supports.
  const want=camPref();
  const big={ width:{ ideal:7680 }, height:{ ideal:4320 } };
  const tries=[];
  if (want) tries.push({ video:{ deviceId:{ exact:want }, ...big }, audio:false });
  tries.push(
    { video:{ facingMode:{ ideal:'environment' }, ...big }, audio:false },
    { video:{ facingMode:{ ideal:'environment' }, width:{ ideal:3840 }, height:{ ideal:2160 } }, audio:false },
    { video:{ facingMode:{ ideal:'environment' } }, audio:false },
    { video:true, audio:false }                     // laptops with only a front camera
  );

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

  // What the camera is actually giving us, versus what it was capable of. The
  // preview stream is often far below the sensor's still resolution.
  try {
    const t=stream.getVideoTracks()[0];
    const s=t.getSettings?t.getSettings():{};
    const cap=t.getCapabilities?t.getCapabilities():{};
    console.log('[scan] stream settings', s);
    console.log('[scan] stream capabilities', cap);
    state.scan.camNow={ id:s.deviceId||null, w:s.width||null, h:s.height||null,
      maxW:(cap.width&&cap.width.max)||null, maxH:(cap.height&&cap.height.max)||null };
  } catch(e) { state.scan.camNow=null; }
  // Device labels are only revealed once permission has been granted, so the
  // list is built after the stream opens rather than before.
  listCameras().then(()=>{ if (state.view==='scan') renderScan(); });

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
    maybeAutoCapture();
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

  let c=null;

  // The preview stream is a compromise the browser makes for smooth playback.
  // A still pulled through ImageCapture comes off the sensor at its own
  // resolution, often several times larger, and every extra pixel across a
  // border is precision that does not have to be guessed at downstream.
  // Chromium only, and some devices refuse mid-stream, so this stays optional.
  try {
    const track = state.scan.stream && state.scan.stream.getVideoTracks()[0];
    if (track && window.ImageCapture) {
      const cap = new ImageCapture(track);
      const pc  = await cap.getPhotoCapabilities().catch(()=>null);
      const opts = {};
      if (pc && pc.imageWidth  && pc.imageWidth.max)  opts.imageWidth  = pc.imageWidth.max;
      if (pc && pc.imageHeight && pc.imageHeight.max) opts.imageHeight = pc.imageHeight.max;
      const blob = await cap.takePhoto(opts);
      const bmp  = await createImageBitmap(blob);
      // Only worth the swap if it is genuinely bigger than the preview frame.
      if (bmp.width*bmp.height > v.videoWidth*v.videoHeight) {
        c=document.createElement('canvas');
        c.width=bmp.width; c.height=bmp.height;
        c.getContext('2d').drawImage(bmp,0,0);
        console.log(`[scan] still ${bmp.width}\u00d7${bmp.height} (preview was ${v.videoWidth}\u00d7${v.videoHeight})`);
      }
      if (bmp.close) bmp.close();
    }
  } catch(e) {
    console.log('[scan] ImageCapture unavailable, using preview frame:', e && e.name);
  }

  if (!c) {
    c=document.createElement('canvas');
    c.width=v.videoWidth; c.height=v.videoHeight;
    c.getContext('2d').drawImage(v,0,0);
    console.log(`[scan] preview frame ${c.width}\u00d7${c.height}`);
  }

  stopScan();
  state.scan.shot=c;
  state.scan.result=null;
  state.scan.busy=true;
  renderScan();
  await new Promise(r=>setTimeout(r,20));
  runScanPipeline(c);
}

// The captured canvas goes through exactly the same pipeline as a loaded file.
// The scan screen has its own result panel and the flag bar is not on show here,
// so this reports through the same channel as an ordinary "could not find the
// card" rather than through guard(). Clearing `busy` matters most: without it the
// capture button stays spinning and the camera never comes back.
function runScanPipeline(canvas) {
  try {
    return runScanPipelineImpl(canvas);
  } catch (err) {
    console.error('[guard] measuring the capture', err);
    state.scan.busy=false;
    state.scan.result={ ok:false,
      why:'Something went wrong measuring that capture: '
        + ((err && err.message) ? err.message : String(err))
        + '. Try another shot — details are in the browser console.' };
    renderScan();
  }
}

function runScanPipelineImpl(canvas) {
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
  console.log(`[scan] source ${canvas.width}\u00d7${canvas.height} \u2192 rectified ${flat.w}\u00d7${flat.h} `
    + `= ${(1/flat.mmPerPx).toFixed(1)} px/mm measured (source was ${det.pxPerMm?det.pxPerMm.toFixed(1):'?'})`);

  // Quick add skips the grading work - guides, corners, edges - but NOT the
  // checks that say whether the outline is a card at all. Skipping those was a
  // mistake: a quad that runs past the bottom of the card produces a strip full
  // of mat, and the reader then spends its effort on a photograph of felt.
  if (state.scan.mode==='quick') {
    state.scan.busy=false;
    const bad=quickGeometryNote(det, quad);
    state.scan.result={
      ok:true, quick:true, fault:bad,   // advisory only - never blocks a read
      thumb:makeThumb(flat,150), numStrip:makeNumberStrip(flat),
      reviewStrip:makeReviewStrip(flat,600),
      hits:null, query:'', searching:false, msg:null,
      autoBusy:false, autoMsg:null
    };
    renderScan();
    if (state.scan.autoId) quickAuto(flat);
    return;
  }

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
    if (r.quick) { renderQuickAdd(host, r); return; }
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
      ${r.rec.numStrip?`<div class="strip2">
        <div class="win"><img src="${r.rec.numStrip}" alt="bottom of card"></div>
        <span>Collector number &mdash; scroll sideways if you need to.</span>
      </div>`:''}
      <div class="scanNums" ${bad?'data-doubt="1"':''}>
        <div class="scanBig">${bad?'<b>&mdash;</b><i>/</i><b>&mdash;</b>'
          :`<b>${Math.round(leftShare(c))}</b><i>/</i><b>${100-Math.round(leftShare(c))}</b>`}<span>left / right</span></div>
        <div class="scanBig">${bad?'<b>&mdash;</b><i>/</i><b>&mdash;</b>'
          :`<b>${Math.round(topShare(c))}</b><i>/</i><b>${100-Math.round(topShare(c))}</b>`}<span>top / bottom</span></div>
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
      if (cb) cb.innerHTML='<span class="wide">Collection</span><span class="narrow">Cards</span> ('+loadStore().cards.length+')';
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
    ${(()=>{
      const cams=rearCameras(), now=sc.camNow;
      const mp = now&&now.maxW&&now.maxH ? (now.maxW*now.maxH/1e6) : null;
      if (!cams.length && !now) return '';
      return `<div class="camBar">
        ${cams.length>1?`<select id="camPick">${cams.map(c=>
          `<option value="${c.id}" ${now&&now.id===c.id?'selected':''}>${qaEsc(c.label)}</option>`).join('')}</select>`:''}
        <span>${now&&now.w?`preview ${now.w}\u00d7${now.h}`:'camera starting'}${
          mp?` · stills up to ${mp.toFixed(1)}MP`:''}</span>
      </div>`;
    })()}
    <div class="scanActions">
      <button class="btn" data-primary id="scanShot" data-ready="0">Capture</button>
      ${sc.mode==='quick'?`<button class="btn" id="scanAuto" data-on="${sc.autoCapture?'1':'0'}">Auto ${sc.autoCapture?'on':'off'}</button>`:''}
      <button class="btn" id="scanStop">Stop camera</button>
      <button class="btn" id="scanRetry" hidden>Retry</button>
    </div>
    ${sc.mode==='quick'?`<p class="autoLine">
      ${sc.autoCapture
        ? `Hands-free: it fires by itself once framing holds green, then waits for you to lift the card away. Added <b>${sc.autoStats.added}</b> &middot; sent to review <b>${sc.autoStats.review}</b>.`
        : 'Auto is off — press Capture yourself.'}
      ${sc.lastReview?`<br><span class="autoWarn">Last card went to review: ${qaEsc(sc.lastReview)}</span>`:''}
    </p>`:''}
    <p class="hint">Line the card up inside the dashed guide. The box turns green when the
    framing is good &mdash; card filling most of the frame, a clear gap all round, phone held
    flat above it.</p>
  </div>`;

  document.getElementById('scanShot').onclick=captureScan;
  const cp=document.getElementById('camPick');
  if (cp) cp.onchange=()=>useCamera(cp.value);
  const au=document.getElementById('scanAuto');
  if (au) au.onclick=async ()=>{
    const sc=state.scan;
    sc.autoCapture=!sc.autoCapture;
    sc.autoId=sc.autoCapture;
    sc.armed=true; sc.goodRun=0; sc.clearRun=0;
    renderScan();
    // Warm the reader up now rather than stalling on the first card. If it
    // cannot load, auto capture still works and everything goes to review.
    if (sc.autoId && ocrState==='idle') {
      loadSetCodes();
      const ok=await ocrReady();
      if (!ok) { sc.lastReview='number reading unavailable — cards will go to review'; renderScan(); }
    }
  };
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
document.getElementById('scanBtn').onclick=()=>{ state.scan.mode='grade'; state.scan.lastAdded=null; setView(state.view==='scan'&&state.scan.mode!=='quick'?'gauge':'scan'); };
document.getElementById('quickBtn').onclick=()=>{
  const on = state.view==='scan' && state.scan.mode==='quick';
  state.scan.mode = on ? 'grade' : 'quick';
  state.scan.lastAdded=null;
  state.scan.result=null; state.scan.shot=null;
  setView(on?'gauge':'scan');
};
document.getElementById('ownedBtn').onclick=()=>setView(state.view==='owned'?'gauge':'owned');
document.getElementById('deckBtn').onclick=()=>setView(state.view==='deck'?'gauge':'deck');
document.getElementById('reviewBtn').onclick=()=>{ state.review={open:null}; setView(state.view==='review'?'gauge':'review'); };
document.getElementById('loadBtn').onclick=()=>document.getElementById('file').click();

document.getElementById('file').onchange = e => {
  if (e.target.files[0]) openFile(e.target.files[0]);
};

function openFile(file) {
  const img=new Image();
  const url=URL.createObjectURL(file);
  // The object URL is a live handle on the file; releasing it once the bitmap is
  // decoded keeps a long batch from holding every photo it has ever opened.
  const release=()=>{ try { URL.revokeObjectURL(url); } catch(e) {} };

  img.onload=()=>guard('reading the photo', ()=>{
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
    release();
  }, release);

  // A file the browser cannot decode used to do nothing at all - no card, no
  // message, no clue that the click had registered.
  img.onerror=()=>{
    release();
    setFlag('bad','That file could not be read as an image. If it came from a phone it may be in a format this browser does not decode — try exporting it as JPEG or PNG.');
  };

  img.src=url;
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
    const weak=EDGE_KEYS.filter(k=>fitWeak(res.fits[k]));
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
      setFlag('warn',`A second edge was found just outside the card on ${Math.round(res.sleeve*100)}% of scan lines — a sleeve, a shadow on the mat, or the card's own edge thickness.`);
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
    if (f&&f.edited) return `<div data-q="soft"><span>${k}</span><b>by hand</b></div>`;
    if (!f) return `<div data-q="bad"><span>${k}</span><b>none</b></div>`;
    const kf=fitKeptFrac(f), mm=f.rmsMm;
    const q = fitUnusable(f) ? 'bad'
            : (kf>=0.7 && (mm==null || mm<FIT_RMS_MM*0.6)) ? 'good'
            : fitWeak(f) ? 'bad' : 'soft';
    const mg=f.marginPct===null?'' :
      `<em ${(f.marginPct<2||f.marginPct>22)?'data-tight="1"':''}>margin ${f.marginPct.toFixed(1)}%</em>`;
    // Scatter in mm, so the number means the same thing at any working size.
    const scatter = mm!=null ? `${mm.toFixed(3)}mm` : `${f.rms.toFixed(2)}px`;
    return `<div data-q="${q}"><span>${k}</span><b>${f.kept}/${f.total} · ${scatter}</b>${mg}</div>`;
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
  // A phone photo can be enormous, so fit lands well under 10%. The minimum
  // follows it, otherwise the thumb sits pinned at the left and any drag jumps.
  const fitPct=Math.max(1, Math.floor(fitScale()*100));
  const lo=Math.min(fitPct, 10);
  return `<div class="zoom">
    <label for="zoomRange">Zoom</label>
    <button id="zoomFit" type="button">Fit</button>
    <input type="range" id="zoomRange" min="${lo}" max="400" step="1" value="${state.zoomPct||fitPct}">
    <b id="zoomVal">${state.zoomPct||fitPct}%</b>
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

// Guarded at the door rather than around each build below, so a failure in the
// corner or edge analysis still reports instead of stopping the step half-drawn.
function goStep(n) {
  return guard('opening step '+n, ()=>goStepImpl(n));
}

function goStepImpl(n) {
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
  // Yield once so the label actually paints before the resample blocks the
  // thread, then put the button back however the work turns out. It used to be
  // left disabled and mid-sentence whenever anything below threw.
  await new Promise(r=>setTimeout(r,16));
  guard('straightening the card', ()=>straightenImpl(quad));
  btn.textContent='Straighten card'; btn.disabled=false;
}

function straightenImpl(quad) {
  const flat=straighten(state.img,quad);
  if (!flat) { setFlag('bad','Could not build a correction from those lines.'); return; }

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
  if (!el) return;
  if (!level) { el.dataset.show='0'; return; }
  el.dataset.show='1'; el.dataset.level=level; el.textContent=msg;
}

// ---- error boundary ---------------------------------------------------------
//
// The measurement pipeline is a long chain of arithmetic on pixel data, and an
// unusual photo can put a NaN or an out-of-range index somewhere none of the
// explicit checks look. Before this, such a throw simply stopped the call stack:
// the interface was left mid-action - a button still reading "Straightening..."
// and permanently disabled - with nothing on screen to say why.
//
// So every way into the pipeline runs through guard(). A failure becomes an
// ordinary red flag, exactly like the ones raised deliberately, and whatever UI
// the action had put into a pending state is handed back. Nothing here tries to
// RECOVER - the reading is gone either way - it only makes the failure visible
// and leaves the app in a state you can load another photo into.

function crashMessage(doing, err) {
  const detail = (err && err.message) ? err.message : String(err);
  return `Something went wrong while ${doing}: ${detail}. `
       + `This photo may be unusual in a way the measurement did not expect — `
       + `try another, or reload the page. The full error is in the browser console.`;
}

// `doing` completes the sentence "went wrong while ___", so phrase it as an
// activity: 'reading the photo', 'straightening the card'.
function guard(doing, fn, cleanup) {
  try {
    return fn();
  } catch (err) {
    console.error('[guard] ' + doing, err);
    if (cleanup) { try { cleanup(); } catch (e) { console.error('[guard] cleanup', e); } }
    setFlag('bad', crashMessage(doing, err));
    return undefined;
  }
}

// Last line of defence. Anything thrown outside a guarded path - a stray event
// handler, a rejected promise nobody awaited - still gets said out loud rather
// than only appearing in a console the user is not looking at.
window.addEventListener('error', e => {
  console.error('[uncaught]', e.error || e.message);
  setFlag('bad', crashMessage('running', e.error || e.message));
});
window.addEventListener('unhandledrejection', e => {
  console.error('[unhandled rejection]', e.reason);
  setFlag('bad', crashMessage('running', e.reason));
});

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
    const pct=Math.max(1, Math.round(state.scale*100));
    if (val) val.textContent=pct+'%';
    if (range) { range.min=String(Math.min(pct,10)); range.value=pct; }
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
    if (state.fits) { state.fits[best.key]={ edited:true }; renderFits(); }
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
    if (state.fits) { state.fits[lastHandle.key]={ edited:true }; renderFits(); }
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

// Exactly the assessment the scan and batch screens run. It was missing here,
// which is why the gauge could show a confident grade on the same measurement
// the scan screen had refused to stand behind.
function assessCurrent(mm, worst) {
  if (!state.edges || !state.flat) return null;
  const quad=cornersFromEdges(state.edges);
  if (!quad) return null;
  return assessCard(
    { fits:state.fits||{}, pxPerMm:state.pxPerMm,
      calibDrift:state.calibDrift||0, sleeve:state.sleeve||0 },
    quad,
    state.guideSource||{},
    { side:state.side, centering:{ ...mm, worst } }
  );
}

function renderConcerns() {
  const el=document.getElementById('concerns');
  if (!el) return;
  const a=state.assessment;
  if (!a || !a.reasons.length) { el.innerHTML=''; el.dataset.lv=''; return; }
  el.dataset.lv=a.level;
  el.innerHTML=a.reasons.map(r=>`<span>${r}</span>`).join('');
}

function measure() {
  return guard('measuring the centring', measureImpl);
}

function measureImpl() {
  const f=state.flat,g=state.guides; if (!f||!g) return;
  const left=g.left,right=f.w-g.right,top=g.top,bottom=f.h-g.bottom;
  // Same evenness test the batch and scan apply: a card's frame is uniform, so
  // left+right must roughly equal top+bottom whatever the centring.
  const lrMm=(left+right)*f.mmPerPx, tbMm=(top+bottom)*f.mmPerPx;
  state.frameSkew = (lrMm>0.2&&tbMm>0.2) ? Math.max(lrMm,tbMm)/Math.min(lrMm,tbMm) : 1;
  state.frameMm = { lr:lrMm, tb:tbMm };
  const hPct=ratio(left,right), vPct=ratio(top,bottom);
  show('hRatio',share(left,right),left<=right?'left tight':'right tight');
  show('vRatio',share(top,bottom),top<=bottom?'top tight':'bottom tight');
  const mm=v=>(v*f.mmPerPx).toFixed(2);
  document.getElementById('gaps').innerHTML=
    `L <b>${mm(left)}</b> mm &nbsp; R <b>${mm(right)}</b> mm<br>`+
    `T <b>${mm(top)}</b> mm &nbsp; B <b>${mm(bottom)}</b> mm`;
  const worst=Math.max(hPct??0,vPct??0);
  const mmv=v=>+(v*f.mmPerPx).toFixed(3);
  state.assessment=assessCurrent(
    { leftMm:mmv(left), rightMm:mmv(right), topMm:mmv(top), bottomMm:mmv(bottom) },
    +worst.toFixed(2));

  updateVerdict(worst, hPct!==null&&vPct!==null);
  renderConcerns();
}

// The grade depends on the WORST side, so this deliberately takes the larger of
// the two shares and throws the direction away. Correct for grading, wrong for
// display - see share() below.
function ratio(a,b){ const t=a+b; if(t<=0||a<0||b<0) return null; return Math.max(a,b)/t*100; }

// The share of the total belonging to the FIRST argument, direction intact.
// Anything labelled "left / right" or "top / bottom" must use this, or a card
// tight on the right reads as though it were tight on the left.
function share(a,b){ const t=a+b; if(t<=0||a<0||b<0) return null; return a/t*100; }

// Records saved before v43 carry no stored direction, but leftMm/rightMm were
// always written, so the direction can be recovered from those instead.
function leftShare(c){
  if (c.leftPct!==undefined && c.leftPct!==null) return c.leftPct;
  return share(c.leftMm, c.rightMm);
}
function topShare(c){
  if (c.topPct!==undefined && c.topPct!==null) return c.topPct;
  return share(c.topMm, c.bottomMm);
}

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
  // A failed assessment withholds the grade, matching the scan screen. Showing
  // a confident number under a list of reasons not to believe it is the exact
  // thing this tool exists to avoid.
  const a=state.assessment;
  if (a && a.level==='failed') {
    el.textContent='\u2014';
    el.style.color='var(--fail)';
    note.innerHTML='This measurement did not pass its checks. See below, and fix the guides '
      + 'or the photo before reading a grade from it.';
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
