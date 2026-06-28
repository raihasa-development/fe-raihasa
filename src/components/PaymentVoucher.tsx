import React, { useState, useEffect } from "react";

// ─── Dynamic Data Interface ────────────────────────────────────────────────────
export interface PaymentVoucherProps {
  /** Nomor voucher pembayaran, e.g. "001/RAIHASA/VI/2025" */
  voucherNumber: string;
  /** Tanggal pembayaran, e.g. "25 Juni 2025" */
  voucherDate: string;
  /** Nama lengkap penerima pembayaran */
  recipientName: string;
  /** Status/peran penerima, e.g. "Mentor" */
  recipientStatus: string;
  /** Alamat penerima */
  recipientAddress: string;
  /** Nomor telepon penerima */
  recipientPhone: string;
  /** Alamat email penerima */
  recipientEmail: string;
  /** Nomor rekening bank penerima */
  recipientAccountNumber: string;
  /** Nama bank penerima */
  recipientBank: string;
  /** Nama akun/program sesuai perjanjian, e.g. "Mentor Program Beasiswa 2025" */
  accountName: string;
  /** Tanggal perjanjian kerja sama */
  agreementDate: string;
  /** Jumlah unit/sesi (angka), e.g. 4 */
  quantity: number;
  /** Total pembayaran dalam Rupiah (angka), e.g. 500000 */
  totalAmount: number;
  /** Terbilang nominal dalam kata-kata, e.g. "Lima Ratus Ribu Rupiah" */
  amountInWords: string;
  /** URL gambar lampiran (base64 atau path) */
  attachmentImgUrl?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatRupiah = (amount: number): string =>
  "Rp" + amount.toLocaleString("id-ID", { minimumFractionDigits: 0 });

// ─── Component ────────────────────────────────────────────────────────────────
const PaymentVoucher: React.FC<PaymentVoucherProps> = ({
  voucherNumber,
  voucherDate,
  recipientName,
  recipientStatus,
  recipientAddress,
  recipientPhone,
  recipientEmail,
  recipientAccountNumber,
  recipientBank,
  accountName,
  agreementDate,
  quantity,
  totalAmount,
  amountInWords,
  attachmentImgUrl,
}) => {
  const brandColor = "#1b7691";
  const brandColorLight = "#e8f4f8";

  const [logoBase64, setLogoBase64] = useState<string>("/assets/logo.png");
  const [sigBase64, setSigBase64] = useState<string>("/assets/signature.png");

  useEffect(() => {
    fetch("/assets/logo.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => console.error("Error loading logo base64:", err));

    fetch("/assets/signature.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) setSigBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => console.error("Error loading signature base64:", err));
  }, []);

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: "#ffffff",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "11pt",
        color: "#1a1a1a",
        lineHeight: "1.5",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
      className="mx-auto shadow-lg print:shadow-none print:border-none"
    >
      {/* ── Top accent bar ───────────────────────────────────────────────── */}
      <div
        style={{ backgroundColor: brandColor, height: "6px", width: "100%" }}
      />

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div style={{ padding: "36px 48px 40px 48px" }}>

        {/* ── Header: Logo + Document title ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          {/* Logo — resolves from /public/assets/logo.png in Next.js */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={logoBase64}
              alt="Raih Asa Logo"
              style={{ height: "60px", width: "auto", display: "block" }}
            />
          </div>

          {/* Document title block */}
          <div style={{ textAlign: "right", lineHeight: "1.3" }}>
            <div
              style={{
                fontSize: "18pt",
                fontWeight: "700",
                color: brandColor,
                letterSpacing: "-0.02em",
              }}
            >
              BUKTI PEMBAYARAN
            </div>
            <div
              style={{
                fontSize: "11pt",
                fontWeight: "400",
                fontStyle: "italic",
                color: "#64748b",
              }}
            >
              Payment Voucher
            </div>
          </div>
        </div>

        {/* ── Thin gradient rule ────────────────────────────────────────── */}
        <div
          style={{
            height: "2px",
            background: `linear-gradient(to right, ${brandColor}, #e2e8f0)`,
            marginBottom: "20px",
            borderRadius: "2px",
          }}
        />

        {/* ── Voucher meta: No & Tanggal ────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginBottom: "20px",
            backgroundColor: brandColorLight,
            borderLeft: `4px solid ${brandColor}`,
            padding: "10px 16px",
            borderRadius: "0 6px 6px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: "700", color: "#334155", minWidth: "24px" }}>
              No.
            </span>
            <span style={{ color: "#475569" }}>:</span>
            <span style={{ fontWeight: "600", color: brandColor }}>
              {voucherNumber}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: "700", color: "#334155", minWidth: "28px" }}>
              Tgl
            </span>
            <span style={{ color: "#475569" }}>:</span>
            <span style={{ fontWeight: "600", color: brandColor }}>
              {voucherDate}
            </span>
          </div>
        </div>

        {/* ── Payable To section ────────────────────────────────────────── */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "10pt",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#ffffff",
              backgroundColor: brandColor,
              padding: "6px 12px",
              borderRadius: "4px 4px 0 0",
            }}
          >
            Dibayarkan Kepada&nbsp;
            <span style={{ fontStyle: "italic", fontWeight: "400" }}>
              (Payable To)
            </span>
          </div>

          <div
            style={{
              border: `1px solid ${brandColor}`,
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
              padding: "12px 16px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {(
                  [
                    ["Nama", recipientName],
                    ["Status", recipientStatus],
                    ["Alamat", recipientAddress],
                    ["No. Telp", recipientPhone],
                    ["Email", recipientEmail],
                    ["No. Rek", recipientAccountNumber],
                    ["Bank", recipientBank],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "3px 0",
                        width: "90px",
                        color: "#475569",
                        fontWeight: "600",
                        verticalAlign: "top",
                        fontSize: "10.5pt",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: "3px 8px",
                        width: "12px",
                        color: "#94a3b8",
                        verticalAlign: "top",
                      }}
                    >
                      :
                    </td>
                    <td
                      style={{
                        padding: "3px 0",
                        color: "#1e293b",
                        fontWeight: "500",
                        verticalAlign: "top",
                        fontSize: "10.5pt",
                      }}
                    >
                      {value || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Payment Details Table ─────────────────────────────────────── */}
        <div style={{ marginBottom: "6px" }}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "10pt",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#ffffff",
              backgroundColor: brandColor,
              padding: "6px 12px",
              borderRadius: "4px 4px 0 0",
            }}
          >
            Detail Pembayaran
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: `1px solid ${brandColor}`,
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
              overflow: "hidden",
              fontSize: "10.5pt",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e8f4f8" }}>
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontWeight: "700",
                    color: brandColor,
                    borderBottom: `1px solid ${brandColor}`,
                    borderRight: `1px solid ${brandColor}`,
                    width: "65%",
                  }}
                >
                  Keterangan
                </th>
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontWeight: "700",
                    color: brandColor,
                    borderBottom: `1px solid ${brandColor}`,
                    borderRight: `1px solid ${brandColor}`,
                    width: "10%",
                  }}
                >
                  Jumlah
                </th>
                <th
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontWeight: "700",
                    color: brandColor,
                    borderBottom: `1px solid ${brandColor}`,
                    width: "25%",
                  }}
                >
                  Jumlah Terjual
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "10px 12px",
                    borderBottom: `1px solid #cbd5e1`,
                    borderRight: `1px solid ${brandColor}`,
                    verticalAlign: "top",
                  }}
                >
                  <div style={{ fontWeight: "700", marginBottom: "2px" }}>
                    {accountName}
                  </div>
                  <div
                    style={{
                      fontStyle: "italic",
                      color: "#64748b",
                      fontSize: "9.5pt",
                    }}
                  >
                    Sesuai dengan Perjanjian Kerja Sama tertanggal{" "}
                    <span style={{ fontWeight: "600", color: "#475569" }}>
                      {agreementDate}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    borderBottom: `1px solid #cbd5e1`,
                    borderRight: `1px solid ${brandColor}`,
                    fontWeight: "500",
                    verticalAlign: "middle",
                  }}
                >
                  {quantity}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    borderBottom: `1px solid #cbd5e1`,
                    fontWeight: "500",
                    verticalAlign: "middle",
                  }}
                >
                  {formatRupiah(totalAmount)}
                </td>
              </tr>

              {/* Total row */}
              <tr style={{ backgroundColor: brandColorLight }}>
                <td
                  colSpan={2}
                  style={{
                    padding: "10px 12px",
                    fontWeight: "700",
                    borderRight: `1px solid ${brandColor}`,
                    color: "#1e293b",
                  }}
                >
                  Total Pembayaran
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: "700",
                    color: brandColor,
                    fontSize: "11pt",
                  }}
                >
                  {formatRupiah(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Terbilang ─────────────────────────────────────────────────── */}
        <div
          style={{
            marginBottom: "20px",
            padding: "8px 14px",
            backgroundColor: "#f8fafc",
            border: "1px dashed #94a3b8",
            borderRadius: "4px",
            fontSize: "10pt",
          }}
        >
          <span style={{ color: "#475569" }}>Terbilang: </span>
          <span
            style={{
              fontStyle: "italic",
              fontWeight: "600",
              color: "#1e293b",
            }}
          >
            {amountInWords}
          </span>
        </div>

        {/* ── Payment Method ────────────────────────────────────────────── */}
        <div style={{ marginBottom: "16px", fontSize: "10.5pt" }}>
          <span style={{ fontWeight: "700" }}>Metode Pembayaran:</span>{" "}
          <span>Transfer Bank (Bank JAGO) a.n. Shinta Dewi Pramesti</span>
        </div>

        {/* ── Legal disclaimer ──────────────────────────────────────────── */}
        <p
          style={{
            fontSize: "10pt",
            color: "#475569",
            textAlign: "justify",
            marginBottom: "28px",
            lineHeight: "1.6",
          }}
        >
          Dokumen ini berfungsi sebagai bukti bahwa pembayaran telah dilakukan
          oleh{" "}
          <strong style={{ color: "#1e293b" }}>Raih Asa</strong> dan telah
          diterima oleh pihak yang bersangkutan.
        </p>

        {/* ── Signature block ───────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "center", minWidth: "200px" }}>
            <div
              style={{
                fontSize: "10pt",
                color: "#475569",
                marginBottom: "4px",
              }}
            >
              Disiapkan oleh,
            </div>
            <div
              style={{
                fontWeight: "700",
                fontSize: "10pt",
                color: "#1e293b",
                marginBottom: "6px",
              }}
            >
              PIHAK PERTAMA
            </div>

            {/* Signature image — resolves from /public/assets/signature.png */}
            <div
              style={{
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "4px",
              }}
            >
              <img
                src={sigBase64}
                alt="Tanda tangan"
                style={{
                  height: "68px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              style={{
                fontWeight: "700",
                fontSize: "10.5pt",
                color: "#1e293b",
                borderTop: `2px solid ${brandColor}`,
                paddingTop: "6px",
              }}
            >
              Shinta Dewi Pramesti
            </div>
            <div
              style={{
                fontStyle: "italic",
                fontSize: "9.5pt",
                color: "#64748b",
              }}
            >
              Chief Product Officer of Raih Asa
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom accent bar Page 1 ── */}
      <div
        style={{ backgroundColor: brandColor, height: "6px", width: "100%" }}
      />

      {/* ── Page Break ── */}
      <div className="html2pdf__page-break" style={{ pageBreakBefore: "always" }} />

      {/* ── Top accent bar Page 2 ── */}
      <div
        style={{ backgroundColor: brandColor, height: "6px", width: "100%" }}
      />

      {/* ── Page 2: Attachment content area ─────────────────────────────────── */}
      <div style={{ padding: "36px 48px 40px 48px", minHeight: "285mm", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <img
              src={logoBase64}
              alt="Raih Asa Logo"
              style={{ height: "45px", width: "auto", display: "block" }}
            />
          </div>
          <div style={{ textAlign: "right", lineHeight: "1.3" }}>
            <div style={{ fontSize: "12pt", fontWeight: "700", color: brandColor }}>
              LAMPIRAN / ATTACHMENT
            </div>
            <div style={{ fontSize: "9pt", color: "#64748b" }}>
              No. Receipt: {voucherNumber}
            </div>
          </div>
        </div>

        <div
          style={{
            height: "1px",
            backgroundColor: "#e2e8f0",
            marginBottom: "24px",
          }}
        />

        {/* Attachment Image Display */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {attachmentImgUrl ? (
            <div style={{ textAlign: "center", width: "100%" }}>
              <img
                src={attachmentImgUrl}
                alt="Lampiran Bukti"
                style={{
                  maxWidth: "100%",
                  maxHeight: "180mm",
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  display: "inline-block",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "120mm",
                border: "2px dashed #cbd5e1",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                backgroundColor: "#f8fafc",
              }}
            >
              <span style={{ fontSize: "36pt", marginBottom: "12px" }}>📸</span>
              <span style={{ fontWeight: "600" }}>Belum ada bukti lampiran yang diunggah</span>
              <span style={{ fontSize: "9pt", marginTop: "4px" }}>Gunakan form untuk mengunggah gambar/bukti transfer</span>
            </div>
          )}
        </div>

        {/* Legal Disclaimer at bottom of Page 2 */}
        <div style={{ marginTop: "auto", fontSize: "8.5pt", color: "#94a3b8", textAlign: "center", paddingTop: "20px" }}>
          Halaman 2 / 2 — Bukti pembayaran elektronik Raih Asa
        </div>
      </div>

      {/* ── Bottom accent bar Page 2 ── */}
      <div
        style={{ backgroundColor: brandColor, height: "6px", width: "100%" }}
      />
    </div>
  );
};

export default PaymentVoucher;