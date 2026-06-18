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
        supportsTablet: true,
        infoPlist: {
          UIBackgroundModes: ["remote-notification"]
        }
      },
      android: {
        package: "com.tikhallabs.keepr",
        googleServicesFile: "./google-services.json",
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
        "expo-status-bar",
        "@react-native-firebase/app",
        "@react-native-firebase/messaging",
        [
          "expo-build-properties",
          {
            ios: { useFrameworks: "static" }
          }
        ]
      ],
      extra: {
        openaiApiKey: process.env.OPENAI_API_KEY,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      }
    }
  };
};