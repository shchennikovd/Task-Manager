import { useState } from "react";
import { useForm } from "react-hook-form";
import { authService } from "../auth";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

interface AuthFormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: AuthFormData) => {
    setApiError("");

    if (isLogin) {
      const result = await authService.login(data.email, data.password);
      if (result.success) onAuthSuccess();
      else setApiError(result.error || "Ошибка авторизации");
    } else {
      const result = await authService.signup(
        data.name || "",
        data.email,
        data.password,
        data.confirmPassword || ""
      );
      if (result.success) onAuthSuccess();
      else setApiError(result.error || "Ошибка регистрации");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setApiError("");
    reset(); 
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100">DevFlow AI</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Умное управление задачами для разработчиков
          </p>
        </div>

        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-2">
              {isLogin ? "С возвращением" : "Создать аккаунт"}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin
                ? "Войдите, чтобы получить доступ к задачам"
                : "Начните работу с DevFlow AI прямо сейчас"}
            </p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Имя</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Джон Доу"
                    className={`w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-800 focus:border-gray-700"
                    }`}
                    {...register("name", { required: !isLogin ? "Имя обязательно" : false })}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
                    errors.email ? "border-red-500" : "border-gray-800 focus:border-gray-700"
                  }`}
                  {...register("email", {
                    required: "Email обязателен",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Неверный формат email адресу",
                    },
                  })}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Введите пароль" : "Минимум 8 символов"}
                  className={`w-full pl-10 pr-10 py-3 bg-[#0f0f0f] border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
                    errors.password ? "border-red-500" : "border-gray-800 focus:border-gray-700"
                  }`}
                  {...register("password", {
                    required: "Пароль обязателен",
                    minLength: { value: 8, message: "Минимум 8 символов" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Подтверждение пароля</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Повторите пароль"
                    className={`w-full pl-10 pr-10 py-3 bg-[#0f0f0f] border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-800 focus:border-gray-700"
                    }`}
                    {...register("confirmPassword", {
                      validate: (value) => isLogin || value === watch("password") || "Пароли не совпадают",
                    })}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg transition-all font-medium mt-6 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? "Подождите..." : isLogin ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={toggleMode} type="button" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
              {isLogin ? (
                <>Нет аккаунта? <span className="text-blue-400 font-medium hover:underline">Зарегистрируйтесь</span></>
              ) : (
                <>Уже есть аккаунт? <span className="text-blue-400 font-medium hover:underline">Войти</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}