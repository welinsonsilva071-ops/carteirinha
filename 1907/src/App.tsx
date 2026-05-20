import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { 
  CreditCard, 
  Users, 
  Sparkles, 
  TrendingUp, 
  QrCode, 
  Plus, 
  Trash2, 
  Edit, 
  UserCheck, 
  CheckCircle, 
  X, 
  Camera, 
  RotateCw, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Upload, 
  Check, 
  Gift, 
  PhoneCall, 
  ShieldCheck, 
  Coins,
  ArrowRight,
  RefreshCw,
  Building2,
  Lock,
  User,
  MapPin,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
interface Client {
  id: string;
  name: string;
  cpf: string;
  profession: string;
  address: string;
  registrationDate: string;
  plan: "bronze" | "prata" | "ouro";
  photo: string;
  companyName: string;
  isActive: boolean;
}

// Initial Mock Clients with gorgeous royalty-free Unsplash portraits (redefinido como vazio conforme solicitação)
const INITIAL_CLIENTS: Client[] = [];

// Modern professional avatar collection
const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
];

// Dynamic Plan Configurations
const PLAN_CONFIG = {
  bronze: {
    name: "Bronze",
    price: 4.99,
    color: "from-amber-700 via-amber-600 to-amber-900",
    textClass: "text-amber-100",
    borderClass: "border-amber-500",
    badgeBg: "bg-amber-900/60 text-amber-200 border-amber-600",
    glowClass: "glow-bronze",
    cardBg: "#8C5A3C",
    accentLight: "#C68D5F",
    accentDark: "#5C3219",
    discounts: "1% de Desconto",
    benefits: [
      "1% de desconto na Assessoria Administrativa",
      "Suporte via e-mail e chat comercial de segunda a sexta",
      "Benefícios e vantagens básicas no clube de parceiros",
      "Demais vantagens apenas em benefícios de rede conveniada"
    ]
  },
  prata: {
    name: "Prata",
    price: 7.99,
    color: "from-slate-400 via-zinc-200 to-slate-600",
    textClass: "text-slate-100",
    borderClass: "border-slate-300",
    badgeBg: "bg-slate-900/60 text-slate-100 border-slate-400",
    glowClass: "glow-prata",
    cardBg: "#A0A2A6",
    accentLight: "#E1E4E6",
    accentDark: "#737578",
    discounts: "3% de Desconto",
    benefits: [
      "3% de desconto na Assessoria Administrativa",
      "Suporte telefônico e Whatsapp com resposta rápida",
      "Acesso ao clube de parceiros e cupons regionais",
      "Demais vantagens apenas em benefícios de rede conveniada"
    ]
  },
  ouro: {
    name: "Ouro",
    price: 9.99,
    color: "from-yellow-600 via-amber-100 to-yellow-800",
    textClass: "text-yellow-100",
    borderClass: "border-yellow-400",
    badgeBg: "bg-amber-955/80 text-yellow-200 border-yellow-500",
    glowClass: "glow-ouro",
    cardBg: "#BF953F",
    accentLight: "#FCF6BA",
    accentDark: "#B38728",
    discounts: "5% de Desconto",
    benefits: [
      "5% de desconto em QUALQUER serviço ou assessoria",
      "Suporte VIP 24h via telefone prioritário",
      "Acesso ao clube de parceiros nacional com vantagens completas",
      "Prioridade máxima e atendimento personalizado de consultoria"
    ]
  }
};

export default function App() {
  // LocalStorage Persisted States
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem("carteirinha_clients");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as Client[];
      const demoIds = ["CC-90124-BR", "CC-84201-PR", "CC-73199-BZ", "CC-66412-OU"];
      const filtered = parsed.filter(c => !demoIds.includes(c.id));
      if (filtered.length !== parsed.length) {
        localStorage.setItem("carteirinha_clients", JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  });

  const [companyName, setCompanyName] = useState(() => {
    const saved = localStorage.getItem("carteirinha_company");
    if (!saved || saved === "Sua Empresa Club" || saved === "Sua Empresa" || saved === "InovaTech Soluções") {
      localStorage.setItem("carteirinha_company", "ASSESSORIA ADMINISTRATIVA");
      return "ASSESSORIA ADMINISTRATIVA";
    }
    return saved;
  });

  // App Navigation state
  const [activeTab, setActiveTab] = useState<"dashboard" | "criador" | "clientes" | "validador" | "beneficios">("dashboard");

  // Filter States inside Client Directory
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "bronze" | "prata" | "ouro">("all");

  // Create/Edit Card Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    cpf: "",
    profession: "",
    address: "",
    registrationDate: new Date().toISOString().split("T")[0],
    plan: "bronze" as "bronze" | "prata" | "ouro",
    photo: AVATAR_OPTIONS[0],
    isActive: true
  });

  // Editor modes: "create" or "edit"
  const [isEditMode, setIsEditMode] = useState(false);

  // Active Viewing Client for detail cards or PDF printing
  const [viewingClient, setViewingClient] = useState<Client | null>(() => {
    const saved = localStorage.getItem("carteirinha_clients");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved) as Client[];
      const demoIds = ["CC-90124-BR", "CC-84201-PR", "CC-73199-BZ", "CC-66412-OU"];
      const filtered = parsed.filter(c => !demoIds.includes(c.id));
      return filtered.length > 0 ? filtered[0] : null;
    } catch {
      return null;
    }
  });
  const [isFlipped, setIsFlipped] = useState(false); // Frontend 3D rotating state
  const [isGenerating, setIsGenerating] = useState(false);

  // Camera module state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Interactive Validation Terminal Scanner emulator
  const [enteredId, setEnteredId] = useState("");
  const [scanResult, setScanResult] = useState<{
    status: "success" | "error" | "idle";
    message: string;
    client?: Client;
  }>({ status: "idle", message: "" });

  const [notifications, setNotifications] = useState<{ id: string; text: string; type: "success" | "info" }[]>([]);

  // Persistent storage sync
  useEffect(() => {
    localStorage.setItem("carteirinha_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("carteirinha_company", companyName);
  }, [companyName]);

  // Toast System helper
  const triggerNotification = (text: string, type: "success" | "info" = "success") => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  // Setup form fields auto CPF formatting
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    setFormData((prev) => ({ ...prev, cpf: value.substring(0, 14) }));
  };

  // Client registration actions
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerNotification("Nome do cliente é obrigatório!", "info");
      return;
    }

    if (isEditMode) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === formData.id
            ? { ...c, ...formData, companyName }
            : c
        )
      );
      const updatedClient = { ...formData, companyName };
      setViewingClient(updatedClient);
      triggerNotification(`Carteirinha de ${formData.name} atualizada com sucesso!`);
    } else {
      const newId = `CC-${Math.floor(10000 + Math.random() * 90000)}-${formData.plan.substring(0, 2).toUpperCase()}`;
      const newClient: Client = {
        ...formData,
        id: newId,
        companyName
      };
      setClients((prev) => [newClient, ...prev]);
      setViewingClient(newClient);
      triggerNotification(`Carteirinha de ${formData.name} criada com sucesso!`);
    }

    // Reset Form and go to Dashboard or Directory to preview
    setIsEditMode(false);
    resetForm();
    setActiveTab("dashboard");
  };

  const startEditClient = (client: Client) => {
    setFormData({
      id: client.id,
      name: client.name,
      cpf: client.cpf,
      profession: client.profession,
      address: client.address,
      registrationDate: client.registrationDate,
      plan: client.plan,
      photo: client.photo,
      isActive: client.isActive
    });
    setViewingClient(client);
    setIsEditMode(true);
    setActiveTab("criador");
    triggerNotification("Dados carregados no formulário de edição.", "info");
  };

  const deleteClient = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir permanentemente a carteirinha de ${name}?`)) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      triggerNotification(`Carteirinha de ${name} excluída.`, "info");
      if (viewingClient?.id === id) {
        setViewingClient(clients.find((c) => c.id !== id) || null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      cpf: "",
      profession: "",
      address: "",
      registrationDate: new Date().toISOString().split("T")[0],
      plan: "bronze",
      photo: AVATAR_OPTIONS[0],
      isActive: true
    });
    setIsEditMode(false);
  };

  // Webcam actions
  const startCamera = async () => {
    setCameraError("");
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error(err);
      setCameraError("Não foi possível acessar a câmera do dispositivo. Certifique-se de dar permissão.");
      setCameraActive(false);
    }
  };

  const snapPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Center crop to make square photo
        const video = videoRef.current;
        const size = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setFormData((prev) => ({ ...prev, photo: dataUrl }));
        stopCamera();
        triggerNotification("Foto capturada com sucesso!");
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Custom File Photo Uploader for Client Image 
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
        triggerNotification("Foto carregada com sucesso do arquivo computador.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Financial Dashboard calculation variables
  const countBronze = clients.filter((c) => c.plan === "bronze" && c.isActive).length;
  const countPrata = clients.filter((c) => c.plan === "prata" && c.isActive).length;
  const countOuro = clients.filter((c) => c.plan === "ouro" && c.isActive).length;
  const totalRevenue = (countBronze * PLAN_CONFIG.bronze.price) + (countPrata * PLAN_CONFIG.prata.price) + (countOuro * PLAN_CONFIG.ouro.price);

  // Verification QR simulation search action
  const handleVerifyClient = (idToVerify: string) => {
    const rawId = idToVerify.trim();
    if (!rawId) {
      setScanResult({ status: "error", message: "Insira o ID da carteirinha para consultar." });
      return;
    }

    const found = clients.find((c) => c.id.toLowerCase() === rawId.toLowerCase() || c.cpf.replace(/\D/g, "") === rawId.replace(/\D/g, ""));
    if (found) {
      if (found.isActive) {
        setScanResult({
          status: "success",
          message: "Carteirinha consultada com sucesso!",
          client: found
        });
        triggerNotification(`Validação bem sucedida: ${found.name}`);
      } else {
        setScanResult({
          status: "error",
          message: `O cliente ${found.name} foi encontrado, mas a carteirinha está INATIVA.`,
          client: found
        });
      }
    } else {
      setScanResult({
        status: "error",
        message: "Carteira inválida ou documento não registrado no sistema."
      });
    }
  };

  // Generate high-fidelity client-side canvas of Card FRONT or BACK
  const generateCardOnCanvas = (client: Client, side: "front" | "back"): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      // HD ISO ID-1 proportions scaled to 1012x638
      canvas.width = 1012;
      canvas.height = 638;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(canvas);
        return;
      }

      // Background Solid Color matching Card design (high-contrast flat solid premium color)
      let solidBg = "#8C5A3C"; // Default bronze
      if (client.plan === "ouro") {
        solidBg = "#A37E2C"; // Premium rich flat gold (high contrast backplate)
      } else if (client.plan === "prata") {
        solidBg = "#717478"; // Crisp solid silver-slate (high contrast backplate)
      } else {
        solidBg = "#7D4E31"; // Solid bronze-chocolate
      }

      // Round rect card base
      ctx.fillStyle = solidBg;
      ctx.beginPath();
      ctx.roundRect(0, 0, 1012, 638, 30);
      ctx.fill();

      // Inner subtle border line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(20, 20, 972, 598, 20);
      ctx.stroke();

      if (side === "front") {
        // FRONT OF THE CARD
        // Company brand logo/text
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;
        let compSize = 34;
        const compName = (client.companyName || companyName || "ASSESSORIA ADMINISTRATIVA").toUpperCase();
        if (compName.length > 25) compSize = 25;
        if (compName.length > 35) compSize = 18;
        ctx.font = `bold ${compSize}px Helvetica, Arial, sans-serif`;
        ctx.fillText(compName, 50, 70);

        // Company CNPJ below the name
        ctx.fillStyle = "#FFE082"; // High visibility amber-gold for contrast
        ctx.font = "bold 15px Helvetica, Arial, sans-serif";
        ctx.fillText("CNPJ: 65.546.306/0001-93", 50, 98);

        // Reset shadows for next drawings
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Plan Badge
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.roundRect(740, 35, 220, 50, 10);
        ctx.fill();

        // Golden or white plan detail text
        ctx.fillStyle = client.plan === "ouro" ? "#FBBF24" : "#FFFFFF";
        ctx.font = "bold 18px Helvetica, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`PLANO ${client.plan.toUpperCase()}`, 850, 67);
        ctx.textAlign = "left"; // reset

        // Photo Portrait
        const imgPhoto = new Image();
        imgPhoto.crossOrigin = "anonymous";
        imgPhoto.src = client.photo;
        imgPhoto.onload = () => {
          // Circle portrait setup
          ctx.save();
          ctx.beginPath();
          ctx.arc(170, 310, 100, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(imgPhoto, 70, 210, 200, 200);
          ctx.restore();

          // Border around photo
          ctx.strokeStyle = client.plan === "ouro" ? "#FCF6BA" : "#FFFFFF";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(170, 310, 100, 0, Math.PI * 2);
          ctx.stroke();

          // Micro Chip Indicator / shield icon
          ctx.fillStyle = "#FBBF24"; // amber 450/400
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(245, 385, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw protective shield checkmark symbol on canvas
          ctx.fillStyle = "#000000";
          ctx.font = "bold 20px Helvetica, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("✓", 245, 392);
          ctx.textAlign = "left";

          // Text shadow for ultimate legibility on dark flat colors
          ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 15px Helvetica, Arial, sans-serif";
          ctx.fillText("NOME DO TITULAR", 320, 190);

          ctx.fillStyle = "#FFFFFF";
          let fontSize = 34;
          if (client.name.length > 25) fontSize = 28;
          if (client.name.length > 32) fontSize = 22;
          ctx.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`;
          ctx.fillText(client.name, 320, 235);

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 15px Helvetica, Arial, sans-serif";
          ctx.fillText("PROFISSÃO / CARGO", 320, 290);

          ctx.fillStyle = "#FFFFFF";
          let profSize = 22;
          const profText = client.profession || "Membro Oficial";
          if (profText.length > 25) profSize = 18;
          if (profText.length > 35) profSize = 14;
          ctx.font = `bold ${profSize}px Helvetica, Arial, sans-serif`;
          ctx.fillText(profText, 320, 320);

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 15px Helvetica, Arial, sans-serif";
          ctx.fillText("DOCUMENTO (CPF)", 320, 375);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 22px Helvetica, Arial, sans-serif";
          ctx.fillText(client.cpf || "000.000.000-00", 320, 405);

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 15px Helvetica, Arial, sans-serif";
          ctx.fillText("ENDEREÇO REGISTRADO", 320, 451);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          const addrTextFront = client.address || "Não informado";
          const wordsFront = addrTextFront.split(" ");
          let lineFront = "";
          let yFront = 478;
          for (let n = 0; n < wordsFront.length; n++) {
            const testLine = lineFront + wordsFront[n] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 510 && n > 0) {
              ctx.fillText(lineFront.trim(), 320, yFront);
              lineFront = wordsFront[n] + " ";
              yFront += 24;
            } else {
              lineFront = testLine;
            }
          }
          ctx.fillText(lineFront.trim(), 320, yFront);

          // Reset shadows for bottom elements
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Bottom bar meta row
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
          ctx.fillRect(20, 538, 972, 80);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Helvetica, Arial, sans-serif";
          ctx.fillText("ID CARTEIRINHA", 50, 565);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          ctx.fillText(client.id, 50, 595);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Helvetica, Arial, sans-serif";
          ctx.fillText("DATA INSCRIÇÃO", 350, 565);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          ctx.fillText(new Date(client.registrationDate).toLocaleDateString("pt-BR"), 350, 595);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Helvetica, Arial, sans-serif";
          ctx.fillText("STATUS ASSINATURA", 650, 565);
          ctx.fillStyle = "#4ADE80"; // Bright Emerald
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          ctx.fillText(client.isActive ? "MEMBRO ATIVO" : "INATIVO", 650, 595);

          // Print QR Code dynamically in Front Right (Bottom Bar / Footer)
          const qrImage = new Image();
          qrImage.crossOrigin = "anonymous";
          qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(client.id)}`;
          qrImage.onload = () => {
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.roundRect(892, 543, 70, 70, 8);
            ctx.fill();

            ctx.drawImage(qrImage, 897, 548, 60, 60);

            resolve(canvas);
          };
          qrImage.onerror = () => {
            resolve(canvas); // Fallback if QR fails
          };
        };
        
        imgPhoto.onerror = () => {
          // Fallback drawing if avatar fails load
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(170, 310, 100, 0, Math.PI * 2);
          ctx.fill();
          
          // Shadows for text
          ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 16px Helvetica, Arial, sans-serif";
          ctx.fillText("NOME DO TITULAR", 320, 190);

          ctx.fillStyle = "#FFFFFF";
          let fontSizeErr = 34;
          if (client.name.length > 25) fontSizeErr = 28;
          if (client.name.length > 32) fontSizeErr = 22;
          ctx.font = `bold ${fontSizeErr}px Helvetica, Arial, sans-serif`;
          ctx.fillText(client.name, 320, 235);

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 15px Helvetica, Arial, sans-serif";
          ctx.fillText("PROFISSÃO / CARGO", 320, 290);

          ctx.fillStyle = "#FFFFFF";
          let profSizeErr = 22;
          const profTextErr = client.profession || "Membro Oficial";
          if (profTextErr.length > 25) profSizeErr = 18;
          if (profTextErr.length > 35) profSizeErr = 14;
          ctx.font = `bold ${profSizeErr}px Helvetica, Arial, sans-serif`;
          ctx.fillText(profTextErr, 320, 320);

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 15px Helvetica, Arial, sans-serif";
          ctx.fillText("DOCUMENTO (CPF)", 320, 375);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 22px Helvetica, Arial, sans-serif";
          ctx.fillText(client.cpf || "000.000.000-00", 320, 405);

          ctx.fillStyle = client.plan === "ouro" ? "#FCE38A" : "#FFFFFF";
          ctx.font = "bold 15px Helvetica, Arial, sans-serif";
          ctx.fillText("ENDEREÇO REGISTRADO", 320, 451);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          const addrTextBack = client.address || "Não informado";
          const wordsBack = addrTextBack.split(" ");
          let lineBack = "";
          let yBack = 478;
          for (let n = 0; n < wordsBack.length; n++) {
            const testLine = lineBack + wordsBack[n] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 510 && n > 0) {
              ctx.fillText(lineBack.trim(), 320, yBack);
              lineBack = wordsBack[n] + " ";
              yBack += 24;
            } else {
              lineBack = testLine;
            }
          }
          ctx.fillText(lineBack.trim(), 320, yBack);

          // Reset shadows
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Bottom bar
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
          ctx.fillRect(20, 538, 972, 80);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Helvetica, Arial, sans-serif";
          ctx.fillText("ID CARTEIRINHA", 50, 565);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          ctx.fillText(client.id, 50, 595);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Helvetica, Arial, sans-serif";
          ctx.fillText("DATA INSCRIÇÃO", 350, 565);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          ctx.fillText(new Date(client.registrationDate).toLocaleDateString("pt-BR"), 350, 595);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 14px Helvetica, Arial, sans-serif";
          ctx.fillText("STATUS ASSINATURA", 650, 565);
          ctx.fillStyle = "#4ADE80";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          ctx.fillText(client.isActive ? "MEMBRO ATIVO" : "INATIVO", 650, 595);

          // QR code image fallback load
          const qrImage = new Image();
          qrImage.crossOrigin = "anonymous";
          qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(client.id)}`;
          qrImage.onload = () => {
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.roundRect(892, 543, 70, 70, 8);
            ctx.fill();
            ctx.drawImage(qrImage, 897, 548, 60, 60);
            resolve(canvas);
          };
          qrImage.onerror = () => {
            resolve(canvas);
          };
        };
      } else {
        // BACK OF THE CARD
        // Dark Magnetic Stripe
        ctx.fillStyle = "#111111";
        ctx.fillRect(20, 50, 972, 100);

        // Signature Container Strip - solid high contrast white pen box
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(50, 200, 650, 70, 8);
        ctx.fill();
        ctx.stroke();

        // Label above signature box
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 13px Helvetica, Arial, sans-serif";
        ctx.fillText("ASSINATURA AUTORIZADA DO TITULAR", 50, 185);

        // Handwritten style pen signature - solid navy blue pen color with dynamic size scale
        let sigFontSize = 32;
        ctx.font = `italic bold ${sigFontSize}px 'Georgia', serif`;
        let sigTextWidth = ctx.measureText(client.name).width;
        while (sigTextWidth > 580 && sigFontSize > 14) {
          sigFontSize -= 2;
          ctx.font = `italic bold ${sigFontSize}px 'Georgia', serif`;
          sigTextWidth = ctx.measureText(client.name).width;
        }
        ctx.fillStyle = "#1A365D"; // Dark blue ink
        ctx.textBaseline = "middle";
        ctx.fillText(client.name, 80, 235);
        ctx.textBaseline = "alphabetic"; // Restore default baseline

        // CVV Box
        ctx.fillStyle = "#111111";
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(730, 200, 220, 70, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px Helvetica, Arial, sans-serif";
        ctx.fillText("CVV SEGURANÇA", 730, 185);

        ctx.fillStyle = "#FBBF24"; // Amber 400
        ctx.font = "bold 22px Helvetica, Arial, sans-serif";
        ctx.fillText(`CVV 821`, 775, 242);

        // Dynamic Benefits text block
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)"; // High contrast backplate
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.roundRect(50, 310, 912, 180, 15);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FBBF24"; // gold/amber headline
        ctx.font = "bold 18px Helvetica, Arial, sans-serif";
        ctx.fillText(`BENEFÍCIOS ATIVOS DO PLANO ${PLAN_CONFIG[client.plan].name.toUpperCase()}`, 75, 345);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 15px Helvetica, Arial, sans-serif";
        // Draw details list
        const details = [
          `• Desconto especial de ${PLAN_CONFIG[client.plan].discounts} em serviços`,
          `• ${PLAN_CONFIG[client.plan].benefits[1]}`,
          `• Apresente este cartão digital para validação física imediata via QR Code.`
        ];
        details.forEach((line, index) => {
          ctx.fillText(line, 75, 385 + (index * 32));
        });

        // Terms of use footer metadata details
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px Helvetica, Arial, sans-serif";
        const tc = "Este documento é pessoal e de uso intransferível para o titular. Válido enquanto a assinatura estiver regularizada.";
        
        // Print with wrapping constraint to prevent overlapping with the barcode box
        const wordsTc = tc.split(" ");
        let lineTc = "";
        let yTc = 540;
        for (let n = 0; n < wordsTc.length; n++) {
          const testLine = lineTc + wordsTc[n] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 640 && n > 0) {
            ctx.fillText(lineTc.trim(), 50, yTc);
            lineTc = wordsTc[n] + " ";
            yTc += 18;
          } else {
            lineTc = testLine;
          }
        }
        ctx.fillText(lineTc.trim(), 50, yTc);

        // Barcode Container Box (Solid white background rectangle for scanner readability)
        const barBoxX = 720;
        const barBoxY = 510;
        const barBoxW = 242;
        const barBoxH = 85;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(barBoxX, barBoxY, barBoxW, barBoxH, 8);
        ctx.fill();

        // Barcode simulated drawing inside white box (drawn in high-contrast solid BLACK)
        const startX = barBoxX + 25; // center-aligned simulation within box padding
        const startY = barBoxY + 12;
        const heights = 40;
        ctx.fillStyle = "#000000"; // Solid black lines

        // Render beautiful stripes of variables widths
        const widths = [3, 5, 2, 4, 1, 6, 2, 5, 2, 3, 1, 5, 2, 4, 1, 6, 2, 5, 2, 3, 1, 5, 2, 4, 1, 6];
        let currentX = startX;
        widths.forEach((w) => {
          ctx.fillRect(currentX, startY, w, heights);
          currentX += w + 2;
        });

        // Barcode number text inside white box in dark solid black
        ctx.fillStyle = "#000000";
        ctx.font = "bold 13px Helvetica, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("8291038 901242", barBoxX + (barBoxW / 2), barBoxY + 70);
        ctx.textAlign = "left"; // Restore default

        resolve(canvas);
      }
    });
  };

  // Download card as PDF (ISO ID-1 credit card size: 2 pages)
  const downloadCardAsPdfDoubleSided = async (client: Client) => {
    setIsGenerating(true);
    triggerNotification("Renderizando PDF de Cartão (Frente e Verso)...");
    try {
      const frontCanvas = await generateCardOnCanvas(client, "front");
      const backCanvas = await generateCardOnCanvas(client, "back");
      
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.98]
      });
      
      // Page 1: Front
      const frontImg = frontCanvas.toDataURL("image/png");
      doc.addImage(frontImg, "PNG", 0, 0, 85.6, 53.98);
      
      // Page 2: Back
      doc.addPage([85.6, 53.98], "landscape");
      const backImg = backCanvas.toDataURL("image/png");
      doc.addImage(backImg, "PNG", 0, 0, 85.6, 53.98);
      
      doc.save(`carteirinha-${client.name.replace(/\s+/g, "-").toLowerCase()}-tamanho-real.pdf`);
      triggerNotification("PDF tamanho real de cartão baixado com sucesso!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      triggerNotification("Erro ao gerar PDF do cartão.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download card positioned on standard A4 portrait sheet for easy printing
  const downloadCardAsPdfA4Printable = async (client: Client) => {
    setIsGenerating(true);
    triggerNotification("Preparando folha A4 com gabaritos reais...");
    try {
      const frontCanvas = await generateCardOnCanvas(client, "front");
      const backCanvas = await generateCardOnCanvas(client, "back");
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Header branding
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // zinc-800
      doc.text((client.companyName || companyName || "MemberPro").toUpperCase(), 105, 30, { align: "center" });
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // zinc-500
      doc.text("GABARITO DE IMPRESSÃO - CARTEIRINHA EM TAMANHO REAL", 105, 38, { align: "center" });
      doc.text("Imprima em escala 100% (Sem margem ou ajuste de tamanho) para obter as dimensões padrão (85.6 x 54mm).", 105, 44, { align: "center" });
      
      const cardW = 85.6;
      const cardH = 53.98;
      const paddingX = 12;
      
      const startXF = 105 - cardW - (paddingX / 2);
      const startXB = 105 + (paddingX / 2);
      const startY = 70;
      
      // Front image placement
      const frontImg = frontCanvas.toDataURL("image/png");
      doc.addImage(frontImg, "PNG", startXF, startY, cardW, cardH);
      
      // Back image placement
      const backImg = backCanvas.toDataURL("image/png");
      doc.addImage(backImg, "PNG", startXB, startY, cardW, cardH);
      
      // Thin guideline border
      doc.setDrawColor(210, 215, 223);
      doc.rect(startXF - 0.2, startY - 0.2, cardW + 0.4, cardH + 0.4, "S");
      doc.rect(startXB - 0.2, startY - 0.2, cardW + 0.4, cardH + 0.4, "S");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text("FRENTE DO CARTÃO (85.6 x 54mm)", 105 - (cardW / 2) - 6, startY + cardH + 8, { align: "center" });
      doc.text("VERSO DO CARTÃO (85.6 x 54mm)", 105 + (cardW / 2) + 6, startY + cardH + 8, { align: "center" });
      
      // Instructions block
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const instructionsY = startY + cardH + 25;
      doc.text("Manual de Confecção Física:", 30, instructionsY);
      doc.setFont("Helvetica", "normal");
      doc.text("1. Imprima este gabarito em um papel mais espesso de alta qualidade (gramatura 180g ou superior).", 35, instructionsY + 8);
      doc.text("2. Use um estilete com régua metálica ou tesoura afiada para cortar nos limites pontilhados.", 35, instructionsY + 14);
      doc.text("3. Aplique adesivo ou cola entre as costas das duas faces para uní-las em um único cartão rígido.", 35, instructionsY + 20);
      doc.text("4. Plastifique (Lamine) o papel com polaseal ou use protetores de PVC rígidos transparentes.", 35, instructionsY + 26);
      
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`ID Membro: ${client.id} | Titular: ${client.name} | Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 105, 275, { align: "center" });

      doc.save(`carteirinha-${client.name.replace(/\s+/g, "-").toLowerCase()}-gabarito-a4.pdf`);
      triggerNotification("Gabarito de impressão A4 baixado com sucesso!");
    } catch (error) {
      console.error("A4 print generation failed:", error);
      triggerNotification("Erro ao processar gabarito de impressão.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download a single side as high definition PNG
  const downloadSingleSideImage = async (client: Client, side: "front" | "back") => {
    setIsGenerating(true);
    triggerNotification(`Preparando imagem da ${side === "front" ? "Frente" : "Verso"}...`);
    try {
      const canvas = await generateCardOnCanvas(client, side);
      const link = document.createElement("a");
      link.download = `carteirinha-${client.name.replace(/\s+/g, "-").toLowerCase()}-${side === "front" ? "frente" : "verso"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      triggerNotification(`Imagem do ${side === "front" ? "frente" : "verso"} baixada com sucesso!`);
    } catch (e) {
      console.error(e);
      triggerNotification("Erro ao processar imagem.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download both sides merged together side-by-side in high definition
  const downloadBothSidesCombinedImage = async (client: Client) => {
    setIsGenerating(true);
    triggerNotification("Preparando imagem combinada Frente + Verso...");
    try {
      const frontCanvas = await generateCardOnCanvas(client, "front");
      const backCanvas = await generateCardOnCanvas(client, "back");
      
      const combinedCanvas = document.createElement("canvas");
      // Side-by-side: (1012 * 2) + 40 width, 638 height
      combinedCanvas.width = 2064;
      combinedCanvas.height = 638;
      const ctx = combinedCanvas.getContext("2d");
      if (!ctx) return;
      
      // Dark premium canvas background block
      ctx.fillStyle = "#0c0c0e";
      ctx.fillRect(0, 0, 2064, 638);
      
      // Draw Front side on Left
      ctx.drawImage(frontCanvas, 0, 0);
      
      // Draw Back side on Right
      ctx.drawImage(backCanvas, 1052, 0);
      
      const link = document.createElement("a");
      link.download = `carteirinha-${client.name.replace(/\s+/g, "-").toLowerCase()}-frente-verso.png`;
      link.href = combinedCanvas.toDataURL("image/png");
      link.click();
      triggerNotification("Imagem combinada Frente e Verso baixada com sucesso!");
    } catch (e) {
      console.error(e);
      triggerNotification("Erro ao processar imagem combinada.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none font-sans">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-start gap-3 pointer-events-auto border ${
                n.type === "success" 
                  ? "bg-[#0b0c10]/95 text-white border-emerald-500/40 shadow-emerald-950/20" 
                  : "bg-[#0b0c10]/95 text-white border-amber-500/40 shadow-amber-950/20"
              }`}
            >
              <div className={`p-1 rounded-lg ${n.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs font-bold uppercase tracking-wider pr-4">{n.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header bar */}
      <header className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 no-print" id="header_main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(251,191,36,0.25)]">
              <CreditCard className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                MEMBER<span className="text-amber-400">PRO</span>
                <span className="text-[10px] font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  v2.5 PRO
                </span>
              </h1>
              <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest leading-none mt-1">Gestão e Emissão de Carteirinhas Premium</p>
            </div>
          </div>

          {/* Quick Config / Company Customization name */}
          <div className="flex items-center gap-3 w-full md:w-auto bg-white/5 p-2 rounded-xl border border-white/10 focus-within:border-amber-400/50 transition-all">
            <Building2 className="w-4 h-4 text-white/40 ml-1.5" />
            <input
              id="company_name_input"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ASSESSORIA ADMINISTRATIVA"
              className="bg-transparent text-sm font-semibold tracking-wide text-white placeholder-white/30 focus:outline-none w-48 border-b border-transparent focus:border-amber-400 px-1 py-0.5 transition-all"
              title="Personalize o nome da empresa exibido nas carteirinhas"
            />
            <span className="text-[10px] uppercase font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 ml-1 px-2.5 py-0.5 rounded cursor-help" title="Edite este nome para alterar instantaneamente o topo de todas as carteirinhas!">
              Empresa
            </span>
          </div>
        </div>
      </header>

      {/* Primary Grid Layout Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        
        {/* Print Only Header Mode */}
        {viewingClient && (
          <div className="hidden print:block print:p-0 my-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-extrabold text-black">{companyName.toUpperCase()}</h1>
              <p className="text-sm text-slate-500">Carteira Oficial do Assistente/Clube de Benefícios</p>
            </div>
          </div>
        )}

        {/* Tab Navigation links */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 border-b border-white/10 no-print" id="navigation_tabs">
          <button
            id="tab_btn_dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "text-white/60 bg-white/5 border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Painel Geral
          </button>
          <button
            id="tab_btn_criador"
            onClick={() => setActiveTab("criador")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === "criador"
                ? "bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "text-white/60 bg-white/5 border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {isEditMode ? "Editar Carteirinha" : "Criar Carteirinha"}
          </button>
          <button
            id="tab_btn_clientes"
            onClick={() => setActiveTab("clientes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === "clientes"
                ? "bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "text-white/60 bg-white/5 border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Diretório ({clients.length})
          </button>
          <button
            id="tab_btn_validador"
            onClick={() => setActiveTab("validador")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
              activeTab === "validador"
                ? "bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "text-white/60 bg-white/5 border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Validar QR Code
          </button>
          <button
            id="tab_btn_beneficios"
            onClick={() => setActiveTab("beneficios")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap relative border cursor-pointer ${
              activeTab === "beneficios"
                ? "bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "text-white/60 bg-white/5 border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            Preços & Benefícios
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
          </button>
        </div>

        {/* Tab 1: Dashboard Panel */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 no-print animate-fade-in" id="dashboard_panel">
            {/* Upper Metric Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div id="stat_revenue" className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Faturamento Mensal</p>
                  <p className="text-2xl font-black text-emerald-400">
                    R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-white/30 font-semibold">* Recorrente ativo</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Coins className="w-5.5 h-5.5" />
                </div>
              </div>

              <div id="stat_ouro" className="bg-white/5 p-5 rounded-2xl border border-amber-400/30 flex items-center justify-between backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.05)]">
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Plano OURO</p>
                  <p className="text-2xl font-black text-amber-300">{countOuro}</p>
                  <p className="text-[9px] text-white/30 font-semibold">Desconto 35% + VIP 24h</p>
                </div>
                <div className="p-3 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl">
                  <Sparkles className="w-5.5 h-5.5" />
                </div>
              </div>

              <div id="stat_prata" className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Plano PRATA</p>
                  <p className="text-2xl font-black text-white">{countPrata}</p>
                  <p className="text-[9px] text-white/30 font-semibold">Desconto 20% + WhatsApp</p>
                </div>
                <div className="p-3 bg-white/10 text-slate-300 border border-white/10 rounded-xl">
                  <RotateCw className="w-5.5 h-5.5" />
                </div>
              </div>

              <div id="stat_bronze" className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Plano BRONZE</p>
                  <p className="text-2xl font-black text-amber-500">{countBronze}</p>
                  <p className="text-[9px] text-white/30 font-semibold">Desconto 10% + E-mail</p>
                </div>
                <div className="p-3 bg-amber-700/10 text-amber-500 border border-amber-700/20 rounded-xl">
                  <UserCheck className="w-5.5 h-5.5" />
                </div>
              </div>
            </div>

            {/* Split layout: Selected Client Live Preview and Interactive Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: List selection & fast scanner emulator click */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-white text-sm uppercase tracking-wider">Membros Recentes</h2>
                    <button 
                      onClick={() => setActiveTab("clientes")} 
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Ver Todos ({clients.length})
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {clients.length === 0 ? (
                    <div className="text-center py-8 text-white/40 space-y-2">
                      <Users className="w-8 h-8 mx-auto stroke-1" />
                      <p className="text-xs">Nenhum cliente cadastrado ainda.</p>
                      <button
                        onClick={() => setActiveTab("criador")}
                        className="text-xs bg-amber-400/10 border border-amber-400/30 text-amber-400 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-400 hover:text-black transition-all"
                      >
                        Criar Primeira Carteirinha
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {clients.slice(0, 5).map((client) => {
                        const isSelected = viewingClient?.id === client.id;
                        return (
                          <div
                            key={client.id}
                            onClick={() => {
                              setViewingClient(client);
                              setIsFlipped(false);
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? "bg-amber-400/10 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.1)] text-amber-300"
                                : "bg-white/5 border-white/5 hover:border-white/15 text-white/80 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={client.photo}
                                alt={client.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                              />
                              <div className="min-w-0 text-left">
                                <p className="font-semibold text-xs truncate max-w-[120px]">{client.name}</p>
                                <p className="text-[10px] text-white/55 capitalize">{client.profession || "Cliente"}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                                client.plan === "ouro" 
                                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/35" 
                                  : client.plan === "prata"
                                    ? "bg-slate-500/15 text-slate-350 border border-slate-500/35"
                                    : "bg-amber-900/15 text-amber-500 border border-amber-900/35"
                              }`}>
                                {client.plan}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Simulated Business Scanner Quick Link */}
                <div className="bg-gradient-to-tr from-[#141416] to-[#0c0c0c] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-md">
                  <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-4 translate-y-4">
                    <QrCode className="w-32 h-32 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-amber-400 text-left uppercase tracking-wider">Simular Leitura de QR?</h3>
                  <p className="text-xs text-white/60 leading-relaxed text-left">
                    Valide o acesso físico do membro à rede credenciada escaneando o QR Code da carteirinha no terminal integrado.
                  </p>
                  <button
                    onClick={() => {
                      if (viewingClient) {
                        setEnteredId(viewingClient.id);
                        handleVerifyClient(viewingClient.id);
                      }
                      setActiveTab("validador");
                    }}
                    className="w-full text-center bg-amber-400 hover:bg-amber-300 text-black font-black text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                  >
                    Simular Scanner
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive 3D Card Display & Action Panel */}
              <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-6 bg-[radial-gradient(circle_at_50%_50%,_#1f1a14_0%,_#050505_100%)] p-8 rounded-3xl border border-white/10 shadow-[0_45px_90px_rgba(0,0,0,0.9)] relative overflow-hidden min-h-[500px]">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/5 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                {viewingClient ? (
                  <div className="w-full flex flex-col items-center space-y-6 relative z-10 animate-fade-in">
                    <div className="flex items-center justify-between w-full max-w-[410px]">
                      <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                        <span className="text-white/40">Visualizando:</span>
                        <span className="text-amber-400 font-mono font-bold">{viewingClient.id}</span>
                      </h3>
                      
                      {/* Rotate triggers */}
                      <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="text-[10px] uppercase font-bold text-white/70 hover:text-amber-400 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 shadow-2xs transition-all cursor-pointer"
                        title="Toque para ver a frente ou verso da carteirinha física"
                      >
                        <RotateCw className="w-3 h-3" />
                        Girar ({isFlipped ? "Frente" : "Verso"})
                      </button>
                    </div>

                    {/* CPF-Sized Rotatable Card Component */}
                    {/* The proportion is maintained standard ID-1 CPF format: w-[410px] h-[260px] */}
                    <div id="physical_card_component" className="w-full max-w-[410px] h-[260px] cursor-pointer perspective-1000 group">
                      <div 
                        onClick={() => setIsFlipped(!isFlipped)}
                        className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}
                      >
                        {/* -------------------- CARD FRONT -------------------- */}
                        <div className={`absolute inset-0 w-full h-full rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden border ${
                          viewingClient.plan === "ouro"
                            ? "bg-[#A37E2C] text-white border-yellow-400 glow-ouro"
                            : viewingClient.plan === "prata"
                              ? "bg-[#717478] text-white border-zinc-300 glow-prata"
                              : "bg-[#7D4E31] text-white border-amber-600 glow-bronze"
                        }`}>
                          
                          {/* Top row */}
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-1.5">
                              <div className={`p-1 rounded-lg ${viewingClient.plan === "ouro" ? "bg-amber-950/20 text-yellow-300" : "bg-white/20 text-white"}`}>
                                <Building2 className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col items-start leading-[1.1]">
                                <span className="font-extrabold uppercase text-[11px] tracking-wider truncate max-w-[210px] text-shadow text-white">
                                  {viewingClient.companyName || companyName}
                                </span>
                                <span className={`text-[7.5px] font-mono tracking-wider text-shadow ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"}`}>
                                  CNPJ: 65.546.306/0001-93
                                </span>
                              </div>
                            </div>

                            {/* Plan Badge */}
                            <span className={`text-[9.5px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-md border ${
                              viewingClient.plan === "ouro"
                                ? "bg-yellow-900/60 text-yellow-200 border-yellow-300/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                                : viewingClient.plan === "prata"
                                  ? "bg-slate-800 text-slate-100 border-slate-500/40"
                                  : "bg-orange-950/50 text-orange-200 border-amber-600/40"
                            }`}>
                              PLANO {viewingClient.plan.toUpperCase()}
                            </span>
                          </div>

                          {/* Middle Body */}
                          <div className="grid grid-cols-12 gap-3 items-center relative z-10 my-1">
                            {/* Left Side: Avatar Photo */}
                            <div className="col-span-4 flex justify-start">
                              <div className="relative">
                                <img
                                  src={viewingClient.photo}
                                  alt={viewingClient.name}
                                  referrerPolicy="no-referrer"
                                  className="w-[74px] h-[74px] rounded-full object-cover border-2 shadow-inner border-white/90"
                                />
                                {/* Micro Chip Icon Indicator */}
                                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-black p-1 rounded-full border border-white flex items-center justify-center">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Client Info */}
                            <div className="col-span-8 space-y-1 text-left">
                              <div>
                                <p className={`text-[8px] uppercase tracking-wider font-mono ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"} font-bold`}>Nome do Titular</p>
                                <p className="font-black text-sm leading-tight tracking-tight truncate pr-1 text-white">
                                  {viewingClient.name}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <p className={`text-[8px] uppercase tracking-wider font-mono ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"} font-bold`}>Profissão</p>
                                  <p className="text-[10px] font-extrabold truncate leading-tight text-white">
                                    {viewingClient.profession}
                                  </p>
                                </div>
                                <div>
                                  <p className={`text-[8px] uppercase tracking-wider font-mono ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"} font-bold font-bold`}>CPF Titular</p>
                                  <p className="text-[10px] font-extrabold font-mono leading-tight text-white">
                                    {viewingClient.cpf || "000.000.000-00"}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className={`text-[8px] uppercase tracking-wider font-mono ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"} font-bold`}>Endereço</p>
                                <p className="text-[8.5px] font-extrabold leading-tight break-words whitespace-normal text-white" title={viewingClient.address}>
                                  {viewingClient.address}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row */}
                          <div className="flex items-center justify-between border-t border-white/25 pt-1.5 relative z-10 text-left">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <p className={`text-[7.5px] uppercase tracking-wider font-mono ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"} font-bold`}>Identificador</p>
                                <p className="text-[9px] font-extrabold font-mono tracking-wider text-white">{viewingClient.id}</p>
                              </div>
                              <div>
                                <p className={`text-[7.5px] uppercase tracking-wider font-mono ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"} font-bold`}>Inscrição</p>
                                <p className="text-[9px] font-extrabold font-mono text-white">
                                  {new Date(viewingClient.registrationDate).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <div>
                                <p className={`text-[7.5px] uppercase tracking-wider font-mono ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"} font-bold`}>Status</p>
                                <p className="text-[9px] font-extrabold text-emerald-400 flex items-center gap-0.5 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                  ATIVO
                                </p>
                              </div>
                            </div>

                            {/* Small QR Code inside white border box */}
                            <div className="w-14 h-14 bg-white p-1 rounded-lg shadow-sm shrink-0 flex items-center justify-center">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(viewingClient.id)}`}
                                alt="QR Code"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>

                        {/* -------------------- CARD BACK -------------------- */}
                        <div className={`absolute inset-0 w-full h-full rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl backface-hidden rotate-y-180 border ${
                          viewingClient.plan === "ouro"
                            ? "bg-[#A37E2C] text-white border-yellow-400"
                            : viewingClient.plan === "prata"
                              ? "bg-[#717478] text-white border-zinc-300"
                              : "bg-[#7D4E31] text-white border-amber-600"
                        }`}>
                          {/* Magnetic Black Stripe */}
                          <div className="absolute left-0 right-0 top-5 h-8 bg-[#090909]"></div>

                          {/* Signature Strip Block */}
                          <div className="mt-12 flex items-center justify-between gap-3 text-left">
                            <div className="flex-1">
                              <p className={`text-[6.5px] tracking-wider uppercase font-mono mb-1 font-bold ${viewingClient.plan === "ouro" ? "text-yellow-100" : "text-white"}`}>
                                Assinatura Autorizada do Membro
                              </p>
                              <div className="h-6 bg-white rounded border border-white/40 shadow-inner relative flex items-center pl-3 pr-2 overflow-hidden">
                                <span className="font-serif italic text-xs text-[#1A365D] font-extrabold tracking-wide truncate">
                                  {viewingClient.name}
                                </span>
                              </div>
                            </div>
                            <div className="w-12 h-6 bg-black/60 rounded flex items-center justify-center border border-white/20">
                              <span className="font-mono text-[8.5px] font-extrabold text-[#FFE082]">CVV 821</span>
                            </div>
                          </div>

                          {/* Assistance & Benefits Listing customized */}
                          <div className="text-left space-y-1 bg-black/20 p-2 rounded-lg border border-white/10">
                            <p className={`text-[7.5px] font-extrabold uppercase tracking-wider ${viewingClient.plan === "ouro" ? "text-[#FFE082]" : "text-white"}`}>
                              Benefícios do Plano {PLAN_CONFIG[viewingClient.plan].name} Ativos:
                            </p>
                            <ul className="text-[7.5px] text-white space-y-0.5 list-disc pl-2.5 font-extrabold">
                              <li>{PLAN_CONFIG[viewingClient.plan].discounts} em serviços da empresa</li>
                              <li>{PLAN_CONFIG[viewingClient.plan].benefits[1]}</li>
                              <li>Apresente esta carteira para obter descontos.</li>
                            </ul>
                          </div>

                          {/* Footer and dynamic barcode simulation */}
                          <div className="flex items-center justify-between text-[7px] text-white font-bold">
                            <span className="max-w-[190px] leading-tight text-left">
                              Uso pessoal. Válido enquanto durar a assinatura. Cancelamento gera rescisão de benefícios.
                            </span>
                            
                            {/* Simulated barcode in premium white container box */}
                            <div className="bg-white px-2 py-1 rounded shadow-sm flex flex-col items-center gap-0.5 shrink-0 select-none">
                              <div className="flex gap-[1.5px]">
                                {[1,3,2,1,4,2,1,3,1,2,4,1,3,1,2,1].map((width, idx) => (
                                  <div 
                                    key={idx} 
                                    className="bg-black" 
                                    style={{ width: `${width}px`, height: "14px" }}
                                  />
                                ))}
                              </div>
                              <span className="font-mono text-[6px] text-black font-extrabold tracking-widest">8291038 901242</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info text helper */}
                    <p className="text-xs text-white/40 font-medium">
                      💡 Toque no cartão para girar e consultar a assinatura e benefícios no verso.
                    </p>

                    {/* Operational Action Row */}
                    <div className="w-full max-w-[620px] bg-black/40 border border-white/10 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                        <Download className="w-4.5 h-4.5 text-amber-400" />
                        <div className="text-left">
                          <h4 className="text-xs font-black uppercase tracking-wider text-white">Central de Emissão & Exportação Premium</h4>
                          <p className="text-[10px] text-white/50 leading-tight">Escolha o formato oficial desejado para download em tamanho real de cartão (85.6 x 54 mm)</p>
                        </div>
                      </div>

                      {isGenerating ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-3 text-amber-400">
                          <RotateCw className="w-8 h-8 animate-spin" />
                          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Gerando arquivos de alta resolução...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* PDF Formats Group */}
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-widest font-black text-amber-400/80 block text-left">Documentos em PDF (Prontos para Impressão)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => downloadCardAsPdfDoubleSided(viewingClient)}
                                className="bg-amber-400 hover:bg-amber-300 text-black p-3 rounded-xl flex flex-col items-start gap-1 justify-between transition-all shadow-[0_4px_12px_rgba(251,191,36,0.15)] group relative overflow-hidden cursor-pointer"
                              >
                                <div className="absolute right-2 bottom-1 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <CreditCard className="w-12 h-12 text-black" />
                                </div>
                                <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
                                  <Lock className="w-3.5 h-3.5" />
                                  PDF Tamanho Real 1:1
                                </div>
                                <p className="text-[9px] text-black/70 font-medium text-left leading-tight mt-1">2 páginas no tamanho exato de cartão (CR-80). Ideal para PVC.</p>
                              </button>

                              <button
                                type="button"
                                onClick={() => downloadCardAsPdfA4Printable(viewingClient)}
                                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 p-3 rounded-xl flex flex-col items-start gap-1 justify-between transition-all group relative overflow-hidden cursor-pointer"
                              >
                                <div className="absolute right-2 bottom-1 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <Printer className="w-12 h-12 text-white" />
                                </div>
                                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-400">
                                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                                  PDF Gabarito A4
                                </div>
                                <p className="text-[9px] text-white/60 font-medium text-left leading-tight mt-1">Frente e Verso lado a lado prontos para cortar, dobrar e plastificar.</p>
                              </button>
                            </div>
                          </div>

                          {/* Image Formats Group */}
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-widest font-black text-white/50 block text-left">Fotos Individuais (Alta Definição para Celular)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => downloadSingleSideImage(viewingClient, "front")}
                                className="bg-[#111113] hover:bg-white/5 border border-white/10 text-white/90 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <Building2 className="w-3.5 h-3.5 text-white/50" />
                                Foto Frente
                              </button>

                              <button
                                type="button"
                                onClick={() => downloadSingleSideImage(viewingClient, "back")}
                                className="bg-[#111113] hover:bg-white/5 border border-white/10 text-white/90 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <RotateCw className="w-3.5 h-3.5 text-white/50" />
                                Foto Verso
                              </button>

                              <button
                                type="button"
                                onClick={() => downloadBothSidesCombinedImage(viewingClient)}
                                className="bg-[#111113] hover:bg-white/15 border border-amber-400/20 text-amber-300 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <Users className="w-3.5 h-3.5 text-amber-400/60" />
                                Ambas Juntas
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Management Row */}
                      <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1 font-sans">
                        <button
                          type="button"
                          onClick={() => startEditClient(viewingClient)}
                          className="text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-1.5 hover:bg-white/5 px-3 py-2 rounded-lg transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Editar Dados
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteClient(viewingClient.id, viewingClient.name)}
                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir Registro
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/40 border border-white/10 p-12 rounded-3xl text-center max-w-md w-full py-16 space-y-4 relative z-10 backdrop-blur-md">
                    <CreditCard className="w-16 h-16 text-amber-400/50 mx-auto stroke-1" />
                    <h4 className="font-extrabold text-xl text-white">Nenhum Membro Ativo</h4>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Crie um novo cliente ou selecione um perfil recente na barra lateral esquerda para renderizar sua credencial real inteligente.
                    </p>
                    <button
                      onClick={() => setActiveTab("criador")}
                      className="bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs tracking-wider px-6 py-3 rounded-xl transition"
                    >
                      Cadastrar Cliente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

             {/* Tab 2: Creator Form and Custom Web Camera Selector */}
        {activeTab === "criador" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start no-print animate-fade-in" id="creator_panel">
            {/* Left side Form creator */}
            <form onSubmit={handleSaveClient} className="lg:col-span-7 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md space-y-6 text-white text-left">
              <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white uppercase">
                    {isEditMode ? "Modo de Edição de Membro" : "Novo Cadastro de Cliente"}
                  </h2>
                  <p className="text-xs text-white/50">Insira as informações do cliente para gerar a carteira do clube</p>
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs bg-white/10 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-white/20 uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              {/* Grid block info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label htmlFor="form_name_input" className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Nome Completo *
                  </label>
                  <input
                    id="form_name_input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Amanda Silva"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label htmlFor="form_cpf_input" className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    CPF (Documento) *
                  </label>
                  <input
                    id="form_cpf_input"
                    type="text"
                    required
                    maxLength={14}
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label htmlFor="form_profession_input" className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Profissão / Cargo *
                  </label>
                  <input
                    id="form_profession_input"
                    type="text"
                    required
                    value={formData.profession}
                    onChange={(e) => setFormData((prev) => ({ ...prev, profession: e.target.value }))}
                    placeholder="Ex: Engenheiro de Software"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label htmlFor="form_plan_select" className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Selecione o Plano Adquirido
                  </label>
                  <select
                    id="form_plan_select"
                    value={formData.plan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, plan: e.target.value as "bronze" | "prata" | "ouro" }))}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-[#111113] focus:border-amber-400 focus:outline-none transition-all [&_option]:bg-[#111113] [&_option]:text-white"
                  >
                    <option value="bronze">Bronze - R$ 4,99 / mês (10% Desc.)</option>
                    <option value="prata">Prata - R$ 7,99 / mês (20% Desc.)</option>
                    <option value="ouro">Ouro - R$ 9,99 / mês (35% Desc.)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1 text-left">
                  <label htmlFor="form_address_input" className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Endereço Completo
                  </label>
                  <input
                    id="form_address_input"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Av. das Nações, 7420 - Centro - Cidade, UF"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label htmlFor="form_date_input" className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Data de Inscrição
                  </label>
                  <input
                    id="form_date_input"
                    type="date"
                    required
                    value={formData.registrationDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, registrationDate: e.target.value }))}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-amber-400 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label htmlFor="form_active_select" className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Estado da Assinatura
                  </label>
                  <select
                    id="form_active_select"
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-[#111113] focus:border-amber-400 focus:outline-none transition-all [&_option]:bg-[#111113] [&_option]:text-white"
                  >
                    <option value="true">Membro Ativo</option>
                    <option value="false">Inativo / Desligado</option>
                  </select>
                </div>
              </div>

              {/* Photo Setup Area Block */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Foto do Cliente *</p>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Captura física / webcam</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Current image preview */}
                  <div className="bg-white/5 w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                    <img
                      src={formData.photo}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5 text-left w-full">
                    {/* Live webcam block wrapper */}
                    {cameraActive ? (
                      <div className="space-y-2">
                        <video 
                          ref={videoRef} 
                          className="w-full max-w-[280px] h-48 bg-black border border-white/10 rounded-lg object-cover scale-x-[-1]"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={snapPhoto}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                          >
                            Tirar Foto 📸
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="bg-white/5 hover:bg-[#151515] hover:text-amber-400 border border-white/10 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-amber-400" />
                          Webcam / Câmera
                        </button>

                        <label className="bg-white/5 hover:bg-[#151515] hover:text-amber-400 border border-white/10 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition">
                          <Upload className="w-4 h-4 text-amber-400" />
                          Fazer Upload de Imagem
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                    {cameraError && <p className="text-xs text-rose-500">{cameraError}</p>}
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">1:1 Proporção quadrada recomendada</p>
                  </div>
                </div>

                {/* Avatar presets quick panel */}
                <div className="space-y-2 text-left">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Ou selecione um avatar profissional padrão pronto:</p>
                  <div className="grid grid-cols-8 gap-2">
                    {AVATAR_OPTIONS.map((avatar, idx) => (
                      <div
                        key={idx}
                        onClick={() => setFormData((prev) => ({ ...prev, photo: avatar }))}
                        className={`w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 shrink-0 ${
                          formData.photo === avatar ? "border-amber-400 ring-2 ring-amber-400/20" : "border-transparent"
                        }`}
                      >
                        <img src={avatar} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submission CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs py-4 rounded-xl shadow-[0_4px_15px_rgba(251,191,36,0.15)] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition duration-300"
                >
                  <QrCode className="w-4 h-4" />
                  {isEditMode ? "Salvar Alterações na Carteirinha" : "Gerar Carteirinha em Tamanho Real"}
                </button>
              </div>
            </form>

            {/* Right side quick dynamic preview */}
            <div className="lg:col-span-5 flex flex-col items-center space-y-6">
              <div className="bg-white/5 pb-6 p-6 rounded-3xl border border-white/10 w-full space-y-4 backdrop-blur-md">
                <div className="text-left">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">Visualização em Tempo Real</h3>
                  <p className="text-xs text-white/50 mt-1">As alterações inseridas no formulário ao lado refletirão no cartão abaixo instantaneamente.</p>
                </div>
                
                {/* Simulated ID Card preview */}
                <div className={`p-4 rounded-2xl border aspect-video flex flex-col justify-between overflow-hidden shadow-2xl relative ${
                  formData.plan === "ouro"
                    ? "bg-[#A37E2C] text-white border-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                    : formData.plan === "prata"
                      ? "bg-[#717478] text-white border-zinc-300"
                      : "bg-[#7D4E31] text-white border-amber-600 shadow-[0_0_20px_rgba(125,78,49,0.15)]"
                }`}>
                  <div className="flex items-start justify-between z-10 relative">
                    <div className="flex flex-col items-start leading-[1.1]">
                      <span className="font-extrabold text-[10.5px] tracking-wide uppercase text-shadow text-white">{companyName || "ASSESSORIA ADMINISTRATIVA"}</span>
                      <span className={`text-[7.5px] font-mono tracking-wider text-shadow ${formData.plan === "ouro" ? "text-[#FFE082]" : "text-white/90"}`}>CNPJ: 65.546.306/0001-93</span>
                    </div>
                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/40 text-white">
                      {formData.plan}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center z-10 relative">
                    <img
                      src={formData.photo}
                      alt="User photo"
                      referrerPolicy="no-referrer"
                      className="col-span-4 w-14 h-14 rounded-full object-cover border border-white"
                    />
                    <div className="col-span-8 space-y-0.5 text-left text-xs">
                      <p className="font-black truncate text-xs text-white">{formData.name || "Nome do Cliente"}</p>
                      <p className={`text-[10px] truncate font-extrabold ${formData.plan === "ouro" ? "text-[#FFE082]" : "text-white"}`}>{formData.profession || "Sua Profissão"}</p>
                      <p className="font-mono font-extrabold text-[9px] text-white">CPF: {formData.cpf || "000.000.000-00"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/20 pt-1.5 z-10 relative text-[8px] text-white font-extrabold font-mono">
                    <span>CADASTRO: {new Date(formData.registrationDate).toLocaleDateString("pt-BR")}</span>
                    <span className="text-emerald-400 font-extrabold">● ATIVO</span>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-left space-y-2">
                  <span className="text-[9px] uppercase font-bold text-white/55 block">Vantagens Ativadas no Perfil ({formData.plan}):</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-black bg-amber-400 rounded-sm p-0.5" />
                      <span>{PLAN_CONFIG[formData.plan].discounts} em assistências</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-black bg-amber-400 rounded-sm p-0.5" />
                      <span className="truncate max-w-[210px]">{PLAN_CONFIG[formData.plan].benefits[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Client Directory and Management Database */}
        {activeTab === "clientes" && (
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md space-y-6 no-print animate-fade-in" id="directory_panel">
            {/* Search filters toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-left">
                <h2 className="text-lg font-black tracking-tight text-white uppercase">Carteiras Cadastradas</h2>
                <p className="text-xs text-white/50">Pesquise, edite e gerencie as credenciais ativas do clube de benefícios.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search query input */}
                <div className="relative flex-1 sm:flex-initial min-w-[240px]">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                  <input
                    id="search_filter_input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome, profissão ou CPF..."
                    className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:bg-white/10 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Plan Tier filter button */}
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setFilterPlan("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterPlan === "all" ? "bg-amber-400 text-black shadow-sm" : "text-white/60 hover:text-white"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterPlan("bronze")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterPlan === "bronze" ? "bg-amber-700/30 text-amber-300 border border-amber-600/30" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Bronze
                  </button>
                  <button
                    onClick={() => setFilterPlan("prata")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterPlan === "prata" ? "bg-slate-500/30 text-slate-200 border border-slate-400/30" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Prata
                  </button>
                  <button
                    onClick={() => setFilterPlan("ouro")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterPlan === "ouro" ? "bg-amber-500 text-black shadow-sm" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Ouro
                  </button>
                </div>
              </div>
            </div>

            {/* List Table container */}
            <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
              <table className="min-w-full divide-y divide-white/10 text-left text-xs font-medium">
                <thead className="bg-black/40 text-white/50 uppercase tracking-widest text-[9px] font-black">
                  <tr>
                    <th className="px-6 py-4">Foto / Nome</th>
                    <th className="px-6 py-4">Documento CPF</th>
                    <th className="px-6 py-4">Profissão</th>
                    <th className="px-6 py-4">Plano</th>
                    <th className="px-6 py-4">Inscrição</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/80">
                  {clients
                    .filter((c) => {
                      const matchSearch = 
                        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.cpf.includes(searchTerm) ||
                        c.profession.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchPlan = filterPlan === "all" || c.plan === filterPlan;
                      return matchSearch && matchPlan;
                    })
                    .map((client) => (
                      <tr 
                        key={client.id} 
                        className={`hover:bg-white/5 transition-colors cursor-pointer ${
                          viewingClient?.id === client.id ? "bg-white/5" : ""
                        }`}
                        onClick={() => setViewingClient(client)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 text-left">
                            <img
                              src={client.photo}
                              alt={client.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm shrink-0"
                            />
                            <div>
                              <p className="font-extrabold text-white text-sm">{client.name}</p>
                              <span className="font-mono text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                                {client.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-white/70">{client.cpf}</td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-[150px] truncate text-white/70">{client.profession}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                            client.plan === "ouro" 
                              ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                              : client.plan === "prata"
                                ? "bg-slate-400/10 text-slate-200 border-slate-400/30"
                                : "bg-amber-700/10 text-amber-500 border-amber-600/30"
                          }`}>
                            {client.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-white/70">
                          {new Date(client.registrationDate).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setViewingClient(client);
                                setActiveTab("dashboard");
                                triggerNotification(`Selecionado: ${client.name}. Visualize a carteira acima.`);
                              }}
                              className="text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 p-2 rounded-lg cursor-pointer transition-colors"
                              title="Visualizar Carteirinha em tamanho real"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => startEditClient(client)}
                              className="text-[grey] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors"
                              title="Editar cliente"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteClient(client.id, client.name)}
                              className="text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-lg cursor-pointer transition-colors"
                              title="Excluir cadastro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-white/45 space-y-2">
                        <Users className="w-8 h-8 mx-auto opacity-50" />
                        <p className="font-extrabold uppercase text-xs tracking-wider">Nenhum membro cadastrado.</p>
                        <p className="text-xs">Clique na aba "Criar Carteirinha" acima para começar.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: QR Code Validation Terminal Scanning simulation */}
        {activeTab === "validador" && (
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md max-w-4xl mx-auto space-y-8 no-print animate-fade-in" id="validador_panel">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-400/20 shadow-xs">
                <QrCode className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Terminal do Estabelecimento</h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Simule o terminal de atendimento onde a carteirinha física do cliente é escaneada via QR Code ou CPF para liberar o desconto específico do plano.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column Input details */}
              <div className="lg:col-span-5 bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20 tracking-wider block text-center">
                    Mapeamento Manual / Scanner
                  </span>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="verify_id_input" className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-1">
                      <span>Código ou CPF do Cliente</span>
                    </label>
                    <input
                      id="verify_id_input"
                      type="text"
                      value={enteredId}
                      onChange={(e) => setEnteredId(e.target.value)}
                      placeholder="Código CC-XXXXX-XX ou CPF"
                      className="w-full text-xs px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 font-mono focus:bg-white/10 placeholder-white/20"
                    />
                    <p className="text-[10px] text-white/40">Insira um código ID do cliente para simular as assistências.</p>
                  </div>

                  <button
                    onClick={() => handleVerifyClient(enteredId)}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs py-3.5 rounded-xl shadow-[0_4px_15px_rgba(251,191,36,0.15)] transition duration-300 flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                  >
                    Consultar Credencial 🔍
                  </button>
                </div>

                {/* Quick Selection List for fast testing */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-white/50 block text-left tracking-wider">Testar com cliente existente:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {clients.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setEnteredId(c.id);
                          handleVerifyClient(c.id);
                        }}
                        className="text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white px-2.5 py-2 rounded-lg truncate text-center cursor-pointer transition"
                      >
                        {c.name.split(" ")[0]} ({c.plan.toUpperCase()})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column Scanner response screen */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center border border-white/10 rounded-2xl p-6 relative bg-black/40 backdrop-blur-md text-white min-h-[320px]">
                
                {scanResult.status === "idle" && (
                  <div className="text-center space-y-4">
                    {/* Animated scanning laser screen wrapper for UX */}
                    <div className="w-32 h-32 border-2 border-amber-400/30 rounded-2xl mx-auto flex items-center justify-center relative overflow-hidden bg-[#0c0c0d]">
                      <div className="w-full h-[2px] bg-amber-400 absolute left-0 shadow-lg shadow-amber-400 animate-bounce" style={{ animationDuration: '3s' }}></div>
                      <QrCode className="w-16 h-16 text-amber-400/20" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-sm text-white uppercase tracking-wider">Pronto para Validação</p>
                      <p className="text-[10px] text-white/50 max-w-xs mx-auto leading-relaxed">Insira o código do cliente ou selecione um para carregar o cartão virtual e checar a validade do plano.</p>
                    </div>
                  </div>
                )}

                {scanResult.status === "error" && (
                  <div className="text-center space-y-4">
                    <div className="w-14 h-14 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                      <X className="w-8 h-8 animate-shake" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <p className="font-black text-rose-400 uppercase tracking-wider text-sm">Credencial Negada</p>
                      <p className="text-xs text-white/70 leading-relaxed">{scanResult.message}</p>
                    </div>
                    <button 
                      onClick={() => setScanResult({ status: "idle", message: "" })}
                      className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white uppercase tracking-wider cursor-pointer transition"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}

                {scanResult.status === "success" && scanResult.client && (
                  <div className="w-full text-left space-y-5 animate-scale-up">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="font-black text-xs text-emerald-400 tracking-widest uppercase">CLIENTE ATIVO & REGULAR</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${
                        scanResult.client.plan === "ouro" ? "bg-amber-400 text-black border-amber-300" :
                        scanResult.client.plan === "prata" ? "bg-slate-300 text-slate-900 border-slate-200" :
                        "bg-amber-900/40 text-amber-100 border-amber-800/60"
                      }`}>
                        {scanResult.client.plan}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                      <img
                        src={scanResult.client.photo}
                        className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0 shadow-lg"
                        alt="Photo portrait"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-black text-sm text-white truncate">{scanResult.client.name}</p>
                        <p className="text-xs text-white/60 truncate">{scanResult.client.profession}</p>
                        <p className="font-mono text-[9px] text-amber-400">ID: {scanResult.client.id}</p>
                      </div>
                    </div>

                    {/* Assistance benefits checklist simulator results */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest">
                        Benefícios autorizados para este plano:
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 flex gap-3">
                          <div className="w-5 h-5 bg-emerald-500/15 text-emerald-450 rounded flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-emerald-300 uppercase tracking-wider">Desconto Geral Especial de {PLAN_CONFIG[scanResult.client.plan].discounts} ativo</p>
                            <p className="text-[10.5px] text-white/60 mt-0.5">Aplicar automaticamente na fatura deste serviço/assistência.</p>
                          </div>
                        </div>

                        <div className="bg-amber-400/5 p-3 rounded-xl border border-amber-400/10 flex gap-3">
                          <div className="w-5 h-5 bg-amber-400/15 text-amber-400 rounded flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-amber-300 uppercase tracking-wider">Políticas de Suporte & Assistências:</p>
                            <p className="text-[10.5px] text-white/60 mt-0.5">{PLAN_CONFIG[scanResult.client.plan].benefits[1]}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        onClick={() => {
                          if (scanResult.client) {
                            setViewingClient(scanResult.client);
                            setActiveTab("dashboard");
                          }
                        }}
                        className="flex-1 bg-amber-400 hover:bg-amber-300 text-black py-2.5 rounded-xl text-xs font-black transition text-center uppercase cursor-pointer shadow-[0_4px_12px_rgba(251,191,36,0.15)]"
                      >
                        Visualizar Carteira Real
                      </button>
                      <button
                        onClick={() => setScanResult({ status: "idle", message: "" })}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer hover:text-amber-400"
                      >
                        Próximo Escaneamento
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Dynamic interactive price and benefits table comparison manager */}
        {activeTab === "beneficios" && (
          <div className="space-y-8 no-print animate-fade-in animate-scale-up" id="benefits_panel">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[goldenrod] bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Grade de Mensalidade & Assistência
              </span>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mt-2">Comparativo dos Planos Promovidos</h2>
              <p className="text-xs text-white/50">
                Veja o detalhamento do que cada cliente recebe ao assinar os planos bronze, prata e ouro por mês.
              </p>
            </div>

            {/* Price Column cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
              
              {/* Bronze Card tier */}
              <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden transition-all hover:border-white/20 backdrop-blur-md text-white">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-700"></div>
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-amber-700/20 text-amber-400 border border-amber-600/30">
                      Plano BRONZE
                    </span>
                    <Coins className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">R$ 4,99</span>
                      <span className="text-xs text-white/40">/mês</span>
                    </div>
                    <p className="text-xs text-white/50 font-medium">Descontos básicos essenciais de acesso ao clube.</p>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <ul className="space-y-3">
                    {PLAN_CONFIG.bronze.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-white/70 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-black bg-amber-400 rounded-sm p-0.5 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, plan: "bronze" }));
                    setActiveTab("criador");
                    triggerNotification("Formulado para criar carteirinha Bronze.");
                  }}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-amber-400 hover:text-black cursor-pointer text-slate-300 transition duration-300 uppercase tracking-wider"
                >
                  Criar Carteira Bronze
                </button>
              </div>

              {/* Prata Premium tier */}
              <div className="bg-white/5 rounded-3xl border-2 border-amber-400 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden transition-all backdrop-blur-md text-white shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                <div className="absolute top-0 right-0 bg-amber-400 text-black font-black text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-xs">
                  Mais Popular
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-white/10 text-white border border-white/20">
                      Plano PRATA
                    </span>
                    <RotateCw className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">R$ 7,99</span>
                      <span className="text-xs text-white/40">/mês</span>
                    </div>
                    <p className="text-xs text-white/50 font-medium">Mais benefícios e atendimentos qualificados.</p>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <ul className="space-y-3">
                    {PLAN_CONFIG.prata.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-white/70 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-black bg-amber-400 rounded-sm p-0.5 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, plan: "prata" }));
                    setActiveTab("criador");
                    triggerNotification("Formulado para criar carteirinha Prata.");
                  }}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 cursor-pointer text-black transition uppercase tracking-wider shadow-[0_4px_12px_rgba(251,191,36,0.15)]"
                >
                  Criar Carteira Prata
                </button>
              </div>

              {/* Ouro Master class VIP card */}
              <div className="bg-[#0d0d0f] text-white rounded-3xl border border-white/10 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden transition-all backdrop-blur-md text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-yellow-400 text-amber-950 border border-yellow-300">
                      Plano OURO (VIP)
                    </span>
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-yellow-300">R$ 9,99</span>
                      <span className="text-xs text-white/40">/mês</span>
                    </div>
                    <p className="text-xs text-white/50 font-medium">Clube completo de assistência VIP 24 horas.</p>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <ul className="space-y-3">
                    {PLAN_CONFIG.ouro.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-white/70 leading-relaxed font-semibold">
                        <Check className="w-3.5 h-3.5 text-black bg-amber-400 rounded-sm p-0.5 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, plan: "ouro" }));
                    setActiveTab("criador");
                    triggerNotification("Formulado para criar carteirinha Ouro.");
                  }}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-450 hover:to-amber-450 cursor-pointer text-black transition uppercase tracking-wider shadow-[0_4px_15px_rgba(245,158,11,0.15)]"
                >
                  Criar Carteira Ouro
                </button>
              </div>

            </div>

            {/* Assistance support informational widget */}
            <div className="bg-white/5 p-5 rounded-2xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-left border border-white/10 backdrop-blur-sm text-white">
              <PhoneCall className="w-10 h-10 text-amber-400 bg-amber-400/10 p-2 rounded-xl shrink-0 border border-amber-400/20" />
              <div>
                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Precisa configurar canais de Assistência adicionais dentro da empresa?</h4>
                <p className="text-xs text-white/50 leading-relaxed mt-1">
                  Os valores e benefícios são integrados automaticamente na carteirinha do cliente (como o QR Code e as informações descritas no verso do cartão físico). Use as regras organizadas acima para treinar sua equipe de frente de caixa.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Corporate Professional Footer details */}
      <footer className="bg-black/40 border-t border-white/10 py-8 text-center text-xs text-white/40 no-print mt-12" id="footer_main">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-white/55">
            © 2026 {companyName} - Painel de Benefícios e Emissão de Carteirinhas Digitais.
          </p>
          <div className="flex items-center gap-4 text-white/40">
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Termos de uso</span>
            <span>•</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Suporte</span>
            <span>•</span>
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Segurança</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
