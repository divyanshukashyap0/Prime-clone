import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Successfully logged in!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success("Account created successfully!");
            }
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            toast.success("Logged in with Google!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f171e] flex flex-col items-center pt-8 px-4">
            {/* Prime Video Logo */}
            <Link to="/" className="mb-10">
                <img
                    src="/logo.png"
                    alt="Prime Video"
                    className="h-10"
                />
            </Link>

            <div className="w-full max-w-[350px] bg-white rounded-lg p-8 shadow-2xl">
                <h1 className="text-3xl font-normal text-black mb-6">
                    {isLogin ? "Sign-In" : "Create account"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-black"
                            placeholder="At least 6 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:from-[#f5d78e] hover:to-[#eeb933] py-2 rounded shadow-inner text-black text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? "Processing..." : (isLogin ? "Sign-In" : "Create your Amazon account")}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 py-2 rounded text-black text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z"
                        />
                    </svg>
                    Google
                </button>

                <p className="text-xs text-gray-600 mt-4 leading-relaxed">
                    By continuing, you agree to Amazon's <span className="text-[#0066c0] hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-[#0066c0] hover:underline cursor-pointer">Privacy Notice</span>.
                </p>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-600 text-center mb-3">
                        {isLogin ? "New to Amazon?" : "Already have an account?"}
                    </p>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec] border border-[#adb1b8] hover:from-[#e7eaf0] py-1.5 rounded text-black text-xs font-medium"
                    >
                        {isLogin ? "Create your Amazon account" : "Sign-In"}
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
                <div className="flex gap-4 text-xs text-[#0066c0]">
                    <span className="hover:underline cursor-pointer">Conditions of Use</span>
                    <span className="hover:underline cursor-pointer">Privacy Notice</span>
                    <span className="hover:underline cursor-pointer">Help</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-3">
                    © 1996-2026, Amazon.com, Inc. or its affiliates
                </p>
            </div>
        </div>
    );
}
