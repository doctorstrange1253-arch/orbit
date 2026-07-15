/**
 * HoloBay.jsx — the Holo-Bay (/holobay): a try-before-you-buy lab for Nebula
 * Store cosmetics. Pick any item and it renders LIVE on a holographic mock of
 * your own profile — your real name carries the glow, the card wears the nebula
 * — so you see exactly what everyone else will see before you spend a Photon.
 *
 * Nothing here mutates server state until you press Buy or Equip; the preview is
 * pure client render (GlowName + cosmetics.css classes), identical to how the
 * look renders for other users (that's the whole point — see GlowName). Buy /
 * Equip reuse the same useShop mutations as the store, so balances and equipped
 * looks stay in sync app-wide.
 *
 * Reduced-motion / data-anim-off safe: the holo-scan and float are CSS-gated
 * (holobay.css); the cosmetic glows are already gated in cosmetics.css.
 */
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, ArrowLeft, Shuffle, RotateCcw, Share2, ChevronDown } from 'lucide-react';
import PhotonIcon from '../cosmic/PhotonIcon';
import PhotonAmount from '../cosmic/PhotonAmount';
import CelebrationBurst from '../cosmic/CelebrationBurst';
import GlowName from '../cosmic/GlowName';
import Nameplate from '../cosmic/Nameplate';
import ItemIcon from '../cosmic/itemIcons';
import { useShop, useBuyCosmetic, useEquipCosmetic } from '../cosmic/useShop';
import { COSMETIC_RENDER, bgClassFor, decoClassFor, effectClassFor } from '../cosmic/cosmetics';
import { rarityOf, rarityVars, rarityInk, cardGlowClass, RARITY_ORDER } from '../cosmic/rarity';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import './holobay.css';
import { SkelBox } from '../components/ui/SkeletonPrimitives';

// Background swatch style. When a .cbg scene class is present we let the CSS
// class paint the animated nebula (do NOT set inline background or it would
// override the class); otherwise fall back to the static swatch gradient.
const bgSwatchStyle = (size, bg) => bg ? ({ width: size, height: size, background: bg }) : ({ width: size, height: size });

function Swatch({ item, size = 40 }) {
  const meta = COSMETIC_RENDER[item.key] || {};
  if (item.type === 'avatar_deco')
    return (
      // dark disc backing (like the glow swatch) so pale AND dark rings read in both themes
      <span
        className="relative grid place-items-center overflow-hidden rounded-full"
        style={ { width: size, height: size, background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,.10), rgba(3,5,12,.9))' } }
      >
        <span className={meta.decoClass} aria-hidden="true" />
      </span>
    );
  if (item.type === 'profile_effect')
    return (
      // pe-mini concentrates the particle tiles ~3× so the effect actually
      // reads at swatch scale (full-size .pe sheets were invisible → the
      // "all black tiles" bug). The deep-space radial backdrop makes the
      // brightened particles pop like a tiny contained galaxy.
      <span
        className="cosmic-surface relative grid place-items-center overflow-hidden rounded-lg"
        style={ { width: size, height: size, background: 'radial-gradient(circle at 50% 40%, rgba(56,66,120,.55), rgba(3,5,12,.95) 75%)' } }
      >
        <span className={`${meta.effectClass || ''} pe-mini`} aria-hidden="true" />
      </span>
    );
  if (item.type === 'nameplate')
    return (
      <span className="cosmic-surface np-wrap text-[10px] font-bold text-white">
        <span className={meta.plateClass} aria-hidden="true" />
        <span className="np-content">Aa</span>
      </span>
    );
  if (item.type === 'name_glow')
    return (
      <span
        className="inline-grid place-items-center rounded-md"
        style={ { width: size, height: size, background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,.10), rgba(3,5,12,.9))' } }
      >
        <span className={meta.glowClass} style={ { fontSize: Math.round(size * 0.42) } }>Aa</span>
      </span>
    );
  if (item.type === 'background' && (meta.bgClass || meta.swatch))
    return (
      <span
        className={(meta.bgClass ? meta.bgClass + ' cbg-swatch ' : '') + 'inline-block overflow-hidden rounded-md'}
        aria-hidden="true"
        style={bgSwatchStyle(size, meta.bgClass ? null : meta.swatch)}
      />
    );
  return <ItemIcon item={item} size={size} color={rarityInk(item.rarity)} />;
}

// Collapsible dropdown picker for one cosmetic type. Hoisted (not defined in
// render) so React keeps its identity stable across renders. The swatch grid
// lives INSIDE a capped internal scroll area, so choosing items never scrolls
// the page — the hologram stage stays put (it's sticky on desktop too).
function Picker({ title, items, activeKey, onPick, onClear, clearLabel, open, onToggle }) {
  const activeItem = items.find((i) => i.key === activeKey) || null;
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
        {/* live summary of the current pick, visible even when collapsed */}
        <span className="ml-auto flex min-w-0 items-center gap-2">
          {activeItem ? (
            <>
              <Swatch item={activeItem} size={22} />
              <span className="max-w-[90px] truncate text-[11px] font-semibold text-slate-300">{activeItem.name}</span>
            </>
          ) : (
            <span className="text-[11px] text-slate-500">None</span>
          )}
        </span>
        <ChevronDown size={14} className={`flex-none text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex justify-end">
            <button onClick={onClear} className="text-[11px] font-semibold text-slate-500 hover:text-slate-300">{clearLabel}</button>
          </div>
          {/* capped + internally scrollable: picking never moves the page */}
          <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1">
            {items.map((it) => {
              const active = it.key === activeKey;
              return (
                <button
                  key={it.key}
                  onClick={() => onPick(it.key)}
                  title={`${it.name} · ${rarityOf(it.rarity).label}`}
                  style={rarityVars(it.rarity)}
                  className={`cv-auto relative grid h-14 w-14 place-items-center rounded-xl border transition
                    ${active ? 'ring-2 ring-white/70 border-white/30' : 'border-white/10 hover:border-white/25'}`}
                >
                  <span className="absolute inset-0 rounded-xl" style={{ background: 'rgba(18,20,33,.7)' }} />
                  <span className="relative"><Swatch item={it} size={34} /></span>
                  {it.owned && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[9px] text-white"><Check size={10} /></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HoloBay() {
  const { data } = useShop();
  const buy = useBuyCosmetic();
  const equip = useEquipCosmetic();
  const { addToast } = useUIStore();
  const authName = useAuthStore((s) => s.user?.name) || 'You';

  const catalog = useMemo(() => data?.catalog || [], [data]);
  const glows = useMemo(() => catalog.filter((c) => c.type === 'name_glow'), [catalog]);
  const backgrounds = useMemo(() => catalog.filter((c) => c.type === 'background'), [catalog]);
  const decos = useMemo(() => catalog.filter((c) => c.type === 'avatar_deco'), [catalog]);
  const effects = useMemo(() => catalog.filter((c) => c.type === 'profile_effect'), [catalog]);
  const plates = useMemo(() => catalog.filter((c) => c.type === 'nameplate'), [catalog]);

  // Currently PREVIEWED (not equipped) selections — default to what's equipped.
  const equippedGlow = data?.equipped?.name_glow || null;
  const equippedBg = data?.equipped?.background || null;
  const equippedDeco = data?.equipped?.avatar_deco || null;
  const equippedEffect = data?.equipped?.profile_effect || null;
  const equippedPlate = data?.equipped?.nameplate || null;
  const [celebrate, setCelebrate] = useState(null); // { rarity, name } after a buy
  const [tryGlow, setTryGlow] = useState(undefined); // undefined → fall back to equipped
  const [tryBg, setTryBg] = useState(undefined);
  const [tryDeco, setTryDeco] = useState(undefined);
  const [tryEffect, setTryEffect] = useState(undefined);
  const [tryPlate, setTryPlate] = useState(undefined);
  // Accordion: which picker dropdown is open (one at a time keeps the column
  // compact so the sticky stage and the pickers share the viewport).
  const [openPicker, setOpenPicker] = useState('glow');
  const togglePicker = (k) => setOpenPicker((cur) => (cur === k ? null : k));

  // Shared-look deep link (?glow=…&bg=…&deco=…&fx=…&np=…): once the catalog is
  // in, seed the preview from the URL — invalid/unknown keys are ignored, and
  // it only applies once so the user keeps control afterwards. Render-time
  // state adjustment (the React-docs pattern): setState during render with a
  // state guard makes React re-render before committing, no effect needed.
  const [params] = useSearchParams();
  const [seededFromUrl, setSeededFromUrl] = useState(false);
  if (!seededFromUrl && catalog.length) {
    setSeededFromUrl(true);
    const pick = (name, list) => {
      const k = params.get(name);
      return k && list.some((i) => i.key === k) ? k : undefined;
    };
    const g = pick('glow', glows), b = pick('bg', backgrounds), d = pick('deco', decos);
    const e = pick('fx', effects), p = pick('np', plates);
    if (g) setTryGlow(g);
    if (b) setTryBg(b);
    if (d) setTryDeco(d);
    if (e) setTryEffect(e);
    if (p) setTryPlate(p);
  }

  const glowKey = tryGlow === undefined ? equippedGlow : tryGlow;
  const bgKey = tryBg === undefined ? equippedBg : tryBg;
  const decoKey = tryDeco === undefined ? equippedDeco : tryDeco;
  const effectKey = tryEffect === undefined ? equippedEffect : tryEffect;
  const plateKey = tryPlate === undefined ? equippedPlate : tryPlate;
  const glowItem = glows.find((g) => g.key === glowKey) || null;
  const bgItem = backgrounds.find((b) => b.key === bgKey) || null;
  const decoItem = decos.find((d) => d.key === decoKey) || null;
  const effectItem = effects.find((e) => e.key === effectKey) || null;
  const plateItem = plates.find((p) => p.key === plateKey) || null;

  // Quantum Shuffle — dress the hologram in one random item per slot. Pure
  // preview state; nothing is bought or equipped.
  const rand = (list) => (list.length ? list[Math.floor(Math.random() * list.length)].key : null);
  const shuffleLook = () => {
    setTryGlow(rand(glows));
    setTryBg(rand(backgrounds));
    setTryDeco(rand(decos));
    setTryEffect(rand(effects));
    setTryPlate(rand(plates));
  };
  // Share the current look as a deep link anyone can open in their Holo-Bay.
  const shareLook = async () => {
    const url = new URL('/holobay', window.location.origin);
    if (glowKey) url.searchParams.set('glow', glowKey);
    if (bgKey) url.searchParams.set('bg', bgKey);
    if (decoKey) url.searchParams.set('deco', decoKey);
    if (effectKey) url.searchParams.set('fx', effectKey);
    if (plateKey) url.searchParams.set('np', plateKey);
    try {
      await navigator.clipboard.writeText(url.toString());
      addToast('Look link copied — send it to anyone', 'success');
    } catch {
      addToast('Could not copy the link', 'error');
    }
  };

  // Back to reality — undefined falls through to whatever is actually equipped.
  const resetLook = () => {
    setTryGlow(undefined);
    setTryBg(undefined);
    setTryDeco(undefined);
    setTryEffect(undefined);
    setTryPlate(undefined);
  };

  // Price the previewed look: total of previewed items you DON'T own yet.
  const previewItems = [glowItem, bgItem, decoItem, effectItem, plateItem].filter(Boolean);
  const unownedPreview = previewItems.filter((it) => !it.owned);
  const lookTotal = unownedPreview.reduce((sum, it) => sum + (it.cost || 0), 0);
  const balance = data?.photons ?? data?.stardust ?? 0;

  const busy = buy.isPending || equip.isPending;
  const onBuy = (key) => buy.mutate(key, {
    onSuccess: (d) => {
      addToast(`Purchased — ${d.spentPhotons ?? d.spent} Photons spent`, 'success');
      const item = catalog.find((c) => c.key === key);
      if (item) setCelebrate({ rarity: item.rarity, name: item.name });
    },
    onError: (e) => addToast(e.response?.data?.message || 'Purchase failed', 'error'),
  });
  const onEquip = (type, key) => equip.mutate({ type, key }, {
    onSuccess: () => addToast(key ? 'Equipped' : 'Unequipped', 'info'),
    onError: (e) => addToast(e.response?.data?.message || 'Could not equip', 'error'),
  });

  // action row for whichever item the stage is currently wearing
  const stageActions = (item, type) => {
    if (!item) return null;
    if (item.equipped) return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300"><Check size={13} /> Equipped</span>
    );
    if (item.owned) return (
      <button onClick={() => onEquip(type, item.key)} disabled={busy}
        className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20">Equip this</button>
    );
    return (
      <button onClick={() => onBuy(item.key)} disabled={busy || !item.affordable}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${item.affordable ? 'text-slate-900' : 'cursor-not-allowed bg-white/5 text-slate-500'}`}
        style={item.affordable ? { background: 'linear-gradient(90deg,#38bdf8,#8b5cf6,#ec4899)' } : undefined}>
        {item.affordable ? <PhotonIcon size={12} animated={false} /> : <Lock size={11} />} {item.cost.toLocaleString()}
      </button>
    );
  };

  if (!data) {
    return (
      <div className="cosmic-page relative min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <SkelBox h={420} r={24} />
            <div className="flex flex-col gap-3">
              <SkelBox h={120} r={20} />
              <SkelBox h={120} r={20} />
              <SkelBox h={120} r={20} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmic-page relative min-h-screen">
      {celebrate && (
        <CelebrationBurst rarity={celebrate.rarity} itemName={celebrate.name} onDone={() => setCelebrate(null)} />
      )}
      <div className="pointer-events-none fixed inset-0 -z-10 cosmic-backdrop" style={{
        background:
          'radial-gradient(55% 45% at 20% 10%, rgba(56,189,248,.13), transparent 60%),' +
          'radial-gradient(55% 55% at 82% 18%, rgba(139,92,246,.16), transparent 62%),' +
          '#07080f',
      }} />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15} /> Store</Link>
          <h1 className="brand-gradient-text ml-1 text-2xl font-black tracking-tight sm:text-3xl">
            Holo-Bay
          </h1>
          <div className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-violet-400/40">
            <PhotonIcon size={15} />
            <PhotonAmount value={data.photons ?? data.stardust ?? 0} className="text-sm font-black text-violet-100" />
          </div>
        </div>
        <p className="mt-1.5 text-sm text-slate-400">Try any look on a live hologram of your profile. Nothing is spent until you Buy or Equip.</p>

        {/* stage controls — play with a random look, or snap back to reality */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={shuffleLook}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-slate-900"
            style={{ background: 'linear-gradient(90deg,#38bdf8,#8b5cf6,#ec4899)' }}>
            <Shuffle size={13} /> Quantum Shuffle
          </button>
          <button onClick={resetLook}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 ring-1 ring-white/10 hover:bg-white/10">
            <RotateCcw size={13} /> Reset to equipped
          </button>
          {(glowKey || bgKey || decoKey || effectKey || plateKey) && (
            <button onClick={shareLook}
              title="Copy a link that opens this exact look in anyone's Holo-Bay"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 ring-1 ring-white/10 hover:bg-white/10">
              <Share2 size={13} /> Share look
            </button>
          )}
          {lookTotal > 0 && (
            <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1
              ${lookTotal <= balance ? 'text-emerald-300 ring-emerald-400/40 bg-emerald-500/10' : 'text-rose-300 ring-rose-400/40 bg-rose-500/10'}`}>
              <PhotonIcon size={13} animated={false} />
              Look total: {lookTotal.toLocaleString()}
              {lookTotal <= balance ? ' — you can afford it' : ` — ${(lookTotal - balance).toLocaleString()} short`}
            </span>
          )}
        </div>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ── HOLOGRAM STAGE ── */}
          {/* cosmic-surface: the whole stage is a RENDER surface — it stays dark
              in light mode so cosmetics preview exactly as others see them.
              Sticky on desktop: the stage stays in view while you browse the
              picker dropdowns, so trying looks never scrolls it away. */}
          <div className="holobay-stage cosmic-surface relative overflow-hidden rounded-3xl border border-cyan-400/20 p-6 sm:p-8 lg:sticky lg:top-20">
            <div className="holobay-scan" aria-hidden="true" />
            <div className="relative mx-auto max-w-sm">
              {/* mock profile card wearing the previewed background */}
              <motion.div
                key={`${glowKey}|${bgKey}`}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                style={bgItem ? rarityVars(bgItem.rarity) : undefined}
                className={`holobay-float relative rounded-2xl border border-white/10 p-6 text-center ${bgClassFor(bgKey)} ${bgItem ? cardGlowClass(bgItem.rarity) : ''}`}
              >
                {effectKey && <span className={effectClassFor(effectKey)} aria-hidden="true" />}
                {/* readability scrim: keep name + avatar legible on any background */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-slate-950/45" aria-hidden="true" />
                <div className="relative z-10">
                {/* avatar disc */}
                <div className="relative mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full ring-2 ring-white/20"
                     style={{ background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,.12), rgba(3,5,12,.6))' }}>
                  {decoKey && <span className={decoClassFor(decoKey)} aria-hidden="true" />}
                  <PhotonIcon size={34} />
                </div>
                <div className="mt-3 text-lg font-black">
                  <Nameplate plateKey={plateKey}><GlowName cosmeticGlowKey={glowKey}>{authName}</GlowName></Nameplate>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">This is exactly how others see you</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-200">Mentor</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-200">Orbit</span>
                </div>
                </div>
              </motion.div>

              {/* what the stage is wearing + inline actions */}
              <div className="mt-5 space-y-2">
                {glowItem && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                    <span className="rar-badge" style={rarityVars(glowItem.rarity)}>{rarityOf(glowItem.rarity).label}</span>
                    <span className="truncate text-sm font-semibold text-white">{glowItem.name}</span>
                    <span className="ml-auto">{stageActions(glowItem, 'name_glow')}</span>
                  </div>
                )}
                {bgItem && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                    <span className="rar-badge" style={rarityVars(bgItem.rarity)}>{rarityOf(bgItem.rarity).label}</span>
                    <span className="truncate text-sm font-semibold text-white">{bgItem.name}</span>
                    <span className="ml-auto">{stageActions(bgItem, 'background')}</span>
                  </div>
                )}
                {decoItem && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                    <span className="rar-badge" style={rarityVars(decoItem.rarity)}>{rarityOf(decoItem.rarity).label}</span>
                    <span className="truncate text-sm font-semibold text-white">{decoItem.name}</span>
                    <span className="ml-auto">{stageActions(decoItem, 'avatar_deco')}</span>
                  </div>
                )}
                {effectItem && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                    <span className="rar-badge" style={rarityVars(effectItem.rarity)}>{rarityOf(effectItem.rarity).label}</span>
                    <span className="truncate text-sm font-semibold text-white">{effectItem.name}</span>
                    <span className="ml-auto">{stageActions(effectItem, 'profile_effect')}</span>
                  </div>
                )}
                {plateItem && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                    <span className="rar-badge" style={rarityVars(plateItem.rarity)}>{rarityOf(plateItem.rarity).label}</span>
                    <span className="truncate text-sm font-semibold text-white">{plateItem.name}</span>
                    <span className="ml-auto">{stageActions(plateItem, 'nameplate')}</span>
                  </div>
                )}
                {!glowItem && !bgItem && !decoItem && !effectItem && !plateItem && (
                  <div className="rounded-xl border border-dashed border-white/10 px-3 py-3 text-center text-xs text-slate-500">
                    Pick a glow, nebula or frame on the right to preview it here.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── PICKERS ── */}
          <div className="space-y-3">
            <Picker title="Name Glow" items={glows} activeKey={glowKey}
              open={openPicker === 'glow'} onToggle={() => togglePicker('glow')}
              onPick={(k) => setTryGlow(k === glowKey ? null : k)}
              onClear={() => setTryGlow(null)} clearLabel="None" />
            <Picker title="Profile Nebula" items={backgrounds} activeKey={bgKey}
              open={openPicker === 'bg'} onToggle={() => togglePicker('bg')}
              onPick={(k) => setTryBg(k === bgKey ? null : k)}
              onClear={() => setTryBg(null)} clearLabel="None" />
            <Picker title="Avatar Frame" items={decos} activeKey={decoKey}
              open={openPicker === 'deco'} onToggle={() => togglePicker('deco')}
              onPick={(k) => setTryDeco(k === decoKey ? null : k)}
              onClear={() => setTryDeco(null)} clearLabel="None" />
            <Picker title="Profile Effect" items={effects} activeKey={effectKey}
              open={openPicker === 'fx'} onToggle={() => togglePicker('fx')}
              onPick={(k) => setTryEffect(k === effectKey ? null : k)}
              onClear={() => setTryEffect(null)} clearLabel="None" />
            <Picker title="Nameplate" items={plates} activeKey={plateKey}
              open={openPicker === 'np'} onToggle={() => togglePicker('np')}
              onPick={(k) => setTryPlate(k === plateKey ? null : k)}
              onClear={() => setTryPlate(null)} clearLabel="None" />

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Rarity</div>
              <div className="flex flex-wrap gap-1.5">
                {RARITY_ORDER.map((r) => (
                  <span key={r.key} className="rar-badge" style={{ ...rarityVars(r.key), fontSize: 9, padding: '1px 6px' }}>{r.label}</span>
                ))}
              </div>
            </div>

            <Link to="/shop" className="block rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-white/10">
              Browse the full Nebula Store →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
