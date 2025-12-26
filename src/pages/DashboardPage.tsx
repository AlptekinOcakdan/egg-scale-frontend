import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, User, Key, CheckCircle2, Loader2, Scale } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api } from '../lib/api';
import axios from 'axios';
import { toast } from "sonner";

// Liste elemanı için tip tanımı
interface WeightItem {
    id: string; // Frontend tarafında takibi için geçici ID
    weight: number;
    timestamp: Date;
    status: 'new' | 'processed';
    isDefective?: boolean;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();

    // State'ler
    const [weights, setWeights] = useState<WeightItem[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Modal ve İşlem State'leri
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedWeightId, setSelectedWeightId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Socket Bağlantısı
    useEffect(() => {
        if (!user?.NFCId) return;

        // Backend URL'inize göre ayarlayın (örn: http://localhost:5000)
        const socketInstance = io("http://localhost:5000", {
            transports: ['websocket'],
        });

        socketInstance.on('connect', () => {
            console.log("Socket connected");
            socketInstance.emit('join_room', user.NFCId);
        });

        socketInstance.on('receive_weight', (data: { weight: number, timestamp: string }) => {
            toast.info(`Yeni ağırlık verisi geldi: ${data.weight}gr`);

            const newItem: WeightItem = {
                id: crypto.randomUUID(), // Listede benzersiz key için
                weight: data.weight,
                timestamp: new Date(data.timestamp),
                status: 'new'
            };

            setWeights((prev) => [newItem, ...prev]);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user?.NFCId]);

    // Modal Açma
    const handleOpenDialog = (id: string) => {
        setSelectedWeightId(id);
        setSelectedFile(null);
        setIsDialogOpen(true);
    };

    // Dosya Seçimi
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Modele Gönder ve Kaydet Süreci
    const handleProcessEgg = async () => {
        if (!selectedWeightId || !selectedFile) {
            toast.warning("Lütfen bir fotoğraf seçiniz.");
            return;
        }

        const currentWeightItem = weights.find(w => w.id === selectedWeightId);
        if (!currentWeightItem) return;

        setIsProcessing(true);

        try {
            // 1. Adım: Python AI Modeline Gönder
            const formDataAI = new FormData();
            formDataAI.append('file', selectedFile);

            // Python servisi çağrısı
            const aiResponse = await axios.post('http://localhost:8000/predict', formDataAI, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { is_defective } = aiResponse.data; // Python'dan dönen veri: { is_defective: true/false }

            // 2. Adım: Backend'e Kaydet (createEgg)
            const formDataBackend = new FormData();
            // Sayısal değerleri string olarak append ediyoruz, backend parse etmeli veya multer body içinde sunmalı
            formDataBackend.append('weight', currentWeightItem.weight.toString());
            formDataBackend.append('isDefective', is_defective.toString());
            formDataBackend.append('imageFile', selectedFile); // Middleware 'imageFile' bekliyor

            await api.post('/eggs', formDataBackend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 3. Adım: UI Güncelleme (Badge -> İşlendi)
            setWeights(prev => prev.map(item => {
                if (item.id === selectedWeightId) {
                    return { ...item, status: 'processed', isDefective: is_defective };
                }
                return item;
            }));

            toast.success(is_defective ? "Yumurta kusurlu olarak işaretlendi." : "Yumurta sağlam olarak işaretlendi.");
            setIsDialogOpen(false);

        } catch (error) {
            console.error(error);
            toast.error("İşlem sırasında bir hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Navbar */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
                <div className="flex flex-1 items-center font-bold text-lg text-primary">
                    EggScale Dashboard
                </div>
                <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:inline-block">
            {user?.email}
          </span>
                    <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Çıkış Yap</span>
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-6 lg:p-10">
                <div className="grid gap-6">

                    {/* Üst Bilgi Kartları */}
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Öğrenci No</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{user?.studentNo}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">NFC ID (Oda)</CardTitle>
                                <Key className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono tracking-wide">{user?.NFCId}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gelen Veri Listesi */}
                    <Card className="border-2 border-dashed border-primary/20 bg-white">
                        <CardHeader>
                            <CardTitle>Gelen Tartım Verileri</CardTitle>
                            <CardDescription>
                                Cihazdan gelen anlık veriler burada listelenir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {weights.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                    <Scale className="h-10 w-10 mb-2 opacity-20" />
                                    <p>Henüz veri gelmedi, cihaz bekleniyor...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {weights.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                                                    {item.weight}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Ağırlık: {item.weight}gr</span>
                                                    <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                                                </div>
                                                {item.status === 'new' ? (
                                                    <Badge>Yeni</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        İşlendi ({item.isDefective ? 'Kusurlu' : 'Sağlam'})
                                                    </Badge>
                                                )}
                                            </div>

                                            <Button
                                                size="sm"
                                                variant={item.status === 'processed' ? "outline" : "default"}
                                                disabled={item.status === 'processed'}
                                                onClick={() => handleOpenDialog(item.id)}
                                            >
                                                {item.status === 'processed' ? "Tamamlandı" : "Fotoğraf Yükle"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Fotoğraf Yükleme Modalı */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Yumurta Fotoğrafı Yükle</DialogTitle>
                        <DialogDescription>
                            Seçilen ağırlık verisi için fotoğraf yükleyerek analizi başlatın.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Resim Dosyası</Label>
                            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {selectedFile && (
                            <div className="text-sm text-muted-foreground">
                                Seçilen dosya: <span className="font-medium text-foreground">{selectedFile.name}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-end">
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
                            İptal
                        </Button>
                        <Button onClick={handleProcessEgg} disabled={!selectedFile || isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Modele Gönder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}