# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor Native Bridge Proguard Rules
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep public class * extends com.getcapacitor.Plugin
-keep public class * extends com.getcapacitor.BridgeActivity
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-dontwarn com.getcapacitor.**
-dontwarn com.google.android.gms.**
