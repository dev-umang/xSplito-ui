import { Button } from "@/components/ui/button";
import { type FC } from "react";
import { useAuthActions } from "../store/auth.store";
import { useThemeActions, useDarkMode } from "@/configs/theme/theme.store";
import { Moon, Sun } from "lucide-react";

const LoginPage: FC = () => {
  const { signInWithGoogle } = useAuthActions();
  const { updatePreferences } = useThemeActions();
  const isDarkMode = useDarkMode();

  const toggleTheme = () => {
    updatePreferences(isDarkMode ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-600 to-indigo-500 dark:from-slate-900 dark:to-slate-800 p-6 transition-colors duration-300">
      <div className="w-full max-w-xl">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl dark:shadow-slate-900/50 px-12 py-10 relative transition-colors duration-300">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 group"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
              xTripo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
              Sign in to continue to your account
            </p>
          </div>

          {/* Sign-in Options */}
          <div className="space-y-4">
            {/* Google Sign In - Enabled */}
            <Button
              variant="outline"
              className="w-full h-14 relative flex items-center justify-center gap-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-slate-700 border-2 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all dark:text-white"
              onClick={signInWithGoogle}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Facebook Sign In - Disabled */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full h-14 flex items-center justify-center gap-3 text-base font-medium border-2 dark:border-slate-600 opacity-60 cursor-not-allowed dark:text-white"
                disabled
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continue with Facebook</span>
              </Button>
              <span className="absolute -top-3 -right-3 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Coming Soon
              </span>
            </div>

            {/* Apple Sign In - Disabled */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full h-14 flex items-center justify-center gap-3 text-base font-medium border-2 dark:border-slate-600 opacity-60 cursor-not-allowed dark:text-white"
                disabled
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Continue with Apple</span>
              </Button>
              <span className="absolute -top-3 -right-3 bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 mb-10 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-slate-600"></div>
            <span className="px-6 text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">
              or
            </span>
            <div className="flex-1 border-t border-gray-300 dark:border-slate-600"></div>
          </div>

          {/* Terms and Privacy */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="text-indigo-600 dark:text-indigo-400 hover:underline transition-colors duration-300"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-indigo-600 dark:text-indigo-400 hover:underline transition-colors duration-300"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        {/* <p className="text-center mt-8 text-base text-gray-700">
          Don't have an account?{" "}
          <a href="#" className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </a>
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;
