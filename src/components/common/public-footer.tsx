import Link from "next/link";
import { APP_CONSTANTS, ROUTE_CONSTANTS } from "@/constants/app.constants";
import { Github, Twitter, Facebook, Mail, MapPin, Phone } from "lucide-react";

export function PublicFooter() {
    return (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <Link href={ROUTE_CONSTANTS.HOME} className="text-xl font-bold tracking-tight text-primary">
                            {APP_CONSTANTS.APP_TITLE}
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {APP_CONSTANTS.APP_SUBTITLE}. Mang đến trải nghiệm mua bán thời gian thực an toàn, minh bạch
                            và tự động hóa.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Nền Tảng</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link
                                    href={ROUTE_CONSTANTS.AUCTIONS_PREFIX}
                                    className="hover:text-primary transition-colors"
                                >
                                    Tất cả Phiên Đấu Giá
                                </Link>
                            </li>
                            <li>
                                <Link href={ROUTE_CONSTANTS.LOGIN} className="hover:text-primary transition-colors">
                                    Đăng nhập
                                </Link>
                            </li>
                            <li>
                                <Link href={ROUTE_CONSTANTS.REGISTER} className="hover:text-primary transition-colors">
                                    Tạo tài khoản
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Ví Escrow tự động
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Hỗ Trợ</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Trung tâm trợ giúp
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Điều khoản dịch vụ
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors">
                                    Quy trình giải quyết tranh chấp
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Liên Hệ</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> 123 Đường Cầu Diễn, Bắc Từ Liêm, HN
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> (024) 1234 5678
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4" /> contact@daugia.vn
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/50 flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} {APP_CONSTANTS.APP_TITLE}. All rights reserved.
                    </p>
                    <p className="font-medium text-foreground">Trusted platform for secure real-time auctions.</p>
                </div>
            </div>
        </footer>
    );
}
