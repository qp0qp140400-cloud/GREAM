import React, { useState } from 'react';
import { 
  ShieldAlert, Wrench, QrCode, Plus, Search, Filter, 
  Calendar, CheckCircle2, AlertTriangle, RefreshCw, Download, Layers
} from 'lucide-react';

export default function App() {
  // 샘플 자산 데이터 (제주테크노파크 그린에너지팀 실증 장비 및 배터리 모듈)
  const [assets, setAssets] = useState([
    {
      id: 'JTP-BAT-001',
      name: 'EV 사용후 배터리 팩 (100kWh 급)',
      category: '배터리모듈',
      location: '제주첨단단지 실증동 A구역',
      status: '정상',
      installDate: '2024-03-15',
      warrantyExpiry: '2026-03-15',
      lastCheck: '2026-02-10',
      nextCheck: '2026-06-10',
      specs: 'LiFePO4, 100kWh, 전압 400V',
      history: [
        { date: '2026-02-10', type: '정기점검', note: 'SOC 밸런싱 및 단자 볼트 체결상태 양호' },
        { date: '2025-08-12', type: '수리', note: 'BMS 통신 모듈 펌웨어 업데이트' }
      ]
    },
    {
      id: 'JTP-ESS-002',
      name: '소형 ESS 연계형 충방전기 (50kW)',
      category: '시험장비',
      location: '구좌읍 행원 실증센터',
      status: '점검필요',
      installDate: '2023-11-20',
      warrantyExpiry: '2026-05-20',
      lastCheck: '2025-11-15',
      nextCheck: '2026-05-15',
      specs: 'AC 380V, 3상 4선식, 최대전류 80A',
      history: [
        { date: '2025-11-15', type: '정기점검', note: '냉각 팬 소음 발생 관찰, 필터 청소 완료' }
      ]
    },
    {
      id: 'JTP-INV-003',
      name: '그린수소 연계형 양방향 인버터',
      category: '전력변환장치',
      location: '한림 수소생산기지 연계동',
      status: '정상',
      installDate: '2024-06-01',
      warrantyExpiry: '2027-06-01',
      lastCheck: '2026-01-20',
      nextCheck: '2026-07-20',
      specs: '효율 97.5%, 정격출력 100kW',
      history: [
        { date: '2026-01-20', type: '정기점검', note: '절연저항 측정 정상 (50MΩ 이상)' }
      ]
    },
    {
      id: 'JTP-SEN-004',
      name: '배터리 열화상 모니터링 센서 노드',
      category: '계측장비',
      location: '제주첨단단지 실증동 B구역',
      status: '대여중',
      installDate: '2024-09-10',
      warrantyExpiry: '2026-09-10',
      lastCheck: '2026-02-01',
      nextCheck: '2026-08-01',
      specs: '열화상 해상도 320x240, Wi-Fi 통신',
      history: [
        { date: '2026-02-01', type: '대출', note: '에너지 연구실 외부 실증 현장 반출' }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('전체');
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const [newAsset, setNewAsset] = useState({
    id: `JTP-EQ-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: '배터리모듈',
    location: '',
    status: '정상',
    installDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: '',
    specs: ''
  });

  const [newLog, setNewLog] = useState({
    type: '정기점검',
    note: ''
  });

  const urgentAssets = assets.filter(item => {
    const nextCheckDate = new Date(item.nextCheck);
    const today = new Date();
    const diffDays = Math.ceil((nextCheckDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  });

  const handleAddAsset = (e) => {
    e.preventDefault();
    const created = {
      ...newAsset,
      lastCheck: new Date().toISOString().split('T')[0],
      nextCheck: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
      history: [{ date: new Date().toISOString().split('T')[0], type: '신규등록', note: '초기 자산 등록 완료' }]
    };
    setAssets([created, ...assets]);
    setSelectedAsset(created);
    setIsAddModalOpen(false);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLog.note) return;

    const updatedHistory = [
      { date: new Date().toISOString().split('T')[0], type: newLog.type, note: newLog.note },
      ...selectedAsset.history
    ];

    const updatedAsset = { ...selectedAsset, history: updatedHistory, lastCheck: new Date().toISOString().split('T')[0] };
    setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setSelectedAsset(updatedAsset);
    setNewLog({ type: '정기점검', note: '' });
    setIsLogModalOpen(false);
  };

  const exportToCSV = () => {
    const headers = "자산ID,장비명,분류,위치,상태,설치일,다음점검일\n";
    const rows = assets.map(a => `${a.id},"${a.name}",${a.category},"${a.location}",${a.status},${a.installDate},${a.nextCheck}`).join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `JTP_그린에너지팀_자산목록_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAssets = assets.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '전체' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg text-slate-950 font-bold flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              제주테크노파크 <span className="text-emerald-400 text-sm font-normal px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/50 rounded-full">그린에너지팀</span>
            </h1>
            <p className="text-xs text-slate-400">사용후 배터리 ESS 실증 자산 및 시험 장비 관리 시스템</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm transition border border-slate-600"
          >
            <Download className="w-4 h-4" />
            <span>엑셀(CSV) 다운로드</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>신규 자산 등록</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-800/80 border border-emerald-800/40 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-300">정기 점검 및 유지보수 대상 알림</h3>
                <p className="text-xs text-slate-300">향후 60일 내 점검 일정이 도래하는 실증 자산이 <span className="font-bold text-emerald-400">{urgentAssets.length}건</span> 있습니다.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="자산명 또는 ID 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['전체', '배터리모듈', '시험장비', '전력변환장치', '계측장비'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    filterCategory === cat 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedAsset(item)}
                className={`bg-slate-800 border rounded-xl p-4 cursor-pointer transition hover:border-emerald-500/50 flex flex-col justify-between ${
                  selectedAsset?.id === item.id ? 'border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50' : 'border-slate-700/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">{item.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      item.status === '정상' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      item.status === '점검필요' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-base mb-1">{item.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{item.location}</p>
                </div>
                
                <div className="border-t border-slate-700/60 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>다음 점검: <strong className="text-slate-200">{item.nextCheck}</strong></span>
                  <span className="text-emerald-400 font-medium hover:underline">상세보기 &rarr;</span>
                </div>
              </div>
            ))}
          </div>

        </section>

        <section className="bg-slate-800 border border-slate-700/80 rounded-xl p-5 shadow-md flex flex-col justify-between">
          {selectedAsset ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-slate-700 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedAsset.id}</span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedAsset.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">📍 {selectedAsset.location}</p>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-center">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                  <span className="text-[10px] text-slate-400 mt-1 block">QR 스캔</span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">장비 분류</span>
                  <span className="text-slate-200 font-medium">{selectedAsset.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">최초 설치일</span>
                  <span className="text-slate-200">{selectedAsset.installDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">보증 기간 만료</span>
                  <span className="text-amber-400 font-medium">{selectedAsset.warrantyExpiry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">주요 스펙</span>
                  <span className="text-slate-200">{selectedAsset.specs}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald-400" /> 점검 및 수리 이력
                  </h3>
                  <button 
                    onClick={() => setIsLogModalOpen(true)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-emerald-300 px-2.5 py-1 rounded border border-slate-600 transition"
                  >
                    + 일지 작성
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedAsset.history.map((h, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-400">{h.type}</span>
                        <span className="text-slate-500">{h.date}</span>
                      </div>
                      <p className="text-slate-300">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-20">자산을 선택해주세요.</div>
          )}

          <div className="pt-4 border-t border-slate-700 text-center text-xs text-slate-500">
            제주테크노파크 그린에너지팀 Vibe Coding App v1.0
          </div>
        </section>

      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">신규 실증 장비/배터리 등록</h3>
            <form onSubmit={handleAddAsset} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">장비 ID</label>
                <input 
                  type="text" 
                  value={newAsset.id} 
                  onChange={(e) => setNewAsset({...newAsset, id: e.target.value})}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">장비 및 배터리명</label>
                <input 
                  type="text" 
                  placeholder="예: 리튬인산철 배터리 팩" 
                  value={newAsset.name} 
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">장비 분류</label>
                  <select 
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="배터리모듈">배터리모듈</option>
                    <option value="시험장비">시험장비</option>
                    <option value="전력변환장치">전력변환장치</option>
                    <option value="계측장비">계측장비</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">현재 상태</label>
                  <select 
                    value={newAsset.status}
                    onChange={(e) => setNewAsset({...newAsset, status: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="정상">정상</option>
                    <option value="점검필요">점검필요</option>
                    <option value="대여중">대여중</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">설치 위치</label>
                <input 
                  type="text" 
                  placeholder="예: 제주첨단단지 실증동 A구역" 
                  value={newAsset.location} 
                  onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">보증기간 만료일</label>
                <input 
                  type="date" 
                  value={newAsset.warrantyExpiry} 
                  onChange={(e) => setNewAsset({...newAsset, warrantyExpiry: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">스펙 요약</label>
                <input 
                  type="text" 
                  placeholder="예: 400V, 100kWh" 
                  value={newAsset.specs} 
                  onChange={(e) => setNewAsset({...newAsset, specs: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium text-sm"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLogModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">점검 및 수리 일지 작성</h3>
            <form onSubmit={handleAddLog} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">기록 유형</label>
                <select 
                  value={newLog.type}
                  onChange={(e) => setNewLog({...newLog, type: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="정기점검">정기점검</option>
                  <option value="수리">수리</option>
                  <option value="대출/반납">대출/반납</option>
                  <option value="상태변경">상태변경</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">상세 내용 및 특이사항</label>
                <textarea 
                  rows="4"
                  placeholder="점검 내용 또는 조치 사항을 입력하세요."
                  value={newLog.note} 
                  onChange={(e) => setNewLog({...newLog, note: e.target.value})}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium text-sm"
                >
                  일지 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}