import React, { useState, useRef } from "react";
import { Card, Button } from "@heroui/react";
import Select from "react-select/creatable";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import PaymentVoucher from "../../../components/PaymentVoucher";
import AdminDashboard from "../../../layouts/AdminDashboard";
import withAuth from "../../../components/hoc/withAuth";

const TextInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div className="flex flex-col space-y-1.5 w-full">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1b7691]/20 focus:border-[#1b7691] text-slate-800 text-sm outline-none transition-all shadow-sm font-medium"
    />
  </div>
);

function ReceiptPage() {
  const [selectedEmails, setSelectedEmails] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [mentorsList, setMentorsList] = useState<{
    id: string;
    name: string;
    status: string;
    address: string | null;
    phone: string | null;
    email: string;
    accountNumber: string | null;
    bankName: string | null;
  }[]>([]);

  React.useEffect(() => {
    const loadMentors = async () => {
      try {
        const response = await api.get('/admin/mentors');
        setMentorsList(response.data?.data || []);
      } catch (err) {
        console.error('Failed to load mentors for dropdown:', err);
      }
    };
    loadMentors();
  }, []);

  const emailOptions = mentorsList.map((m) => ({
    label: m.email,
    value: m.email,
  }));

  const [formData, setFormData] = useState({
    voucherNumber: `001/RAIHASA/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    voucherDate: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    recipientName: "",
    recipientStatus: "Mentor",
    recipientAddress: "",
    recipientPhone: "",
    recipientEmail: "",
    recipientAccountNumber: "",
    recipientBank: "Bank JAGO",
    accountName: "Mentor Program Beasiswa 2025",
    agreementDate: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    quantity: 1,
    totalAmount: 500000,
    amountInWords: "Lima Ratus Ribu Rupiah",
    attachmentImgUrl: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          attachmentImgUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (selectedEmails.length === 0) {
      toast.error("Pilih minimal satu email mentor!");
      return;
    }
    if (!formData.recipientName || !formData.totalAmount || !formData.accountName) {
      toast.error("Harap lengkapi data kuitansi yang wajib!");
      return;
    }

    setLoading(true);
    try {
      // 1. Load html2pdf.js dynamically (client-side only)
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = previewRef.current;
      if (!element) {
        toast.error("Preview kuitansi tidak ditemukan.");
        return;
      }

      const opt = {
        margin: 0,
        filename: `Kuitansi-${formData.voucherNumber.replace(/\//g, "-")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const }
      };

      // 2. Generate PDF blob from DOM Element
      const pdfBlob = await html2pdf().from(element).set(opt).output("blob");

      // 3. Put in FormData
      const sendData = new FormData();
      sendData.append("pdf", pdfBlob, `Kuitansi-${formData.voucherNumber.replace(/\//g, "-")}.pdf`);
      sendData.append("emails", JSON.stringify(selectedEmails.map(item => item.value)));
      sendData.append("mentorName", formData.recipientName);
      sendData.append("subject", `[Raih Asa] Honor Mentor & Bukti Pembayaran - [${formData.recipientName}]`);

      // 4. Send to Backend Mail Proxy
      await api.post("/admin/receipts/send-pdf", sendData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      toast.success("Kuitansi PDF berhasil dikirim ke email mentor!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengirim kuitansi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboard withSidebar>
      <div className="max-w-7xl mx-auto p-2 grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-screen">
        {/* Kolom Kiri: Form Input */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Generate & Kirim Receipt</h1>
            <p className="text-sm text-slate-500">Isi detail receipt pembayaran untuk secara otomatis digenerate menjadi PDF dan dikirim via email.</p>
          </div>
          
          <Card className="p-6 border border-slate-200/80 shadow-md space-y-6 bg-white rounded-2xl">
            {/* Auto-fill Mentor Selector */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <label className="text-xs font-bold text-[#1b7691] uppercase tracking-wider flex items-center gap-1.5">
                <span>Pilih Profil Mentor (Auto-fill Form)</span>
              </label>
              <Select
                placeholder="Pilih dari daftar mentor..."
                onChange={(selectedOption: any) => {
                  if (selectedOption) {
                    const mentor = selectedOption.mentor;
                    setFormData((prev) => ({
                      ...prev,
                      recipientName: mentor.name || "",
                      recipientStatus: mentor.status || "Mentor",
                      recipientAddress: mentor.address || "",
                      recipientPhone: mentor.phone || "",
                      recipientEmail: mentor.email || "",
                      recipientAccountNumber: mentor.accountNumber || "",
                      recipientBank: mentor.bankName || "Bank JAGO",
                    }));
                    // Also auto-add email to selected recipient emails
                    const emailExists = selectedEmails.some(item => item.value === mentor.email);
                    if (!emailExists) {
                      setSelectedEmails(prev => [...prev, { label: mentor.email, value: mentor.email }]);
                    }
                  }
                }}
                options={mentorsList.map((m) => ({
                  label: `${m.name} (${m.email})`,
                  value: m.id,
                  mentor: m,
                }))}
                isClearable
                noOptionsMessage={() => "Tidak ada mentor ditemukan"}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pilih / Masukkan Email Mentor Penerima</label>
              <Select
                isMulti
                placeholder="Ketik email baru atau pilih..."
                value={selectedEmails}
                onChange={(newValue) => setSelectedEmails(newValue as any)}
                options={emailOptions}
                noOptionsMessage={() => "Ketik email baru dan tekan Enter..."}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Upload Lampiran / Bukti Transfer (Gambar)
              </label>
              <div className="flex items-center justify-between p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1b7691]/10 file:text-[#1b7691] hover:file:bg-[#1b7691]/20 cursor-pointer"
                />
                {formData.attachmentImgUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, attachmentImgUrl: "" })}
                    className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 transition-all"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Nomor Receipt"
                value={formData.voucherNumber}
                onChange={(val) => setFormData({ ...formData, voucherNumber: val })}
              />
              <TextInput
                label="Tanggal Receipt"
                value={formData.voucherDate}
                onChange={(val) => setFormData({ ...formData, voucherDate: val })}
              />
              <TextInput
                label="Nama Penerima"
                placeholder="Nama Lengkap"
                value={formData.recipientName}
                onChange={(val) => setFormData({ ...formData, recipientName: val })}
              />
              <TextInput
                label="Status/Peran"
                placeholder="Contoh: Mentor"
                value={formData.recipientStatus}
                onChange={(val) => setFormData({ ...formData, recipientStatus: val })}
              />
              <TextInput
                label="Alamat"
                placeholder="Alamat Lengkap"
                value={formData.recipientAddress}
                onChange={(val) => setFormData({ ...formData, recipientAddress: val })}
              />
              <TextInput
                label="No. Telepon"
                placeholder="Contoh: 0812xxxxxxxx"
                value={formData.recipientPhone}
                onChange={(val) => setFormData({ ...formData, recipientPhone: val })}
              />
              <TextInput
                label="Email Penerima"
                placeholder="email@example.com"
                value={formData.recipientEmail}
                onChange={(val) => setFormData({ ...formData, recipientEmail: val })}
              />
              <TextInput
                label="No. Rekening"
                placeholder="Contoh: 1045239401"
                value={formData.recipientAccountNumber}
                onChange={(val) => setFormData({ ...formData, recipientAccountNumber: val })}
              />
              <TextInput
                label="Nama Bank"
                placeholder="Contoh: Bank JAGO"
                value={formData.recipientBank}
                onChange={(val) => setFormData({ ...formData, recipientBank: val })}
              />
              <TextInput
                label="Nama Akun/Program"
                placeholder="Contoh: Mentor Program Beasiswa 2025"
                value={formData.accountName}
                onChange={(val) => setFormData({ ...formData, accountName: val })}
              />
              <TextInput
                label="Tanggal Perjanjian"
                value={formData.agreementDate}
                onChange={(val) => setFormData({ ...formData, agreementDate: val })}
              />
              <TextInput
                type="number"
                label="Quantity (Jumlah Sesi)"
                value={formData.quantity.toString()}
                onChange={(val) => setFormData({ ...formData, quantity: parseInt(val) || 0 })}
              />
              <TextInput
                type="number"
                label="Nominal Pembayaran (IDR)"
                value={formData.totalAmount.toString()}
                onChange={(val) => setFormData({ ...formData, totalAmount: parseInt(val) || 0 })}
              />
              <TextInput
                label="Terbilang"
                placeholder="Contoh: Lima Ratus Ribu Rupiah"
                value={formData.amountInWords}
                onChange={(val) => setFormData({ ...formData, amountInWords: val })}
              />
            </div>

            <Button
              onClick={handleSend}
              color="primary"
              isLoading={loading}
              className="w-full font-bold uppercase tracking-wider py-6 bg-[#1b7691] hover:bg-[#155f78] text-white rounded-xl animate-none"
            >
              Kirim Receipt via Email
            </Button>
          </Card>
        </div>

        {/* Kolom Kanan: Live Preview PDF (A4) */}
        <div className="space-y-4 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-slate-700">Preview Receipt Pembayaran (A4)</h2>
          
          {/* Container for scrolling the A4 preview on screen */}
          <div className="border border-slate-200 rounded-xl bg-slate-200/50 p-4 flex justify-start xl:justify-center overflow-auto max-h-[calc(100vh-140px)] shadow-inner">
            <div ref={previewRef} className="shadow-2xl bg-white flex-shrink-0">
              <PaymentVoucher {...formData} />
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
}

export default withAuth(ReceiptPage, "admin");
