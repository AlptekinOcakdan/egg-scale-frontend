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

const loginSchema = z.object({
    email: z.string().email("Geçerli bir email adresi giriniz."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data.email);
            toast.success("OTP kodu gönderildi!");
            navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Giriş başarısız. Kullanıcı bulunamadı.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Hoş Geldiniz</CardTitle>
                    <CardDescription className="text-center">
                        Devam etmek için email adresinizi girin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                {form.formState.isSubmitting ? "İşleniyor..." : "OTP Gönder"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Hesabın yok mu?{" "}
                        <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                            Kayıt Ol
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}