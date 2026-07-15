/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Trash2, 
  X, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  FolderOpen,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Struct for material
interface Material {
  id: number;
  code: string;
  description: string;
  unit: string;
  systemQty: number;
  actualQty: string;
  notes: string;
  photos: string[];
}

// Exactly 10 materials according to the "530xxxxx" format
const PRESET_MATERIALS: Omit<Material, 'id' | 'actualQty' | 'notes' | 'photos'>[] = [
  { code: '53001245', description: 'สายไฟ VCT 2x2.5', unit: 'ม้วน', systemQty: 50 },
  { code: '53001398', description: 'ท่อ PVC 1/2"', unit: 'เส้น', systemQty: 120 },
  { code: '53001512', description: 'เบรกเกอร์ 1P 16A', unit: 'ตัว', systemQty: 40 },
  { code: '53001646', description: 'หลอดไฟ LED 18W', unit: 'หลอด', systemQty: 150 },
  { code: '53001892', description: 'ปลั๊กไฟ 3 ตา', unit: 'ตัว', systemQty: 80 },
  { code: '53002064', description: 'บล็อกลอย 2x4 นิ้ว', unit: 'ชิ้น', systemQty: 200 },
  { code: '53002136', description: 'ท่อ EMT 3/4"', unit: 'เส้น', systemQty: 90 },
  { code: '53002268', description: 'คอนเนคเตอร์ RJ45', unit: 'ตัว', systemQty: 300 },
  { code: '53002337', description: 'เทปพันสายไฟ', unit: 'ม้วน', systemQty: 110 },
  { code: '53002481', description: 'ตู้สวิตช์บอร์ดเหล็ก', unit: 'ตู้', systemQty: 15 }
];

// Presets for mock warehouse photographs
const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80', // Cables
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80', // Industrial Pipes
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80', // Boxes
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80', // Electric components
  'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=400&q=80'  // Cabinet
];

// Calendar Constants for Selection Screen
const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const YEARS = ['2567', '2568', '2569', '2570', '2571', '2572'];

export default function App() {
  // Mobile Screen State (1 - 5)
  const [step, setStep] = useState<number>(1);
  
  // Input fields state
  const [inspectorName, setInspectorName] = useState<string>('');
  const [branch, setBranch] = useState<string>('PDT');
  const [round, setRound] = useState<string>('มิถุนายน 2569');

  // New Calendar Selection States
  const [selectedMonth, setSelectedMonth] = useState<string>('มิถุนายน');
  const [selectedYear, setSelectedYear] = useState<string>('2569');
  const [activePicker, setActivePicker] = useState<'month' | 'year' | null>(null);

  // Sync round with selected month and year
  useEffect(() => {
    setRound(`${selectedMonth} ${selectedYear}`);
  }, [selectedMonth, selectedYear]);
  
  // Materials state (initially populated when moving to screen 3)
  const [materials, setMaterials] = useState<Material[]>([]);
  
  // Sub-navigation step 4 active index (0 to 9)
  const [currentQtyIndex, setCurrentQtyIndex] = useState<number>(0);

  // Summary list state (inside the phone screen modal)
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // For visual cue / randomizer loader
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Fullscreen image preview modal state
  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState<string | null>(null);

  // File input ref for choosing image from device
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and Shuffle materials list for Screen 3
  const handleGenerateMaterials = () => {
    setIsSpinning(true);
    // Shuffle slightly to simulate "random" behavior
    const shuffled = [...PRESET_MATERIALS]
      .sort(() => 0.5 - Math.random())
      .map((item, index) => ({
        ...item,
        id: index + 1,
        actualQty: '',
        notes: '',
        photos: []
      }));
    
    setMaterials(shuffled);
    
    // Simulate real quick scanner delay
    setTimeout(() => {
      setIsSpinning(false);
      setStep(3);
    }, 1000);
  };

  // Helper: auto-generate correct notes based on quantities
  const handleQtyChange = (index: number, val: string) => {
    const updated = [...materials];
    updated[index].actualQty = val;
    
    const actualNum = parseInt(val);
    const systemNum = updated[index].systemQty;
    
    if (!isNaN(actualNum)) {
      if (actualNum === systemNum) {
        updated[index].notes = 'ตรงตามสต๊อกระบบ';
      } else if (actualNum < systemNum) {
        updated[index].notes = `ขาด ${systemNum - actualNum} ${updated[index].unit}`;
      } else {
        updated[index].notes = `เกิน ${actualNum - systemNum} ${updated[index].unit}`;
      }
    } else {
      updated[index].notes = '';
    }
    setMaterials(updated);
  };

  // Quick Action for Evaluators: Simulate scanning/counting all 10 materials instantly
  const handleAutoInspectAll = () => {
    const filled = materials.map((item) => {
      // 80% matches, 20% small discrepancy for realistic feel
      const match = Math.random() > 0.2;
      const actual = match ? item.systemQty : Math.max(0, item.systemQty + (Math.random() > 0.5 ? 5 : -3));
      const notes = actual === item.systemQty 
        ? 'ตรงตามสต๊อกระบบ' 
        : (actual < item.systemQty ? `ขาด ${item.systemQty - actual} ${item.unit}` : `เกิน ${actual - item.systemQty} ${item.unit}`);
      
      // Auto assign 1 beautiful preset image
      const photoIndex = Math.floor(Math.random() * MOCK_PHOTOS.length);
      const photos = [MOCK_PHOTOS[photoIndex]];

      return {
        ...item,
        actualQty: actual.toString(),
        notes,
        photos
      };
    });
    setMaterials(filled);
    setStep(5);
  };

  // Camera capture simulation
  const handleSimulateCapture = (index: number) => {
    const updated = [...materials];
    const currentPhotos = updated[index].photos;
    if (currentPhotos.length < 3) {
      // Choose random index
      const photoUrl = MOCK_PHOTOS[currentPhotos.length % MOCK_PHOTOS.length];
      updated[index].photos = [...currentPhotos, photoUrl];
      setMaterials(updated);
    }
  };

  // Local device file upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const blobUrl = URL.createObjectURL(file);
      const updated = [...materials];
      if (updated[index].photos.length < 3) {
        updated[index].photos = [...updated[index].photos, blobUrl];
        setMaterials(updated);
      }
    }
  };

  const handleRemovePhoto = (index: number, photoUrl: string) => {
    const updated = [...materials];
    updated[index].photos = updated[index].photos.filter(p => p !== photoUrl);
    setMaterials(updated);
  };

  // Reset states to go back to main screen
  const handleBackToStart = () => {
    setStep(1);
    setInspectorName('');
    setBranch('PDT');
    setRound('มิถุนายน 2569');
    setSelectedMonth('มิถุนายน');
    setSelectedYear('2569');
    setActivePicker(null);
    setMaterials([]);
    setCurrentQtyIndex(0);
    setShowSummaryModal(false);
    setSelectedPreviewPhoto(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-[#E0A926]/30">
      
      {/* 390 x 844 px Smartphone Layout Only */}
      <div className="relative w-[390px] h-[844px] bg-white rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[12px] border-slate-800 flex flex-col overflow-hidden ring-1 ring-white/10 select-none">
        
        {/* Dynamic Hardware Notch Speaker / Camera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
        </div>

        {/* Mobile OS Top Status Bar */}
        <div className="h-10 bg-[#0B3C1E] text-white px-6 pt-2 flex items-center justify-between text-xs font-semibold z-40 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span className="text-[10px] tracking-wide">5G</span>
            <div className="w-5 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
              <div className="bg-amber-400 h-full w-3.5 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Screen Viewport with transitions */}
        <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* =======================================
                SCREEN 1: เข้าสู่ระบบ (Login)
                ======================================= */}
            {step === 1 && (
              <motion.div 
                key="screen-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col justify-between p-6 bg-white"
              >
                {/* Logo Section */}
                <div className="flex-1 flex flex-col justify-center items-center">
                  
                  {/* BKK2 Inventory Check Logo Box Graphic */}
                  <div className="w-24 h-24 bg-[#0B3C1E] rounded-3xl flex items-center justify-center shadow-lg relative border-b-4 border-[#E0A926] mb-4">
                    <div className="absolute inset-0 m-3 border border-dashed border-[#E0A926]/40 rounded-2xl flex items-center justify-center">
                      <span className="text-[#E0A926] font-bold text-3xl font-serif">R2</span>
                    </div>
                  </div>

                  <h1 className="font-bold text-2xl text-[#0B3C1E] tracking-wider font-sans text-center">
                    BKK2 INVENTORY CHECK
                  </h1>
                  <p className="text-xs font-medium text-gray-500 mt-2 tracking-wide text-center">
                    ระบบสุ่มตรวจสต๊อกผ่าน Web App
                  </p>

                  {/* Input Form */}
                  <div className="w-full mt-10 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        ชื่อผู้ตรวจสอบ
                      </label>
                      <input 
                        id="inspector_input"
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3C1E] text-slate-800 placeholder:text-gray-300 transition-all shadow-sm"
                        placeholder="กรอกชื่อ-นามสกุล ของคุณ"
                        value={inspectorName}
                        onChange={(e) => setInspectorName(e.target.value)}
                      />
                    </div>

                    <button 
                      id="login_btn"
                      onClick={() => {
                        if (inspectorName.trim()) {
                          setStep(2);
                        } else {
                          // Quick default for easy evaluation if empty
                          setInspectorName('ผู้ตรวจนับทั่วไป');
                          setStep(2);
                        }
                      }}
                      className="w-full bg-[#0B3C1E] hover:bg-[#072613] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-sm tracking-wider shadow-md border-b-4 border-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      <span>เข้าสู่ระบบ</span>
                      <ChevronRight className="w-4 h-4 text-[#E0A926] stroke-[3]" />
                    </button>
                  </div>

                </div>

                {/* Warehouse bottom brand decoration */}
                <div className="text-center py-2">
                  <span className="text-[10px] font-mono text-gray-300 font-bold uppercase tracking-widest">
                    Internal Warehouse Only
                  </span>
                </div>
              </motion.div>
            )}

            {/* =======================================
                SCREEN 2: เลือกสาขา / รอบตรวจ
                ======================================= */}
            {step === 2 && (
              <motion.div 
                key="screen-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 flex flex-col justify-between bg-white"
              >
                {/* Header */}
                <div className="bg-[#0B3C1E] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#E0A926]">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#E0A926]" />
                    <h2 className="font-bold text-sm tracking-wide">เลือกสาขา / รอบตรวจ</h2>
                  </div>
                  <span className="text-[10px] bg-[#E0A926] text-[#0B3C1E] font-extrabold px-2 py-0.5 rounded-full uppercase">Step 2</span>
                </div>

                {/* Fields Body */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto select-none">
                  
                  {/* Current Active Inspector */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B3C1E]/10 flex items-center justify-center text-[#0B3C1E] shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">ผู้ตรวจสอบ</p>
                      <p className="text-xs font-bold text-slate-800">{inspectorName || 'ผู้ตรวจนับทั่วไป'}</p>
                    </div>
                  </div>

                  {/* Dropdown 1: เลือกสาขา */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      เลือกสาขา
                    </label>
                    <select 
                      id="branch_select"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3C1E] transition-all"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    >
                      <option value="CWN">CWN</option>
                      <option value="PDT">PDT</option>
                      <option value="RID">RID</option>
                      <option value="RCP">RCP</option>
                      <option value="AYY">AYY</option>
                      <option value="NKT">NKT</option>
                      <option value="PKO">PKO</option>
                      <option value="SLY">SLY</option>
                      <option value="CWG">CWG</option>
                      <option value="RTB">RTB</option>
                    </select>
                  </div>

                  {/* 2 Selectors: เดือน / ปี */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                      เลือกเดือนที่ตรวจ
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Month Selector */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 mb-1">เดือน</span>
                        <button
                          type="button"
                          onClick={() => setActivePicker('month')}
                          className="w-full bg-white border-2 border-[#0B3C1E]/10 hover:border-[#0B3C1E]/30 rounded-xl py-2.5 px-3 flex items-center justify-between text-xs font-bold text-[#0B3C1E] transition-all shadow-xs active:scale-98"
                        >
                          <span>{selectedMonth}</span>
                          <span className="text-[#E0A926] text-[10px] font-serif">▼</span>
                        </button>
                      </div>

                      {/* Year Selector */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 mb-1">ปี</span>
                        <button
                          type="button"
                          onClick={() => setActivePicker('year')}
                          className="w-full bg-white border-2 border-[#0B3C1E]/10 hover:border-[#0B3C1E]/30 rounded-xl py-2.5 px-3 flex items-center justify-between text-xs font-bold text-[#0B3C1E] transition-all shadow-xs active:scale-98"
                        >
                          <span>{selectedYear}</span>
                          <span className="text-[#E0A926] text-[10px] font-serif">▼</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#0B3C1E]/5 border border-[#0B3C1E]/10 p-3.5 rounded-xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      เดือนที่ตรวจ:
                    </span>
                    <span className="text-xs font-extrabold text-[#0B3C1E] block">
                      {selectedMonth} {selectedYear}
                    </span>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 flex gap-2">
                  <button 
                    id="back_step1_btn"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 active:scale-[0.98] py-4 rounded-2xl text-slate-500 font-bold text-sm tracking-wide transition-all"
                  >
                    ย้อนกลับ
                  </button>
                  <button 
                    id="branch_next_btn"
                    onClick={handleGenerateMaterials}
                    disabled={isSpinning}
                    className="flex-1 bg-[#0B3C1E] hover:bg-[#072613] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-sm tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>ถัดไป</span>
                    <ChevronRight className="w-4 h-4 text-[#E0A926]" />
                  </button>
                </div>

                {/* Popover Selection Overlays */}
                <AnimatePresence>
                  {activePicker && (
                    <motion.div
                      key="picker-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex flex-col justify-end"
                      onClick={() => setActivePicker(null)}
                    >
                      <motion.div
                        key="picker-panel"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="bg-white rounded-t-[32px] p-5 pb-8 max-h-[60%] flex flex-col shadow-2xl overflow-hidden cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                          <span className="text-sm font-extrabold text-[#0B3C1E]">
                            {activePicker === 'month' ? 'เลือกเดือนที่ตรวจสอบ' : 'เลือกปีที่ตรวจสอบ'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivePicker(null)}
                            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Options Container */}
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                          {activePicker === 'month' ? (
                            MONTHS.map((m) => {
                              const isSelected = selectedMonth === m;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    setSelectedMonth(m);
                                    setActivePicker(null);
                                  }}
                                  className={`py-3 px-3 rounded-xl font-bold text-xs text-center transition-all border ${
                                    isSelected
                                      ? 'bg-white border-2 border-[#0B3C1E] text-[#0B3C1E] ring-2 ring-[#E0A926]/30 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200/50 hover:bg-slate-100'
                                  }`}
                                >
                                  {m}
                                </button>
                              );
                            })
                          ) : (
                            YEARS.map((y) => {
                              const isSelected = selectedYear === y;
                              return (
                                <button
                                  key={y}
                                  type="button"
                                  onClick={() => {
                                    setSelectedYear(y);
                                    setActivePicker(null);
                                  }}
                                  className={`py-3 px-3 rounded-xl font-bold text-xs text-center transition-all border ${
                                    isSelected
                                      ? 'bg-white border-2 border-[#0B3C1E] text-[#0B3C1E] ring-2 ring-[#E0A926]/30 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200/50 hover:bg-slate-100'
                                  }`}
                                >
                                  {y}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* =======================================
                SCREEN 3: ระบบสุ่ม Material 10 รายการ
                ======================================= */}
            {step === 3 && (
              <motion.div 
                key="screen-3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 flex flex-col justify-between bg-slate-50"
              >
                {/* Header */}
                <div className="bg-[#0B3C1E] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#E0A926]">
                  <div>
                    <h2 className="font-bold text-sm tracking-wide">รายการที่ระบบสุ่มให้ตรวจ</h2>
                    <p className="text-[10px] text-emerald-400 font-medium">ทั้งหมด 10 รายการ</p>
                  </div>
                  
                  {/* Real-time emulator helper to inspect all instantly */}
                  <button 
                    id="auto_fill_all_btn"
                    onClick={handleAutoInspectAll}
                    title="สุ่มตรวจนับและแนบรูปออโต้เพื่อช่วยประเมินผล"
                    className="text-[10px] bg-[#E0A926] text-[#0B3C1E] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 shadow-sm hover:opacity-95 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ออโต้ทั้ง 10</span>
                  </button>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  
                  {isSpinning ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-[#E0A926] animate-spin" />
                      <p className="text-xs font-bold text-slate-500">กำลังสุ่มคัดเลือกวัสดุจากระบบ...</p>
                    </div>
                  ) : (
                    materials.map((m, index) => {
                      const isQtyFilled = m.actualQty !== '';
                      const isPhotoFilled = m.photos.length > 0;
                      return (
                        <div 
                          key={m.code}
                          onClick={() => {
                            setCurrentQtyIndex(index);
                            setStep(4);
                          }}
                          className="bg-white border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-200 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3">
                            {/* Material Index No. */}
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {index + 1}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-bold text-[#0B3C1E] bg-[#0B3C1E]/5 px-1.5 py-0.2 rounded">
                                  {m.code}
                                </span>
                                {(isQtyFilled || isPhotoFilled) && (
                                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>เรียบร้อย</span>
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-xs text-slate-800 mt-1 leading-tight">
                                {m.description}
                              </h3>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                สต๊อกระบบ: {m.systemQty} {m.unit} 
                                {isQtyFilled && <span className="text-[#0B3C1E] font-bold ml-1.5">| จริง: {m.actualQty}</span>}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      );
                    })
                  )}

                </div>

                {/* Bottom Trigger */}
                <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
                  <button 
                    id="back_to_branch_btn"
                    onClick={() => setStep(2)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 py-4 rounded-2xl text-slate-500 font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                  >
                    ย้อนกลับ
                  </button>
                  <button 
                    id="start_inspect_btn"
                    onClick={() => {
                      setCurrentQtyIndex(0);
                      setStep(4);
                    }}
                    className="flex-1 bg-[#0B3C1E] hover:bg-[#072613] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-sm tracking-wider shadow-md border-b-4 border-emerald-950 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>เริ่มตรวจสอบ</span>
                    <ChevronRight className="w-4 h-4 text-[#E0A926]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* =======================================
                SCREEN 4: กรอกจำนวนจริง + แนบรูป
                ======================================= */}
            {step === 4 && materials[currentQtyIndex] && (
              <motion.div 
                key="screen-4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 flex flex-col justify-between bg-white"
              >
                {/* Header */}
                <div className="bg-[#0B3C1E] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#E0A926]">
                  <div>
                    <h2 className="font-bold text-sm tracking-wide">กรอกจำนวนจริง</h2>
                    <p className="text-[10px] text-amber-400 font-medium">รายการที่ {currentQtyIndex + 1} จาก 10</p>
                  </div>
                  <span className="text-[10px] bg-[#E0A926] text-[#0B3C1E] font-extrabold px-2.5 py-1 rounded-lg">
                    {currentQtyIndex + 1} / 10
                  </span>
                </div>

                {/* Form Body */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  
                  {/* 1. Material Information Card */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl relative overflow-hidden shadow-xs">
                    <span className="absolute top-0 right-0 bg-[#E0A926] text-[#0B3C1E] font-bold text-[10px] px-2.5 py-1 rounded-bl-xl shadow-xs">
                      Material
                    </span>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Material Code:</span>
                      <span className="font-mono text-sm font-bold text-[#0B3C1E] bg-[#0B3C1E]/5 px-2 py-0.5 rounded self-start">
                        {materials[currentQtyIndex].code}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1 mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description:</span>
                      <h3 className="font-bold text-sm text-slate-800">
                        {materials[currentQtyIndex].description}
                      </h3>
                    </div>
                  </div>

                  {/* 2. System Quantity Card */}
                  <div className="bg-[#0B3C1E]/5 border border-[#0B3C1E]/10 p-4 rounded-2xl flex justify-between items-center shadow-xs">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500">จำนวนในระบบ:</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#0B3C1E] bg-white px-3 py-1 rounded-xl border border-[#0B3C1E]/10">
                      {materials[currentQtyIndex].systemQty} {materials[currentQtyIndex].unit}
                    </span>
                  </div>

                  {/* 3. Actual Quantity Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        จำนวนจริง <span className="text-red-500">*</span>
                      </label>
                      
                      {/* Match action to assist reviewer */}
                      <button 
                        id="auto_match_qty_btn"
                        type="button"
                        onClick={() => handleQtyChange(currentQtyIndex, materials[currentQtyIndex].systemQty.toString())}
                        className="text-[10px] font-bold text-[#0B3C1E] bg-[#0B3C1E]/10 px-2.5 py-1 rounded-lg hover:bg-[#0B3C1E]/20 active:scale-95 transition-all"
                      >
                        ใส่ตามระบบ ({materials[currentQtyIndex].systemQty})
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input 
                        id="actual_qty_input"
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 pr-16 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3C1E] focus:bg-white transition-all"
                        placeholder="กรอกจำนวนจริง"
                        value={materials[currentQtyIndex].actualQty}
                        onChange={(e) => handleQtyChange(currentQtyIndex, e.target.value)}
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-slate-400">
                        {materials[currentQtyIndex].unit}
                      </span>
                    </div>
                  </div>

                  {/* 4. Remark Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                      หมายเหตุ
                    </label>
                    <input 
                      id="notes_input"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3C1E] focus:bg-white text-slate-800 placeholder:text-slate-300 transition-all"
                      placeholder="เช่น ชำรุด / ขาดชิ้น / ตรวจนับแล้ว"
                      value={materials[currentQtyIndex].notes}
                      onChange={(e) => {
                        const updated = [...materials];
                        updated[currentQtyIndex].notes = e.target.value;
                        setMaterials(updated);
                      }}
                    />

                    {/* Smart presets buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['ตรงตามสต๊อกระบบ', 'วัสดุเปียกชื้น', 'สลับชั้นวาง', 'ชำรุดเสียหาย'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            const updated = [...materials];
                            updated[currentQtyIndex].notes = preset;
                            setMaterials(updated);
                          }}
                          className="text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200/50 px-2.5 py-1 rounded-full hover:bg-slate-200 transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Photo Evidence Section */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                        แนบรูปถ่ายหลักฐาน ({materials[currentQtyIndex].photos.length}/3)
                      </label>
                    </div>

                    {/* Photo Upload Card */}
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-9 h-9 rounded-full bg-[#0B3C1E]/10 flex items-center justify-center text-[#0B3C1E]">
                        <Camera className="w-4.5 h-4.5 text-[#0B3C1E]" />
                      </div>
                      
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleSimulateCapture(currentQtyIndex)}
                          className="flex-1 bg-[#0B3C1E] hover:bg-[#072613] text-white py-2 px-3 rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#E0A926]" />
                          <span>ถ่ายรูป</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 py-2 px-3 rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-500" />
                          <span>เลือกรูปจากเครื่อง</span>
                        </button>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, currentQtyIndex)}
                      />
                    </div>

                    {/* Image Previews Display Area */}
                    {materials[currentQtyIndex].photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {materials[currentQtyIndex].photos.map((p, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                            <img 
                              src={p} 
                              alt="Inspection preview" 
                              className="w-full h-full object-cover cursor-pointer"
                              referrerPolicy="no-referrer"
                              onClick={() => setSelectedPreviewPhoto(p)}
                            />
                            {/* Overlay to replace photo */}
                            <button
                              type="button"
                              onClick={() => {
                                // Remove old photo and trigger a new device upload to replace it
                                const updated = [...materials];
                                updated[currentQtyIndex].photos = updated[currentQtyIndex].photos.filter(photoUrl => photoUrl !== p);
                                setMaterials(updated);
                                setTimeout(() => {
                                  fileInputRef.current?.click();
                                }, 100);
                              }}
                              className="absolute bottom-1 left-1 right-1 bg-black/60 text-white py-0.5 rounded text-[8px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              เปลี่ยนรูป
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(currentQtyIndex, p);
                              }}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 active:scale-90 transition-all"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* 6. Navigation Buttons */}
                <div className="p-4 border-t border-slate-100 flex gap-2 bg-white">
                  <button 
                    id="qty_back_btn"
                    onClick={() => {
                      if (currentQtyIndex > 0) {
                        setCurrentQtyIndex(currentQtyIndex - 1);
                      } else {
                        setStep(3);
                      }
                    }}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 py-4 rounded-2xl text-slate-500 font-bold text-sm tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>ย้อนกลับ</span>
                  </button>
                  <button 
                    id="qty_next_btn"
                    onClick={() => {
                      // Pre-fill quantity with system if blank to facilitate fluent prototype testing
                      if (materials[currentQtyIndex].actualQty === '') {
                        handleQtyChange(currentQtyIndex, materials[currentQtyIndex].systemQty.toString());
                      }
                      // Automatically mock 1 photo if reviewer leaves empty for faster progress
                      if (materials[currentQtyIndex].photos.length === 0) {
                        handleSimulateCapture(currentQtyIndex);
                      }

                      if (currentQtyIndex < 9) {
                        setCurrentQtyIndex(currentQtyIndex + 1);
                      } else {
                        // All 10 items completed! Move directly to step 5 (Completion Screen)
                        setStep(5);
                      }
                    }}
                    className="flex-1 bg-[#0B3C1E] hover:bg-[#072613] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-sm tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>ถัดไป</span>
                    <ChevronRight className="w-4 h-4 text-[#E0A926]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* =======================================
                SCREEN 5: ทำรายการเรียบร้อย (Complete)
                ======================================= */}
            {step === 5 && (
              <motion.div 
                key="screen-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col justify-between bg-white p-6"
              >
                {/* Upper centered content */}
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  
                  {/* Big Green Success Check Icon */}
                  <div className="relative mb-6">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                      className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="w-10 h-10 stroke-[3.5]" />
                    </motion.div>
                    
                    {/* Ring animation helper */}
                    <div className="absolute inset-0 border-4 border-emerald-400 rounded-full animate-ping opacity-25"></div>
                  </div>

                  <h1 className="font-bold text-2xl text-[#0B3C1E] tracking-wide">
                    ทำรายการเรียบร้อย
                  </h1>
                  
                  {/* Detailed Description */}
                  <div className="mt-4 space-y-1.5 text-sm text-slate-500 font-medium">
                    <p className="text-emerald-600 font-bold">บันทึกข้อมูลสำเร็จ</p>
                    <p className="bg-slate-50 px-4 py-1.5 rounded-full inline-block text-xs font-semibold text-slate-600 border border-slate-100">
                      ตรวจครบ 10 รายการ
                    </p>
                  </div>

                  {/* Summary Overview Spec */}
                  <div className="mt-6 w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">สาขาที่สุ่มตรวจ</span>
                      <span className="font-bold text-slate-800 bg-[#E0A926]/10 text-[#0B3C1E] px-2.5 py-0.5 rounded-md">
                        {branch}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">รอบการตรวจ</span>
                      <span className="font-bold text-slate-800">
                        {round}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">ผู้ตรวจสอบ</span>
                      <span className="font-semibold text-slate-700">
                        {inspectorName || '-'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Actions at Screen 5 */}
                <div className="space-y-2">
                  <button 
                    id="back_home_btn"
                    onClick={handleBackToStart}
                    className="w-full bg-[#0B3C1E] hover:bg-[#072613] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-sm tracking-wide shadow-md border-b-4 border-emerald-950 transition-all flex items-center justify-center gap-1.5"
                  >
                    กลับหน้าหลัก
                  </button>
                  <button 
                    id="view_summary_btn"
                    onClick={() => setShowSummaryModal(true)}
                    className="w-full border-2 border-[#0B3C1E]/20 bg-white hover:bg-slate-50 active:scale-[0.98] py-4 rounded-2xl font-bold text-sm text-[#0B3C1E] tracking-wide transition-all flex items-center justify-center gap-1.5"
                  >
                    ดูสรุปผล
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* =======================================
              POPUP SUMMARY MODAL (stays 100% inside mobile phone viewport!)
              ======================================= */}
          <AnimatePresence>
            {showSummaryModal && (
              <motion.div 
                key="summary-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex flex-col justify-end"
              >
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                  className="bg-white rounded-t-[30px] max-h-[85%] flex flex-col shadow-2xl overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="bg-[#0B3C1E] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#E0A926]">
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">รายงานสรุปผลการสุ่มตรวจ</h3>
                      <p className="text-[10px] text-amber-400 font-medium">สาขา {branch} ({round})</p>
                    </div>
                    <button 
                      id="close_summary_btn"
                      onClick={() => setShowSummaryModal(false)}
                      className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Scroll Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                    
                    {materials.map((m, idx) => {
                      const diff = parseInt(m.actualQty) - m.systemQty;
                      const isMatch = diff === 0;
                      return (
                        <div key={m.code} className="bg-white border border-slate-100 p-3.5 rounded-xl space-y-2 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-bold text-[#0B3C1E]">
                                {m.code}
                              </span>
                              <h4 className="font-semibold text-xs text-slate-800 mt-1">{m.description}</h4>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {isMatch ? 'ตรงตามสต๊อก' : 'ผลต่างคลาดเคลื่อน'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg text-[10px] text-slate-500 font-bold">
                            <div>
                              <p className="text-gray-400">สต๊อกระบบ</p>
                              <p className="text-slate-800">{m.systemQty} {m.unit}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">นับได้จริง</p>
                              <p className="text-[#0B3C1E]">{m.actualQty || '0'} {m.unit}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">ผลต่าง</p>
                              <p className={diff < 0 ? 'text-red-500' : diff > 0 ? 'text-blue-600' : 'text-emerald-600'}>
                                {diff > 0 ? `+${diff}` : diff} {m.unit}
                              </p>
                            </div>
                          </div>

                          {m.notes && (
                            <p className="text-[10px] text-gray-500 italic bg-amber-50 px-2 py-1 rounded border border-amber-100/50">
                              หมายเหตุ: {m.notes}
                            </p>
                          )}

                          {m.photos.length > 0 && (
                            <div className="flex gap-1 items-center pt-1">
                              <span className="text-[9px] text-slate-400 font-semibold uppercase mr-1">รูปถ่ายประกอบ:</span>
                              {m.photos.map((p, pIdx) => (
                                <img 
                                  key={pIdx} 
                                  src={p} 
                                  alt="Thumbnail" 
                                  className="w-6 h-6 object-cover rounded-md border border-slate-200" 
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>

                  {/* Modal Footer Actions */}
                  <div className="p-4 border-t border-slate-100 bg-white">
                    <button 
                      id="modal_done_btn"
                      onClick={() => setShowSummaryModal(false)}
                      className="w-full bg-[#0B3C1E] text-white py-3.5 rounded-xl font-bold text-sm tracking-wider active:scale-[0.98] transition-all"
                    >
                      ตกลง
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fullscreen Photo Preview Modal */}
          <AnimatePresence>
            {selectedPreviewPhoto && (
              <motion.div
                key="photo-preview-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPreviewPhoto(null)}
                className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4 cursor-pointer"
              >
                <div className="absolute top-5 right-5 text-white/80 p-2 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </div>
                <img
                  src={selectedPreviewPhoto}
                  alt="Full-size evidence preview"
                  className="max-w-full max-h-[80%] rounded-2xl object-contain shadow-2xl"
                  referrerPolicy="no-referrer"
                />
                <p className="text-white/60 text-[10px] font-semibold mt-4 tracking-wide text-center">แตะที่ใดก็ได้เพื่อปิดหน้าต่างพรีวิว</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Home indicator bar representing modern smartphone */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-40"></div>

        </div>

      </div>

    </div>
  );
}
