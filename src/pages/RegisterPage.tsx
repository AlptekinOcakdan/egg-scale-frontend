import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Zod Validasyon Şeması
const registerSchema = z.object({
    studentNo: z.string().min(5, "Öğrenci numarası en az 5 karakter olmalıdır."),
    NFCId: z.string().min(1, "NFC ID zorunludur."),
    email: z.string().email("Geçerli bir email adresi giriniz."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    // Form Hook Tanımlaması
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            studentNo: "",
            NFCId: "",
            email: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await registerUser(data);
            toast.success("Kayıt başarılı! Lütfen giriş yapın.");
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Kayıt işlemi sırasında bir hata oluştu.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Hesap Oluştur</CardTitle>
                    <CardDescription className="text-center">
                        EggScale dünyasına katılmak için bilgilerinizi girin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                control={form.control}
                                name="studentNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Öğrenci No</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Örn: 202312345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="NFCId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NFC ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Kart ID'niz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Adresi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ornek@okul.edu.tr" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Kaydediliyor..." : "Kayıt Ol"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Zaten hesabın var mı?{" "}
                        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                            Giriş Yap
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}