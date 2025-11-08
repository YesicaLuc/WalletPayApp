# 💸 WalletPayApp

App móvil en **React Native (TypeScript)** que simula una billetera virtual: login, saldo, envío y recepción de dinero, y actividad reciente.

## Requisitos

- **Node.js** `>= 20` (requerido por RN 0.82, Metro usa `toReversed`)
  - Recomendado: `nvm install 20.18.1 && nvm use 20.18.1`
- **npm** `>= 9`
- **Watchman** (macOS): `brew install watchman`
- **Android Studio** + SDK + emulador / dispositivo con depuración USB
- **Java 17** (JDK 17)
- **Xcode** (para iOS) y **CocoaPods** (`brew install cocoapods`)

> Verifica tu versión de Node:
> ```bash
> node -v  # debe ser v20.x o v22.x
> ```

## 📦 Instalación
```bash
git clone https://github.com/YesicaLuc/WalletPayApp
cd WalletPayApp
```
# dependencias JS
 ```bash
npm install
```
# iOS (solo si vas a compilar iOS)
 ```bash
cd ios
pod install
cd ..
```
▶️ Ejecución
1) Iniciar Metro
 ```bash
npm start -- --reset-cache
Deja esta terminal abierta.
```
2) Android
En otra terminal:

 ```bash
npx react-native run-android
```
Asegúrate de tener un emulador Android encendido o un dispositivo conectado.

3) iOS (opcional)

# si no corriste 'pod install', hazlo antes dentro de ios/
 ```bash
npx react-native run-ios
```
# o forzando workspace/scheme:
 ```bash
npx react-native run-ios --workspace ios/WalletPayApp.xcworkspace --scheme WalletPayApp
```
Estructura
 ```bash
WalletPayApp/
├── android/                  # proyecto nativo Android
├── ios/                      # proyecto nativo iOS
├── App.tsx                   # componente raíz (tu UI)
├── index.js                  # entrypoint RN (registra la app)
├── app.json                  # nombre de la app
├── package.json              # dependencias/scripts
├── babel.config.js           # Babel (usa metro-react-native-babel-preset)
└── metro.config.js           # Metro bundler
```
🔧 Scripts útiles
 ```bash
npm start                 # inicia Metro
npm run android           # alias sugerido: "react-native run-android"
npm run ios               # alias sugerido: "react-native run-ios"
```
Si quieres, en package.json puedes agregar:

 ```bash
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "clean:android": "cd android && ./gradlew clean && cd ..",
    "reset": "watchman watch-del-all || true && rm -rf node_modules package-lock.json && npm i"
  }
}
```
🧩 Troubleshooting (casos reales de este repo)
 ```bash
configs.toReversed is not a function al iniciar Metro
Estás usando Node 18. Cambia a Node 20+:

nvm install 20.18.1 && nvm use 20.18.1
rm -rf node_modules package-lock.json && npm i
npm start -- --reset-cache
```
Se abre la app básica / bundle incorrecto
Mata packagers y usa el del proyecto correcto:

 ```bash
lsof -i :8081 -sTCP:LISTEN -nP | awk 'NR>1{print $2}' | xargs kill -9 2>/dev/null
lsof -i :8082 -sTCP:LISTEN -nP | awk 'NR>1{print $2}' | xargs kill -9 2>/dev/null
npm start -- --reset-cache
```
En el simulador iOS: Dev Menu (⌘D) → Reload.
Si pregunta por usar otro puerto, elige No (mantener 8081).
 ```bash
Cannot find module 'metro-react-native-babel-preset'
```
Instala el preset:
 ```bash
npm i -D metro-react-native-babel-preset @babel/core
```
En babel.config.js:
 ```bash
module.exports = { presets: ['module:metro-react-native-babel-preset'] };
```
iOS: Unable to open base configuration reference file ... Pods-*.xcconfig / error 65
```
Falta instalar pods:
 ```bash
cd ios && pod install && cd ..
npx react-native run-ios --workspace ios/WalletPayApp.xcworkspace --scheme WalletPayApp
p/Images.xcassets/AppIcon.appiconset.
```
📝 Notas
Este proyecto usa React 19 + React Native 0.82.x.

Si usas TypeScript: añade @types/react@^19 si el editor se queja de tipos.

Para limpiar por completo:

watchman watch-del-all || true
rm -rf node_modules package-lock.json
cd android && ./gradlew clean && cd ..
npm i
npm start -- --reset-cache
