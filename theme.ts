
/**
 * LegalPro Corporate Design System
 * 基於企業藍 (Primary Blue) 與純白背景的專業設計規範
 */

export const theme = {
  // 容器樣式
  card: "bg-white border border-[#dfe1e6] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden",
  cardHover: "hover:shadow-[0_4px_12px_rgba(9,30,66,0.15)] transition-all duration-200",
  
  // 文字樣式
  heading1: "text-[#172b4d] text-2xl font-bold tracking-tight",
  heading2: "text-[#172b4d] text-lg font-bold tracking-tight",
  body: "text-[#5e6c84] text-sm leading-relaxed",
  small: "text-[#0052cc] text-xs font-bold uppercase tracking-wider",
  
  // 按鈕樣式
  btnPrimary: "bg-[#0052cc] hover:bg-[#0747a6] active:scale-[0.98] text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100",
  btnSecondary: "bg-[#e6f0ff] hover:bg-[#deebff] text-[#0052cc] px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
  btnGhost: "text-[#5e6c84] hover:text-[#0052cc] hover:bg-[#f4f5f7] p-2 rounded-lg transition-all flex items-center gap-2",
  
  // 表單樣式
  input: "w-full px-4 py-2.5 rounded-lg border border-[#dfe1e6] bg-[#fafbfc] text-[#172b4d] placeholder:text-[#a5adba] focus:bg-white focus:border-[#0052cc] focus:ring-2 focus:ring-[#deebff] outline-none transition-all",
  
  // 語意化顏色標籤
  badgeIndigo: "bg-[#deebff] text-[#0747a6] px-2.5 py-1 rounded text-[10px] font-bold uppercase",
  badgeEmerald: "bg-[#e3fcef] text-[#006644] px-2.5 py-1 rounded text-[10px] font-bold uppercase",
  badgeRose: "bg-[#ffebe6] text-[#bf2600] px-2.5 py-1 rounded text-[10px] font-bold uppercase",
  badgeAmber: "bg-[#fffae6] text-[#ff8b00] px-2.5 py-1 rounded text-[10px] font-bold uppercase",
  
  // 間距系統
  sectionGap: "space-y-6",
  gridGap: "gap-6",
};
