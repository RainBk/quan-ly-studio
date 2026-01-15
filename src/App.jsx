import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Shirt, Calendar, Users, BarChart3, QrCode, Plus, Image as ImageIcon, X, Printer, Bell, CheckCircle, Trash2, LogOut } from 'lucide-react';
import QRCode from "react-qr-code";
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState('products'); 
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staffs, setStaffs] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // KẾT NỐI DỮ LIỆU
  useEffect(() => {
    const unsubProd = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubBook = onSnapshot(query(collection(db, "bookings"), orderBy("createdAt", "desc")), (s) => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubStaff = onSnapshot(collection(db, "staffs"), (s) => setStaffs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubProd(); unsubBook(); unsubStaff(); };
  }, []);

  // XỬ LÝ ẢNH (Nén ảnh thông minh)
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        }
      };
    });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const loadToast = toast.loading("Đang xử lý ảnh...");
      setIsUploading(true);
      try {
        const compressed = await resizeImage(file);
        setSelectedItem({ ...selectedItem, image: compressed });
        toast.dismiss(loadToast);
        toast.success("Ảnh đã sẵn sàng!");
      } catch (error) {
        toast.error("Lỗi ảnh!");
      }
      setIsUploading(false);
    }
  };

  // LƯU DỮ LIỆU
  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    let data = { createdAt: Date.now() };
    const loadToast = toast.loading("Đang lưu lên hệ thống...");

    try {
        if (modalType === 'products') {
            data = { ...data, name: form.name.value, category: form.category.value, price: Number(form.price.value), status: form.status.value, image: selectedItem?.image || '' };
            await addDoc(collection(db, "products"), data);
        } else if (modalType === 'bookings') {
            data = { ...data, customer: form.customer.value, phone: form.phone.value, date: form.date.value, type: form.type.value, total: Number(form.total.value), deposit: Number(form.deposit.value), status: 'pending' };
            await addDoc(collection(db, "bookings"), data);
        } else if (modalType === 'staff') {
            data = { ...data, name: form.name.value, role: form.role.value, salary: Number(form.salary.value), commission: Number(form.commission.value) };
            await addDoc(collection(db, "staffs"), data);
        }
        setShowModal(false); 
        setSelectedItem(null); 
        toast.dismiss(loadToast);
        toast.success("Thành công! 🎉");
    } catch (err) {
        toast.dismiss(loadToast);
        toast.error("Lỗi: " + err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden text-sm md:text-base select-none">
      <Toaster position="top-center" />
      
      {/* MENU ĐIỀU HƯỚNG */}
      <div className="fixed bottom-0 w-full bg-white border-t flex justify-around p-2 z-50 md:static md:w-24 md:flex-col md:justify-start md:h-full md:pt-10 md:border-r shadow-[0_-5px_10px_rgba(0,0,0,0.05)] md:shadow-none pb-safe">
        {['products', 'bookings', 'staff', 'finance'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${activeTab===tab ? 'text-blue-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab==='products' && <Shirt size={24} strokeWidth={activeTab===tab?2.5:2}/>} 
            {tab==='bookings' && <Calendar size={24} strokeWidth={activeTab===tab?2.5:2}/>} 
            {tab==='staff' && <Users size={24} strokeWidth={activeTab===tab?2.5:2}/>} 
            {tab==='finance' && <BarChart3 size={24} strokeWidth={activeTab===tab?2.5:2}/>}
            <span className="text-[9px] font-bold uppercase">{tab}</span>
          </button>
        ))}
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col h-full pb-20 md:pb-0">
        <div className="bg-white px-5 py-4 shadow-sm flex justify-between items-center z-10 sticky top-0 pt-safe-top">
          <h1 className="font-extrabold text-xl text-gray-800 tracking-tight uppercase">Studio Pro</h1>
          <button onClick={() => {setShowModal(true); setModalType(activeTab); setSelectedItem({})}} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition">
            <Plus size={20}/> <span className="hidden sm:inline">Thêm Mới</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          
          {/* TAB 1: KHO HÀNG */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                  <div className="h-44 bg-gray-100 relative">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon/></div>}
                    <button onClick={()=>{setSelectedItem(p); setModalType('qr'); setShowModal(true)}} className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-lg shadow active:scale-90 transition"><QrCode size={18}/></button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 line-clamp-1">{p.name}</h3>
                    <div className="flex justify-between mt-2 items-center">
                        <span className="text-blue-600 font-extrabold">{p.price?.toLocaleString()}đ</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status==='available'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-700'}`}>
                          {p.status==='available'?'Sẵn sàng':'Đang thuê'}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: LỊCH CHỤP */}
          {activeTab === 'bookings' && bookings.map(b => (
            <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
               <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${b.status==='pending'?'bg-orange-400':'bg-green-500'}`}></div>
               <div className="pl-3">
                 <h3 className="font-bold text-gray-800 text-base">{b.customer}</h3>
                 <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium"><Calendar size={12}/> {b.date} • {b.type}</p>
                 <p className="text-xs text-blue-500 mt-1 font-bold">{b.phone}</p>
               </div>
               <div className="text-right">
                 <p className="font-extrabold text-lg text-gray-800">{b.total?.toLocaleString()}đ</p>
                 <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Cọc: {b.deposit?.toLocaleString()}</span>
               </div>
            </div>
          ))}

          {/* TAB 3: NHÂN SỰ */}
          {activeTab === 'staff' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffs.map(s => (
                <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${s.role==='Photo'?'bg-purple-500':s.role==='Makeup'?'bg-pink-500':'bg-blue-500'}`}>
                      {s.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-800">{s.name}</h3>
                      <p className="text-xs uppercase font-bold text-gray-400 mb-1">{s.role}</p>
                      <div className="flex gap-2 text-xs font-medium">
                         <span className="bg-gray-100 px-2 py-0.5 rounded">Lương: {s.salary?.toLocaleString()}</span>
                         <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">HH: {s.commission}%</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
          
          {/* TAB 4: BÁO CÁO */}
          {activeTab === 'finance' && (
             <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4"><BarChart3 size={100}/></div>
                    <h3 className="text-blue-100 uppercase font-bold text-xs tracking-wider mb-2">Tổng Doanh Thu Dự Kiến</h3>
                    <p className="text-4xl font-extrabold tracking-tight">{bookings.reduce((sum, b) => sum + (b.total||0), 0).toLocaleString()} <span className="text-lg opacity-80">VNĐ</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-5 rounded-2xl shadow-sm border text-center">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-1">Đơn Hàng</p>
                      <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                   </div>
                   <div className="bg-white p-5 rounded-2xl shadow-sm border text-center">
                      <p className="text-gray-400 text-xs font-bold uppercase mb-1">Nhân Sự</p>
                      <p className="text-2xl font-bold text-gray-800">{staffs.length}</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* MODAL POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           {modalType === 'qr' && selectedItem ? (
               <div className="bg-white p-8 rounded-3xl w-80 text-center animate-bounce-in shadow-2xl">
                  <h3 className="font-bold text-lg mb-4">{selectedItem.name}</h3>
                  <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl inline-block bg-white">
                    <QRCode value={`SP-${selectedItem.id}`} size={160}/>
                  </div>
                  <button onClick={()=>window.print()} className="w-full bg-blue-600 text-white py-3 rounded-xl mt-6 flex justify-center gap-2 font-bold shadow-lg hover:bg-blue-700"><Printer size={20}/> IN TEM</button>
                  <button onClick={()=>setShowModal(false)} className="mt-4 text-gray-400 text-sm font-medium">Đóng lại</button>
               </div>
           ) : (
               <div className="bg-white p-6 rounded-3xl w-full max-w-md animate-bounce-in relative max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-extrabold text-xl text-gray-800 uppercase">
                        {modalType==='products'?'Nhập Kho':modalType==='bookings'?'Lên Lịch':'Nhân Sự'}
                    </h2>
                    <button onClick={()=>setShowModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200"><X size={20}/></button>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-4">
                     {modalType === 'products' && <>
                        <div className="h-40 border-2 border-dashed border-blue-200 rounded-2xl flex justify-center items-center relative bg-blue-50 group hover:bg-blue-100 transition">
                           {isUploading ? (
                              <div className="text-blue-600 font-bold animate-pulse text-sm">Đang nén ảnh...</div>
                           ) : selectedItem?.image ? (
                              <img src={selectedItem.image} className="h-full w-full object-contain p-2"/>
                           ) : (
                              <div className="text-center text-blue-400">
                                <ImageIcon className="mx-auto mb-2 opacity-50"/>
                                <span className="text-xs font-bold">CHẠM ĐỂ CHỌN ẢNH</span>
                              </div>
                           )}
                           <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                        <input name="name" placeholder="Tên sản phẩm..." required className="w-full bg-gray-50 border-none p-4 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"/>
                        <div className="flex gap-3"><select name="category" className="bg-gray-50 border-none p-4 rounded-xl flex-1 font-medium"><option>Váy cưới</option><option>Vest</option><option>Áo dài</option></select> <input name="price" type="number" placeholder="Giá thuê" className="bg-gray-50 border-none p-4 rounded-xl w-32 font-medium"/></div>
                        <select name="status" className="w-full bg-gray-50 border-none p-4 rounded-xl font-medium"><option value="available">Sẵn sàng sử dụng</option><option value="rented">Đang cho thuê</option></select>
                     </>}

                     {modalType === 'bookings' && <>
                        <input name="customer" placeholder="Tên Khách Hàng" required className="w-full bg-gray-50 border-none p-4 rounded-xl font-medium"/>
                        <input name="phone" placeholder="Số điện thoại" className="w-full bg-gray-50 border-none p-4 rounded-xl font-medium"/>
                        <div className="flex gap-3"><input name="date" type="date" required className="bg-gray-50 border-none p-4 rounded-xl flex-1 font-medium text-gray-500"/> <select name="type" className="bg-gray-50 border-none p-4 rounded-xl font-medium"><option>Cưới</option><option>Kỷ niệm</option></select></div>
                        <div className="flex gap-3"><input name="total" type="number" placeholder="Tổng tiền" className="bg-gray-50 border-none p-4 rounded-xl flex-1 font-medium"/> <input name="deposit" type="number" placeholder="Tiền cọc" className="bg-gray-50 border-none p-4 rounded-xl flex-1 font-medium"/></div>
                     </>}

                     {modalType === 'staff' && <>
                        <input name="name" placeholder="Họ và Tên" required className="w-full bg-gray-50 border-none p-4 rounded-xl font-medium"/>
                        <select name="role" className="w-full bg-gray-50 border-none p-4 rounded-xl font-medium"><option>Photo</option><option>Makeup</option><option>Sale</option></select>
                        <div className="flex gap-3"><input name="salary" type="number" placeholder="Lương cứng" className="bg-gray-50 border-none p-4 rounded-xl flex-1 font-medium"/> <input name="commission" type="number" placeholder="% HH" className="bg-gray-50 border-none p-4 rounded-xl w-24 font-medium"/></div>
                     </>}

                     <button disabled={isUploading} className={`w-full text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 mt-2 transition transform active:scale-95 ${isUploading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {isUploading ? 'ĐANG XỬ LÝ...' : 'LƯU DỮ LIỆU'}
                     </button>
                  </form>
               </div>
           )}
        </div>
      )}
    </div>
  );
}

export default App;