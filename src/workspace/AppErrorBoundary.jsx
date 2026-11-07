import {InterfaceContext} from '../interface/InterfacePreferences.jsx';
import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import React from 'react';
import { chunkXatosimi, yangiVersiyagaOt } from '../pwa/tiklash.js';   // REV413

export default class AppErrorBoundary extends React.Component {
  static contextType=InterfaceContext;
  state = { failed: false, resetKey: this.props.resetKey };
  static getDerivedStateFromProps(props, state) {
    if(props.resetKey !== state.resetKey)return {failed:false,resetKey:props.resetKey};
    return null;
  }
  static getDerivedStateFromError(error) { return { failed: true, xato: String(error?.message || error || "").slice(0, 160) }; }
  componentDidCatch(error, info) {
    // REV306: xato matni va qaysi qismda bo'lgani ekranda (rasmga olib yuborish uchun) va konsolda
    try { const joy = String(info?.componentStack || "").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 3).join(" ‹ ");
      this.setState({ joy: joy.slice(0, 200) }); console.error("[Kabutar bo‘lim xatosi]", error, info?.componentStack); } catch { /* */ }
    // REV305: yangi versiya chiqqanda eski sahifa bo'lak (chunk) topa olmasa — sahifa bir marta o'zi yangilanadi
    const m = String(error?.message || error || "");
    if (chunkXatosimi(m)) yangiVersiyagaOt();   // REV413: keshni tozalab, yangi versiyaga o'zi o'tadi
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div style={{ display: 'grid', placeItems: 'center', padding: 24, color: '#16353e', fontFamily: 'system-ui, sans-serif' }}>
      <section role="alert" style={{ maxWidth: 440, background: 'white', padding: 32, borderRadius: 24, boxShadow: '0 16px 60px #183d3a12' }}>
        <small style={{ color: '#087f79', fontWeight: 800, letterSpacing: 2 }}>{__kbUi("KABUTAR")}</small>
        <h1 style={{ fontSize: 26 }}>{__kbUi("Bu bo‘limni ochib bo‘lmadi")}</h1>
        <p style={{ lineHeight: 1.6 }}>{__kbUi("Bu bo‘limni qayta oching yoki menyudan boshqa bo‘limni tanlang.")}</p>
        {this.state.xato && <p style={{ fontSize: 12, color: '#7a8a8e', wordBreak: 'break-word' }}>{this.state.xato}{this.state.joy ? ` — ${this.state.joy}` : ""}</p>}
        <button type="button" onClick={() => { if (chunkXatosimi(this.state.xato)) { yangiVersiyagaOt({ majburiy: true }); return; } this.setState({failed:false}); }} style={{ border: 0, borderRadius: 12, background: '#087f79', color: 'white', padding: '14px 20px', fontWeight: 700, cursor: 'pointer' }}>{__kbUi("Bo‘limni qayta ochish")}</button>
      </section>
    </div>;
  }
}
