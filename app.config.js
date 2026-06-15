export default ({ config }) => {
  return {
    expo: {
      name: "keepr",
      slug: "keepr",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      ios: {
        supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          backgroundColor: "#E6F4FE",
          foregroundImage: "./assets/android-icon-foreground.png",
          backgroundImage: "./assets/android-icon-background.png",
          monochromeImage: "./assets/android-icon-monochrome.png"
        }
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      plugins: [
        "expo-status-bar"
      ],
      extra: {
        openaiApiKey: process.env.OPENAI_API_KEY,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      }
    }
  };
};