import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { LockKeyhole } from 'lucide-react';

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
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const otpSchema = z.object({
    otpCode: z.string().length(6, "OTP kodu 6 haneli olmalıdır.").regex(/^\d+$/, "Sadece rakam giriniz."),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {
    const { verifyOtp } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');

    const form = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otpCode: "",
        },
    });

    useEffect(() => {
        if (!email) {
            toast.error("Email bilgisi eksik, lütfen tekrar giriş yapın.");
            navigate('/login');
        }
    }, [email, navigate]);

    const onSubmit = async (data: OtpFormValues) => {
        if (!email) return;

        try {
            await verifyOtp(email, data.otpCode);
            toast.success("Doğrulama başarılı! Yönlendiriliyorsunuz...");
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Geçersiz veya süresi dolmuş kod.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <LockKeyhole className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Doğrulama Kodu</CardTitle>
                    <CardDescription>
                        <span className="font-medium text-foreground">{email}</span> adresine gönderilen 6 haneli kodu girin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="otpCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">OTP Kodu</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="123456"
                                                maxLength={6}
                                                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                                                {...field}
                                                onChange={(e) => {
                                                    // Sadece rakam girişine izin ver
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    field.onChange(val);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-center" />
                                        <p className="text-xs text-center text-muted-foreground">
                                            Kodu lütfen boşluk bırakmadan giriniz.
                                        </p>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}